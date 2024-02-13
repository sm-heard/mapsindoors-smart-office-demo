"use client";

import Script from "next/script";
import { useState } from "react";
import "./mapbox-gl.css";
import Map from "@/components/map";
import { Building2 } from "lucide-react";
import { TabsTrigger, TabsContent, TabsList, Tabs } from "@/components/ui/tabs";

export default function Home() {
  const [mapboxReady, setMapboxReady] = useState(false);
  const [mapsindoorsReady, setMapsindoorsReady] = useState(false);
  const [navigation, setNavigation] = useState("map");
  return (
    <>
      <Script
        src={
          "https://app.mapsindoors.com/mapsindoors/js/sdk/4.29.3/mapsindoors-4.29.3.js.gz?apikey=" +
          process.env.NEXT_PUBLIC_MAPSINDOORS_API_KEY
        }
        onLoad={() => {
          setMapsindoorsReady(true);
        }}
      />
      <Script
        src={"https://api.mapbox.com/mapbox-gl-js/v3.1.2/mapbox-gl.js"}
        onLoad={() => {
          setMapboxReady(true);
        }}
      />

      <div className="relative h-screen bg-primary">
      <header className="flex items-center px-6 py-2 text-white">
        <Building2 className="mr-2" />
        <span className="text-lg font-semibold">DigiSpaces</span>
        <Tabs
          className="flex ml-auto"
          value={navigation}
          onValueChange={(value) => {
            setNavigation(value);
          }}
        >
          <TabsList className="flex gap-2">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="map">Map</TabsTrigger>
            <TabsTrigger value="contact">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="home"></TabsContent>
          <TabsContent value="map"></TabsContent>
          <TabsContent value="contact"></TabsContent>
        </Tabs>
      </header>

      {mapboxReady && mapsindoorsReady && navigation === "map" && (
        <div className="relative h-fit">
          <Map />
        </div>
      )}
      </div>
    </>
  );
}
