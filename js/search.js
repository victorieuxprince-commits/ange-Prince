// js/search.js

export function setupSearch() {
    const searchInput = document.querySelector('.top-nav-bar input');
    const searchBtn = document.querySelector('.top-nav-bar .input-group-text');

    if (!searchInput || !searchBtn) return;

    const performSearch = () => {
        const query = searchInput.value.trim();
        if (query.length > 0) {
            // Déterminer le chemin vers results.html en fonction de la page actuelle
            const isSubPage = window.location.pathname.includes('/page/');
            const resultsPath = isSubPage ? 'results.html' : 'page/results.html';
            window.location.href = `${resultsPath}?q=${encodeURIComponent(query)}`;
        }
    };

    searchBtn.addEventListener('click', performSearch);
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

// Initialisation automatique si nécessaire
document.addEventListener('DOMContentLoaded', setupSearch);
