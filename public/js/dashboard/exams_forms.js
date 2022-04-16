const questionsContainer = document.getElementById("questions-container");
const addNewExamBtn = document.getElementById("add-new-exam");
const modalButton = document.querySelector(
  `button[data-bs-target="#exampleModal"]`
);
const myModal = new bootstrap.Modal(document.getElementById("exampleModal"));
// const myModal = document.getElementById("exampleModal")
const myInput = document.getElementById("myInput");
const saveQuestionBtn = document.getElementById("save-question");
const questionHeader = document.getElementById("question-header");
let questionAnswers = document.querySelectorAll(
  "#answers-container .input-group input"
);
const correctAnswer = document.getElementById("correct-answer");
const questionForm = document.getElementById("question-form");
const submitExamBtn = document.getElementById("submitBtn");
const csrfTokenInput = document.getElementById("csrfToken");
const examStatusInput = document.getElementById("exam-status");
const editingExamsInput = document.getElementById("editingInputExams");
const examsFormEditMode =
  document.getElementById("exams-form").dataset.editMode === "true";
const examStatusLabel = examStatusInput.nextElementSibling;
const examTitleInput = document.getElementById("exam-title");

const LOCAL_STORAGE_EXAMS_MODE = examsFormEditMode ? "modify_exams" : "exams";

addNewExamBtn.addEventListener("click", () => {
  modalButton.click();
});

const createQuestionHeaderInput = (headerText = "") => {
  const headerQuestionInput = document.createElement("input");
  const headerQuestionLabel = document.createElement("label");

  /* Question header properties */
  headerQuestionInput.name = "question-header";
  headerQuestionInput.classList.add("form-control");
  headerQuestionInput.placeholder = "Question Header";
  headerQuestionInput.id = "question-header";
  headerQuestionInput.readOnly = true;
  headerQuestionInput.value = headerText;

  /* Label Properties */
  headerQuestionLabel.htmlFor = "question-header";
  headerQuestionLabel.textContent = "Question Header";

  return [headerQuestionInput, headerQuestionLabel];
};

const createQuestionAnswerInput = (
  answerNumber,
  labelText = "",
  correctAnswer = false,
  questionNumber
) => {
  const headerQuestionInput = document.createElement("input");
  const headerQuestionLabel = document.createElement("label");

  /* Question header properties */
  headerQuestionInput.type = "radio";
  headerQuestionInput.name = questionNumber;
  headerQuestionInput.classList.add("form-check-input");
  headerQuestionInput.id = `answer-${answerNumber}`;
  headerQuestionInput.value = `answer-${answerNumber}`;
  headerQuestionInput.disabled = true;

  if (correctAnswer) headerQuestionInput.checked = true;

  /* Label Properties */
  headerQuestionLabel.htmlFor = `answer-${answerNumber}`;
  headerQuestionLabel.classList.add("form-check-label");
  headerQuestionLabel.readOnly = true;
  headerQuestionLabel.textContent = labelText;

  return [headerQuestionInput, headerQuestionLabel];
};

const deleteExam = (questionNumber) => {
  const exams = localStorage.getItem(LOCAL_STORAGE_EXAMS_MODE);
  const jsonExams = JSON.parse(exams);
  const filteredExams = jsonExams.filter(
    (item, index) => index !== questionNumber - 1
  );
  localStorage.setItem(LOCAL_STORAGE_EXAMS_MODE, JSON.stringify(filteredExams));
  renderExams();
};

const editExam = (questionNumber) => {
  const localExams = JSON.parse(localStorage.getItem(LOCAL_STORAGE_EXAMS_MODE));
  const findToUpdateExam = localExams.at(questionNumber - 1);
  modalButton.click();
  questionHeader.value = findToUpdateExam.questionHeader;
  questionAnswers.forEach((answer, index) => {
    answer.value = findToUpdateExam.answers[index];
  });
  correctAnswer.value = findToUpdateExam.correctAnswer;
  saveQuestionBtn.dataset.editing = "on";
  saveQuestionBtn.dataset.questionNumber = (questionNumber - 1).toString();
};

