// ===== LOGIN =====
function loginUser() {
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;
  let msg = document.getElementById("loginMsg");

  fetch("http://localhost:3000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
  .then(data => {
    msg.innerHTML = data.message;

    if (data.success) {
      msg.style.color = "green";
      window.location.href = "dashboard.html";
    } else {
      msg.style.color = "red";
    }
  });
}


// ===== REGISTER =====
function registerUser() {
  let name = document.getElementById("name").value;
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;
  let msg = document.getElementById("registerMsg");

  fetch("http://localhost:3000/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  })
  .then(res => res.json())
  .then(data => {
    msg.innerHTML = data.message;
    msg.style.color = data.success ? "green" : "red";
  });
}

// ===== APTITUDE QUIZ FINAL =====

let quizQuestions = [];
let quizIndex = 0;
let quizScore = 0;
let selectedAnswers = [];
let aptitudeFeedbacks = [];
let currentQuizCompany = "";
let reviewMode = false;

function loadCompanyQuestions(company) {
  fetch("http://localhost:3000/questions/" + company)
    .then(res => res.json())
    .then(data => {
      quizQuestions = data;
      currentQuizCompany = company;
      reviewMode = false;
      aptitudeFeedbacks = [];

      document.getElementById("quizBox").style.display = "block";

      let completed = localStorage.getItem(company + "_quizCompleted");

      if (completed === "true") {
        let savedScore = localStorage.getItem(company + "_quizFinalScore");
        let savedTotal = localStorage.getItem(company + "_quizTotal");
        let savedAnswers = localStorage.getItem(company + "_selectedAnswers");

        if (savedAnswers) {
          selectedAnswers = JSON.parse(savedAnswers);
        }

        document.getElementById("question-number").innerHTML = "Completed";

        document.getElementById("question").innerHTML =
          company + " Aptitude Quiz Completed ✅";

        document.querySelector(".options").style.display = "none";

        document.querySelectorAll(".quiz-btn").forEach(btn => {
          btn.style.display = "none";
        });

        document.getElementById("result").innerHTML =
          "Your Score: " + savedScore + "/" + savedTotal;

        document.getElementById("quizActions").style.display = "block";

        let aiBox = document.getElementById("aptitudeAiFeedback");

        if (aiBox) {
          aiBox.innerHTML = "";
        }

        document.getElementById("reviewBox").innerHTML = "";

        return;
      }

      quizIndex = 0;
      quizScore = 0;
      selectedAnswers = [];

      let savedIndex = localStorage.getItem(company + "_quizIndex");
      let savedScore = localStorage.getItem(company + "_quizScore");
      let savedAnswers = localStorage.getItem(company + "_selectedAnswers");

      if (savedIndex !== null) {
        quizIndex = Number(savedIndex);
        quizScore = Number(savedScore);

        if (savedAnswers) {
          selectedAnswers = JSON.parse(savedAnswers);
        }
      }

      document.querySelector(".options").style.display = "flex";

      document.querySelectorAll(".quiz-btn").forEach(btn => {
        btn.style.display = "inline-block";
      });

      document.getElementById("quizActions").style.display = "none";
      document.getElementById("result").innerHTML = "";
      document.getElementById("reviewBox").innerHTML = "";

      let aiBox = document.getElementById("aptitudeAiFeedback");

      if (aiBox) {
        aiBox.innerHTML = "";
      }

      loadQuizQuestion();
    });
}

function loadQuizQuestion() {
  if (quizQuestions.length === 0) {
    document.getElementById("question").innerHTML = "No questions found";
    return;
  }

  document.getElementById("question-number").innerHTML =
    "Question " + (quizIndex + 1) + " of " + quizQuestions.length;

  document.getElementById("question").innerHTML =
    quizQuestions[quizIndex].question;

  document.getElementById("option0").innerHTML =
    quizQuestions[quizIndex].option1;

  document.getElementById("option1").innerHTML =
    quizQuestions[quizIndex].option2;

  document.getElementById("option2").innerHTML =
    quizQuestions[quizIndex].option3;

  document.getElementById("option3").innerHTML =
    quizQuestions[quizIndex].option4;

  let answers = document.getElementsByName("answer");

  for (let i = 0; i < answers.length; i++) {
    answers[i].checked = false;
    answers[i].disabled = reviewMode;
    answers[i].classList.remove("correct-radio");
    answers[i].classList.remove("wrong-radio");

    answers[i].onchange = function () {
      aptitudeFeedbacks[quizIndex] = "";

      let aiBox = document.getElementById("aptitudeAiFeedback");

      if (aiBox) {
        aiBox.innerHTML = "";
      }
    };
  }

  document.querySelectorAll(".options label").forEach(label => {
    label.classList.remove("correct-option");
    label.classList.remove("wrong-option");
  });

  if (selectedAnswers[quizIndex] !== undefined) {
    answers[selectedAnswers[quizIndex]].checked = true;
  }

  let progress = ((quizIndex + 1) / quizQuestions.length) * 100;

  document.getElementById("progressFill").style.width =
    progress + "%";

  let prevBtn = document.getElementById("prevBtn");

  if (prevBtn) {
    prevBtn.disabled = quizIndex === 0;
  }

  document.getElementById("reviewBox").innerHTML = "";

  let aiBox = document.getElementById("aptitudeAiFeedback");

  if (aiBox) {
    aiBox.innerHTML = aptitudeFeedbacks[quizIndex] || "";
  }

  if (reviewMode) {
    showReviewResult();
  }
}

function nextQuizQuestion() {
  if (reviewMode) {
    quizIndex++;

    if (quizIndex < quizQuestions.length) {
      loadQuizQuestion();
    } else {
      quizIndex = quizQuestions.length - 1;
      document.getElementById("quizActions").style.display = "block";
    }

    return;
  }

  let answers = document.getElementsByName("answer");
  let selected = -1;

  for (let i = 0; i < answers.length; i++) {
    if (answers[i].checked) {
      selected = Number(answers[i].value);
    }
  }

  if (selected === -1) {
    alert("Please select an answer");
    return;
  }

  let oldAnswer = selectedAnswers[quizIndex];

  if (oldAnswer !== undefined) {
    if (oldAnswer + 1 === quizQuestions[quizIndex].correct_option) {
      quizScore--;
    }
  }

  selectedAnswers[quizIndex] = selected;

  if (selected + 1 === quizQuestions[quizIndex].correct_option) {
    quizScore++;
  }

  localStorage.setItem(
    currentQuizCompany + "_selectedAnswers",
    JSON.stringify(selectedAnswers)
  );

  quizIndex++;

  localStorage.setItem(currentQuizCompany + "_quizIndex", quizIndex);
  localStorage.setItem(currentQuizCompany + "_quizScore", quizScore);

  if (quizIndex < quizQuestions.length) {
    loadQuizQuestion();
  } else {
    document.getElementById("question").innerHTML =
      currentQuizCompany + " Aptitude Quiz Completed ✅";

    document.querySelector(".options").style.display = "none";

    document.querySelectorAll(".quiz-btn").forEach(btn => {
      btn.style.display = "none";
    });

    document.getElementById("question-number").innerHTML = "Completed";

    document.getElementById("result").innerHTML =
      "Your Score: " + quizScore + "/" + quizQuestions.length;

    document.getElementById("quizActions").style.display = "block";
    document.getElementById("reviewBox").innerHTML = "";

    let aiBox = document.getElementById("aptitudeAiFeedback");

    if (aiBox) {
      aiBox.innerHTML = "";
    }

    localStorage.setItem(currentQuizCompany + "_quizCompleted", "true");
    localStorage.setItem(currentQuizCompany + "_quizFinalScore", quizScore);
    localStorage.setItem(currentQuizCompany + "_quizTotal", quizQuestions.length);

    saveQuizScore();
  }
}

function previousQuizQuestion() {
  if (quizIndex > 0) {
    quizIndex--;

    if (!reviewMode) {
      localStorage.setItem(currentQuizCompany + "_quizIndex", quizIndex);
      localStorage.setItem(currentQuizCompany + "_quizScore", quizScore);

      localStorage.setItem(
        currentQuizCompany + "_selectedAnswers",
        JSON.stringify(selectedAnswers)
      );
    }

    loadQuizQuestion();
  }
}

function reviewQuiz() {
  reviewMode = true;
  quizIndex = 0;

  document.querySelector(".options").style.display = "flex";

  document.querySelectorAll(".quiz-btn").forEach(btn => {
    btn.style.display = "inline-block";
  });

  document.getElementById("quizActions").style.display = "none";
  document.getElementById("result").innerHTML = "";

  loadQuizQuestion();
}

function showReviewResult() {
  let selected = selectedAnswers[quizIndex];
  let correct = quizQuestions[quizIndex].correct_option - 1;

  let options = [
    quizQuestions[quizIndex].option1,
    quizQuestions[quizIndex].option2,
    quizQuestions[quizIndex].option3,
    quizQuestions[quizIndex].option4
  ];

  let reviewBox = document.getElementById("reviewBox");

  if (selected === undefined) {
    reviewBox.innerHTML = "No answer selected";
    reviewBox.style.color = "#555";
    return;
  }

  let radios = document.getElementsByName("answer");
  let labels = document.querySelectorAll(".options label");

  if (selected === correct) {
    reviewBox.innerHTML =
      "✅ Correct Answer<br>Your Answer: " + options[selected];

    reviewBox.style.color = "#16a34a";

    radios[selected].classList.add("correct-radio");
    labels[selected].classList.add("correct-option");
  } else {
    reviewBox.innerHTML =
      "❌ Wrong Answer<br>Your Answer: " +
      options[selected] +
      "<br>Correct Answer: " +
      options[correct];

    reviewBox.style.color = "#dc2626";

    radios[selected].classList.add("wrong-radio");
    radios[correct].classList.add("correct-radio");

    labels[selected].classList.add("wrong-option");
    labels[correct].classList.add("correct-option");
  }
}

function restartQuiz() {
  reviewMode = false;
  aptitudeFeedbacks = [];

  localStorage.removeItem(currentQuizCompany + "_quizCompleted");
  localStorage.removeItem(currentQuizCompany + "_quizFinalScore");
  localStorage.removeItem(currentQuizCompany + "_quizTotal");
  localStorage.removeItem(currentQuizCompany + "_quizIndex");
  localStorage.removeItem(currentQuizCompany + "_quizScore");
  localStorage.removeItem(currentQuizCompany + "_selectedAnswers");

  loadCompanyQuestions(currentQuizCompany);
}

async function explainAptitudeQuestion() {
  let box = document.getElementById("aptitudeAiFeedback");
  let btn = document.getElementById("aptitudeAiBtn");

  if (!quizQuestions || quizQuestions.length === 0) {
    box.innerHTML = "Please select a company first.";
    return;
  }

  let q = quizQuestions[quizIndex];

  let options = [
    q.option1,
    q.option2,
    q.option3,
    q.option4
  ];

  let selected =
    selectedAnswers[quizIndex];

  btn.disabled = true;
  btn.innerHTML = "Explaining...";
  box.innerHTML = "AI is explaining...";

  try {
    let res = await fetch("http://localhost:3000/ai-aptitude-explain", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question: q.question,
        options: options.join(", "),
        selectedAnswer:
          selected !== undefined
            ? options[selected]
            : "Not selected"
      })
    });

    let data = await res.json();

    if (data.success) {
      aptitudeFeedbacks[quizIndex] = data.feedback;
      box.innerHTML = data.feedback;
    } else {
      box.innerHTML = data.feedback || "AI explanation failed.";
    }

  } catch (error) {
    box.innerHTML = "Frontend error: " + error.message;
  }

  btn.disabled = false;
  btn.innerHTML = "🤖 Explain Question";
}

