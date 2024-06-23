import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Gamepad2 } from "lucide-react";
import handleGameConfigStepChange from "src/utils/handleGameConfigStepChange";
import GameConfigHeading from "src/components/GameConfigHeading";

export default function GameConfigStepper() {
  return (
    <main className="flex flex-col justify-center items-center h-screen gap-4">
      <Card className="w-full max-w-sm">
        <GameConfigHeading />
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Alert>
              <Gamepad2 className="h-4 w-4" />
              <AlertTitle>Choose your setup</AlertTitle>
              <AlertDescription className="text-gray-400">
                Begin a new game with a classic starting position or a
                randomized board layout
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
        <CardFooter className="gap-4">
          <Button
            variant="secondary"
            className="w-full"
            onClick={() =>
              handleGameConfigStepChange({
                stepIndex: 1,
                gameConfigDataKey: "setup",
                gameConfigDataValue: "clean"
              })
            }>
            Clean Start
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() =>
              handleGameConfigStepChange({
                stepIndex: 1,
                gameConfigDataKey: "setup",
                gameConfigDataValue: "random"
              })
            }>
            Random Start
          </Button>
        </CardFooter>
      </Card>
      <div className="invisible h-10"></div>
    </main>
  );
}
