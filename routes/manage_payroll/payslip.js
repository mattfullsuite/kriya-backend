var express = require("express");
const router = express.Router();

var imports = ({
  createPayslip,
  getUserPayslip,
  getUserYTD,
  getAllPaySlipGroups,
  getAllPaySlip,
  getPayslipsUsingFilter,
  getEmployeeListUsingFilter,
  getEmployeePayslipCurrentYear,
  getActiveEmployeeAndSalary,
  getOffBoardingEmployees,
  checkForDraftedPayslip,
  deleteDraftedPayslips,
} = require("../../controller/manage_payroll/payslip_controller"));

router.post("/mp-createPayslip/:source", createPayslip);
router.get("/mp-getUserPayslip", getUserPayslip);
router.get("/mp-getUserYTD", getUserYTD);
router.get("/mp-getAllPayslipGroups", getAllPaySlipGroups);
router.get("/mp-getAllPayslip", getAllPaySlip);
router.get("/mp-getPayslipsUsingFilter", getPayslipsUsingFilter);
router.get("/mp-getEmployeeUsingFilter", getEmployeeListUsingFilter);
router.get(
  "/mp-getEmployeePayslipCurrentYear/:empID",
  getEmployeePayslipCurrentYear
);
router.get("/mp-getActiveEmployeeAndSalary/", getActiveEmployeeAndSalary);
router.get("/mp-getOffBoardingEmployees", getOffBoardingEmployees);
router.get("/mp-checkForDraftedPayslip", checkForDraftedPayslip);
router.delete("/mp-deleteDraftedPayslips", deleteDraftedPayslips);

module.exports = router;
