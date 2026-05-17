/**
 * Product Manager - Gère l'affichage dynamique et les détails des produits
 */

export const PRODUCTS_DATA = [
    // --- PROMOTIONS ---
    {
        id: 'promo-1',
        name: 'Montre Fitness Pro',
        price: 12000,
        oldPrice: 20000,
        discount: 40,
        category: 'Promotions',
        subCategory: 'Offre du jour',
        image: 'Images/montre connecter 2.jpg',
        description: 'Une montre connectée élégante avec suivi cardiaque et GPS intégré.',
        stock: 15,
        rating: 4.5,
        bestSeller: true
    },
    {
        id: 'promo-2',
        name: 'Chaussures Lax Sport',
        price: 15000,
        oldPrice: 22000,
        discount: 30,
        category: 'Promotions',
        subCategory: 'Flash sale',
        image: 'Images/chaussure2.jpg',
        description: 'Baskets ultra-légères pour un confort optimal durant vos sessions de sport.',
        stock: 8,
        rating: 4.8
    },
    {
        id: 'promo-3',
        name: 'Montre Fitness Lite',
        price: 13000,
        oldPrice: 18000,
        discount: 25,
        category: 'Promotions',
        subCategory: 'Nouveautés',
        image: 'Images/montre connecter 3.jpg',
        description: 'Version légère de notre best-seller, idéale pour le quotidien.',
        stock: 12,
        rating: 4.2
    },
    {
        id: 'promo-4',
        name: 'Chaussures Premium Black',
        price: 16000,
        oldPrice: 25000,
        discount: 35,
        category: 'Promotions',
        subCategory: 'Liquidation',
        image: 'Images/chaussure4.jpg',
        description: 'Élégance et robustesse réunies dans cette paire de chaussures haut de gamme.',
        stock: 5,
        rating: 4.7
    },

    // --- MOBILES ---
    {
        id: 'mobile-1',
        name: 'iPhone 15 Pro Max',
        price: 850000,
        category: 'Mobiles',
        subCategory: 'Smartphones',
        image: 'Images/images/product-4.jpg',
        description: 'Le dernier iPhone avec processeur A17 Pro et système photo pro.',
        stock: 5,
        rating: 5.0,
        bestSeller: true
    },
    {
        id: 'mobile-2',
        name: 'Casque Bluetooth Hi-Fi',
        price: 25000,
        category: 'Mobiles',
        subCategory: 'Accessoires',
        image: 'Images/casque.jpg',
        description: 'Un son cristallin et une réduction de bruit active pour une immersion totale.',
        stock: 20,
        rating: 4.6
    },

    // --- COMPUTERS ---
    {
        id: 'comp-1',
        name: 'MacBook Air M2',
        price: 750000,
        category: 'Computers',
        subCategory: 'Laptops',
        image: 'Images/images/image_1.jpg',
        description: 'La puissance de la puce M2 dans un design ultra-fin et léger.',
        stock: 10,
        rating: 4.9
    },

    // --- VETEMENTS ---
    {
        id: 'vet-1',
        name: 'Veste Stylée Homme',
        price: 35000,
        category: 'Vêtements',
        subCategory: 'Homme',
        image: 'Images/images/choose-3.jpg',
        description: 'Veste moderne pour un look décontracté et élégant.',
        stock: 15,
        rating: 4.4,
        bestSeller: true
    },

    // --- CHAUSSURES ---
    {
        id: 'sh-1',
        name: 'Baskets Run Speed',
        price: 18000,
        category: 'Chaussures',
        subCategory: 'Baskets',
        image: 'Images/chaussure1.jpg',
        description: 'Conçues pour la performance et le style.',
        stock: 25,
        rating: 4.3
    },
    {
        id: 'sh-2',
        name: 'Chaussures Urban Style',
        price: 22000,
        category: 'Chaussures',
        subCategory: 'Chaussures de ville',
        image: 'Images/chaussure3.jpg',
        description: 'Le parfait équilibre entre confort urbain et design chic.',
        stock: 14,
        rating: 4.5
    },

    // --- ACCESSOIRES ---
    {
        id: 'acc-1',
        name: 'Montre Classique Or',
        price: 45000,
        category: 'Accessoires',
        subCategory: 'Montres',
        image: 'Images/montre.jpg',
        description: 'Une touche de luxe à votre poignet avec cette montre intemporelle.',
        stock: 7,
        rating: 4.8
    },
    {
        id: 'mobile-3',
        name: 'Samsung Galaxy S24',
        price: 650000,
        category: 'Mobiles',
        subCategory: 'Smartphones',
        image: 'Images/m2.jpg',
        description: 'L\'excellence Android avec intelligence artificielle intégrée.',
        stock: 8,
        rating: 4.9
    },
    {
        id: 'acc-2',
        name: 'Sac à Dos Premium',
        price: 28000,
        category: 'Accessoires',
        subCategory: 'Sacs',
        image: 'Images/m1.jpg',
        description: 'Idéal pour transporter votre ordinateur avec style et sécurité.',
        stock: 12,
        rating: 4.7,
        bestSeller: true
    }
];


