let currentTab = "hourly";
let QUEST_DATA = {};
let COOLDOWNS = {};
let serverTimeOffset = 0; // ms difference between client and server

document.addEventListener("DOMContentLoaded", () => {
  fetchQuestState();

  // Set up tab listeners
  document
    .getElementById("tab-hourly")
    .addEventListener("click", () => switchTab("hourly"));
  document
    .getElementById("tab-daily")
    .addEventListener("click", () => switchTab("daily"));
  document
    .getElementById("tab-weekly")
    .addEventListener("click", () => switchTab("weekly"));

  // Re-render and count down every second
  setInterval(renderQuests, 1000);
});

async function fetchQuestState() {
  try {
    const response = await fetch("/php/get_quests.php");
    const data = await response.json();
    if (data.success) {
      const serverMs = new Date(data.server_time.replace(/-/g, "/")).getTime();
      serverTimeOffset = Date.now() - serverMs;

      QUEST_DATA = data.quests;
      COOLDOWNS = data.cooldowns;

      renderQuests();
    } else if (data.error === "Not authenticated") {
      const authTrigger = document.getElementById("auth-modal-trigger");
      if (authTrigger) authTrigger.click();
      document.getElementById("quests-container").innerHTML =
        '<p class="text-center text-purple-300 text-xl mt-10">Please log in to view and claim quests.</p>';
    } else {
      console.error("Quest fetch returned error:", data.error);
      document.getElementById("quests-container").innerHTML =
        `<p class="text-center text-red-400 text-xl mt-10">Error loading quests: ${data.error || "Unknown error"}</p>`;
    }
  } catch (e) {
    console.error("Failed to fetch quests", e);
    document.getElementById("quests-container").innerHTML =
      '<p class="text-center text-red-400 text-xl mt-10">Could not connect to the server. Please try again later.</p>';
  }
}

function switchTab(tab) {
  currentTab = tab;
  // Update button styles
  ["hourly", "daily", "weekly"].forEach((t) => {
    const btn = document.getElementById(`tab-${t}`);
    if (btn) {
      if (t === tab) {
        btn.className =
          "glint bg-primary text-white font-ramen text-2xl px-8 py-3 rounded-2xl shadow-xl transition-all duration-300 scale-105 border-2 border-pink-400";
      } else {
        btn.className =
          "glint bg-primary/50 text-purple-300 hover:text-white font-ramen text-2xl px-8 py-3 rounded-2xl transition-all duration-300 hover:bg-primary/80 border-2 border-transparent";
      }
    }
  });
  renderQuests();
}

function renderQuests() {
  const container = document.getElementById("quests-container");
  if (!container) return;

  if (!QUEST_DATA[currentTab]) return;

  container.innerHTML = "";
  const quests = QUEST_DATA[currentTab];

  quests.forEach((quest) => {
    const cooldownSecs = COOLDOWNS[currentTab];
    let canClaim = true;
    let timeRemaining = 0;

    if (quest.last_claimed) {
      const lastClaimed = new Date(
        quest.last_claimed.replace(/-/g, "/"),
      ).getTime();
      const now = Date.now() - serverTimeOffset; // Sync with server time
      const elapsedSecs = (now - lastClaimed) / 1000;

      if (elapsedSecs < cooldownSecs) {
        canClaim = false;
        timeRemaining = cooldownSecs - elapsedSecs;
      }
    }

    // Check requirement
    let requirementMet = true;
    let requirementText = "";
    if (quest.requirement) {
      if (quest.progress < quest.requirement.count) {
        requirementMet = false;
        canClaim = false; // Lock button if requirement not met
      }

      // Format requirement display
      const progressColor = requirementMet ? "text-green-400" : "text-pink-300";
      requirementText = `<p class="text-sm font-poppins mt-2 ${progressColor} font-bold">Requirement Progress: ${Math.min(quest.progress, quest.requirement.count)} / ${quest.requirement.count}</p>`;
    }

    const div = document.createElement("div");
    div.className =
      "glint bg-primary/30 backdrop-blur-xl border border-purple-300/20 rounded-3xl p-6 flex items-center justify-between hover:border-pink-500/40 transition-all duration-300 group shadow-lg";

    div.innerHTML = `
            <div class="flex flex-col gap-1 w-2/3">
                <h3 class="text-2xl font-bold text-purple-300 font-ramen group-hover:text-pink-300 transition-colors">${quest.title}</h3>
                <p class="text-purple-300/75 font-poppins">${quest.desc}</p>
                ${requirementText}
            </div>
            <div class="flex flex-col items-end gap-3 w-1/3">
                <div class="flex items-center gap-2">
                    <span class="text-2xl font-bold text-yellow-400 font-ramen">+${quest.reward} Yen</span>
                </div>
                ${getButtonHtml(quest.id, canClaim, timeRemaining, requirementMet)}
            </div>
        `;

    // Add event listener to the button if it's claimable
    if (canClaim) {
      const btn = div.querySelector("button");
      if (btn) {
        btn.addEventListener("click", () => claimQuest(quest.id));
      }
    }

    container.appendChild(div);
  });
}

function getButtonHtml(questId, canClaim, timeRemaining, requirementMet) {
  if (canClaim) {
    return `<button class="glint bg-pink-500 hover:bg-pink-400 text-white font-bold py-2 px-8 rounded-xl font-poppins transition-all duration-300 hover:scale-105 shadow-[0_0_15px_rgba(236,72,153,0.5)]">
            Claim Reward
        </button>`;
  } else {
    if (!requirementMet && timeRemaining <= 0) {
      // Cooldown is ready, but requirement is NOT met
      return `<button disabled class="bg-primary/20 text-purple-300/50 font-bold py-2 px-8 rounded-xl font-poppins border border-purple-300/10 cursor-not-allowed">
                Locked
            </button>`;
    } else {
      // Still on cooldown
      const hours = Math.floor(timeRemaining / 3600);
      const mins = Math.floor((timeRemaining % 3600) / 60);
      const secs = Math.floor(timeRemaining % 60);
      const timeStr = `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

      return `<button disabled class="bg-primary/20 text-purple-300/50 font-bold py-2 px-8 rounded-xl font-poppins border border-purple-300/10 cursor-not-allowed">
                ${timeStr}
            </button>`;
    }
  }
}

async function claimQuest(questId) {
  try {
    const response = await fetch("/php/claim_quest.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `quest_id=${questId}`,
    });

    const data = await response.json();

    if (data.success) {
      // Show toast
      const toast = document.createElement("div");
      toast.className = "toast toast-bottom toast-end z-50 animate-bounce";
      toast.innerHTML = `
                <div class="alert bg-pink-500 text-white border-none shadow-2xl font-poppins">
                    <span>Successfully claimed ${data.reward} Yen!</span>
                </div>
            `;
      document.body.appendChild(toast);

      setTimeout(() => toast.remove(), 3000);

      // Update yen display
      if (typeof updateYenDisplay === "function") {
        updateYenDisplay();
      }

      // Reload quests from server to get new states & progress
      fetchQuestState();
    } else {
      alert(data.error || "Failed to claim quest");
    }
  } catch (e) {
    console.error("Failed to claim quest", e);
    alert("An error occurred. Please try again.");
  }
}
