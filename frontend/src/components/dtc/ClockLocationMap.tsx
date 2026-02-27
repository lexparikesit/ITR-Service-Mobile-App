import React from "react";
import MapView, { Marker } from "react-native-maps";

type Coordinates = {
    latitude: number;
    longitude: number;
};

type Region = Coordinates & {
    latitudeDelta: number;
    longitudeDelta: number;
};

export default function ClockLocationMap({
    coords,
    region,
}: {
    coords: Coordinates;
    region: Region;
}) {
    return (
        <MapView style={{ flex: 1 }} initialRegion={region} region={region}>
            <Marker coordinate={coords} />
        </MapView>
    );
}
