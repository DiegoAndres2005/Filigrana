// === Base de datos de productos ===
const products = [
    {
        id: 1,
        name: "Anillo de Mariposa",
        price: 500000,
        category: "rings",
        material: "silver",
        image: "Imgs/Imagen3.png",
        description: "Elegante anillo con diamantes genuinos, perfecto para ocasiones especiales."
    },
    {
        id: 2,
        name: "Collares de Oro",
        price: 500000,
        category: "earrings",
        material: "gold",
        image: "Imgs/Imagen1.png",
        description: "Hermoso collar de oro de 18k con diseño moderno y elegante."
    },
    {
        id: 3,
        name: "Argollas de oro",
        price: 500000,
        category: "earrings",
        material: "silver",
        image: "Imgs/Imagen4.png",
        description: "Aretes de plata esterlina con diseño minimalista y contemporáneo."
    },
    {
        id: 4,
        name: "Pulsera de Oro Rosa",
        price: 500000,
        category: "bracelets",
        material: "gold",
        image: "Imgs/Imagen6.png",
        description: "Pulsera de oro rosa con detalles delicados y ajustable a cualquier tamaño."
    },
    {
        id: 5,
        name: "Anillo de Compromiso",
        price: 500000,
        category: "earrings",
        material: "gold",
        image: "Imgs/Imagen2.png",
        description: "Exquisito anillo de compromiso con diamante central y detalles en oro blanco."
    },
    {
        id: 6,
        name: "Collar de Perlas",
        price: 500000,
        category: "necklaces",
        material: "silver",
        image: "Imgs/Imagen5.png",
        description: "Clásico collar de perlas cultivadas con cerradura de plata esterlina."
    },
    {
        id: 7,
        name: "Collar de Perlas",
        price: 500000,
        category: "earrings",
        material: "gold",
        image: "Imgs/Imagen7.png",
        description: "Clásico collar de perlas cultivadas con cerradura de plata esterlina."
    },
    {
        id: 8,
        name: "Collar de Perlas",
        price: 500000,
        category: "earrings",
        material: "gold",
        image: "Imgs/Imagen8.png",
        description: "Clásico collar de perlas cultivadas con cerradura de plata esterlina."
    },
    {
        id: 9,
        name: "Anillos de Dijes",
        price: 500000,
        category: "rings",
        material: "silver",
        image: "Imgs/Imagen9.png",
        description: "Clásico anillo de dijes con detalles en plata esterlina."
    },
    {
        id: 10,
        name: "Anillo de Flores",
        price: 500000,
        category: "rings",
        material: "silver",
        image: "Imgs/Imagen10.png",
        description: "Clásico anillo de flores cultivadas con cerradura de plata esterlina."
    },
    {
        id: 11,
        name: "Collar de Flores",
        price: 500000,
        category: "necklaces",
        material: "silver",
        image: "Imgs/Imagen11.png",
        description: "Clásico collar de flores cultivadas con cerradura de plata esterlina."
    },
    {
        id: 12,
        name: "Collar de Cuello ajustado",
        price: 500000,
        category: "necklaces",
        material: "silver",
        image: "Imgs/Imagen12.png",
        description: "Clásico collar de cuello ajustado con detalles en plata esterlina."
    }
];

// === Variables globales ===
let cart = [];
const catalogElement = document.getElementById('catalog');
const cartItemsElement = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const cartCountElement = document.querySelector('.cart-count');

// === Inicializar la página ===
document.addEventListener('DOMContentLoaded', () => {
    renderProducts(products);
});

// === Renderizar productos en el catálogo ===
function renderProducts(productsToRender) {
    catalogElement.innerHTML = '';

    productsToRender.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product-card';
        productElement.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-price">
                    ${product.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                </p>
                <p class="product-description">${product.description}</p>
                <button class="add-to-cart" onclick="addToCart(${product.id})">Hacer pedido</button>
            </div>
        `;
        catalogElement.appendChild(productElement);
    });
}

// === Filtrar productos según los criterios seleccionados ===
function filterProducts() {
    const category = document.getElementById('category').value;
    const material = document.getElementById('material').value;
    const maxPrice = document.getElementById('price').value;

    const filteredProducts = products.filter(product => {
        return (category === 'all' || product.category === category) &&
               (material === 'all' || product.material === material) &&
               product.price <= maxPrice;
    });

    renderProducts(filteredProducts);
}

// === Actualizar el valor mostrado del rango de precio ===
function updatePriceValue(value) {
    document.getElementById('price-value').textContent =
        value.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
}

// === Añadir producto al carrito ===
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    updateCart();
    // Muestra aviso personalizado
    showCustomAlert(`✅ Pedido hecho: ${product.name}`);

}

// === Actualizar el carrito ===
function updateCart() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCountElement.textContent = totalItems;

    cartItemsElement.innerHTML = '';

    if (cart.length === 0) {
        cartItemsElement.innerHTML = '<p>Tu carrito está vacío</p>';
    } else {
        cart.forEach(item => {
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" width="40">
                </div>
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <p class="cart-item-price">
                        ${item.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })} x ${item.quantity}
                    </p>
                </div>
            `;
            cartItemsElement.appendChild(cartItemElement);
        });
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalElement.textContent = total.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
}

// === Alternar visibilidad del carrito ===
function toggleCart() {
    const cartSidebar = document.getElementById('cart-modal');
    cartSidebar.classList.toggle('active');

    // Overlay oscuro para el sidebar
    const overlay = document.getElementById('cart-overlay');
    if (overlay) overlay.classList.toggle('active');
}


// Bloquea el menú contextual (clic derecho)
document.oncontextmenu = function() {
    return false;
};

// === Aviso personalizado ===
function showCustomAlert(message) {
    // Crear contenedor si no existe
    let alertContainer = document.getElementById('custom-alert-container');
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'custom-alert-container';
        document.body.appendChild(alertContainer);
    }

    // Crear el aviso individual
    const alertBox = document.createElement('div');
    alertBox.className = 'custom-alert';
    alertBox.textContent = message;

    alertContainer.appendChild(alertBox);

    // Animación de entrada
    setTimeout(() => alertBox.classList.add('show'), 100);

    // Eliminar después de 3 segundos
    setTimeout(() => {
        alertBox.classList.remove('show');
        setTimeout(() => alertBox.remove(), 400);
    }, 3000);
}


