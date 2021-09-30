const express = require("express");
const router = express.Router();
const Firebase = require("firebase-admin");
const { param } = require("./ChatRoute");

router.post("/get_rating", async function (req, res) {
  var data = JSON.parse(JSON.stringify(req.body));
  const ratingRef = Firebase.database().ref("rating/" + data.key);

  ratingRef.on("value", async function (snapshot) {
    if (snapshot.val() != null) {
      res.json(snapshot.val());
    } else {
      console.log("inside else");
      const params = {
        key: data.key,

        ratingCount: 0,
      };
      res.json(params);
    }
  });
});

router.post("/rate", async function (req, res) {
  var data = JSON.parse(JSON.stringify(req.body));
  console.log("RATING", "\n\n\n\n\n\n" + data.rating);
  console.log(req.body);
  const ratingRef = Firebase.database().ref("rating");
  const teacherRef = await Firebase.database().ref("teacher/" + data.key);
  const chatRef = await Firebase.database().ref(
    "chat/" + data.commentData.chatKey
  );

  ratingRef
    .orderByChild("key")
    .equalTo(data.key)
    .once("value", async function (snapshot) {
      if (snapshot.val() != null) {
        try {
          let ratingObject = "";
          snapshot.forEach(async function (childSnapshot) {
            ratingObject = { ...childSnapshot.val() };
            ratingObject.rating =
              (parseFloat(ratingObject.rating) + parseFloat(data.rating)) / 2;
            ratingObject.ratingCount = Number(ratingObject.ratingCount) + 1;

            let comments = [...ratingObject.commentData.comments];

            const comment = {
              stundentEmail: data.commentData.stundentEmail,
              chatKey: data.commentData.chatKey,
              comment: data.commentData.comments,
              ratingGiven: data.rating,
            };
            comments.push(comment);
            ratingObject.commentData.comments = [...comments];
            await Firebase.database()
              .ref("rating/" + childSnapshot.key)
              .update(ratingObject);
          });
          // Get teacher databse ref with key

          teacherRef.once("value", async function (snapshot) {
            const teacherObject = { ...snapshot.val() };
            teacherObject.rating = ratingObject.rating;
            teacherObject.ratingCount = ratingObject.ratingCount;
            teacherRef.update(teacherObject);
          });

          chatRef.once("value", async function (snapshot) {
            const chatObject = { ...snapshot.val() };
            if (data.rating != -1) chatObject.rating = data.rating;
            chatRef.update(chatObject);
          });

          res.json({ success: true, message: "Enseignant évalué avec succès" });
        } catch (err) {
          res.json({
            success: false,
            message: "Quelque chose s'est mal passé \n" + err.message,
          });
        }
      } else {
        let comments = [];
        if (data.rating != -1)
          comment = {
            stundentEmail: data.commentData.stundentEmail,
            chatKey: data.commentData.chatKey,
            comment: data.commentData.comments,
            ratingGiven: data.rating,
          };
        else
          comment = {
            stundentEmail: data.commentData.stundentEmail,
            chatKey: data.commentData.chatKey,
            comment: data.commentData.comments,
          };
        comments.push(comment);
        let params = {};
        if (data.rating != -1) {
          params = {
            key: data.key,
            rating: data.rating,
            ratingCount: 1,
            commentData: {
              comments: comments,
            },
          };
        } else {
          params = {
            key: data.key,
            rating: data.rating,

            commentData: {
              comments: comments,
            },
          };
        }

        await ratingRef.push(params);

        teacherRef.once("value", async function (snapshot) {
          const teacherObject = { ...snapshot.val() };
          if (data.rating != -1) teacherObject.rating = data.rating;
          teacherObject.ratingCount = 1;
          teacherRef.update(teacherObject);
        });
        chatRef.once("value", async function (snapshot) {
          const chatObject = { ...snapshot.val() };
          if (data.rating != -1) chatObject.rating = data.rating;
          chatRef.update(chatObject);
        });

        res.json({ success: true, message: "Enseignant évalué avec succès" });
      }
    });
});

module.exports = router;
