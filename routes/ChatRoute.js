const express = require("express");
const router = express.Router();
const Firebase = require("firebase-admin");
const { database } = require("firebase-admin");
const multer = require("multer");
const { json } = require("body-parser");
const moment = require("moment")
const MEDIA_TYPES = {
  text: "text",
  document: "doc",
  image: "image",
  audio: "audio",
  video: "video",
};
const MIME_TYPES = {
  jpg: "image/jpg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  mp4: "video/mp4",
  flv: "video/x-flv",
  avi: "video/x-msvideo",
  gp: "video/3gpp",
  wmv: "video/x-ms-wmv",
  pdf: "application/pdf",
  text: "text/plain",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessing",
  wav: "audio/wav",
  xwav: "audio/x-wav",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./chat_files/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  // if (file.mimeType === 'image/jpeg' || file.mimeType === 'image/png')
  cb(null, true);
  //else {
  //cb (Error('Invalid File Format'), false);
  // }
};
const upload = multer({
  storage: storage,
  // limits: {
  //   fileSize: 1024 * 1024 * 5,
  // },
  fileFilter: fileFilter,
});
router.post("/get", async function (req, res) {
  const db = Firebase.database();
  const chatRef = db.ref("chat");
  var data = JSON.parse(JSON.stringify(req.body));
  try {
    const dataArray = [];
    chatRef.once("value", async function (snapshot) {
      // console.log(snapshot.val())

      if (snapshot.val() == null) {
        res.json(dataArray);
      }
      let childs = [];
      snapshot.forEach(function (childSnapShot) {
        const childSnapshotClone = { ...childSnapShot.val() };
        childSnapshotClone.key = childSnapShot.key;
        childs.push(childSnapshotClone);
      });
      for (const childSnapShot of childs) {
        if (data.type === "student") {
          if (childSnapShot.studentEmail == data.id) {
            const childSnapshotClone = { ...childSnapShot };
            childSnapshotClone.key = childSnapShot.key;

            if (childSnapshotClone.teacherEmail != undefined) {
              let teacher = await db  // append teacher photo with chat db
                .ref("teacher")
                .orderByChild("email")
                .equalTo(childSnapshotClone.teacherEmail)
                .on("child_added", async function (snapshot, prevChildKey) {
                  let photo = snapshot.val();
                  childSnapshotClone.teacherAvatar = photo.avatar;
                  if (data.startTime && data.endTime) {
                    // start time and end time
                    let startTime = moment(data.startTime, "HH:mm:ss a");
                    let endTime = moment(data.endTime, "HH:mm:ss a");
                    // calculate total duration
                    let duration = moment.duration(endTime.diff(startTime));
                    let result = Math.abs(duration.asMinutes()) % 60;
                    let newResult = result / 5;
                    childSnapshotClone.credit = newResult;
                  }
                });
              const teacherVal = await db
                .ref("teacher")
                .orderByChild("email")
                .equalTo(childSnapshotClone.teacherEmail)
                .once("value");


              let teacherClone = null;
              await teacherVal.forEach((val) => {
                teacherClone = val;
              });
              childSnapshotClone.teacher = teacherVal;
            }
            dataArray.push(childSnapshotClone);
          }
          //  res.json(dataArray);
        } else {
          if (childSnapShot.teacherEmail == data.id) {
            const childSnapshotClone = { ...childSnapShot };
            childSnapshotClone.key = childSnapShot.key;

            if (childSnapshotClone.studentEmail != undefined) {
              await db  // append teacher photo with chat db
                .ref("student")
                .orderByChild("email")
                .equalTo(childSnapshotClone.teacherEmail)
                .on("child_added", async function (snapshot, prevChildKey) {
                  if (data.startTime && data.endTime) {
                    // start time and end time
                    let startTime = moment(data.startTime, "HH:mm:ss a");
                    let endTime = moment(data.endTime, "HH:mm:ss a");
                    // calculate total duration
                    let duration = moment.duration(endTime.diff(startTime));
                    let result = Math.abs(duration.asMinutes()) % 60;
                    let newResult = result / 5;
                    childSnapshotClone.credit = newResult;
                  }
                });
              const studentVal = await db
                .ref("student")
                .orderByChild("email")
                .equalTo(childSnapshotClone.studentEmail)
                .once("value");

              let studentClone = null;
              await studentVal.forEach((val) => {
                studentClone = val;
              });
              childSnapshotClone.student = studentClone;
            }

            dataArray.push(childSnapshotClone);
          }
          //  res.json(dataArray);
        }
      }
      res.json(dataArray);
      // snapshot.forEach(async function (childSnapShot) {
      //  // console.log(JSON.stringify(childSnapShot.val(),null,2))

      //   if (data.type === "student") {

      //     if (childSnapShot.val().studentEmail == data.id) {
      //       const childSnapshotClone = { ...childSnapShot.val() };
      //       childSnapshotClone.key = childSnapShot.key;

      //       if (childSnapshotClone.teacherEmail != undefined) {
      //         const teacherVal = await db
      //           .ref("teacher")
      //           .orderByChild("email")
      //           .equalTo(childSnapshotClone.teacherEmail)
      //           .once("value");
      //         let teacherClone = null;
      //         await teacherVal.forEach((val) => {
      //           teacherClone = val;
      //         });
      //         childSnapshotClone.teacher =  teacherVal;
      //       }
      //       dataArray.push(childSnapshotClone);
      //     }
      //     res.json(dataArray);
      //   } else {
      //     if (childSnapShot.val().teacherEmail == data.id) {
      //       const childSnapshotClone = { ...childSnapShot.val() };
      //       childSnapshotClone.key = childSnapShot.key;

      //       if (childSnapshotClone.studentEmail != undefined) {
      //         const studentVal = await db
      //           .ref("student")
      //           .orderByChild("email")
      //           .equalTo(childSnapshotClone.studentEmail)
      //           .once("value");
      //         let studentClone = null;
      //         await studentVal.forEach((val) => {
      //           studentClone = val;
      //         });
      //         childSnapshotClone.student = studentClone;
      //       }

      //       dataArray.push(childSnapshotClone);
      //     }
      //     res.json(dataArray);
      //   }
      // });
    });
  } catch (error) { }

  // try {
  //   chatRef
  //     .orderByChild ('id')
  //     .equalTo (data.id)
  //     .once ('value', async function (snapshot) {
  //       if (snapshot.val () != null) {
  //         snapshot.forEach (function (childSnapShot) {
  //           res.json ({
  //             key: childSnapShot.key,
  //             message: childSnapShot.val ().message,
  //           });
  //         });
  //       }
  //       return null;
  //     });
  // } catch (error) {
  //   return null;
  // }
});

