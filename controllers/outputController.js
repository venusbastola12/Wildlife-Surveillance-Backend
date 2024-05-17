const fs = require("fs");
const { readdir } = require("node:fs/promises");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
//const ffprobePath = require("@ffprobe-installer/ffprobe").path;

ffmpeg.setFfmpegPath(ffmpegPath);
//ffmpeg.setFfprobePath(ffprobePath);

async function extractFramesFromBlob(
  videoPath,

  targetHeight,
  targetWidth
) {
  return new Promise((resolve, reject) => {
    const outputPath = "public/frames/frame-%d.jpg"; // Path to save extracted frames
    //const audioPath = "public/audio/audio.mp3"; //path to save extracted audio.
    const fps = 1;

    ffmpeg(videoPath)
      .outputOptions(`-vf fps=${fps},scale=${targetWidth}:${targetHeight}`)

      .output(outputPath)

      .on("end", () => {
        console.log("Frames extracted successfully");

        resolve(outputPath);
      })
      .on("error", (err) => {
        console.error("Error extracting frames:", err);
        reject(err);
      })
      .run();
  });
}
async function extractAudioFromVideo(VideoPath) {
  return new Promise((resolve, reject) => {
    const audioPath = `public/audio/audio.mp3`;

    const extractAudio = ffmpeg();
    extractAudio.input(VideoPath);
    extractAudio.outputFormat("mp3");
    extractAudio.output(audioPath);
    extractAudio
      .on("end", () => {
        console.log("audio extracted successfully");
        resolve(audioPath);
        fs.unlink(VideoPath, function (err) {
          if (err) throw err;
          console.log("video deleted");
        });
      })
      .on("error", (err) => {
        console.error("error occurred:", err);
        reject(err);
      })
      .run();
  });
}

exports.getOutput = async (req, res) => {
  console.log(req.file);
  var video = new Blob([req.file]);
  var videoUrl = URL.createObjectURL(video); //here we create the url pointing to the videoblob that we get.

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
  const extractedAudio = await extractAudioFromVideo(videoPath);
  console.log(extractedFrames);
  console.log(extractedAudio);

  const directoryPath = "public/frames"; //setting directory path from where we have to pull the images.

  let finalData = [];
  let finalAudio = [];
  try {
    const files = await readdir(directoryPath);
    let framesArray = [];
    files.forEach((file) => {
      // console.log(file);
      const fullPath = path.join(directoryPath, file);
      console.log(fullPath);
      framesArray.push(fullPath);
    });

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
      const response = await fetch("http://127.0.0.1:5000/vision", {
        method: "POST",
        //   headers: { "Content-Type": "multipart/form-data" },
        body: formData,
      });

      const outputData = await response.json();

      console.log(outputData);
      const data = outputData.predictions;
      console.log(data);

      for (let i = 0; i < data.length; i++) {
        if (data[i] != "null") {
          finalData.push([i + 1, data[i]]);
        }
      }
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
  console.log(finalData);
  const audioDirectory = "public/audio";
  try {
    const files = await readdir(audioDirectory);
    console.log(files[0]);
    const fullPath = path.join(audioDirectory, files[0]);
    const fileBuffer = fs.readFileSync(fullPath);
    //console.log(fileBuffer);
    const audioBlob = new Blob([fileBuffer], { type: files[0].type });
    console.log("this is audio blob", audioBlob);

    const formData = new FormData();
    formData.append("audio", audioBlob, "audio.mp3");
    console.log(formData);
    try {
      const response = await fetch("http://127.0.0.1:5000/audio", {
        method: "POST",
        //   headers: { "Content-Type": "multipart/form-data" },
        body: formData,
      });
      const output = await response.json();
      // const data2 = output.data;
      // for (let i = 0; i < data2.lenght; i++) {
      //   if (data2[i] != "null") {
      //     finalAudio.push(i + 1, data2[i]);
      //   }
      // }
      console.log(output);
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
  res.status(200).json({
    status: "success",
    data1: {
      finalData,
    },
    data2: {
      finalAudio,
    },
  });
};
