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
} from "lucide-react";
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
import { cn } from "@/lib/utils";
import smallMeetingRoomData from "@/data/smallMeetingRoom.json";
import mediumMeetingRoomData from "@/data/mediumMeetingRoom.json";
import workstationData from "@/data/workstation.json";
import parkingData from "@/data/parking2433-2448.json";

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
  const [loginState, setLoginState] = useState("staff");

  const [locationsList, setLocationsList] = useState([]);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [buttonDisabledAnimation, setButtonDisabledAnimation] = useState(true);
  const [withRoutes, setWithRoutes] = useState(false);

  const zoomLevelMap = { far: 21, medium: 22, close: 23 };
  const [zoomLevel, setZoomLevel] = useState("far");

  const highlightMap = { red: "#FF0000", blue: "#0000FF", green: "#00FF00" };
  const [highlight, setHighlight] = useState("red");

  const [dateState, setDateState] = useState<Date | undefined>(new Date());

  const [bookingState, setBookingState] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const mapViewOptions = {
    accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
    element: undefined,
    // localFontFamily: "Lato",
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

  let smallMeetingRoomRef = useRef({});
  let mediumMeetingRoomRef = useRef({});
  let workstationRef = useRef({});
  let parkingRef = useRef({});

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

    const liveDataManager = new mapsindoors.LiveDataManager(mapsIndoors);
    liveDataManager.enableLiveData(
      mapsindoors.LiveDataManager.LiveDataDomainTypes.AVAILABILITY
    );
    liveDataManager.enableLiveData(
      mapsindoors.LiveDataManager.LiveDataDomainTypes.OCCUPANCY
    );

    directionsServiceRef.current = directionsService;
    directionsRendererRef.current = directionsRenderer;

    mapsindoors.services.SolutionsService.getUserRoles().then(
      (userRoles) => {}
    );

    let smallMeetingRoomDisplayRule = smallMeetingRoomData;
    // mapsindoors.services.LocationsService.getLocation(
    //   "9297339ed8c0419da4264c5b"
    // ).then((location) => {
    //   smallMeetingRoomDisplayRule = mapsIndoors.getDisplayRule(location);
    //   delete smallMeetingRoomDisplayRule.model3DRotationX;
    //   delete smallMeetingRoomDisplayRule.model3DRotationY;
    //   delete smallMeetingRoomDisplayRule.model3DRotationZ;
    // });

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
      {/* settings */}
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            size="icon"
            className="absolute z-50 top-5 right-8"
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

      {/* user */}
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            size="icon"
            variant="secondary"
            className="absolute z-50 top-5 left-8"
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
