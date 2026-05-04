import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon paths for CRA
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const LIVE_ICON = L.divIcon({
  className: '',
  html: `<div style="
    width:18px;height:18px;
    background:#00ff88;
    border:3px solid #fff;
    border-radius:50%;
    box-shadow:0 0 0 4px rgba(0,255,136,0.35),0 0 18px rgba(0,255,136,0.6);
    animation:pulse 1.5s infinite;
  "></div>
  <style>@keyframes pulse{0%,100%{box-shadow:0 0 0 4px rgba(0,255,136,0.35),0 0 18px rgba(0,255,136,0.6)}50%{box-shadow:0 0 0 8px rgba(0,255,136,0.1),0 0 30px rgba(0,255,136,0.3)}}</style>`,
  iconSize: [18,18], iconAnchor: [9,9],
});

const TRAIL_ICON = L.divIcon({
  className: '',
  html: `<div style="width:8px;height:8px;background:rgba(0,255,136,0.4);border-radius:50%;"></div>`,
  iconSize: [8,8], iconAnchor: [4,4],
});

export default function MapView({ locations = [], liveLocation = null }) {
  const mapRef      = useRef(null);
  const mapInstance = useRef(null);
  const liveMarker  = useRef(null);
  const trailLayer  = useRef(null);
  const polyline    = useRef(null);

  // Init map
  useEffect(() => {
    if (mapInstance.current) return;
    mapInstance.current = L.map(mapRef.current, {
      center: [24.8607, 67.0011], // Karachi default
      zoom: 13,
      zoomControl: true,
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CartoDB',
      subdomains: 'abcd', maxZoom: 19,
    }).addTo(mapInstance.current);

    trailLayer.current = L.layerGroup().addTo(mapInstance.current);
    return () => { mapInstance.current?.remove(); mapInstance.current = null; };
  }, []);

  // Draw history trail
  useEffect(() => {
    if (!mapInstance.current || !locations.length) return;
    trailLayer.current?.clearLayers();

    const coords = locations.map(l => [l.latitude, l.longitude]);

    // Polyline trail
    polyline.current?.remove();
    polyline.current = L.polyline(coords, {
      color: 'rgba(0,255,136,0.4)', weight: 2, dashArray: '4 4',
    }).addTo(mapInstance.current);

    // Trail dots (skip newest — that's the live marker)
    locations.slice(1).forEach(loc => {
      L.marker([loc.latitude, loc.longitude], { icon: TRAIL_ICON })
        .bindPopup(`<b>${loc.event_type}</b><br>${new Date(loc.timestamp).toLocaleTimeString()}`)
        .addTo(trailLayer.current);
    });
  }, [locations]);

  // Update live marker
  useEffect(() => {
    if (!mapInstance.current || !liveLocation) return;
    const { latitude: lat, longitude: lng } = liveLocation;

    if (!liveMarker.current) {
      liveMarker.current = L.marker([lat, lng], { icon: LIVE_ICON })
        .addTo(mapInstance.current);
    } else {
      liveMarker.current.setLatLng([lat, lng]);
    }

    liveMarker.current.bindPopup(
      `<div style="font-family:monospace;font-size:12px;color:#111">
        <b>LIVE</b><br>
        📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}<br>
        🔋 ${liveLocation.battery_level ?? '—'}%<br>
        ⚡ ${liveLocation.event_type}
      </div>`
    );
    mapInstance.current.setView([lat, lng], mapInstance.current.getZoom());
  }, [liveLocation]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: 4 }} />;
}
