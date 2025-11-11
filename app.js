const form = document.getElementById("product-form");
const inventoryBody = document.getElementById("inventory-body");
const emptyState = document.getElementById("empty-state");
const totalItemsEl = document.getElementById("total-items");
const inventoryValueEl = document.getElementById("inventory-value");
const searchInput = document.getElementById("search");
const sortSelect = document.getElementById("sort");
const rowTemplate = document.getElementById("row-template");
const categorySuggestions = document.getElementById("category-suggestions");
const confirmDialog = document.getElementById("confirm-dialog");
const toggleThemeBtn = document.getElementById("toggle-theme");

const STORAGE_KEY = "inventario-productos";
const THEME_KEY = "inventario-tema";

let inventory = loadInventory();
let editingId = null;
let categories = new Set(inventory.map((item) => item.category).filter(Boolean));

renderInventory();
populateCategorySuggestions();
applyStoredTheme();

form.addEventListener("submit", handleFormSubmit);
inventoryBody.addEventListener("click", handleTableClick);
searchInput.addEventListener("input", renderInventory);
sortSelect.addEventListener("change", renderInventory);
toggleThemeBtn.addEventListener("click", toggleTheme);

function handleFormSubmit(event) {
  event.preventDefault();

  const data = new FormData(form);
  const name = data.get("name").trim();
  const category = data.get("category").trim();
  const quantity = Number(data.get("quantity"));
  const price = Number(data.get("price"));

  if (!name || Number.isNaN(quantity) || Number.isNaN(price)) {
    return;
  }

  const product = {
    id: editingId ?? crypto.randomUUID(),
    name,
    category,
    quantity,
    price,
    createdAt: editingId ? getProduct(editingId).createdAt : Date.now(),
    updatedAt: Date.now(),
  };

  if (editingId) {
    inventory = inventory.map((item) => (item.id === editingId ? product : item));
    form.querySelector("button[type='submit']").textContent = "Añadir producto";
    editingId = null;
  } else {
    inventory.push(product);
  }

  if (category) {
    categories.add(category);
    populateCategorySuggestions();
  }

  form.reset();
  form.name.focus();

  persistInventory();
  renderInventory();
}

function handleTableClick(event) {
  const row = event.target.closest("tr[data-id]");
  if (!row) return;

  const id = row.dataset.id;

  if (event.target.closest(".editar")) {
    startEditing(id, row);
  }

  if (event.target.closest(".eliminar")) {
    confirmDeletion(id, row);
  }
}

function startEditing(id, row) {
  const product = getProduct(id);
  if (!product) return;

  editingId = id;
  form.name.value = product.name;
  form.category.value = product.category;
  form.quantity.value = product.quantity;
  form.price.value = product.price;
  form.querySelector("button[type='submit']").textContent = "Actualizar producto";
  form.name.focus();

  highlightRow(row);
}

function confirmDeletion(id, row) {
  highlightRow(row);
  confirmDialog.showModal();

  confirmDialog.onclose = () => {
    row.classList.remove("fila-editando");

    if (confirmDialog.returnValue === "confirm") {
      deleteProduct(id);
    }
  };
}

function deleteProduct(id) {
  inventory = inventory.filter((item) => item.id !== id);
  persistInventory();
  renderInventory();
}

function highlightRow(row) {
  inventoryBody.querySelectorAll("tr").forEach((tr) => tr.classList.remove("fila-editando"));
  row.classList.add("fila-editando");
}

function renderInventory() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const sorted = [...inventory].sort(sortComparator(sortSelect.value));

  const filtered = sorted.filter((item) => {
    if (!searchTerm) return true;
    const combined = `${item.name} ${item.category}`.toLowerCase();
    return combined.includes(searchTerm);
  });

  inventoryBody.innerHTML = "";

  filtered.forEach((product) => {
    const row = rowTemplate.content.firstElementChild.cloneNode(true);
    row.dataset.id = product.id;
    row.querySelector(".col-nombre").textContent = product.name;
    row.querySelector(".col-categoria").textContent = product.category || "—";
    row.querySelector(".col-cantidad").textContent = product.quantity;
    row.querySelector(".col-precio").textContent = formatCurrency(product.price);
    row.querySelector(".col-total").textContent = formatCurrency(product.price * product.quantity);

    applyStockBadge(row, product.quantity);

    inventoryBody.appendChild(row);
  });

  emptyState.style.display = filtered.length === 0 ? "block" : "none";
  updateSummary(filtered);
}

function applyStockBadge(row, quantity) {
  const cell = row.querySelector(".col-cantidad");
  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = quantity;

  if (quantity === 0) {
    badge.classList.add("badge-stock-bajo");
    badge.textContent = "Sin stock";
  } else if (quantity < 5) {
    badge.classList.add("badge-stock-bajo");
  } else if (quantity > 50) {
    badge.classList.add("badge-stock-alto");
  }

  cell.textContent = "";
  cell.appendChild(badge);
}

function updateSummary(items) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  totalItemsEl.textContent = totalItems.toLocaleString("es-MX");
  inventoryValueEl.textContent = formatCurrency(totalValue);
}

function sortComparator(criteria) {
  return (a, b) => {
    switch (criteria) {
      case "name":
        return a.name.localeCompare(b.name, "es", { sensitivity: "base" });
      case "category":
        return a.category.localeCompare(b.category, "es", { sensitivity: "base" });
      case "quantity":
        return b.quantity - a.quantity;
      case "price":
        return b.price - a.price;
      case "total":
        return b.price * b.quantity - a.price * a.quantity;
      default:
        return 0;
    }
  };
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(value);
}

function persistInventory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
}

function loadInventory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error cargando inventario", error);
    return [];
  }
}

function getProduct(id) {
  return inventory.find((item) => item.id === id) ?? null;
}

function populateCategorySuggestions() {
  categorySuggestions.innerHTML = "";
  Array.from(categories)
    .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }))
    .forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      categorySuggestions.appendChild(option);
    });
}

function applyStoredTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) {
    document.documentElement.setAttribute("data-tema", savedTheme);
    toggleThemeBtn.textContent = savedTheme === "oscuro" ? "☀️" : "🌙";
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-tema");
  const newTheme = currentTheme === "oscuro" ? "claro" : "oscuro";
  document.documentElement.setAttribute("data-tema", newTheme);
  toggleThemeBtn.textContent = newTheme === "oscuro" ? "☀️" : "🌙";
  localStorage.setItem(THEME_KEY, newTheme);
}

window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY) {
    inventory = loadInventory();
    categories = new Set(inventory.map((item) => item.category).filter(Boolean));
    populateCategorySuggestions();
    renderInventory();
  }

  if (event.key === THEME_KEY) {
    applyStoredTheme();
  }
});
