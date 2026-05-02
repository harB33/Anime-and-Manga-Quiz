// Quiz Application Frontend JavaScript
let currentQuestions = []
let userAnswers = []
let currentQuestionIndex = 0

// Function to decode HTML entities
function decodeHtml(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

async function detectPhp() {
  try {
    const response = await fetch('/db/ping.php')
    if (!response.ok) {
      console.warn('PHP endpoint responded with status', response.status)
      return
    }

    const data = await response.json()
    console.log('PHP detection result:', data)
  } catch (error) {
    console.error('PHP detection failed:', error)
  }
}

async function loadCategories() {
  try {
    const response = await fetch("/api/quiz/categories")
    const data = await response.json()
    if (data.success) {
      const categorySelect = document.getElementById("category")
      if (!categorySelect || categorySelect.tagName !== "SELECT") return
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

  // Hide the navbar once the quiz starts
  const navbar = document.getElementById("main-nav")
  if (navbar) navbar.classList.add("hidden")

  const container = document.getElementById("quiz-container")
  container.innerHTML = '<div class="flex flex-col items-center justify-center gap-6 min-h-[50vh]"><div class="w-14 h-14 border-4 border-purple-300/10 border-t-purple-300 rounded-full animate-spin"></div><div class="text-xl text-purple-300 font-poppins">Fetching questions from OpenTDB...</div></div>'

  // Disable the start button during loading
  const startButton = document.getElementById("start-quiz-btn")
  if (startButton) {
    startButton.disabled = true
    const spanText = startButton.querySelector('span')
    if (spanText) spanText.textContent = 'Loading questions...'
  }

  try {
    let url = `/api/quiz/questions?amount=${amount}`
    if (category) url += `&category=${category}`
    if (difficulty) url += `&difficulty=${difficulty}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.success) {
      currentQuestions = data.results
      userAnswers = new Array(data.results.length).fill(null)
      currentQuestionIndex = 0
      displayQuestion(0)

      // Hide the quiz options sidebar, then the question container appears
      const sidebar = document.getElementById("quiz-options-sidebar")
      if (sidebar) sidebar.classList.add("hidden")
      container.classList.remove("hidden")
    } else {
      container.innerHTML = `<div class="error">Error: ${data.error}</div>`
      container.classList.remove("hidden")
    }
  } catch (error) {
    console.error("Error fetching questions:", error)
    container.innerHTML =
      '<div class="error">Failed to load questions. Please try again.</div>'
    container.classList.remove("hidden")
  } finally {
    // Re-enable the start button after loading completes
    if (startButton) {
      startButton.disabled = false
      const spanText = startButton.querySelector('span')
      if (spanText) spanText.textContent = 'Start Quiz'
    }
  }
}

function displayQuestion(index) {
  const container = document.getElementById("quiz-container")
  container.innerHTML = ""

  if (!currentQuestions || currentQuestions.length === 0) return

  const question = currentQuestions[index]

  // Progress indicator
  const progressDiv = document.createElement("div")
  progressDiv.className = "quiz-progress mb-4 text-purple-300 font-poppins text-lg"
  progressDiv.innerHTML = `<span>Question <strong>${index + 1}</strong> of <strong>${currentQuestions.length}</strong></span>`
  container.appendChild(progressDiv)

  const questionDiv = document.createElement("div")
  questionDiv.className = "bg-purple-950/40 border border-purple-300/20 rounded-2xl p-6 mb-8 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all duration-300 hover:border-purple-300/40 hover:shadow-[0_4px_25px_rgba(216,180,254,0.1)]"

  if (!question.shuffled_answers) {
    const answers = [
      ...question.incorrect_answers,
      question.correct_answer,
    ]
    // Shuffle answers
    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[answers[i], answers[j]] = [answers[j], answers[i]]
    }
    question.shuffled_answers = answers
  }

  questionDiv.innerHTML = `
    <h3 class="text-2xl font-bold text-purple-300 mb-4 font-poppins">Question ${index + 1}: ${decodeHtml(question.question)}</h3>
    <div class="flex gap-6 text-sm text-purple-300/60 mb-5 font-poppins">
      <span><strong>Category:</strong> ${question.category}</span>
      <span><strong>Difficulty:</strong> ${question.difficulty}</span>
      <span><strong>Type:</strong> ${question.type}</span>
    </div>
    <div class="flex flex-col gap-3">
      ${question.shuffled_answers
        .map(
          (answer, answerIndex) => {
            const isChecked = userAnswers[index] === answer ? "checked" : "";
            return `<label class="answer-option flex items-center gap-3 bg-white/5 border border-purple-300/15 rounded-xl p-4 text-purple-300/85 cursor-pointer font-poppins transition-all duration-200 hover:bg-purple-300/10 hover:border-purple-300/35 hover:text-white [&.selected]:bg-purple-300/10 [&.selected]:border-purple-300/35 [&.selected]:text-white ${isChecked ? 'selected bg-purple-300/10 border-purple-300/35 text-white' : ''}">
              <input type="radio" name="question-${index}" value="${answer}" data-question-index="${index}" class="accent-purple-300 w-5 h-5 cursor-pointer" ${isChecked}>
              ${decodeHtml(answer)}
            </label>`;
          }
        )
        .join("")}
    </div>
  `
  container.appendChild(questionDiv)

  // Add event listeners for radio buttons
  const radioButtons = container.querySelectorAll('input[type="radio"]')
  radioButtons.forEach(radio => {
    radio.addEventListener('change', function () {
      const questionIndex = parseInt(this.getAttribute('data-question-index'))
      const answer = this.value
      selectAnswer(questionIndex, answer)
      // Visually select the option
      container.querySelectorAll('.answer-option').forEach(opt => opt.classList.remove('selected'))
      this.parentElement.classList.add('selected')
    })
  })

  // Add navigation buttons
  const navContainer = document.createElement("div")
  navContainer.className = "quiz-navigation flex justify-between gap-4 mt-6"

  // Prev button
  const prevButton = document.createElement("button")
  prevButton.textContent = "Previous"
  prevButton.className = "glint bg-primary p-3 font-ramen text-xl text-purple-300 rounded-xl flex items-center justify-center cursor-pointer disabled:opacity-50"
  prevButton.disabled = index === 0
  prevButton.style.marginTop = "0px"
  prevButton.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--
      displayQuestion(currentQuestionIndex)
    }
  })
  navContainer.appendChild(prevButton)

  // Next or Submit button
  if (index === currentQuestions.length - 1) {
    const submitButton = document.createElement("button")
    submitButton.textContent = "Submit Quiz"
    submitButton.id = "submit-quiz-btn"
    submitButton.className = "glint bg-primary p-3 font-ramen text-xl text-purple-300 rounded-xl flex items-center justify-center cursor-pointer"
    submitButton.style.width = "auto"
    submitButton.style.marginTop = "0px"
    submitButton.addEventListener('click', submitQuiz)
    navContainer.appendChild(submitButton)
  } else {
    const nextButton = document.createElement("button")
    nextButton.textContent = "Next"
    nextButton.className = "glint bg-primary p-3 font-ramen text-xl text-purple-300 rounded-xl flex items-center justify-center cursor-pointer"
    nextButton.style.marginTop = "0px"
    nextButton.addEventListener('click', () => {
      if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++
        displayQuestion(currentQuestionIndex)
      }
    })
    navContainer.appendChild(nextButton)
  }

  container.appendChild(navContainer)
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
  scoreDiv.className = "bg-purple-950/50 border-2 border-purple-300/30 rounded-2xl p-8 mb-10 text-center font-poppins"
  scoreDiv.innerHTML = `
        <h2 class="font-ramen text-5xl text-purple-300 mb-2">Quiz Results</h2>
        <p class="text-2xl text-purple-300/85">You scored ${data.correct} out of ${data.total} (${data.percentage}%)</p>
    `
  container.appendChild(scoreDiv)

  data.results.forEach((result, index) => {
    console.log(`Question ${index + 1}:`, result.correct, typeof result.correct)
    const resultDiv = document.createElement("div")
    const resultColorClasses = result.correct ? "border-green-500/60 bg-green-500/5" : "border-red-500/60 bg-red-500/5"
    resultDiv.className = `result bg-white/5 border-l-[6px] rounded-xl p-5 mb-6 font-poppins ${resultColorClasses}`
    resultDiv.innerHTML = `
            <h4 class="text-xl text-white mb-2">Question ${index + 1}: ${decodeHtml(result.question)}</h4>
            <p class="text-purple-300/75"><strong>Your answer:</strong> ${decodeHtml(result.userAnswer)}</p>
            <p class="text-purple-300/75"><strong>Correct answer:</strong> ${decodeHtml(result.correctAnswer)}</p>
        `
    container.appendChild(resultDiv)
  })

  // Add reset button
  const resetButton = document.createElement("button")
  resetButton.textContent = "Take Another Quiz"
  resetButton.id = "reset-results-btn"
  resetButton.className = "bg-[#2E0854] text-purple-300 border border-purple-300/30 font-ramen text-2xl p-4 rounded-2xl cursor-pointer transition-all duration-300 w-full text-center hover:bg-purple-950/80 hover:border-purple-300/50 hover:scale-[1.02] hover:shadow-[0_4px_20px_rgba(216,180,254,0.2)] mt-5"
  container.appendChild(resetButton)

  // Add event listener for reset button
  resetButton.addEventListener('click', resetQuiz)
}

function resetQuiz() {
  const container = document.getElementById("quiz-container")
  container.innerHTML = ""
  currentQuestions = []
  userAnswers = []

  // Reset elements visibility
  const sidebar = document.getElementById("quiz-options-sidebar")
  if (sidebar) sidebar.classList.remove("hidden")
  container.classList.add("hidden")

  const navbar = document.getElementById("main-nav")
  if (navbar) navbar.classList.remove("hidden")
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
  detectPhp()

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