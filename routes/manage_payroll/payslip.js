var express = require("express");
const router = express.Router();

var imports = ({
  createPayslip,
  getUserPayslip,
  getUserYTD,
  getAllPaySlipGroups,
  getAllPaySlip,
} = require("../../controller/manage_payroll/payslip_controller"));

router.post("/mp-createPayslip", createPayslip);
router.get("/mp-getUserPayslip", getUserPayslip);
router.get("/mp-getUserYTD", getUserYTD);
router.get("/mp-getAllPayslipGroups", getAllPaySlipGroups);
router.get("/mp-getAllPayslip", getAllPaySlip);

module.exports = router;