function saveQuizScore() {
  fetch("http://localhost:3000/save-score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "test@gmail.com",
      score: quizScore,
      total: quizQuestions.length
    })
  })
  .then(res => res.json())
  .then(data => console.log(data.message));
}
// ===== CODING QUESTIONS FINAL =====

let codingQuestionsDB = [];
let codingIndex = 0;
let codingAnswers = [];
let codingSolved = [];
let codingFeedbacks = [];
let currentCodingCompany = "";
let codingReviewMode = false;

function loadCodingQuestions(company) {
  fetch("http://localhost:3000/coding-questions/" + company)
    .then(res => res.json())
    .then(data => {
      codingQuestionsDB = data;
      currentCodingCompany = company;
      codingReviewMode = false;

      document.getElementById("codingBox").style.display = "block";

      let completed = localStorage.getItem(company + "_codingCompleted");

      if (completed === "true") {
        let savedAnswers = localStorage.getItem(company + "_codingAnswers");
        let savedSolved = localStorage.getItem(company + "_codingSolved");

        codingAnswers = savedAnswers ? JSON.parse(savedAnswers) : [];
        codingSolved = savedSolved ? JSON.parse(savedSolved) : [];

        let solvedCount = codingSolved.filter(Boolean).length;

        document.getElementById("coding-number").innerHTML = "Completed";

        document.getElementById("codingQuestion").innerHTML =
          company + " Coding Practice Completed ✅";

        document.getElementById("codeInput").style.display = "none";

        document.getElementById("codingSolution").innerText =
          "Solved: " + solvedCount + "/" + codingQuestionsDB.length;

        document.querySelectorAll(".quiz-btn").forEach(btn => {
          btn.style.display = "none";
        });

        document.getElementById("codingActions").style.display = "block";

        return;
      }

      codingIndex = 0;
      codingAnswers = [];
      codingSolved = [];
      codingFeedbacks = [];

      let savedIndex = localStorage.getItem(company + "_codingIndex");
      let savedAnswers = localStorage.getItem(company + "_codingAnswers");
      let savedSolved = localStorage.getItem(company + "_codingSolved");

      if (savedIndex !== null) {
        codingIndex = Number(savedIndex);
      }

      if (savedAnswers) {
        codingAnswers = JSON.parse(savedAnswers);
      }

      if (savedSolved) {
        codingSolved = JSON.parse(savedSolved);
      }

      document.getElementById("codeInput").style.display = "block";
      document.getElementById("codingSolution").style.display = "block";

      document.querySelectorAll(".quiz-btn").forEach(btn => {
        btn.style.display = "inline-block";
      });

      document.getElementById("codingActions").style.display = "none";

      loadCodingQuestion();
    });
}

