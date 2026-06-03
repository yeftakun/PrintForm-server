const { isUserSuspended } = require("../utils/suspension");

function rejectSuspendedMitra(req, res, next) {
  if (!req.user || !isUserSuspended(req.user)) {
    next();
    return;
  }

  res.status(403).json({
    error: "Akun mitra sedang disuspend. Hubungi admin untuk mengaktifkan kembali.",
    code: "ACCOUNT_SUSPENDED"
  });
}

module.exports = {
  rejectSuspendedMitra
};
