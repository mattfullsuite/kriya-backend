var db = require("../config.js");
const moment = require("moment");

function InsertApplicantsData(req, res) {

    const cid = req.session.user[0].company_id;

    const data = req.body;
    console.log(JSON.stringify(data))

    //const q = "INSERT INTO applicant_tracking (`app_start_date`, `s_name`, `f_name`, `m_name`, `email`, `contact_no`, `cv_link`, `source`, `position_applied`, `status`) VALUES (?)"
    const q = "INSERT INTO applicant_tracking (`app_start_date`, `position_applied`, `s_name`, `f_name`, `m_name`, `status`, `reason_for_rejection`, `reason_for_blacklist`, `email`, `contact_no`, `test_result`, `cv_link`, `source`, `referrer_name`) VALUES (?)"

    data.map((d) => {
        db.query(q, [d], (err, data) => {
            if (err){
                console.log(err)
            } else {
                console.log("Added.")
                // res.send(data)
            }
        })
    })
    
    console.log("Successfully added everything in database!");
}

function GetApplicantsFromDatabase(req, res) {
    const q = "SELECT * FROM applicant_tracking ORDER BY app_start_date ASC";

    db.query(q, (err, data) => {
        if (err){
            console.log(err)
        } else {
            res.json(data)
        }
    })
}

