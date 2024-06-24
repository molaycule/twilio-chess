import { useStore } from "@nanostores/react";
import { $gameConfigData, $isLoading } from "../store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { MoveLeft } from "lucide-react";
import Spinner from "src/components/Spinner";
import handleGameConfigStepChange from "src/utils/handleGameConfigStepChange";
import constants from "src/constants";
import maskNumber from "src/utils/maskNumber";
import GameConfigHeading from "src/components/GameConfigHeading";
import { Label } from "@/components/ui/label";

export default function Contact() {
  const { toast } = useToast();
  const isLoading = useStore($isLoading);
  const gameConfigData = useStore($gameConfigData);

  const handleOnInputChange = e => {
    $gameConfigData.setKey("contact", e.target.value);
  };

  const handleSubmit = async () => {
    try {
      if (!gameConfigData.contact) {
        throw new Error("Please input the required information");
      }

      $isLoading.set(true);
      const response = await fetch(`${constants.baseURL}/api/chess/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setup: gameConfigData.setup,
          medium: gameConfigData.medium,
          contact: gameConfigData.contact
        })
      });

      if (!response.ok) {
        throw new Error("Failed to initiate chess game, try again later.");
      }

      const result = await response.json();
      handleGameConfigStepChange({
        stepIndex: 3,
        successTitle: result.message,
        successDescription: {
          whatsapp: "Check your WhatsApp to begin playing.",
          facebook:
            "To begin, send a message to Twilio Chess on Facebook Messenger."
        }[gameConfigData.medium]
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      $isLoading.set(false);
    }
  };

  return (
    <main className="flex flex-col justify-center items-center h-screen gap-4">
      <Card className="w-full max-w-sm">
        <GameConfigHeading />
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label>
              {
                {
                  whatsapp: "Whatsapp Number",
                  facebook: "Facebook User Id"
                }[gameConfigData.medium]
              }
            </Label>
            <Input
              id="contact-input"
              type={gameConfigData.medium === "whatsapp" ? "tel" : "text"}
              placeholder={
                gameConfigData.medium === "whatsapp"
                  ? "Phone Number"
                  : "User Id"
              }
              onChange={handleOnInputChange}
              disabled={gameConfigData.medium === "facebook"}
              value={
                gameConfigData.medium === "facebook"
                  ? maskNumber(gameConfigData.contact)
                  : gameConfigData.contact
              }
              required
            />
          </div>
        </CardContent>
        <CardFooter className="gap-4">
          <Button variant="secondary" className="w-full" onClick={handleSubmit}>
            {isLoading && <Spinner />}
            {isLoading ? "Initiating" : "Initiate"}
          </Button>
        </CardFooter>
      </Card>
      <Button
        variant="ghost"
        className="gap-2"
        disabled={isLoading}
        onClick={() =>
          handleGameConfigStepChange({
            stepIndex: 1,
            gameConfigDataKey: "contact",
            gameConfigDataValue: ""
          })
        }>
        <MoveLeft className="h-4 w-4" />
        Back
      </Button>
    </main>
  );
}
