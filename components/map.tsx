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
  MapPinned,
  CalendarDays,
  Check,
  ChevronsUpDown,
  Search,
  CornerUpRight,
  Wind,
  Utensils,
} from "lucide-react";
import { FaRestroom } from "react-icons/fa";
import { MdPeopleAlt } from "react-icons/md";
import { PiForkKnifeFill } from "react-icons/pi";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { format, isToday, set } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import smallMeetingRoomData from "@/data/smallMeetingRoom.json";
import mediumMeetingRoomData from "@/data/mediumMeetingRoom.json";
import workstationData from "@/data/workstation.json";
import parkingData from "@/data/parking2433-2448.json";

import Image from "next/image";
import mapboxIcon from "@/public/mapbox-svg.svg";
import mapsIndoorsIcon from "@/public/mapsindoors-svg.svg";
import { Label } from "./ui/label";

export default function Map() {
  const mapsindoors = window.mapsindoors;
  const mapboxgl = window.mapboxgl;

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
    coords: { latitude: 30.3605081, longitude: -97.7421388 },
  });

  const [lightPresetState, setLightPresetState] = useState("dawn");
  const [dimensionState, setDimensionState] = useState("3d");
  const [loginState, setLoginState] = useState("staff");

  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [buttonDisabledAnimation, setButtonDisabledAnimation] = useState(true);

  const [dateState, setDateState] = useState<Date | undefined>(new Date());
  const [bookingState, setBookingState] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [floorState, setFloorState] = useState(0);
  const [dateToIdsMap, setDateToIdsMap] = useState({});

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [locations, setLocations] = useState([]);
  const [restroomsList, setRestroomsList] = useState([]);
  const [meetingroomsList, setMeetingroomsList] = useState([]);
  const [canteensList, setCanteensList] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);

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

  function retrieveIDsForDate(date) {
    // if (dateState !== date) return [];
    const formattedDate = format(date, "yyyy-MM-dd");
    return dateToIdsMap[formattedDate] || [];
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

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

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

  const goToVenue = async () => {
    const mapboxMap = mapboxMapRef.current;
    const mapsIndoors = mapsIndoorsRef.current;

    toast("Austin Office", {
      duration: 9000,
      icon: <Building />,
      className: "justify-center",
      closeButton: false,
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
      fitBoundsPadding: { top: 50, bottom: 50 },
    });

    mapsIndoors.on("floor_changed", (floor) => {
      directionsRenderer.setRoute(null);
      setFloorState(floor);
    });

    // const myPositionControlElement = document.createElement("div");
    // const positionControl = new mapsindoors.PositionControl(
    //   myPositionControlElement,
    //   {
    //     mapsIndoors: mapsIndoors,
    //     maxAccuracy: 75,
    //     positionOptions: {
    //       enableHighAccuracy: true,
    //     },
    //     positionMarkerStyles: {
    //       radius: "10px",
    //       strokeWidth: "2px",
    //       strokeColor: "hsl(0, 0%, 100%)",
    //       fillColor: "hsl(217, 69%, 52%)",
    //       fillOpacity: 1,
    //     },
    //     accuracyCircleStyles: {
    //       fillColor: "hsl(217, 69%, 52%)",
    //       fillOpacity: 0,
    //     },
    //   }
    // );
    // mapboxMap.addControl({
    //   onAdd: function () {
    //     return myPositionControlElement;
    //   },
    //   onRemove: function () {},
    // });
    // positionControl.on("position_received", () => {
    //   positionRef.current = positionControl.currentPosition;
    // });
    // positionRef.current = {
    //   coords: { latitude: 30.3605081, longitude: -97.7421388 },
    // };

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
    // floorSelectorDiv.style.marginRight = "2rem";

    directionsServiceRef.current = directionsService;
    directionsRendererRef.current = directionsRenderer;

    // mapsindoors.services.SolutionsService.getUserRoles().then(
    //   (userRoles) => {}
    // );

    let smallMeetingRoomDisplayRule = smallMeetingRoomData;
    let mediumMeetingRoomDisplayRule = mediumMeetingRoomData;
    let workstationDisplayRule = workstationData;
    let parkingDisplayRule = parkingData;

    smallMeetingRoomRef.current = smallMeetingRoomDisplayRule;
    mediumMeetingRoomRef.current = mediumMeetingRoomDisplayRule;
    workstationRef.current = workstationDisplayRule;
    parkingRef.current = parkingDisplayRule;

    const handleClick = (location) => {
      mapsIndoors.selectLocation(location);
      setSelectedLocation(location);
      const locationType = location.properties.type;
      toast(
        <div className="flex flex-col mx-auto">
          <div className="flex flex-row justify-center mb-2 font-extrabold text-lg">
            <MapPin className="mx-2" />
            {location.properties.name}
          </div>
          <div className="space-x-4">
            <Badge
              variant="secondary"
              className="bg-[#4ADE80] hover:bg-[#4ADE90]"
            >
              <User className="mr-2" />
              &#x2714;
            </Badge>
            <Badge variant="secondary" className="">
              <Thermometer className="mr-2" />
              {Math.floor(Math.random() * (24 - 21 + 1)) + 21}°C
            </Badge>
            <Badge variant="destructive" className="">
              <Wind className="mr-2" />
              {/* 22 m² */}
              {Math.floor(Math.random() * (1850 - 450 + 1)) + 450} PPM
            </Badge>
          </div>
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
                const originCoords = {
                  lat: positionRef.current.coords.latitude,
                  lng: positionRef.current.coords.longitude,
                  // floor: 0,
                };
                const destCoords = {
                  lat: location.properties.anchor.coordinates[1],
                  lng: location.properties.anchor.coordinates[0],
                  floor: location.properties.floor,
                };

                directionsService
                  .getRoute({
                    origin: originCoords,
                    destination: destCoords,
                    travelMode: "DRIVING",
                  })
                  .then((directionsResult) => {
                    directionsRenderer.setRoute(directionsResult);
                  });
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
          cancel: {
            label: "Close",
            onClick: () => console.log("Cancel!"),
          },
        }
      );
    };

    mapsIndoors.on("click", handleClick);

    return () => {
      mapsIndoors.off("click", handleClick);
    };
  }, []);
  // open command menu
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && e.metaKey) {
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);
  // get locations
  useEffect(() => {
    async function getLocations() {
      setLoading(true);
      const res = await mapsindoors.services.LocationsService.getLocations({
        floor: "0",
        venue: "AUSTINOFFICE",
        types: [
          "MeetingRoom Small",
          "MeetingRoom Medium",
          "Workstation 1.4m",
          "Parking",
          "Restroom",
          "Canteen",
        ],
        q: "",
      });
      const locationNames = res
        .filter((location) => location.properties.name !== null)
        .map((location) => ({
          value: location.id,
          label: location.properties.name,
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
  // get appConfig
  // useEffect(() => {
  //   mapsindoors.services.AppConfigService.getConfig().then(config => {
  //     console.log(config);
  //   });
  // }, []);

  return (
    <>
      {/* settings */}
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            size="icon"
            className="absolute z-50 top-32 right-8"
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
            {/* 2D to 3D */}
            {/* <Tabs
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
                  let solutionConfig =
                    mapsIndoorsRef.current.getSolutionConfig();
                  solutionConfig.mainDisplayRule.model2DVisible = false;
                  mapsIndoorsRef.current.setSolutionConfig(solutionConfig);
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
                  // mapboxMapRef.current.setLayoutProperty(
                  //   "MI_POINT_LAYER",
                  //   "visibility",
                  //   "none"
                  // );
                  // mapboxMapRef.current.setLayoutProperty(
                  //   "MI_POLYGON_LAYER",
                  //   "visibility",
                  //   "none"
                  // );
                  let solutionConfig =
                    mapsIndoorsRef.current.getSolutionConfig();
                  solutionConfig.mainDisplayRule.model2DVisible = true;
                  mapsIndoorsRef.current.setSolutionConfig(solutionConfig);
                  // mapsIndoorsRef.current.setDisplayRule("MeetingRoom Small", {wallsHeight: 3});
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
            </Tabs> */}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* user */}
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            size="icon"
            variant="secondary"
            className="absolute z-50 top-5 right-8"
            disabled={buttonDisabledAnimation}
          >
            <Avatar className="p-1">
              <AvatarImage src={`${loginState}.png`} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="place-self-center">
              {loginState.toUpperCase()}
            </DrawerTitle>
          </DrawerHeader>
          <DrawerFooter></DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* calendar */}
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            size="icon"
            variant="default"
            className="absolute z-50 top-20 right-8"
            disabled={buttonDisabledAnimation}
          >
            <CalendarDays />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="place-self-center">
              See Availability
            </DrawerTitle>
          </DrawerHeader>
          <DrawerFooter className="mx-auto">
            <Calendar
              mode="single"
              selected={dateState}
              onSelect={(date) => {
                mapsIndoorsRef.current.revertDisplayRule(
                  retrieveIDsForDate(dateState)
                );
                mapsIndoorsRef.current.deselectLocation();
                setDateState(date);
                const ids = retrieveIDsForDate(date);
                for (const id of ids) {
                  mapsindoors.services.LocationsService.getLocation(id).then(
                    (location) => {
                      mapsIndoorsRef.current.overrideDisplayRule(
                        id,
                        location.properties.type === "MeetingRoom Small"
                          ? smallMeetingRoomRef.current
                          : location.properties.type === "MeetingRoom Medium"
                          ? mediumMeetingRoomRef.current
                          : location.properties.type === "Workstation 1.4m"
                          ? workstationRef.current
                          : parkingRef.current
                      );
                    }
                  );
                }
              }}
              fromDate={new Date()}
              required
              initialFocus
            />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* login */}
      <Dialog defaultOpen={true} onOpenChange={goToVenue}>
        {/* <DialogTrigger></DialogTrigger> */}
        <DialogContent className="justify-center items-center">
          <DialogHeader>
            <DialogTitle className="flex justify-center items-center">
              <MapPinned />
            </DialogTitle>
            {/* <DialogDescription className="flex justify-center items-center">
              Smart Office Demo
            </DialogDescription> */}
          </DialogHeader>
          <div className="flex justify-center items-center">Logged in as:</div>
          <div className="flex justify-center items-center mb-6">
            <Select
              value={loginState}
              onValueChange={(value) => {
                setLoginState(value);
              }}
            >
              <SelectTrigger className="w-[140px] mx-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <Avatar>
              <AvatarImage src={`${loginState}.png`} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
          <DialogFooter className="flex">
            <DialogClose asChild className="mx-auto">
              <Button type="button" variant="secondary">
                Continue
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* booking */}
      <Dialog
        open={bookingState}
        onOpenChange={(value) => {
          setBookingState(value);
        }}
      >
        {/* <DialogTrigger></DialogTrigger> */}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedLocation &&
                selectedLocation.properties.type === "MeetingRoom Small" && (
                  <span>Book Room</span>
                )}
              {selectedLocation &&
                selectedLocation.properties.type === "MeetingRoom Medium" && (
                  <span>Book Room</span>
                )}
              {selectedLocation &&
                selectedLocation.properties.type === "Workstation 1.4m" && (
                  <span>Book Workstation</span>
                )}
              {selectedLocation &&
                selectedLocation.properties.type === "Parking" && (
                  <span>Reserve Parking</span>
                )}
            </DialogTitle>
            {/* <DialogDescription>
            </DialogDescription> */}
          </DialogHeader>
          <Popover
            onOpenChange={(value) => {
              setCalendarOpen(value);
            }}
            open={calendarOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
                  !dateState && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateState ? (
                  format(dateState, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateState}
                onSelect={(date) => {
                  setDateState(date);
                  setCalendarOpen(false);
                }}
                fromDate={new Date()}
                required
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                onClick={() => {
                  saveIDsForDate(selectedLocation.id);
                  mapsIndoorsRef.current.overrideDisplayRule(
                    selectedLocation.id,
                    selectedLocation.properties.type === "MeetingRoom Small"
                      ? smallMeetingRoomRef.current
                      : selectedLocation.properties.type ===
                        "MeetingRoom Medium"
                      ? mediumMeetingRoomRef.current
                      : selectedLocation.properties.type === "Workstation 1.4m"
                      ? workstationRef.current
                      : parkingRef.current
                  );
                }}
              >
                Confirm
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* search */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between absolute z-50 top-5 left-8"
            // className="w-[200px] justify-between absolute z-50 bottom-5 right-1/2 transform translate-x-1/2"
          >
            {value
              ? locations.find((locationName) => locationName.value === value)
                  ?.label
              : "Search"}
            <CommandShortcut>⌘K</CommandShortcut>
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command loop>
            <CommandInput placeholder="Search location..." />
            {/* <CommandList>
              {loading && <span>Loading...</span>} */}
            <CommandEmpty>No location found.</CommandEmpty>
            <CommandGroup>
              <ScrollArea className="h-40">
                {locations.map((locationName) => (
                  <CommandItem
                    key={locationName.value}
                    value={locationName.value}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === locationName.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {locationName.label}
                  </CommandItem>
                ))}
              </ScrollArea>
            </CommandGroup>
            {/* </CommandList> */}
          </Command>
        </PopoverContent>
      </Popover>

      {/* Highlight Locations */}
      {/* <Toggle
        variant="outline"
        aria-label="Highlight all restrooms"
        className="absolute z-50 top-5 left-64 bg-card"
        disabled={buttonDisabledAnimation}
        onPressedChange={(checked) => {
          if (checked) {
            mapsIndoorsRef.current.highlight(restroomsList);
          } else {
            mapsIndoorsRef.current.highlight([]);
          }
        }}
      >
        <PersonStanding className="" />
      </Toggle> */}

      <ToggleGroup
        variant="outline"
        type="single"
        className="absolute z-50 top-5 left-64"
        disabled={buttonDisabledAnimation}
        onValueChange={(value) => {
          if (value === "restroom") {
            mapsIndoorsRef.current.highlight(restroomsList);
          } else if (value === "meetingroom") {
            mapsIndoorsRef.current.highlight(meetingroomsList);
          } else if (value === "canteen") {
            mapsIndoorsRef.current.highlight(canteensList);
          } else {
            mapsIndoorsRef.current.highlight([]);
          }
        }}
      >
        <ToggleGroupItem
          value="restroom"
          aria-label="Toggle restroom"
          className="bg-card"
        >
          <FaRestroom />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="meetingroom"
          aria-label="Toggle meeting room"
          className="bg-card"
        >
          <MdPeopleAlt />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="canteen"
          aria-label="Toggle canteen"
          className="bg-card"
        >
          <PiForkKnifeFill />
        </ToggleGroupItem>
      </ToggleGroup>

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
        style={{ height: "calc(97vh - 56px)" }}
      />
    </>
  );
}
