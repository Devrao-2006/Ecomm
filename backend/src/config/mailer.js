import nodemailer from "nodemailer";
import { env } from "./env.js";
import { logger } from "../core/utils/logger.js";

let _transporter = null;

async function getTransporter() {
  if (_transporter) return _transporter;

  if (env.emailUser && env.emailPass) {
    _transporter = nodemailer.createTransport({
      host: env.emailHost,
      port: env.emailPort,
      secure: env.emailPort === 465,
      auth: {
        user: env.emailUser,
        pass: env.emailPass,
      },
    });
    logger.info(`[Mailer] Using SMTP: ${env.emailHost}:${env.emailPort}`);
  } else {
    const testAccount = await nodemailer.createTestAccount();
    _transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    logger.warn(
      "[Mailer] No SMTP credentials set – using Ethereal test account. " +
        `Login at https://ethereal.email (user: ${testAccount.user})`,
    );
  }

  return _transporter;
}

export async function sendMail({ to, subject, html, text }) {
  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: env.emailFrom,
      to,
      subject,
      html,
      text,
    });

    if (nodemailer.getTestMessageUrl(info)) {
      logger.info(`[Mailer] Preview: ${nodemailer.getTestMessageUrl(info)}`); // Ethereal preview link
    } else {
      logger.info(`[Mailer] Message sent to ${to} (id: ${info.messageId})`);
    }
  } catch (err) {
    logger.error("[Mailer] Failed to send email:", err.message);
    // do not rethrow to prevent request crash
  }
}
