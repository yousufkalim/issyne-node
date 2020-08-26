const express = require ('express');
const router = express.Router ();
const Firebase = require ('firebase-admin');
const notification_options = {
  priority: 'high',
  timeToLive: 60 * 60 * 24,
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
