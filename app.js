// Setup State
const state = {
    cart: [],
    services: [],
    API_URL: 'https://script.google.com/macros/s/AKfycbxPekxEs8ISFSKWHB6imWCQy15Gu9lzEgMc-OmQPBpjnlgP_QturuU96ZhZ6UW2gJzY/exec'
};

// Elements (Initialized in init)
let dom = {};

// Fallback Data (if API is not set up yet or fails)
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
    // Initialize DOM elements
    dom = {
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
        orderForm: document.getElementById('checkout-form') // Changed to getElementById for consistency
    };

    // Re-initialize modalDom if needed or ensure it's global. 
    // For simplicity, we reference the global modalDom selectors but better to re-select if dynamic.
    // Assuming modalDom is static, strict selection here:

    // (Optional: we can keep modalDom global logic or move it too. Keeping global is fine if IDs are static)

    try {
        await fetchServices();
    } catch (err) {
        console.error("Init Error:", err);
        state.services = fallbackServices;
    }
    renderServices();
    setupEventListeners();
    setupModalListeners();

    // Initial UI Update
    updateCartUI();
}

async function fetchServices() {
    try {
        if (state.API_URL.includes('REPLACE')) throw new Error("Use fallback");

        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const res = await fetch(`${state.API_URL}?op=services`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const json = await res.json();

        if (!json.data || !Array.isArray(json.data)) throw new Error("Invalid data format");

        // Use fallback if API returns empty list (User deleted all rows)
        if (json.data.length === 0) {
            console.warn("API empty. Using fallback data.");
            state.services = fallbackServices;
        } else {
            state.services = json.data;
        }
    } catch (e) {
        console.warn('Using fallback data due to:', e);
        state.services = fallbackServices;
    }
}

function renderServices() {
    dom.grid.innerHTML = state.services.map((service, index) => {
        // Handle images logic
        let imgs = service.images || [service.image];
        // Filter out empty/null values
        if (Array.isArray(imgs)) imgs = imgs.filter(url => url && url.toString().trim() !== '');
        if (!Array.isArray(imgs) || imgs.length === 0) imgs = ['https://via.placeholder.com/400x300?text=Paracas+Tour'];

        const imgTags = Array.isArray(imgs)
            ? imgs.map(src => `<img src="${src}" class="roulette-image" alt="${service.title}" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='https://via.placeholder.com/400x300?text=No+Image'">`).join('')
            : `<img src="${imgs}" class="roulette-image" alt="${service.title}" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='https://via.placeholder.com/400x300?text=No+Image'">`;

        // Duplicate for seamless scroll if css animation
        const trackContent = Array.isArray(imgs) && imgs.length > 1 ? imgTags + imgTags : imgTags;

        return `
             <div class="service-card">
                 <div class="card-image-container" onclick="openServiceDetail(${index})" style="cursor: pointer;">
                     <div class="roulette-track" style="width: ${Array.isArray(imgs) ? imgs.length * 100 : 100}%">
                         ${trackContent}
                     </div>
                 </div>
                 <div class="card-content">
                     <h3 class="card-title" onclick="openServiceDetail(${index})" style="cursor: pointer;">${service.title}</h3>
                     <p class="card-desc">${service.description}</p>
                     <div class="card-footer">
                         <span class="price">S/ ${service.price}</span>
                         <button class="btn btn-add" onclick="event.stopPropagation(); addToCart(${index})">
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
            // Simple URL validation
            if (!state.API_URL.includes('/exec') && !state.API_URL.includes('REPLACE')) {
                throw new Error('La URL del backend parece incorrecta (debe terminar en /exec)');
            }

            if (state.API_URL.includes('REPLACE')) {
                // Simulate success
                await new Promise(r => setTimeout(r, 1500));
                console.log('Order simulated:', orderData);
            } else {
                await fetch(state.API_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'text/plain' },
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
            alert('Error: ' + err.message);
            console.error(err);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });

    // Close modal when clicking outside content (duplicate safety)
    if (modalDom.modal) modalDom.modal.addEventListener('click', (e) => {
        if (e.target === modalDom.modal) closeServiceDetail();
    });
}

// --- Detail Modal & Lightbox Logic ---

// Open Detail Modal
window.openServiceDetail = (index) => {
    const service = state.services[index];
    if (!service) return;

    modalDom.title.textContent = service.title;
    modalDom.desc.textContent = service.description;

    // Populate Gallery
    const imgs = service.images || [service.image];
    // Ensure we have array for consistent handling & valid urls
    let imageList = Array.isArray(imgs) ? imgs : [imgs];
    imageList = imageList.filter(url => url && url.toString().trim() !== '');
    if (imageList.length === 0) imageList = ['https://via.placeholder.com/400x300?text=Paracas+Tour'];

    modalDom.gallery.innerHTML = imageList.map(src => `
        <div class="gallery-item" onclick="openLightbox('${src}')">
            <img src="${src}" loading="lazy" alt="${service.title}" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='https://via.placeholder.com/400x300?text=No+Image'">
        </div>
    `).join('');

    modalDom.modal.classList.add('open');
    document.body.style.overflow = 'hidden';
};

// Close Detail Modal
window.closeServiceDetail = () => {
    modalDom.modal.classList.remove('open');
    document.body.style.overflow = '';
};

// Open Lightbox
window.openLightbox = (src) => {
    modalDom.lightboxImg.src = src;
    modalDom.lightbox.classList.add('open');
};

// Close Lightbox
window.closeLightbox = () => {
    modalDom.lightbox.classList.remove('open');
    setTimeout(() => { modalDom.lightboxImg.src = ''; }, 300);
};

function setupModalListeners() {
    if (modalDom.closeBtn) modalDom.closeBtn.addEventListener('click', closeServiceDetail);
    if (modalDom.closeLightbox) modalDom.closeLightbox.addEventListener('click', closeLightbox);
    if (modalDom.lightbox) modalDom.lightbox.addEventListener('click', (e) => {
        if (e.target === modalDom.lightbox) closeLightbox();
    });
}

// Start
init();
