import { useEffect, useMemo } from "react";
import { useStore } from "@nanostores/react";
import { $gameConfigStep } from "../store";
import Setup from "./Setup";
import Medium from "./Medium";
import Contact from "./Contact";

export default function GameConfigStepper() {
  const gameConfigStep = useStore($gameConfigStep);
  const stepFromUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return 0;
    }
    const params = new URLSearchParams(window.location.search);
    return params.get("step");
  });

  useEffect(() => {
    if (stepFromUrl) {
      $gameConfigStep.set(parseInt(stepFromUrl));
    }
  }, []);

  return (
    <>
      {gameConfigStep == 0 && <Setup />}
      {gameConfigStep == 1 && <Medium />}
      {gameConfigStep == 2 && <Contact type="phone" />}
    </>
  );
}
