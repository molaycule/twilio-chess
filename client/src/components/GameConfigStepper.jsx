import { useStore } from "@nanostores/react";
import { $gameConfigStep } from "../store";
import Setup from "./Setup";
import Medium from "./Medium";
import Contact from "./Contact";

export default function GameConfigStepper() {
  const gameConfigStep = useStore($gameConfigStep);

  return (
    <>
      {gameConfigStep == 0 && <Setup />}
      {gameConfigStep == 1 && <Medium />}
      {gameConfigStep == 2 && <Contact type="phone" />}
    </>
  );
}
