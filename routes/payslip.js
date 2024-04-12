var express = require("express");
const router = express.Router();

const { createPayslip } = require("../controller/payslip_conroller");

var imports = {
  createPayslip,
};

router.post("/mp-createPayslip", createPayslip);
module.exports = router;
