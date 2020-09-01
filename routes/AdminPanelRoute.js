const express = require ('express');
const router = express.Router ();
const bcrypt = require ('bcrypt');

const Firebase = require ('firebase-admin');
const db = Firebase.database ();
const studentRef = db.ref ('student');
const teacherRef = db.ref ('teacher');
const creditRef = db.ref ('credit');
const ratingRef = db.ref ('rating');
const reportTeacher = db.ref ('report_teacher');
const adminRef = db.ref ('admin');
const chatRef = db.ref ('chat');

//============== Start Of Student Services ===================

router.get ('/get_student', async (req, res) => {
  const students = [];
  await studentRef.once ('value', async function (snapshot) {
    if (snapshot.val () != null) {
      // Check if student table is not empty

      snapshot.forEach (function (childsnapshot) {
        students.push (childsnapshot.val ());
        // console.log(childsnapshot.val());
      });
      //res.json(students);
    }
  });

  let numberOfSessionsPaidPromise = students.map (async function (
    student,
    index
  ) {
    const count = await getAmountOfSessionsPaid (student);
    students[index].amountOfSessionsPaid = count;
  });

  let totalCashPaidPromise = students.map (async function (student, index) {
    const totalCash = await getTotalCashSpent (student);
    students[index].totalCashSpent = totalCash;
  });

  let totalCasesFiledPromise = students.map (async function (student, index) {
    const reports = await getTotalTeachersReported (student);
    students[index].totalReportsFiled = reports;
  });

  let averageRatingPromise = students.map (async function (student, index) {
    const averageRating = await getAverageRatingGiven (student);
    students[index].averageRatingGiven = averageRating;
  });

  await Promise.all (numberOfSessionsPaidPromise);
  await Promise.all (totalCashPaidPromise);
  await Promise.all (totalCasesFiledPromise);
  await Promise.all (averageRatingPromise);

  console.log (JSON.stringify (students));
});

// function to get amount of sessions paid by the student
async function getAmountOfSessionsPaid (student) {
  var count = 0;
  try {
    await chatRef
      .orderByChild ('studentEmail')
      .equalTo (student.email)
      .once ('value', async function (snapshot) {
        if (snapshot.val () === null) return count;
        snapshot.forEach (function (childsnapshot) {
          ++count;
        });
      });
    return count;
  } catch (error) {
    console.log ('inside error');
    return count;
  }
}

// function to get total cash spent by the student
async function getTotalCashSpent (student) {
  var totalAmountSpent = 0;
  try {
    await creditRef
      .orderByChild ('email')
      .equalTo (student.email)
      .once ('value', async function (snapshot) {
        if (snapshot.val () === null) return totalAmountSpent;
        snapshot.forEach (function (childsnapshot) {
          totalAmountSpent = childsnapshot.val ().amountPaid;
        });
      });
    return totalAmountSpent;
  } catch (error) {
    console.log ('inside error');
    return totalAmountSpent;
  }
}

// function to average rating given to teacher
async function getAverageRatingGiven (student) {
  var averageRating = 0; // Average rating given by student
  var totalRatings = 0; // Total no of ratings given by student
  var ratingSum = 0; // Sum of all ratings given by the student
  try {
    await ratingRef.once ('value', async function (snapshot) {
      if (snapshot.val () != null) {
        snapshot.forEach (function (childsnapshot) {
          if (childsnapshot.val () != null) {
            const childsnapshotClone = {...childsnapshot.val ()};
            const comments = childsnapshotClone.commentData.comments;

            comments.forEach (function (comment) {
              if (student.email === comment.stundentEmail) {
                ++totalRatings; // add number of ratings of a given email
                ratingSum += comment.ratingGiven; // Add eacht rating given by student on each chat
              }
            });
          }
        });
      }
    });
    averageRating = ratingSum / totalRatings;
    if (isNaN (averageRating)) {
      // if the student has not given any rating then the value would be undefined retun 0 in that case
      return 0;
    }
    return averageRating.toFixed (2);
  } catch (error) {
    return averageRating; // in case of an error return default value of average rating
  }
}

