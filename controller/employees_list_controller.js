var db = require("../config.js");
const bcrypt = require("bcryptjs");

function InsertBulkEmployeeData(req, res) {
  const cid = req.session.user[0].company_id;

  function generateRandomString(n) {
    let randomString = "";
    let characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";

    for (let i = 0; i < n; i++) {
      randomString += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }

    return randomString;
  }

  //const q = "INSERT INTO applicant_tracking (`app_start_date`, `s_name`, `f_name`, `m_name`, `email`, `contact_no`, `cv_link`, `source`, `position_applied`, `status`) VALUES (?)"
  const q =
    "INSERT INTO emp (`f_name`, `m_name`, `s_name`, `emp_num`, `work_email`, `emp_role`, `personal_email`, `contact_num`, `dob`, `c_address`, `p_address`, `date_hired`, `date_regularization`, `date_offboarding`, `date_separated`, `emp_status`, `sex`, `password`, `emp_key`) VALUES (?)";

  const data = req.body;

  data.map((d) => {

    const tempPassword = generateRandomString(20);

    const empKey = generateRandomString(30);

    //----- HASHING ALGO -----//
    const salt = bcrypt.genSaltSync(10);
    const hashed = bcrypt.hashSync(tempPassword, salt);

    const values = [
      d[0],
      d[1],
      d[2],
      d[3],
      d[4],
      d[5],
      d[6],
      d[7],
      d[8],
      d[9],
      d[10],
      d[11],
      d[12],
      d[13] ? d[13] : null,
      d[14] ? d[14] : null,
      d[15],
      d[16],
      hashed,
      empKey,
    ];

    db.query(q, [values], (err, result) => {
      if (err) {
        console.log("ERROR: " + err);
        //res.send("error");
      } else {
        console.log("Added.");
        console.log("DATA: " + JSON.stringify(result));

        const q1 = "INSERT INTO emp_designation (`emp_id`, `company_id`, `client_id` ,`position_id`) VALUES (?, ?, 1, 33)"

        db.query(q1, [result.insertId, cid], (err, data) => {
          if (err) {
            console.log("Level 2: ", err)
          } else {
            console.log("Added designation for new employee!")
            console.log(data)
          }
        });
      }
    });
  });

  res.send("success");

  console.log("Successfully added everything in database!");
}

