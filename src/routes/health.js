const express = require("express");
const { getRealtimeState } = require("../services/realtime");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    ok: true,
    realtime: getRealtimeState()
  });
});

module.exports = router;
