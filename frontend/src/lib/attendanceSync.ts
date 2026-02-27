import * as Network from "expo-network";
import * as SecureStore from "expo-secure-store";
import * as FileSystem from "expo-file-system";
import { 
    attachPhotoUrl, 
    deleteQueueRow,
    getPending, 
    getOldTerminalRowsForCleanup,
    markSynced, 
    setStatus 
} from "./attendanceQueueRepo";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;
const ACCESS_TOKEN_KEY = "auth_access_token";
const LEGACY_ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "auth_refresh_token";
const DEVICE_ID_KEY = "mobile_device_id";

function mustApiBase() {
    if (!API_BASE) throw new Error("EXPO_PUBLIC_API_URL is not set");
    return API_BASE.trim();
}

function trimTrailingSlash(url: string) {
    return url.replace(/\/+$/, "");
}

function buildAuthBaseUrl(apiBase: string) {
    const base = trimTrailingSlash(apiBase);

    if (base.endsWith("/api/auth")) return base;
    return `${base}/api/auth`;
}

function buildClockUrl(apiBase: string) {
    const base = trimTrailingSlash(apiBase);

    if (base.endsWith("/api/auth")) {
        return `${base.slice(0, -"/api/auth".length)}/api/dtc/attendance/clock`;
    }

    return `${base}/api/dtc/attendance/clock`;
}

async function getStoredAccessToken() {
    const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    if (token) return token;

    return SecureStore.getItemAsync(LEGACY_ACCESS_TOKEN_KEY);
}

async function saveAccessToken(token: string) {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
    // Keep legacy key for backward compatibility with older code paths.
    await SecureStore.setItemAsync(LEGACY_ACCESS_TOKEN_KEY, token);
}

async function refreshAccessToken(apiBase: string): Promise<string | null> {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    if (!refreshToken) return null;

    const deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    const refreshUrl = `${buildAuthBaseUrl(apiBase)}/mobile/refresh`;

    const body = {
        refreshToken,
        deviceId: deviceId ?? undefined,
    };

    const res = await fetch(refreshUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.log("SYNC REFRESH FAIL", res.status, text);
        return null;
    }

    const json = await res.json().catch(() => null);
    const newAccessToken = json?.tokens?.accessToken as string | undefined;
    const newRefreshToken = json?.tokens?.refreshToken as string | undefined;

    if (!newAccessToken) return null;

    await saveAccessToken(newAccessToken);

    if (newRefreshToken) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, newRefreshToken);
    }

    return newAccessToken;
}

async function deleteLocalPhotoIfExists(uri?: string | null) {
    if (!uri) return;

    // Only handle local file URIs safely.
    if (!uri.startsWith("file://")) return;

    try {
        await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch (e: any) {
        console.log("SYNC PHOTO DELETE ERROR", e?.message ?? e);
    }
}

async function cleanupOldTerminalQueueRows() {
    const rows = getOldTerminalRowsForCleanup({ days: 7, limit: 100 });

    for (const row of rows) {
        await deleteLocalPhotoIfExists(row.photo_local_uri);
        deleteQueueRow(row.client_event_id);
    }

    if (rows.length > 0) {
        console.log("SYNC CLEANUP ROWS", rows.length);
    }
}

export type SyncResult = {
    attempted: number;
    synced: number;
    failed: number;
    lastError?: string | null;
};

export async function syncAttendanceQueue(): Promise<SyncResult> {
    const net = await Network.getNetworkStateAsync();
    
    if (!net.isConnected || net.isInternetReachable === false) {
        return { attempted: 0, synced: 0, failed: 0, lastError: "offline" };
    }

    const api = mustApiBase();
    const clockUrl = buildClockUrl(api);
    const items = getPending(10);
    const deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);

    let token = await getStoredAccessToken();
    if (!token) {
        token = await refreshAccessToken(api);
    }
    
    if (!token) {
        return { attempted: items.length, synced: 0, failed: items.length, lastError: "no access token" };
    }

    let synced = 0;
    let failed = 0;

    for (const it of items) {
        try {
            setStatus(it.client_event_id, "SYNCING");

            const photoUrl = it.photo_url ?? "https://example.com/dummy.jpg";
            if (!it.photo_url) attachPhotoUrl(it.client_event_id, photoUrl);

            const payload = {
                clientEventId: it.client_event_id,
                mode: it.mode,
                clientTime: it.client_time,
                deviceTz: it.device_tz,
                tzOffsetMinutes: it.tz_offset_minutes,
                latitude: it.latitude,
                longitude: it.longitude,
                notes: it.notes,
                photoUrl,
                deviceId: deviceId ?? null,
            };

            console.log("SYNC POST", clockUrl, payload);

            let res = await fetch(clockUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (res.status === 401) {
                const refreshed = await refreshAccessToken(api);
                if (refreshed) {
                    token = refreshed;
                    res = await fetch(clockUrl, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(payload),
                    });
                }
            }

            const text = await res.text().catch(() => "");
            console.log("SYNC RESP", res.status, text);

            if (res.status >= 200 && res.status < 300) {
                markSynced(it.client_event_id);
                await deleteLocalPhotoIfExists(it.photo_local_uri);
                synced++;
                continue;
            }

            if (res.status === 409) {
                // Terminal state: duplicate daily clock event should not be retried forever.
                setStatus(it.client_event_id, "SKIPPED", `409 ${text}`);
                await deleteLocalPhotoIfExists(it.photo_local_uri);
                synced++;
                continue;
            }

            setStatus(it.client_event_id, "FAILED", `${res.status} ${text}`);
            failed++;
        
        } catch (e: any) {
            const msg = e?.message ?? "sync error";
            console.log("SYNC ERROR", msg);
            setStatus(it.client_event_id, "FAILED", msg);
            failed++;
        }
    }

    await cleanupOldTerminalQueueRows();
    return { attempted: items.length, synced, failed, lastError: failed ? "some failed" : null };
}
