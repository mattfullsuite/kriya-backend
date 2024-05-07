var express = require("express");
const {
  createDispute,
  viewDisputes,
} = require("../controller/dispute_controller");

const router = express.Router();

router.post("/d-createDispute", createDispute);
router.get("/d-getAlldispute", viewDisputes);
