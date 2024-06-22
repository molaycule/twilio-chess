import { z } from "zod";

const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const phoneRegex = /^\+?[1-9]\d{1,14}$/;

const emailOrPhoneSchema = z
  .string()
  .refine(value => emailRegex.test(value) || phoneRegex.test(value), {
    message: "Invalid email or phone number"
  });

export default emailOrPhoneSchema;
