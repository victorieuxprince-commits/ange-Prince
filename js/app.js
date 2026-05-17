import { PRODUCTS_DATA, renderProducts, fetchProductsPaged, renderSkeletons } from './products.js';
import { cartManager } from './cart.js';
import { showToast } from './ui.js';
import {
    initAllFeatures,
    initLiveSearch,
    toggleWishlistItem,
    updateWishlistUI,
    getProductRating,
    renderStars as renderStarsFeature,
    showFeatureToast
} from './features.js';

/**
 * App Module — Point d'entrée principal Primvo E-commerce
 */

document.addEventListener('DOMContentLoaded', () => {
    // ── Fonctionnalités avancées ──────────────────────────────
    initAllFeatures({
        whatsappPhone: '2290166863366', // WhatsApp Primvo
        whatsappMsg:   'Bonjour Primvo ! Je souhaite des informations sur vos produits.',
        enableLoader:   true,
        enableDarkMode: false,  // Mode clair uniquement
        enableWhatsApp: true,
        enableWishlist: true,
        enableReviews:  true,
    });

    // ── Bouton scroll-to-top ─────────────────────────────────
    initScrollTop();

    // ── Core ─────────────────────────────────────────────────
    initHomePage();
    initNavigation();
    initAnimations();
    initAddToCartEvents();
    initCartBadge();
    initLiveSearch(); // Recherche live sur les produits affichés
});

/**
 * Initialise la page d'accueil avec Performance Senior
 */
async function initHomePage() {
    // 1. Affichage immédiat des skeletons pour un feedback instantané
    renderSkeletons('promo-container', 4);
    renderSkeletons('new-arrivals-container', 4);
    renderSkeletons('best-sellers-container', 4);

    try {
        // 2. Chargement paginé
        const products = await fetchProductsPaged(8);
        const displayProducts = (products && products.length > 0) ? products : PRODUCTS_DATA;

        const promoProducts = displayProducts.filter(p => p.category === 'Promotions').slice(0, 4);
        const newArrivals = displayProducts.filter(p => p.category !== 'Promotions').slice(0, 4);
        // Utiliser PRODUCTS_DATA pour garantir de trouver les best sellers (s'ils ne sont pas dans la 1ère page fetchée)
        const bestSellers = PRODUCTS_DATA.filter(p => p.bestSeller).slice(0, 4);

        renderProducts(promoProducts.length > 0 ? promoProducts : displayProducts.slice(0, 4), 'promo-container');
        renderProducts(newArrivals.length > 0 ? newArrivals : displayProducts.slice(0, 4), 'new-arrivals-container');
        renderProducts(bestSellers, 'best-sellers-container');

    } catch (error) {
        console.error("Erreur lors de l'initialisation de la page d'accueil:", error);
        renderProducts(PRODUCTS_DATA.filter(p => p.category === 'Promotions').slice(0, 4), 'promo-container');
        renderProducts(PRODUCTS_DATA.filter(p => p.category !== 'Promotions').slice(0, 4), 'new-arrivals-container');
        renderProducts(PRODUCTS_DATA.filter(p => p.bestSeller).slice(0, 4), 'best-sellers-container');
    }
}



/**
 * Gestion des événements d'ajout au panier
 */
function initAddToCartEvents() {
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-add-cart');
        if (!btn) return;

        e.preventDefault();
        e.stopPropagation();

        const id = btn.dataset.id;

        // CORRECTION : On cherche d'abord dans PRODUCTS_DATA,
        // puis on parse l'attribut data-product (JSON) comme fallback.
        // Cela garantit que TOUS les produits sont ajoutables, même ceux
        // chargés dynamiquement depuis Firebase qui ne sont pas dans PRODUCTS_DATA.
        let product = PRODUCTS_DATA.find(p => p.id === id);

        if (!product && btn.dataset.product) {
            try {
                // data-product contient le JSON du produit encodé par renderProducts()
                product = JSON.parse(btn.dataset.product.replace(/&apos;/g, "'"));
            } catch (err) {
                console.error('Erreur parsing data-product:', err);
            }
        }

        if (product) {
            cartManager.addItem(product);
            // Animation visuelle sur le bouton
            btn.classList.add('btn-added');
            setTimeout(() => btn.classList.remove('btn-added'), 800);
            showToast(`✓ ${product.name} ajouté au panier !`);
        } else {
            console.warn('Produit introuvable pour id:', id);
        }
    });
}


