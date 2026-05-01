let activeIntervals = [];

function scrambleText(element, target, duration = 1500) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?シつモンヶ';
  const steps = duration / 50;
  let step = 0;
  const interval = setInterval(() => {
    step++;
    let scrambled = '';
    for (let i = 0; i < target.length; i++) {
      if (step > steps * (i / target.length)) {
        scrambled += target[i];
      } else {
        scrambled += chars[Math.floor(Math.random() * chars.length)];
      }
    }
    element.textContent = scrambled;
    if (step >= steps) {
      clearInterval(interval);
      element.textContent = target;
      // Remove from active intervals
      activeIntervals = activeIntervals.filter(id => id !== interval);
    }
  }, 50);
  
  // Store interval ID
  activeIntervals.push(interval);
}

function loopScramble() {
  const titleSpans = document.querySelectorAll('h1 span');
  if (titleSpans.length === 4) {
    // Clear any running animations
    activeIntervals.forEach(interval => clearInterval(interval));
    activeIntervals = [];
    
    // Scramble to Japanese
    const japaneseTargets = ['シ', 'つ', 'モ', 'ン'];
    scrambleText(titleSpans[0], japaneseTargets[0]);
    setTimeout(() => scrambleText(titleSpans[1], japaneseTargets[1]), 500);
    setTimeout(() => scrambleText(titleSpans[2], japaneseTargets[2]), 1000);
    setTimeout(() => scrambleText(titleSpans[3], japaneseTargets[3]), 1500);
    
    // After 3 seconds of showing Japanese, change to English
    setTimeout(() => {
      activeIntervals.forEach(interval => clearInterval(interval));
      activeIntervals = [];
      
      const englishTargets = ['SHI', 'TSU', 'MO', 'N'];
      titleSpans[0].textContent = englishTargets[0];
      setTimeout(() => titleSpans[1].textContent = englishTargets[1], 500);
      setTimeout(() => titleSpans[2].textContent = englishTargets[2], 1000);
      setTimeout(() => titleSpans[3].textContent = englishTargets[3], 1500);
      
      // After 3 seconds of showing English, repeat
      setTimeout(loopScramble, 3000);
    }, 3000);
  }
}

// Initialize animation on page load
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(loopScramble, 3000);

  const modalTrigger = document.getElementById("auth-modal-trigger");
  const authModal = document.getElementById("auth-modal");
  const closeModal = document.getElementById("close-auth-modal");
  if (modalTrigger && authModal) {
    modalTrigger.addEventListener("click", () => {
      authModal.showModal();
    });
  }
  if (closeModal && authModal) {
    closeModal.addEventListener("click", () => {
      authModal.close();
    });
  }
});

// Also call immediately in case DOMContentLoaded has already fired
if (document.readyState !== 'loading') {
  setTimeout(loopScramble, 3000);
}

