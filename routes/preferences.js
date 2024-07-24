var express = require("express");

var imports = ({
  CreateHoliday,
  DeleteHoliday,
  GetAllDivisions,
  GetAllDepartments,
  GetAllPositions,
  GetManagersAndRespectiveDepartments,

  //HR ACCESS
  InsertHRAccessData,
  GetHRAccessData,
  UpdateHRAccess,
  GetMyHRAccessData,
  GetAllEmployeesFromCompanyNotHR,
  MakeAnEmployeeHR
} = require("../controller/preferences_controller.js"));

const router = express.Router();

router.post("/addHoliday", CreateHoliday);
router.delete("/holiday/:h_id", DeleteHoliday);
router.get("/getAllDivisions", GetAllDivisions);
router.get("/getAllDepartments", GetAllDepartments);
router.get("/getAllPositions", GetAllPositions);
router.get("/getManagersInEmpDesignation", GetManagersAndRespectiveDepartments);

//HR ACCESS
router.post("/pref-insertHRAccessData", InsertHRAccessData);
router.get("/pref-getHRAccessData", GetHRAccessData);
router.post("/pref-controlHRAccess", UpdateHRAccess);
router.get("/pref-getMyAccessData", GetMyHRAccessData);
router.get("/pref-getAllNonHREmployees", GetAllEmployeesFromCompanyNotHR);
router.post("/pref-makeSomeoneHR", MakeAnEmployeeHR);

module.exports = router;
