// js/modal.js
let currentProduct = null;
const modal = document.getElementById('productModal');
const modalImg = document.getElementById('modalImg');
const modalName = document.getElementById('modalName');
const modalDesc = document.getElementById('modalDesc');
const modalPrice = document.getElementById('modalPrice');
const closeBtn = document.getElementById('closeModal');
const addToCartBtn = document.getElementById('modalAddToCart');

export function initModal(onAddToCart) {
    closeBtn.addEventListener('click', closeModal);
    addToCartBtn.addEventListener('click', () => {
        if (currentProduct) {
            onAddToCart(currentProduct);
            closeModal();
        }
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
}

export function openModal(product) {
    currentProduct = product;
    modalImg.src = product.image;
    modalImg.alt = product.name;
    modalName.textContent = product.name;
    modalDesc.textContent = product.description;
    modalPrice.textContent = `₦${product.price.toLocaleString()}`;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    // focus management
    addToCartBtn.focus();
}

function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    currentProduct = null;
}
