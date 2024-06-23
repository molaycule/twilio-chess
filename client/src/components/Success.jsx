import { useStore } from "@nanostores/react";
import { $gameConfigData, $successDescription, $successTitle } from "../store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Swords } from "lucide-react";
import Whatsapp from "src/icons/Whatsapp";
import FacebookMessenger from "src/icons/FacebookMessenger";
import GameConfigHeading from "src/components/GameConfigHeading";

export default function Success() {
  const successTitle = useStore($successTitle);
  const successDescription = useStore($successDescription);
  const gameConfigData = useStore($gameConfigData);

  return (
    <main className="flex flex-col justify-center items-center h-screen gap-4">
      <Card className="w-full max-w-sm">
        <GameConfigHeading />
        {successTitle && successDescription && (
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Alert>
                <Swords className="h-4 w-4" />
                <AlertTitle>{successTitle}</AlertTitle>
                <AlertDescription className="text-gray-400">
                  {successDescription}
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        )}
        <CardFooter className="gap-4">
          {gameConfigData.medium === "whatsapp" && (
            <Button
              variant="secondary"
              className="w-full gap-2 bg-[#32BE2E] hover:bg-[#40C351]"
              onClick={() => {
                window.location.href = `https://wa.me/${
                  import.meta.env.PUBLIC_TWILIO_PHONE_NUMBER
                }`;
              }}>
              <Whatsapp />
              Play on Whatsapp
            </Button>
          )}
          {gameConfigData.medium === "facebook" && (
            <Button
              variant="secondary"
              className="w-full gap-2 bg-gradient-to-r from-[#3279FF] via-[#764EFF] to-[#FF6B65]"
              onClick={() => {
                window.location.href = `https://m.me/${
                  import.meta.env.PUBLIC_FACEBOOK_PAGE_ID
                }`;
              }}>
              <FacebookMessenger />
              Play on Facebook Messenger
            </Button>
          )}
        </CardFooter>
      </Card>
    </main>
  );
}
