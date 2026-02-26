import "../global.css";
import React from "react";
import { Stack, Redirect, useSegments } from "expo-router";
import { MobileUserProvider, useMobileUser } from "../components/context/MobileUserContext";
import SplashScreen from "../components/ui/SplashScreen";

function AuthGate() {
    const { user, loading } = useMobileUser();
    const segments = useSegments();
    const inAuthGroup = segments[0] === "authentication";

    if (loading) {
        return <SplashScreen />;
    }

    if (!user && !inAuthGroup) {
        return <Redirect href="/authentication/Login" />;
    }

    if (user && inAuthGroup) {
        return <Redirect href="/home/home" />;
    }

    return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
    return (
        <MobileUserProvider>
            <AuthGate />
        </MobileUserProvider>
    );
}