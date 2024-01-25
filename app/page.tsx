"use client";

import Script from "next/script";
import { useState } from "react";
import "./mapbox-gl.css";
import Map from "@/components/map";

export default function Home() {
  const [mapboxReady, setMapboxReady] = useState(false);
  const [mapsindoorsReady, setMapsindoorsReady] = useState(false);
  return (
    <>
      <Script
        src={
          "https://app.mapsindoors.com/mapsindoors/js/sdk/4.29.0/mapsindoors-4.29.0.js.gz?apikey=" +
          process.env.NEXT_PUBLIC_MAPSINDOORS_API_KEY
        }
        onLoad={() => {
          setMapsindoorsReady(true);
        }}
      />
      <Script
        src={"https://api.mapbox.com/mapbox-gl-js/v3.1.0/mapbox-gl.js"}
        onLoad={() => {
          setMapboxReady(true);
        }}
      />

      {mapboxReady && mapsindoorsReady && (
        <div className="relative min-h-screen">
          <Map />
        </div>
      )}
    </>
  );
}
