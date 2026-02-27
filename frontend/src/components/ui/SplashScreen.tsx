import React, { useEffect, useMemo, useRef } from "react";
import { 
    View, 
    Image, 
    Animated, 
    Easing, 
    useColorScheme 
} from "react-native";

export default function SplashScreen() {
    const scheme = useColorScheme();
    const isDark = scheme === "dark";

    // ✅ light/dark logo swap sesuai request
    const logoSource = useMemo(
        () =>
        isDark
            ? require("../../../assets/images/itr pass logo-01-DM.png") // dark
            : require("../../../assets/images/itr pass logo-02-LM.png"), // light
        [isDark]
    );

    // animation values
    const leftX = useRef(new Animated.Value(0)).current;
    const rightX = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(1.18)).current;

    // control ukuran logo
    const W = 280; // total width logo (atur sesuai selera)
    const H = 80;  // height logo

    useEffect(() => {
        // Netflix-like motion: start off-center, snap to center, then settle.
        leftX.setValue(-70);
        rightX.setValue(70);
        opacity.setValue(0);
        logoScale.setValue(1.18);

        Animated.sequence([
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 420,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(leftX, {
                    toValue: 0,
                    duration: 580,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(rightX, {
                    toValue: 0,
                    duration: 580,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(logoScale, {
                    toValue: 1,
                    duration: 580,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.timing(leftX, {
                    toValue: -10,
                    duration: 170,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(rightX, {
                    toValue: 10,
                    duration: 170,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.timing(leftX, {
                    toValue: 0,
                    duration: 190,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(rightX, {
                    toValue: 0,
                    duration: 190,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, [leftX, rightX, opacity, logoScale]);

    return (
        <View className="flex-1 items-center justify-center bg-white dark:bg-black">
            {/* container logo */}
            <Animated.View style={{ width: W, height: H, opacity, transform: [{ scale: logoScale }] }}>
                {/* LEFT HALF (clipped) */}
                <Animated.View
                    style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        width: W / 1,
                        height: H,
                        overflow: "hidden",
                        transform: [{ translateX: leftX }],
                    }}
                >
                    <Image
                        source={logoSource}
                        style={{ width: W, height: H }}
                        resizeMode="contain"
                    />
                </Animated.View>

                {/* RIGHT HALF (clipped) */}
                <Animated.View
                    style={{
                        position: "absolute",
                        right: 0,
                        top: 0,
                        width: W / 1,
                        height: H,
                        overflow: "hidden",
                        transform: [{ translateX: rightX }],
                    }}
                >
                    {/* geser image ke kiri setengah supaya yang kelihatan hanya sisi kanan */}
                    <Image
                        source={logoSource}
                        style={{ width: W, height: H, transform: [{ translateX: -(W / 1) }] }}
                        resizeMode="contain"
                    />
                </Animated.View>
            </Animated.View>
        </View>
    );
}
