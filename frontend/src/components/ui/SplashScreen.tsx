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
            ? require("../../../assets/images/itr sip logo transparent.png") // dark
            : require("../../../assets/images/itr sip logo-10.png"), // light
        [isDark]
    );

    // animation values
    const leftX = useRef(new Animated.Value(0)).current;
    const rightX = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    // control ukuran logo
    const W = 280; // total width logo (atur sesuai selera)
    const H = 80;  // height logo

    useEffect(() => {
        // start from center (split out), atau kalau mau split-in tinggal balik tanda
        leftX.setValue(0);
        rightX.setValue(0);
        opacity.setValue(0);

        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 250,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.timing(leftX, {
                toValue: -18, // kiri geser ke kiri
                duration: 650,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(rightX, {
                toValue: 18, // kanan geser ke kanan
                duration: 650,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start();
    }, [leftX, rightX, opacity]);

    return (
        <View className="flex-1 items-center justify-center bg-white dark:bg-black">
            {/* container logo */}
            <Animated.View style={{ width: W, height: H, opacity }}>
                {/* LEFT HALF (clipped) */}
                <Animated.View
                    style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        width: W / 2,
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
                        width: W / 2,
                        height: H,
                        overflow: "hidden",
                        transform: [{ translateX: rightX }],
                    }}
                >
                    {/* geser image ke kiri setengah supaya yang kelihatan hanya sisi kanan */}
                    <Image
                        source={logoSource}
                        style={{ width: W, height: H, transform: [{ translateX: -(W / 2) }] }}
                        resizeMode="contain"
                    />
                </Animated.View>
            </Animated.View>
        </View>
    );
}