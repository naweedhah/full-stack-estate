import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const SMTP_SECURE = process.env.SMTP_SECURE === "true";
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;

let transporterPromise = null;

const hasEmailConfig = () =>
  Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && SMTP_FROM);

const getTransporter = async () => {
  if (!hasEmailConfig()) {
    return null;
  }

  if (!transporterPromise) {
    transporterPromise = Promise.resolve(
      nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_SECURE,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      }),
    );
  }

  return transporterPromise;
};

export const canSendEmail = () => hasEmailConfig();

export const sendNotificationEmail = async ({
  to,
  recipientName,
  title,
  message,
  metadata = {},
}) => {
  if (!to || !hasEmailConfig()) {
    return {
      delivered: false,
      reason: "missing-config-or-recipient",
    };
  }

  const transporter = await getTransporter();

  if (!transporter) {
    return {
      delivered: false,
      reason: "missing-transporter",
    };
  }

  const html = `
    <div style="font-family: Arial, sans-serif; color: #332d2a; line-height: 1.6;">
      <h2 style="margin-bottom: 12px;">${title}</h2>
      <p>Hello${recipientName ? ` ${recipientName}` : ""},</p>
      <p>${message}</p>
      ${
        metadata?.postId
          ? `<p style="color: #7e736d; font-size: 14px;">Reference listing: ${metadata.postId}</p>`
          : ""
      }
      <p style="margin-top: 24px;">BoardingFinder Alerts</p>
    </div>
  `;

  await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject: `[BoardingFinder] ${title}`,
    text: `${title}\n\n${message}`,
    html,
  });

  return {
    delivered: true,
  };
};
