const Firebase = require ('firebase-admin');
const db = Firebase.database ();
const chatRef = db.ref ('chat');
const studentRef = db.ref ('student');
const teacherRef = db.ref ('teacher');
const reportTeacher = db.ref ('report_teacher');
const ratingRef = db.ref ('rating');



module.exports = {
    getAll,
};

async function getAll(req, res) {
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

        let numberOfCoursesDone = teachers.map (async function (teacher, index) {
            const count = await getNumberOfCoursesDone (teacher);
            teachers[index].numberOfCoursesDone = count;
            teachers[index].amountEarned = count;
        });
    
        let totalCasesFiledPromise = teachers.map (async function (teacher, index) {
            const reports = await getNumberOfComplainsReported (teacher);
            teachers[index].totalReportsFiled = reports;
        });
    
        await Promise.all (teachersPromise);
        await Promise.all (studentsPromise);
        await Promise.all (ratingPromise);
        await Promise.all (issueReportedPromise);
        await Promise.all (numberOfCoursesDone);
        await Promise.all (totalCasesFiledPromise);

        res.json(courses)
    });

    res.json(courses)
}

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