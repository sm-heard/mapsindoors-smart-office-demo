"use client";

import { useAtom } from "jotai";
import {
  directionsCardOpenAtom,
  directionsResultStateAtom,
  destStateAtom,
  originStateAtom,
} from "@/lib/atoms";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


export default function DirectionsCard({ directionsRendererRef }) {
    const [directionsCardOpen, setDirectionsCardOpen] = useAtom(directionsCardOpenAtom);
    const [directionsResultState, setDirectionsResultState] = useAtom(directionsResultStateAtom);
    const [destState, setDestState] = useAtom(destStateAtom);
    const [originState, setOriginState] = useAtom(originStateAtom);

    return (
        <>
        {directionsCardOpen && (
            <Card className="absolute z-50 bottom-5 transform-none right-8 left-8 md:right-1/2 md:left-auto md:transform md:translate-x-1/2 bg-primary text-white opacity-55">
              <CardHeader>
                <CardTitle className="flex justify-evenly">
                  {originState ? originState.properties.name : "My Position"}{" "}
                  &#x2192; {destState ? destState.properties.name : "My Position"}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-evenly">
                <div className="mr-1">
                  Distance: {directionsResultState.legs[0].distance.value + " ft."}
                </div>
                <div className="">
                  Duration: {directionsResultState.legs[0].duration.value + " sec."}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button
                  variant="secondary"
                  onClick={() => {
                    directionsRendererRef.current.setRoute(null);
                    setDirectionsCardOpen(false);
                  }}
                >
                  End Route
                </Button>
              </CardFooter>
            </Card>
          )}
        </>
    );
}
