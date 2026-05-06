'use client';

import { useEffect, useRef } from "react";
import createGlobe from "cobe";

const InteractiveGlobe = () => {
  const canvasRef = useRef();
  const pointerInteracting = useRef(null);
  const pointerInteractionPos = useRef(0);
  const r = useRef(0);

  useEffect(() => {
    let phi = 0;
    let globe;
    let width = 0;

    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    window.addEventListener("resize", onResize);
    onResize();

    // Use a small delay to ensure container size is computed
    const timeoutId = setTimeout(() => {
      if (!canvasRef.current) return;
      
      const currentWidth = canvasRef.current.offsetWidth || 400;

      globe = createGlobe(canvasRef.current, {
        devicePixelRatio: 2,
        width: currentWidth * 2,
        height: currentWidth * 2,
        phi: 0,
        theta: 0,
        dark: 1,
        diffuse: 1.2,
        mapSamples: 16000,
        mapBrightness: 6,
        // Brighter base color for the continent dots [R, G, B]
        baseColor: [1, 1, 1], 
        markerColor: [59 / 255, 130 / 255, 246 / 255], // Blue-500
        glowColor: [0.15, 0.15, 0.15],
        markers: [
          { location: [37.7595, -122.4367], size: 0.03 },
          { location: [40.7128, -74.006], size: 0.08 },
          { location: [51.5074, -0.1278], size: 0.05 },
          { location: [35.6762, 139.6503], size: 0.05 },
          { location: [-33.8688, 151.2093], size: 0.05 },
          { location: [25.2048, 55.2708], size: 0.05 },
        ],
        onRender: (state) => {
          if (!pointerInteracting.current) {
            phi += 0.005;
          }
          state.phi = phi + r.current;
          state.width = canvasRef.current.offsetWidth * 2;
          state.height = canvasRef.current.offsetWidth * 2;
        },
      });
      
      canvasRef.current.style.opacity = "1";
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (globe) globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="w-full aspect-square max-w-[400px] mx-auto relative flex items-center justify-center">
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX - pointerInteractionPos.current;
          canvasRef.current.style.cursor = "grabbing";
        }}
        onPointerUp={() => {
          pointerInteracting.current = null;
          canvasRef.current.style.cursor = "grab";
        }}
        onPointerOut={() => {
          pointerInteracting.current = null;
          canvasRef.current.style.cursor = "grab";
        }}
        onPointerMove={(e) => {
          if (pointerInteracting.current !== null) {
            const delta = e.clientX - pointerInteracting.current;
            pointerInteractionPos.current = delta;
            r.current = delta / 200;
          }
        }}
        className="w-full h-full cursor-grab transition-opacity duration-1000"
        style={{
          opacity: 0,
          maxWidth: "100%",
          maxHeight: "100%",
          contain: "layout paint size",
          touchAction: "none",
        }}
      />
    </div>
  );
};

export default InteractiveGlobe;
