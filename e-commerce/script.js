// Product Data
const products = [
    {
        id: 1,
        name: 'Galaxy Pro X',
        category: 'phones',
        price: 15999,
        description: 'Flagship smartphone with edge-to-edge display and premium design',
        image: 'smartphone_product_1768826391767.png',
        badge: 'Popular'
    },
    {
        id: 2,
        name: 'UltraBook Pro',
        category: 'computers',
        price: 24999,
        description: 'Premium laptop with powerful performance and sleek design',
        image: 'laptop_product_1768826408630.png',
        badge: 'New'
    },
    {
        id: 3,
        name: 'SoundMax Elite',
        category: 'audio',
        price: 4999,
        description: 'Wireless headphones with premium noise cancellation',
        image: 'headphones_product_1768826429705.png',
        badge: null
    },
    {
        id: 4,
        name: 'FitWatch Pro',
        category: 'wearables',
        price: 6999,
        description: 'Advanced smartwatch with health tracking and OLED display',
        image: 'smartwatch_product_1768826445424.png',
        badge: 'Popular'
    },
    {
        id: 5,
        name: 'ColorTab Ultra',
        category: 'computers',
        price: 12999,
        description: 'High-performance tablet with vibrant display',
        image: 'tablet_product_1768826461251.png',
        badge: null
    },
    {
        id: 6,
        name: 'ProCam Z9',
        category: 'cameras',
        price: 18999,
        description: 'Professional mirrorless camera for stunning photography',
        image: 'camera_product_1768826476780.png',
        badge: 'New'
    }
];

// Cart State
let cart = [];
let currentFilter = 'all';

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const closeCart = document.getElementById('closeCart');
const overlay = document.getElementById('overlay');
const cartItems = document.getElementById('cartItems');
const totalAmount = document.getElementById('totalAmount');
const cartCount = document.querySelector('.cart-count');
const filterTabs = document.querySelectorAll('.filter-tab');
const header = document.getElementById('header');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    setupEventListeners();
    loadCartFromStorage();
});

// Render Products
function renderProducts(filter = 'all') {
    productsGrid.innerHTML = '';

    const filteredProducts = filter === 'all'
        ? products
        : products.filter(p => p.category === filter);

    filteredProducts.forEach((product, index) => {
        const productCard = createProductCard(product, index);
        productsGrid.appendChild(productCard);
    });
}

// Create Product Card
function createProductCard(product, index) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.animationDelay = `${index * 0.1}s`;

    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x300/1a1a2e/ffffff?text=${product.name}'">
            ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
        </div>
        <div class="product-info">
            <div class="product-category">${product.category}</div>
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-footer">
                <div class="product-price">R ${product.price.toLocaleString()}</div>
                <button class="add-to-cart" onclick="addToCart(${product.id})">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>
            </div>
        </div>
    `;

    return card;
}

// Add to Cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    updateCart();
    saveCartToStorage();
    showCartNotification();
}

// Update Cart
function updateCart() {
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <p>Your cart is empty</p>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/80x80/1a1a2e/ffffff?text=${item.name}'">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">R ${item.price.toLocaleString()}</div>
                    <div class="cart-item-actions">
                        <button class="quantity-btn" onclick="decreaseQuantity(${item.id})">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                        <span class="item-quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="increaseQuantity(${item.id})">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                        <button class="remove-item" onclick="removeFromCart(${item.id})">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalAmount.textContent = `R ${total.toLocaleString()}.00`;

    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    if (totalItems > 0) {
        cartCount.classList.add('active');
    } else {
        cartCount.classList.remove('active');
    }
}

// Cart Actions
function increaseQuantity(productId) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity++;
        updateCart();
        saveCartToStorage();
    }
}

function decreaseQuantity(productId) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity--;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCart();
            saveCartToStorage();
        }
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    saveCartToStorage();
}

// Local Storage
function saveCartToStorage() {
    localStorage.setItem('techHubCart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('techHubCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCart();
    }
}

// Cart UI Toggle
function toggleCart() {
    cartSidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

// Cart Notification
function showCartNotification() {
    // Trigger cart button animation
    cartBtn.style.animation = 'none';
    setTimeout(() => {
        cartBtn.style.animation = 'pulse 0.5s ease';
    }, 10);
}

// Scroll to Products
function scrollToProducts() {
    document.getElementById('products').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Event Listeners
function setupEventListeners() {
    // Cart Toggle
    cartBtn.addEventListener('click', toggleCart);
    closeCart.addEventListener('click', toggleCart);
    overlay.addEventListener('click', toggleCart);

    // Filter Tabs
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const filter = tab.getAttribute('data-filter');
            currentFilter = filter;
            renderProducts(filter);
        });
    });

    // Header Scroll Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Smooth Scroll for Nav Links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const target = document.querySelector(targetId);

            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Update active link
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });

    // Checkout Button
    document.getElementById('checkoutBtn').addEventListener('click', () => {
        if (cart.length > 0) {
            alert('Thank you for your order! This is a demo store. In a real implementation, this would proceed to checkout.');
        } else {
            alert('Your cart is empty. Please add some items first.');
        }
    });
}

// CSS Animation for pulse
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
`;
document.head.appendChild(style);
