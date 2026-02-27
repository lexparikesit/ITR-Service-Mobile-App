import React from "react";
import { Pressable, Text, View } from "react-native";

type Coordinates = {
    latitude: number;
    longitude: number;
};

export default function ClockLocationMap({ coords }: { coords: Coordinates }) {
    const mapsUrl = `https://maps.google.com/?q=${coords.latitude},${coords.longitude}`;

    return (
        <View className="flex-1 items-center justify-center px-6">
            <Text className="text-zinc-800 text-base font-semibold text-center">
                Peta interaktif tidak tersedia di web.
            </Text>
            <Text className="mt-2 text-zinc-500 text-center">
                Latitude: {coords.latitude.toFixed(6)} | Longitude: {coords.longitude.toFixed(6)}
            </Text>
            <Pressable
                accessibilityRole="link"
                onPress={() => {
                    if (typeof window !== "undefined") {
                        window.open(mapsUrl, "_blank", "noopener,noreferrer");
                    }
                }}
                className="mt-4 h-11 px-5 rounded-full bg-[#2563EB] items-center justify-center"
            >
                <Text className="text-white font-semibold">Open in Google Maps</Text>
            </Pressable>
        </View>
    );
}
