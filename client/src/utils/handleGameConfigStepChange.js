import {
  $gameConfigStep,
  $gameConfigData,
  $successTitle,
  $successDescription
} from "../store";

export default function handleGameConfigStepChange({
  stepIndex,
  gameConfigDataKey,
  gameConfigDataValue,
  successTitle,
  successDescription
}) {
  const audio = new Audio("/chess-move.mp3");
  if (stepIndex !== undefined && stepIndex !== null) {
    $gameConfigStep.set(stepIndex);
    audio.play();
  }

  if (gameConfigDataKey) {
    $gameConfigData.setKey(gameConfigDataKey, gameConfigDataValue);
  }

  if (successTitle) {
    $successTitle.set(successTitle);
  }

  if (successDescription) {
    $successDescription.set(successDescription);
  }
}
