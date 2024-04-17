"use client";

import { useAtom } from "jotai";
import { loginStateAtom, buttonDisabledAnimationAtom } from "@/lib/atoms";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function User() {
    const [loginState, setLoginState] = useAtom(loginStateAtom);
    const [buttonDisabledAnimation, setButtonDisabledAnimation] = useAtom(
      buttonDisabledAnimationAtom
    );

    return (
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
    );
    }