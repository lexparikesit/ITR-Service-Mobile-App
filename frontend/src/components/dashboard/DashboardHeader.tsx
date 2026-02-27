import React from "react";
import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function DashboardHeader() {
    const router = useRouter();

    return (
        <View className="bg-[#E31B23] px-4 pt-3 pb-4">
            <View className="flex-row items-center justify-between">
                <Pressable onPress={() => router.back()}>
                    <Feather name="chevron-left" size={26} color="#fff" />
                </Pressable>

                <View className="items-center">
                    <Text className="text-white text-xl font-bold">Dashboard</Text>
                    <Text className="text-white/90 text-sm">KPI Snapshot</Text>
                </View>

                <Pressable>
                    <Feather name="refresh-cw" size={20} color="#fff" />
                </Pressable>
            </View>
        </View>
    );
}