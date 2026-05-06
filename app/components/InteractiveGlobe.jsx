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

    const initGlobe = () => {
      if (!canvasRef.current) return;
      
      // Get initial width, fallback to 400 if not available
      width = canvasRef.current.offsetWidth || 400;

      globe = createGlobe(canvasRef.current, {
        devicePixelRatio: 2,
        width: width * 2,
        height: width * 2,
        phi: 0,
        theta: 0,
        dark: 1,
        diffuse: 1.2,
        mapSamples: 16000,
        mapBrightness: 6,
        baseColor: [0.3, 0.3, 0.3],
        markerColor: [0.1, 0.8, 1],
        glowColor: [0.1, 0.1, 0.1],
        markers: [
          { location: [37.7595, -122.4367], size: 0.03 },
          { location: [40.7128, -74.006], size: 0.1 },
          { location: [51.5074, -0.1278], size: 0.03 }, // London
          { location: [48.8566, 2.3522], size: 0.03 }, // Paris
        ],
        onRender: (state) => {
          if (!pointerInteracting.current) {
            phi += 0.005;
          }
          state.phi = phi + r.current;
          // Ensure we never pass 0 to width/height
          state.width = Math.max(width * 2, 400);
          state.height = Math.max(width * 2, 400);
        },
      });

      // Show canvas after initialization
      if (canvasRef.current) {
        canvasRef.current.style.opacity = "1";
      }
    };

    // Delay initialization to next frame to ensure DOM layout is complete
    const timeoutId = setTimeout(() => {
        initGlobe();
    }, 50);

    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth || 400;
      }
    };

    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(timeoutId);
      if (globe) globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="w-full aspect-square max-w-[400px] mx-auto relative overflow-hidden flex items-center justify-center">
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
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          contain: "layout paint size",
          opacity: 0,
          transition: "opacity 1s ease",
          touchAction: "none",
        }}
      />
    </div>
  );
};

export default InteractiveGlobe;
