var express = require("express");
const router = express.Router();

var {
  CreateEmployeeContribution,
  GetEmployeeContribution,
  UpdateEmployeeContribution,
} = require("../../controller/employee/employee_benefit_controller");

router.post("/ec-CreateEmployeeContribution", CreateEmployeeContribution);
router.get("/ec-GetEmployeeContribution", GetEmployeeContribution);
router.get("/ec-UpdateEmployeeContribution", UpdateEmployeeContribution);

module.exports = router;
