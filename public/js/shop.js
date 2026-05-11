let SHOP_ITEMS = [];
let IS_ADMIN = false;

document.addEventListener('DOMContentLoaded', () => {
    fetchShopItems();

    // Handle Admin Form Submission
    const adminForm = document.getElementById('admin-item-form');
    if (adminForm) {
        adminForm.addEventListener('submit', handleAdminSubmit);
    }
});

async function fetchShopItems() {
    try {
        const response = await fetch('/php/get_shop_items.php');
        const data = await response.json();
        if (data.success) {
            SHOP_ITEMS = data.items;
            IS_ADMIN = data.is_admin;
            renderShop();
            
            if (IS_ADMIN) {
                document.getElementById('admin-controls').classList.remove('hidden');
            }
        } else {
            console.error('Failed to load shop items', data.error);
        }
    } catch (e) {
        console.error('Network error fetching shop items', e);
    }
}

function renderShop() {
    const container = document.getElementById('shop-items-container');
    if (!container) return;

    container.innerHTML = '';

    if (SHOP_ITEMS.length === 0) {
        container.innerHTML = '<p class="col-span-full text-center text-purple-300/60 font-poppins text-xl mt-10">No items available in the shop.</p>';
        return;
    }

    SHOP_ITEMS.forEach(item => {
        const div = document.createElement('div');
        div.className = "glint bg-primary/30 backdrop-blur-xl border border-purple-300/20 rounded-3xl p-6 flex flex-col justify-between hover:border-pink-500/40 hover:scale-[1.02] transition-all duration-300 group select-none shadow-[0_4px_30px_rgba(0,0,0,0.1)] relative";

        let adminButtonsHtml = '';
        if (IS_ADMIN) {
            adminButtonsHtml = `
                <div class="absolute top-4 right-4 flex gap-2 z-10">
                    <button onclick="openEditItemModal(${item.id})" class="bg-blue-500 hover:bg-blue-400 text-white p-2 rounded-lg transition-colors shadow-md" title="Edit Item">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.89 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.89l12.683-12.683z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 7.125L22.25 9.875" /></svg>
                    </button>
                    <button onclick="deleteItem(${item.id})" class="bg-red-500 hover:bg-red-400 text-white p-2 rounded-lg transition-colors shadow-md" title="Delete Item">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                    </button>
                </div>
            `;
        }

        const rarityTag = item.rarity;
        let rarityColor = 'text-pink-400 bg-pink-500/10 border-pink-500/20'; // Default Legendary
        if (rarityTag === 'Common') rarityColor = 'text-gray-300 bg-gray-500/10 border-gray-500/20';
        else if (rarityTag === 'Rare') rarityColor = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        else if (rarityTag === 'Epic') rarityColor = 'text-purple-400 bg-purple-500/10 border-purple-500/20';
        else if (rarityTag === 'Legendary') rarityColor = 'text-pink-400 bg-pink-500/10 border-pink-500/20';
        else if (rarityTag === 'Exclusive') rarityColor = 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
        else if (rarityTag === 'God-Tier') rarityColor = 'text-red-400 bg-red-500/10 border-red-500/20';

        div.innerHTML = `
            ${adminButtonsHtml}
            <div class="w-full aspect-square bg-purple-950/40 rounded-2xl overflow-hidden mb-5 border border-purple-300/10 flex items-center justify-center">
                <img src="${item.image_url}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onerror="this.src='/images/anime_merch_figure.png'">
            </div>
            <div>
                <span class="text-xs font-bold font-poppins px-3 py-1 rounded-full uppercase tracking-wider border ${rarityColor}">${item.rarity}</span>
                <h3 class="text-2xl font-ramen text-purple-300 mt-3 mb-1">${item.name}</h3>
                <p class="text-purple-300/70 font-poppins text-sm mb-4">${item.description}</p>
            </div>
            <div class="flex justify-between items-center mt-auto border-t border-purple-300/15 pt-4">
                <div class="flex items-baseline gap-1">
                    <span class="text-white text-3xl font-ramen">${item.price.toLocaleString()}</span>
                    <span class="text-purple-300/50 font-poppins text-2xl font-bold uppercase tracking-widest">¥</span>
                </div>
                <button onclick="redeemItem(${item.id}, '${item.name.replace(/'/g, "\\'")}', ${item.price})" class="glint bg-primary px-5 py-2.5 font-ramen text-xl text-purple-300 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/80 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-primary/30">
                    Redeem
                </button>
            </div>
        `;

        container.appendChild(div);
    });
}

async function redeemItem(itemId, itemName, cost) {
    try {
        const response = await fetch('/php/redeem_item.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `item_id=${itemId}`
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById("success-title").textContent = "Redemption Successful!";
            document.getElementById("success-desc").textContent = "Successfully redeemed " + itemName + " for " + cost + " Yen!";
            document.getElementById("success-modal").showModal();

            // Update yen display globally
            if (typeof updateYenDisplay === 'function') {
                updateYenDisplay();
            }
        } else {
            alert(data.error || "Failed to redeem item");
        }
    } catch (err) {
        console.error(err);
        alert("Network error during redemption");
    }
}

// ----- Admin Functions -----

function openAddItemModal() {
    document.getElementById('admin-item-form').reset();
    document.getElementById('item-id').value = '';
    document.getElementById('admin-modal-title').textContent = 'Add New Item';
    document.getElementById('admin-item-modal').showModal();
}

function openEditItemModal(id) {
    const item = SHOP_ITEMS.find(i => i.id === id);
    if (!item) return;

    document.getElementById('item-id').value = item.id;
    document.getElementById('item-name').value = item.name;
    document.getElementById('item-desc').value = item.description;
    document.getElementById('item-price').value = item.price;
    document.getElementById('item-rarity').value = item.rarity;
    document.getElementById('item-image').value = item.image_url;
    
    document.getElementById('admin-modal-title').textContent = 'Edit Item';
    document.getElementById('admin-item-modal').showModal();
}

async function handleAdminSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('item-id').value;
    const name = document.getElementById('item-name').value;
    const desc = document.getElementById('item-desc').value;
    const price = document.getElementById('item-price').value;
    const rarity = document.getElementById('item-rarity').value;
    const image = document.getElementById('item-image').value;

    const isEdit = id !== '';
    const url = isEdit ? '/php/edit_item.php' : '/php/add_item.php';

    const formData = new URLSearchParams();
    if (isEdit) formData.append('id', id);
    formData.append('name', name);
    formData.append('description', desc);
    formData.append('price', price);
    formData.append('rarity', rarity);
    formData.append('image_url', image);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString()
        });

        const data = await response.json();
        if (data.success) {
            document.getElementById('admin-item-modal').close();
            fetchShopItems(); // Refresh items
        } else {
            alert('Error saving item: ' + data.error);
        }
    } catch (err) {
        console.error(err);
        alert('Network error saving item');
    }
}

async function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
        const response = await fetch('/php/delete_item.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `id=${id}`
        });

        const data = await response.json();
        if (data.success) {
            fetchShopItems(); // Refresh items
        } else {
            alert('Error deleting item: ' + data.error);
        }
    } catch (err) {
        console.error(err);
        alert('Network error deleting item');
    }
}

function showRegister() {
    const login = document.getElementById("login-form-container");
    const register = document.getElementById("register-form-container");
    if (login && register) {
        login.style.display = "none";
        register.style.display = "flex";
    }
}

function showLogin() {
    const login = document.getElementById("login-form-container");
    const register = document.getElementById("register-form-container");
    if (login && register) {
        register.style.display = "none";
        login.style.display = "flex";
    }
}
