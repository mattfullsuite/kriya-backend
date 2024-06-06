var express = require("express");
const router = express.Router();

var {
  CreateEmployeeCompensation,
  GetEmployeeCompensation,
} = require("../../controller/employee/employee_compensation_controller");

router.post("/ec-CreateEmployeeCompensation", CreateEmployeeCompensation);
router.get("/ec-GetEmployeeCompensation", GetEmployeeCompensation);

module.exports = router;
