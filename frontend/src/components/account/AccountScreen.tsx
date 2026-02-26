import React from "react";
import {
    View,
    Text,
    Pressable,
    ScrollView,
    useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMobileUser } from "../context/MobileUserContext";
import InfoRow from "./InfoRow";

export default function AccountScreen() {
    const router = useRouter();
    const { user, logout } = useMobileUser();
    const scheme = useColorScheme();
    const isDark = scheme === "dark";

    const onLogout = async () => {
        await logout();
    };

    const iconColor = isDark ? "#E5E7EB" : "#111827";
    const subTextColor = isDark ? "#9CA3AF" : "#6B7280";

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-[#0B0B0D]">
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                <View className="px-6 pt-6">

                    {/* Back */}
                    <Pressable
                        onPress={() => router.back()}
                        className="flex-row items-center"
                    >
                        <Feather name="chevron-left" size={20} color={iconColor} />
                            <Text
                                style={{ color: subTextColor }}
                                className="ml-1 text-sm"
                            >
                                Back
                            </Text>
                    </Pressable>

                    <Text className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                        Personal Information
                    </Text>

                    {/* Avatar Section */}
                    <View className="mt-6 items-center">
                        <View
                            style={{
                                width: 84,
                                height: 84,
                                borderRadius: 42,
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: isDark ? "#1F2937" : "#F3F4F6",
                                borderWidth: 1,
                                borderColor: isDark ? "#374151" : "#E5E7EB",
                            }}
                        >
                            <Feather name="user" size={36} color={subTextColor} />
                        </View>

                        <Text className="mt-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                            {user?.firstName} {user?.lastName}
                        </Text>

                        <Text
                            style={{ color: subTextColor }}
                            className="text-sm"
                        >
                            {user?.email}
                        </Text>
                    </View>

                    {/* Card */}
                    <View className="mt-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-[#141418]/90 p-5 shadow-sm">
                        <InfoRow label="NIK" value={user?.nik} />
                        <InfoRow label="First Name" value={user?.firstName} />
                        <InfoRow label="Last Name" value={user?.lastName} />
                        <InfoRow label="Username" value={user?.username} />
                        <InfoRow label="Email" value={user?.email} />
                        <InfoRow label="User Roles" value={user?.roles?.map((r) => r.roleName).join(", ")}/>
                    </View>

                    {/* Logout */}
                    <Pressable
                        onPress={onLogout}
                        className="mt-8 h-12 rounded-full bg-[#E31B23] items-center justify-center"
                    >
                        <View className="flex-row items-center">
                            <Feather name="log-out" size={18} color="#fff" />
                            <Text className="ml-2 text-white font-semibold text-sm">
                                Logout
                            </Text>
                        </View>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}


