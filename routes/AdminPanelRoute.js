const express = require("express");
const router = express.Router();

const Firebase = require("firebase-admin");
const db = Firebase.database();
const studentRef = db.ref("student");
const teacherRef = db.ref("teacher");
const creditRoute = db.ref("credit");
const ratingRoute = db.ref("rating");
const chatRef = db.ref("chat");
router.get("/get_student", async (req, res) => {
  const students = [];
  await studentRef.once("value", async function (snapshot) {
    if (snapshot.val() != null) {
      // Check if student table is not empty

      snapshot.forEach(function (childsnapshot) {
        students.push(childsnapshot.val());
        // console.log(childsnapshot.val());
      });
      //res.json(students);
    }
  });

  let studentPromise = students.map(async function (student, index) {
    const count = await getAmountOfSessionsPaid(student);
    students[index].amountOfSessionsPaid = count;
  });

  await Promise.all(studentPromise);
  console.log(students[0]);
});

// function to get amount of sessions paid by the student
async function getAmountOfSessionsPaid(student) {
  var count = 0;
  try {
    await chatRef
      .orderByChild("studentEmail")
      .equalTo(student.email)
      .once("value", async function (snapshot) {
        if (snapshot.val() === null) return count;
        snapshot.forEach(function (childsnapshot) {
          ++count;
        });
      });
    return count;
  } catch (error) {
    console.log("inside error");
    return count;
  }
}

module.exports = router;