// function to get total complains filed by student
async function getTotalTeachersReported (student) {
  var totalReports = 0;
  try {
    await reportTeacher
      .orderByChild ('studentEmail')
      .equalTo (student.email)
      .once ('value', async function (snapshot) {
        if (snapshot.val () === null) return totalReports;
        snapshot.forEach (function (childsnapshot) {
          ++totalReports;
        });
      });
    return totalReports;
  } catch (error) {
    console.log ('inside error ' + error.message);
    return totalReports;
  }
}
//============== End Of Student Services ===================

//============== Start Of Teacher Services ==================

router.get ('/get_teacher', async (req, res) => {
  const teachers = [];
  const teacherKeys = [];
  await teacherRef.once ('value', async function (snapshot) {
    if (snapshot.val () != null) {
      // Check if student table is not empty

      snapshot.forEach (function (childsnapshot) {
        teachers.push (childsnapshot.val ());
        teacherKeys.push (childsnapshot.key);
      });
    }
  });

  let numberOfCoursesDone = teachers.map (async function (teacher, index) {
    const count = await getNumberOfCoursesDone (teacher);
    teachers[index].numberOfCoursesDone = count;
    teachers[index].amountEarned = count;
  });

  let totalCasesFiledPromise = teachers.map (async function (teacher, index) {
    const reports = await getNumberOfComplainsReported (teacher);
    teachers[index].totalReportsFiled = reports;
  });

  await Promise.all (numberOfCoursesDone);
  await Promise.all (totalCasesFiledPromise);
  res.json (teachers);
});

async function getNumberOfCoursesDone (teacher) {
  var count = 0;
  try {
    await chatRef
      .orderByChild ('teacherEmail')
      .equalTo (teacher.email)
      .once ('value', async function (snapshot) {
        if (snapshot.val () === null) return count;
        snapshot.forEach (function (childsnapshot) {
          ++count;
        });
      });
    return count;
  } catch (error) {
    console.log ('inside error');
    return count;
  }
}

// function to get total complains filed by student
async function getNumberOfComplainsReported (teacher) {
  var totalReports = 0;
  try {
    await reportTeacher
      .orderByChild ('teacherEmail')
      .equalTo (teacher.email)
      .once ('value', async function (snapshot) {
        if (snapshot.val () === null) return totalReports;
        snapshot.forEach (function (childsnapshot) {
          ++totalReports;
        });
      });
    return totalReports;
  } catch (error) {
    console.log ('inside error ' + error.message);
    return totalReports;
  }
}

//============== End Of Teacher Services   ==================

//============== Start Of Courses Services    ==================

router.get ('/get_courses', async (req, res) => {
  const courses = [];
  const keys = [];
  await chatRef.once ('value', async function (snapshot) {
    if (snapshot.val () != null) {
      // Check if student table is not empty

      snapshot.forEach (function (childsnapshot) {
        courses.push (childsnapshot.val ());
        keys.push (childsnapshot.key);
      });
    }

    let teachersPromise = courses.map (async function (course, index) {
      const teacher = await getTeacherByEmail (course.teacherEmail);
      courses[index].teacher = teacher;
    });
    let studentsPromise = courses.map (async function (course, index) {
      const student = await getStudentByEmail (course.studentEmail);
      courses[index].student = student;
    });

    let ratingPromise = keys.map (async function (key, index) {
      const rating = await getRatingByChatKey (key);
      courses[index].rating = rating;
    });

    let issueReportedPromise = keys.map (async function (key, index) {
      const reported = await getIssueReported (key);
      courses[index].issueReported = reported;
    });

    await Promise.all (teachersPromise);
    await Promise.all (studentsPromise);
    await Promise.all (ratingPromise);
    await Promise.all (issueReportedPromise);
  });
  return;

  let numberOfCoursesDone = teachers.map (async function (teacher, index) {
    const count = await getNumberOfCoursesDone (teacher);
    teachers[index].numberOfCoursesDone = count;
    teachers[index].amountEarned = count;
  });

  let totalCasesFiledPromise = teachers.map (async function (teacher, index) {
    const reports = await getNumberOfComplainsReported (teacher);
    teachers[index].totalReportsFiled = reports;
  });

  await Promise.all (numberOfCoursesDone);
  await Promise.all (totalCasesFiledPromise);
  res.json (teachers);
});

