// ===== Sistema de Inventario - JavaScript =====

// Clase para manejar el inventario
class InventoryManager {
    constructor() {
        this.products = this.loadProducts();
        this.currentEditId = null;
        this.deleteProductId = null;
        this.currentView = 'grid';
        this.init();
    }

    // Inicializar el sistema
    init() {
        this.attachEventListeners();
        this.renderProducts();
        this.updateStats();
    }

    // Cargar productos desde localStorage
    loadProducts() {
        const stored = localStorage.getItem('inventory');
        if (stored) {
            return JSON.parse(stored);
        }
        // Productos de ejemplo
        return [
            {
                id: Date.now() + 1,
                name: 'Laptop HP Pavilion',
                category: 'Electrónica',
                quantity: 15,
                price: 899.99,
                description: 'Laptop de alto rendimiento con procesador Intel Core i7'
            },
            {
                id: Date.now() + 2,
                name: 'Camiseta Nike Pro',
                category: 'Ropa',
                quantity: 45,
                price: 29.99,
                description: 'Camiseta deportiva de alta calidad'
            },
            {
                id: Date.now() + 3,
                name: 'Café Premium 500g',
                category: 'Alimentos',
                quantity: 3,
                price: 15.99,
                description: 'Café gourmet tostado artesanalmente'
            }
        ];
    }

    // Guardar productos en localStorage
    saveProducts() {
        localStorage.setItem('inventory', JSON.stringify(this.products));
    }

    // Adjuntar event listeners
    attachEventListeners() {
        // Formulario
        document.getElementById('productForm').addEventListener('submit', (e) => this.handleFormSubmit(e));
        document.getElementById('cancelBtn').addEventListener('click', () => this.cancelEdit());

        // Filtros
        document.getElementById('searchInput').addEventListener('input', () => this.filterProducts());
        document.getElementById('filterCategory').addEventListener('change', () => this.filterProducts());
        document.getElementById('clearFilters').addEventListener('click', () => this.clearFilters());

        // Vistas
        document.getElementById('gridView').addEventListener('click', () => this.changeView('grid'));
        document.getElementById('listView').addEventListener('click', () => this.changeView('list'));

        // Exportar
        document.getElementById('exportBtn').addEventListener('click', () => this.exportToCSV());

        // Modal
        document.getElementById('confirmDelete').addEventListener('click', () => this.confirmDelete());
        document.getElementById('cancelDelete').addEventListener('click', () => this.closeModal());

        // Cerrar modal al hacer clic fuera
        document.getElementById('confirmModal').addEventListener('click', (e) => {
            if (e.target.id === 'confirmModal') {
                this.closeModal();
            }
        });
    }

    // Manejar envío del formulario
    handleFormSubmit(e) {
        e.preventDefault();

        const product = {
            id: this.currentEditId || Date.now(),
            name: document.getElementById('productName').value.trim(),
            category: document.getElementById('productCategory').value,
            quantity: parseInt(document.getElementById('productQuantity').value),
            price: parseFloat(document.getElementById('productPrice').value),
            description: document.getElementById('productDescription').value.trim()
        };

        if (this.currentEditId) {
            this.updateProduct(product);
        } else {
            this.addProduct(product);
        }
    }

    // Agregar producto
    addProduct(product) {
        this.products.push(product);
        this.saveProducts();
        this.renderProducts();
        this.updateStats();
        this.resetForm();
        this.showToast('Producto agregado exitosamente', 'success');
    }

    // Actualizar producto
    updateProduct(product) {
        const index = this.products.findIndex(p => p.id === product.id);
        if (index !== -1) {
            this.products[index] = product;
            this.saveProducts();
            this.renderProducts();
            this.updateStats();
            this.resetForm();
            this.showToast('Producto actualizado exitosamente', 'success');
        }
    }

