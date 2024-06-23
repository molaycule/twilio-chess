import OpenAI from "src/icons/OpenAI";
import Twilio from "src/icons/Twilio";

export default function Logos() {
  return (
    <div className="absolute w-full h-10 top-10 flex justify-center gap-4">
      <Twilio />
      <OpenAI />
    </div>
  );
}
