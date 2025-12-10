// --- Detail Modal & Lightbox Logic ---

const modalDom = {
    modal: document.getElementById('service-modal'),
    closeBtn: document.getElementById('close-detail'),
    title: document.getElementById('detail-title'),
    gallery: document.getElementById('detail-gallery'),
    desc: document.getElementById('detail-desc'),
    lightbox: document.getElementById('lightbox'),
    lightboxImg: document.getElementById('lightbox-img'),
    closeLightbox: document.getElementById('close-lightbox')
};

// Open Detail Modal
window.openServiceDetail = (index) => {
    const service = state.services[index];
    if (!service) return;

    modalDom.title.textContent = service.title;
    modalDom.desc.textContent = service.description; // In real app, might want a longer 'content' field

    // Populate Gallery
    const imgs = service.images || [service.image];
    // Ensure we have array for consistent handling
    const imageList = Array.isArray(imgs) ? imgs : [imgs];

    modalDom.gallery.innerHTML = imageList.map(src => `
        <div class="gallery-item" onclick="openLightbox('${src}')">
            <img src="${src}" loading="lazy" alt="${service.title}">
        </div>
    `).join('');

    modalDom.modal.classList.add('open');
    document.body.style.overflow = 'hidden'; // Stop background scrolling
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

// Event Listeners for new Modals
modalDom.closeBtn.addEventListener('click', closeServiceDetail);

// Close modal when clicking outside content
modalDom.modal.addEventListener('click', (e) => {
    if (e.target === modalDom.modal) closeServiceDetail();
});

modalDom.closeLightbox.addEventListener('click', closeLightbox);
modalDom.lightbox.addEventListener('click', (e) => {
    if (e.target === modalDom.lightbox) closeLightbox();
});

// Update renderServices to make card clickable
// Override the previous helper to add onclick="openServiceDetail(${index})" to the card
// but keep the button for direct add to cart distinct
function renderServices() {
    dom.grid.innerHTML = state.services.map((service, index) => {
        const imgs = service.images || [service.image];
        const imgTags = Array.isArray(imgs)
            ? imgs.map(src => `<img src="${src}" class="roulette-image" alt="Tour image">`).join('')
            : `<img src="${imgs}" class="roulette-image">`;
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
