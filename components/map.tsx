"use client";

import { useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";
import {
  lightPresetAtom,
  dateStateAtom,
  dateToIdsMapAtom,
  bookingStateAtom,
  selectedLocationAtom,
  locationsAtom,
  originStateAtom,
  originValueAtom,
  destStateAtom,
  directionsStateAtom,
  isBlueDotDirectionAtom,
  isBlueDotDirection2Atom,
  directionsCardOpenAtom,
  restroomsListAtom,
  meetingroomsListAtom,
  canteensListAtom,
  nearestRestroomAtom,
  nearestMeetingroomAtom,
  nearestCanteenAtom,
} from "@/lib/atoms";
import { Thermometer, MapPin, CornerUpRight } from "lucide-react";
import { User as UserIcon } from "lucide-react";
import { MdCo2 } from "react-icons/md";

import Settings from "@/components/settings";
import User from "@/components/user";
import Availability from "@/components/availability";
import Login from "@/components/login";
import Booking from "@/components/booking";
import Directions from "@/components/directions";
import SearchBox from "@/components/searchbox";
import DirectionsCard from "@/components/directionscard";
import CategoriesGroup from "@/components/categoriesgroup";

import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

import { format } from "date-fns";

import { cn } from "@/lib/utils";

import smallMeetingRoomDisplayRule from "@/data/smallMeetingRoom.json";
import mediumMeetingRoomDisplayRule from "@/data/mediumMeetingRoom.json";
import workstationDisplayRule from "@/data/workstation.json";
import parkingDisplayRule from "@/data/parking2433-2448.json";

export default function Map() {
  const mapsindoors = window.mapsindoors;

  const smallMeetingRoomRef = useRef({});
  const mediumMeetingRoomRef = useRef({});
  const workstationRef = useRef({});
  const parkingRef = useRef({});

  const mapContainerRef = useRef(null);
  const mapboxMapRef = useRef(null);
  const mapsIndoorsRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const positionRef = useRef({
    coords: {
      latitude: 30.360573677092603,
      longitude: -97.74225010031331,
      floor: 0,
    },
  });

  const [lightPresetState, setLightPresetState] = useAtom(lightPresetAtom);

  const [dateState, setDateState] = useAtom(dateStateAtom);
  const [bookingState, setBookingState] = useAtom(bookingStateAtom);
  const [selectedLocation, setSelectedLocation] = useAtom(selectedLocationAtom);
  const [floorState, setFloorState] = useState(0);
  const [dateToIdsMap, setDateToIdsMap] = useAtom(dateToIdsMapAtom);

  const [originValue, setOriginValue] = useAtom(originValueAtom);
  const [originState, setOriginState] = useAtom(originStateAtom);
  const [destState, setDestState] = useAtom(destStateAtom);

  const [locations, setLocations] = useAtom(locationsAtom);
  const [restroomsList, setRestroomsList] = useAtom(restroomsListAtom);
  const [meetingroomsList, setMeetingroomsList] = useAtom(meetingroomsListAtom);
  const [canteensList, setCanteensList] = useAtom(canteensListAtom);
  const [nearestRestroom, setNearestRestroom] = useAtom(nearestRestroomAtom);
  const [nearestMeetingroom, setNearestMeetingroom] = useAtom(
    nearestMeetingroomAtom
  );
  const [nearestCanteen, setNearestCanteen] = useAtom(nearestCanteenAtom);

  const [loading, setLoading] = useState(false);
  const [directionsState, setDirectionsState] = useAtom(directionsStateAtom);
  const [isBlueDotDirection, setIsBlueDotDirection] = useAtom(
    isBlueDotDirectionAtom
  );
  const [isBlueDotDirection2, setIsBlueDotDirection2] = useAtom(
    isBlueDotDirection2Atom
  );

  const [directionsCardOpen, setDirectionsCardOpen] = useAtom(
    directionsCardOpenAtom
  );

  function saveIDsForDate(newId) {
    const currentDate = format(dateState, "yyyy-MM-dd");
    // Ensure newIds is always an array for consistency
    const idsToAdd = Array.isArray(newId) ? newId : [newId];

    setDateToIdsMap((prev) => {
      const currentIdsForDate = prev[currentDate] || [];
      // Combine the current IDs with the new ones, avoiding duplicates
      const updatedIdsForDate = [
        ...new Set([...currentIdsForDate, ...idsToAdd]),
      ];
      // Return the updated associations, including the newly added IDs for the current date
      return { ...prev, [currentDate]: updatedIdsForDate };
    });
  }

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
    showMapMarkers: undefined,
  };

  const initBlueDot = () => {
    const map = mapboxMapRef.current;
    const size = 100;

    // This implements `StyleImageInterface`
    // to draw a pulsing dot icon on the map.
    const pulsingDot = {
      width: size,
      height: size,
      data: new Uint8Array(size * size * 4),

      // When the layer is added to the map,
      // get the rendering context for the map canvas.
      onAdd: function () {
        const canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;
        this.context = canvas.getContext("2d");
      },

      // onRemove: function () {
      //   this.canvas.parentNode.removeChild(this.canvas);
      //   map.off("render", this.render);
      // },

      // Call once before every frame where the icon will be used.
      render: function () {
        const duration = 1000;
        const t = (performance.now() % duration) / duration;

        const radius = (size / 2) * 0.3;
        const outerRadius = (size / 2) * 0.7 * t + radius;
        const context = this.context;

        // Draw the outer circle.
        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();
        context.arc(
          this.width / 2,
          this.height / 2,
          outerRadius / 2,
          0,
          Math.PI * 2
        );
        context.fillStyle = `rgba(48, 113, 217, ${1 - t})`;
        context.fill();

        // Draw the inner circle.
        context.beginPath();
        context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
        context.fillStyle = "rgba(48, 113, 217, 1)";
        context.strokeStyle = "white";
        context.lineWidth = 2 + 4 * (1 - t);
        context.fill();
        context.stroke();

        // Update this image's data with data from the canvas.
        this.data = context.getImageData(0, 0, this.width, this.height).data;

        // Continuously repaint the map, resulting
        // in the smooth animation of the dot.
        map.triggerRepaint();

        // Return `true` to let the map know that the image was updated.
        return true;
      },
    };

    map.on("load", () => {
      map.addImage("pulsing-dot", pulsingDot, { pixelRatio: 2 });

      map.addSource("dot-point", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [
                  positionRef.current.coords.longitude,
                  positionRef.current.coords.latitude,
                ], // icon position [lng, lat]
              },
            },
          ],
        },
      });
      map.addLayer({
        id: "layer-with-pulsing-dot",
        type: "symbol",
        slot: "top",
        source: "dot-point",
        layout: {
          "icon-image": "pulsing-dot",
        },
      });
    });
  };

  const handleClick = (location) => {
    toast.dismiss();
    directionsRendererRef.current.setRoute(null);
    setDirectionsCardOpen(false);
    mapsIndoorsRef.current.selectLocation(location);
    setSelectedLocation(location);
    setOriginState(null);
    setOriginValue("");
    setIsBlueDotDirection(true);
    setIsBlueDotDirection2(false);
    setDestState(location);
    const locationType = location.properties.type;
    const etLocation = "1d9c57051bcb454e9e482bf4";
    const myWorkstation = "98805eace3a2454dbc3bc584";
    const myParking = "0cdb7123d5914f22b46d702b";
    const alienLocation = "e8a2f84d85de438cada2afda";
    const deadpoolLocation = "09c45490917f4eb4abe0448d";
    const oceanselevenLocation = "5527950860a44c2593757857";

    toast(
      <div className="flex flex-col mx-auto">
        <div className="flex flex-row justify-center mb-2 font-extrabold text-lg">
          <MapPin className="mx-2" />
          {location.properties.name}
        </div>
        {(locationType === "MeetingRoom Small" ||
          locationType === "MeetingRoom Medium" ||
          locationType === "Workstation 1.4m") && (
          <div className="space-x-4">
            <Badge
              variant="secondary"
              className={cn(
                location.id === myWorkstation
                  ? "bg-[#F87171] hover:bg-[#F88181]"
                  : "bg-[#4ADE80] hover:bg-[#4ADE90]"
              )}
            >
              <UserIcon className="mr-2" />
              {location.id === myWorkstation ? (
                <>&#x2718;</>
              ) : (
                locationType === "Workstation 1.4m" && <>&#x2714;</>
              )}
              {/* {locationType === "MeetingRoom Small" && <>0/4</>} */}
              {location.id === etLocation ? (
                <>2/4</>
              ) : (
                locationType === "MeetingRoom Small" && <>0/4</>
              )}
              {location.id === alienLocation ? (
                <>1/6</>
              ) : (
                locationType === "MeetingRoom Medium" && <>0/6</>
              )}
            </Badge>
            <Badge variant="secondary" className="">
              <Thermometer className="mr-2" />
              {Math.floor(Math.random() * (24 - 21 + 1)) + 21}°C
            </Badge>
            <Badge variant="destructive" className="">
              <MdCo2 className="h-6 w-6 mr-2" />
              {/* 22 m² */}
              {Math.floor(Math.random() * (1850 - 450 + 1)) + 450} PPM
            </Badge>
          </div>
        )}
        {locationType === "MeetingRoom Small" && (
          <div className="flex flex-row justify-center mt-8">
            <Button
              onClick={() => {
                toast.dismiss();
                setBookingState(true);
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
                toast.dismiss();
                setBookingState(true);
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
                toast.dismiss();
                setBookingState(true);
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
                toast.dismiss();
                setBookingState(true);
              }}
            >
              Reserve Parking
            </Button>
          </div>
        )}
        <div className="flex flex-row justify-end mt-4 mr-2">
          <Button
            variant="outline"
            size="icon"
            id="directionsButton"
            className="bg-[#3071d9] text-white hover:text-white hover:bg-[#417cdc]"
            onClick={() => {
              toast.dismiss();
              setDirectionsState(true);
            }}
          >
            <CornerUpRight className="h-4 w-4" />
          </Button>
        </div>
        <span className="flex flex-row justify-end mt-1 text-xs text-muted-foreground">
          Directions
        </span>
      </div>,
      {
        duration: 10000,
        position: "top-center",
        action: {
          label: "Close",
          onClick: () => console.log("Cancel!"),
        },
      }
    );
  };

  //init mapsindoors and stuff
  useEffect(() => {
    mapsindoors.MapsIndoors.addVenuesToSync("dfea941bb3694e728df92d3d");
    mapsindoors.MapsIndoors.setMapsIndoorsApiKey(
      process.env.NEXT_PUBLIC_MAPSINDOORS_API_KEY
    );

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
      fitBoundsPadding: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    mapsIndoors.on("floor_changed", (floor) => {
      directionsRenderer.setRoute(null);
      setFloorState(floor);
    });

    const floorSelectorDiv = document.createElement("div");
    const floorSelector = new mapsindoors.FloorSelector(
      floorSelectorDiv,
      mapsIndoors
    );
    mapboxMap.addControl({
      onAdd: function () {
        return floorSelectorDiv;
      },
      onRemove: function () {},
    });
    floorSelectorDiv.style.marginTop = "192px";

    directionsServiceRef.current = directionsService;
    directionsRendererRef.current = directionsRenderer;

    smallMeetingRoomRef.current = smallMeetingRoomDisplayRule;
    mediumMeetingRoomRef.current = mediumMeetingRoomDisplayRule;
    workstationRef.current = workstationDisplayRule;
    parkingRef.current = parkingDisplayRule;

    mapsIndoors.on("click", (location) => {
      const destCoords = {
        lat: location.properties.anchor.coordinates[1],
        lng: location.properties.anchor.coordinates[0],
      };
      mapboxMapRef.current.flyTo({
        center: [destCoords.lng, destCoords.lat],
        zoom: 21,
        pitch: mapViewOptions.pitch,
        // bearing: mapboxMapRef.current.getBearing() + 90,
        duration: 1500,
      });
      handleClick(location);
    });

    return () => {
      mapsIndoors.off("click", handleClick);
    };
  }, []);
  // get locations
  useEffect(() => {
    async function getLocations() {
      setLoading(true);
      const res = await mapsindoors.services.LocationsService.getLocations({
        floor: "0",
        venue: "AUSTINOFFICE",
        // orderBy: "name",
        // sortOrder: "DESC",
        // types: [
        //   "MeetingRoom Small",
        //   "MeetingRoom Medium",
        //   "Workstation 1.4m",
        //   "Parking",
        //   "Restroom",
        //   "Canteen",
        // ],
        // q: "",
      });
      const locationNames = res
        .filter((location) => location.properties.name !== null)
        .map((location, index) => ({
          value: location.properties.name.toLowerCase() + index,
          label: location.properties.name,
          locationid: location.id,
        }));
      const restrooms = res
        .filter((location) => location.properties.type === "Restroom")
        .map((location) => location.id);
      setRestroomsList(restrooms);
      const meetingrooms = res
        .filter(
          (location) =>
            location.properties.type === "MeetingRoom Small" ||
            location.properties.type === "MeetingRoom Medium"
        )
        .map((location) => location.id);
      setMeetingroomsList(meetingrooms);
      const canteens = res
        .filter((location) => location.properties.type === "Canteen")
        .map((location) => location.id);
      setCanteensList(canteens);

      setLocations(locationNames);
      setLoading(false);
    }

    getLocations();
  }, []);
  // init bluedot
  useEffect(() => {
    initBlueDot();
  }, []);
  // update bluedot
  useEffect(() => {
    const map = mapboxMapRef.current;
    map.on("render", () => {
      if (!map.getLayer("layer-with-pulsing-dot")) {
        return;
      }
      if (floorState > 10) {
        map.setPaintProperty("layer-with-pulsing-dot", "icon-opacity", 0);
      } else {
        map.setPaintProperty("layer-with-pulsing-dot", "icon-opacity", 1);
      }
    });
  }, [floorState]);
  // set initial booked
  useEffect(() => {
    const etLocation = "1d9c57051bcb454e9e482bf4";
    const myWorkstation = "98805eace3a2454dbc3bc584";
    const myParking = "0cdb7123d5914f22b46d702b";
    saveIDsForDate(etLocation);
    saveIDsForDate(myWorkstation);
    saveIDsForDate(myParking);
    mapsIndoorsRef.current.overrideDisplayRule(
      etLocation,
      smallMeetingRoomRef.current
    );
    mapsIndoorsRef.current.overrideDisplayRule(
      myWorkstation,
      workstationRef.current
    );
    mapsIndoorsRef.current.overrideDisplayRule(myParking, parkingRef.current);
    // saveIDsForDate(selectedLocation.id);
    //               mapsIndoorsRef.current.overrideDisplayRule(
    //                 selectedLocation.id,
    //                 selectedLocation.properties.type === "MeetingRoom Small"
    //                   ? smallMeetingRoomRef.current
    //                   : selectedLocation.properties.type ===
    //                     "MeetingRoom Medium"
    //                   ? mediumMeetingRoomRef.current
    //                   : selectedLocation.properties.type === "Workstation 1.4m"
    //                   ? workstationRef.current
    //                   : parkingRef.current
    //               );
  }, []);
  // get nearest locations
  useEffect(() => {
    mapsindoors.services.LocationsService.getLocation(
      "0b506c501a9c4afe9a24db3e"
    ).then((location) => {
      setNearestRestroom(location);
    });
    mapsindoors.services.LocationsService.getLocation(
      "e8a2f84d85de438cada2afda"
    ).then((location) => {
      setNearestMeetingroom(location);
    });
    mapsindoors.services.LocationsService.getLocation(
      "5ec919233c40492dab3ecd64"
    ).then((location) => {
      setNearestCanteen(location);
    });
  }, []);

  return (
    <>
      <Settings mapboxMapRef={mapboxMapRef} />

      <User />

      <Availability
        mapsIndoorsRef={mapsIndoorsRef}
        smallMeetingRoomRef={smallMeetingRoomRef}
        mediumMeetingRoomRef={mediumMeetingRoomRef}
        workstationRef={workstationRef}
        parkingRef={parkingRef}
      />

      <Login mapboxMapRef={mapboxMapRef} mapViewOptions={mapViewOptions} />

      <Booking
        mapsIndoorsRef={mapsIndoorsRef}
        smallMeetingRoomRef={smallMeetingRoomRef}
        mediumMeetingRoomRef={mediumMeetingRoomRef}
        workstationRef={workstationRef}
        parkingRef={parkingRef}
      />

      <Directions
        positionRef={positionRef}
        directionsServiceRef={directionsServiceRef}
        directionsRendererRef={directionsRendererRef}
      />

      <SearchBox
        directionsRendererRef={directionsRendererRef}
        mapboxMapRef={mapboxMapRef}
        mapViewOptions={mapViewOptions}
        handleClick={handleClick}
      />

      <CategoriesGroup
        directionsRendererRef={directionsRendererRef}
        mapboxMapRef={mapboxMapRef}
        mapViewOptions={mapViewOptions}
        positionRef={positionRef}
        mapsIndoorsRef={mapsIndoorsRef}
        directionsServiceRef={directionsServiceRef}
      />

      <DirectionsCard directionsRendererRef={directionsRendererRef} />

      {/* search switch */}
      {/* <Image
        priority
        src={mapsIndoorsIcon}
        alt="MapsIndoors"
        className="absolute z-50 bottom-5 h-[28px] w-[44.8px] right-[47%] my-2 mr-1"
      />
      <Switch
        className="absolute z-50 bottom-5 ml-9 right-[45%] my-2"
        onCheckedChange={(checked) => {
          if (checked) {
            // setMapProvider("mapbox");
          } else {
            // setMapProvider("google");
          }
        }}
      />
      <Image
        priority
        src={mapboxIcon}
        alt="Mapbox"
        className="absolute z-50 bottom-5 h-[28px] w-[28px] ml-[84px] right-[42.8%] my-2"
      /> */}

      {/* toasts */}
      <Toaster position="top-center" visibleToasts={1} />

      {/* map */}
      <div
        ref={mapContainerRef}
        className="w-[97vw] mx-auto rounded-md"
        style={{ height: "calc(97svh - 56px)" }}
      />
    </>
  );
}
