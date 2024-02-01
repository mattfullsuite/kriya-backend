var express = require("express");
var imports =  {
    CreateHoliday,
    DeleteHoliday,
    GetAllDivisions,
    GetAllDepartments,
    GetAllPositions,
    GetManagersAndRespectiveDepartments,
} = require( "../controller/preferences_controller.js");

const router = express.Router()

router.post('/addHoliday', CreateHoliday);
router.delete("/holiday/:h_id", DeleteHoliday);
router.get("/getAllDivisions", GetAllDivisions);
router.get("/getAllDepartments", GetAllDepartments);
router.get("/getAllPositions", GetAllPositions);
router.get("/getManagersInEmpDesignation",GetManagersAndRespectiveDepartments)

module.exports = router;