async function getTeacherByEmail (email) {
  var teacher = {};
  try {
    await teacherRef
      .orderByChild ('email')
      .equalTo (email)
      .once ('value', function (snapshot) {
        if (snapshot.val () != null)
          snapshot.forEach (function (childsnapshot) {
            teacher = childsnapshot.val ();
          });
      });
    return teacher;
  } catch (error) {
    console.log (error.message);
    return teacher;
  }
}

async function getStudentByEmail (email) {
  var student = {};
  try {
    await studentRef
      .orderByChild ('email')
      .equalTo (email)
      .once ('value', function (snapshot) {
        if (snapshot.val () != null)
          snapshot.forEach (function (childsnapshot) {
            student = childsnapshot.val ();
          });
      });
    return student;
  } catch (error) {
    console.log (error.message);
    return student;
  }
}

// function to average rating given to teacher
async function getRatingByChatKey (chatKey) {
  var rating = 0; // Average rating given by student

  try {
    await ratingRef.once ('value', async function (snapshot) {
      if (snapshot.val () != null) {
        snapshot.forEach (function (childsnapshot) {
          if (childsnapshot.val () != null) {
            const childsnapshotClone = {...childsnapshot.val ()};
            const comments = childsnapshotClone.commentData.comments;

            comments.forEach (function (comment) {
              if (chatKey === comment.chatKey) {
                rating = comment.ratingGiven;
              }
            });
          }
        });
      }
    });
    if (isNaN (rating)) {
      // if the student has not given any rating then the value would be undefined retun 0 in that case
      return 0;
    }
    return rating;
  } catch (error) {
    return rating; // in case of an error return default value of average rating
  }
}
//function to check if an issue was reported against and chat and the issue reported
async function getIssueReported (chatKey) {
  let issue = {isReported: false, comment: ''};
  try {
    await reportTeacher
      .orderByChild ('chatKey')
      .equalTo (chatKey)
      .once ('value', async function (snapshot) {
        if (snapshot.val () != null) {
          snapshot.forEach (function (childsnapshot) {
            issue.isReported = true;
            issue.comment = childsnapshot.val ().report;
          });
        }
      });
    return issue;
  } catch (error) {
    console.log (error.message);
    return issue;
  }
}
//============== End Of Courses Services    ==================

//============== Admin Registartion Start   ===================

router.post ('/register', async (req, res) => {
  var data = JSON.parse (JSON.stringify (req.body));
  if (data.email != undefined && data.password != undefined) {
    const hashedPassword = await bcrypt.hash (data.password, 10);
    try {
      await adminRef.push ({email: data.email, password: hashedPassword});
      res.json ({success: true});
    } catch (error) {
      res.json ({success: false, error: error.message});
    }
  }
});

router.post ('/login', async (req, res) => {
  console.log (JSON.stringify (req.body));
  var data = JSON.parse (JSON.stringify (req.body));

  adminRef
    .orderByChild ('email')
    .equalTo (data.email)
    .once ('value', async function (snapshot) {
      if (snapshot.val () === null) {
        res.json ({success: false, message: 'Email does not exist'});
      } else {
        const val = snapshot.val ();
        var key = Object.keys (snapshot.val ())[0];

        if (await bcrypt.compare (req.body.password, val[key].password)) {
          res.json ({success: true});
        } else
          res.json ({
            message: 'Invaid Credentials',
            success: false,
          });
      }
    });
});

//============== Admin Registartion End     ===================

module.exports = router;
