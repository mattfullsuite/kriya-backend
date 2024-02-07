var express = require("express");
var imports =  {
    EmployeesList,
    ViewEmployee,
    DeactivatedAccounts,
    AllEmployees,
    RegularEmployees, 
    PartTimeEmployees,
    ProbationaryEmployees,
} = require( "../controller/employees_list_controller.js");

const router = express.Router()

router.get("/employeeslist", EmployeesList);
router.get("/viewEmployee/:emp_id", ViewEmployee);
router.get("/deactivatedAccounts", DeactivatedAccounts);
router.get("/allEmployees", AllEmployees);
router.get("/regularEmployees", RegularEmployees);
router.get("/parttimeEmployees", PartTimeEmployees);
router.get("/probationaryEmployees", ProbationaryEmployees);

module.exports = router;