var db = require("../config.js");
var moment = require("moment");

//Paginated Version

function GetPaginatedAttendanceOfDownlines(req, res) {
  var cid = req.session.user[0].company_id;

  const { limit = 10, page = 1 } = req.query;

  //const q1 = `SELECT COUNT(*) AS count FROM emp AS e INNER JOIN emp_designation AS em ON e.emp_id=em.emp_id INNER JOIN position AS p ON em.position_id = p.position_id INNER JOIN leave_credits AS lc ON e.emp_id = lc.emp_id LEFT JOIN emp AS s ON e.superior_id = s.emp_id WHERE em.company_id = ? AND e.date_separated IS NULL AND e.emp_status = 'Regular'`
  //const q1 = `SELECT COUNT(*) AS count FROM (SELECT DISTINCT e.emp_id, a.employee_id, e.f_name, e.s_name, es.shift_type, es.start, es.end, p.position_name, (SELECT COUNT(a2.status) FROM attendance a2 WHERE a2.status = "Data Incomplete" AND a2.employee_id = a.employee_id) AS data_incomplete, (SELECT COUNT(a2.status) FROM attendance a2 WHERE a2.status = "Late Start" AND a2.employee_id = a.employee_id) AS late_start, (SELECT COUNT(a2.status) FROM attendance a2 WHERE a2.status = "Early Start" AND a2.employee_id = a.employee_id) AS early_start, (SELECT COUNT(*) FROM overtime o INNER JOIN emp eo ON o.requester_id = eo.emp_id WHERE a.employee_id = eo.emp_num) AS overtime, (SELECT COUNT(a2.undertime) FROM attendance a2 WHERE a2.undertime = "Undertime" AND a2.employee_id = a.employee_id) AS undertime, (SELECT COUNT(a3.undertime) FROM attendance a3 WHERE a3.undertime IS NOT NULL AND a3.time_in IS NOT NULL AND a3.time_out IS NOT NULL AND a3.employee_id = a.employee_id) AS completed FROM attendance a INNER JOIN emp e ON a.employee_id = e.emp_num INNER JOIN emp_designation ed ON e.emp_id = ed.emp_id LEFT JOIN emp_shift es ON es.emp_num = a.employee_id INNER JOIN position p ON p.position_id = ed.position_id WHERE ed.company_id = ? GROUP BY e.emp_id, a.employee_id, e.f_name, e.s_name, es.start, es.end, p.position_name, es.shift_type) a`
  const q1 = `SELECT COUNT(*) AS count FROM (SELECT DISTINCT e.emp_id, a.employee_id, e.f_name, e.s_name, es.shift_type, es.start, es.end, p.position_name, COUNT(case when a.status = 'Data Incomplete' then 1 else null end) AS data_incomplete, COUNT(case when a.status = 'Late Start' then 1 else null end) AS late_start, COUNT(case when a.status = 'Early Start' then 1 else null end) AS early_start, (SELECT COUNT(*) FROM overtime o INNER JOIN emp eo ON o.requester_id = eo.emp_id WHERE a.employee_id = eo.emp_num) AS overtime, COUNT(case when a.undertime = 'Undertime' then 1 else null end) AS undertime, COUNT(case when a.undertime = 'Completed' then 1 else null end) AS completed FROM attendance a INNER JOIN emp e ON a.employee_id = e.emp_num INNER JOIN emp_designation ed ON e.emp_id = ed.emp_id LEFT JOIN emp_shift es ON es.emp_num = a.employee_id INNER JOIN position p ON p.position_id = ed.position_id WHERE ed.company_id = ? GROUP BY e.emp_id, a.employee_id, e.f_name, e.s_name, es.start, es.end, p.position_name, es.shift_type) a`;

  db.query(q1, [cid], (err, data1) => {
    if (err) {
      return res.json(err);
    } else {
      //const q2 = `SELECT DISTINCT e.emp_id, a.employee_id, e.f_name, e.s_name, es.shift_type, es.start, es.end, p.position_name, (SELECT COUNT(a2.status) FROM attendance a2 WHERE a2.status = "Data Incomplete" AND a2.employee_id = a.employee_id) AS data_incomplete, (SELECT COUNT(a2.status) FROM attendance a2 WHERE a2.status = "Late Start" AND a2.employee_id = a.employee_id) AS late_start, (SELECT COUNT(a2.status) FROM attendance a2 WHERE a2.status = "Early Start" AND a2.employee_id = a.employee_id) AS early_start, (SELECT COUNT(*) FROM overtime o INNER JOIN emp eo ON o.requester_id = eo.emp_id WHERE a.employee_id = eo.emp_num) AS overtime, (SELECT COUNT(a2.undertime) FROM attendance a2 WHERE a2.undertime = "Undertime" AND a2.employee_id = a.employee_id) AS undertime, (SELECT COUNT(a3.undertime) FROM attendance a3 WHERE a3.undertime IS NOT NULL AND a3.time_in IS NOT NULL AND a3.time_out IS NOT NULL AND a3.employee_id = a.employee_id) AS completed FROM attendance a INNER JOIN emp e ON a.employee_id = e.emp_num INNER JOIN emp_designation ed ON e.emp_id = ed.emp_id LEFT JOIN emp_shift es ON es.emp_num = a.employee_id INNER JOIN position p ON p.position_id = ed.position_id WHERE ed.company_id = ? GROUP BY e.emp_id, a.employee_id, e.f_name, e.s_name, es.start, es.end, p.position_name, es.shift_type LIMIT ? OFFSET ?`
      const q2 = `SELECT DISTINCT e.emp_id, e.emp_pic, a.employee_id, e.f_name, e.s_name, es.shift_type, es.start, es.end, p.position_name, COUNT(case when a.status = 'Data Incomplete' then 1 else null end) AS data_incomplete, COUNT(case when a.status = 'Late Start' then 1 else null end) AS late_start, COUNT(case when a.status = 'Early Start' then 1 else null end) AS early_start, (SELECT COUNT(*) FROM overtime o INNER JOIN emp eo ON o.requester_id = eo.emp_id WHERE a.employee_id = eo.emp_num) AS overtime, COUNT(case when a.undertime = 'Undertime' then 1 else null end) AS undertime, COUNT(case when a.undertime = 'Completed' then 1 else null end) AS completed FROM attendance a INNER JOIN emp e ON a.employee_id = e.emp_num INNER JOIN emp_designation ed ON e.emp_id = ed.emp_id LEFT JOIN emp_shift es ON es.emp_num = a.employee_id INNER JOIN position p ON p.position_id = ed.position_id WHERE ed.company_id = ? GROUP BY e.emp_id, a.employee_id, e.f_name, e.s_name, es.start, es.end, p.position_name, es.shift_type LIMIT ? OFFSET ?`;

      let parsedLimit = parseInt(limit);
      let parsedPage = parseInt(page);

      let offset = (parsedPage - 1) * parsedLimit;

      const totalCount = data1[0].count;
      const totalPages = Math.ceil(totalCount / parsedLimit);

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

module.exports = {
  GetPaginatedAttendanceOfDownlines
};