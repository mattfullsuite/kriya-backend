var express = require("express");
const router = express.Router();

const {
  createPayslip,
} = require("../../controller/manage_payroll/payslip_controller");

var imports = {
  createPayslip,
};

router.post("/mp-createPayslip", createPayslip);
module.exports = router;
