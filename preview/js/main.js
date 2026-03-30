// js/main.js
import { loadProducts } from './products.js';
import { initCart, addToCart } from './cart.js';
import { initModal, openModal } from './modal.js';
import { showToast } from './toast.js';

// Determine category from current page URL
const path = window.location.pathname;
let category = '';
if (path.includes('bags.html')) category = 'bags';
else if (path.includes('gadgets.html')) category = 'gadgets';

if (!category) {
    // If not on a product page, maybe do nothing or show error
    console.warn('Not on a product page');
} else {
    initCart();
    initModal(addToCart);

    const container = document.getElementById('products-container');
    container.innerHTML = '<div class="loading">Loading products...</div>';

    loadProducts(category).then(products => {
        if (products.length === 0) {
            container.innerHTML = '<p class="muted">No products found.</p>';
            return;
        }
        renderProducts(products);
    }).catch(err => {
        container.innerHTML = '<p class="muted">Error loading products. Please try again later.</p>';
        console.error(err);
    });

    function renderProducts(products) {
        container.innerHTML = products.map(product => `
            <article class="card">
                <div class="pic-frame">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <div>
                        <div class="name">${product.name}</div>
                        <div class="muted">${product.descriptionShort || ''}</div>
                    </div>
                    <div class="price">₦${product.price.toLocaleString()}</div>
                </div>
                <div style="padding: 0 1rem 1rem 1rem;">
                    <button class="btn btn-primary view-details" data-id="${product.id}">View Details</button>
                </div>
            </article>
        `).join('');

        // Attach event listeners to view details buttons
        document.querySelectorAll('.view-details').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                const product = products.find(p => p.id === id);
                if (product) openModal(product);
            });
        });
    }

    // Contact button (same as before)
    const contactBtn = document.getElementById('contactBtn');
    if (contactBtn) {
        contactBtn.addEventListener('click', () => {
            showToast('Contact Mr Izzi: +234 708 147 2383');
        });
    }
}
