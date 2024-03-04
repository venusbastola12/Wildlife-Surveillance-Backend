const express = require("express");
const imageController = require("../controllers/imageController");

const imageRouter = express.Router();
imageRouter.get("/", imageController.getImage);
imageRouter.post("/", imageController.addImage);

module.exports = imageRouter;
