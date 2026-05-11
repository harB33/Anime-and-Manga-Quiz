document.addEventListener('DOMContentLoaded', () => {
    fetchInventory();
});

async function fetchInventory() {
    const container = document.getElementById('inventory-container');
    if (!container) return;

    try {
        const response = await fetch('/php/get_inventory.php');
        const data = await response.json();

        if (data.success) {
            renderInventory(data.inventory);
        } else if (data.error === 'Not authenticated') {
            document.getElementById('auth-modal').showModal();
            container.innerHTML = '<p class="col-span-full text-center text-purple-300/60 font-poppins text-xl mt-10">Please log in to view your inventory.</p>';
        } else {
            container.innerHTML = `<p class="col-span-full text-center text-red-400 font-poppins text-xl mt-10">Error: ${data.error}</p>`;
        }
    } catch (e) {
        console.error('Failed to fetch inventory', e);
        container.innerHTML = '<p class="col-span-full text-center text-red-400 font-poppins text-xl mt-10">Failed to connect to server.</p>';
    }
}

function renderInventory(items) {
    const container = document.getElementById('inventory-container');
    container.innerHTML = '';

    if (items.length === 0) {
        container.innerHTML = '<p class="col-span-full text-center text-purple-300/60 font-poppins text-xl mt-10">Your inventory is empty. Visit the shop to buy items!</p>';
        return;
    }

    items.forEach(item => {
        const div = document.createElement('div');
        div.className = "glint bg-primary/30 backdrop-blur-xl border border-purple-300/20 rounded-3xl p-6 flex flex-col justify-between hover:border-pink-500/40 transition-all duration-300 group shadow-lg";

        const rarityTag = item.rarity;
        let rarityColor = 'text-pink-400 bg-pink-500/10 border-pink-500/20';
        if (rarityTag === 'Common') rarityColor = 'text-gray-300 bg-gray-500/10 border-gray-500/20';
        else if (rarityTag === 'Rare') rarityColor = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        else if (rarityTag === 'Epic') rarityColor = 'text-purple-400 bg-purple-500/10 border-purple-500/20';
        else if (rarityTag === 'Legendary') rarityColor = 'text-pink-400 bg-pink-500/10 border-pink-500/20';
        else if (rarityTag === 'Exclusive') rarityColor = 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
        else if (rarityTag === 'God-Tier') rarityColor = 'text-red-400 bg-red-500/10 border-red-500/20';

        div.innerHTML = `
            <div class="w-full aspect-square bg-purple-950/40 rounded-2xl overflow-hidden mb-5 border border-purple-300/10 flex items-center justify-center">
                <img src="${item.image_url}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
            </div>
            <div>
                <span class="text-xs font-bold font-poppins px-3 py-1 rounded-full uppercase tracking-wider border ${rarityColor}">${item.rarity}</span>
                <h3 class="text-2xl font-ramen text-purple-300 mt-3 mb-1">${item.name}</h3>
                <p class="text-purple-300/70 font-poppins text-sm mb-4">${item.description}</p>
                <p class="text-purple-300/40 font-poppins text-[10px] uppercase tracking-widest">Obtained: ${new Date(item.obtained_at).toLocaleDateString()}</p>
            </div>
            <div class="mt-4 pt-4 border-t border-purple-300/10">
                <button class="w-full glint bg-primary/50 hover:bg-pink-500/30 text-purple-200 py-2 rounded-xl font-ramen text-lg transition-all duration-300 border border-purple-300/10">
                    Use / Equip
                </button>
            </div>
        `;

        container.appendChild(div);
    });
}
