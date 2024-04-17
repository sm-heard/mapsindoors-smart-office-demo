"use client";

import { useAtom } from "jotai";
import { loginStateAtom, buttonDisabledAnimationAtom } from "@/lib/atoms";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPinned, Building } from "lucide-react";
import { toast } from "sonner";

export default function Login({ mapboxMapRef, mapViewOptions }) {
  const [loginState, setLoginState] = useAtom(loginStateAtom);
  const [buttonDisabledAnimation, setButtonDisabledAnimation] = useAtom(
    buttonDisabledAnimationAtom
  );

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const goToVenue = async () => {
    const mapboxMap = mapboxMapRef.current;

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
    toast.dismiss();
  };

  return (
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
  );
}
