/**
 * features.js — Module central des fonctionnalités avancées
 * Primvo E-commerce | Version Production
 *
 * Contient :
 *  - Dark / Light mode
 *  - Wishlist (favoris)
 *  - Loader de page
 *  - Système d'avis (étoiles)
 *  - Recherche live
 *  - Bouton WhatsApp flottant
 */

// ═══════════════════════════════════════════════════════════════════
// 1. DARK / LIGHT MODE
// ═══════════════════════════════════════════════════════════════════

const DARK_KEY = 'primvo_dark_mode';

export function initDarkMode() {
    const saved = localStorage.getItem(DARK_KEY);
    if (saved === 'dark') applyDark(true);

    // Créer le bouton toggle s'il n'existe pas déjà
    if (!document.getElementById('dark-toggle')) {
        const btn = document.createElement('button');
        btn.id = 'dark-toggle';
        btn.className = 'dark-toggle-btn';
        btn.setAttribute('aria-label', 'Toggle dark mode');
        btn.innerHTML = document.body.classList.contains('dark-mode')
            ? '<i class="fa fa-sun-o"></i>'
            : '<i class="fa fa-moon-o"></i>';
        btn.addEventListener('click', toggleDark);
        document.body.appendChild(btn);
    }
}

function applyDark(isDark) {
    document.body.classList.toggle('dark-mode', isDark);
    const btn = document.getElementById('dark-toggle');
    if (btn) {
        btn.innerHTML = isDark
            ? '<i class="fa fa-sun-o"></i>'
            : '<i class="fa fa-moon-o"></i>';
        btn.title = isDark ? 'Passer en mode clair' : 'Passer en mode sombre';
    }
}

function toggleDark() {
    const isDark = !document.body.classList.contains('dark-mode');
    applyDark(isDark);
    localStorage.setItem(DARK_KEY, isDark ? 'dark' : 'light');
}


// ═══════════════════════════════════════════════════════════════════
// 2. LOADER DE PAGE
// ═══════════════════════════════════════════════════════════════════

export function showLoader() {
    let loader = document.getElementById('page-loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'page-loader';
        loader.innerHTML = `
            <div class="loader-inner">
                <div class="loader-logo">Primvo</div>
                <div class="loader-spinner"></div>
                <p class="loader-text">Chargement...</p>
            </div>
        `;
        document.body.prepend(loader);
    }
    loader.classList.remove('loader-hidden');
    document.body.style.overflow = 'hidden';
}

export function hideLoader() {
    const loader = document.getElementById('page-loader');
    if (loader) {
        loader.classList.add('loader-hidden');
        setTimeout(() => {
            document.body.style.overflow = '';
            if (loader.parentNode) loader.parentNode.removeChild(loader);
        }, 500);
    }
}

export function initLoader() {
    showLoader();
    // Masquer dès que la page est chargée
    if (document.readyState === 'complete') {
        hideLoader();
    } else {
        window.addEventListener('load', hideLoader);
    }
}


// ═══════════════════════════════════════════════════════════════════
// 3. WISHLIST (FAVORIS)
// ═══════════════════════════════════════════════════════════════════

const WISH_KEY = 'primvo_wishlist';

export function getWishlist() {
    try {
        return JSON.parse(localStorage.getItem(WISH_KEY)) || [];
    } catch {
        return [];
    }
}

function saveWishlist(list) {
    localStorage.setItem(WISH_KEY, JSON.stringify(list));
}

export function toggleWishlistItem(product) {
    const list = getWishlist();
    const idx  = list.findIndex(i => i.id === product.id);
    let added;
    if (idx > -1) {
        list.splice(idx, 1);
        added = false;
    } else {
        list.push(product);
        added = true;
    }
    saveWishlist(list);
    updateWishlistUI();
    return added;
}

export function isWishlisted(productId) {
    return getWishlist().some(i => i.id === productId);
}