function loadCodingQuestion() {
  if (codingQuestionsDB.length === 0) {
    document.getElementById("codingQuestion").innerHTML =
      "No coding questions found";
    return;
  }

  document.getElementById("coding-number").innerHTML =
    "Question " + (codingIndex + 1) + " of " + codingQuestionsDB.length;

  document.getElementById("codingQuestion").innerHTML =
    codingQuestionsDB[codingIndex].question;

  let codeBox = document.getElementById("codeInput");

  codeBox.value = codingAnswers[codingIndex] || "";
  codeBox.disabled = codingReviewMode;

  codeBox.oninput = function () {
    codingAnswers[codingIndex] = codeBox.value;

    localStorage.setItem(
      currentCodingCompany + "_codingAnswers",
      JSON.stringify(codingAnswers)
    );

    codingFeedbacks[codingIndex] = "";

    let aiBox = document.getElementById("codingAiFeedback");
    if (aiBox) {
      aiBox.innerHTML = "";
    }
  };

  document.getElementById("codingSolution").innerText = "";

  let prevCodingBtn = document.getElementById("prevCodingBtn");

  if (prevCodingBtn) {
    prevCodingBtn.disabled = codingIndex === 0;
  }

  let solvedBtn = document.getElementById("solvedBtn");

  if (solvedBtn) {
    if (codingSolved[codingIndex]) {
      solvedBtn.innerHTML = "✅ Solved";
      solvedBtn.disabled = true;
    } else {
      solvedBtn.innerHTML = "✅ Mark as Solved";
      solvedBtn.disabled = false;
    }
  }

  let aiBox = document.getElementById("codingAiFeedback");

  if (aiBox) {
    aiBox.innerHTML = codingFeedbacks[codingIndex] || "";
  }

  if (codingReviewMode) {
    showCodingReview();
  }
}

