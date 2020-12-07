const express = require ('express');
const router = express.Router ();
const Firebase = require ('firebase-admin');
const notification_options = {
  priority: 'high',
  timeToLive: 60 * 60 * 24,
  contentAvailable: true,
  
};
const data = {peson:'12'};
const strif = JSON.stringify(data);
console.log(strif)
// var payload = {
//     notification: {
//       title: "This is a Notification",
//       body: "This is the body of the notification message."
//     },
//     'data': { 
//       send: 'asv' 
// }

//   };





router.post ('/push_notification', async function (req, res) {
  const registrationToken = req.body.token;
  const message = req.body.message;
  const options = notification_options;
  var payload = {
    notification: req.body.notificaton,
    'data': req.body.data,

  };
  // const notification_options = {
  //   priority: 'high',
  //   timeToLive: 60 * 60 * 24,
  //   token: {
  //     key: "../push_notificaiont_ios_auth_key/AuthKey_WRLA83HZ5V.p8",
  //     keyId: "WRLA83HZ5V", //generated with the .p8 file
  //     teamId: "NLW78DB7MD", // You can find it on https://developer.apple.com/account/#/membership
  //   },
  // };
console.log(registrationToken)
  Firebase
    .messaging ()
    .sendToDevice (registrationToken, payload, options)
    .then (response => {
      console.log('notificaion sent')
      res.json({success:true,message:'notification sent'})
      // res.status (200).send ('Notification sent successfully');
    })
    .catch (error => {
      res.json({success:true,message:'notification sent'})

      console.log (error);
    });
});

module.exports = router;
