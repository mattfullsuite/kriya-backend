var express = require("express");
var imports =  {
    EmployeesList,
    ViewEmployee,
    DeactivatedAccounts,
    AllEmployees,
    RegularEmployees, 
    PartTimeEmployees,
    ProbationaryEmployees,
    AllEmployeesList,
    NewEmployeesList,
    SeparatedEmployeesList,
} = require( "../controller/employees_list_controller.js");

const router = express.Router()

router.get("/employeeslist", EmployeesList);
router.get("/viewEmployee/:emp_id", ViewEmployee);
router.get("/deactivatedAccounts", DeactivatedAccounts);
router.get("/allEmployees", AllEmployees);
router.get("/regularEmployees", RegularEmployees);
router.get("/parttimeEmployees", PartTimeEmployees);
router.get("/probationaryEmployees", ProbationaryEmployees);
router.get("/em-allEmployees", AllEmployeesList);
router.get("/em-newEmployees", NewEmployeesList);
router.get("/em-separatedEmployees", SeparatedEmployeesList)

module.exports = router;