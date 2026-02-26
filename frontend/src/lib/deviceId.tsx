import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";

const KEY_DEVICE_ID = "mobile_device_id";

export async function getOrCreateDeviceId(): Promise<string> {
    const existing = await SecureStore.getItemAsync(KEY_DEVICE_ID);
    if (existing && existing.trim()) return existing;

    const id = Crypto.randomUUID();
    await SecureStore.setItemAsync(KEY_DEVICE_ID, id);
    return id;
}