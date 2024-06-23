const allowedOrigins = [
  "http://localhost:4321",
  "https://twilio-chess.pages.dev"
];

export default function getCorsOptions() {
  const corsOptions = {
    origin: function (origin, callback) {
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    }
  };
  return corsOptions;
}
