import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    ReactNode,
} from "react";
import axios, { AxiosError, AxiosInstance } from "axios";
import * as SecureStore from "expo-secure-store";

// types
export interface User {
    nik: string;
    name: string;
    firstName: string | null;
    lastName: string | null;
    username: string;
    email: string | null;
    permissions: string[];
    roles: { id: string; roleName: string; description: string | null }[];
}

type LoginParams = {
    identifier: string; // username OR email
    password: string;
    deviceId?: string; // optional override (normally we use stored deviceId)
};

interface UserContextType {
    user: User | null;
    loading: boolean;

    login: (params: LoginParams) => Promise<boolean>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<boolean>;
}

// secure store keys
const KEY_ACCESS = "auth_access_token";
const KEY_REFRESH = "auth_refresh_token";
const KEY_DEVICE_ID = "mobile_device_id";

// token & device storage helpers
async function setTokens(tokens: { accessToken: string; refreshToken: string }) {
    await SecureStore.setItemAsync(KEY_ACCESS, tokens.accessToken);
    await SecureStore.setItemAsync(KEY_REFRESH, tokens.refreshToken);
}

async function getAccessToken() {
    return SecureStore.getItemAsync(KEY_ACCESS);
}

async function getRefreshToken() {
    return SecureStore.getItemAsync(KEY_REFRESH);
}

async function clearTokens() {
    await SecureStore.deleteItemAsync(KEY_ACCESS);
    await SecureStore.deleteItemAsync(KEY_REFRESH);
}

async function setDeviceId(id: string) {
    await SecureStore.setItemAsync(KEY_DEVICE_ID, id);
}

async function getDeviceId() {
    return SecureStore.getItemAsync(KEY_DEVICE_ID);
}

// axios client factory
function createApi(): AxiosInstance {
    const baseURL = process.env.EXPO_PUBLIC_API_URL;
    if (!baseURL) throw new Error("Missing EXPO_PUBLIC_API_URL");

    return axios.create({
        baseURL,
        timeout: 30_000,
    });
}

// single-flight refresh
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(api: AxiosInstance, deviceId?: string) {
    if (!refreshPromise) {
        refreshPromise = (async () => {
            const refreshToken = await getRefreshToken();
            if (!refreshToken) throw new Error("No refresh token");

            // deviceId is REQUIRED if you enforce device binding
            if (!deviceId) throw new Error("No deviceId for device-bound refresh");

            const res = await api.post("/mobile/refresh", {
                refreshToken,
                deviceId,
            });

            const accessToken = res.data?.tokens?.accessToken as string | undefined;
            const newRefreshToken = res.data?.tokens?.refreshToken as string | undefined;

            if (!accessToken || !newRefreshToken) {
                throw new Error("Refresh response missing tokens");
            }

            await setTokens({ accessToken, refreshToken: newRefreshToken });
            return accessToken;

        })().finally(() => {
            refreshPromise = null;
        });
    }
    return refreshPromise;
}

// context
const UserContext = createContext<UserContextType | undefined>(undefined);

export function MobileUserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // keep deviceId in memory (loaded from SecureStore on startup)
    const deviceIdRef = useRef<string | undefined>(undefined);

    const api = useMemo(() => createApi(), []);

    // Attach interceptors once
    useEffect(() => {
        const reqInterceptor = api.interceptors.request.use(async (config) => {
            const access = await getAccessToken();
            
            if (access) {
                config.headers = config.headers ?? {};
                config.headers.Authorization = `Bearer ${access}`;
            }
            return config;
        });

        const resInterceptor = api.interceptors.response.use(
            (res) => res,
            async (error: AxiosError) => {
                const status = error.response?.status;
                const originalRequest: any = error.config;

                const url = String(originalRequest?.url || "");
                const isAuthRoute =
                    url.includes("/mobile/login") ||
                    url.includes("/mobile/refresh") ||
                    url.includes("/mobile/logout") ||
                    url.includes("/forgot-password") ||
                    url.includes("/reset-password");

                if (status === 401 && originalRequest && !originalRequest._retry && !isAuthRoute) {
                    originalRequest._retry = true;

                    try {
                        await refreshAccessToken(api, deviceIdRef.current);
                        return api(originalRequest);
                    
                    } catch (e) {
                        await clearTokens();
                        setUser(null);
                        return Promise.reject(e);
                    }
                }

                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.request.eject(reqInterceptor);
            api.interceptors.response.eject(resInterceptor);
        };
    }, [api]);

    const loadUser = useCallback(async (): Promise<boolean> => {
        try {
            const res = await api.get("/mobile/me");
            const data = res.data;

            if (data?.authenticated && data?.user) {
                const normalized: User = {
                    ...data.user,
                    permissions: data.user.permissions ?? [],
                    roles: data.user.roles ?? [],
                };
                setUser(normalized);
                return true;
            }

            setUser(null);
            return false;

        } catch {
            setUser(null);
            return false;
        
        } finally {
            setLoading(false);
        }
    }, [api]);

    // Startup: load deviceId from SecureStore, then try to load user
    useEffect(() => {
        (async () => {
            try {
                deviceIdRef.current = (await getDeviceId()) ?? undefined;
            } finally {
                await loadUser();
            }
            })();
        }, [loadUser]);

    const refreshUser = useCallback(async (): Promise<boolean> => {
        setLoading(true);
        return loadUser();
    }, [loadUser]);

    const login = useCallback(
        async (params: LoginParams): Promise<boolean> => {
            const identifier = params.identifier?.trim() ?? "";
            const password = params.password ?? "";

            // device binding: deviceId MUST exist
            const deviceId = (params.deviceId?.trim() || deviceIdRef.current || "").trim();

            if (!identifier || !password) return false;
            if (!deviceId) return false;

            try {
                setLoading(true);

                const res = await api.post("/mobile/login", {
                    username: identifier, // backend expects "username" field for identifier
                    password,
                    deviceId, // ✅ send deviceId always
                });

                const accessToken = res.data?.tokens?.accessToken as string | undefined;
                const refreshToken = res.data?.tokens?.refreshToken as string | undefined;

                if (!accessToken || !refreshToken) return false;

                await setTokens({ accessToken, refreshToken });

                // Persist deviceId + cache in memory
                deviceIdRef.current = deviceId;
                await setDeviceId(deviceId);

                return await loadUser();

            } catch {
                return false;

            } finally {
                setLoading(false);
            }
        },
        [api, loadUser]
    );

    const logout = useCallback(async () => {
        try {
            const refreshToken = await getRefreshToken();
            
            if (refreshToken) {
                await api.post("/mobile/logout", { refreshToken });
            }
        
        } catch {
            // ignore
        
        } finally {
            await clearTokens();
            // keep deviceId (so next login stays same device), OR clear it if you want fresh binding:
            // await SecureStore.deleteItemAsync(KEY_DEVICE_ID);

        setUser(null);
        setLoading(false);
        }
    }, [api]);

    const value = useMemo<UserContextType>(
        () => ({ user, loading, login, logout, refreshUser }),
        [user, loading, login, logout, refreshUser]
    );

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useMobileUser() {
    const ctx = useContext(UserContext);
    
    if (!ctx) throw new Error("useMobileUser must be used within MobileUserProvider");
    return ctx;
}
