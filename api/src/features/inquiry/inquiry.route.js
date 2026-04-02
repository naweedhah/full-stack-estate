const router = require("express").Router();
const { createInquiry, acceptInquiry } = require("./inquiry.controller");

router.post("/", createInquiry);
router.patch("/:id/accept", acceptInquiry);

module.exports = router;