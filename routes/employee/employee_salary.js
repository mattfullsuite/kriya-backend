var express = require("express");
const router = express.Router();

var {
  CreateEmployeeSalary,
} = require("../../controller/employee/employee_salary_controller");

router.post("/es-CreateEmployeeSalary", CreateEmployeeSalary);
