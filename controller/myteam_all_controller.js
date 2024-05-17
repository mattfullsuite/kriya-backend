var db = require("../config.js");
var moment = require("moment");

function GetAllLeavesExceptMine(req, res){
    const uid = req.session.user[0].emp_id
    const q = "SELECT * FROM `leave_credits` AS l INNER JOIN `emp` AS e ON l.emp_id = e.emp_id WHERE e.emp_id = ?"

    db.query(q,
        [uid],
        (err,data)=> {
        if(err) {
            return res.json(err)
        }

        return res.json(data)
    })
}

function GetAllLeavesToday(req, res){
    const uid = req.session.user[0].emp_id;
    const cid = req.session.user[0].company_id;
    const today = moment().format("YYYY/MM/DD");
  
    const q =
      "SELECT * FROM leaves INNER JOIN emp ON requester_id = emp_id WHERE leave_status = 1 AND approver_id = ? AND ? BETWEEN leave_from AND leave_to";
  
    db.query(q, [uid, today], (err, data) => {
      if (err) {
        return res.json(err);
      }
  
      return res.json(data);
    });
  }

module.exports = {

};