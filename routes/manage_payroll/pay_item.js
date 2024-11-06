var express = require("express");
var imports = ({
  getAllPayItems,
  addPayItem,
  updatePayItem,
  deletePayItem,
  CreateDefaultPayItemsForPH,
} = require("../../controller/manage_payroll/pay_item_controller.js"));

const router = express.Router();

router.get("/mp-getPayItem", getAllPayItems);
router.post("/mp-addPayItem", addPayItem);
router.patch("/mp-updatePayItem/:id", updatePayItem);
router.delete("/mp-deletePayItem/:id", deletePayItem);
router.post("/mp-CreateDefaultPayItemsForPH", CreateDefaultPayItemsForPH);
module.exports = router;
