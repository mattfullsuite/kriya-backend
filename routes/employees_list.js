var express = require("express");
var imports =  {
    EmployeesList,
    ViewEmployee,
} = require( "../controller/employees_list_controller.js");

const router = express.Router()

router.get("/employeeslist", EmployeesList);
router.get("/viewEmployee/:emp_id", ViewEmployee);

module.exports = router;