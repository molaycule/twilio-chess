import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Crown } from "lucide-react";

export default function GameConfigHeading() {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2 justify-center">
        <Crown className="h-6 w-6" />
        <Label className="text-2xl">Chess Challenge</Label>
        <Crown className="h-6 w-6" />
      </CardTitle>
      <CardDescription className="text-center">
        Powered by Twilio and OpenAI
      </CardDescription>
    </CardHeader>
  );
}
