const QUEST_DATA = {
    hourly: [
        { id: 'hourly_1', title: 'Hourly Login Bonus', desc: 'Log in to claim your hourly free Yen!', reward: 50 },
        { id: 'hourly_2', title: 'Hourly Knowledge Check', desc: 'Brush up on your anime facts.', reward: 60 },
        { id: 'hourly_3', title: 'Speedy Scholar', desc: 'Quick trivia check for extra points.', reward: 70 },
        { id: 'hourly_4', title: 'Trivia Addict', desc: 'You cannot stop playing, can you?', reward: 80 },
        { id: 'hourly_5', title: 'The Hourly Master', desc: 'Dedicated players get dedicated rewards.', reward: 100 },
    ],
    daily: [
        { id: 'daily_1', title: 'Daily Dedication', desc: 'Log in today to claim your daily bonus.', reward: 200 },
        { id: 'daily_2', title: 'Persistent Player', desc: 'Stay consistent and earn big.', reward: 250 },
        { id: 'daily_3', title: '24-Hour Scholar', desc: 'A day of knowledge.', reward: 300 },
        { id: 'daily_4', title: 'Sun and Moon', desc: 'Another day, another quiz.', reward: 400 },
        { id: 'daily_5', title: 'The Daily Grind', desc: 'Maximize your daily potential.', reward: 500 },
    ],
    weekly: [
        { id: 'weekly_1', title: 'Weekend Warrior', desc: 'Log in this week for a massive boost.', reward: 1000 },
        { id: 'weekly_2', title: 'Seven Days of Wisdom', desc: 'A week of learning pays off.', reward: 1200 },
        { id: 'weekly_3', title: 'The Weekly Marathon', desc: 'Keep the streak alive.', reward: 1500 },
        { id: 'weekly_4', title: 'Marathon Runner', desc: 'Endurance yields the best rewards.', reward: 2000 },
        { id: 'weekly_5', title: 'True Otaku', desc: 'The ultimate weekly tribute to anime.', reward: 3000 },
    ]
};

const COOLDOWNS = {
    hourly: 3600, // seconds
    daily: 86400,
    weekly: 604800
};

let currentTab = 'hourly';
let questState = {}; // { quest_id: last_claimed_timestamp (Date object) }
let serverTimeOffset = 0; // ms difference between client and server

async function fetchQuestState() {
    try {
        const response = await fetch('/php/get_quests.php');
        const data = await response.json();
        if (data.success) {
            const serverDate = new Date(data.server_time + " UTC"); // Assumes server returns UTC or adjust if local
            // We use simple difference if server returns local DB time, but let's assume it's just raw string
            const serverMs = new Date(data.server_time.replace(/-/g, '/')).getTime();
            serverTimeOffset = Date.now() - serverMs;

            questState = {};
            for (const [id, timeStr] of Object.entries(data.quests)) {
                questState[id] = new Date(timeStr.replace(/-/g, '/')).getTime();
            }
            renderQuests();
        } else if (data.error === 'Not authenticated') {
            document.getElementById('auth-modal-trigger')?.click();
            document.getElementById('quests-container').innerHTML = '<p class="text-center text-purple-300 text-xl mt-10">Please log in to view and claim quests.</p>';
        }
    } catch (e) {
        console.error('Failed to fetch quests', e);
    }
}

function switchTab(tab) {
    currentTab = tab;
    // Update button styles
    ['hourly', 'daily', 'weekly'].forEach(t => {
        const btn = document.getElementById(`tab-${t}`);
        if (t === tab) {
            btn.className = "glint bg-primary text-white font-ramen text-2xl px-8 py-3 rounded-2xl shadow-xl transition-all duration-300 scale-105 border-2 border-pink-400";
        } else {
            btn.className = "glint bg-primary/50 text-purple-300 hover:text-white font-ramen text-2xl px-8 py-3 rounded-2xl transition-all duration-300 hover:bg-primary/80 border-2 border-transparent";
        }
    });
    renderQuests();
}

