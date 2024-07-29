var db = require("../../config.js");
var cloudinary = require("../../handlers/utilities/cloudinary.js");
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

const CreateCompany = async (req, res) => {
  const { company_name, company_loc } = req.body;

  const q =
    "INSERT INTO company (`company_name`, `company_loc`, `company_logo`) VALUES (?, ?, ?) ";

  try {
    if (req.file) {
      // Upload image to Cloudinary
      const result = await uploadImage(req.file.path, company_name);
      if (result != null) {
        if (company_name != undefined || company_name != "") {
          db.query(
            q,
            [company_name, company_loc, result.secure_url],
            (err, data) => {
              if (err) {
                console.log("Error!", err);
                res.send(err);
              } else {
                res.sendStatus(200);
              }
            }
          );
        } else {
          res.sendStatus(400);
        }
      }
    }
  } catch (error) {
    res.send(error);
  }
};

const UpdateCompany = async (req, res) => {
  const { company_name, company_loc } = req.body;
  const { company_id } = req.params;

  let query;
  let values;
  let secureURL;
  if (!req.file) {
    query =
      "UPDATE `company` SET `company_name`= ?, `company_loc`= ? WHERE `company_id`=?";
    values = [company_name, company_loc, company_id];
  } else {
    // Upload image to Cloudinary
    const result = await uploadImage(req.file.path, company_name);
    if (result != null) {
      secureURL = result.secure_url;
    }
    query =
      "UPDATE `company` SET `company_name`= ?, `company_loc`= ?,`company_logo`= ? WHERE `company_id`=?";
    values = [company_name, company_loc, secureURL, company_id];
  }
  try {
    db.query(query, values, (err, result) => {
      if (err) {
        console.log("Error: ", err);
        res.send(err);
      } else {
        console.log("Success");
        res.sendStatus(200);
      }
    });
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const GetCompanies = (req, res) => {
  const query = "SELECT * FROM `company`";
  try {
    db.query(query, (err, result) => {
      if (err) {
        res.send(err);
      } else {
        return res.json(result);
      }
    });
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

module.exports = { CreateCompany, UpdateCompany, GetCompanies };
