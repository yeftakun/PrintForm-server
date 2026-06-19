const express = require("express");
const { asyncHandler } = require("../utils/asyncHandler");
const { getInstallerCatalog } = require("../repositories/installersRepository");

const router = express.Router();

router.get("/", asyncHandler(async (req, res) => {
  const catalog = await getInstallerCatalog();
  res.json(catalog);
}));

module.exports = router;
