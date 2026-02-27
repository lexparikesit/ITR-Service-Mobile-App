import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DashboardHeader from "../../app/dashboard/DashboardPage";

export default function DashboardDetail() {
    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-[#0B0B0D]">
            <DashboardHeader />
                <View className="flex-1 items-center justify-center">
                    <Text className="text-zinc-900 dark:text-zinc-100 text-lg font-semibold">
                        Dashboard Detail Page
                    </Text>
                </View>
        </SafeAreaView>
    );
}