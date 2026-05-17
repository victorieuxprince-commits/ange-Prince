import { auth, db } from "../firebase.js";
import { doc, setDoc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


/**
 * Gestionnaire de Panier Senior - Vanilla JS + Firebase
 */
export class CartManager {
    constructor() {
        this.cart = [];
        this.listeners = [];
        this.currentUser = null;
        this.unsubscribeFirestore = null;
        
        this.loadLocal();
        this.initAuthListener();
    }

    initAuthListener() {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                this.currentUser = user;
                await this.syncFromFirestore();
            } else {
                if (this.unsubscribeFirestore) this.unsubscribeFirestore();
                this.currentUser = null;
                this.loadLocal();
            }
            this.notify();
        });
    }

    loadLocal() {
        try {
            const saved = localStorage.getItem('primvo_cart');
            this.cart = saved ? JSON.parse(saved) : [];
        } catch (e) {
            this.cart = [];
        }
    }

    async syncFromFirestore() {
        if (!this.currentUser) return;
        const cartDoc = doc(db, "carts", this.currentUser.uid);
        
        this.unsubscribeFirestore = onSnapshot(cartDoc, (snapshot) => {
            if (snapshot.exists()) {
                this.cart = snapshot.data().items || [];
                this.saveLocal();
                this.notify();
            }
        });
    }

    /**
     * Ajout avec mise à jour immédiate de l'état local + rafraîchissement DOM
     */
    addItem(product) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity = (parseInt(existingItem.quantity) || 1) + 1;
        } else {
            this.cart.push({ ...product, quantity: 1 });
        }
        
        // --- MISE À JOUR IMMÉDIATE ---
        this.saveLocal(); 
        this.notify(); // Déclenche le rendu immédiat dans le DOM
        
        // --- SYNCHRO BACKEND ASYNCHRONE ---
        if (this.currentUser) {
            this.saveFirestore();
        }
    }

    removeItem(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveLocal();
        this.notify();
        if (this.currentUser) this.saveFirestore();
    }

    updateQuantity(productId, newQty) {
        const item = this.cart.find(i => i.id === productId);
        if (item) {
            item.quantity = Math.max(1, parseInt(newQty) || 1);
            this.saveLocal();
            this.notify();
            if (this.currentUser) this.saveFirestore();
        }
    }

    getTotal() {
        return this.cart.reduce((total, item) => total + (parseFloat(item.price) * parseInt(item.quantity)), 0);
    }

    saveLocal() {
        localStorage.setItem('primvo_cart', JSON.stringify(this.cart));
    }

    async saveFirestore() {
        if (!this.currentUser) return;
        try {
            await setDoc(doc(db, "carts", this.currentUser.uid), {
                items: this.cart,
                updatedAt: new Date()
            });
        } catch (e) {
            console.error("Firestore Error:", e);
        }
    }

    subscribe(callback) {
        this.listeners.push(callback);
        callback(this.cart);
    }

    notify() {
        this.listeners.forEach(callback => callback(this.cart));
    }

    get count() {
        return this.cart.reduce((sum, item) => sum + parseInt(item.quantity), 0);
    }
}

export const cartManager = new CartManager();



