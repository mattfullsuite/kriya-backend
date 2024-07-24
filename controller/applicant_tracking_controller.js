var db = require("../config.js");
const moment = require("moment");

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
            // console.log("Retrieved all positions from company " + cid)
        }
    })
}

//Get Referrers

function GetPossibleReferrers(req, res){
    const cid = req.session.user[0].company_id;
    const q = `SELECT * FROM emp e INNER JOIN emp_designation em ON e.emp_id = em.emp_id WHERE em.company_id = ? AND e.date_separated IS NULL`

    db.query(q, cid, (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
}

//Edit Employee

function EditApplicantData(req, res){
  
    console.log("Data: ", req.body)
  
    const values = [
        req.body.app_start_date, //
        req.body.position_applied, //
        req.body.status, //
        req.body.s_name, //
        req.body.f_name, //
        req.body.m_name, //
        req.body.email, //
        req.body.source, //
        req.body.contact_no, //
        req.body.cv_link, //
        req.body.referrer, 
        req.body.next_interview_date ? moment(req.body.next_interview_date).format("YYYY-MM-DD") : null, 
        req.body.interviewer, 
        req.body.app_id, //
    ]
  
    const q = "UPDATE applicant_tracking SET `app_start_date` = ?, `position_applied` = ?, `status` = ?, `s_name` = ?, `f_name` = ?, `m_name` = ?, `email` = ?, `source` = ?, `contact_no` = ?, `cv_link` = ?, `referrer_name` = ?, `next_interview_date` = ?, `interviewer` = ? WHERE app_id = ?"
  
    db.query(q, values, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        res.send("success");
        console.log(data)
      }
    });
  }

  //NOTES

function GetNoteDetails(req, res){
    const note_id = req.body.note_id
    const q = "SELECT * FROM applicant_notes INNER JOIN emp ON emp_id = noter_id WHERE note_id = ? ORDER BY noted_at;";
  
    db.query(q, [note_id], (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    });
}

function InsertApplicantNotes(req, res){
    const uid = req.session.user[0].emp_id
    const q = "INSERT INTO applicant_notes (`note_id`, `note_type`, `noter_id`, `note_body`) VALUES (?)"

    const values = [
        req.body.note_id,
        2,
        uid, 
        req.body.note_body,
    ]

    db.query(q, 
        [values], 
        (err,data) => {
        if (err){
            res.send("error");
        } else {
            res.sendStatus(200);
        }
    })
}


module.exports = { 
   InsertApplicantsData,
   GetApplicantsFromDatabase,
   AddNewApplicant,
   ModifiedAddNewApplicant,
   GetPositionsFromCompany,
   GetPossibleReferrers,

   //Edit Applicant
   EditApplicantData,
   GetNoteDetails,
   InsertApplicantNotes
}