const express = require("express");
const outputController = require("../controllers/outputController");
const multer = require("multer");

const outputRouter = express.Router();

const storage1 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/videos");
  },
  filename: function (req, file, cb) {
    //const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname);
  },
});
const storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/audio");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload1 = multer({ storage: storage1 });
const upload2 = multer({ storage: storage2 });
//const upload = multer(); //it is the middleware to access the multipart/formdata data
outputRouter.post(
  "/video",
  upload1.single("video"),
  outputController.getOutput
);
// outputRouter.post(
//   "/audio",
//   upload2.single("audio"),
//   outputController.getAudioOutput
// );
module.exports = outputRouter;
