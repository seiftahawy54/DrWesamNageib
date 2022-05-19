const csrfTokenInput = document.getElementById("csrfToken").value;
const examId = document.getElementById("examId").value;
const submitBtn = document.getElementById("submit-exam");
const questionsContainerDiv = document.querySelectorAll(
  "#questionsContainer div.answers-container"
);

let answeredQuestions = 0;
const examForm = document.getElementById("exam-form");

const extractAnswers = (questionsContainer) => {
  const usersSubmittedAnswers = [];

  questionsContainer.forEach((answers, questionIndex) => {
    let answersDivsContainer = [];
    answers.childNodes.forEach((answer, answerIndex) => {
      if (answer.tagName === "DIV") {
        answersDivsContainer.push(answer);
      }
    });

    let checkedFlag = false;
    answersDivsContainer.forEach((answer, answerIndex) => {
      // console.log(answers);
      answer.childNodes.forEach((answerInput) => {
        if (answerInput.tagName === "INPUT") {
          if (answerInput.checked) {
            checkedFlag = true;
            let answerObj = {};
            answerObj[questionIndex + 1] = answerIndex + 1;
            usersSubmittedAnswers.push(answerObj);
            answeredQuestions += 1;
          }
        }
      });
    });

    if (!checkedFlag) {
      let answerObj = {};
      answerObj[questionIndex + 1] = null;
      usersSubmittedAnswers.push(answerObj);
    }
  });

  return usersSubmittedAnswers;
};

const clearAnswers = () => {
  examForm.reset();
};

submitBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  const userAnswers = extractAnswers(questionsContainerDiv);
  const errorModal = document.getElementById("alert-message");

  console.log(answeredQuestions, questionsContainerDiv.length);

  if (answeredQuestions <= questionsContainerDiv.length) {
    errorModal.classList.remove("d-none");
    errorModal.textContent = "Answer all questions, please!";
    scrollTo(0, 0);
  } else {
    axios
      .post("/exam", {
        xsrfCookieName: csrfTokenInput,
        xsrfHeaderName: "X-XSRF-TOKEN",
        userAnswers,
        examId,
      })
      .then((res) => {
        localStorage.setItem("grade", res.data.grade);
        localStorage.setItem("total", `${questionsContainerDiv.length}`);
        clearAnswers();
        window.location = "/exam/submitted-exam";
      })
      .catch((err) => {
        console.error(err);
      });
  }
});
