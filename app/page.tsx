"use client";

import Script from "next/script";
import { useState } from "react";
import "./mapbox-gl.css";
import Map from "@/components/map";
import logoIcon from "@/public/logo.svg";
import Image from "next/image";
import { TabsTrigger, TabsContent, TabsList, Tabs } from "@/components/ui/tabs";

export default function Home() {
  const [mapboxReady, setMapboxReady] = useState(false);
  const [mapsindoorsReady, setMapsindoorsReady] = useState(false);
  const [navigation, setNavigation] = useState("map");
  return (
    <>
      <Script
        src={
          "https://app.mapsindoors.com/mapsindoors/js/sdk/4.31.0/mapsindoors-4.31.0.js.gz?apikey="
        }
        onLoad={() => {
          setMapsindoorsReady(true);
        }}
      />
      <Script
        src={"https://api.mapbox.com/mapbox-gl-js/v3.2.0/mapbox-gl.js"}
        onLoad={() => {
          setMapboxReady(true);
        }}
      />

      <div className="relative h-svh bg-secondary">
        <header className="flex items-center px-6 py-2 text-primary">
          <Image
            src={logoIcon}
            alt="logo"
            width={24}
            height={24}
            className="mr-2"
          />
          <span className="text-lg font-semibold">DigiSpaces</span>
          <Tabs className="flex ml-auto" aria-disabled={true} value="map">
            <TabsList className="flex gap-2" aria-disabled={true}>
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
