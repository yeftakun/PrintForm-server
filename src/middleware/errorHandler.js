function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }

  const statusCode = Number(err?.statusCode) || 500;
  const message = statusCode >= 500 ? "Internal Server Error" : (err?.message || "Request failed");

  console.error(
    JSON.stringify({
      level: "error",
      msg: "request_error",
      reqId: req?.id || null,
      method: req?.method || null,
      path: req?.originalUrl || null,
      status: statusCode,
      error: err?.message || String(err)
    })
  );

  const payload = { error: message };
  if (statusCode < 500 && err?.code) {
    payload.code = err.code;
  }

  res.status(statusCode).json(payload);
}

module.exports = {
  errorHandler
};
