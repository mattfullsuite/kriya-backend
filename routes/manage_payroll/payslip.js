var express = require("express");
const router = express.Router();

var imports = ({
  createPayslip,
  getUserPayslip,
} = require("../../controller/manage_payroll/payslip_controller"));

router.post("/mp-createPayslip", createPayslip);
router.get("/mp-getUserPayslip", getUserPayslip);
module.exports = router;
