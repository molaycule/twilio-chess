import { $gameConfigStep, $gameConfigData } from "../store";

export default function handleGameConfigStepChange({
  stepIndex,
  gameConfigDataKey,
  gameConfigDataValue
}) {
  $gameConfigStep.set(stepIndex);
  if (gameConfigDataKey && gameConfigDataValue) {
    $gameConfigData.setKey(gameConfigDataKey, gameConfigDataValue);
  }
}