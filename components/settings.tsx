"use client";

import { useAtom } from "jotai";
import { lightPresetAtom, buttonDisabledAnimationAtom } from "@/lib/atoms";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sunrise, Sun, Sunset, Moon, Box, Diamond } from "lucide-react";
import { Settings as SettingsIcon } from "lucide-react";

export default function Settings({ mapboxMapRef }) {
  const [lightPresetState, setLightPresetState] = useAtom(lightPresetAtom);
  const [buttonDisabledAnimation, setButtonDisabledAnimation] = useAtom(
    buttonDisabledAnimationAtom
  );
  
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          size="icon"
          className="absolute z-50 top-32 right-8"
          disabled={buttonDisabledAnimation}
        >
          <SettingsIcon />
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
  );
}
