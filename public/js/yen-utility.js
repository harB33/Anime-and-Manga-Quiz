// Yen Utility Functions - Load on all pages

// Get yen balance from localStorage
function getYen() {
  const yen = localStorage.getItem("yen");
  return yen ? parseInt(yen) : 0;
}

// Set yen balance in localStorage
function setYen(amount) {
  localStorage.setItem("yen", Math.max(0, amount));
}

// Update the yen display on the page
function updateYenDisplay() {
  const yenElement = document.getElementById("yen-amount");
  if (yenElement) {
    yenElement.textContent = getYen();
  }
}

// Load and display yen on page load
function initializeYenDisplay() {
  updateYenDisplay();
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeYenDisplay);
} else {
  initializeYenDisplay();
}

