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

  res.status(statusCode).json({ error: message });
}

module.exports = {
  errorHandler
};
