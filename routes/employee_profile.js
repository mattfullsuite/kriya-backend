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
  //Payrun End
} = require("../controller/employee_profile_controller");
const uploadMulter = require("../handlers/utilities/multerFileHandler");

const router = express.Router();

router.get("/ep-getDataOfLoggedInUser", GetDataOfLoggedInUser);
router.get("/ep-getSuperiorDataOfLoggedInUser", GetSuperiorDataOfLoggedInUser);
router.get("/ep-viewEmployee/:emp_id", GetDataForCertainEmployee);
router.get("/ep-viewEmployeeSuperior/:emp_id", GetSuperiorDataOfCertainUser);
router.post("/ep-offboardEmployee/:emp_id", OffboardEmployee);
router.post("/ep-addEmployee/", uploadMulter.single("emp_pic"), AddEmployee);
router.post("/ep-setPTO/:emp_id", EditEmployeePTO);
router.patch(
  "/ep-editEmployee/:emp_id",
  uploadMulter.single("emp_pic"),
  EditEmployee
);
/// Payrun Start
router.get(
  "/ep-getEmployeeInfoForUploadPayrun/:email",
  GetEmployeeInfoForUploadPayrun
);
router.get("/ep-getActiveEmployees", GetActiveEmployees);
//Payrun End

module.exports = router;
