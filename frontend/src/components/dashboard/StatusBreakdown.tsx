import React from "react";
import { View, Text } from "react-native";

type Item = {
    label: string;
    value: number;
};

export default function StatusBreakdown({
    data,
} : {
    data: Item[];
}) {
    const total = data.reduce((a, b) => a + b.value, 0) || 1;

    return (
        <View className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/85 dark:bg-[#141418]/85 p-4">
            <Text className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Status Breakdown</Text>

            <View className="mt-3">
                {data.map((d) => {
                    const pct = Math.round((d.value / total) * 100);
                    
                    return (
                        <View key={d.label} className="mb-3">
                            <View className="flex-row items-center justify-between">
                                <Text className="text-xs text-zinc-600 dark:text-zinc-300">{d.label}</Text>
                                <Text className="text-xs text-zinc-500 dark:text-zinc-400">{pct}%</Text>
                            </View>

                            <View className="mt-1 h-2 w-full rounded-full bg-zinc-200/80 dark:bg-zinc-800">
                                <View
                                    className="h-2 rounded-full bg-[#E31B23]"
                                    style={{ width: `${pct}%` }}
                                />
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}