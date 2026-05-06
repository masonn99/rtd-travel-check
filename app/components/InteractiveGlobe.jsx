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

    // We use a fixed internal resolution for WebGL to avoid 0-width errors
    // CSS will handle the actual responsive scaling
    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 1000,
      height: 1000,
      phi: 0,
      theta: 0,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.2, 0.2, 0.2],
      markerColor: [0.1, 0.8, 1],
      glowColor: [0.1, 0.1, 0.1],
      markers: [
        { location: [37.7595, -122.4367], size: 0.03 },
        { location: [40.7128, -74.006], size: 0.1 },
        { location: [52.5200, 13.4050], size: 0.03 }, // Berlin
        { location: [35.6762, 139.6503], size: 0.03 }, // Tokyo
      ],
      onRender: (state) => {
        if (!pointerInteracting.current) {
          phi += 0.005;
        }
        state.phi = phi + r.current;
      },
    });

    return () => {
      globe.destroy();
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
        className="w-full h-full cursor-grab opacity-100 transition-opacity duration-500"
        style={{
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
