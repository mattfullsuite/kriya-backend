var express = require("express");
var uploadMulter = require("../handlers/utilities/multerFileHandler.js");
var imports = ({
  CreateHoliday,
  CreateCompany,
  DeleteHoliday,
  GetAllDivisions,
  GetAllDepartments,
  GetAllPositions,
  GetManagersAndRespectiveDepartments,
} = require("../controller/preferences_controller.js"));

const router = express.Router();

router.post(
  "/addNewCompany",
  uploadMulter.single("company_logo"),
  CreateCompany
);
router.post("/addHoliday", CreateHoliday);
router.delete("/holiday/:h_id", DeleteHoliday);
router.get("/getAllDivisions", GetAllDivisions);
router.get("/getAllDepartments", GetAllDepartments);
router.get("/getAllPositions", GetAllPositions);
router.get("/getManagersInEmpDesignation", GetManagersAndRespectiveDepartments);

module.exports = router;
