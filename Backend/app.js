const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const multer = require("multer");
const authMiddleware = require("./middlewares/auth.js");
const authRoute = require("./routes/auth.js");
const billRoute = require("./routes/bill.js");
const userRoute = require("./routes/user.js");

const upload = multer({ dest: "public/" });
const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use("/public", express.static("public"));
app.get("/", (req, res) => {
  res.status(200).send("Bill app backend API v1");
});
app.use(authMiddleware);
app.use(upload.single("file"));
app.use("/auth", authRoute);
app.use("/users", userRoute);
app.use("/bills", billRoute);

module.exports = app;
