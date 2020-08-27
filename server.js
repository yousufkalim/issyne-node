require ('dotenv').config ();
const express = require ('express');

var admin = require ('firebase-admin');

var serviceAccount = require ('./issyne-c577d-firebase-adminsdk-a3244-12e7080bf4.json');

var defaultApp = admin.initializeApp ({
  credential: admin.credential.cert (serviceAccount),
  databaseURL: 'https://issyne-c577d.firebaseio.com',
});

console.log (defaultApp.name);

var bodyParser = require ('body-parser');
const app = express ();

app.use (express.json ());
app.use (bodyParser.urlencoded ({extended: true}));

app.use (express.static ('uploads'));
app.use (express.static ('chat_files'));

const studentRouters = require ('./routes/StudentRegisterRoute');
app.use ('/student', studentRouters);
const teacherRegistrationRoute = require ('./routes/TeacherRegisterRoute');
app.use ('/teacher', teacherRegistrationRoute);

const teacherRoute = require ('./routes/TeacherRoute');
app.use ('/teacher', teacherRoute);
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

app.listen (3000, () => {
  console.log ('server started');
});
