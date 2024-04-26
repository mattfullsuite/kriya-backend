var multer = require("multer");
var fs = require("fs");

const folderPath = "src/tmp-uploads";

// Check if the folder exists
if (!fs.existsSync(folderPath)) {
  // Create the folder
  fs.mkdirSync(folderPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploadMulter = multer({ storage: storage });

module.exports = uploadMulter;
