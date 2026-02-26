import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [identifier, setIdentifier] = useState("");
    const [touched, setTouched] = useState(false);

    const error = useMemo(() => {
        if (!touched) return "";
        if (!identifier.trim()) return "Username or Email is Required!";
        return "";
    }, [identifier, touched]);

    const canSubmit = useMemo(() => identifier.trim().length > 0, [identifier]);

    const onSubmit = async () => {
        setTouched(true);
        if (!identifier.trim()) return;

        // FE-only: simulate sending
        await new Promise((r) => setTimeout(r, 500));

        Alert.alert(
            "Success!",
            "Reset Password Link have Sent to your Email Account",
        [{ text: "OK", onPress: () => router.replace("../authentication/Login") }]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-[#0B0B0D]">
        
            {/* background soft */}
            <LinearGradient
                colors={["rgba(227,27,35,0.14)", "rgba(227,27,35,0.03)", "rgba(0,0,0,0)"]}
                locations={[0, 0.55, 1]}
                style={{ position: "absolute", top: 0, left: 0, right: 0, height: 360 }}
            />

            <View className="flex-1">
                {/* Back link (posisi sama kaya "Forgot" di login, tapi kebalik) */}
                    <Pressable
                        onPress={() => router.replace("../authentication/Login")}
                        className="absolute top-6 left-6 z-10"
                        hitSlop={10}
                    >
                        <Text className="text-[#808080] text-base font-semibold">← Back to Sign In</Text>
                    </Pressable>

                {/* Header (mirip Login) */}
                <View className="px-6 pt-16">
                    <Text className="mt-1 text-[46px] font-semibold text-[#E31B23] tracking-[-0.5px]">
                        Forgot
                    </Text>
                    <Text className="-mt-1 text-[46px] font-semibold text-[#E31B23] tracking-[-0.5px]">
                        Password
                    </Text>
                </View>

                {/* Form area (center like Login) */}
                <View className="flex-1 px-6 justify-center">
                    {/* Logo block (optional, biar sama) */}
                    <View className="items-center mb-6">
                        <Text className="text-sm text-zinc-500 dark:text-zinc-400 text-center px-2">
                            Enter your username or email address. We will send you a link to reset your password.
                        </Text>
                    </View>

                    {/* Identifier */}
                    <View className="h-14 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-[#141418]/90 flex-row items-center px-4 shadow-sm">
                        <View className="w-8 items-center justify-center mr-2">
                            <Feather name="user" size={18} color="#444" />
                        </View>

                        <TextInput
                            value={identifier}
                            onChangeText={(v) => setIdentifier(v)}
                            onBlur={() => setTouched(true)}
                            placeholder="Username atau Email"
                            placeholderTextColor="#9AA0A6"
                            keyboardType="default"
                            autoCapitalize="none"
                            autoCorrect={false}
                            className="flex-1 text-base text-zinc-900 dark:text-zinc-100"
                            returnKeyType="done"
                        />
                    </View>

                    {!!error && (
                        <Text className="mt-2 text-sm text-red-500 text-center">
                        {error}
                        </Text>
                    )}

                    {/* Button */}
                    <Pressable
                        onPress={onSubmit}
                        disabled={!canSubmit}
                        className={`mt-5 h-14 rounded-full items-center justify-center shadow-md ${
                        canSubmit ? "bg-[#E31B23]" : "bg-[#E31B23]/40"
                        }`}
                    >
                        <Text className="text-white text-base font-extrabold">
                            Send the Reset Link
                        </Text>
                    </Pressable>
                </View>

                {/* Footer (sama kayak login) */}
                <View className="pb-7 pt-3 items-center">
                    <Text className="text-xs text-zinc-400">
                        © {new Date().getFullYear()} Indotraktor Command Data Center
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}