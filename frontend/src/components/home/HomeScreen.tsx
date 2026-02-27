import React, { useCallback, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
    View,
    Text,
    Pressable,
    ScrollView,
    Image,
    useColorScheme,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useMobileUser } from "../context/MobileUserContext"; 
import { useRouter } from "expo-router";
import { initAttendanceQueueDb } from "../../lib/attendanceQueueDb";
import { getTodayLatestSyncedClockIn } from "../../lib/attendanceQueueRepo";

function getGreeting(now = new Date()) {
    const h = now.getHours();

    if (h >= 5 && h < 12) return "Good Morning";
    if (h >= 12 && h < 17) return "Good Afternoon";
    if (h >= 17 && h < 21) return "Good Evening";
    return "Good Night";
}

function getDisplayName(user?: {
    firstName?: string | null;
    lastName?: string | null;
    name?: string;
    username?: string;
}) {
    if (!user) return "—";
    const full = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
    return full || user.name || user.username || "—";
}

function formatDtcTitle(now = new Date()) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];
    const d = days[now.getDay()];
    const dd = String(now.getDate()).padStart(2, "0");
    const m = months[now.getMonth()];
    const yyyy = now.getFullYear();
    return `Daily Time Card (DTC) for ${d}, ${dd} ${m} ${yyyy}`;
}