function markCodingSolved() {
  codingSolved[codingIndex] = true;

  localStorage.setItem(
    currentCodingCompany + "_codingSolved",
    JSON.stringify(codingSolved)
  );

  let solvedBtn = document.getElementById("solvedBtn");

  if (solvedBtn) {
    solvedBtn.innerHTML = "✅ Solved";
    solvedBtn.disabled = true;
  }
}

function showCodingSolution() {
  document.getElementById("codingSolution").innerText =
    codingQuestionsDB[codingIndex].solution;
}

function nextCodingQuestion() {
  if (codingReviewMode) {
    codingIndex++;

    if (codingIndex < codingQuestionsDB.length) {
      loadCodingQuestion();
    } else {
      codingIndex = codingQuestionsDB.length - 1;
      document.getElementById("codingActions").style.display = "block";
    }

    return;
  }

  codingAnswers[codingIndex] =
    document.getElementById("codeInput").value;

  localStorage.setItem(
    currentCodingCompany + "_codingAnswers",
    JSON.stringify(codingAnswers)
  );

  codingIndex++;

  localStorage.setItem(currentCodingCompany + "_codingIndex", codingIndex);

  if (codingIndex < codingQuestionsDB.length) {
    loadCodingQuestion();
  } else {
    let solvedCount = codingSolved.filter(Boolean).length;

    document.getElementById("codingQuestion").innerHTML =
      currentCodingCompany + " Coding Practice Completed ✅";

    document.getElementById("coding-number").innerHTML = "Completed";

    document.getElementById("codeInput").style.display = "none";

    document.getElementById("codingSolution").innerText =
      "Solved: " + solvedCount + "/" + codingQuestionsDB.length;

    document.querySelectorAll(".quiz-btn").forEach(btn => {
      btn.style.display = "none";
    });

    document.getElementById("codingActions").style.display = "block";

    localStorage.setItem(
      currentCodingCompany + "_codingCompleted",
      "true"
    );
  }
}

