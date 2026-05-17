/**
 * page-cart.js - Module partagé pour les pages statiques (vetement, chaussures, computers, promotions)
 * 
 * RÔLE : Connecte les boutons .btn-order au panier localStorage.
 * Les pages statiques utilisent .btn-order (pas .btn-add-cart) donc ce module
 * intercepte ces clics et les persiste dans localStorage via la même clé 'primvo_cart'.
 * 
 * USAGE : Ajouter dans chaque sous-page :
 *   <script type="module" src="../js/page-cart.js"></script>
 */

// ─── Utilitaires localStorage ────────────────────────────────────────────────

function getCart() {
    try {
        return JSON.parse(localStorage.getItem('primvo_cart')) || [];
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem('primvo_cart', JSON.stringify(cart));
}

function addToCart(product) {
    const cart = getCart();
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
        existing.quantity = (parseInt(existing.quantity) || 1) + 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart(cart);
    return cart.reduce((s, i) => s + parseInt(i.quantity), 0); // retourne le total
}

// ─── Badge panier dans la navbar ─────────────────────────────────────────────

function updateCartBadge() {
    const cart = getCart();
    const count = cart.reduce((s, i) => s + parseInt(i.quantity || 1), 0);
    document.querySelectorAll('a[href*="cart.html"]').forEach(link => {
        let badge = link.querySelector('.cart-badge-nav');
        if (count > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'cart-badge-nav';
                link.appendChild(badge);
            }
            badge.textContent = count;
        } else if (badge) {
            badge.remove();
        }
    });
}

// ─── Toast notification légère (sans Firebase) ───────────────────────────────

function showPageToast(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast-custom success';
    toast.innerHTML = `<i class="fa fa-check-circle"></i><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// ─── Génère un ID stable à partir du nom du produit ──────────────────────────

function generateId(name) {
    return 'static-' + name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 30);
}

// ─── Initialisation au chargement ────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

    // Badge initial
    updateCartBadge();

    // Connexion des boutons .btn-order (pages statiques) au panier
    document.querySelectorAll('.btn-order').forEach(btn => {
        // Évite le double-binding si la page a déjà un listener via le script inline
        if (btn.dataset.cartBound) return;
        btn.dataset.cartBound = 'true';

        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const card = this.closest('.product-card');
            if (!card) return;

            const nameEl    = card.querySelector('h3');
            const priceEl   = card.querySelector('.price-badge, .price-new');
            const imgEl     = card.querySelector('img');

            const name  = nameEl  ? nameEl.innerText.trim()  : 'Produit';
            const priceStr = priceEl ? priceEl.innerText.replace(/[^\d]/g, '') : '0';
            const price = parseInt(priceStr) || 0;
            const image = imgEl ? imgEl.getAttribute('src') : '';

            const product = {
                id:       generateId(name),
                name:     name,
                price:    price,
                image:    image,
                category: document.title.replace('Primvo - ', '').trim()
            };

            const totalCount = addToCart(product);
            updateCartBadge();

            // Feedback visuel sur le bouton
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fa fa-check"></i> Ajouté !';
            this.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
            setTimeout(() => {
                this.innerHTML = originalText;
                this.style.background = '';
            }, 1200);

            showPageToast(`✓ ${name} ajouté au panier !`);
        });
    });
});
