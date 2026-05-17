/**
 * UI Manager - Gère les interactions visuelles du site Primvo
 */

document.addEventListener('DOMContentLoaded', () => {
    initMenu();
    initScrollReveal();
});

/**
 * Gestion du menu mobile
 * CORRECTION : Utilisation de la classe CSS .open (compatible avec le CSS)
 * au lieu de style.display qui entre en conflit avec position:fixed du menu
 */
function initMenu() {
    const menuBtn = document.getElementById("menu-btn");
    const closeBtn = document.getElementById("close-btn");
    const sideMenu = document.getElementById("side-menu");
    const overlay   = document.getElementById("menu-overlay");

    // Définition globale utilisée par les onclick HTML inline des pages
    window.openmenu = () => {
        if (sideMenu)  sideMenu.classList.add("open");       // CSS gère left:0
        if (overlay)   overlay.style.display = "block";
        if (menuBtn)   menuBtn.style.display  = "none";
        if (closeBtn)  closeBtn.style.display = "inline-block";
    };

    window.closemenu = () => {
        if (sideMenu)  sideMenu.classList.remove("open");    // CSS revient à left:-300px
        if (overlay)   overlay.style.display = "none";
        if (menuBtn)   menuBtn.style.display  = "inline-block";
        if (closeBtn)  closeBtn.style.display = "none";
    };

    // Listener direct sur le bouton hamburger (fallback robuste pour mobile)
    if (menuBtn) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.openmenu();
        });
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.closemenu();
        });
    }
    // Fermeture en cliquant sur l'overlay
    if (overlay) {
        overlay.addEventListener('click', () => window.closemenu());
    }
}

/**
 * Animation d'apparition au défilement (Scroll Reveal)
 */
function initScrollReveal() {
    const reveals = document.querySelectorAll(".reveal");
    
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 100;

        reveals.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                element.classList.add("active");
            }
        });
    };

    window.addEventListener("scroll", revealOnScroll);
    revealOnScroll(); // Appel initial
}

/**
 * Toast Notification professionnelle
 */
export function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast-custom ${type}`;
    toast.innerHTML = `
        <i class="fa ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
    return container;
}
