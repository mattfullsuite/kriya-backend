var express = require("express");
const router = express.Router();

var {
  GetCompanyConfiguration,
  UpdateCompanyConfiguration,
} = require("../../controller/company/company_configuration_controller");

router.get("/comp-config-GetCompanyConfiguration", GetCompanyConfiguration);
router.patch(
  "/comp-config-UpdateCompanyConfiguration/:id",
  UpdateCompanyConfiguration
);

module.exports = router;