const creatingQuestion = (
  headerText = [],
  labelsTexts = ["", "", "", ""],
  correctAnswer,
  questionNumber
) => {
  const containerOfQuestion = document.createElement("div");
  const containerDiv = document.createElement("div");
  // Question Number
  const questionNumberDiv = document.createElement("div");
  questionNumberDiv.textContent = questionNumber.toString() + " . ";
  questionNumberDiv.classList.add("question-number");
  // Deleting exam span
  const deleteBtn = document.createElement("span");
  deleteBtn.classList.add("delete-exam", "btn-close");
  // Edit exam span
  const editBtn = document.createElement("span");
  editBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
          <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
          <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
        </svg>`;
  editBtn.classList.add("edit-exam");

  const [headerQuestionInput, headerQuestionLabel] =
    createQuestionHeaderInput(headerText);
  const answersArr = labelsTexts.map((answer, index) => {
    const [headerQuestionInput, headerQuestionLabel] =
      createQuestionAnswerInput(
        index,
        answer,
        parseInt(correctAnswer) - 1 === index,
        questionNumber
      );

    const checkInputContainer = document.createElement("div");
    checkInputContainer.classList.add("form-check", "my-3");
    checkInputContainer.append(headerQuestionInput, headerQuestionLabel);

    return checkInputContainer;
  });

  /* Question header div */
  containerOfQuestion.classList.add(`question`, "my-3");
  containerOfQuestion.dataset.questionNumber = questionNumber;
  deleteBtn.addEventListener("click", () => deleteExam(questionNumber));
  editBtn.addEventListener("click", () => editExam(questionNumber));

  containerDiv.classList.add("form-floating", "my-3");

  containerDiv.append(headerQuestionInput, headerQuestionLabel, ...answersArr);
  containerOfQuestion.append(
    questionNumberDiv,
    containerDiv,
    deleteBtn,
    editBtn
  );
  return containerOfQuestion;
};

const renderExams = () => {
  let containerDiv;
  const exams = JSON.parse(localStorage.getItem(LOCAL_STORAGE_EXAMS_MODE));
  if (exams) {
    containerDiv = exams.map(
      ({ questionHeader, answers, correctAnswer }, index) =>
        creatingQuestion(questionHeader, answers, correctAnswer, index + 1)
    );
  } else {
    containerDiv = "No Exams added yet";
  }

  questionsContainer.replaceChildren(...containerDiv);
};

const validateForm = (questionHeader, questionAnswers, correctAnswer) => {
  let isValidForm = true;

  if (questionHeader.value.length === 0) {
    questionHeader.classList.add("is-invalid");
    isValidForm = false;
  } else {
    questionHeader.classList.remove("is-invalid");
  }

  questionAnswers.forEach((answer, index) => {
    if (answer.value.length === 0) {
      answer.classList.add("is-invalid");
      isValidForm = false;
    } else {
      answer.classList.remove("is-invalid");
    }
  });

  if (!(correctAnswer.value >= 1 && correctAnswer.value <= 4)) {
    correctAnswer.classList.add("is-invalid");
    isValidForm = false;
  } else {
    questionHeader.classList.remove("is-invalid");
  }

  return isValidForm;
};

const removeModal = () => {
  document.getElementById("hiddenDismissBtn")?.click();
};

const resetValidationAndValues = (
  questionHeader,
  questionAnswers,
  correctAnswer
) => {
  questionHeader.value = "";
  questionHeader.classList.remove("is-invalid");
  questionAnswers.forEach((answer) => {
    answer.value = "";
    answer.classList.remove("is-invalid");
  });
  correctAnswer.value = "";
  correctAnswer.classList.remove("is-invalid");
};

saveQuestionBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const savedExams = JSON.parse(localStorage.getItem(LOCAL_STORAGE_EXAMS_MODE));
  let answersValues = [];

  for (let answer = 0; answer < questionAnswers.length; answer++) {
    answersValues[answer] = questionAnswers[answer].value;
  }

  if (validateForm(questionHeader, questionAnswers, correctAnswer)) {
    if (saveQuestionBtn.dataset.editing === "on") {
      const exams = JSON.parse(localStorage.getItem(LOCAL_STORAGE_EXAMS_MODE));
      const question = exams.at(
        parseInt(saveQuestionBtn.dataset.questionNumber)
      );
      question.questionHeader = questionHeader.value;
      question.answers = answersValues;
      question.correctAnswer = correctAnswer.value;
      localStorage.setItem(LOCAL_STORAGE_EXAMS_MODE, JSON.stringify(exams));

      saveQuestionBtn.dataset.editing = null;
      saveQuestionBtn.dataset.questionNumber = null;

      removeModal();
      resetValidationAndValues(questionHeader, questionAnswers, correctAnswer);
      renderExams();
    } else {
      const stringExams = JSON.stringify([
        {
          questionHeader: questionHeader.value,
          answers: answersValues,
          correctAnswer: correctAnswer.value,
        },
      ]);
      if (savedExams) {
        let jsonExams = savedExams;
        jsonExams = [
          ...jsonExams,
          {
            questionHeader: questionHeader.value,
            answers: answersValues,
            correctAnswer: correctAnswer.value,
          },
        ];
        localStorage.setItem(
          LOCAL_STORAGE_EXAMS_MODE,
          JSON.stringify(jsonExams)
        );
        removeModal();
        resetValidationAndValues(
          questionHeader,
          questionAnswers,
          correctAnswer
        );
        renderExams();
      } else {
        localStorage.setItem(LOCAL_STORAGE_EXAMS_MODE, stringExams);
        removeModal();
        resetValidationAndValues(
          questionHeader,
          questionAnswers,
          correctAnswer
        );
        renderExams();
      }
    }
  }
});

const changeLabelState = () => {
  if (examStatusLabel.tagName.toLowerCase() === "label") {
    if (examStatusInput.checked) {
      examStatusLabel.textContent = "Exam status (WORKING)";
    } else {
      examStatusLabel.textContent = "Exam status (CLOSED)";
    }
  }
};

examStatusInput.addEventListener("change", changeLabelState);

submitExamBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const exams = JSON.parse(localStorage.getItem(LOCAL_STORAGE_EXAMS_MODE));
  const examStatus = examStatusInput.checked;

  console.log(examTitleInput);

  if (examTitleInput.value.length === 0) {
    examTitleInput.classList.add("is-invalid");
  } else {
    let url,
      data = {
        xsrfCookieName: csrfTokenInput.value, // default
        xsrfHeaderName: "X-XSRF-TOKEN", // default
        questions: exams,
        examStatus,
        examTitle: examTitleInput.value,
      },
      message;

    if (examsFormEditMode) {
      url = "/dashboard/exams/edit-exam";
      let examId = document.getElementById("examId").value;
      data = {
        ...data,
        examId,
      };
      console.log(data);
      message = "Questions and Exam are Updated!";
    } else {
      url = "/dashboard/exams/start-new-exam";
      message = "Exam is Started!";
    }

    axios
      .post(url, data)
      .then((result) => {
        if (result.status === 201) {
          alert(message);
          window.location = "/dashboard/exams";
          localStorage.setItem(LOCAL_STORAGE_EXAMS_MODE, null);
        }
        throw new Error("Error from server!");
      })
      .catch((err) => {
        console.error(err);
      });
  }
});

window.onload = () => {
  if (examsFormEditMode) {
    // console.log(editingExamsInput.textContent)
    localStorage.setItem(
      LOCAL_STORAGE_EXAMS_MODE,
      editingExamsInput.textContent
    );
  }

  changeLabelState();

  renderExams();
};
