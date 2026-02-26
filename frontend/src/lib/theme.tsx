import { useColorScheme } from "react-native";

export type Theme = ReturnType<typeof useTheme>;

export function useTheme() {
    const scheme = useColorScheme();
    const isDark = scheme === "dark";

    return {
        isDark,
        brand: "#E31B23",

        bg: isDark ? "#0B0B0D" : "#FFFFFF",
        text: isDark ? "#F2F2F2" : "#111111",
        muted: isDark ? "#B7B7B7" : "#6B7280",
        placeholder: isDark ? "#8B8F97" : "#9AA0A6",

        cardBg: isDark ? "#141418" : "#FFFFFF",
        cardBorder: isDark ? "#24242A" : "#EFEFEF",

        icon: isDark ? "#D1D5DB" : "#444444",
        iconMuted: isDark ? "#A7ABB3" : "#666666",

        shadowOpacity: isDark ? 0.25 : 0.06,
    };
}