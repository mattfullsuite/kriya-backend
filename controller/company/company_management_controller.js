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

const CreateCompany = async (req, res) => {
  const { company_name, company_address } = req.body;

  const q =
    "INSERT INTO company (`company_name`, `company_loc`, `company_logo`) VALUES (?, ?, ?) ";

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
  } catch (error) {
    res.send(error);
  }
};

const UpdateCompany = (req, res) => {
  const { company_name, company_loc, company_logo } = req.body;
  const { company_id } = req.params;

  const query =
    "UPDATE `company` SET `company_name`='?',`company_loc`='?',`company_logo`='?' WHERE `company_id`=?";
  try {
    db.query(
      query,
      [company_name, company_loc, company_logo, company_id],
      (err, result) => {
        if (err) {
          res.send(err);
        } else {
          res.send("success");
        }
      }
    );
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

module.exports = { CreateCompany, UpdateCompany };
