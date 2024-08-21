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

module.exports = {
  getAllPayItems,
  addPayItem,
  updatePayItem,
  deletePayItem,
};
