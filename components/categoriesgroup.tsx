"use client";

import { useAtom } from "jotai";
import { toast } from "sonner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import Image from "next/image";
import restroomIcon from "@/public/restroom.png";
import canteenIcon from "@/public/canteen2.png";
import meetingRoomIcon from "@/public/meetingroom.png";
import { Button } from "@/components/ui/button";
import { CornerUpRight } from "lucide-react";
import {
  buttonDisabledAnimationAtom,
  directionsCardOpenAtom,
  originStateAtom,
  originValueAtom,
  destStateAtom,
  categoryValueAtom,
  isCategoryToggledAtom,
  restroomsListAtom,
  meetingroomsListAtom,
  canteensListAtom,
  nearestRestroomAtom,
  nearestMeetingroomAtom,
  nearestCanteenAtom,
  directionsResultStateAtom,
} from "@/lib/atoms";

export default function CategoriesGroup({
  directionsRendererRef,
  mapboxMapRef,
  mapViewOptions,
  positionRef,
  mapsIndoorsRef,
  directionsServiceRef,
}) {
  const [buttonDisabledAnimation, setButtonDisabledAnimation] = useAtom(
    buttonDisabledAnimationAtom
  );
  const [directionsCardOpen, setDirectionsCardOpen] = useAtom(
    directionsCardOpenAtom
  );
  const [originState, setOriginState] = useAtom(originStateAtom);
  const [originValue, setOriginValue] = useAtom(originValueAtom);
  const [categoryValue, setCategoryValue] = useAtom(categoryValueAtom);
  const [isCategoryToggled, setIsCategoryToggled] = useAtom(
    isCategoryToggledAtom
  );
  const [restroomsList, setRestroomsList] = useAtom(restroomsListAtom);
  const [meetingroomsList, setMeetingroomsList] = useAtom(meetingroomsListAtom);
  const [canteensList, setCanteensList] = useAtom(canteensListAtom);
  const [nearestRestroom, setNearestRestroom] = useAtom(nearestRestroomAtom);
  const [nearestMeetingroom, setNearestMeetingroom] = useAtom(
    nearestMeetingroomAtom
  );
  const [nearestCanteen, setNearestCanteen] = useAtom(nearestCanteenAtom);
  const [directionsResultState, setDirectionsResultState] = useAtom(
    directionsResultStateAtom
  );
  const [destState, setDestState] = useAtom(destStateAtom);

  return (
    <>
      <ToggleGroup
        variant="outline"
        type="single"
        className="absolute z-50 top-5 left-8"
        // className="absolute z-50 bottom-5 right-1/2 transform translate-x-1/2"
        disabled={buttonDisabledAnimation}
        onValueChange={(value) => {
          toast.dismiss();
          directionsRendererRef.current.setRoute(null);
          setDirectionsCardOpen(false);
          if (value !== "") {
            mapboxMapRef.current.flyTo({
              center: [mapViewOptions.center.lng, mapViewOptions.center.lat],
              zoom: 19,
              pitch: mapViewOptions.pitch,
              bearing: 99,
              duration: 1500,
            });
            setCategoryValue(value);
            setIsCategoryToggled(true);
          } else {
            setIsCategoryToggled(false);
          }
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
          className="bg-white !px-2"
        >
          <Image
            priority
            src={restroomIcon}
            alt="restroom"
            className="h-6 w-6"
          />
        </ToggleGroupItem>

        <ToggleGroupItem
          value="meetingroom"
          aria-label="Toggle meeting room"
          className="bg-white !px-2"
        >
          <Image
            priority
            src={meetingRoomIcon}
            alt="meetingroom"
            className="h-6 w-6"
          />
        </ToggleGroupItem>

        <ToggleGroupItem
          value="canteen"
          aria-label="Toggle canteen"
          className="bg-white !px-2"
        >
          <Image
            priority
            src={canteenIcon}
            alt="canteen"
            className="h-[22px] w-[22px] m-[1px]"
          />
        </ToggleGroupItem>
      </ToggleGroup>
      <Button
        variant="outline"
        size="icon"
        id="directionsButton"
        disabled={buttonDisabledAnimation || !isCategoryToggled}
        className="bg-[#3071d9] text-white hover:text-white hover:bg-[#417cdc] absolute z-50 top-5 left-44"
        onClick={() => {
          toast.dismiss();
          setOriginState(null);
          setOriginValue("");
          const originCoords = {
            lat: positionRef.current.coords.latitude,
            lng: positionRef.current.coords.longitude,
            floor: 0,
          };
          let destCoords;

          if (categoryValue === "restroom") {
            // restroom
            setDestState(nearestRestroom);
            destCoords = {
              lat: nearestRestroom.properties.anchor.coordinates[1],
              lng: nearestRestroom.properties.anchor.coordinates[0],
              floor: nearestRestroom.properties.floor,
            };
          } else if (categoryValue === "meetingroom") {
            // meetingroom
            setDestState(nearestMeetingroom);
            destCoords = {
              lat: nearestMeetingroom.properties.anchor.coordinates[1],
              lng: nearestMeetingroom.properties.anchor.coordinates[0],
              floor: nearestMeetingroom.properties.floor,
            };
          } else if (categoryValue === "canteen") {
            // canteen
            setDestState(nearestCanteen);
            destCoords = {
              lat: nearestCanteen.properties.anchor.coordinates[1],
              lng: nearestCanteen.properties.anchor.coordinates[0],
              floor: nearestCanteen.properties.floor,
            };
          }

          directionsServiceRef.current
            .getRoute({
              origin: originCoords,
              destination: destCoords,
              travelMode: "DRIVING",
            })
            .then((directionsResult) => {
              setDirectionsResultState(directionsResult);
              directionsRendererRef.current.setRoute(directionsResult);
              setDirectionsCardOpen(true);
            });
        }}
      >
        <CornerUpRight className="h-4 w-4" />
      </Button>
      <span className="absolute z-50 top-1 left-44 text-xs text-muted-foreground">
        Nearest
      </span>
    </>
  );
}
