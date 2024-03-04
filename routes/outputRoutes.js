const express = require("express");
const outputController = require("../controllers/outputController");
const multer = require("multer");

const outputRouter = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/videos");
  },
  filename: function (req, file, cb) {
    //const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });
//const upload = multer(); //it is the middleware to access the multipart/formdata data
outputRouter.post("/", upload.single("video"), outputController.getOutput);

module.exports = outputRouter;