function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            stars += '<i class="fa fa-star"></i>';
        } else if (i - 0.5 <= rating) {
            stars += '<i class="fa fa-star-half-o"></i>';
        } else {
            stars += '<i class="fa fa-star-o"></i>';
        }
    }
    return stars;
}

/**
 * Actions globales
 */
window.addToCart = (id) => {
    const product = PRODUCTS_DATA.find(p => p.id === id);
    if (product) {
        cartManager.addItem(product);
        showToast(`${product.name} ajouté au panier !`);
    }
};

// CORRECTION : connecté au vrai système de wishlist persistante (features.js)
window.toggleWishlist = (id) => {
    const product = PRODUCTS_DATA.find(p => p.id === id) || { id };
    const added = toggleWishlistItem(product);
    showFeatureToast(
        added ? `❤️ Ajouté aux favoris !` : `💔 Retiré des favoris`,
        added ? 'success' : 'info'
    );
};

/**
 * Bouton scroll-to-top
 */
function initScrollTop() {
    const btn = document.createElement('button');
    btn.id = 'scroll-top-btn';
    btn.setAttribute('aria-label', 'Retour en haut');
    btn.innerHTML = '<i class="fa fa-chevron-up"></i>';
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
}

/**
 * Initialise la navigation et les liens
 */
function initNavigation() {
    const sideMenuItems = document.querySelectorAll('.side-menu > ul > li');
    
    sideMenuItems.forEach(item => {
        // L'icône de la flèche
        const angleIcon = item.querySelector('.fa-angle-right');
        const submenu = item.querySelector('ul');

        if (angleIcon && submenu) {
            angleIcon.style.cursor = 'pointer';
            angleIcon.style.padding = '10px';
            angleIcon.style.marginRight = '0';
            
            angleIcon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const isOpen = item.classList.contains('mobile-open');
                
                // Fermer les autres
                document.querySelectorAll('.side-menu > ul > li').forEach(li => {
                    li.classList.remove('mobile-open');
                    const icon = li.querySelector('.fa-angle-down');
                    if (icon) {
                        icon.classList.remove('fa-angle-down');
                        icon.classList.add('fa-angle-right');
                    }
                });

                if (!isOpen) {
                    item.classList.add('mobile-open');
                    angleIcon.classList.remove('fa-angle-right');
                    angleIcon.classList.add('fa-angle-down');
                } else {
                    item.classList.remove('mobile-open');
                    angleIcon.classList.remove('fa-angle-down');
                    angleIcon.classList.add('fa-angle-right');
                }
            });
        }
    });

    // Liens du header
    const topNavLinks = document.querySelectorAll('.menu-bar ul li a');
    topNavLinks.forEach(link => {
        const text = link.textContent.trim().toLowerCase();
        if (text.includes('panier')) link.href = './cart.html';
        if (text.includes('inscrire')) link.href = './page/inscription.html';
        if (text.includes('connecter')) link.href = './page/connexion.html';
    });

    // Newsletter
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('Merci de vous être abonné !');
            newsletterForm.reset();
        });
    }
}

/**
 * Animations de révélation au défilement
 */
function initAnimations() {
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/**
 * Mise à jour du badge du panier dans la navigation
 * CORRECTION : Cette fonction est appelée directement dans le DOMContentLoaded
 * principal, plus besoin d'un second addEventListener séparé.
 */
function initCartBadge() {
    const cartLinks = document.querySelectorAll('a[href*="cart.html"]');
    
    cartManager.subscribe((items) => {
        const count = cartManager.count;
        cartLinks.forEach(link => {
            let badge = link.querySelector('.cart-badge-nav');
            if (count > 0) {
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'cart-badge-nav';
                    link.appendChild(badge);
                }
                badge.textContent = count;
                badge.style.animation = 'none';
                setTimeout(() => badge.style.animation = '', 10);
            } else if (badge) {
                badge.remove();
            }
        });
    });

    // Bouton paiement dans le panier
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cartManager.cart.length === 0) {
                showToast('Votre panier est vide !', 'error');
            } else {
                window.location.href = './page/paiement.html';
            }
        });
    }
}