/**
 * Récupère un produit par son ID
 */
export function getProductById(id) {
    return PRODUCTS_DATA.find(p => p.id === id);
}

/**
 * Récupère un produit par son ID (via URL params)
 */
export function getProductFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    return getProductById(id);
}

/**
 * CORRECTION : Récupère les produits par catégorie depuis PRODUCTS_DATA
 * Cette fonction était importée dans plusieurs sous-pages mais n'existait pas.
 * @param {string} category - Nom de la catégorie
 * @returns {Array} - Liste des produits filtrés
 */
export function getProductsByCategory(category) {
    return PRODUCTS_DATA.filter(p => p.category === category);
}

import { db } from "../firebase.js";
import { collection, getDocs, query, limit, startAfter, orderBy, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


let lastVisibleProduct = null;

/**
 * Affiche des squelettes de chargement
 */
export function renderSkeletons(containerId, count = 4) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = Array(count).fill(0).map(() => `
        <div class="col-md-3 col-6 mb-4">
            <div class="product-card">
                <div class="skeleton skeleton-card"></div>
                <div class="skeleton skeleton-text" style="width: 60%; margin: 10px auto;"></div>
                <div class="skeleton skeleton-text" style="width: 40%; margin: 0 auto;"></div>
            </div>
        </div>
    `).join('');
}

/**
 * Charge les produits par lots (pagination)
 */
export async function fetchProductsPaged(pageSize = 8, category = null) {
    try {
        if (!db) throw new Error("Firebase non configuré");
        
        let q;
        const productsCol = collection(db, "products");
        
        if (category) {
            q = query(
                productsCol,
                where("category", "==", category),
                orderBy("createdAt", "desc"),
                limit(pageSize)
            );
        } else {
            q = query(
                productsCol,
                orderBy("createdAt", "desc"),
                limit(pageSize)
            );
        }

        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return category ? PRODUCTS_DATA.filter(p => p.category === category) : PRODUCTS_DATA;
        }

        lastVisibleProduct = querySnapshot.docs[querySnapshot.docs.length - 1];
        
        const products = [];
        querySnapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() });
        });
        return products;
    } catch (e) {
        console.warn("Backend non disponible, utilisation du fallback statique.");
        return category ? PRODUCTS_DATA.filter(p => p.category === category) : PRODUCTS_DATA;
    }
}

/**
 * Rendu optimisé des produits avec gestion du DOM immédiate
 */
export function renderProducts(products, containerId, isSubPage = false) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!products || products.length === 0) {
        container.innerHTML = '<div class="col-12 text-center py-5"><p>Aucun produit disponible.</p></div>';
        return;
    }
    
    const basePath = isSubPage ? './produit.html' : './page/produit.html';
    const imagePrefix = isSubPage ? '../' : '';

    const html = products.map(product => {
        if (!product) return '';
        const imageUrl = product.image ? encodeURI(`${imagePrefix}${product.image}`) : 'https://via.placeholder.com/300x300?text=Image+Indisponible';

        const price = product.price || 0;
        
        return `
        <div class="col-md-3 col-6 mb-4">
            <div class="product-card reveal active">
                <div class="product-top" onclick="window.location.href='${basePath}?id=${product.id}'" style="cursor: pointer;">
                    <img src="${imageUrl}" alt="${product.name || 'Produit'}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x300?text=Produit'">
                    ${product.discount ? `<div class="promo-badge">-${product.discount}%</div>` : ''}
                    <div class="overlay-right">
                        <button class="btn btn-secondary" onclick="event.stopPropagation(); window.location.href='${basePath}?id=${product.id}'">
                            <i class="fa fa-eye"></i>
                        </button>
                        <button class="btn btn-secondary" onclick="event.stopPropagation(); typeof toggleWishlist === 'function' && toggleWishlist('${product.id}')">
                            <i class="fa fa-heart-o"></i>
                        </button>
                        <button class="btn btn-secondary btn-add-cart" data-id="${product.id}" data-product='${JSON.stringify(product).replace(/'/g, "&apos;")}'>
                            <i class="fa fa-shopping-cart"></i>
                        </button>
                    </div>
                </div>
                <div class="product-bottom text-center">
                    <h3 onclick="window.location.href='${basePath}?id=${product.id}'" style="cursor: pointer;">${product.name || 'Sans nom'}</h3>
                    <div class="price-container">
                        ${product.oldPrice ? `<span class="price-old text-decoration-line-through me-2 text-muted">${(parseFloat(product.oldPrice)).toLocaleString()} FCFA</span>` : ''}
                        <h4 class="text-orange fw-bold d-inline">${(parseFloat(price)).toLocaleString()} FCFA</h4>
                    </div>
                    <button class="btn btn-orange w-100 mt-3 btn-add-cart" data-id="${product.id}" data-product='${JSON.stringify(product).replace(/'/g, "&apos;")}'>
                        <i class="fa fa-shopping-cart me-2"></i> Commander
                    </button>
                </div>
            </div>
        </div>
    `;}).join('');

    container.innerHTML = html;
}



