var express = require("express");
const router = express.Router();

var {
  CreateEmployeeContribution,
  GetEmployeeContribution,
  UpdateEmployeeContribution,
} = require("../../controller/employee/employee_contributions_controller");

router.post("/ec-CreateEmployeeContribution", CreateEmployeeContribution);
router.get("/ec-GetEmployeeContribution/:id", GetEmployeeContribution);
router.post("/ec-UpdateEmployeeContribution/:id", UpdateEmployeeContribution);

module.exports = router;
