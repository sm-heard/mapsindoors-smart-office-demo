"use client";

import { useAtom } from "jotai";

import {
  Dialog,
  DialogDescription,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Check, MoveDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Search } from "lucide-react";
import Image from "next/image";
import blueDotIcon from "@/public/bluedot.svg";
import { cn } from "@/lib/utils";
import {
  locationsAtom,
  originStateAtom,
  originValueAtom,
  originOpenAtom,
  destStateAtom,
  destValueAtom,
  destOpenAtom,
  directionsStateAtom,
  isBlueDotDirectionAtom,
  isBlueDotDirection2Atom,
  directionsResultStateAtom,
  directionsCardOpenAtom,
} from "@/lib/atoms";

export default function Directions({
  positionRef,
  directionsServiceRef,
  directionsRendererRef,
}) {
  const mapsindoors = window.mapsindoors;
  const [directionsState, setDirectionsState] = useAtom(directionsStateAtom);
  const [locations, setLocations] = useAtom(locationsAtom);
  const [originState, setOriginState] = useAtom(originStateAtom);
  const [originValue, setOriginValue] = useAtom(originValueAtom);
  const [originOpen, setOriginOpen] = useAtom(originOpenAtom);
  const [destState, setDestState] = useAtom(destStateAtom);
  const [destValue, setDestValue] = useAtom(destValueAtom);
  const [destOpen, setDestOpen] = useAtom(destOpenAtom);
  const [isBlueDotDirection, setIsBlueDotDirection] = useAtom(
    isBlueDotDirectionAtom
  );
  const [isBlueDotDirection2, setIsBlueDotDirection2] = useAtom(
    isBlueDotDirection2Atom
  );
  const [directionsResultState, setDirectionsResultState] = useAtom(
    directionsResultStateAtom
  );
  const [directionsCardOpen, setDirectionsCardOpen] = useAtom(
    directionsCardOpenAtom
  );

  const handleDirections = (origin, destination) => {
    let originCoords;
    let destCoords;
    if (isBlueDotDirection) {
      setOriginState(null);
      setOriginValue("");
      originCoords = {
        lat: positionRef.current.coords.latitude,
        lng: positionRef.current.coords.longitude,
        floor: 0,
      };
    } else {
      originCoords = {
        lat: origin.properties.anchor.coordinates[1],
        lng: origin.properties.anchor.coordinates[0],
        floor: origin.properties.floor,
      };
    }
    if (isBlueDotDirection2) {
      setDestState(null);
      setDestValue("");
      destCoords = {
        lat: positionRef.current.coords.latitude,
        lng: positionRef.current.coords.longitude,
        floor: 0,
      };
    } else {
      destCoords = {
        lat: destination.properties.anchor.coordinates[1],
        lng: destination.properties.anchor.coordinates[0],
        floor: destination.properties.floor,
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
  };

  return (
    <Dialog
      open={directionsState}
      onOpenChange={(value) => {
        setDirectionsState(value);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Directions</DialogTitle>
          <DialogDescription>
            Select a starting point and a destination.
          </DialogDescription>
        </DialogHeader>
        <div className="flex">
          <Popover open={originOpen} onOpenChange={setOriginOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={isBlueDotDirection && !isBlueDotDirection2}
                role="combobox"
                aria-expanded={originOpen}
                className="w-[200px] justify-between"
                // className="w-[200px] justify-between absolute z-50 bottom-5 right-1/2 transform translate-x-1/2"
              >
                {originValue
                  ? locations.find(
                      (locationName) => locationName.value === originValue
                    )?.label
                  : originState
                  ? originState.properties.name
                  : "Search"}
                {/* <CommandShortcut>⌘K</CommandShortcut> */}
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
                          mapsindoors.services.LocationsService.getLocation(
                            locationName.locationid
                          ).then((location) => {
                            setOriginState(location);
                          });
                          setOriginValue(
                            currentValue === originValue ? "" : currentValue
                          );
                          setOriginOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            originValue === locationName.value
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

          <Switch
            checked={isBlueDotDirection}
            onCheckedChange={(change) => {
              if (isBlueDotDirection2) {
                setIsBlueDotDirection2(false);
              }
              setIsBlueDotDirection(change);
            }}
            className="ml-4 mt-2"
          />
          <Image
            priority
            src={blueDotIcon}
            alt="bluedot"
            className="h-[28px] w-[28px] ml-2 my-1"
          />
        </div>

        <MoveDown className="ml-[88px]" />

        {/* destination */}
        <div className="flex">
          <Popover open={destOpen} onOpenChange={setDestOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={!isBlueDotDirection && isBlueDotDirection2}
                role="combobox"
                aria-expanded={destOpen}
                className="w-[200px] justify-between"
                // className="w-[200px] justify-between absolute z-50 bottom-5 right-1/2 transform translate-x-1/2"
              >
                {destValue
                  ? locations.find(
                      (locationName) => locationName.value === destValue
                    )?.label
                  : destState
                  ? destState.properties.name
                  : "Search"}
                {/* <CommandShortcut>⌘K</CommandShortcut> */}
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
                          mapsindoors.services.LocationsService.getLocation(
                            locationName.locationid
                          ).then((location) => {
                            setDestState(location);
                          });
                          setDestValue(
                            currentValue === destValue ? "" : currentValue
                          );
                          setDestOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            destValue === locationName.value
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

          <Switch
            checked={isBlueDotDirection2}
            onCheckedChange={(change) => {
              if (isBlueDotDirection) {
                setIsBlueDotDirection(false);
              }
              setIsBlueDotDirection2(change);
            }}
            className="ml-4 mt-2"
          />
          <Image
            priority
            src={blueDotIcon}
            alt="bluedot"
            className="h-[28px] w-[28px] ml-2 my-1"
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              disabled={!originState && !isBlueDotDirection}
              onClick={() => {
                setDirectionsState(false);
                handleDirections(originState, destState);
              }}
            >
              Confirm
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
