document.addEventListener('DOMContentLoaded', () => {
    fetchStatistics();
});

async function fetchStatistics() {
    try {
        const response = await fetch('/php/get_statistics.php');
        const data = await response.json();
        
        const loadingDiv = document.getElementById('stats-loading');
        const containerDiv = document.getElementById('stats-container');
        
        if (data.success) {
            loadingDiv.classList.add('hidden');
            containerDiv.classList.remove('hidden');
            containerDiv.classList.add('flex');
            
            // Populate aggregates
            document.getElementById('stat-total-quizzes').textContent = data.aggregates.total_quizzes;
            document.getElementById('stat-total-score').textContent = data.aggregates.total_score;
            document.getElementById('stat-highest-score').textContent = data.aggregates.highest_score;
            document.getElementById('stat-total-yen').textContent = data.aggregates.total_yen_earned;
            
            // Populate recent quizzes
            const recentList = document.getElementById('recent-quizzes-list');
            recentList.innerHTML = '';
            
            if (data.recent_quizzes.length === 0) {
                recentList.innerHTML = '<p class="text-purple-300/70 italic font-poppins">No quizzes taken yet. Go take your first quiz!</p>';
            } else {
                data.recent_quizzes.forEach((quiz, index) => {
                    const date = new Date(quiz.updated_at.replace(/-/g, '/'));
                    const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                    
                    const item = document.createElement('div');
                    item.className = "glint bg-primary/30 backdrop-blur-xl border border-purple-300/20 rounded-xl p-4 flex items-center justify-between transition-all duration-300 hover:border-pink-500/40 shadow-sm";
                    
                    item.innerHTML = `
                        <div class="flex flex-col gap-1">
                            <h4 class="text-xl font-ramen text-purple-300">Quiz #${data.aggregates.total_quizzes - index}</h4>
                            <p class="text-purple-300/60 font-poppins text-xs">${formattedDate}</p>
                        </div>
                        <div class="flex items-center gap-6">
                            <div class="flex flex-col items-center">
                                <span class="text-xs text-purple-300/70 font-poppins">Score</span>
                                <span class="text-xl text-purple-200 font-bold font-ramen">${quiz.score}</span>
                            </div>
                            <div class="flex flex-col items-center">
                                <span class="text-xs text-purple-300/70 font-poppins">Yen Earned</span>
                                <span class="text-xl text-yellow-400 font-bold font-ramen">+${quiz.yen}</span>
                            </div>
                        </div>
                    `;
                    recentList.appendChild(item);
                });
            }
        } else if (data.error === 'Not authenticated') {
            loadingDiv.classList.add('hidden');
            const authTrigger = document.getElementById('auth-modal-trigger');
            if (authTrigger) authTrigger.click();
            document.getElementById('stats-loading').outerHTML = '<p class="text-center text-purple-300 text-xl mt-10 font-poppins">Please log in to view your statistics.</p>';
        } else {
            loadingDiv.textContent = 'Failed to load statistics: ' + data.error;
        }
    } catch (e) {
        console.error('Failed to fetch statistics', e);
        const loadingDiv = document.getElementById('stats-loading');
        if (loadingDiv) loadingDiv.textContent = 'A network error occurred while loading statistics.';
    }
}
