import { MailjetEmailProvider } from "../../pkg/email/mailjet.js";
import { env } from "../config/env.js";

export const emailProvider = new MailjetEmailProvider({
    apiKey: env.email.mailjet.apiKey,
    secretKey: env.email.mailjet.secretKey,
    fromEmail: env.email.mailjet.fromEmail,
    fromName: env.email.mailjet.fromName
});