router.post("/get_chat_by_key", async function (req, res) {
  const db = Firebase.database();
  const chatRef = db.ref("chat");
  var data = JSON.parse(JSON.stringify(req.body));
  const keyRef = chatRef.child(data.key);
  keyRef.once("value", async (snapshot) => {
    if (snapshot.val() != null) {
      res.json(snapshot);
    }
  });
});

// Function to get message type
function getMessageType(mimeType) {
  if (
    mimeType === MIME_TYPES.png ||
    mimeType === MIME_TYPES.jpeg ||
    mimeType === MIME_TYPES.jpg ||
    mimeType === MIME_TYPES.webp
  )
    return MEDIA_TYPES.image;

  if (
    mimeType === MIME_TYPES.avi ||
    mimeType === MIME_TYPES.flv ||
    mimeType === MIME_TYPES.mp4 ||
    mimeType === MIME_TYPES.wmv ||
    mimeType === MIME_TYPES.gp
  )
    return MEDIA_TYPES.video;
  if (
    mimeType === MIME_TYPES.pdf ||
    mimeType === MIME_TYPES.doc ||
    mimeType === MIME_TYPES.docx ||
    mimeType === MIME_TYPES.text
  )
    return MEDIA_TYPES.document;

  if (mimeType === MIME_TYPES.wav || mimeType === MIME_TYPES.xwav)
    return MEDIA_TYPES.audio;
  else return null;
}

router.post("/send_message", upload.single("media"), async function (req, res) {
  try {
    console.log(JSON.stringify(req.body));
    const db = Firebase.database();
    var data = JSON.parse(JSON.stringify(req.body));
    const chatRef = db.ref("chat/" + data.chatKey);

    let message = "";
    let messageType = MEDIA_TYPES.text;
    if (req.file != undefined) {
      messageType = getMessageType(req.file.mimetype);

      // If mime type is invalid
      if (messageType == null) {
        return res.json({ success: false });
      }

      let path = req.file.path.split("\\");
      message = req.file.filename;
    } else message = data.message;
    console.log("dulasd " + JSON.stringify(req.file));
    chatRef.once("value", async function (snapshot) {
      snapshot.forEach(async function (childSnapShot) {
        const messageRef = db.ref("chat/" + data.chatKey);
        const messageChild = messageRef.child("message");
        messageChild.once("value", async function (snapshot) {
          let valClone = [];
          if (snapshot.val() != null) valClone = [...snapshot.val()];
          valClone.push({
            type: data.from,
            text: message,
            messageType: messageType,
            date: new Date().toString(),
          });
          messageChild.update(valClone);
        });
      });
      //}
    });

    var payload = {
      data: {
        message: message,
        type: req.body.from,
        messageType: messageType,
      },
      token: req.body.token,
    };
    // console.log (JSON.stringify (payload));
    Firebase.messaging()
      .send(payload)
      .then((response) => {
        // Response is a message ID string.
        res.json({ success: true });
        console.log("Successfully sent message:", response);
      })
      .catch((error) => {
        res.json({ success: false });

        console.log("Error sending message:", error);
      });
  } catch (error) {
    return res.json(null);
  }
});

// update credit

router.post("/update_credit", async function (req, res) {

  try {
    // start time and end time
    var startTime = moment(req.body.startTime, "HH:mm:ss a");
    var endTime = moment(req.body.endTime, "HH:mm:ss a");
    // calculate total duration
    var duration = moment.duration(endTime.diff(startTime));
    let result = Math.abs(duration.asMinutes()) % 60;
    let newResult = result / 5;
    return res.json({ result: newResult });

  } catch (error) {
    return res.json({ message: error.message });

  }


})

module.exports = router;
