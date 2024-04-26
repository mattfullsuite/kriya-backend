var db = require("../config.js");
var cloudinary = require("../handlers/utilities/cloudinary.js");
var fs = require("fs");

const uploadImage = async (imagePath, company_name) => {
  console.log("Upload Image");
  // Upload image to Cloudinary
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: "kriya/companies/logos",
      public_id: company_name,
      overwrite: true,
    });

    fs.unlinkSync(imagePath);
    return result;
  } catch (error) {
    console.log("Error: ", error);
  }
};

function CreateHoliday(req, res) {
  const cid = req.session.user[0].company_id;
  const q =
    "INSERT INTO holiday (`h_name`, `h_date`, `company_id`) VALUES (?) ";
  const values = [req.body.h_name, req.body.h_date, cid];

  db.query(q, [values], (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send("success");
    }
    // if (err) return res.json(err)
    // return res.json("Holiday added!")
  });
}

function DeleteHoliday(req, res) {
  const h_id = req.params.h_id;
  const q = "DELETE FROM holiday WHERE h_id = ?";

  db.query(q, [h_id], (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json("Holiday #" + h_id + " has been deleted successfully.");
    }
  });
}

function GetAllDivisions(req, res) {
  const cid = req.session.user[0].company_id;

  const q = "SELECT * FROM division WHERE company_id = ? ORDER BY div_name ASC";

  db.query(q, cid, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(data);
    }
  });
}

const CreateCompany = async (req, res) => {
  const { company_name, company_address, company_logo } = req.body;

  const q =
    "INSERT INTO company (`company_name`, `company_address`, `company_logo`) VALUES (?, ?, ?) ";

  try {
    if (req.file) {
      // Upload image to Cloudinary
      const result = await uploadImage(req.file.path, company_name);
      if (result != null) {
        console.log("Insert to database");
        if (company_name != undefined || company_name != "") {
          db.query(
            q,
            [company_name, company_address, result.secure_url],
            (err, data) => {
              if (err) {
                res.send(err);
              } else {
                res.send("success");
              }
            }
          );
        } else {
          res.sendStatus(400);
        }
      }
    }
  } catch (error) {}
};

function GetAllDepartments(req, res) {
  const q =
    "SELECT * FROM dept INNER JOIN division ON dept.div_id = division.div_id INNER JOIN company ON company.company_id = division.company_id ORDER BY dept_name ASC";

  db.query(q, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(data);
    }
  });
}

function GetAllPositions(req, res) {
  const q =
    "SELECT * FROM position INNER JOIN dept ON position.dept_id = dept.dept_id INNER JOIN division ON division.div_id = dept.div_id INNER JOIN company ON company.company_id = division.company_id";

  db.query(q, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(data);
    }
  });
}

function GetManagersAndRespectiveDepartments(req, res) {
  const cid = req.session.user[0].company_id;
  const q =
    "(SELECT manager_id, dept_id, d.div_id, div_name, dept_name, c.company_id, f_name, s_name FROM dept AS d INNER JOIN emp AS e ON d.manager_id = e.emp_id INNER JOIN division AS di ON d.div_id = di.div_id INNER JOIN company AS c ON di.company_id = c.company_id WHERE c.company_id = ?) UNION (SELECT manager_id, dept_id, d.div_id, div_name, dept_name, c.company_id, Null AS f_name, Null AS s_name FROM dept AS d INNER JOIN division AS di ON d.div_id = di.div_id INNER JOIN company AS c ON di.company_id = c.company_id WHERE d.manager_id IS NULL AND c.company_id = ?)";

  db.query(q, [cid, cid], (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(data);
    }
  });
}

module.exports = {
  CreateCompany,
  CreateHoliday,
  DeleteHoliday,
  GetAllDivisions,
  GetAllDepartments,
  GetAllPositions,
  GetManagersAndRespectiveDepartments,
};
