// Quiz Application Frontend JavaScript
let currentQuestions = []
let userAnswers = []

// Function to decode HTML entities
function decodeHtml(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

async function loadCategories() {
  try {
    const response = await fetch("/api/quiz/categories")
    const data = await response.json()
    if (data.success) {
      const categorySelect = document.getElementById("category")
      data.categories.forEach((category) => {
        const option = document.createElement("option")
        option.value = category.id
        option.textContent = category.name
        categorySelect.appendChild(option)
      })
    }
  } catch (error) {
    console.error("Error loading categories:", error)
  }
}

async function getQuestions() {
  const amount = document.getElementById("amount").value
  const category = document.getElementById("category").value
  const difficulty = document.getElementById("difficulty").value

  const container = document.getElementById("quiz-container")
  container.innerHTML = '<div class="loading"><div class="spinner"></div><div class="loading-text">Fetching questions from OpenTDB...</div></div>'

  // Disable the start button during loading
  const startButton = document.querySelector('button[onclick="getQuestions()"]')
  if (startButton) startButton.disabled = true

  try {
    let url = `/api/quiz/questions?amount=${amount}`
    if (category) url += `&category=${category}`
    if (difficulty) url += `&difficulty=${difficulty}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.success) {
      currentQuestions = data.results
      userAnswers = new Array(data.results.length).fill(null)
      displayQuestions(data.results)
    } else {
      container.innerHTML = `<div class="error">Error: ${data.error}</div>`
    }
  } catch (error) {
    console.error("Error fetching questions:", error)
    container.innerHTML =
      '<div class="error">Failed to load questions. Please try again.</div>'
  } finally {
    // Re-enable the start button after loading completes
    if (startButton) startButton.disabled = false
  }
}

function displayQuestions(questions) {
  const container = document.getElementById("quiz-container")
  container.innerHTML = ""

  questions.forEach((question, index) => {
    const questionDiv = document.createElement("div")
    questionDiv.className = "question"

    const answers = [
      ...question.incorrect_answers,
      question.correct_answer,
    ]
    // Shuffle answers
    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
        ;[answers[i], answers[j]] = [answers[j], answers[i]]
    }

    questionDiv.innerHTML = `
            <h3>Question ${index + 1}: ${decodeHtml(question.question)}</h3>
            <div class="question-info">
                <span><strong>Category:</strong> ${question.category}</span>
                <span><strong>Difficulty:</strong> ${question.difficulty}</span>
                <span><strong>Type:</strong> ${question.type}</span>
            </div>
            <div class="answers">
                ${answers
        .map(
          (answer, answerIndex) =>
            `<label class="answer-option">
                        <input type="radio" name="question-${index}" value="${answer}" data-question-index="${index}">
                        ${decodeHtml(answer)}
                    </label>`,
        )
        .join("")}
            </div>
        `
    container.appendChild(questionDiv)
  })

  // Add event listeners for radio buttons
  const radioButtons = container.querySelectorAll('input[type="radio"]')
  radioButtons.forEach(radio => {
    radio.addEventListener('change', function () {
      const questionIndex = parseInt(this.getAttribute('data-question-index'))
      const answer = this.value
      selectAnswer(questionIndex, answer)
    })
  })

  // Add submit button
  const submitButton = document.createElement("button")
  submitButton.textContent = "Submit Quiz"
  submitButton.id = "submit-quiz-btn"
  submitButton.style.background = "#28a745"
  submitButton.style.marginTop = "20px"
  container.appendChild(submitButton)

  // Add event listener for submit button
  submitButton.addEventListener('click', submitQuiz)
}

function selectAnswer(index, answer) {
  userAnswers[index] = answer
}

function submitQuiz() {
  // Check if all questions are answered
  if (userAnswers.some(answer => answer === null)) {
    alert("Please answer all questions before submitting.")
    return
  }

  fetch("/api/quiz/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      answers: userAnswers,
      questions: currentQuestions,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        displayResults(data)
      } else {
        alert("Error submitting quiz: " + data.error)
      }
    })
    .catch((error) => {
      console.error("Error submitting quiz:", error)
      alert("Failed to submit quiz. Please try again.")
    })
}

function displayResults(data) {
  const container = document.getElementById("quiz-container")
  container.innerHTML = ""

  const scoreDiv = document.createElement("div")
  scoreDiv.className = "score-display"
  scoreDiv.innerHTML = `
        <h2>Quiz Results</h2>
        <p>You scored ${data.correct} out of ${data.total} (${data.percentage}%)</p>
    `
  container.appendChild(scoreDiv)

  data.results.forEach((result, index) => {
    console.log(`Question ${index + 1}:`, result.correct, typeof result.correct)
    const resultDiv = document.createElement("div")
    resultDiv.className = `result ${result.correct ? "correct" : "incorrect"}`
    resultDiv.innerHTML = `
            <h4>Question ${index + 1}: ${decodeHtml(result.question)}</h4>
            <p><strong>Your answer:</strong> ${decodeHtml(result.userAnswer)}</p>
            <p><strong>Correct answer:</strong> ${decodeHtml(result.correctAnswer)}</p>
        `
    container.appendChild(resultDiv)
  })

  // Add reset button
  const resetButton = document.createElement("button")
  resetButton.textContent = "Take Another Quiz"
  resetButton.id = "reset-results-btn"
  resetButton.style.background = "#007bff"
  resetButton.style.marginTop = "20px"
  container.appendChild(resetButton)

  // Add event listener for reset button
  resetButton.addEventListener('click', resetQuiz)
}

function resetQuiz() {
  const container = document.getElementById("quiz-container")
  container.innerHTML = ""
  currentQuestions = []
  userAnswers = []
}

// let activeIntervals = [];

// function scrambleText(element, target, duration = 1500) {
//   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?シつモンヶ';
//   const steps = duration / 50;
//   let step = 0;
//   const interval = setInterval(() => {
//     step++;
//     let scrambled = '';
//     for (let i = 0; i < target.length; i++) {
//       if (step > steps * (i / target.length)) {
//         scrambled += target[i];
//       } else {
//         scrambled += chars[Math.floor(Math.random() * chars.length)];
//       }
//     }
//     element.textContent = scrambled;
//     if (step >= steps) {
//       clearInterval(interval);
//       element.textContent = target;
//       // Remove from active intervals
//       activeIntervals = activeIntervals.filter(id => id !== interval);
//     }
//   }, 50);
  
//   // Store interval ID
//   activeIntervals.push(interval);
// }

// let isJapanese = false;

// function loopScramble() {
//   const titleSpans = document.querySelectorAll('h1 span');
//   if (titleSpans.length === 4) {
//     // Clear any running animations
//     activeIntervals.forEach(interval => clearInterval(interval));
//     activeIntervals = [];
    
//     // Scramble to Japanese
//     const japaneseTargets = ['シ', 'つ', 'モ', 'ン'];
//     scrambleText(titleSpans[0], japaneseTargets[0]);
//     setTimeout(() => scrambleText(titleSpans[1], japaneseTargets[1]), 500);
//     setTimeout(() => scrambleText(titleSpans[2], japaneseTargets[2]), 1000);
//     setTimeout(() => scrambleText(titleSpans[3], japaneseTargets[3]), 1500);
    
//     // After 3 seconds of showing Japanese, change to English
//     setTimeout(() => {
//       activeIntervals.forEach(interval => clearInterval(interval));
//       activeIntervals = [];
      
//       const englishTargets = ['SHI', 'TSU', 'MO', 'N'];
//       titleSpans[0].textContent = englishTargets[0];
//       setTimeout(() => titleSpans[1].textContent = englishTargets[1], 500);
//       setTimeout(() => titleSpans[2].textContent = englishTargets[2], 1000);
//       setTimeout(() => titleSpans[3].textContent = englishTargets[3], 1500);
      
//       // After 3 seconds of showing English, repeat
//       setTimeout(loopScramble, 3000);
//     }, 3000);
//   }
// }

// Load categories on page load
document.addEventListener("DOMContentLoaded", function () {
  loadCategories()
  // Add event listeners for buttons
  const startBtn = document.getElementById('start-quiz-btn')
  const resetBtn = document.getElementById('reset-quiz-btn')

  if (startBtn) startBtn.addEventListener('click', getQuestions)
  if (resetBtn) resetBtn.addEventListener('click', resetQuiz)

  // Scramble title
  // setTimeout(loopScramble, 3000);
})

// Also call immediately in case DOMContentLoaded has already fired
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () {
    loadCategories()
    // Add event listeners for buttons
    const startBtn = document.getElementById('start-quiz-btn')
    const resetBtn = document.getElementById('reset-quiz-btn')

    if (startBtn) startBtn.addEventListener('click', getQuestions)
    if (resetBtn) resetBtn.addEventListener('click', resetQuiz)

    // Scramble title with 3 second delay
    // setTimeout(loopScramble, 3000);
  })
} else {
  loadCategories()
  // Add event listeners for buttons
  const startBtn = document.getElementById('start-quiz-btn')
  const resetBtn = document.getElementById('reset-quiz-btn')

  if (startBtn) startBtn.addEventListener('click', getQuestions)
  if (resetBtn) resetBtn.addEventListener('click', resetQuiz)

  // Scramble title
  // setTimeout(loopScramble, 3000);
}