function EmployeesList(req, res) {
  var cid = req.session.user[0].company_id;
  const q = `SELECT *, s.f_name AS superior_f_name, s.s_name AS superior_s_name, CONCAT(e.f_name, e.m_name, e.s_name, e.emp_num, e.work_email, e.c_address, e.contact_num) AS searchable FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id=em.emp_id INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id INNER JOIN emp AS s ON e.superior_id = s.emp_id WHERE em.company_id = ? AND e.date_separated IS NULL ORDER BY e.s_name`;

  db.query(q, cid, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function AllEmployeesList(req, res) {
  var cid = req.session.user[0].company_id;
  const q = `SELECT e.emp_id, e.f_name, e.m_name, e.s_name, e.emp_num, e.date_hired, e.date_offboarding, e.date_separated, s.f_name AS superior_f_name, s.s_name AS superior_s_name, p.position_name, CONCAT(e.f_name, e.m_name, e.s_name, e.emp_num, s.f_name, s.s_name, p.position_name) AS searchable FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id=em.emp_id LEFT JOIN position AS p ON em.position_id = p.position_id INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id LEFT JOIN emp AS s ON e.superior_id = s.emp_id WHERE em.company_id = ?  ORDER BY e.s_name;`;

  db.query(q, cid, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function SearchAllEmployees(req, res) {
  var cid = req.session.user[0].company_id;

  const { searchTerm = "" } = req.query;

  const q = `SELECT e.emp_id,e.emp_pic, e.f_name, e.m_name, e.s_name, e.emp_num, e.date_hired, e.date_offboarding, e.date_separated, s.f_name AS superior_f_name, s.s_name AS superior_s_name, p.position_name FROM emp AS e LEFT JOIN emp_designation AS em ON e.emp_id=em.emp_id LEFT JOIN position AS p ON em.position_id = p.position_id LEFT JOIN leave_credits AS lc ON e.emp_id = lc.emp_id LEFT JOIN emp AS s ON e.superior_id = s.emp_id WHERE CONCAT(e.emp_id, e.f_name, e.m_name, e.s_name, e.emp_num, p.position_name, s.f_name, s.s_name) LIKE ? AND em.company_id = ? ORDER BY e.s_name;`;

  const st = "%" + searchTerm + "%";

  db.query(q, [st, cid], (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.send(data);
    }
  });
}

function PaginatedAllEmployees(req, res) {
  var cid = req.session.user[0].company_id;

  const { limit = 10, page = 1 } = req.query;

  console.log("Query: ", req.query);

  const q1 = `SELECT COUNT(*) AS count FROM emp AS e LEFT JOIN emp_designation AS em ON e.emp_id=em.emp_id LEFT JOIN position AS p ON em.position_id = p.position_id LEFT JOIN leave_credits AS lc ON e.emp_id = lc.emp_id LEFT JOIN emp AS s ON e.superior_id = s.emp_id WHERE em.company_id = ?`;

  db.query(q1, [cid], (err, data1) => {
    if (err) {
      return res.json(err);
    } else {
      const q2 = `SELECT e.emp_pic, e.emp_id, e.f_name, e.m_name, e.s_name, e.emp_num, e.date_hired, e.date_offboarding, e.date_separated, s.f_name AS superior_f_name, s.s_name AS superior_s_name, p.position_name, CONCAT(e.f_name, e.m_name, e.s_name, e.emp_num, s.f_name, s.s_name, p.position_name) AS searchable 
            FROM emp AS e LEFT JOIN emp_designation AS em ON e.emp_id=em.emp_id LEFT JOIN position AS p ON em.position_id = p.position_id LEFT JOIN leave_credits AS lc ON e.emp_id = lc.emp_id LEFT JOIN emp AS s ON e.superior_id = s.emp_id WHERE em.company_id = ? ORDER BY e.s_name LIMIT ? OFFSET ? `;

      let parsedLimit = parseInt(limit);
      let parsedPage = parseInt(page);

      let offset = (parsedPage - 1) * parsedLimit;

      const totalCount = data1[0].count;
      const totalPages = Math.ceil(totalCount / parsedLimit);

      console.log("REQ QUERY: ", req.query);
      console.log("Parsed Limit: ", parsedLimit);
      console.log("OFFSITE", offset);

      let pagination = {
        page: parsedPage,
        total_pages: totalPages,
        total: parseInt(totalCount),
        limit: parsedLimit,
        offset,
      };

      db.query(q2, [cid, parsedLimit, offset], (err, data2) => {
        if (err) {
          return res.json(err);
        } else {
          return res.json({ data2, pagination });
        }
      });
    }
  });
}

function SearchProbationaryEmployees(req, res) {
  var cid = req.session.user[0].company_id;

  const { searchTerm = "" } = req.query;

  const q = `SELECT e.emp_id, e.emp_pic, e.f_name, e.m_name, e.s_name, e.emp_num, e.date_hired, e.date_offboarding, e.date_separated, s.f_name AS superior_f_name, s.s_name AS superior_s_name, p.position_name FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id=em.emp_id INNER JOIN position AS p ON em.position_id = p.position_id INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id LEFT JOIN emp AS s ON e.superior_id = s.emp_id WHERE CONCAT(e.emp_id, e.f_name, e.m_name, e.s_name, e.emp_num, p.position_name, s.f_name, s.s_name) LIKE ? AND em.company_id = ? AND e.date_separated IS NULL AND e.emp_status = 'Probationary' ORDER BY e.s_name;`;

  const st = "%" + searchTerm + "%";

  db.query(q, [st, cid], (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.send(data);
    }
  });
}

function PaginatedProbationaryEmployees(req, res) {
  var cid = req.session.user[0].company_id;

  const { limit = 10, page = 1 } = req.query;

  const q1 = `SELECT COUNT(*) AS count FROM emp AS e LEFT JOIN emp_designation AS em ON e.emp_id=em.emp_id LEFT JOIN position AS p ON em.position_id = p.position_id LEFT JOIN leave_credits AS lc ON e.emp_id = lc.emp_id LEFT JOIN emp AS s ON e.superior_id = s.emp_id WHERE em.company_id = ? AND e.date_separated IS NULL AND e.emp_status = 'Probationary'`;

  db.query(q1, [cid], (err, data1) => {
    if (err) {
      return res.json(err);
    } else {
      const q2 = `SELECT e.emp_id, e.emp_pic, e.f_name, e.m_name, e.s_name, e.emp_num, e.date_hired, e.date_offboarding, e.date_separated, s.f_name AS superior_f_name, s.s_name AS superior_s_name, p.position_name, CONCAT(e.f_name, e.m_name, e.s_name, e.emp_num, s.f_name, s.s_name, p.position_name) AS searchable 
            FROM emp AS e LEFT JOIN emp_designation AS em ON e.emp_id=em.emp_id LEFT JOIN position AS p ON em.position_id = p.position_id LEFT JOIN leave_credits AS lc ON e.emp_id = lc.emp_id LEFT JOIN emp AS s ON e.superior_id = s.emp_id WHERE em.company_id = ? AND e.date_separated IS NULL AND e.emp_status = 'Probationary' ORDER BY e.s_name LIMIT ? OFFSET ? `;

      let parsedLimit = parseInt(limit);
      let parsedPage = parseInt(page);

      let offset = (parsedPage - 1) * parsedLimit;

      const totalCount = data1[0].count;
      const totalPages = Math.ceil(totalCount / parsedLimit);

      console.log("REQ QUERY: ", req.query);
      console.log("Parsed Limit: ", parsedLimit);
      console.log("OFFSITE", offset);

      let pagination = {
        page: parsedPage,
        total_pages: totalPages,
        total: parseInt(totalCount),
        limit: parsedLimit,
        offset,
      };

      db.query(q2, [cid, parsedLimit, offset], (err, data2) => {
        if (err) {
          return res.json(err);
        } else {
          return res.json({ data2, pagination });
        }
      });
    }
  });
}

function SearchRegularEmployees(req, res) {
  var cid = req.session.user[0].company_id;

  const { searchTerm = "" } = req.query;

  const q = `SELECT e.emp_id,e.emp_pic, e.f_name, e.m_name, e.s_name, e.emp_num, e.date_hired, e.date_offboarding, e.date_separated, s.f_name AS superior_f_name, s.s_name AS superior_s_name, p.position_name FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id=em.emp_id INNER JOIN position AS p ON em.position_id = p.position_id INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id LEFT JOIN emp AS s ON e.superior_id = s.emp_id WHERE CONCAT(e.emp_id, e.f_name, e.m_name, e.s_name, e.emp_num, p.position_name, s.f_name, s.s_name) LIKE ? AND em.company_id = ? AND e.date_separated IS NULL AND e.emp_status = 'Regular' ORDER BY e.s_name;`;

  const st = "%" + searchTerm + "%";

  db.query(q, [st, cid], (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.send(data);
    }
  });
}

function PaginatedRegularEmployees(req, res) {
  var cid = req.session.user[0].company_id;

  const { limit = 10, page = 1 } = req.query;

  const q1 = `SELECT COUNT(*) AS count FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id=em.emp_id INNER JOIN position AS p ON em.position_id = p.position_id INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id LEFT JOIN emp AS s ON e.superior_id = s.emp_id WHERE em.company_id = ? AND e.date_separated IS NULL AND e.emp_status = 'Regular'`;

  db.query(q1, [cid], (err, data1) => {
    if (err) {
      return res.json(err);
    } else {
      const q2 = `SELECT e.emp_id, e.emp_pic, e.f_name, e.m_name, e.s_name, e.emp_num, e.date_hired, e.date_offboarding, e.date_separated, s.f_name AS superior_f_name, s.s_name AS superior_s_name, p.position_name, CONCAT(e.f_name, e.m_name, e.s_name, e.emp_num, s.f_name, s.s_name, p.position_name) AS searchable 
            FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id=em.emp_id INNER JOIN position AS p ON em.position_id = p.position_id INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id LEFT JOIN emp AS s ON e.superior_id = s.emp_id WHERE em.company_id = ? AND e.date_separated IS NULL AND e.emp_status = 'Regular' ORDER BY e.s_name LIMIT ? OFFSET ? `;

      let parsedLimit = parseInt(limit);
      let parsedPage = parseInt(page);

      let offset = (parsedPage - 1) * parsedLimit;

      const totalCount = data1[0].count;
      const totalPages = Math.ceil(totalCount / parsedLimit);

      console.log("REQ QUERY: ", req.query);
      console.log("Parsed Limit: ", parsedLimit);
      console.log("OFFSITE", offset);

      let pagination = {
        page: parsedPage,
        total_pages: totalPages,
        total: parseInt(totalCount),
        limit: parsedLimit,
        offset,
      };

      db.query(q2, [cid, parsedLimit, offset], (err, data2) => {
        if (err) {
          return res.json(err);
        } else {
          return res.json({ data2, pagination });
        }
      });
    }
  });
}

function NewEmployeesList(req, res) {
  var cid = req.session.user[0].company_id;
  const q = `SELECT e.emp_id, e.emp_pic, e.f_name, e.m_name, e.s_name, e.emp_num, e.date_hired, e.date_separated, s.f_name AS superior_f_name, s.s_name AS superior_s_name, p.position_name, CONCAT(e.f_name, e.m_name, e.s_name, e.emp_num, s.f_name, s.s_name, p.position_name) AS searchable FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id=em.emp_id INNER JOIN position AS p ON em.position_id = p.position_id INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id INNER JOIN emp AS s ON e.superior_id = s.emp_id WHERE em.company_id = ? AND e.date_hired >= CURRENT_DATE - 180 ORDER BY e.date_hired DESC;`;

  db.query(q, cid, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function RegularEmployeesList(req, res) {
  var cid = req.session.user[0].company_id;
  const q = `SELECT e.emp_id,e.emp_pic, e.f_name, e.m_name, e.s_name, e.emp_num, e.date_hired, e.date_separated, s.f_name AS superior_f_name, s.s_name AS superior_s_name, p.position_name, CONCAT(e.f_name, e.m_name, e.s_name, e.emp_num, s.f_name, s.s_name, p.position_name) AS searchable FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id=em.emp_id INNER JOIN position AS p ON em.position_id = p.position_id INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id INNER JOIN emp AS s ON e.superior_id = s.emp_id WHERE em.company_id = ? AND e.date_regularization < CURRENT_DATE ORDER BY e.s_name;`;

  db.query(q, cid, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function SeparatedEmployeesList(req, res) {
  var cid = req.session.user[0].company_id;
  const q = `SELECT e.emp_id, e.f_name, e.m_name, e.s_name, e.emp_num, e.date_hired, e.date_separated, s.f_name AS superior_f_name, s.s_name AS superior_s_name, p.position_name, CONCAT(e.f_name, e.m_name, e.s_name, e.emp_num, s.f_name, s.s_name, p.position_name) AS searchable FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id=em.emp_id INNER JOIN position AS p ON em.position_id = p.position_id INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id INNER JOIN emp AS s ON e.superior_id = s.emp_id WHERE em.company_id = ? AND e.date_separated IS NOT NULL ORDER BY e.date_separated DESC`;
  db.query(q, cid, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function ViewEmployee(req, res) {
  const emp_id = req.params.emp_id;
  const q =
    "SELECT * FROM emp AS e INNER JOIN leave_credits AS l ON e.emp_id=l.emp_id INNER JOIN emp_designation AS ed ON e.emp_id=ed.emp_id INNER JOIN position AS p ON ed.position_id = p.position_id INNER JOIN dept AS d ON d.dept_id = p.dept_id INNER JOIN division AS di ON di.div_id = d.div_id WHERE e.emp_id = ?";

  db.query(q, [emp_id], (err, data) => {
    if (err) return res.json(err);
    return res.send(data);
  });
}

function AllEmployees(req, res) {
  var cid = req.session.user[0].company_id;
  const q =
    "SELECT *, CONCAT(f_name, m_name, s_name, emp_num, work_email, c_address, contact_num) AS searchable FROM emp AS e INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id INNER JOIN emp_designation AS em ON e.emp_id = em.emp_id WHERE em.company_id = ? AND date_separated IS NULL ORDER BY s_name";
  db.query(q, cid, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function ProbationaryEmployees(req, res) {
  var cid = req.session.user[0].company_id;

  const q = `SELECT e.emp_id, e.f_name, e.m_name, e.s_name, e.emp_num, e.date_hired, e.date_separated, s.f_name AS superior_f_name, s.s_name AS superior_s_name, p.position_name, CONCAT(e.f_name, e.m_name, e.s_name, e.emp_num, s.f_name, s.s_name, p.position_name) AS searchable FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id=em.emp_id INNER JOIN position AS p ON em.position_id = p.position_id INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id INNER JOIN emp AS s ON e.superior_id = s.emp_id WHERE em.company_id = ? AND e.date_separated IS NULL AND e.emp_status = 'Probationary' ORDER BY e.s_name;`;
  //const q = "SELECT *, CONCAT(f_name, m_name, s_name, emp_num, work_email, c_address, contact_num) AS searchable FROM emp AS e INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id INNER JOIN emp_designation AS em ON em.emp_id = e.emp_id WHERE em.company_id = ? AND date_separated IS NULL AND emp_status = 'Probationary' ORDER BY s_name"
  db.query(q, cid, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function RegularEmployees(req, res) {
  var cid = req.session.user[0].company_id;
  const q =
    "SELECT *, CONCAT(f_name, m_name, s_name, emp_num, work_email, c_address, contact_num) AS searchable FROM emp AS e INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id INNER JOIN emp_designation AS em ON em.emp_id = e.emp_id WHERE em.company_id = ? AND date_separated IS NULL AND emp_status = 'Regular' ORDER BY s_name";
  db.query(q, cid, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function PartTimeEmployees(req, res) {
  var cid = req.session.user[0].company_id;
  const q =
    "SELECT *, CONCAT(f_name, m_name, s_name, emp_num, work_email, c_address, contact_num) AS searchable FROM emp AS e INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id INNER JOIN emp_designation AS em ON em.emp_id = e.emp_id WHERE em.company_id = ? AND date_separated IS NULL AND emp_status = 'Part-time' ORDER BY s_name";
  db.query(q, cid, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function DeactivatedAccounts(req, res) {
  var cid = req.session.user[0].company_id;
  const q =
    "SELECT *, CONCAT(f_name, m_name, s_name, emp_num, work_email, c_address, contact_num) AS searchable FROM emp AS e INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id INNER JOIN emp_designation AS em ON em.emp_id = e.emp_id WHERE em.company_id =? AND date_separated < CURRENT_TIMESTAMP ORDER BY s_name";
  db.query(q, cid, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

function OffboardingAccounts(req, res) {
  var cid = req.session.user[0].company_id;

  const q = `SELECT e.emp_id, e.f_name, e.m_name, e.s_name, e.emp_num, e.date_hired, e.date_separated, s.f_name AS superior_f_name, s.s_name AS superior_s_name, p.position_name, CONCAT(e.f_name, e.m_name, e.s_name, e.emp_num, s.f_name, s.s_name, p.position_name) AS searchable FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id=em.emp_id INNER JOIN position AS p ON em.position_id = p.position_id INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id INNER JOIN emp AS s ON e.superior_id = s.emp_id WHERE em.company_id = ? AND e.date_offboarding IS NOT NULL AND e.date_separated > CURRENT_TIMESTAMP ORDER BY e.s_name;`;
  //const q = "SELECT *, CONCAT(f_name, m_name, s_name, emp_num, work_email, c_address, contact_num) AS searchable FROM emp AS e INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id INNER JOIN emp_designation AS em ON em.emp_id = e.emp_id WHERE em.company_id =? AND date_offboarding IS NOT NULL AND date_separated > CURRENT_TIMESTAMP ORDER BY s_name"
  db.query(q, cid, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
}

module.exports = {
  EmployeesList,
  ViewEmployee,
  AllEmployees,
  RegularEmployees,
  PartTimeEmployees,
  DeactivatedAccounts,
  ProbationaryEmployees,
  AllEmployeesList,
  NewEmployeesList,
  SeparatedEmployeesList,
  RegularEmployeesList,
  OffboardingAccounts,

  //With Pagination
  PaginatedAllEmployees,
  SearchAllEmployees,
  PaginatedProbationaryEmployees,
  SearchProbationaryEmployees,
  PaginatedRegularEmployees,
  SearchRegularEmployees,
  InsertBulkEmployeeData,
};
