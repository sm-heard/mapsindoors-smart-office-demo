"use client";

import { useEffect } from "react";
import { useAtom } from "jotai";
import {
  buttonDisabledAnimationAtom,
  openAtom,
  valueAtom,
  locationsAtom,
} from "@/lib/atoms";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandInput,
  CommandShortcut,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SearchBox({
  directionsRendererRef,
  mapboxMapRef,
  mapViewOptions,
  handleClick,
}) {
  const mapsindoors = window.mapsindoors;

  const [buttonDisabledAnimation, setButtonDisabledAnimation] = useAtom(
    buttonDisabledAnimationAtom
  );
  const [open, setOpen] = useAtom(openAtom);
  const [value, setValue] = useAtom(valueAtom);
  const [locations, setLocations] = useAtom(locationsAtom);

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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={buttonDisabledAnimation}
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between absolute z-50 top-16 left-8"
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
          <CommandEmpty>No location found.</CommandEmpty>
          <CommandGroup>
            <ScrollArea className="h-40">
              {locations.map((locationName) => (
                <CommandItem
                  key={locationName.value}
                  value={locationName.value}
                  onSelect={(currentValue) => {
                    directionsRendererRef.current.setRoute(null);
                    mapsindoors.services.LocationsService.getLocation(
                      locationName.locationid
                    ).then((location) => {
                      const destCoords = {
                        lat: location.properties.anchor.coordinates[1],
                        lng: location.properties.anchor.coordinates[0],
                      };
                      mapboxMapRef.current.flyTo({
                        center: [destCoords.lng, destCoords.lat],
                        zoom: 21,
                        pitch: mapViewOptions.pitch,
                        bearing: mapboxMapRef.current.getBearing() + 90,
                        duration: 3500,
                      });
                      handleClick(location);
                    });
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === locationName.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {locationName.label}
                </CommandItem>
              ))}
            </ScrollArea>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
