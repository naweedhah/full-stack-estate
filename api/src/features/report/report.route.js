const router = require("express").Router();
const { createReport } = require("./report.controller");

router.post("/", createReport);
router.post("/warn", controller.warnUser);

module.exports = router;