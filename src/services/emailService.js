const nodemailer = require("nodemailer");
const {
  MAIL_DRIVER,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  MAIL_FROM_NAME,
  MAIL_FROM_ADDRESS
} = require("../config");

let smtpTransporter = null;

function buildFromAddress() {
  return {
    name: MAIL_FROM_NAME,
    address: MAIL_FROM_ADDRESS
  };
}

function getSmtpTransporter() {
  if (!SMTP_HOST) {
    throw new Error("SMTP_HOST is required when MAIL_DRIVER=smtp");
  }

  if (!smtpTransporter) {
    const transportConfig = {
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE
    };

    if (SMTP_USER || SMTP_PASS) {
      transportConfig.auth = {
        user: SMTP_USER,
        pass: SMTP_PASS
      };
    }

    smtpTransporter = nodemailer.createTransport(transportConfig);
  }

  return smtpTransporter;
}

async function sendEmail({ to, subject, text, html }) {
  const message = {
    from: buildFromAddress(),
    to,
    subject,
    text,
    html
  };

  if (MAIL_DRIVER === "log") {
    console.log("[email:log]", {
      ...message,
      from: `${MAIL_FROM_NAME} <${MAIL_FROM_ADDRESS}>`
    });

    return {
      messageId: "log",
      accepted: Array.isArray(to) ? to : [to],
      rejected: []
    };
  }

  if (MAIL_DRIVER === "smtp") {
    return getSmtpTransporter().sendMail(message);
  }

  throw new Error(`Unsupported MAIL_DRIVER: ${MAIL_DRIVER}`);
}

module.exports = {
  sendEmail
};
