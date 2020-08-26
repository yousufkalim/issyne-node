const express = require ('express');
const router = express.Router ();
const Firebase = require ('firebase-admin');
const {param} = require ('./ChatRoute');

router.post ('/get_rating', async function (req, res) {
  var data = JSON.parse (JSON.stringify (req.body));
  const ratingRef = Firebase.database ().ref ('rating/' + data.key);

  ratingRef.on ('value', async function (snapshot) {
    if (snapshot.val () != null) {
      res.json (snapshot.val ());
    } else {
      console.log ('inside else');
      const params = {
        key: data.key,
        rating: 3,
        ratingCount: 0,
      };
      res.json (params);
    }
  });
});

router.post ('/rate', async function (req, res) {
  var data = JSON.parse (JSON.stringify (req.body));
  console.log (req.body);
  const ratingRef = Firebase.database ().ref ('rating');
  const teacherRef = await Firebase.database ().ref ('teacher/' + data.key);
  const chatRef = await Firebase.database ().ref ('chat/' + data.commentData.chatKey);

  ratingRef
    .orderByChild ('key')
    .equalTo (data.key)
    .once ('value', async function (snapshot) {
      if (snapshot.val () != null) {
        try {
          let ratingObject = '';
          snapshot.forEach (async function (childSnapshot) {
            ratingObject = {...childSnapshot.val ()};
            ratingObject.rating =
              (parseFloat (ratingObject.rating) + parseFloat (data.rating)) / 2;
            ratingObject.ratingCount = Number (ratingObject.ratingCount) + 1;

            let comments = [...ratingObject.commentData.comments];

            const comment = {
              stundentEmail: data.commentData.stundentEmail,
              chatKey: data.commentData.chatKey,
              comment: data.commentData.comments,
              ratingGiven: data.rating,
            };
            comments.push (comment);
            ratingObject.commentData.comments = [...comments];
            await Firebase.database ()
              .ref ('rating/' + childSnapshot.key)
              .update (ratingObject);
          });
          // Get teacher databse ref with key

          teacherRef.once ('value', async function (snapshot) {
            const teacherObject = {...snapshot.val ()};
            teacherObject.rating = ratingObject.rating;
            teacherObject.ratingCount = ratingObject.ratingCount;
            teacherRef.update (teacherObject);
          });

          chatRef.once('value',async function (snapshot){
            const chatObject = {...snapshot.val()};
            chatObject.rating = data.rating;
            chatRef.update(chatObject);
          })


          res.json ({success: true, message: 'Teacher Rated Successfully'});
        
        
        
        } catch (err) {
          res.json ({
            success: false,
            message: 'Something went wrong \n' + err.message,
          });
        }
      } else {
        let comments = [];

        comment = {
          stundentEmail: data.commentData.stundentEmail,
          chatKey: data.commentData.chatKey,
          comment: data.commentData.comments,
          ratingGiven: data.rating,
        };

        comments.push (comment);
        const params = {
          key: data.key,
          rating: data.rating,
          ratingCount: 1,
          commentData: {
            comments: comments,
          },
        };
        await ratingRef.push (params);

        teacherRef.once ('value', async function (snapshot) {
          const teacherObject = {...snapshot.val ()};
          teacherObject.rating = data.rating;
          teacherObject.ratingCount = 1;
          teacherRef.update (teacherObject);
        });
        chatRef.once('value',async function (snapshot){
          const chatObject = {...snapshot.val()};
          chatObject.rating = data.rating;
          chatRef.update(chatObject);
        })

        res.json ({success: true, message: 'Teacher Rated Successfully'});
      }
    });
});

module.exports = router;
