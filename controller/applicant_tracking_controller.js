var db = require("../config.js");

function InsertApplicantsData(req, res) {

    const cid = req.session.user[0].company_id;

    const data = req.body;
    console.log(JSON.stringify(data))

    const q = "INSERT INTO applicant_tracking (`s_name`, `f_name`, `m_name`, `date_hired`, `cv`, `test_result`, `status`) VALUES (?)"

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


module.exports = { 
   InsertApplicantsData,
   GetApplicantsFromDatabase,
   AddNewApplicant,
}