// Yen Utility Functions - Load on all pages

// Fallback to localStorage if offline/error
function getLocalYen() {
  const yen = localStorage.getItem("yen");
  return yen ? parseInt(yen) : 0;
}

// Set yen balance in localStorage as backup
function setLocalYen(amount) {
  localStorage.setItem("yen", Math.max(0, amount));
}

// Fetch true yen balance from database
async function fetchYen() {
  try {
    const response = await fetch("/php/get_yen.php");
    const data = await response.json();
    if (data.success) {
      setLocalYen(data.yen); // Sync local storage
      return data.yen;
    }
    return getLocalYen();
  } catch (error) {
    console.error("Error fetching yen:", error);
    return getLocalYen();
  }
}

// Update the yen display on the page asynchronously
async function updateYenDisplay() {
  const yenElement = document.getElementById("yen-amount");
  if (yenElement) {
    // Show loading state or current local state first
    yenElement.textContent = getLocalYen();

    // Fetch and update with true DB state
    const trueYen = await fetchYen();
    yenElement.textContent = trueYen;
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
