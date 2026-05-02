declare global {
  interface Window {
    L: any;
  }
}

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { usePlacesForMap } from '@/hooks/usePlaces';

const HCM: [number, number] = [10.7769, 106.7009];

export default function MapScreen() {
  const { data: places = [] } = usePlacesForMap();
  const router = useRouter();
  const mapDivRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const cssId = 'leaflet-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    function initMap() {
      if (!mapDivRef.current || leafletMapRef.current) return;
      const L = window.L;
      const map = L.map(mapDivRef.current).setView(HCM, 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      }).addTo(map);
      leafletMapRef.current = map;
      markersGroupRef.current = L.layerGroup().addTo(map);
      setMapReady(true);
    }

    if (window.L) {
      initMap();
    } else {
      const scriptId = 'leaflet-js';
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        document.head.appendChild(script);
      }
      script.addEventListener('load', initMap);
      // Guard: L may have loaded between the window.L check above and the listener add
      if (window.L) initMap();
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        markersGroupRef.current = null;
      }
    };
  }, []);

  // Sync markers whenever places data arrives or map finishes initializing
  useEffect(() => {
    if (!mapReady || !markersGroupRef.current) return;
    const L = window.L;
    markersGroupRef.current.clearLayers();
    places
      .filter((p) => p.lat != null && p.lng != null)
      .forEach((p) => {
        const marker = L.marker([p.lat!, p.lng!]);
        const container = document.createElement('div');
        container.style.cssText = 'min-width:120px;padding:2px 0';
        const btn = document.createElement('button');
        btn.textContent = p.name;
        btn.style.cssText =
          'display:block;font-weight:600;color:#2563eb;background:none;border:none;cursor:pointer;padding:0;text-align:left;font-size:14px';
        btn.addEventListener('click', () => router.push(`/place/${p.id}`));
        const cat = document.createElement('div');
        cat.textContent = p.category;
        cat.style.cssText = 'font-size:12px;color:#64748b;margin-top:2px;text-transform:capitalize';
        container.appendChild(btn);
        container.appendChild(cat);
        marker.bindPopup(container);
        markersGroupRef.current.addLayer(marker);
      });
  }, [places, mapReady, router]);

  return (
    <View style={{ flex: 1 }}>
      <div ref={mapDivRef} style={{ height: '100%', width: '100%' }} />
    </View>
  );
}
