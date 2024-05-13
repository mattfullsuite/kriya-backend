var db = require("../config.js");

function InsertApplicantsData(req, res) {

    const data = req.body;
    console.log(JSON.stringify(data))

    const q = "INSERT INTO applicant_tracking (`applicant_surname`, `applicant_first_name`, `applicant_middle_name`, `application_date`, `applicant_resume`, `applicant_test_result`, `applicant_status`) VALUES (?)"

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


module.exports = { 
   InsertApplicantsData,
}