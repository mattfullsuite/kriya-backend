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
  const { name, category, computationTable } = req.body;
  const q =
    "INSERT INTO pay_items(company_id, pay_item_name, pay_item_category, computation_table) VALUES(?, ?, ?, ?)";
  db.query(
    q,
    [cid, name, category, JSON.stringify(computationTable)],
    (err, data) => {
      if (err) return res.json(err);
      return res.sendStatus(200);
    }
  );
}

function updatePayItem(req, res) {
  const { name, category } = req.body;
  const { id } = req.params;
  const q =
    "UPDATE pay_items SET pay_item_name = ?, pay_item_category = ? WHERE pay_items_id = ?";
  db.query(q, [name, category, id], (err, data) => {
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