function previousCodingQuestion() {
  if (codingIndex > 0) {
    if (!codingReviewMode) {
      codingAnswers[codingIndex] =
        document.getElementById("codeInput").value;

      localStorage.setItem(
        currentCodingCompany + "_codingAnswers",
        JSON.stringify(codingAnswers)
      );
    }

    codingIndex--;

    localStorage.setItem(currentCodingCompany + "_codingIndex", codingIndex);

    loadCodingQuestion();
  }
}

function reviewCoding() {
  codingReviewMode = true;
  codingIndex = 0;

  document.getElementById("codeInput").style.display = "block";

  document.querySelectorAll(".quiz-btn").forEach(btn => {
    btn.style.display = "inline-block";
  });

  document.getElementById("codingActions").style.display = "none";

  loadCodingQuestion();
}

function showCodingReview() {
  document.getElementById("codingSolution").innerText =
    "Your Code:\n" +
    (codingAnswers[codingIndex] || "No code written") +
    "\n\nOfficial Solution:\n" +
    codingQuestionsDB[codingIndex].solution;
}

function restartCoding() {
  codingReviewMode = false;

  localStorage.removeItem(currentCodingCompany + "_codingCompleted");
  localStorage.removeItem(currentCodingCompany + "_codingIndex");
  localStorage.removeItem(currentCodingCompany + "_codingAnswers");
  localStorage.removeItem(currentCodingCompany + "_codingSolved");

  codingFeedbacks = [];

  loadCodingQuestions(currentCodingCompany);
}
async function getCodingHint() {

  let box = document.getElementById("codingAiFeedback");
  let btn = document.getElementById("codingAiBtn");

  if (!codingQuestionsDB || codingQuestionsDB.length === 0) {
    box.innerHTML = "Please select a company first.";
    return;
  }

  let question = codingQuestionsDB[codingIndex].question;
  let code = document.getElementById("codeInput").value;

  btn.disabled = true;
  btn.innerHTML = "Thinking...";
  box.innerHTML = "AI is preparing a hint...";

  try {

    let res = await fetch("http://localhost:3000/ai-coding-hint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question: question,
        code: code
      })
    });

    let data = await res.json();

    if (data.success) {
      codingFeedbacks[codingIndex] = data.feedback;
      box.innerHTML = data.feedback;
    } else {
      box.innerHTML = data.feedback || "AI hint failed.";
    }

  } catch (error) {
    box.innerHTML = "Frontend error: " + error.message;
  }

  btn.disabled = false;
  btn.innerHTML = "🤖 Get AI Hint";
}
// ===== INTERVIEW QUESTIONS FINAL =====

let interviewQuestionsDB = [];
let interviewIndex = 0;
let interviewAnswers = [];
let interviewFeedbacks = [];
let currentInterviewCompany = "";
let interviewReviewMode = false;