export function updateWishlistUI() {
    const count = getWishlist().length;

    // Met à jour tous les boutons wishlist dans la page
    document.querySelectorAll('.btn-wishlist, [data-wish-id]').forEach(btn => {
        const id = btn.dataset.wishId || btn.dataset.id;
        if (id) {
            const active = isWishlisted(id);
            btn.classList.toggle('wishlisted', active);
            const icon = btn.querySelector('i');
            if (icon) {
                icon.className = active ? 'fa fa-heart' : 'fa fa-heart-o';
            }
        }
    });

    // Badge wishlist dans la navbar (si présent)
    document.querySelectorAll('.wish-badge').forEach(b => {
        b.textContent = count > 0 ? count : '';
        b.style.display = count > 0 ? 'inline-flex' : 'none';
    });
}

export function initWishlist() {
    updateWishlistUI();

    // Délégation globale sur les boutons wishlist
    document.body.addEventListener('click', e => {
        const btn = e.target.closest('[data-wish-id]');
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();

        const id = btn.dataset.wishId;
        // Récupère les infos produit depuis l'attribut data-product ou le DOM
        let product = { id };
        if (btn.dataset.product) {
            try { product = JSON.parse(btn.dataset.product.replace(/&apos;/g, "'")); } catch {}
        }
        const added = toggleWishlistItem(product);

        // Toast de confirmation
        showFeatureToast(
            added ? `❤️ Ajouté aux favoris !` : `💔 Retiré des favoris`,
            added ? 'success' : 'info'
        );
    });
}


// ═══════════════════════════════════════════════════════════════════
// 4. SYSTÈME D'AVIS (ÉTOILES)
// ═══════════════════════════════════════════════════════════════════

const REVIEWS_KEY = 'primvo_reviews';

function getReviews() {
    try { return JSON.parse(localStorage.getItem(REVIEWS_KEY)) || {}; } catch { return {}; }
}

function saveReviews(data) {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(data));
}

export function addReview(productId, rating, comment = '') {
    const all = getReviews();
    if (!all[productId]) all[productId] = [];
    all[productId].push({ rating, comment, date: new Date().toISOString() });
    saveReviews(all);
    return all[productId];
}

export function getProductRating(productId) {
    const all = getReviews();
    const reviews = all[productId] || [];
    if (reviews.length === 0) return { avg: 4.5, count: 0 }; // défaut affiché
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    return { avg: Math.round(avg * 10) / 10, count: reviews.length };
}

export function renderStars(rating, interactive = false, productId = null) {
    let html = '<div class="stars-row">';
    for (let i = 1; i <= 5; i++) {
        const filled = i <= Math.floor(rating);
        const half   = !filled && i - 0.5 <= rating;
        const icon   = filled ? 'fa-star' : half ? 'fa-star-half-o' : 'fa-star-o';
        if (interactive && productId) {
            html += `<i class="fa ${icon} star-interactive" data-pid="${productId}" data-val="${i}" style="cursor:pointer; font-size:20px; color:orange; margin:1px;"></i>`;
        } else {
            html += `<i class="fa ${icon}" style="color:orange; font-size:14px; margin:0 1px;"></i>`;
        }
    }
    html += '</div>';
    return html;
}

export function initReviewInteractions() {
    document.body.addEventListener('click', e => {
        const star = e.target.closest('.star-interactive');
        if (!star) return;
        const pid = star.dataset.pid;
        const val = parseInt(star.dataset.val);
        addReview(pid, val);
        showFeatureToast(`Merci pour votre avis (${val}★) !`, 'success');
        // Rafraîchir l'affichage si possible
        document.querySelectorAll(`[data-review-pid="${pid}"]`).forEach(el => {
            const { avg, count } = getProductRating(pid);
            el.innerHTML = renderStars(avg) + `<small class="text-muted ms-1">(${count})</small>`;
        });
    });
}


// ═══════════════════════════════════════════════════════════════════
// 5. LIVE SEARCH (recherche en temps réel dans les produits)
// ═══════════════════════════════════════════════════════════════════

export function initLiveSearch() {
    const input  = document.querySelector('.top-nav-bar input[type="text"]');
    const searchBtn = document.querySelector('.top-nav-bar .input-group-text');
    if (!input) return;

    // Fonction pour lancer la recherche globale
    const performSearch = () => {
        const query = input.value.trim();
        if (query.length > 0) {
            const isSubPage = window.location.pathname.includes('/page/');
            const resultsPath = isSubPage ? 'results.html' : 'page/results.html';
            window.location.href = `${resultsPath}?q=${encodeURIComponent(query)}`;
        }
    };

    if (searchBtn) {
        searchBtn.style.cursor = 'pointer';
        searchBtn.addEventListener('click', performSearch);
    }

    let debounceTimer;

    input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const q = input.value.trim().toLowerCase();
            filterProductCards(q);
        }, 200);
    });

    // Touche Échap pour effacer, Entrée pour chercher
    input.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            input.value = '';
            filterProductCards('');
        } else if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });
}

