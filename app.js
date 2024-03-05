const express = require("express");
const dbConnect = require("./server");
const outputRouter = require("./routes/outputRoutes");
const Image = require("./firebase/config");
const ImageRouter = require("./routes/imageRoutes");
const cors = require("cors");

dbConnect();
const app = express();
app.use(cors());
app.use(express.json()); //body parser middleware..
// app.use("/api/v1/user", userRoutes);
app.use("/api/v1/output", outputRouter);

app.use("/addImage", ImageRouter);

app.listen(process.env.PORT, () => {
  console.log(`server started at ${process.env.PORT}...`);
});
