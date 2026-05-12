let currentEquipment = {};

document.addEventListener("DOMContentLoaded", () => {
  fetchInventory();
});

async function fetchInventory() {
  const container = document.getElementById("inventory-container");
  const messageContainer = document.getElementById("inventory-message");
  if (!container) return;

  try {
    const response = await fetch("/php/get_inventory.php");
    const data = await response.json();

    if (data.success) {
      currentEquipment = data.equipment || {};
      renderStatus(currentEquipment);
      renderInventory(data.inventory, currentEquipment);
      if (messageContainer) {
        messageContainer.classList.add("hidden");
      }
    } else if (data.error === "Not authenticated") {
      document.getElementById("auth-modal").showModal();
      container.innerHTML =
        '<p class="col-span-full text-center text-purple-300/60 font-poppins text-xl mt-10">Please log in to view your inventory.</p>';
    } else {
      container.innerHTML = `<p class="col-span-full text-center text-red-400 font-poppins text-xl mt-10">Error: ${data.error}</p>`;
    }
  } catch (e) {
    console.error("Failed to fetch inventory", e);
    container.innerHTML =
      '<p class="col-span-full text-center text-red-400 font-poppins text-xl mt-10">Failed to connect to server.</p>';
  }
}

function renderStatus(equipment) {
  const statusContainer = document.getElementById("inventory-status");
  if (!statusContainer) return;

  const activePowerup = equipment.activePowerup
    ? `Power-up: ${equipment.activePowerup.name} (expires ${new Date(equipment.activePowerup.expiresAt).toLocaleString()})`
    : "No active power-up";
  const title = equipment.equippedTitle
    ? `Title: ${equipment.equippedTitle}`
    : "No title equipped";
  const border = equipment.equippedBorder
    ? `Border: ${equipment.equippedBorder}`
    : "No border equipped";
  const hints = `Hints available: ${equipment.hintBalance ?? 0}`;

  statusContainer.innerHTML = `
        <div class="glint bg-primary/30 backdrop-blur-xl border border-purple-300/20 rounded-3xl p-6 text-purple-300">
            <h2 class="text-xl font-ramen mb-3">Current Equipment</h2>
            <p class="text-sm font-poppins mb-2">${title}</p>
            <p class="text-sm font-poppins mb-2">${border}</p>
            <p class="text-sm font-poppins mb-2">${hints}</p>
            <p class="text-sm font-poppins">${activePowerup}</p>
        </div>
    `;
}

function getButtonText(item, equipment) {
  if (item.type === "title") {
    return equipment.equippedTitle === item.name ? "Equipped" : "Equip Title";
  }
  if (item.type === "border") {
    return equipment.equippedBorder === item.name ? "Equipped" : "Equip Border";
  }
  if (item.type === "powerup") {
    return "Use Power-Up";
  }
  if (item.type === "hint") {
    return "Use Hint Pack";
  }
  return "Use / Equip";
}

function renderInventory(items, equipment) {
  const container = document.getElementById("inventory-container");
  container.innerHTML = "";

  if (items.length === 0) {
    container.innerHTML =
      '<p class="col-span-full text-center text-purple-300/60 font-poppins text-xl mt-10">Your inventory is empty. Visit the shop to buy items!</p>';
    return;
  }

  items.forEach((item) => {
    const div = document.createElement("div");
    div.className =
      "glint bg-primary/30 backdrop-blur-xl border border-purple-300/20 rounded-3xl p-6 flex flex-col justify-between hover:border-pink-500/40 transition-all duration-300 group shadow-lg";

    const rarityTag = item.rarity;
    let rarityColor = "text-pink-400 bg-pink-500/10 border-pink-500/20";
    if (rarityTag === "Common")
      rarityColor = "text-gray-300 bg-gray-500/10 border-gray-500/20";
    else if (rarityTag === "Rare")
      rarityColor = "text-blue-400 bg-blue-500/10 border-blue-500/20";
    else if (rarityTag === "Epic")
      rarityColor = "text-purple-400 bg-purple-500/10 border-purple-500/20";
    else if (rarityTag === "Legendary")
      rarityColor = "text-pink-400 bg-pink-500/10 border-pink-500/20";
    else if (rarityTag === "Exclusive")
      rarityColor = "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
    else if (rarityTag === "God-Tier")
      rarityColor = "text-red-400 bg-red-500/10 border-red-500/20";

    const buttonText = getButtonText(item, equipment);
    const isEquipped =
      (item.type === "title" && equipment.equippedTitle === item.name) ||
      (item.type === "border" && equipment.equippedBorder === item.name);

    div.innerHTML = `
            <div class="w-full aspect-square bg-purple-950/40 rounded-2xl overflow-hidden mb-5 border border-purple-300/10 flex items-center justify-center">
                <img src="${item.image_url}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
            </div>
            <div>
                <span class="text-xs font-bold font-poppins px-3 py-1 rounded-full uppercase tracking-wider border ${rarityColor}">${item.rarity}</span>
                <h3 class="text-2xl font-ramen text-purple-300 mt-3 mb-1">${item.name}</h3>
                <p class="text-purple-300/70 font-poppins text-sm mb-4">${item.description}</p>
                <p class="text-purple-300/50 font-poppins text-xs mb-3 uppercase tracking-widest">Type: ${item.type === "title" ? "Title" : item.type === "border" ? "Border" : item.type === "powerup" ? "Power-Up" : item.type === "hint" ? "Hint Pack" : "Usable Item"}</p>
                <p class="text-purple-300/40 font-poppins text-[10px] uppercase tracking-widest">Obtained: ${new Date(item.obtained_at).toLocaleDateString()}</p>
            </div>
            <div class="mt-4 pt-4 border-t border-purple-300/10">
                <button class="w-full glint bg-primary/50 hover:bg-pink-500/30 text-purple-200 py-2 rounded-xl font-ramen text-lg transition-all duration-300 border border-purple-300/10 ${isEquipped ? "opacity-50 cursor-not-allowed hover:bg-primary/50" : ""}" ${isEquipped ? "disabled" : ""}>
                    ${buttonText}
                </button>
            </div>
        `;

    const button = div.querySelector("button");
    if (button && !isEquipped) {
      button.addEventListener("click", () => useItem(item));
    }

    container.appendChild(div);
  });
}

function showMessage(text, success = true) {
  const messageContainer = document.getElementById("inventory-message");
  if (!messageContainer) return;

  messageContainer.textContent = text;
  if (success) {
    messageContainer.className =
      "glint bg-emerald-500/20 text-emerald-200 border border-emerald-300 rounded-3xl p-4 text-center font-poppins";
  } else {
    messageContainer.className =
      "glint bg-red-500/20 text-red-200 border border-red-300 rounded-3xl p-4 text-center font-poppins";
  }
  messageContainer.classList.remove("hidden");
}

async function useItem(item) {
  try {
    const response = await fetch("/php/use_item.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `item_id=${encodeURIComponent(item.id)}`,
    });
    const data = await response.json();

    if (data.success) {
      showMessage(data.message || "Item used successfully!", true);
      currentEquipment = data;
      renderStatus(currentEquipment);
      fetchInventory();
    } else {
      showMessage(data.error || "Action failed", false);
    }
  } catch (e) {
    console.error("Failed to use the item", e);
    showMessage("Unable to use item. Please try again.", false);
  }
}
