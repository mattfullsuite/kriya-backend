var express = require("express");
const router = express.Router();

var {
  GetCompanyConfiguration,
  UpdateCompanyConfiguration,
  CreateDefaultCompanyConfiguration,
} = require("../../controller/company/company_configuration_controller");

router.get(
  "/comp-config-GetCompanyConfiguration/:configuration_name",
  GetCompanyConfiguration
);
router.patch(
  "/comp-config-UpdateCompanyConfiguration/:id",
  UpdateCompanyConfiguration
);

router.post(
  "/comp-config-CreateDefaultCompanyConfiguration/:configurationName",
  CreateDefaultCompanyConfiguration
);

module.exports = router;
