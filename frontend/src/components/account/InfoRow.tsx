import React from "react";
import { View, Text } from "react-native";

export default function InfoRow({
    label,
    value,
}: {
    label: string;
    value?: string | null;
}) {
    return (
        <View className="py-3">
            <Text className="text-xs text-zinc-500 dark:text-zinc-400">
                {label}
            </Text>
            <Text className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {value || "-"}
            </Text>
        </View>
    );
}