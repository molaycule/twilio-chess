import TwilioSDK from "twilio";

export default function handleTwilioResponse(res, reply) {
  const messageResponse = new TwilioSDK.twiml.MessagingResponse();
  messageResponse.message(reply);
  res.type("text/xml");
  res.send(messageResponse.toString());
}
