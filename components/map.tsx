"use client";

import { use, useEffect, useRef, useState } from "react";
import {
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Settings,
  Box,
  Diamond,
  User,
  Thermometer,
  Building,
  LandPlot,
  MapPin,
} from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";

export default function Map() {
  const mapsindoors = window.mapsindoors;
  const mapboxgl = window.mapboxgl;

  const mapContainerRef = useRef(null);
  const mapboxMapRef = useRef(null);
  const mapsIndoorsRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);

  const [lightPresetState, setLightPresetState] = useState("dawn");
  const [dimensionState, setDimensionState] = useState("3d");

  const [locationsList, setLocationsList] = useState([]);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [buttonDisabledAnimation, setButtonDisabledAnimation] = useState(true);
  const [withRoutes, setWithRoutes] = useState(false);

  const zoomLevelMap = { far: 21, medium: 22, close: 23 };
  const [zoomLevel, setZoomLevel] = useState("far");

  const highlightMap = { red: "#FF0000", blue: "#0000FF", green: "#00FF00" };
  const [highlight, setHighlight] = useState("red");

  const mapViewOptions = {
    accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
    element: undefined,
    center: { lat: 30.3605298, lng: -97.7421781, floor: 0 },
    zoom: 17,
    minZoom: 16,
    maxZoom: 25,
    pitch: 35,
    bearing: 9,
    lightPreset: lightPresetState,
    mapsIndoorsTransitionLevel: 19,
    // showMapboxExtrusionsZoomTo: 20,
    // hideMapboxExtrusionsZoomFrom: 22,
    showMapMarkers: undefined,
    // bounds: [
    //   [-97.72107723039518, 30.40456044442378],
    //   [-97.72103878321172, 30.405409581795666],
    // ],
  };

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const goToVenue = async () => {
    const mapboxMap = mapboxMapRef.current;
    const mapsIndoors = mapsIndoorsRef.current;

    toast("Austin Office", {
      duration: 9000,
      icon: <Building />,
      className: "justify-center",
    });

    mapboxMap.flyTo({
      center: [mapViewOptions.center.lng, mapViewOptions.center.lat],
      zoom: 19,
      pitch: mapViewOptions.pitch,
      bearing: mapViewOptions.bearing + 45,
      duration: 4500,
    });

    await delay(5000);

    mapboxMap.flyTo({
      center: [mapViewOptions.center.lng, mapViewOptions.center.lat],
      zoom: 21,
      pitch: mapViewOptions.pitch,
      bearing: mapViewOptions.bearing + 90,
      duration: 4500,
    });

    await delay(4000);

    setButtonDisabledAnimation(false);
  };

  useEffect(() => {
    mapViewOptions.element = mapContainerRef.current;

    const mapView = new mapsindoors.mapView.MapboxV3View(mapViewOptions);
    const mapsIndoors = new mapsindoors.MapsIndoors({
      mapView: mapView,
    });
    const mapboxMap = mapsIndoors.getMap();

    mapsIndoorsRef.current = mapsIndoors;
    mapboxMapRef.current = mapboxMap;

    const externalDirectionsProvider =
      new mapsindoors.directions.MapboxProvider(
        process.env.MAPBOX_ACCESS_TOKEN
      );
    const directionsService = new mapsindoors.services.DirectionsService(
      externalDirectionsProvider
    );
    const directionsRenderer = new mapsindoors.directions.DirectionsRenderer({
      mapsIndoors: mapsIndoors,
      fitBounds: true,
      fitBoundsPadding: { top: 50, bottom: 50 },
    });

    directionsServiceRef.current = directionsService;
    directionsRendererRef.current = directionsRenderer;

    let parkingDisplayRule;
    mapsindoors.services.LocationsService.getLocation(
      "7219d41d7ebe4f26a334636a"
    ).then((location) => {
      parkingDisplayRule = mapsIndoors.getDisplayRule(location);
    });

    let smallMeetingRoomDisplayRule;
    mapsindoors.services.LocationsService.getLocation(
      "9297339ed8c0419da4264c5b"
    ).then((location) => {
      smallMeetingRoomDisplayRule = mapsIndoors.getDisplayRule(location);
      delete smallMeetingRoomDisplayRule.model3DRotationX;
      delete smallMeetingRoomDisplayRule.model3DRotationY;
      delete smallMeetingRoomDisplayRule.model3DRotationZ;
    });

    let mediumMeetingRoomDisplayRule;
    mapsindoors.services.LocationsService.getLocation(
      "e918620e841e4c3ca91d6672"
    ).then((location) => {
      mediumMeetingRoomDisplayRule = mapsIndoors.getDisplayRule(location);
      delete mediumMeetingRoomDisplayRule.model3DRotationX;
      delete mediumMeetingRoomDisplayRule.model3DRotationY;
      delete mediumMeetingRoomDisplayRule.model3DRotationZ;
    });

    let workstationDisplayRule;
    mapsindoors.services.LocationsService.getLocation(
      "a03dd7e567704711aed66d76"
    ).then((location) => {
      workstationDisplayRule = mapsIndoors.getDisplayRule(location);
      delete workstationDisplayRule.model3DRotationX;
      delete workstationDisplayRule.model3DRotationY;
      delete workstationDisplayRule.model3DRotationZ;
    });

    const handleClick = (location) => {
      mapsIndoors.selectLocation(location);
      const locationType = location.properties.type;
      toast(
        <div className="flex flex-col mx-auto">
          <div className="flex flex-row justify-center mb-2 font-extrabold text-lg">
            <MapPin className="mx-2" />
            {location.properties.name}
          </div>
          <div className="space-x-4">
            <Badge variant="secondary" className="">
              <User className="mr-2" />4
            </Badge>
            <Badge variant="secondary" className="">
              <Thermometer className="mr-2" />
              21°C
            </Badge>
            <Badge variant="secondary" className="">
              <LandPlot className="mr-2" />
              22 m²
            </Badge>
          </div>
          {locationType === "MeetingRoom Small" && (
            <div className="flex flex-row justify-center mt-8">
              <Button
                onClick={() => {
                  mapsIndoors.overrideDisplayRule(
                    location.id,
                    smallMeetingRoomDisplayRule
                  );
                  toast.dismiss();
                }}
              >
                Book Room
              </Button>
            </div>
          )}

          {locationType === "MeetingRoom Medium" && (
            <div className="flex flex-row justify-center mt-8">
              <Button
                onClick={() => {
                  mapsIndoors.overrideDisplayRule(
                    location.id,
                    mediumMeetingRoomDisplayRule
                  );
                  toast.dismiss();
                }}
              >
                Book Room
              </Button>
            </div>
          )}

          {locationType === "Workstation 1.4m" && (
            <div className="flex flex-row justify-center mt-8">
              <Button
                onClick={() => {
                  mapsIndoors.overrideDisplayRule(
                    location.id,
                    workstationDisplayRule
                  );
                  toast.dismiss();
                }}
              >
                Book Workstation
              </Button>
            </div>
          )}

          {locationType === "Parking" && (
            <div className="flex flex-row justify-center mt-8">
              <Button
                onClick={() => {
                  mapsIndoors.overrideDisplayRule(
                    location.id,
                    parkingDisplayRule
                  );
                  toast.dismiss();
                }}
              >
                Reserve Parking
              </Button>
            </div>
          )}
        </div>,
        {
          duration: 10000,
          position: "top-center",
        }
      );
    };

    mapsIndoors.on("click", handleClick);

    return () => {
      mapsIndoors.off("click", handleClick);
    };
  }, []);

  return (
    <>
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            size="icon"
            className="absolute z-50 top-5 right-5"
            disabled={buttonDisabledAnimation}
          >
            <Settings />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="place-self-center">Settings</DrawerTitle>
          </DrawerHeader>
          <DrawerFooter>
            <Tabs
              value={lightPresetState}
              className="place-self-center"
              onValueChange={(value) => {
                setLightPresetState(value);
                mapboxMapRef.current.setConfigProperty(
                  "basemap",
                  "lightPreset",
                  value
                );
              }}
            >
              <TabsList>
                <TabsTrigger value="dawn">
                  <Sunrise className="" />
                </TabsTrigger>
                <TabsTrigger value="day">
                  <Sun className="" />
                </TabsTrigger>
                <TabsTrigger value="dusk">
                  <Sunset className="" />
                </TabsTrigger>
                <TabsTrigger value="night">
                  <Moon className="" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Tabs
              value={dimensionState}
              className="place-self-center mt-5"
              onValueChange={(value) => {
                setDimensionState(value);
                if (value === "3d") {
                  mapboxMapRef.current.setLayoutProperty(
                    "MI_WALLS_LAYER",
                    "visibility",
                    "visible"
                  );
                  mapboxMapRef.current.setLayoutProperty(
                    "MI_ROOMS_LAYER",
                    "visibility",
                    "visible"
                  );
                  mapboxMapRef.current.setLayoutProperty(
                    "MI_MODEL_3D_LAYER",
                    "visibility",
                    "visible"
                  );
                } else {
                  mapboxMapRef.current.setLayoutProperty(
                    "MI_WALLS_LAYER",
                    "visibility",
                    "none"
                  );
                  mapboxMapRef.current.setLayoutProperty(
                    "MI_ROOMS_LAYER",
                    "visibility",
                    "none"
                  );
                  mapboxMapRef.current.setLayoutProperty(
                    "MI_MODEL_3D_LAYER",
                    "visibility",
                    "none"
                  );
                }
              }}
            >
              <TabsList>
                <TabsTrigger value="2d">
                  <Diamond className="" />
                </TabsTrigger>
                <TabsTrigger value="3d">
                  <Box className="" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Dialog defaultOpen={true} onOpenChange={goToVenue}>
        {/* <DialogTrigger></DialogTrigger> */}
        <DialogContent className="justify-center items-center">
          <DialogHeader>
            <DialogTitle>MapsPeople Smart Office App</DialogTitle>
            <DialogDescription className="flex justify-center items-center">
              Smart office demo app.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="">
            <DialogClose asChild className="mx-auto">
              <Button type="button" variant="secondary">
                Continue
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster position="top-center" visibleToasts={1} />

      <div ref={mapContainerRef} className="min-h-screen" />
    </>
  );
}
