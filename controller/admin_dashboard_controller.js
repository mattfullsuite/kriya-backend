var db = require("../config.js");

function GetAllDivisions(req, res){
    const cid = req.session.user[0].company_id
    const q = "SELECT * FROM division WHERE company_id = ?";
  
    db.query(q, cid, (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    });
}

function GetAllDepartments(req, res){
    const cid = req.session.user[0].company_id
    const q = "SELECT * FROM dept AS de INNER JOIN division AS di ON de.div_id = di.div_id WHERE di.company_id = ?";
  
    db.query(q, cid, (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    });
}

function GetAllPositions(req, res){
    const cid = req.session.user[0].company_id
    const q = "SELECT * FROM position AS p INNER JOIN dept AS de ON p.dept_id = de.dept_id INNER JOIN division AS di ON de.div_id = di.div_id WHERE di.company_id = ?";
  
    db.query(q, cid, (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    });
}

function GetAllSections(req, res){

}

module.exports = 
{ 
  GetAllDivisions,
  GetAllDepartments,
  GetAllPositions,
  GetAllSections,
};