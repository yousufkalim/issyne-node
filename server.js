require ('dotenv').config ();
const express = require ('express');
const cors = require('cors');

var admin = require ('firebase-admin');

var serviceAccount = require ('./issyne-c577d-firebase-adminsdk-a3244-12e7080bf4.json');

var defaultApp = admin.initializeApp ({
  credential: admin.credential.cert (serviceAccount),
  databaseURL: 'https://issyne-c577d.firebaseio.com',
});


var bodyParser = require ('body-parser');
const app = express ();


app.use(cors());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");

   next();
});


app.use (express.json ());
app.use (bodyParser.urlencoded ({extended: true}));


const path = require('path');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/uploads',express.static(path.join(__dirname,'uploads')))
app.use('/chat_files',express.static(path.join(__dirname,'chat_files')))

const studentRouters = require ('./routes/StudentRegisterRoute');
app.use ('/student', studentRouters);
const teacherRegistrationRoute = require ('./routes/TeacherRegisterRoute');
app.use ('/teacher', teacherRegistrationRoute);

const teacherRoute = require ('./routes/TeacherRoute');
app.use ('/teacher', teacherRoute);

const studentRoute = require ('./routes/StudentRoute');
app.use ('/student', studentRoute);

const reportTeacher = require ('./routes/ReportTeacherRoute');
app.use ('/', reportTeacher);
const loginRoute = require ('./routes/LoginRoute');
app.use ('/', loginRoute);
const chatRoute = require ('./routes/ChatRoute');
app.use ('/chat', chatRoute);

const stripeRoute = require ('./routes/StripeRoute');
app.use ('/payment', stripeRoute);

const notificationCenter = require ('./routes/NotificaionCenter');
app.use ('/', notificationCenter);
const rating = require ('./routes/Rating');
app.use ('/', rating);

const creditRoute = require ('./routes/CreditRoute');
app.use ('/', creditRoute);

const changeProfilePicRoute = require('./routes/ChangeProfilePicRoute');
app.use('/',changeProfilePicRoute);
const ChangePasswordRoute = require('./routes/ChangePasswordRoute');
app.use('/',ChangePasswordRoute);

const AdminPanelRoute = require('./routes/AdminPanelRoute');
app.use('/admin_panel',AdminPanelRoute);

const PackagesRoute = require('./routes/PackagesRoute');
app.use('/',PackagesRoute);

app.listen (4000, () => {
  console.log ('server started');
});
