// Setup State
const state = {
    cart: [],
    services: [],
    API_URL: 'https://script.google.com/macros/s/AKfycbxPekxEs8ISFSKWHB6imWCQy15Gu9lzEgMc-OmQPBpjnlgP_QturuU96ZhZ6UW2gJzY/exec' // <--- PUT YOUR URL HERE
};

// Elements
const dom = {
    grid: document.getElementById('services-grid'),
    cartBtn: document.getElementById('cart-btn'),
    cartModal: document.getElementById('cart-modal'),
    cartOverlay: document.getElementById('cart-overlay'),
    closeCart: document.getElementById('close-cart'),
    cartItemsContainer: document.getElementById('cart-items'),
    cartCount: document.getElementById('cart-count'),
    cartTotal: document.getElementById('cart-total-amount'),
    startCheckoutBtn: document.getElementById('start-checkout-btn'),
    checkoutForm: document.getElementById('checkout-form'),
    orderForm: document.querySelector('#checkout-form')
};

// Fallback Data (if API is not set up yet)
const fallbackServices = [
    {
        title: "Tour Islas Ballestas",
        description: "Navega y descubre lobos marinos, pingüinos y el candelabro.",
        price: 50,
        images: [
            "https://images.unsplash.com/photo-1574972166723-93d3afced077?q=80&w=2070",
            "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?q=80&w=2070",
            "https://images.unsplash.com/photo-1548625361-ec8f3d640248?q=80&w=1974"
        ]
    },
    {
        title: "Reserva Nacional",
        description: "Explora el desierto, la catedral y las playas rojas.",
        price: 45,
        images: [
            "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=2076",
            "https://images.unsplash.com/photo-1534234828563-0259b3bb9b51?q=80&w=2070",
            "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=2070"
        ]
    },
    {
        title: "Buggies + Sandboarding",
        description: "Adrenalina pura en las dunas de California.",
        price: 60,
        images: [
            "https://images.unsplash.com/photo-1545562086-a2e6f4a8670d?q=80&w=2070",
            "https://images.unsplash.com/photo-1621262657378-c89e877e8a9f?q=80&w=2070",
            "https://images.unsplash.com/photo-1682685797828-d3b255971961?q=80&w=2070"
        ]
    }
];

// Functions
async function init() {
    await fetchServices();
    renderServices();
    setupEventListeners();
}

async function fetchServices() {
    try {
        if (state.API_URL.includes('REPLACE')) throw new Error("Use fallback");
        const res = await fetch(`${state.API_URL}?op=services`);
        const json = await res.json();
        state.services = json.data;
    } catch (e) {
        console.warn('Using fallback data:', e);
        state.services = fallbackServices;
    }
}

function renderServices() {
    dom.grid.innerHTML = state.services.map((service, index) => {
        // Handle images for simple roulette (just 3 for demo)
        const imgs = service.images || [service.image]; // Support both array or single
        const imgTags = Array.isArray(imgs)
            ? imgs.map(src => `<img src="${src}" class="roulette-image" alt="Tour image">`).join('')
            : `<img src="${imgs}" class="roulette-image">`;

        // Duplicate for seamless scroll if css animation
        const trackContent = Array.isArray(imgs) && imgs.length > 1 ? imgTags + imgTags : imgTags;

        return `
            <div class="service-card">
                <div class="card-image-container">
                    <div class="roulette-track" style="width: ${Array.isArray(imgs) ? imgs.length * 100 : 100}%">
                        ${trackContent}
                    </div>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${service.title}</h3>
                    <p class="card-desc">${service.description}</p>
                    <div class="card-footer">
                        <span class="price">S/ ${service.price}</span>
                        <button class="btn btn-add" onclick="addToCart(${index})">
                            Agregar <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

window.addToCart = (index) => {
    const service = state.services[index];
    const existing = state.cart.find(item => item.title === service.title);

    if (existing) {
        existing.qty++;
    } else {
        state.cart.push({ ...service, qty: 1 });
    }

    updateCartUI();
    openCart();
};

function updateCartUI() {
    dom.cartCount.textContent = state.cart.reduce((sum, item) => sum + item.qty, 0);

    const total = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    dom.cartTotal.textContent = `S/ ${total.toFixed(2)}`;

    if (state.cart.length === 0) {
        dom.cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Tu carrito está vacío.</div>';
        return;
    }

    dom.cartItemsContainer.innerHTML = state.cart.map((item, idx) => `
        <div class="cart-item">
            <div>
                <h4>${item.title}</h4>
                <small>S/ ${item.price} x ${item.qty}</small>
            </div>
            <div>
                <button class="nav-icon-btn" onclick="removeFromCart(${idx})" style="color:red; font-size:1rem;">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

window.removeFromCart = (idx) => {
    state.cart.splice(idx, 1);
    updateCartUI();
};

function openCart() {
    dom.cartModal.classList.add('open');
    dom.cartOverlay.classList.add('open');
}

function closeCart() {
    dom.cartModal.classList.remove('open');
    dom.cartOverlay.classList.remove('open');
}

function setupEventListeners() {
    dom.cartBtn.addEventListener('click', openCart);
    dom.closeCart.addEventListener('click', closeCart);
    dom.cartOverlay.addEventListener('click', closeCart);

    dom.startCheckoutBtn.addEventListener('click', () => {
        if (state.cart.length === 0) return alert('El carrito está vacío');
        dom.checkoutForm.classList.remove('hidden');
        dom.startCheckoutBtn.style.display = 'none';
        // Smooth scroll to form
        dom.checkoutForm.scrollIntoView({ behavior: 'smooth' });
    });

    dom.orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(dom.orderForm);
        const orderData = {
            op: 'order',
            cart: state.cart,
            total: state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0),
            customer: {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                date: formData.get('date')
            }
        };

        const btn = dom.orderForm.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Enviando...';
        btn.disabled = true;

        try {
            if (state.API_URL.includes('REPLACE')) {
                // Simulate success
                await new Promise(r => setTimeout(r, 1500));
                console.log('Order simulated:', orderData);
            } else {
                await fetch(state.API_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'text/plain'
                    },
                    body: JSON.stringify(orderData)
                });
            }

            alert('¡Reserva enviada con éxito! Revisa tu correo.');
            state.cart = [];
            updateCartUI();
            closeCart();
            dom.orderForm.reset();
            dom.checkoutForm.classList.add('hidden');
            dom.startCheckoutBtn.style.display = 'block';

        } catch (err) {
            alert('Error al enviar la reserva, inténtalo de nuevo.');
            console.error(err);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
}

// Start
init();
