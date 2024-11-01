var express = require("express");
const {
  GetDataOfLoggedInUser,
  GetSuperiorDataOfLoggedInUser,
  GetDataForCertainEmployee,
  GetSuperiorDataOfCertainUser,
  OffboardEmployee,
  AddEmployee,
  EditEmployee,
  EditEmployeePTO,
  //Payrun Start
  GetEmployeeInfoForUploadPayrun,
  GetActiveEmployees,
  GetEmploymentRecords,
  //Payrun End
} = require("../controller/employee_profile_controller");
const {
  CreateEmployeeContribution,
  UpdateEmployeeContribution,
} = require("../controller/employee/employee_contributions_controller");
const {
  CreateEmployeeSalary,
} = require("../controller/employee/employee_salary_controller");

const uploadMulter = require("../handlers/utilities/multerFileHandler");

const router = express.Router();

router.get("/ep-getDataOfLoggedInUser", GetDataOfLoggedInUser);
router.get("/ep-getSuperiorDataOfLoggedInUser", GetSuperiorDataOfLoggedInUser);
router.get("/ep-viewEmployee/:emp_id", GetDataForCertainEmployee);
router.get("/ep-viewEmployeeSuperior/:emp_id", GetSuperiorDataOfCertainUser);
router.post("/ep-offboardEmployee/:emp_id", OffboardEmployee);
router.post(
  "/ep-addEmployee/",
  uploadMulter.single("emp_pic"),
  AddEmployee,
  CreateEmployeeSalary,
  CreateEmployeeContribution
);

router.post("/ep-setPTO/:emp_id", EditEmployeePTO);
router.patch(
  "/ep-editEmployee/:emp_id",
  uploadMulter.single("emp_pic"),
  EditEmployee,
  CreateEmployeeSalary,
  UpdateEmployeeContribution
);
/// Payrun Start
router.get(
  "/ep-getEmployeeInfoForUploadPayrun/:empID",
  GetEmployeeInfoForUploadPayrun
);
router.get("/ep-getActiveEmployees", GetActiveEmployees);
//Payrun End

router.get("/ep-getEmployeeRecords/:emp_id", GetEmploymentRecords);

module.exports = router;