function loadInterviewQuestions(company) {
  fetch("http://localhost:3000/interview-questions/" + company)
    .then(res => res.json())
    .then(data => {
      interviewQuestionsDB = data;
      currentInterviewCompany = company;
      interviewReviewMode = false;

      document.getElementById("interviewBox").style.display = "block";

      let completed = localStorage.getItem(company + "_interviewCompleted");

      if (completed === "true") {
        let savedAnswers = localStorage.getItem(company + "_interviewAnswers");

        interviewAnswers = savedAnswers ? JSON.parse(savedAnswers) : [];
        interviewFeedbacks = [];

        document.getElementById("interview-number").innerHTML = "Completed";

        document.getElementById("interviewQuestion").innerHTML =
          company + " Interview Practice Completed ✅";

        document.getElementById("answer").style.display = "none";

        document.querySelectorAll(".quiz-btn").forEach(btn => {
          btn.style.display = "none";
        });

        document.getElementById("interviewActions").style.display = "block";

        document.getElementById("aiFeedback").innerHTML = "";

        return;
      }

      interviewIndex = 0;
      interviewAnswers = [];
      interviewFeedbacks = [];

      let savedIndex = localStorage.getItem(company + "_interviewIndex");
      let savedAnswers = localStorage.getItem(company + "_interviewAnswers");

      if (savedIndex !== null) {
        interviewIndex = Number(savedIndex);
      }

      if (savedAnswers) {
        interviewAnswers = JSON.parse(savedAnswers);
      }

      document.getElementById("answer").style.display = "block";

      document.querySelectorAll(".quiz-btn").forEach(btn => {
        btn.style.display = "inline-block";
      });

      document.getElementById("interviewActions").style.display = "none";

      loadInterviewQuestion();
    });
}

function loadInterviewQuestion() {
  if (interviewQuestionsDB.length === 0) {
    document.getElementById("interviewQuestion").innerHTML =
      "No questions found";
    return;
  }

  document.getElementById("interview-number").innerHTML =
    "Question " + (interviewIndex + 1) + " of " + interviewQuestionsDB.length;

  document.getElementById("interviewQuestion").innerHTML =
    interviewQuestionsDB[interviewIndex].question;

  let answerBox = document.getElementById("answer");

  answerBox.value = interviewAnswers[interviewIndex] || "";
  answerBox.disabled = interviewReviewMode;

  answerBox.oninput = function () {
    interviewAnswers[interviewIndex] = answerBox.value;

    localStorage.setItem(
      currentInterviewCompany + "_interviewAnswers",
      JSON.stringify(interviewAnswers)
    );

    interviewFeedbacks[interviewIndex] = "";
    document.getElementById("aiFeedback").innerHTML = "";
  };

  let prevInterviewBtn = document.getElementById("prevInterviewBtn");

  if (prevInterviewBtn) {
    prevInterviewBtn.disabled = interviewIndex === 0;
  }

  document.getElementById("aiFeedback").innerHTML =
    interviewFeedbacks[interviewIndex] || "";
}

function nextInterviewQuestion() {
  if (interviewReviewMode) {
    interviewIndex++;

    if (interviewIndex < interviewQuestionsDB.length) {
      loadInterviewQuestion();
    } else {
      interviewIndex = interviewQuestionsDB.length - 1;
      document.getElementById("interviewActions").style.display = "block";
    }

    return;
  }

  interviewAnswers[interviewIndex] =
    document.getElementById("answer").value;

  localStorage.setItem(
    currentInterviewCompany + "_interviewAnswers",
    JSON.stringify(interviewAnswers)
  );

  interviewIndex++;

  localStorage.setItem(
    currentInterviewCompany + "_interviewIndex",
    interviewIndex
  );

  if (interviewIndex < interviewQuestionsDB.length) {
    loadInterviewQuestion();
  } else {
    document.getElementById("interviewQuestion").innerHTML =
      currentInterviewCompany + " Interview Practice Completed ✅";

    document.getElementById("interview-number").innerHTML = "Completed";

    document.getElementById("answer").style.display = "none";

    document.querySelectorAll(".quiz-btn").forEach(btn => {
      btn.style.display = "none";
    });

    document.getElementById("interviewActions").style.display = "block";
    document.getElementById("aiFeedback").innerHTML = "";

    localStorage.setItem(
      currentInterviewCompany + "_interviewCompleted",
      "true"
    );
  }
}

function previousInterviewQuestion() {
  if (interviewIndex > 0) {
    if (!interviewReviewMode) {
      interviewAnswers[interviewIndex] =
        document.getElementById("answer").value;

      localStorage.setItem(
        currentInterviewCompany + "_interviewAnswers",
        JSON.stringify(interviewAnswers)
      );
    }

    interviewIndex--;

    localStorage.setItem(
      currentInterviewCompany + "_interviewIndex",
      interviewIndex
    );

    loadInterviewQuestion();
  }
}

function reviewInterview() {
  interviewReviewMode = true;
  interviewIndex = 0;

  document.getElementById("answer").style.display = "block";

  document.querySelectorAll(".quiz-btn").forEach(btn => {
    btn.style.display = "inline-block";
  });

  document.getElementById("interviewActions").style.display = "none";

  loadInterviewQuestion();
}

