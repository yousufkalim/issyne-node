const fs = require("fs");
var Buffer = require("buffer/").Buffer;
const Firebase = require("firebase-admin");

module.exports = (io) => {
  // Socket Connection
  io.on("connection", (socket) => {
    var useris = socket.handshake.query.userConnectionId;
    socket.on("joinRoom", ({ username }) => {
      socket.join(useris); //room join by user
      var data = { type: "", id: "" }; //data example hard coded

      //display a welcome message to the user who have joined a room
      io.emit("message", {
        userId: useris,
        username: username,
        text: `Welcome ${username}`,
      });
      //displays a joined room message to all other room users except that particular user
      socket.broadcast.to(useris).emit("message", {
        userId: useris,
        username: username,
        text: `${username} has joined the chat`,
      });
      const db = Firebase.database();
      const chatRef = db.ref("chat");
      // create chat instance in DB
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
                let teacher = await db // append teacher photo with chat db
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
                await db // append teacher photo with chat db
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
      });
    });
    //user sending message
    socket.on(
      "sendMessage",
      ({ text, username, imageFile, fileName, fileType, audioFileBuffer }) => {
        //gets the room user and the message sent
        console.log(username, "username");
        io.to(useris).emit("message", {
          userId: useris,
          username: username,
          text: text,
        });

        const db = Firebase.database();
        var data = {
          chatKey: "-Mkqa28vvM1LPB2X1H-v",
          from: "shehzad",
        };
        const chatRef = db.ref("chat/" + data.chatKey);

        let message = fileName;
        let messageType = username;
        if (imageFile !== undefined) {
          const buff = Buffer.from(imageFile, "base64"); //read image base64 file
          fs.writeFileSync(`uploads/${fileName}`, buff);
          message = imageFile.filename;
          messageType = fileType;
        } else if (audioFileBuffer !== undefined) {
          const buff = Buffer.from(audioFileBuffer, "base64"); //read audio base64 file
          fs.writeFileSync(`uploads/audio_files/${fileName}`, buff); //save file  in uploads/audio_files
          messageType = fileType;
          message = fileName;
        }
        chatRef.once("value", async function (snapshot) {
          snapshot.forEach(async function (childSnapShot) {
            const messageRef = db.ref("chat/" + data.chatKey);
            const messageChild = messageRef.child("message");
            messageChild.once("value", async function (snapshot) {
              let valClone = [];
              if (snapshot.val() != null) valClone = [...snapshot.val()];
              valClone.push({
                type: data.from,
                text: text,
                messageType: messageType,
                date: new Date().toString(),
              });
              messageChild.update(valClone);
            });
          });
          //}
        });
      }
    );

    //socket disconnected
    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};
