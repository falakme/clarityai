"use client";

import { CircleMarker, MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export interface LatLng {
  lat: number;
  lng: number;
}

function ClickCapture({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

/**
 * Click-to-select map for targeting alerts by area. Clicking anywhere reports
 * the coordinates to the parent, which reverse-geocodes them to a city. Uses
 * free OpenStreetMap tiles (no API key) and a CircleMarker so no marker-image
 * assets are required. Loaded via next/dynamic with ssr:false (Leaflet needs
 * the browser `window`).
 */
export default function CityMap({
  marker,
  onPick,
}: {
  marker: LatLng | null;
  onPick: (p: LatLng) => void;
}) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      scrollWheelZoom
      style={{ height: 360, width: "100%" }}
      className="overflow-hidden rounded-md"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickCapture onPick={onPick} />
      {marker && (
        <CircleMarker
          center={[marker.lat, marker.lng]}
          radius={11}
          pathOptions={{
            color: "#dc2626",
            fillColor: "#dc2626",
            fillOpacity: 0.5,
            weight: 3,
          }}
        />
      )}
    </MapContainer>
  );
}