function filterProductCards(query) {
    const containers = ['promo-container', 'new-arrivals-container'];
    let totalVisible = 0;

    containers.forEach(id => {
        const container = document.getElementById(id);
        if (!container) return;

        container.querySelectorAll('.col-md-3, .col-6').forEach(card => {
            const name = (card.querySelector('h3')?.textContent || '').toLowerCase();
            const match = !query || name.includes(query);
            card.style.display = match ? '' : 'none';
            if (match) totalVisible++;
        });
    });

    // Afficher un message si aucun résultat
    showSearchFeedback(query, totalVisible);
}

function showSearchFeedback(query, count) {
    let fb = document.getElementById('search-feedback');
    if (query && count === 0) {
        if (!fb) {
            fb = document.createElement('div');
            fb.id = 'search-feedback';
            fb.className = 'search-no-result';
            fb.innerHTML = `<i class="fa fa-search" style="font-size:40px; opacity:0.3;"></i><p>Aucun produit pour "<strong>${query}</strong>"</p><a href="./page/results.html?q=${encodeURIComponent(query)}" class="btn btn-orange mt-2">Recherche avancée</a>`;
            const main = document.querySelector('.on-sale .container') || document.querySelector('.container');
            if (main) main.appendChild(fb);
        } else {
            fb.style.display = 'block';
        }
    } else if (fb) {
        fb.style.display = 'none';
    }
}


// ═══════════════════════════════════════════════════════════════════
// 6. BOUTON WHATSAPP FLOTTANT
// ═══════════════════════════════════════════════════════════════════

export function initWhatsApp(phoneNumber = '22900000000', message = 'Bonjour ! Je souhaite des informations sur vos produits.') {
    if (document.getElementById('whatsapp-btn')) return;

    // Nettoyage du numéro (garder uniquement les chiffres)
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Retour au format wa.me qui est souvent moins sujet aux blocages réseaux/firewall que api.whatsapp.com
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    
    const btn = document.createElement('a');
    btn.id        = 'whatsapp-btn';
    btn.href      = url;
    btn.target    = '_blank';
    btn.rel       = 'noopener noreferrer';
    btn.className = 'whatsapp-float';
    btn.setAttribute('aria-label', 'Nous contacter sur WhatsApp');
    btn.innerHTML = `
        <i class="fab fa-whatsapp"></i>
        <span class="whatsapp-tooltip">Besoin d'aide ?</span>
    `;

    // Gestion intelligente du clic pour éviter les blocages api.whatsapp.com
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        
        if (isMobile) {
            // Tentative d'ouverture directe de l'app (pas de blocage DNS possible)
            const deepLink = `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
            window.location.href = deepLink;
            
            // Fallback vers le web si l'app n'est pas installée
            setTimeout(() => {
                if (document.hasFocus()) {
                    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
                }
            }, 1500);
        } else {
            // Sur Desktop, on utilise web.whatsapp.com qui évite la redirection par api.whatsapp.com
            const webUrl = `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
            window.open(webUrl, '_blank');
        }
    });
    
    // Animation d'entrée
    btn.style.opacity = '0';
    btn.style.transform = 'scale(0) rotate(-45deg)';
    
    document.body.appendChild(btn);
    
    // Petit délai pour l'animation
    setTimeout(() => {
        btn.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        btn.style.opacity = '1';
        btn.style.transform = 'scale(1) rotate(0deg)';
    }, 100);
}


// ═══════════════════════════════════════════════════════════════════
// 7. FILTRES PRODUITS (min/max prix + catégorie)
// ═══════════════════════════════════════════════════════════════════

