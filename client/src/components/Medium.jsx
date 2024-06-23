import { useEffect } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import { Crown, Gamepad2, MoveLeft } from "lucide-react";
import handleGameConfigStepChange from "src/utils/handleGameConfigStepChange";

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
              <AlertTitle>Choose your medium</AlertTitle>
              <AlertDescription className="text-gray-400">
                You can play right in your WhatsApp chat or via email using our
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
