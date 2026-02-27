import React, { useMemo, useState } from "react";
import {
    View,
    Text,
    TextInput,
    Image,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    useColorScheme,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useMobileUser } from "../context/MobileUserContext";
import { getOrCreateDeviceId } from "../../lib/deviceId";

export default function LoginScreen() {
    const router = useRouter();
    const { login, loading } = useMobileUser();

    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);

    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    const canSubmit = useMemo(() => {
        return identifier.trim().length > 0 && password.length > 0;
    }, [identifier, password]);

    const onLogin = async () => {
        if (!canSubmit || loading) return;

        try {
            const deviceId = await getOrCreateDeviceId();

            const ok = await login({
                identifier: identifier.trim(),
                password,
                deviceId, // device binding
            });

            if (!ok) {
                Alert.alert("Login Failed!", "Username/Email or Password is incorrect.");
                return;
            }

            router.replace("/home/home");
        
        } catch (e: any) {
            Alert.alert("Error", e?.message ?? "Network error");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-[#0B0B0D]">
        
            {/* background soft */}
            <LinearGradient
                colors={
                    isDark
                        ? ["#111319", "#181B22", "#121318"]
                        : ["#FCE8EC", "#F8F2F4", "#FFFFFF"]
                }
                locations={[0, 0.45, 1]}
                style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            />
            <View
                pointerEvents="none"
                style={{
                    position: "absolute",
                    width: 290,
                    height: 290,
                    borderRadius: 999,
                    top: -120,
                    right: -80,
                    backgroundColor: "rgba(227,27,35,0.20)",
                }}
            />
            <View
                pointerEvents="none"
                style={{
                    position: "absolute",
                    width: 250,
                    height: 250,
                    borderRadius: 999,
                    top: 90,
                    left: -120,
                    backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.70)",
                }}
            />
            <View
                pointerEvents="none"
                style={{
                    position: "absolute",
                    width: 360,
                    height: 360,
                    borderRadius: 999,
                    bottom: -230,
                    right: -170,
                    backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(227,27,35,0.08)",
                }}
            />

            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View className="px-8 pt-40 items-center">
                        <Image
                            source={
                                isDark
                                ? require("../../../assets/images/itr pass logo-01-DM.png")
                                : require("../../../assets/images/itr pass logo-02-LM.png")
                            }
                            style={{ width: 220, height: 70 }}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Form */}
                    <View className="flex-1 px-6 pb-8 justify-center">
                        {/* Intro text */}
                        <View className="items-center mb-8 px-3">
                            <Text
                                className="text-[19px] font-bold tracking-tight text-center"
                                style={{ color: isDark ? "#F4F4F5" : "#1F2937" }}
                            >
                                Welcome Back
                            </Text>
                            <Text
                                className="mt-2 text-[12px] leading-5 text-center"
                                style={{ color: isDark ? "#D4D4D8" : "#4B5563" }}
                            >
                                This app helps the service division monitor jobs and capture mechanic work progress.
                            </Text>
                        </View>

                        {/* Email */}
                        <View className="h-14 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-[#141418]/90 flex-row items-center px-4 shadow-sm">
                            <View className="w-8 items-center justify-center mr-2">
                                <Feather name="user" size={18} color="#444" />
                            </View>

                            <TextInput
                                value={identifier}
                                onChangeText={setIdentifier}
                                placeholder="Email or Username"
                                placeholderTextColor="#9AA0A6"
                                keyboardType="default"
                                autoCapitalize="none"
                                autoCorrect={false}
                                className="flex-1 text-base text-zinc-900 dark:text-zinc-100"
                                returnKeyType="next"
                            />
                        </View>

                        {/* Password */}
                        <View className="mt-4 h-14 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-[#141418]/90 flex-row items-center px-4 shadow-sm">
                            <View className="w-8 items-center justify-center mr-2">
                                <Feather name="lock" size={18} color="#444" />
                            </View>

                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Password"
                                placeholderTextColor="#9AA0A6"
                                secureTextEntry={!showPass}
                                autoCapitalize="none"
                                autoCorrect={false}
                                className="flex-1 text-base text-zinc-900 dark:text-zinc-100"
                                returnKeyType="done"
                            />

                            <Pressable onPress={() => setShowPass((v) => !v)} hitSlop={10}>
                                <Feather name={showPass ? "eye" : "eye-off"} size={18} color="#666" />
                            </Pressable>
                        </View>

                        {/* 4) Forgot Password setelah password */}
                        <Pressable
                            onPress={() => router.push("/authentication/ForgetPassword")}
                            className="mt-3 self-end"
                        >
                            <Text className="text-sm text-zinc-400">Forgot your password?</Text>
                        </Pressable>

                        {/* Button */}
                        <Pressable
                            onPress={onLogin}
                            disabled={!canSubmit || loading}
                            className={`mt-5 h-14 rounded-full items-center justify-center shadow-md ${
                                canSubmit && !loading ? "bg-[#E31B23]" : "bg-[#E31B23]/40"
                            }`}
                        >
                            <Text className="text-white text-lg font-extrabold">
                                {loading ? "Loading..." : "Login"}</Text>
                        </Pressable>
                    </View>

                    {/* 3) bawah biar nggak polos */}
                    <View className="pb-7 pt-3 items-center">
                        <Text className="text-xs text-zinc-400">(c) {new Date().getFullYear()} Indotraktor Command Data Center</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};
