// --- Local storage helpers ---

const STORAGE_KEYS = {
  MENU_ITEMS: "rb_menuItems",
  CURRENT_CART: "rb_currentCart",
  SALES_HISTORY: "rb_salesHistory",
};

function loadState(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load state", key, e);
    return defaultValue;
  }
}

function saveState(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Failed to save state", key, e);
  }
}

function formatCurrency(amount) {
  return `₹${amount.toFixed(2)}`;
}

function getCurrentMonthKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

// --- Application state ---

let menuItems = [];
let currentCart = [];
let salesHistory = [];

function seedDefaultMenu() {
  const existing = loadState(STORAGE_KEYS.MENU_ITEMS, null);
  if (existing && Array.isArray(existing) && existing.length > 0) {
    menuItems = existing;
    return;
  }

  const defaults = [
    {
      id: "idly",
      name: "Idly",
      price: 20,
      imageUrl:
"https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Idli_Sambar.JPG/640px-Idli_Sambar.JPG",        
      isActive: true,
    },
    {
      id: "puttu",
      name: "Puttu",
      price: 30,
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Puttu%2C_steamed_rice_cake_%28Kerala%29.JPG/640px-Puttu%2C_steamed_rice_cake_%28Kerala%29.JPG",
      isActive: true,
    },
    {
      id: "poori",
      name: "Poori",
      price: 35,
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Chole_Bhature_from_New_Delhi.jpg/640px-Chole_Bhature_from_New_Delhi.jpg",
      isActive: true,
    },
    {
      id: "coffee",
      name: "Coffee",
      price: 15,
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/A_small_cup_of_coffee.JPG/640px-A_small_cup_of_coffee.JPG",
      isActive: true,
    },
    {
      id: "dosa",
      name: "Dosa",
      price: 40,
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Dosa_and_ghee.jpg/640px-Dosa_and_ghee.jpg",
      isActive: true,
    },
    {
      id: "vada",
      name: "Vada",
      price: 10,
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Medu_Vada_-_Homemade.jpg/640px-Medu_Vada_-_Homemade.jpg",
      isActive: true,
    },
    {
      id: "pazhampori",
      name: "Pazhampori",
      price: 25,
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Pazham_pori.JPG/640px-Pazham_pori.JPG",
      isActive: true,
    },
  ];

  menuItems = defaults;
  saveState(STORAGE_KEYS.MENU_ITEMS, menuItems);
}

function loadInitialState() {
  seedDefaultMenu();
  currentCart = loadState(STORAGE_KEYS.CURRENT_CART, []);
  salesHistory = loadState(STORAGE_KEYS.SALES_HISTORY, []);
}

// --- Menu rendering & admin ---

function renderMenuGrid() {
  const grid = document.getElementById("menu-grid");
  if (!grid) return;
  grid.innerHTML = "";

  menuItems
    .filter((item) => item.isActive)
    .forEach((item) => {
      const card = document.createElement("div");
      card.className = "menu-card";
      card.dataset.itemId = item.id;

      const img = document.createElement("img");
      img.className = "menu-card-image";
      img.src =
        item.imageUrl ||
        "https://via.placeholder.com/300x200?text=" +
          encodeURIComponent(item.name);
      img.alt = item.name;

      const body = document.createElement("div");
      body.className = "menu-card-body";

      const nameEl = document.createElement("div");
      nameEl.className = "menu-card-name";
      nameEl.textContent = item.name;

      const priceEl = document.createElement("div");
      priceEl.className = "menu-card-price";
      priceEl.textContent = formatCurrency(item.price);

      const footer = document.createElement("div");
      footer.className = "menu-card-footer";

      const addBtn = document.createElement("button");
      addBtn.className = "btn btn-primary";
      addBtn.textContent = "Add";
      addBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        addItemToCart(item.id);
      });

      footer.appendChild(addBtn);
      body.appendChild(nameEl);
      body.appendChild(priceEl);
      body.appendChild(footer);

      card.appendChild(img);
      card.appendChild(body);

      card.addEventListener("click", () => addItemToCart(item.id));

      grid.appendChild(card);
    });
}

