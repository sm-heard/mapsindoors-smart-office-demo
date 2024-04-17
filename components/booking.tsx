"use client";

import { useAtom } from "jotai";
import {
  bookingStateAtom,
  dateStateAtom,
  selectedLocationAtom,
  calendarOpenAtom,
  dateToIdsMapAtom,
} from "@/lib/atoms";
import { format } from "date-fns";
import {
  Dialog,
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
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export default function Booking({
  mapsIndoorsRef,
  smallMeetingRoomRef,
  mediumMeetingRoomRef,
  workstationRef,
  parkingRef,
}) {
  const mapsindoors = window.mapsindoors;
  const [bookingState, setBookingState] = useAtom(bookingStateAtom);
  const [dateState, setDateState] = useAtom(dateStateAtom);
  const [selectedLocation, setSelectedLocation] = useAtom(selectedLocationAtom);
  const [calendarOpen, setCalendarOpen] = useAtom(calendarOpenAtom);
  const [dateToIdsMap, setDateToIdsMap] = useAtom(dateToIdsMapAtom);

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
    const formattedDate = format(date, "yyyy-MM-dd");
    return dateToIdsMap[formattedDate] || [];
  }

  return (
    <Dialog
      open={bookingState}
      onOpenChange={(value) => {
        setBookingState(value);
      }}
    >
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
              {dateState ? format(dateState, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dateState}
              onSelect={(date) => {
                mapsIndoorsRef.current.revertDisplayRule(
                  retrieveIDsForDate(dateState)
                );
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
              disabled={
                selectedLocation &&
                retrieveIDsForDate(dateState).includes(selectedLocation.id)
              }
              onClick={() => {
                saveIDsForDate(selectedLocation.id);
                mapsIndoorsRef.current.overrideDisplayRule(
                  selectedLocation.id,
                  selectedLocation.properties.type === "MeetingRoom Small"
                    ? smallMeetingRoomRef.current
                    : selectedLocation.properties.type === "MeetingRoom Medium"
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
  );
}
