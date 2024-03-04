const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;

ffmpeg.setFfmpegPath(ffmpegPath);

async function extractFramesFromBlob(videoPath, targetHeight, targetWidth) {
  return new Promise((resolve, reject) => {
    const outputPath = "public/frames/frame-%d.jpg"; // Path to save extracted frames
    const fps = 1;
    //const frameInterval = Math.round(1 / fps);

    ffmpeg(videoPath)
      .outputOptions(`-vf fps=${fps},scale=${targetWidth}:${targetHeight}`)
      .output(outputPath)
      .on("end", () => {
        console.log("Frames extracted successfully");

        resolve(outputPath);
        fs.unlink(videoPath, function (err) {
          if (err) throw err;
          console.log("video deleted");
        });
      })
      .on("error", (err) => {
        console.error("Error extracting frames:", err);
        reject(err);
      })
      .run();
  });
}
// async function createBlob(filePath) {
//   const fileBuffer = fs.readFileSync(filePath);

//   const blob = new Blob([fileBuffer], { type: "image/jpeg" });
//   return blob;
// }

// async function getFramesFromDirectory(directoryPath) {
//   let framesArray = [];
//   fs.readdir(directoryPath, (err, files) => {
//     if (err) {
//       console.error("Error reading directory:", err);
//       return;
//     }
//     files.forEach((file) => {
//       // console.log(file);
//       const fullPath = path.join(directoryPath, file);
//       // console.log(fullPath);
//       framesArray.push(fullPath);
//     });
//     //console.log(framesArray);
//   });
//   return framesArray;

// }

exports.getOutput = async (req, res) => {
  // const blob = new Blob(["hello world"], { type: "text/plain" });
  // var blobUrl = URL.createObjectURL(blob);

  console.log(req.file);
  var video = new Blob([req.file]);
  var videoUrl = URL.createObjectURL(video); //here we create the url pointing to the videoblob that we get.
  // const response = await fetch(videoUrl);
  // const videoBlob = await response.blob();
  // console.log(videoBlob);
  const videoPath = req.file.path;

  //const outputPath = "/public/frames";
  //frames size information
  const targetHeight = 250;
  const targetWidth = 250;

  //extract frames and save it locally
  const extractedFrames = await extractFramesFromBlob(
    videoPath,
    targetHeight,
    targetWidth
  );
  const directoryPath = "public/frames"; //setting directory path from where we have to pull the images.

  fs.readdir(directoryPath, async (err, files) => {
    let framesArray = [];
    if (err) {
      console.error("Error reading directory:", err);
      return;
    }
    files.forEach((file) => {
      // console.log(file);
      const fullPath = path.join(directoryPath, file);
      // console.log(fullPath);
      framesArray.push(fullPath);
    });

    //const frameBlob = new Blob(framesArray,{type:});
    // const formData = new FormData();
    // const frameBlobs = await Promise.all(
    //   framesArray.map((filePath) => {
    //     createBlob(filePath);
    //   })
    // );
    // async function createBlob(filePath) {
    //   const fileBuffer = fs.readFileSync(filePath);

    //   const blob = new Blob([fileBuffer], { type: "image/jpeg" });
    //   return blob;
    // }
    console.log(framesArray);
    // const frameBlobs = framesArray.map((path) => {
    //   console.log(path);
    //   new Blob([fs.readFileSync(path)], { type: "image/jpeg" });
    // });
    let frameBlobs = [];
    framesArray.forEach((path) => {
      const fileBuffer = fs.readFileSync(path);
      const blob = new Blob([fileBuffer], { type: "image/jpeg" });
      frameBlobs.push(blob);
    });
    console.log(frameBlobs);
    const formData = new FormData();
    frameBlobs.forEach((blob, index) => {
      formData.append(`image${index}`, blob, `image${index}.jpg`);
    });
    console.log(formData);
    try {
      await fetch("http://127.0.0.1:5000", {
        method: "POST",
        //   headers: { "Content-Type": "multipart/form-data" },
        body: formData,
      });
    } catch (err) {
      console.log(err);
    }
  });
  //console.log(framesArray);

  //console.log(extractedFrames);
  //const framesForFlask = [];

  // console.log(extractedFrames);
  console.log(videoUrl);

  console.log(video);
  //console.log(obtainedString);
  res.status(200).json({
    status: "success",
    data: {
      extractedFrames,
    },
  });
};