function renderMenuAdminTable() {
  const body = document.getElementById("menu-admin-body");
  if (!body) return;
  body.innerHTML = "";

  menuItems.forEach((item) => {
    const tr = document.createElement("tr");

    const nameTd = document.createElement("td");
    nameTd.textContent = item.name;

    const priceTd = document.createElement("td");
    priceTd.textContent = formatCurrency(item.price);

    const activeTd = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = "badge " + (item.isActive ? "badge-success" : "badge-muted");
    badge.textContent = item.isActive ? "Active" : "Hidden";
    activeTd.appendChild(badge);

    const actionsTd = document.createElement("td");

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "btn-ghost";
    toggleBtn.textContent = item.isActive ? "Hide" : "Show";
    toggleBtn.addEventListener("click", () => {
      toggleMenuItemActive(item.id);
    });

    const editBtn = document.createElement("button");
    editBtn.className = "btn-ghost";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => {
      populateMenuFormForEdit(item);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-ghost";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => {
      if (confirm(`Delete ${item.name}?`)) {
        deleteMenuItem(item.id);
      }
    });

    actionsTd.appendChild(toggleBtn);
    actionsTd.appendChild(editBtn);
    actionsTd.appendChild(deleteBtn);

    tr.appendChild(nameTd);
    tr.appendChild(priceTd);
    tr.appendChild(activeTd);
    tr.appendChild(actionsTd);

    body.appendChild(tr);
  });
}

function handleAddMenuItem(formData) {
  const id =
    formData.id ||
    formData.name.toLowerCase().replace(/\s+/g, "-") +
      "-" +
      String(Date.now()).slice(-4);

  const existingIndex = menuItems.findIndex((m) => m.id === id);
  const base = {
    id,
    name: formData.name.trim(),
    price: Number(formData.price) || 0,
    imageUrl: formData.imageUrl || "",
    isActive: formData.isActive ?? true,
  };

  if (existingIndex >= 0) {
    menuItems[existingIndex] = { ...menuItems[existingIndex], ...base };
  } else {
    menuItems.push(base);
  }

  saveState(STORAGE_KEYS.MENU_ITEMS, menuItems);
  renderMenuGrid();
  renderMenuAdminTable();
}

function deleteMenuItem(id) {
  menuItems = menuItems.filter((m) => m.id !== id);
  currentCart = currentCart.filter((line) => line.itemId !== id);
  saveState(STORAGE_KEYS.MENU_ITEMS, menuItems);
  saveState(STORAGE_KEYS.CURRENT_CART, currentCart);
  renderMenuGrid();
  renderCart();
  renderMenuAdminTable();
}

function toggleMenuItemActive(id) {
  const item = menuItems.find((m) => m.id === id);
  if (!item) return;
  item.isActive = !item.isActive;
  saveState(STORAGE_KEYS.MENU_ITEMS, menuItems);
  renderMenuGrid();
  renderMenuAdminTable();
}

function populateMenuFormForEdit(item) {
  document.getElementById("menu-item-id").value = item.id;
  document.getElementById("menu-item-name").value = item.name;
  document.getElementById("menu-item-price").value = item.price;
  document.getElementById("menu-item-image").value = item.imageUrl || "";
  const title = document.getElementById("menu-form-title");
  if (title) title.textContent = "Edit Menu Item";
}

function resetMenuForm() {
  document.getElementById("menu-item-id").value = "";
  document.getElementById("menu-item-name").value = "";
  document.getElementById("menu-item-price").value = "";
  document.getElementById("menu-item-image").value = "";
  const title = document.getElementById("menu-form-title");
  if (title) title.textContent = "Add Menu Item";
}

// --- Cart & billing ---

function calculateCartTotal() {
  return currentCart.reduce((sum, line) => sum + line.subtotal, 0);
}