function formatClockTime(value: string) {
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return null;

    const hh = String(dt.getHours()).padStart(2, "0");
    const mm = String(dt.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
}

function DailyTimeCard({
    title,
    clockInTime,
    onClockIn,
    onClockOut,
    isDark,
}: {
    title: string;
    clockInTime: string | null;
    onClockIn: () => void;
    onClockOut: () => void;
    isDark: boolean;
}) {
    return (
        <View className="px-6 mt-5">
            <View className="rounded-3xl border border-[#E31B23]/35 bg-[#E31B23]/10 overflow-hidden shadow-sm">
                {/* header */}
                <View className="bg-[#E31B23] px-4 py-3">
                    <Text className="text-white font-semibold text-sm text-center">{title}</Text>
                </View>

                {/* body */}
                <LinearGradient
                    colors={
                        isDark
                            ? ["rgba(49, 18, 24, 0.55)", "rgba(27, 13, 17, 0.35)"]
                            : ["#F3E2E6", "#F7EAEC", "#FAEFF1"]
                    }
                    locations={[0, 0.55, 1]}
                    className="px-5 py-5"
                >
                    {/* placeholder shift */}
                    <Text className="mt-1 text-center text-base text-zinc-700 dark:text-zinc-300">
                        08:00 - 17:00
                    </Text>

                    {/* buttons */}
                    <View className="mt-5 rounded-2xl border border-zinc-300/80 dark:border-zinc-700/90 bg-white/95 dark:bg-[#121215]/95 overflow-hidden">
                        <View className="flex-row">
                            <Pressable
                                onPress={onClockIn}
                                className="flex-1 overflow-hidden"
                            >
                                <View className="flex-row items-center justify-center py-4">
                                    <Feather name="log-in" size={18} color="#2563EB" />
                                    <Text className="ml-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                        Clock In
                                    </Text>
                                </View>
                            </Pressable>

                        <View className="w-px bg-zinc-300/90 dark:bg-zinc-700/90" />

                            <Pressable
                                onPress={onClockOut}
                                className="flex-1 overflow-hidden"
                            >
                                <View className="flex-row items-center justify-center py-4">
                                    <Feather name="log-out" size={18} color="#E31B23" />
                                    <Text className="ml-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                        Clock Out
                                    </Text>
                                </View>
                            </Pressable>
                        </View>
                    </View>

                    {/* status placeholder */}
                    <Text className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
                        {clockInTime ? `Clock in at ${clockInTime}` : "You have not clocked in yet."}
                    </Text>
                </LinearGradient>
            </View>
        </View>
    )
}

function Tile({
    icon,
    title,
    subtitle,
    onPress,
}: {
    icon: keyof typeof Feather.glyphMap;
    title: string;
    subtitle: string;
    onPress: () => void;
}) {
    return (
        <Pressable
            onPress={onPress}
            className="flex-1 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/85 dark:bg-[#141418]/85 p-4 shadow-sm"
        >
            <View className="flex-row items-center justify-between">
                <View className="h-10 w-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 items-center justify-center">
                    <Feather name={icon} size={18} color="#E31B23" />
                </View>
                    <Feather name="chevron-right" size={18} color="#9AA0A6" />
            </View>

            <Text className="mt-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</Text>
            <Text className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</Text>
        </Pressable>
    );
}

function BottomNav({
    onMenu1,
    onMenu2,
    onHome,
    onNotif,
    onAccount,
    isDark,
    bottomInset,
}: {
    onMenu1: () => void;
    onMenu2: () => void;
    onHome: () => void;
    onNotif: () => void;
    onAccount: () => void;
    isDark: boolean;
    bottomInset: number;
}) {
    return (
        <View style={{ position: "absolute", left: 0, right: 0, bottom: bottomInset }}>
            {/* bar */}
            <View className="mx-4 mb-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-[#141418]/95 shadow-lg">
                <View className="flex-row items-center justify-between px-5 py-3">
                {/* Menu 1 (kiri) */}
                    <Pressable onPress={onMenu1} style={{ width: 56, alignItems: "center" }} hitSlop={10}>
                        <Feather name="clipboard" size={22} color={isDark ? "#E5E7EB" : "#111827"} />
                    </Pressable>

                    {/* Menu 2 (kiri) */}
                    <Pressable onPress={onMenu2} style={{ width: 56, alignItems: "center" }} hitSlop={10}>
                        <Feather name="bar-chart-2" size={22} color={isDark ? "#E5E7EB" : "#111827"} />
                    </Pressable>

                    {/* spacer untuk tombol home floating */}
                    <View style={{ width: 72 }} />

                    {/* Notif (kanan home) */}
                    <Pressable onPress={onNotif} style={{ width: 56, alignItems: "center" }} hitSlop={10}>
                        <Feather name="bell" size={22} color={isDark ? "#E5E7EB" : "#111827"} />
                    </Pressable>

                    {/* Profile (paling kanan) */}
                    <Pressable onPress={onAccount} style={{ width: 56, alignItems: "center" }} hitSlop={10}>
                        <View className="h-10 w-10 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 items-center justify-center">
                            <Feather name="user" size={20} color={isDark ? "#9CA3AF" : "#9AA0A6"} />
                        </View>
                    </Pressable>
                </View>
            </View>

            {/* Floating Home button */}
            <View style={{ position: "absolute", left: 0, right: 0, top: -24, alignItems: "center" }}>
                <Pressable
                    onPress={onHome}
                    hitSlop={12}
                    style={{
                        width: 64,
                        height: 64,
                        borderRadius: 18,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#fff",
                        borderWidth: 1,
                        borderColor: isDark ? "#27272a" : "#e5e7eb",
                    }}
                >
                    <View
                        style={{
                            width: 56,
                            height: 56,
                            borderRadius: 16,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#E31B23",
                        }}
                    >
                        <Feather name="home" size={22} color="#fff" />
                    </View>
                </Pressable>
            </View>
        </View>
    );
}

export default function HomeScreen() {
    const router = useRouter();
    const { user } = useMobileUser();
    const insets = useSafeAreaInsets();

    const scheme = useColorScheme();
    const isDark = scheme === "dark";

    const greeting = getGreeting();
    const displayName = getDisplayName(user ?? undefined);
    const dtcTitle = formatDtcTitle(new Date());
    const [clockInTime, setClockInTime] = useState<string | null>(null);

    const loadClockInStatus = useCallback(() => {
        initAttendanceQueueDb();

        const latest = getTodayLatestSyncedClockIn();
        if (!latest?.client_time) {
            setClockInTime(null);
            return;
        }

        setClockInTime(formatClockTime(latest.client_time));
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadClockInStatus();
        }, [loadClockInStatus])
    );

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-[#0B0B0D]">
            {/* Background soft */}
            <LinearGradient
                colors={["rgba(227,27,35,0.14)", "rgba(227,27,35,0.03)", "rgba(0,0,0,0)"]}
                locations={[0, 0.55, 1]}
                style={{ position: "absolute", top: 0, left: 0, right: 0, height: 320 }}
            />

            {/* IMPORTANT: paddingBottom besar agar konten tidak ketutup bottom nav */}
            <ScrollView contentContainerStyle={{ paddingBottom: 140 + insets.bottom }}>
                {/* backdrop */}
                <Pressable
                    style={{ flex: 1, backgroundColor: "transparent" }}
                >
                    {/* menu card anchor: kanan bawah, di atas navbar */}
                    <View style={{ position: "absolute", right: 16, bottom: 110 }}>
                        <View className="w-72 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141418] shadow-xl overflow-hidden">
                            {/* header user */}
                            <View className="flex-row items-center px-4 py-4">
                                <View className="h-11 w-11 rounded-full bg-zinc-100 dark:bg-zinc-800 items-center justify-center">
                                    <Feather name="user" size={22} color={isDark ? "#9CA3AF" : "#9AA0A6"} />
                                </View>

                                <View className="ml-3 flex-1">
                                    <Text className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                        {displayName}
                                    </Text>
                                    <Text className="text-xs text-zinc-500 dark:text-zinc-400" numberOfLines={1}>
                                        {user?.email ?? ""}
                                    </Text>
                                </View>
                            </View>

                            <View className="h-px bg-zinc-200 dark:bg-zinc-800" />

                                {/* items */}
                                <Pressable
                                    className="flex-row items-center px-4 py-3"
                                >
                                    <Feather name="settings" size={18} color={isDark ? "#E5E7EB" : "#111827"} />
                                    <Text className="ml-3 text-sm text-zinc-900 dark:text-zinc-100">
                                        Account Settings
                                    </Text>
                                </Pressable>

                            <View className="h-px bg-zinc-200 dark:bg-zinc-800" />

                            <Pressable className="flex-row items-center px-4 py-3">
                                <Feather name="log-out" size={18} color="#E31B23" />
                                <Text className="ml-3 text-sm font-semibold text-[#E31B23]">
                                    Logout
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </Pressable>

                {/* Header */}
                <View className="px-6 pt-6">
                    <Text className="text-sm text-zinc-500 dark:text-zinc-400">{greeting}
                    </Text>

                    <View className="mt-1 flex-row items-center justify-between">
                        <Text className="text-[18px] font-semibold text-zinc-900 dark:text-zinc-100">
                            {displayName}
                        </Text>

                        <Image
                        source={
                            isDark
                                ? require("../../../assets/images/itr pass logo-01-DM.png")
                                : require("../../../assets/images/itr pass logo-02-LM.png")
                        }
                        style={{ width: 90, height: 28 }}
                        resizeMode="contain"
                        />
                    </View>
                </View>

                {/* Daily Time Card (DTC) */}
                <DailyTimeCard
                    title={dtcTitle}
                    clockInTime={clockInTime}
                    onClockIn={() => router.push("/dtc/dtc-in")}
                    onClockOut={() => router.push("/dtc/dtc-out")}
                    isDark={isDark}
                />

                {/* Quick Actions */}
                <View className="px-6 mt-6">
                    <Text className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Quick Actions</Text>

                    <View className="mt-3 flex-row gap-3">
                        <Tile icon="bar-chart-2" title="Dashboard" subtitle="KPI snapshot" onPress={() => router.push("../dashboard/DashboardPage")} />
                        <Tile icon="file-text" title="Work Order" subtitle="Create / view WO" onPress={() => {}} />
                    </View>

                    <View className="mt-3 flex-row gap-3">
                        <Tile icon="users" title="Employee" subtitle="Directory & profile" onPress={() => {}} />
                        <Tile icon="clock" title="Overtime" subtitle="Request overtime" onPress={() => {}} />
                    </View>
                </View>

                {/* Recent / Activity */}
                <View className="px-6 mt-7">
                    <Text className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Recent Activity
                    </Text>

                    <View className="mt-3 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/85 dark:bg-[#141418]/85 p-4 shadow-sm">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                No activity yet
                            </Text>
                            <Text className="text-xs text-zinc-400">Preview</Text>
                        </View>

                        <Text className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                            Nanti di sini isi list: WO terakhir, overtime request, approval status, dll.
                        </Text>

                        <Pressable className="mt-4 h-11 rounded-full bg-[#E31B23]/90 items-center justify-center">
                            <Text className="text-white text-sm font-bold">Continue (placeholder)</Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Navigation */}
            <BottomNav
                isDark={isDark}
                bottomInset={Math.max(insets.bottom, 10)}
                onMenu1={() => {}}
                onMenu2={() => router.push("../dashboard/DashboardPage")}
                onHome={() => router.push("/home/home")}
                onNotif={() => {}}
                onAccount={() => router.push("/account/account")}
            />
        </SafeAreaView>
    );
}
