var axios = require("axios");
var db = require("../../config.js");

function getAllPayItems(req, res) {
  var cid = req.session.user[0].company_id;

  const q = "SELECT * FROM pay_items WHERE company_id = " + cid;

  db.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function addPayItem(req, res) {
  var cid = req.session.user[0].company_id;
  const { name, category, type, group, tag_1601c } = req.body;
  const q =
    "INSERT INTO pay_items(company_id, pay_item_name, pay_item_category, pay_item_type, pay_item_group, pay_item_1601c_tag) VALUES(?, ?, ?, ?, ?, ?)";
  db.query(q, [cid, name, category, type, group, tag_1601c], (err, data) => {
    if (err) return res.json(err);
    return res.sendStatus(200);
  });
}

function updatePayItem(req, res) {
  const { name, category, type, group, tag_1601c } = req.body;
  const { id } = req.params;
  const q =
    "UPDATE pay_items SET pay_item_name = ?, pay_item_category = ?, pay_item_type = ?, pay_item_group = ?, pay_item_1601c_tag = ? WHERE pay_items_id = ?";
  db.query(q, [name, category, type, group, tag_1601c, id], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function deletePayItem(req, res) {
  const { id } = req.params;
  const q = "DELETE FROM pay_items WHERE pay_items_id = ?";
  db.query(q, id, (err, data) => {
    if (err) return res.json(err);
    return res.sendStatus(200);
  });
}

function CreateDefaultPayItemsForPH(req, res) {
  var compID = req.session.user[0].company_id;

  const query = `
    INSERT INTO pay_items (company_id, pay_item_name, pay_item_category, pay_item_type, pay_item_group, pay_item_1601c_tag) VALUES 
    (${compID}, 'Basic Pay', 'Earnings', 'Fixed', 'Taxable', ''),
    (${compID}, 'Night Differential', 'Earnings', 'Calculated', 'Taxable', ''),
    (${compID}, 'Regular OT', 'Earnings', 'Calculated', 'Taxable', ''),
    (${compID}, 'Regular Holiday OT', 'Earnings', 'Calculated', 'Taxable', ''),
    (${compID}, 'Special Holiday OT', 'Earnings', 'Calculated', 'Taxable', ''),
    (${compID}, 'Rest Day OT', 'Earnings', 'Calculated', 'Taxable', ''),
    (${compID}, 'Special Holiday Premium Pay', 'Earnings', 'Calculated', 'Taxable', ''),
    (${compID}, 'Regular Holiday Premium Pay', 'Earnings', 'Calculated', 'Taxable', ''),
    (${compID}, '13th Month Bonus - Taxable', 'Earnings', 'Calculated', 'Taxable', ''),
    (${compID}, '13th Month Bonus - Non-Taxable', 'Earnings', 'Calculated', 'Non-Taxable', ''),
    (${compID}, 'Absences', 'Deduction', 'Calculated', 'Pre-Tax Deductions', ''),
    (${compID}, 'Undertime/Tardiness', 'Deduction', 'Calculated', 'Pre-Tax Deductions', ''),
    (${compID}, 'SSS (EE)', 'Deduction', 'Calculated', 'Pre-Tax Deductions', ''),
    (${compID}, 'HDMF (EE)', 'Deduction', 'Calculated', 'Pre-Tax Deductions', ''),
    (${compID}, 'PHIC (EE)', 'Deduction', 'Calculated', 'Pre-Tax Deductions', ''),
    (${compID}, 'SSS Provident Fund (EE)', 'Deduction', 'Calculated', 'Pre-Tax Deductions', ''),
    (${compID}, 'SSS Loan', 'Deduction', 'Fixed', 'Post-Tax Deduction', ''),
    (${compID}, 'HDMF Loan', 'Deduction', 'Fixed', 'Post-Tax Deduction', ''),
    (${compID}, 'Salary Loan Repayment', 'Deduction', 'Fixed', 'Post-Tax Deduction', ''),
    (${compID}, 'SSS (ER)', 'Deduction', 'Calculated', 'Info Only', ''),
    (${compID}, 'SSS (ECC)', 'Deduction', 'Calculated', 'Info Only', ''),
    (${compID}, 'PHIC (ER)', 'Deduction', 'Calculated', 'Info Only', ''),
    (${compID}, 'HDMF (ER)', 'Deduction', 'Calculated', 'Info Only', ''),
    (${compID}, 'SSS Provident Fund (ER)', 'Deduction', 'Calculated', 'Info Only', ''),
    (${compID}, 'Tax Withheld', 'Taxes', 'Calculated', 'Taxes', ''),
    (${compID}, 'Tax Refund', 'Taxes', 'Manual', 'Post-Tax Addition', '')
  `;

  db.query(query, (err) => {
    if (err) return res.json(err);
    return res.sendStatus(200);
  });
}

module.exports = {
  getAllPayItems,
  addPayItem,
  updatePayItem,
  deletePayItem,
  CreateDefaultPayItemsForPH,
};