function renderCart() {
  const body = document.getElementById("cart-body");
  const totalEl = document.getElementById("cart-total");
  if (!body || !totalEl) return;

  body.innerHTML = "";

  currentCart.forEach((line) => {
    const tr = document.createElement("tr");

    const nameTd = document.createElement("td");
    nameTd.textContent = line.name;

    const qtyTd = document.createElement("td");
    const qtyControls = document.createElement("div");
    qtyControls.className = "cart-qty-controls";

    const minusBtn = document.createElement("button");
    minusBtn.className = "btn-ghost";
    minusBtn.textContent = "-";
    minusBtn.addEventListener("click", () => {
      updateCartItemQty(line.itemId, line.qty - 1);
    });

    const qtySpan = document.createElement("span");
    qtySpan.className = "qty-display";
    qtySpan.textContent = String(line.qty);

    const plusBtn = document.createElement("button");
    plusBtn.className = "btn-ghost";
    plusBtn.textContent = "+";
    plusBtn.addEventListener("click", () => {
      updateCartItemQty(line.itemId, line.qty + 1);
    });

    qtyControls.appendChild(minusBtn);
    qtyControls.appendChild(qtySpan);
    qtyControls.appendChild(plusBtn);
    qtyTd.appendChild(qtyControls);

    const priceTd = document.createElement("td");
    priceTd.textContent = formatCurrency(line.price);

    const subtotalTd = document.createElement("td");
    subtotalTd.textContent = formatCurrency(line.subtotal);

    const removeTd = document.createElement("td");
    const removeBtn = document.createElement("button");
    removeBtn.className = "btn-ghost";
    removeBtn.textContent = "✕";
    removeBtn.addEventListener("click", () => {
      removeCartItem(line.itemId);
    });
    removeTd.appendChild(removeBtn);

    tr.appendChild(nameTd);
    tr.appendChild(qtyTd);
    tr.appendChild(priceTd);
    tr.appendChild(subtotalTd);
    tr.appendChild(removeTd);

    body.appendChild(tr);
  });

  totalEl.textContent = formatCurrency(calculateCartTotal());
}

function addItemToCart(itemId) {
  const item = menuItems.find((m) => m.id === itemId);
  if (!item) return;

  const existing = currentCart.find((line) => line.itemId === itemId);
  if (existing) {
    existing.qty += 1;
    existing.subtotal = existing.qty * existing.price;
  } else {
    currentCart.push({
      itemId: item.id,
      name: item.name,
      price: item.price,
      qty: 1,
      subtotal: item.price,
    });
  }

  saveState(STORAGE_KEYS.CURRENT_CART, currentCart);
  renderCart();
}

function updateCartItemQty(itemId, qty) {
  if (qty <= 0) {
    removeCartItem(itemId);
    return;
  }
  const line = currentCart.find((l) => l.itemId === itemId);
  if (!line) return;
  line.qty = qty;
  line.subtotal = line.qty * line.price;
  saveState(STORAGE_KEYS.CURRENT_CART, currentCart);
  renderCart();
}

function removeCartItem(itemId) {
  currentCart = currentCart.filter((l) => l.itemId !== itemId);
  saveState(STORAGE_KEYS.CURRENT_CART, currentCart);
  renderCart();
}

function clearCart() {
  currentCart = [];
  saveState(STORAGE_KEYS.CURRENT_CART, currentCart);
  renderCart();
}

// --- Pay, print, and sales history ---

function openQrModal() {
  const modal = document.getElementById("qr-modal");
  const amountEl = document.getElementById("qr-amount");
  if (!modal || !amountEl) return;
  const total = calculateCartTotal();
  amountEl.textContent = formatCurrency(total);
  modal.classList.add("visible");
}

function closeQrModal() {
  const modal = document.getElementById("qr-modal");
  if (!modal) return;
  modal.classList.remove("visible");
}

function handlePayNow() {
  if (currentCart.length === 0) {
    alert("No items in the bill.");
    return;
  }
  openQrModal();
}

function completeBill() {
  if (currentCart.length === 0) {
    closeQrModal();
    return;
  }
  const total = calculateCartTotal();
  const now = new Date();
  const bill = {
    id: "BILL-" + now.getTime(),
    items: currentCart.map((line) => ({ ...line })),
    total,
    createdAt: now.toISOString(),
  };
  salesHistory.push(bill);
  saveState(STORAGE_KEYS.SALES_HISTORY, salesHistory);
  clearCart();
  closeQrModal();
  renderMonthlyReport(getCurrentMonthKey(now));
}

function handlePrintBill() {
  if (currentCart.length === 0) {
    alert("No items in the bill.");
    return;
  }
  window.print();
}

// --- Monthly report ---