function restartInterview() {
  interviewReviewMode = false;

  localStorage.removeItem(currentInterviewCompany + "_interviewCompleted");
  localStorage.removeItem(currentInterviewCompany + "_interviewIndex");
  localStorage.removeItem(currentInterviewCompany + "_interviewAnswers");

  interviewFeedbacks = [];

  loadInterviewQuestions(currentInterviewCompany);
}

async function analyzeInterviewAnswer() {
  let answer = document.getElementById("answer").value;
  let feedbackBox = document.getElementById("aiFeedback");
  let btn = document.getElementById("analyzeBtn");

  if (!interviewQuestionsDB || interviewQuestionsDB.length === 0) {
    feedbackBox.innerHTML = "Please select a company first.";
    return;
  }

  if (answer.trim() === "") {
    feedbackBox.innerHTML = "Please write your answer first.";
    return;
  }

  let question = interviewQuestionsDB[interviewIndex].question;

  btn.disabled = true;
  btn.innerHTML = "Analyzing...";
  feedbackBox.innerHTML = "Please wait, AI is checking your answer...";

  try {
    let res = await fetch("http://localhost:3000/ai-interview-feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question: question,
        answer: answer
      })
    });

    let data = await res.json();

    if (data.success) {
      interviewFeedbacks[interviewIndex] = data.feedback;
      feedbackBox.innerHTML = data.feedback;
    } else {
      feedbackBox.innerHTML = data.feedback || "AI feedback failed.";
    }

  } catch (error) {
    feedbackBox.innerHTML = "Frontend error: " + error.message;
  }

  btn.disabled = false;
  btn.innerHTML = "🤖 Analyze Answer";
}
// ===== RESUME BUILDER =====
function generateResume() {
  document.getElementById("showName").innerHTML =
    document.getElementById("name").value;

  document.getElementById("showEmail").innerHTML =
    document.getElementById("email").value;

  document.getElementById("showSkills").innerHTML =
    document.getElementById("skills").value;

  document.getElementById("showEducation").innerHTML =
    document.getElementById("education").value;
}

function saveResume() {
  let name = document.getElementById("name").value;
  let email = document.getElementById("email").value;
  let skills = document.getElementById("skills").value;
  let education = document.getElementById("education").value;
  let msg = document.getElementById("resumeMsg");

  fetch("http://localhost:3000/save-resume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, skills, education })
  })
  .then(res => res.json())
  .then(data => {
    msg.innerHTML = data.message;
    msg.style.color = data.success ? "green" : "red";
  });
}

function handleResume() {
  generateResume();
  saveResume();
}

function downloadResume() {
  let resumeContent =
    document.querySelector(".preview-content").innerHTML;

  let newWindow =
    window.open("", "", "width=800,height=700");

  newWindow.document.write(`
    <html>
    <head>
      <title>Resume</title>
      <style>
        body{
          font-family:Arial;
          padding:40px;
          line-height:1.8;
        }
        h3{
          color:#3a36c7;
          text-align:center;
          font-size:35px;
        }
        h4{
          color:#1d1d7a;
          margin-top:25px;
        }
        p{
          color:#444;
          font-size:18px;
        }
        hr{
          margin:20px 0;
        }
      </style>
    </head>
    <body>
      ${resumeContent}
    </body>
    </html>
  `);

  newWindow.document.close();
  newWindow.print();
}


// ===== PROFILE IMAGE PREVIEW =====
let profileImageInput = document.getElementById("profileImage");

if (profileImageInput) {
  profileImageInput.addEventListener("change", function(e) {
    let image = document.getElementById("previewImage");
    image.src = URL.createObjectURL(e.target.files[0]);
  });
}

//====== progress ========
function getStatus(company, type){

  let completed =
  localStorage.getItem(company + "_" + type + "Completed");

  let index =
  localStorage.getItem(company + "_" + type + "Index");

  if(completed === "true"){
    return "Completed";
  }

  if(index !== null && Number(index) > 0){
    return "In Progress";
  }

  return "Not Started";
}

function statusClass(status){

  if(status === "Completed"){
    return "completed";
  }

  if(status === "In Progress"){
    return "inprogress";
  }

  return "notstarted";
}

