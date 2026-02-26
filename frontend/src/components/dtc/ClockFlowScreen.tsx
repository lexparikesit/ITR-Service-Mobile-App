import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    View,
    Text,
    Pressable,
    Alert,
    Image,
    TextInput,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker } from "react-native-maps";
import { Feather } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import * as Location from "expo-location";

type Mode = "in" | "out";

function formatToday(now = new Date()) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];
    const d = days[now.getDay()];
    const dd = String(now.getDate()).padStart(2, "0");
    const m = months[now.getMonth()];
    const yyyy = now.getFullYear();
    return `${d}, ${dd} ${m} ${yyyy}`;
}

export default function ClockFlowScreen({ mode }: { mode: Mode }) {
    const router = useRouter();

    const title = mode === "in" ? "Clock In": "Clok Out";
    const stepLabel = (step: number) => `Step ${step} of 2`;

    // step
    const [step, setStep] = useState<1 | 2>(1);

    // location step
    const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [loadingLoc, setLoadingLoc] = useState(false);

    const region = useMemo(() => {
        if (!coords) return null;
        return {
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        };
    }, [coords]);

    const requestAndFetchLocation = useCallback(async () => {
        setLoadingLoc(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== "granted") {
                Alert.alert("Permission required", "Please allow location access to continue.");
                setCoords(null);
                return;
            }

            const pos = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            setCoords({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
            });
        
        } catch (e: any) {
            Alert.alert("Location error", e?.message ?? "Failed to get location");
        
        } finally {
            setLoadingLoc(false);
        }
    }, []);

    useEffect(() => {
        // auto fetch on first open
        requestAndFetchLocation();
    }, [requestAndFetchLocation]);

    const cameraRef = useRef<CameraView>(null);
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [taking, setTaking] = useState(false);
    const [notes, setNotes] = useState("");

    const ensureCamera = useCallback(async () => {
        const granted = cameraPermission?.granted;
        if (granted) return true;

        const res = await requestCameraPermission();
        if (!res.granted) {
            Alert.alert("Permission required", "Please allow camera access to continue.");
            return false;
        }
        return true;
    }, [cameraPermission?.granted, requestCameraPermission]);

    const onTakePhoto = useCallback(async () => {
        const ok = await ensureCamera();
        if (!ok) return;

        try {
            setTaking(true);

            // CameraView uses takePictureAsync via ref like below (supported in expo-camera)
            // @ts-ignore
            const pic = await cameraRef.current?.takePictureAsync({
                quality: 0.6,
                base64: false,
                exif: false,
                skipProcessing: true,
            });

            if (pic?.uri) setPhotoUri(pic.uri);
        
        } catch (e: any) {
            Alert.alert("Camera error", e?.message ?? "Failed to take photo");
        
        } finally {
            setTaking(false);
        }
    }, [ensureCamera]);

    // validate per-step
    const canGoNext = step === 1 ? !!coords : !!photoUri;

    const onNext = useCallback(async () => {
        if (step === 1) {
            if (!coords) {
                Alert.alert("Location required", "Please enable location and refresh.");
                return;
            }
            // move to step 2
            setStep(2);

            // request camera early so user doesn't wait later
            await ensureCamera();
            return;
        }

        // step 2 submit
        if (!coords) {
            Alert.alert("Missing data", "Location is missing. Please go back and refresh.");
            return;
        }

        if (!photoUri) {
            Alert.alert("Photo required", "Please take a selfie to continue.");
            return;
        }

        // FRONTEND ONLY payload
        const payload = {
            mode,
            date: new Date().toISOString(),
            location: coords,
            photoUri,
            notes: notes.trim() || null,
        };

        console.log("DTC SUBMIT:", payload);

        Alert.alert(
            "Submitted (frontend only)",
            `Mode: ${mode}\nLat: ${coords.latitude}\nLng: ${coords.longitude}\nNotes: ${notes.trim() || "-"}`,
        [
            {
                text: "OK",
                onPress: () => {
                    // reset and back to home
                    setStep(1);
                    setPhotoUri(null);
                    setNotes("");
                    router.back();
                },
            },
        ]
        );
    }, [step, coords, photoUri, notes, mode, ensureCamera, router]);

    const onBack = useCallback(() => {
        if (step === 1) {
            router.back();
            return;
        }
        setStep(1);
    }, [router, step]);

    // UI
    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-[#0B0B0D]">
            {/* Header */}
            <View className="bg-[#E31B23] px-4 pt-3 pb-4">
                <View className="flex-row items-center justify-between">
                    <Pressable onPress={onBack} hitSlop={10}>
                        <Feather name="chevron-left" size={26} color="#fff" />
                    </Pressable>

                    <View className="items-center">
                        <Text className="text-white text-xl font-bold">{title}</Text>
                        <Text className="text-white/90 text-sm">{stepLabel(step)}</Text>
                    </View>

                    <Pressable
                        onPress={() => {
                        if (step === 1) requestAndFetchLocation();
                        if (step === 2) setPhotoUri(null);
                        }}
                        hitSlop={10}
                    >
                        <Feather name="refresh-cw" size={20} color="#fff" />
                    </Pressable>
                </View>

                {/* mini schedule card (placeholder) */}
                <View className="mt-4 rounded-2xl bg-white/95 px-4 py-3">
                    <View className="mt-1 flex-row items-center">
                        <Feather name="calendar" size={16} color="#6B7280" />
                        <Text className="ml-2 text-zinc-700">{formatToday(new Date())} (08:00 - 17:00)</Text>
                    </View>
                </View>
            </View>

            {/* Body */}
            {step === 1 ? (
                <View className="flex-1">
                    {/* Location Map */}
                    <View className="flex-1">
                        {!coords || !region ? (
                            <View className="flex-1 items-center justify-center">
                                {loadingLoc ? (
                                <>
                                    <ActivityIndicator />
                                    <Text className="mt-3 text-zinc-500 dark:text-zinc-400">Getting GPS location...</Text>
                                </>
                                ) : (
                                <>
                                    <Text className="text-zinc-700 dark:text-zinc-200 font-semibold">Location not available</Text>
                                    <Text className="mt-2 text-zinc-500 dark:text-zinc-400 text-center px-8">Please allow location permission and tap refresh.</Text>
                                    <Pressable
                                        onPress={requestAndFetchLocation}
                                        className="mt-4 h-11 px-5 rounded-full bg-[#E31B23] items-center justify-center"
                                    >
                                        <Text className="text-white font-semibold">Enable Location</Text>
                                    </Pressable>
                                </>
                                )}
                            </View>
                        ) : (
                            <MapView style={{ flex: 1 }} initialRegion={region} region={region}>
                                <Marker coordinate={coords} />
                            </MapView>
                        )}
                    </View>

                    {/* Footer button */}
                    <View className="p-4">
                        <Pressable
                            onPress={onNext}
                            disabled={!canGoNext}
                            className={`h-12 rounded-xl items-center justify-center ${
                                canGoNext ? "bg-[#2563EB]" : "bg-[#2563EB]/40"
                            }`}
                        >
                            <Text className="text-white font-bold">Next</Text>
                        </Pressable>
                    </View>
                </View>
            ) : (
                <View className="flex-1">
                    {/* Camera / Preview */}
                    <View className="flex-1">
                        {photoUri ? (
                            <View className="flex-1">
                                <Image source={{ uri: photoUri }} style={{ flex: 1 }} resizeMode="cover" />
                            </View>
                        ) : (
                            <View className="flex-1">
                                <CameraView
                                    ref={cameraRef}
                                    facing="front"
                                    style={{ flex: 1 }}
                                />
                                {!cameraPermission?.granted ? (
                                    <View className="absolute left-0 right-0 bottom-6 items-center">
                                        <Text className="text-white font-semibold">Camera permission required</Text>
                                            <Pressable
                                                onPress={requestCameraPermission}
                                                className="mt-3 h-11 px-5 rounded-full bg-white items-center justify-center"
                                            >
                                        <Text className="font-semibold text-[#E31B23]">Allow Camera</Text>
                                        </Pressable>
                                    </View>
                                ) : null}
                            </View>
                        )}

                        {/* dashed guide overlay (simple) */}
                        {!photoUri ? (
                            <View
                                pointerEvents="none"
                                style={{
                                    position: "absolute",
                                    left: 0,
                                    right: 0,
                                    top: 40,
                                    bottom: 120,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                            <View
                                style={{
                                    width: 240,
                                    height: 320,
                                    borderRadius: 140,
                                    borderWidth: 2,
                                    borderStyle: "dashed",
                                    borderColor: "rgba(255,255,255,0.85)",
                                }}
                            />
                        </View>
                        ) : null}
                    </View>

                    {/* Notes + actions */}
                    <View className="p-4">
                        <View className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141418] px-4 py-3">
                            <View className="flex-row items-center">
                                <Feather name="menu" size={18} color="#9AA0A6" />
                                <TextInput
                                    value={notes}
                                    onChangeText={setNotes}
                                    placeholder="Notes (optional)"
                                    placeholderTextColor="#9AA0A6"
                                    className="ml-3 flex-1 text-zinc-900 dark:text-zinc-100"
                                />
                            </View>
                        </View>

                        <View className="mt-4 flex-row gap-3">
                            <Pressable
                                onPress={onTakePhoto}
                                disabled={taking || !cameraPermission?.granted}
                                className={`flex-1 h-12 rounded-xl items-center justify-center ${
                                taking || !cameraPermission?.granted ? "bg-zinc-400" : "bg-zinc-900"
                                }`}
                            >
                                <Text className="text-white font-bold">{photoUri ? "Retake" : "Take Photo"}</Text>
                            </Pressable>

                            <Pressable
                                onPress={onNext}
                                disabled={!canGoNext}
                                className={`flex-1 h-12 rounded-xl items-center justify-center ${
                                canGoNext ? "bg-[#2563EB]" : "bg-[#2563EB]/40"
                                }`}
                            >
                                <Text className="text-white font-bold">Submit</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}