var db = require("../config.js");

function InsertApplicantsData(req, res) {

    const cid = req.session.user[0].company_id;

    const data = req.body;
    console.log(JSON.stringify(data))

    const q = "INSERT INTO applicant_tracking (`app_start_date`, `s_name`, `f_name`, `m_name`, `email`, `contact_no`, `cv_link`, `source`, `position_applied`, `status`) VALUES (?)"

    data.map((d) => {
        db.query(q, [d], (err, data) => {
            if (err){
                console.log(err)
            } else {
                console.log("Added.")
            }
        })
    })
    
    console.log("Successfully added everything in database!");
}

function GetApplicantsFromDatabase(req, res) {
    const q = "SELECT * FROM applicant_tracking ORDER BY app_id DESC";

    db.query(q, (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
}

function AddNewApplicant(req, res) {
    const q = "INSERT INTO applicant_tracking (`s_name`, `f_name`, `m_name`, `date_hired`, `cv`, `test_result`, `status`) VALUES (?)"

    const values = req.body;
    
    db.query(q, [values], (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })

}

function ModifiedAddNewApplicant(req, res) {
    const q = "INSERT INTO applicant_tracking (`app_start_date`, `s_name`, `f_name`, `m_name`, `email`, `contact_no`, `cv_link`, `source`, `status`) VALUES (?)"

    const values = 
    [
        req.body.app_start_date,
        req.body.s_name,
        req.body.f_name,
        req.body.m_name,
        req.body.email,
        req.body.contact_no,
        req.body.cv_link,
        req.body.source,
        "Open"
    ]
    
    db.query(q, [values], (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
            console.log("Successfully added to database")
        }
    })

}

function GetPositionsFromCompany(req, res){
    const cid = req.session.user[0].company_id;
    const q = `SELECT DISTINCT position_name FROM emp_designation em INNER JOIN position p ON p.position_id = em.position_id WHERE em.company_id = ? ORDER BY position_name ASC`

    db.query(q, cid, (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
            console.log("Retrieved all positions from company " + cid)
        }
    })
}


module.exports = { 
   InsertApplicantsData,
   GetApplicantsFromDatabase,
   AddNewApplicant,
   ModifiedAddNewApplicant,
   GetPositionsFromCompany
}