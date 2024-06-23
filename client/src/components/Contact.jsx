import { useStore } from "@nanostores/react";
import { $gameConfigData } from "../store";
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Crown, MoveLeft } from "lucide-react";
import handleGameConfigStepChange from "src/utils/handleGameConfigStepChange";
import constants from "src/constants";

export default function Contact({ type }) {
  const { toast } = useToast();
  const gameConfigData = useStore($gameConfigData);

  const handleOnInputChange = e => {
    $gameConfigData.setKey("contact", e.target.value);
  };

  const handleSubmit = async () => {
    try {
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
      toast({
        title: result.message,
        description: {
          whatsapp: "Chess Challenge Awaiting! Check WhatsApp to Start Playing."
        }[gameConfigData.medium]
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  };

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
            <Input
              id="contact-input"
              type={type === "phone" ? "tel" : "email"}
              placeholder={type === "phone" ? "Phone Number" : "Email"}
              onChange={handleOnInputChange}
              value={gameConfigData.contact}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="gap-4">
          <Button variant="secondary" className="w-full" onClick={handleSubmit}>
            Submit
          </Button>
        </CardFooter>
      </Card>
      <Button
        variant="ghost"
        className="gap-2"
        onClick={() =>
          handleGameConfigStepChange({
            stepIndex: 1
          })
        }>
        <MoveLeft className="h-4 w-4" />
        Back
      </Button>
    </main>
  );
}
