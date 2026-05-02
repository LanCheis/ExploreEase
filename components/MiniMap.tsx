declare global {
  interface Window {
    L: any;
  }
}

import { useEffect, useRef } from 'react';

interface Props {
  lat: number | null;
  lng: number | null;
  name: string;
}

export default function MiniMap({ lat, lng }: Props) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);

  useEffect(() => {
    if (lat == null || lng == null || typeof document === 'undefined') return;

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
      const map = L.map(mapDivRef.current, {
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        keyboard: false,
        attributionControl: false,
      }).setView([lat!, lng!], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      }).addTo(map);
      L.marker([lat!, lng!]).addTo(map);
      leafletMapRef.current = map;
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
      }
    };
  }, [lat, lng]);

  if (lat == null || lng == null) return null;
  return (
    <div style={{ height: 180, width: '100%', overflow: 'hidden' }}>
      <div ref={mapDivRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
