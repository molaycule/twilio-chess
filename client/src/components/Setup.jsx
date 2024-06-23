import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Crown, Gamepad2 } from "lucide-react";
import handleGameConfigStepChange from "src/utils/handleGameConfigStepChange";

export default function GameConfigStepper() {
  return (
    <main className="flex flex-col justify-center items-center h-screen gap-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-center">
            <Crown className="h-6 w-6" />
            <Label className="text-2xl">Chess Challenge</Label>
            <Crown className="h-6 w-6" />
          </CardTitle>
          <CardDescription className="text-center">
            Powered by Twilio & OpenAI
          </CardDescription>
        </CardHeader>
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