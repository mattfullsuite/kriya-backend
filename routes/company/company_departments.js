var express = require("express");
const router = express.Router();

var {
  GetDepartments,
} = require("../../controller/company/company_departments_controller.js");

router.get("/comp-GetDepartments", GetDepartments);

module.exports = router;
