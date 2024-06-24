var express = require("express");
const router = express.Router();

var {
  CreateEmployeeBenefit,
  GetEmployeeBenefit,
} = require("../../controller/employee/employee_benefit_controller");

router.post("/ec-CreateEmployeeBenefit", CreateEmployeeBenefit);
router.get("/ec-GetEmployeeBenefit", GetEmployeeBenefit);

module.exports = router;