function loadProgressDashboard(){

  let companies = ["TCS", "Infosys", "Wipro", "Accenture"];

  let aptitudeDone = 0;
  let codingDone = 0;
  let interviewDone = 0;

  let companyStatus = document.getElementById("companyStatus");
  companyStatus.innerHTML = "";

  companies.forEach(company => {

    let aptitudeStatus = getStatus(company, "quiz");
    let codingStatus = getStatus(company, "coding");
    let interviewStatus = getStatus(company, "interview");

    if(aptitudeStatus === "Completed"){
      aptitudeDone++;
    }

    if(codingStatus === "Completed"){
      codingDone++;
    }

    if(interviewStatus === "Completed"){
      interviewDone++;
    }

    companyStatus.innerHTML += `
      <div class="company-progress-card">

        <h2>${company}</h2>

        <div class="status-line">
          <span>🧠 Aptitude</span>
          <span class="status ${statusClass(aptitudeStatus)}">
            ${aptitudeStatus}
          </span>
        </div>

        <div class="status-line">
          <span>💻 Coding</span>
          <span class="status ${statusClass(codingStatus)}">
            ${codingStatus}
          </span>
        </div>

        <div class="status-line">
          <span>🎤 Interview</span>
          <span class="status ${statusClass(interviewStatus)}">
            ${interviewStatus}
          </span>
        </div>

      </div>
    `;
  });

  let aptPercent = (aptitudeDone / companies.length) * 100;
  let codingPercent = (codingDone / companies.length) * 100;
  let interviewPercent = (interviewDone / companies.length) * 100;

  document.getElementById("aptPercent").innerHTML = aptPercent + "%";
  document.getElementById("codingPercent").innerHTML = codingPercent + "%";
  document.getElementById("interviewPercent").innerHTML = interviewPercent + "%";

  document.getElementById("aptitude").style.width = aptPercent + "%";
  document.getElementById("coding").style.width = codingPercent + "%";
  document.getElementById("interview").style.width = interviewPercent + "%";

  document.getElementById("aptText").innerHTML =
    aptitudeDone + " of " + companies.length + " completed";

  document.getElementById("codingText").innerHTML =
    codingDone + " of " + companies.length + " completed";

  document.getElementById("interviewText").innerHTML =
    interviewDone + " of " + companies.length + " completed";
}
//======= dashboard =======
function loadDashboardStats() {

  let companies = ["TCS", "Infosys", "Wipro", "Accenture"];

  let aptitudeDone = 0;
  let codingDone = 0;
  let interviewDone = 0;

  companies.forEach(company => {

    if(localStorage.getItem(company + "_quizCompleted") === "true"){
      aptitudeDone++;
    }

    if(localStorage.getItem(company + "_codingCompleted") === "true"){
      codingDone++;
    }

    if(localStorage.getItem(company + "_interviewCompleted") === "true"){
      interviewDone++;
    }

  });

  document.getElementById("aptitudeCount").innerHTML = aptitudeDone;
  document.getElementById("codingCount").innerHTML = codingDone;
  document.getElementById("interviewCount").innerHTML = interviewDone;

  let totalTasks = companies.length * 3;
  let completedTasks = aptitudeDone + codingDone + interviewDone;

  let overall = Math.round((completedTasks / totalTasks) * 100);

  document.getElementById("overallPercent").innerHTML = overall + "%";

  document.getElementById("recentAptitude").innerHTML =
    "Aptitude: " + aptitudeDone + " companies completed";

  document.getElementById("recentCoding").innerHTML =
    "Coding: " + codingDone + " companies completed";

  document.getElementById("recentInterview").innerHTML =
    "Interview: " + interviewDone + " companies completed";
}
//mentor chat
async function askCareerMentor() {
  let input = document.getElementById("mentorInput");
  let chat = document.getElementById("mentorChat");

  let message = input.value.trim();

  if (message === "") {
    return;
  }

  chat.innerHTML += `
    <div class="user-msg">
      ${message}
    </div>
  `;

  input.value = "";

  chat.innerHTML += `
    <div class="ai-msg" id="mentorLoading">
      Thinking...
    </div>
  `;

  try {
    let res = await fetch("http://localhost:3000/ai-career-mentor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: message
      })
    });

    let data = await res.json();

    document.getElementById("mentorLoading").remove();

    chat.innerHTML += `
      <div class="ai-msg">
        ${data.reply}
      </div>
    `;

  } catch (error) {
    document.getElementById("mentorLoading").innerHTML =
      "Something went wrong.";
  }

  chat.scrollTop = chat.scrollHeight;
}