import TwilioSDK from "twilio";

export default function handleTwilioResponseWithMedia(res, body, mediaUrl) {
  const messageResponse = new TwilioSDK.twiml.MessagingResponse();
  const message = messageResponse.message();
  message.body(body);
  message.media(mediaUrl);
  res.type("text/xml");
  res.send(messageResponse.toString());
}
