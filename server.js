require("dotenv").config();

const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");

const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});
require("./services/socket-io.js")(io);

var admin = require("firebase-admin");

var serviceAccount = require("./issyne-383fb-firebase-adminsdk-npzf4-97f3eb7fd3.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://issyne-383fb-default-rtdb.firebaseio.com",
});
app.use(morgan("dev"));

app.use(cors());
app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");

  next();
});
const path = require("path");

app.use("/uploads", express.static("uploads", { maxAge: 36000000 }));
app.use("/chat_files", express.static(path.join(__dirname, "chat_files")));

const studentRouters = require("./routes/StudentRegisterRoute");
app.use("/student", studentRouters);
const teacherRegistrationRoute = require("./routes/TeacherRegisterRoute");
app.use("/teacher", teacherRegistrationRoute);

const teacherRoute = require("./routes/TeacherRoute");
app.use("/teacher", teacherRoute);

const studentRoute = require("./routes/StudentRoute");
app.use("/student", studentRoute);

const reportTeacher = require("./routes/ReportTeacherRoute");
app.use("/", reportTeacher);
const loginRoute = require("./routes/LoginRoute");
app.use("/", loginRoute);
const chatRoute = require("./routes/ChatRoute");
app.use("/chat", chatRoute);

const stripeRoute = require("./routes/StripeRoute");
app.use("/payment", stripeRoute);

const notificationCenter = require("./routes/NotificaionCenter");
app.use("/", notificationCenter);
const rating = require("./routes/Rating");
app.use("/", rating);

const creditRoute = require("./routes/CreditRoute");
app.use("/", creditRoute);

const changeProfilePicRoute = require("./routes/ChangeProfilePicRoute");
app.use("/", changeProfilePicRoute);
const ChangePasswordRoute = require("./routes/ChangePasswordRoute");
app.use("/", ChangePasswordRoute);

const AdminPanelRoute = require("./routes/AdminPanelRoute");
app.use("/admin_panel", AdminPanelRoute);

const PackagesRoute = require("./routes/PackagesRoute");
app.use("/", PackagesRoute);

// start server
const port = process.env.PORT || 5000;
server.listen(port, function () {
  console.log("Server listening on port " + port);
});
