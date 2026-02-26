import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { Theme } from '@/src/lib/theme';

type Props = {
    theme: Theme;
    title: string;
    disabled?: boolean;
    onPress: () => void;
}

export default function PrimaryButton({ theme, title, disabled = false, onPress }: Props) {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={({ pressed }) => [
                styles.button,
                { backgroundColor: theme.brand },
                disabled ? styles.disabled : null,
                pressed && !disabled ? styles.pressed : null,
            ]}
        >
            <Text style={styles.text}>{title}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        height: 58,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 3,
    },
    pressed: { opacity: 0.9 },
    disabled: { opacity: 0.5 },
    text: { color: "#fff", fontSize: 20, fontWeight: "800", letterSpacing: 0.2 },
})