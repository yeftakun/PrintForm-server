const {
  MAIL_FROM_NAME,
  PASSWORD_RESET_TOKEN_TTL_MINUTES
} = require("../config");

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildPasswordResetEmail({
  resetUrl,
  userName,
  expiresInMinutes = PASSWORD_RESET_TOKEN_TTL_MINUTES
}) {
  const appName = MAIL_FROM_NAME || "PrintForm";
  const safeAppName = escapeHtml(appName);
  const safeResetUrl = escapeHtml(resetUrl);
  const greetingName = userName ? ` ${userName}` : "";

  return {
    subject: `Reset password ${appName}`,
    text: [
      `Halo${greetingName},`,
      "",
      `Kami menerima permintaan reset password untuk akun ${appName}.`,
      `Gunakan link berikut untuk membuat password baru: ${resetUrl}`,
      "",
      `Link ini berlaku selama ${expiresInMinutes} menit.`,
      "Jika Anda tidak meminta reset password, abaikan email ini."
    ].join("\n"),
    html: [
      "<!doctype html>",
      "<html>",
      "<body>",
      `<p>Halo${userName ? ` ${escapeHtml(userName)}` : ""},</p>`,
      `<p>Kami menerima permintaan reset password untuk akun ${safeAppName}.</p>`,
      `<p><a href="${safeResetUrl}">Reset password</a></p>`,
      `<p>Link ini berlaku selama ${escapeHtml(expiresInMinutes)} menit.</p>`,
      "<p>Jika Anda tidak meminta reset password, abaikan email ini.</p>",
      "</body>",
      "</html>"
    ].join("")
  };
}

module.exports = {
  buildPasswordResetEmail
};