export function initProductFilters(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Insérer le panneau de filtres avant le container produits
    const filterPanel = document.createElement('div');
    filterPanel.className = 'filter-panel';
    filterPanel.innerHTML = `
        <div class="filter-group">
            <label><i class="fa fa-sliders"></i> Prix min (FCFA)</label>
            <input type="number" id="filter-min" placeholder="0" min="0" class="filter-input">
        </div>
        <div class="filter-group">
            <label><i class="fa fa-sliders"></i> Prix max (FCFA)</label>
            <input type="number" id="filter-max" placeholder="1000000" min="0" class="filter-input">
        </div>
        <div class="filter-group">
            <label><i class="fa fa-sort"></i> Trier par</label>
            <select id="filter-sort" class="filter-select">
                <option value="default">Par défaut</option>
                <option value="price-asc">Prix ↑</option>
                <option value="price-desc">Prix ↓</option>
                <option value="name-asc">Nom A-Z</option>
            </select>
        </div>
        <button id="filter-apply" class="btn btn-orange btn-sm">
            <i class="fa fa-filter"></i> Appliquer
        </button>
        <button id="filter-reset" class="btn btn-outline-secondary btn-sm ms-2">
            <i class="fa fa-times"></i> Réinitialiser
        </button>
    `;
    container.parentElement.insertBefore(filterPanel, container);

    document.getElementById('filter-apply')?.addEventListener('click', () => applyFilters(containerId));
    document.getElementById('filter-reset')?.addEventListener('click', () => resetFilters(containerId));
}

function applyFilters(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const minPrice = parseInt(document.getElementById('filter-min')?.value) || 0;
    const maxPrice = parseInt(document.getElementById('filter-max')?.value) || Infinity;
    const sortBy   = document.getElementById('filter-sort')?.value || 'default';

    const cards = Array.from(container.querySelectorAll('.col-md-3, .col-6'));

    cards.forEach(card => {
        const priceEl = card.querySelector('h4, .price-badge, .price-new');
        const priceText = priceEl ? priceEl.textContent.replace(/[^\d]/g, '') : '0';
        const price = parseInt(priceText) || 0;
        card.style.display = (price >= minPrice && price <= maxPrice) ? '' : 'none';
    });

    // Tri
    if (sortBy !== 'default') {
        const visible = cards.filter(c => c.style.display !== 'none');
        visible.sort((a, b) => {
            const pa = parseInt(a.querySelector('h4, .price-badge')?.textContent.replace(/[^\d]/g, '') || '0');
            const pb = parseInt(b.querySelector('h4, .price-badge')?.textContent.replace(/[^\d]/g, '') || '0');
            const na = a.querySelector('h3')?.textContent || '';
            const nb = b.querySelector('h3')?.textContent || '';
            if (sortBy === 'price-asc') return pa - pb;
            if (sortBy === 'price-desc') return pb - pa;
            if (sortBy === 'name-asc') return na.localeCompare(nb);
            return 0;
        });
        visible.forEach(c => container.appendChild(c));
    }
}

function resetFilters(containerId) {
    document.getElementById('filter-min').value = '';
    document.getElementById('filter-max').value = '';
    document.getElementById('filter-sort').value = 'default';
    const container = document.getElementById(containerId);
    if (container) {
        container.querySelectorAll('.col-md-3, .col-6').forEach(c => c.style.display = '');
    }
}


// ═══════════════════════════════════════════════════════════════════
// 8. TOAST NOTIFICATIONS (version features.js, sans import Firebase)
// ═══════════════════════════════════════════════════════════════════

export function showFeatureToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast-custom ${type}`;
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
    toast.innerHTML = `<i class="fa ${icons[type] || 'fa-check-circle'}"></i><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}


// ═══════════════════════════════════════════════════════════════════
// 9. INITIALISATION GLOBALE
// ═══════════════════════════════════════════════════════════════════

export function initAllFeatures(options = {}) {
    const {
        whatsappPhone   = '22900000000',
        whatsappMsg     = 'Bonjour Primvo ! Je souhaite des informations sur vos produits.',
        enableLoader    = true,
        enableDarkMode  = true,
        enableWhatsApp  = true,
        enableWishlist  = true,
        enableReviews   = true,
    } = options;

    if (enableLoader)   initLoader();
    if (enableDarkMode) initDarkMode();
    if (enableWhatsApp) initWhatsApp(whatsappPhone, whatsappMsg);
    if (enableWishlist) initWishlist();
    if (enableReviews)  initReviewInteractions();
}
