var express = require("express");
const router = express.Router();

var {
  GetDivisions,
} = require("../../controller/company/company_divisions_controller.js");

router.get("/comp-GetDivisions", GetDivisions);

module.exports = router;