    // Editar producto
    editProduct(id) {
        const product = this.products.find(p => p.id === id);
        if (product) {
            this.currentEditId = id;
            document.getElementById('productId').value = id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productQuantity').value = product.quantity;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productDescription').value = product.description || '';

            document.getElementById('formTitle').textContent = 'Editar Producto';
            document.getElementById('submitBtn').innerHTML = '<span>💾</span> Actualizar';
            document.getElementById('cancelBtn').style.display = 'block';

            // Scroll al formulario
            document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Cancelar edición
    cancelEdit() {
        this.resetForm();
    }

    // Resetear formulario
    resetForm() {
        document.getElementById('productForm').reset();
        this.currentEditId = null;
        document.getElementById('productId').value = '';
        document.getElementById('formTitle').textContent = 'Agregar Producto';
        document.getElementById('submitBtn').innerHTML = '<span>➕</span> Agregar';
        document.getElementById('cancelBtn').style.display = 'none';
    }

    // Solicitar eliminación
    requestDelete(id) {
        this.deleteProductId = id;
        this.openModal();
    }

    // Confirmar eliminación
    confirmDelete() {
        if (this.deleteProductId) {
            this.products = this.products.filter(p => p.id !== this.deleteProductId);
            this.saveProducts();
            this.renderProducts();
            this.updateStats();
            this.showToast('Producto eliminado exitosamente', 'success');
            this.deleteProductId = null;
            this.closeModal();
        }
    }

    // Abrir modal
    openModal() {
        document.getElementById('confirmModal').classList.add('show');
    }

    // Cerrar modal
    closeModal() {
        document.getElementById('confirmModal').classList.remove('show');
        this.deleteProductId = null;
    }

    // Filtrar productos
    filterProducts() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const categoryFilter = document.getElementById('filterCategory').value;

        let filtered = this.products;

        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchTerm) ||
                p.description.toLowerCase().includes(searchTerm)
            );
        }

        if (categoryFilter) {
            filtered = filtered.filter(p => p.category === categoryFilter);
        }

        this.renderProducts(filtered);
    }

    // Limpiar filtros
    clearFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('filterCategory').value = '';
        this.renderProducts();
    }

    // Cambiar vista
    changeView(view) {
        this.currentView = view;
        const productList = document.getElementById('productList');

        if (view === 'grid') {
            productList.classList.remove('product-list');
            productList.classList.add('product-grid');
            document.getElementById('gridView').classList.add('active');
            document.getElementById('listView').classList.remove('active');
        } else {
            productList.classList.remove('product-grid');
            productList.classList.add('product-list');
            document.getElementById('listView').classList.add('active');
            document.getElementById('gridView').classList.remove('active');
        }
    }

    // Renderizar productos
    renderProducts(productsToRender = this.products) {
        const productList = document.getElementById('productList');
        const emptyState = document.getElementById('emptyState');

        if (productsToRender.length === 0) {
            productList.innerHTML = '';
            emptyState.classList.add('show');
            return;
        }

        emptyState.classList.remove('show');

        productList.innerHTML = productsToRender.map(product => {
            const isLowStock = product.quantity < 10;
            const totalValue = (product.quantity * product.price).toFixed(2);

            return `
                <div class="product-card ${isLowStock ? 'low-stock' : ''}" data-id="${product.id}">
                    <div class="product-header">
                        <span class="product-category">${product.category}</span>
                        ${isLowStock ? '<span class="product-category" style="background: #fef3c7; color: #f59e0b; border-color: #f59e0b;">⚠️ Stock Bajo</span>' : ''}
                    </div>
                    <h3 class="product-name">${this.escapeHtml(product.name)}</h3>
                    ${product.description ? `<p class="product-description">${this.escapeHtml(product.description)}</p>` : ''}
                    <div class="product-details">
                        <div class="product-detail">
                            <span class="detail-label">Cantidad</span>
                            <span class="detail-value quantity ${isLowStock ? 'low' : ''}">${product.quantity}</span>
                        </div>
                        <div class="product-detail">
                            <span class="detail-label">Precio</span>
                            <span class="detail-value price">$${product.price.toFixed(2)}</span>
                        </div>
                        <div class="product-detail">
                            <span class="detail-label">Total</span>
                            <span class="detail-value">$${totalValue}</span>
                        </div>
                    </div>
                    <div class="product-actions">
                        <button class="action-btn edit" onclick="inventoryManager.editProduct(${product.id})">
                            ✏️ Editar
                        </button>
                        <button class="action-btn delete" onclick="inventoryManager.requestDelete(${product.id})">
                            🗑️ Eliminar
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Actualizar estadísticas
    updateStats() {
        const totalProducts = this.products.length;
        const totalValue = this.products.reduce((sum, p) => sum + (p.quantity * p.price), 0);
        const lowStock = this.products.filter(p => p.quantity < 10).length;

        document.getElementById('totalProducts').textContent = totalProducts;
        document.getElementById('totalValue').textContent = `$${totalValue.toFixed(2)}`;
        document.getElementById('lowStock').textContent = lowStock;
    }

    // Exportar a CSV
    exportToCSV() {
        if (this.products.length === 0) {
            this.showToast('No hay productos para exportar', 'warning');
            return;
        }

        const headers = ['ID', 'Nombre', 'Categoría', 'Cantidad', 'Precio', 'Valor Total', 'Descripción'];
        const rows = this.products.map(p => [
            p.id,
            p.name,
            p.category,
            p.quantity,
            p.price,
            (p.quantity * p.price).toFixed(2),
            p.description || ''
        ]);

        let csv = headers.join(',') + '\n';
        rows.forEach(row => {
            csv += row.map(cell => `"${cell}"`).join(',') + '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `inventario_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showToast('Inventario exportado exitosamente', 'success');
    }

    // Mostrar notificación toast
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast show ${type}`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Escapar HTML para prevenir XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Inicializar el sistema cuando el DOM esté listo
let inventoryManager;

document.addEventListener('DOMContentLoaded', () => {
    inventoryManager = new InventoryManager();

    // Agregar mensaje de bienvenida
    setTimeout(() => {
        inventoryManager.showToast('Sistema de inventario cargado', 'success');
    }, 500);
});

// Prevenir pérdida de datos al cerrar la pestaña
window.addEventListener('beforeunload', (e) => {
    // Los datos ya se guardan automáticamente, pero podemos agregar una confirmación
    // si hay un formulario en edición
    const formTitle = document.getElementById('formTitle').textContent;
    if (formTitle === 'Editar Producto') {
        e.preventDefault();
        e.returnValue = '';
    }
});

// Atajos de teclado
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K para enfocar búsqueda
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }

    // Escape para cerrar modal o cancelar edición
    if (e.key === 'Escape') {
        const modal = document.getElementById('confirmModal');
        if (modal.classList.contains('show')) {
            inventoryManager.closeModal();
        } else if (document.getElementById('formTitle').textContent === 'Editar Producto') {
            inventoryManager.cancelEdit();
        }
    }
});
