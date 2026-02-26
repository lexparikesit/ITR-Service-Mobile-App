import React from "react";
import { View, TextInput, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Theme } from "@/src/lib/theme";

type Props = {
    theme: Theme;
    icon: React.ComponentProps<typeof Feather>["name"];
    value: string;
    onChangeText: (v: string) => void;
    placeholder?: string;
    keyboardType?: "default" | "email-address" | "number-pad";
    secureTextEntry?: boolean;
    rightIcon?: React.ComponentProps<typeof Feather>["name"];
    onPressRightIcon?: () => void;
};

export default function InputPill({
    theme,
    icon,
    value,
    onChangeText,
    placeholder,
    keyboardType = "default",
    secureTextEntry = false,
    rightIcon,
    onPressRightIcon,
}: Props) {
    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: theme.cardBg,
                    borderColor: theme.cardBorder,
                    shadowOpacity: theme.shadowOpacity,
                },
            ]}
        >
            <View style={styles.leftIcon}>
                <Feather name={icon} size={18} color={theme.icon} />
            </View>
            
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={theme.placeholder}
                keyboardType={keyboardType}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={secureTextEntry}
                style={[styles.input, { color: theme.text }, rightIcon ? styles.inputWithRight : null]}
            />

            {rightIcon ? (
                <Pressable onPress={onPressRightIcon} hitSlop={10} style={styles.rightIcon}>
                    <Feather name={rightIcon} size={18} color={theme.iconMuted} />
                </Pressable>
            ): null}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        height: 56,
        borderRadius: 28,
        borderWidth: 1,
        shadowColor: "#000",
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 14,
        paddingRight: 14,
        marginBottom: 14,
    },
    leftIcon: {
        width: 34,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 6,
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 10,
    },
    inputWithRight: { paddingRight: 36 },
    rightIcon: {
        position: "absolute",
        right: 16,
        height: 56,
        justifyContent: "center",
    },
})