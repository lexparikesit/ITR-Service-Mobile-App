import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";

type Props = {
    title: string;
    value: string;
    unit?: string;
    delta?: string;
    icon: keyof typeof Feather.glyphMap;
};

export type MetricCardProps = Props;

export default function MetricCard({
    title,
    value,
    unit,
    delta,
    icon,
}: Props) {
    return (
        <View className="flex-1 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/85 dark:bg-[#141418]/85 p-4">
            <View className="flex-row items-center justify-between">
                <View className="h-10 w-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 items-center justify-center">
                    <Feather name={icon} size={18} color="#E31B23" />
                        {delta ? (
                            <Text className="text-xs text-zinc-500 dark:text-zinc-400">{delta}</Text>
                        ) : null}
                </View>

                <Text className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{title}</Text>

                <View className="mt-1 flex-row items-end">
                    <Text className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{value}</Text>
                    {unit && (
                        <Text className="ml-1 text-xs text-zinc-500 dark:text-zinc-400">
                            {unit}
                        </Text>
                    )}
                </View>
            </View>
        </View>
    );
}