function GetPaginatedApplicantsFromDatabase(req, res) {
    const unum = req.session.user[0].emp_num

    const { limit = 10, page = 1 } = req.query;

    //console.log(req.query)

    const q1 = "SELECT COUNT(*) AS count FROM applicant_tracking"
    
    db.query(q1, (err, data1) => {
        if (err){ 
            return res.json(err)
        } else { 
            const q2 = `SELECT * FROM applicant_tracking ORDER BY app_start_date DESC LIMIT ? OFFSET ?`
            
            let parsedLimit = parseInt(limit);
            let parsedPage = parseInt(page);
        
            let offset = (parsedPage - 1) * parsedLimit;

            const totalCount = data1[0].count
            const totalPages = Math.ceil(totalCount / parsedLimit);


            let pagination = {
                page: parsedPage,
                total_pages: totalPages,
                total: parseInt(totalCount),
                limit: parsedLimit,
                offset,
            };

            db.query(q2, [parsedLimit, offset], (err, data2) => {
                if (err){ 
                    return res.json(err)
                } else { 
                    return res.json({ data2, pagination })
                }
            });
        }
    });
  
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
    const q = "INSERT INTO applicant_tracking (`app_start_date`, `s_name`, `f_name`, `m_name`, `email`, `contact_no`, `cv_link`, `source`, `position_applied`, `status`) VALUES (?)"

    const values = 
    [
        moment(req.body.app_start_date).format("YYYY-MM-DD"),
        req.body.s_name,
        req.body.f_name,
        req.body.m_name,
        req.body.email,
        req.body.contact_no,
        req.body.cv_link,
        req.body.source,
        req.body.position_applied,
        req.body.status
    ]
    
    db.query(q, [values], (err, data) => {
        if (err){
            console.log(err)
            res.send(err)
        } else {
            res.send(data)
            //console.log(data)
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
        moment(req.body.app_start_date).format("YYYY-MM-DD"), //
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

function GetApplicantStatusStatistics(req, res){
    
    const q = `SELECT 
    COUNT(case when status = 'Sent Test' then 1 else null end) as sent_test,
    COUNT(case when status = 'First Interview Stage' then 1 else null end) as first_interview_stage,
    COUNT(case when status = 'Second Interview Stage' then 1 else null end) as second_interview_stage,
    COUNT(case when status = 'Third Interview Stage' then 1 else null end) as third_interview_stage,
    COUNT(case when status = 'Fourth Interview Stage' then 1 else null end) as fourth_interview_stage,
    COUNT(case when status = 'Final Interview Stage' then 1 else null end) as final_interview_stage,
    COUNT(case when status = 'For Job Offer' then 1 else null end) as for_job_offer,
    COUNT(case when status = 'Job Offer Sent' then 1 else null end) as job_offer_sent,
    COUNT(case when status = 'Job Offer Accepted' then 1 else null end) as job_offer_accepted,
    COUNT(case when status = 'Started Work' then 1 else null end) as started_work,
    COUNT(case when status = 'Job Offer Rejected' then 1 else null end) as job_offer_rejected,
    COUNT(case when status = 'Withdrawn Application' then 1 else null end) as withdrawn_application,
    COUNT(case when status = 'Not Fit' then 1 else null end) as not_fit,
    COUNT(case when status = 'Abandoned' then 1 else null end) as abandoned,
    COUNT(case when status = 'No Show' then 1 else null end) as no_show,
    COUNT(case when status = 'Blacklisted' then 1 else null end) as blacklisted
    FROM applicant_tracking`
  
    db.query(q, (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    });
}

//View Applicant
function ViewApplicantData(req, res) {
    const app_id = req.params.app_id;

    //console.log("APP ID: ", app_id)

    const q =
      "SELECT * FROM applicant_tracking WHERE app_id = ?";
  
    db.query(q, [app_id], (err, data) => {
      if (err) return res.json(err);
      else {
        res.send(data);
        console.log(data)
      }
    });
  }

//Get Possible 5 Interviews 
function GetInterviews(req, res){
    const app_id = req.params.app_id
    const q = `SELECT ai.*, e.f_name, e.s_name FROM applicant_interview ai INNER JOIN emp e ON ai.interviewer_id = e.emp_id WHERE ai.applicant_id = ? LIMIT 5`

    db.query(q, [app_id], (err, data) => {
        if (err) return res.json(err);
        else {
          res.send(data);
          console.log(data)
        }
      })
}

//Get Possible Interviewers (Any employee that can access applicant tracking system)

function GetIntervieweesForApplicants(req, res){
    const cid = req.session.user[0].company_id
    const q = `SELECT * FROM emp e INNER JOIN hr_access ha ON e.emp_id = ha.hr_id INNER JOIN emp_designation ed ON e.emp_id = ed.emp_id WHERE ha.access_applicant_tracking = 1 AND ed.company_id = ?`

    db.query(q, [cid], (err, data) => {
        if (err) return res.json(err);
        else {
          res.send(data);
          console.log(data)
        }
      })
}

//Get Task Notes
function GetApplicantNotesFromInterview(req, res){
    const app_id = req.params.app_id
    const { interviewNo = 1} = req.query;
    let parsedNumber = parseInt(interviewNo);
    // console.log("APP: ", app_id)
    // console.log("No: ", parsedNumber)

    const q = `SELECT an.*, ai.*, e.f_name, e.s_name FROM applicant_notes an INNER JOIN applicant_interview ai ON an.interview_id = ai.applicant_interview_id INNER JOIN emp e ON an.noter_id = e.emp_id WHERE ai.applicant_id = ? AND ai.applicant_interview_id = ?`

    db.query(q, [app_id, parsedNumber], (err, data) => {
        if (err) return res.json(err);
        else {
          res.send(data);
        //   console.log(data)
        }
      });
}

//Notes

function InsertApplicantNotes(req, res){
    const uid = req.session.user[0].emp_id
    const q = "INSERT INTO applicant_notes (`interview_id`, `note_type`, `noter_id`, `note_body`) VALUES (?)"

    console.log(req.body)

    const values = [
        req.body.interview_id,
        2,
        uid, 
        req.body.note_body,
    ]

    db.query(q, 
        [values], 
        (err,data) => {
        if (err){
            res.send("error");
            console.log(data)
        } else {
            res.sendStatus(200);
            console.log(data)
        }
    })
}

//
function AddNewInterview(req, res){
    const app_id = req.params.app_id
    const q = "INSERT INTO applicant_interview (`applicant_id`, `interviewer_id`, `interview_status`, `date_of_interview`) VALUES (?)"

    console.log("REQ BODY: ", req.body)

    console.log("APP_ID: ", app_id)
    console.log("INTERVIEWER_ID: ", req.body.interviewer_id)
    console.log("DATE INTERVIEW: ", req.body.date_of_interview)

    const values = [
        app_id,
        req.body.interviewer_id,
        "PENDING",
        req.body.date_of_interview,
    ]

    db.query(q, 
        [values], 
        (err,data) => {
        if (err){
            console.log("ERR: ", data)
            res.send("error");
        } else {
            console.log("SUCCESS: ", data)
            res.send(data)
        }
    })
}

function SearchApplicantList(req, res) {
    var cid = req.session.user[0].company_id;

    const { searchTerm = "" } = req.query;

    const q = `SELECT * FROM applicant_tracking WHERE CONCAT(f_name, s_name, m_name, position_applied, email, source, status, reason_for_rejection, reason_for_blacklist) LIKE ?`

    const st = "%" + searchTerm + "%";

    db.query(q, [st, cid], (err, data) => {
        if (err){ 
            return res.json(err)
        } else { 
            return res.send(data)
        }
    })
}

//Edit Employee

function ChangeStatus(req, res){
  
    console.log("Data: ", req.body)
  
    const q = "UPDATE applicant_tracking SET `status` = ? WHERE app_id = ?"
  
    db.query(q, [req.body.status, req.body.app_id], (err, data) => {
      if (err) {
        console.log(err);
      } else {
        res.send("success");
        console.log(data)
      }
    });
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
   InsertApplicantNotes,
   GetPaginatedApplicantsFromDatabase,

   //Applicant STatus Statistics
   GetApplicantStatusStatistics,
   ViewApplicantData,
   GetInterviews,
   GetApplicantNotesFromInterview,

   //Get Interviewees
   GetIntervieweesForApplicants,
   AddNewInterview,

   SearchApplicantList,
   ChangeStatus
}