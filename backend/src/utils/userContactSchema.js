import { z } from "zod";

const fbUserIdRegex = /^[0-9]{1,20}$/;
const phoneRegex = /^\+?[1-9]\d{1,14}$/;

const userContactSchema = z
  .array(z.string())
  .length(2)
  .refine(
    ([type, value]) => {
      if (type === "facebook") {
        return fbUserIdRegex.test(value);
      }

      if (type === "whatsapp") {
        return phoneRegex.test(value);
      }
    },
    {
      message: "Invalid email or phone number"
    }
  );

export default userContactSchema;
