var db = require("../config.js");

function GetAllCompanies(req, res){
    const q = "SELECT * FROM company";
  
    db.query(q, (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    });
}

function GetAllLiveAccounts(req, res){
    const q = "SELECT * FROM emp WHERE date_separated IS NULL";
  
    db.query(q, (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    });
}

module.exports = 
{ 
  GetAllCompanies,
  GetAllLiveAccounts,
};