function renderQuests() {
    const container = document.getElementById('quests-container');
    if (!container) return;
    
    container.innerHTML = '';
    const quests = QUEST_DATA[currentTab];
    
    quests.forEach(quest => {
        const cooldownSecs = COOLDOWNS[currentTab];
        let canClaim = true;
        let timeRemaining = 0;

        if (questState[quest.id]) {
            const lastClaimed = questState[quest.id];
            const now = Date.now() - serverTimeOffset; // Sync with server time
            const elapsedSecs = (now - lastClaimed) / 1000;
            
            if (elapsedSecs < cooldownSecs) {
                canClaim = false;
                timeRemaining = cooldownSecs - elapsedSecs;
            }
        }

        const div = document.createElement('div');
        div.className = "glint bg-primary/30 backdrop-blur-xl border border-purple-300/20 rounded-3xl p-6 flex items-center justify-between hover:border-pink-500/40 transition-all duration-300 group shadow-lg";
        
        div.innerHTML = `
            <div class="flex flex-col gap-1 w-2/3">
                <h3 class="text-2xl font-ramen text-purple-300">${quest.title}</h3>
                <p class="text-purple-300/70 font-poppins text-sm">${quest.desc}</p>
                <div class="flex items-baseline gap-1 mt-2">
                    <span class="text-yellow-400 text-xl font-bold">+${quest.reward}</span>
                    <span class="text-yellow-400/80 font-poppins text-lg uppercase">Yen</span>
                </div>
            </div>
            <div class="flex flex-col items-end w-1/3">
                ${canClaim 
                    ? `<button data-quest-id="${quest.id}" class="claim-btn glint bg-pink-500 px-6 py-3 font-ramen text-xl text-white rounded-xl shadow-lg hover:bg-pink-400 transition-all hover:scale-105">Claim</button>`
                    : `<button disabled class="bg-gray-600/50 text-gray-400 px-6 py-3 font-ramen text-xl rounded-xl cursor-not-allowed border border-gray-500/30 flex flex-col items-center">
                        <span class="text-sm">Cooldown</span>
                        <span class="timer-span font-poppins text-xs mt-1 text-pink-300" data-remaining="${timeRemaining}"></span>
                       </button>`
                }
            </div>
        `;
        container.appendChild(div);
    });

    // Attach event listeners to claim buttons
    document.querySelectorAll('.claim-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const questId = e.currentTarget.getAttribute('data-quest-id');
            claimQuest(questId);
        });
    });
}

async function claimQuest(questId) {
    try {
        const response = await fetch('/php/claim_quest.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quest_id: questId })
        });
        const data = await response.json();
        
        if (data.success) {
            // Update local state
            questState[questId] = new Date(data.last_claimed.replace(/-/g, '/')).getTime();
            
            // Show modal
            const title = document.getElementById("success-title");
            const desc = document.getElementById("success-desc");
            if (title && desc) {
                title.textContent = "Quest Claimed!";
                desc.textContent = `You received +${data.reward} Yen!`;
                document.getElementById("success-modal").showModal();
            }

            // Sync top yen display
            if (typeof setLocalYen === 'function') setLocalYen(data.yen);
            if (typeof updateYenDisplay === 'function') updateYenDisplay();

            // Re-render to show cooldown
            renderQuests();
        } else {
            const desc = document.getElementById("error-desc");
            if (desc) {
                desc.textContent = data.error;
                document.getElementById("error-modal").showModal();
            }
        }
    } catch (e) {
        console.error(e);
    }
}

// Timer tick
setInterval(() => {
    const timers = document.querySelectorAll('.timer-span');
    timers.forEach(timer => {
        let remaining = parseFloat(timer.getAttribute('data-remaining'));
        if (remaining > 0) {
            remaining -= 1;
            timer.setAttribute('data-remaining', remaining);
            
            const h = Math.floor(remaining / 3600);
            const m = Math.floor((remaining % 3600) / 60);
            const s = Math.floor(remaining % 60);
            
            if (h > 24) {
                const d = Math.floor(h / 24);
                timer.textContent = `${d}d ${h%24}h ${m}m`;
            } else if (h > 0) {
                timer.textContent = `${h}h ${m}m ${s}s`;
            } else {
                timer.textContent = `${m}m ${s}s`;
            }
            
            if (remaining <= 0) {
                renderQuests(); // Refresh to show claim button
            }
        }
    });
}, 1000);

document.addEventListener('DOMContentLoaded', () => {
    fetchQuestState();

    // Tab Event Listeners
    const tabHourly = document.getElementById('tab-hourly');
    if (tabHourly) tabHourly.addEventListener('click', () => switchTab('hourly'));

    const tabDaily = document.getElementById('tab-daily');
    if (tabDaily) tabDaily.addEventListener('click', () => switchTab('daily'));

    const tabWeekly = document.getElementById('tab-weekly');
    if (tabWeekly) tabWeekly.addEventListener('click', () => switchTab('weekly'));
});
