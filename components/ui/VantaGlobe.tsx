"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    VANTA: any;
    THREE: any;
  }
}

interface VantaGlobeProps {
  className?: string;
}

export function VantaGlobe({ className = "" }: VantaGlobeProps) {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Load Three.js and Vanta.js scripts dynamically
    const loadScripts = async () => {
      // Check if already loaded
      if (window.THREE && window.VANTA) {
        setLoaded(true);
        return;
      }

      // Load Three.js first
      if (!window.THREE) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js";
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Three.js"));
          document.head.appendChild(script);
        });
      }

      // Then load Vanta.js Globe
      if (!window.VANTA) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js";
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Vanta.js"));
          document.head.appendChild(script);
        });
      }

      setLoaded(true);
    };

    loadScripts().catch(console.error);
  }, []);

  useEffect(() => {
    if (!loaded || !vantaRef.current || vantaEffect.current) return;

    try {
      vantaEffect.current = window.VANTA.GLOBE({
        el: vantaRef.current,
        THREE: window.THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0x3b82f6,       // Indigo-ish blue for connection lines
        color2: 0x6366f1,      // Secondary color (indigo)
        backgroundColor: 0x020617, // Very dark slate (slate-950)
        points: 8.0,
        maxDistance: 23.0,
        spacing: 18.0,
        size: 1.2,
      });
    } catch (err) {
      console.error("Vanta Globe initialization error:", err);
    }

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, [loaded]);

  return (
    <div
      ref={vantaRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ zIndex: 0 }}
    />
  );
}
