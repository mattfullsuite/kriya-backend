var express = require("express");
const router = express.Router();

var {
  GetCompanyConfiguration,
  UpdateCompanyConfiguration,
} = require("../../controller/company/company_configuration_controller");

router.post("/cc-GetCompanyConfiguration", GetCompanyConfiguration);
router.get("/cc-UpdateCompanyConfiguration", UpdateCompanyConfiguration);

module.exports = router;
