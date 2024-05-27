var express = require("express");
const {
    GetDataOfLoggedInUser,
    GetSuperiorDataOfLoggedInUser,
    GetDataForCertainEmployee,
    GetSuperiorDataOfCertainUser,
} = require("../controller/employee_profile_controller");

const router = express.Router();

router.get("/ep-getDataOfLoggedInUser", GetDataOfLoggedInUser);
router.get("/ep-getSuperiorDataOfLoggedInUser", GetSuperiorDataOfLoggedInUser);
router.get("/ep-viewEmployee/:emp_id", GetDataForCertainEmployee)
router.get("/ep-viewEmployeeSuperior/:emp_id", GetSuperiorDataOfCertainUser)

module.exports = router;
