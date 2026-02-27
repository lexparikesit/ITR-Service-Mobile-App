import React from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import MetricCard, { type MetricCardProps } from "../../components/dashboard/MetricCard";
import StatusBreakdown from "../../components/dashboard/StatusBreakdown";
import DashboardHeader from "../../components/dashboard/DashboardHeader";

export default function DashboardScreen() {
    const insets = useSafeAreaInsets();

    const metrics: MetricCardProps[] = [
        { title: "Clock-In Today", value: "0", unit: "events", icon: "log-in" },
        { title: "Clock-Out Today", value: "0", unit: "events", icon: "log-out" },
        { title: "Pending Sync", value: "0", unit: "items", icon: "cloud-off" },
        { title: "On-Time Rate", value: "0", unit: "%", icon: "check-circle" },
        { title: "Late Clock-In", value: "0", unit: "cases", icon: "alert-triangle" },
        { title: "Avg Working Hours", value: "0", unit: "h", icon: "clock" },
    ];

    const breakdown = [
        { label: "Synced", value: 0 },
        { label: "Pending", value: 0 },
        { label: "Failed", value: 0 },
    ];

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-[#0B0B0D]">
            <DashboardHeader />

            <ScrollView
                contentContainerStyle={{
                    padding: 16,
                    paddingBottom: 24 + insets.bottom,
                }}
            >
                <View className="flex-row gap-3">
                    <MetricCard {...metrics[0]} />
                    <MetricCard {...metrics[1]} />
                </View>

                <View className="mt-3 flex-row gap-3">
                    <MetricCard {...metrics[2]} />
                    <MetricCard {...metrics[3]} />
                </View>

                <View className="mt-3 flex-row gap-3">
                    <MetricCard {...metrics[4]} />
                    <MetricCard {...metrics[5]} />
                </View>

                <View className="mt-4">
                    <StatusBreakdown data={breakdown} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
