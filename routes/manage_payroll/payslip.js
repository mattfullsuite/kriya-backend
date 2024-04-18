var express = require("express");
const router = express.Router();

var imports = ({
  createPayslip,
  getUserPayslip,
  getUserYTD,
} = require("../../controller/manage_payroll/payslip_controller"));

router.post("/mp-createPayslip", createPayslip);
router.get("/mp-getUserPayslip", getUserPayslip);
router.get("/mp-getUserYTD", getUserYTD);
module.exports = router;
