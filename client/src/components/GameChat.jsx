import { useState } from "react";
import { useStore } from "@nanostores/react";
import { $isLoading } from "../store";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { MoveLeft } from "lucide-react";
import constants from "src/constants";
import GameConfigHeading from "src/components/GameConfigHeading";
import handleGameConfigStepChange from "src/utils/handleGameConfigStepChange";

export default function GameChat() {
  const isLoading = useStore($isLoading);
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [chatbotMessage, setChatbotMessage] = useState("");

  const handleSendMessage = async () => {
    try {
      if (!message) {
        throw new Error("Please type in your message");
      }

      $isLoading.set(true);
      const response = await fetch(
        `${constants.baseURL}/api/chess/twilio/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message })
        }
      );

      if (!response.ok) {
        throw new Error("Failed to process your message, try again later.");
      }

      const result = await response.json();
      setChatbotMessage(result.message);
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
          <div className="flex flex-col gap-8">
            {chatbotMessage && (
              <div className="max-h-80 overflow-auto">
                <Label>{chatbotMessage}</Label>
              </div>
            )}
            <Textarea
              rows={3}
              placeholder="Enter your message to learn more about chess"
              onChange={e => setMessage(e.target.value)}
              value={message}
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="gap-4">
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleSendMessage}
            disabled={isLoading}>
            Send Message
          </Button>
        </CardFooter>
      </Card>
      <Button
        variant="ghost"
        className="gap-2"
        disabled={isLoading}
        onClick={() => handleGameConfigStepChange({ stepIndex: 3 })}>
        <MoveLeft className="h-4 w-4" />
        Back
      </Button>
    </main>
  );
}
