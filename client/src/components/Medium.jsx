import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { Gamepad2, MoveLeft } from "lucide-react";
import handleGameConfigStepChange from "src/utils/handleGameConfigStepChange";
import GameConfigHeading from "src/components/GameConfigHeading";

export default function Medium() {
  const { toast } = useToast();

  const handleFBLogin = () => {
    window.FB.login(response => {
      if (response.authResponse) {
        window.FB.api("/me", function (response) {
          handleGameConfigStepChange({
            stepIndex: 2,
            gameConfigDataKey: "medium",
            gameConfigDataValue: "facebook"
          });
          handleGameConfigStepChange({
            gameConfigDataKey: "contact",
            gameConfigDataValue: response.id
          });
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "User cancelled login or did not fully authorize."
        });
      }
    });
  };

  useEffect(() => {
    if (window.FB) {
      window.FB.init({
        appId: "444652281769824",
        xfbml: true,
        version: "v20.0"
      });
    }
  });

  return (
    <main className="flex flex-col justify-center items-center h-screen gap-4">
      <Card className="w-full max-w-sm">
        <GameConfigHeading />
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Alert>
              <Gamepad2 className="h-4 w-4" />
              <AlertTitle>Choose your medium</AlertTitle>
              <AlertDescription className="text-gray-400">
                Play directly in WhatsApp or Facebook Messenger through our
                Twilio integration.
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
                stepIndex: 2,
                gameConfigDataKey: "medium",
                gameConfigDataValue: "whatsapp"
              })
            }>
            Twilio Whatsapp
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleFBLogin}>
            Twilio Facebook
          </Button>
        </CardFooter>
      </Card>
      <Button
        variant="ghost"
        className="gap-2"
        onClick={() =>
          handleGameConfigStepChange({
            stepIndex: 0
          })
        }>
        <MoveLeft className="h-4 w-4" />
        Back
      </Button>
    </main>
  );
}
