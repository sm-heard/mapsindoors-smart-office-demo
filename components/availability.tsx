"use client";

import { useAtom } from "jotai";
import {
  buttonDisabledAnimationAtom,
  dateStateAtom,
  dateToIdsMapAtom,
} from "@/lib/atoms";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Calendar } from "@/components/ui/calendar";

export default function Availability({ mapsIndoorsRef, smallMeetingRoomRef, mediumMeetingRoomRef, workstationRef, parkingRef }) {
  const mapsindoors = window.mapsindoors;

  const [buttonDisabledAnimation, setButtonDisabledAnimation] = useAtom(
    buttonDisabledAnimationAtom
  );
  const [dateState, setDateState] = useAtom(dateStateAtom);
  const [dateToIdsMap] = useAtom(dateToIdsMapAtom);

  function retrieveIDsForDate(date) {
    const formattedDate = format(date, "yyyy-MM-dd");
    return dateToIdsMap[formattedDate] || [];
  }

  return (
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
  );
}
