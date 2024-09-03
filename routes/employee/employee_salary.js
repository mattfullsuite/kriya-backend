var express = require("express");
const router = express.Router();

var {
  CreateEmployeeSalary,
  GetEmployeeSalary,
  GetEmployeeLastSalaryIncrease,
} = require("../../controller/employee/employee_salary_controller");

router.post("/es-CreateEmployeeSalary", CreateEmployeeSalary);
router.get("/es-GetEmployeeSalary/:emp_id", GetEmployeeSalary);
router.get(
  "/es-GetEmployeeLastSalaryIncrease/:emp_id",
  GetEmployeeLastSalaryIncrease
);

module.exports = router;