function renderMonthlyReport(monthKey) {
  const monthInput = document.getElementById("report-month");
  if (monthInput && monthKey) {
    monthInput.value = monthKey;
  }

  const body = document.getElementById("report-body");
  const totalSalesEl = document.getElementById("summary-total-sales");
  const billCountEl = document.getElementById("summary-bill-count");
  const avgBillEl = document.getElementById("summary-average-bill");
  if (!body || !totalSalesEl || !billCountEl || !avgBillEl) return;

  body.innerHTML = "";
  const filtered = salesHistory.filter((bill) => {
    if (!monthKey) return true;
    const billMonth = bill.createdAt.slice(0, 7);
    return billMonth === monthKey;
  });

  let totalSales = 0;
  filtered.forEach((bill) => {
    totalSales += bill.total;
    const tr = document.createElement("tr");

    const dateTd = document.createElement("td");
    const date = new Date(bill.createdAt);
    dateTd.textContent = date.toLocaleString();

    const totalTd = document.createElement("td");
    totalTd.textContent = formatCurrency(bill.total);

    const countTd = document.createElement("td");
    const itemsCount = bill.items.reduce((sum, line) => sum + line.qty, 0);
    countTd.textContent = String(itemsCount);

    tr.appendChild(dateTd);
    tr.appendChild(totalTd);
    tr.appendChild(countTd);
    body.appendChild(tr);
  });

  const billCount = filtered.length;
  const avgBill = billCount ? totalSales / billCount : 0;

  totalSalesEl.textContent = formatCurrency(totalSales);
  billCountEl.textContent = String(billCount);
  avgBillEl.textContent = formatCurrency(avgBill);
}

// --- Navigation ---

function setupNavigation() {
  const tabs = document.querySelectorAll(".nav-tab");
  const sections = document.querySelectorAll(".app-section");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetId = tab.dataset.target;
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      sections.forEach((section) => {
        if (section.id === targetId) {
          section.classList.add("visible");
        } else {
          section.classList.remove("visible");
        }
      });
    });
  });
}

// --- Wire up events ---

function setupEventListeners() {
  const menuForm = document.getElementById("menu-form");
  const resetBtn = document.getElementById("menu-form-reset");
  const payNowBtn = document.getElementById("pay-now-btn");
  const printBillBtn = document.getElementById("print-bill-btn");
  const clearCartBtn = document.getElementById("clear-cart-btn");
  const monthInput = document.getElementById("report-month");
  const qrCloseBtn = document.getElementById("qr-close-btn");
  const qrCompleteBtn = document.getElementById("qr-complete-bill-btn");
  const qrModal = document.getElementById("qr-modal");

  if (menuForm) {
    menuForm.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const formData = {
        id: document.getElementById("menu-item-id").value || null,
        name: document.getElementById("menu-item-name").value,
        price: parseFloat(document.getElementById("menu-item-price").value),
        imageUrl: document.getElementById("menu-item-image").value,
      };
      if (!formData.name || isNaN(formData.price)) {
        alert("Please provide name and valid price.");
        return;
      }
      handleAddMenuItem(formData);
      resetMenuForm();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => resetMenuForm());
  }

  if (payNowBtn) {
    payNowBtn.addEventListener("click", handlePayNow);
  }

  if (printBillBtn) {
    printBillBtn.addEventListener("click", handlePrintBill);
  }

  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", () => {
      if (currentCart.length === 0) return;
      if (confirm("Clear current cart?")) {
        clearCart();
      }
    });
  }

  if (monthInput) {
    monthInput.addEventListener("change", () => {
      renderMonthlyReport(monthInput.value || null);
    });
  }

  if (qrCloseBtn) {
    qrCloseBtn.addEventListener("click", closeQrModal);
  }

  if (qrCompleteBtn) {
    qrCompleteBtn.addEventListener("click", completeBill);
  }

  if (qrModal) {
    qrModal.addEventListener("click", (ev) => {
      if (ev.target === qrModal) {
        closeQrModal();
      }
    });
  }
}

// --- Init ---

window.addEventListener("DOMContentLoaded", () => {
  loadInitialState();
  setupNavigation();
  setupEventListeners();
  renderMenuGrid();
  renderCart();
  const currentMonth = getCurrentMonthKey();
  renderMonthlyReport(currentMonth);
});

