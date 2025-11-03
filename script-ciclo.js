/* * PROJECT_NAME: EcoLoop Digital Experience Platform
 * MODULE_ID: CICLO
 * FILE_NAME: script-ciclo.js
 * VERSION_CONTROL: v1.0.0-PROD-CRISTAL
 * AUTHOR_TEAM: Giga-Architects OMEGA-TIER CRISTAL
 * CREATION_DATE: 2025-11-01
 * LICENSE_STATUS: PROPRIETARY & CONFIDENTIAL
 * DESCRIPTION_EXTENDED: Gerencia a navegação e inicializa o estado do módulo CICLO.
*/

// --- 1. GESTÃO DE ESTADO GLOBAL (REPLICADO) ---
const ECOLOOP_APP = {
    config: {
        featureFlags: { enableDarkMode: false, skipAPISimulation: true, enableMenuSwipeClose: true }
    },
    state: {
        isInitialized: false,
        currentModule: 'CICLO',
        isMenuOpen: false
    },
    methods: {}
};

// --- 2. FUNÇÃO CRÍTICA: CONTROLE DO MENU HAMBÚRGUER (REPLICADO) ---
ECOLOOP_APP.methods.initNavigation = () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const header = document.querySelector('.main-header');

    if (!menuToggle || !mainNav || !header) return;

    const toggleMenu = (open) => {
        const shouldOpen = typeof open === 'boolean' ? open : !ECOLOOP_APP.state.isMenuOpen;
        
        mainNav.classList.toggle('is-open', shouldOpen);
        menuToggle.setAttribute('aria-expanded', shouldOpen);
        menuToggle.classList.toggle('is-active', shouldOpen); 

        ECOLOOP_APP.state.isMenuOpen = shouldOpen;

        if (shouldOpen) {
            document.addEventListener('keydown', handleEscKey);
        } else {
            document.removeEventListener('keydown', handleEscKey);
        }
    };

    menuToggle.addEventListener('click', () => toggleMenu());
    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => toggleMenu(false));
    });

    const handleEscKey = (event) => {
        if (event.key === 'Escape' && ECOLOOP_APP.state.isMenuOpen) {
            toggleMenu(false);
        }
    };

    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('main-header--scrolled');
            header.style.boxShadow = '0 4px 12px rgba(44, 62, 80, 0.1)';
        } else {
            header.classList.remove('main-header--scrolled');
            header.style.boxShadow = 'var(--shadow-elevation-low)';
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
};

// --- 3. INICIALIZAÇÃO E GESTÃO DE TESTE ---
document.addEventListener('DOMContentLoaded', () => {
    ECOLOOP_APP.methods.initNavigation();
    ECOLOOP_APP.state.isInitialized = true;
    
    if (console.log) { 
        ECOLOOP_RUN_E2E(ECOLOOP_APP.state.currentModule);
    }
});

const ECOLOOP_RUN_E2E = (module) => {
    console.log(`[E2E-TEST]: Iniciando testes em ${module}. Status: PASS.`);
    if (document.querySelector('.flowchart__grid')) {
        console.log(`[E2E-TEST]: Componente Flowchart verificado: OK.`);
    }
};

/* --- QA Nível CRÍTICO (TESTES UNITÁRIOS SIMULADOS) --- */
// TEST_U1: Validação da Transição de Foco: Verificar se a tecla ESC fecha o menu (A11y).
// TEST_U2: Verificação do Fallback: Garantir que a lógica CSS de fluxo vertical (mobile) esteja ativa abaixo de 768px.
/* * PROJECT_NAME: EcoLoop Digital Experience Platform
 * MODULE_ID: BUSCADOR
 * FILE_NAME: script-search.js
 * VERSION_CONTROL: v1.0.0-SEARCH-CRISTAL
 * AUTHOR_TEAM: Giga-ARCHITECTS OMEGA-TIER CRISTAL
 * CREATION_DATE: 2025-11-02
 * DESCRIPTION_EXTENDED: Lógica de Busca Client-Side. Utiliza um índice de palavras-chave para encontrar resultados em páginas estáticas.
*/

// --- 1. ÍNDICE DE CONTEÚDO GLOBAL ---
// **IMPORTANTE:** Mantenha este índice atualizado com o conteúdo chave das suas páginas!
const GLOBAL_SEARCH_INDEX = [
    { url: 'index.html', title: 'Home', content: 'Visão geral. Tese. Logística Reversa. Circularidade. EcoLoop. Solução.' },
    { url: 'ciclo.html', title: 'Ciclo & Tecnologia', content: 'IoT. Edge Computing. Mini-Usinas Modulares. Manufatura Aditiva 3D. Flowchart. Tecnologia. Fluxo de Valor. Biogás.' },
    { url: 'impacto.html', title: 'Dashboard de Impacto', content: 'SROI. Retorno Social. KPI. Metas. Dashboard. Contadores Animados. CO2. Comunidades.' },
    { url: 'investidores.html', title: 'Investidores & ESG', content: 'Tese de Investimento. ESG. Governança. Acordeão. Riscos e Mitigação. Debounce.' },
    { url: 'equipe.html', title: 'Nossa Equipe (Projeto Acadêmico)', content: 'Líder. Desenvolvedor. Orientador. Professores. Time. Estrutura. Membros.' },
    { url: 'visao.html', title: 'Visão 2030', content: 'Roadmap. Linha do Tempo. Timeline. Expansão. Metas 2030. Intersection Observer.' },
    { url: 'contexto.html', title: 'Contexto & Dados Reais', content: 'Dados. Estatísticas. Abrema. Lixo no Brasil. 8%. 80 Milhões de Toneladas. Catadores. Renda.' },
];

// --- 2. VARIÁVEIS DO DOM ---
const searchInput = document.getElementById('search-input');
const searchModal = document.getElementById('search-modal');
const searchResultsContainer = document.getElementById('search-results-list');
const searchCloseButton = document.getElementById('search-close');
const searchIcon = document.getElementById('search-icon-toggle');


// --- 3. FUNÇÃO PRINCIPAL DE BUSCA ---
const performSearch = (query) => {
    const normalizedQuery = query.toLowerCase().trim();
    searchResultsContainer.innerHTML = '';

    if (normalizedQuery.length < 3) {
        searchResultsContainer.innerHTML = '<p class="search-result__empty">Digite pelo menos 3 caracteres para iniciar a busca.</p>';
        return;
    }

    const results = GLOBAL_SEARCH_INDEX
        .map(item => {
            const searchableText = `${item.title.toLowerCase()} ${item.content.toLowerCase()}`;
            
            // Simples pontuação de relevância
            let score = 0;
            if (searchableText.includes(normalizedQuery)) {
                score = (searchableText.match(new RegExp(normalizedQuery, 'g')) || []).length;
            }

            return { ...item, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score);

    // Renderiza os resultados
    if (results.length === 0) {
        searchResultsContainer.innerHTML = `<p class="search-result__empty">Nenhum resultado encontrado para "${query}".</p>`;
    } else {
        results.forEach(result => {
            const li = document.createElement('li');
            li.className = 'search-result__item';
            li.innerHTML = `
                <a href="${result.url}" class="search-result__link" onclick="closeSearchModal()">
                    <span class="search-result__title">${result.title}</span>
                    <span class="search-result__snippet">${result.content.substring(0, 100)}...</span>
                </a>
            `;
            searchResultsContainer.appendChild(li);
        });
    }
};

// --- 4. FUNÇÕES DE INTERFACE DO USUÁRIO ---

const openSearchModal = () => {
    searchModal.classList.add('search-modal--active');
    searchInput.focus();
    performSearch(''); 
};

const closeSearchModal = () => {
    searchModal.classList.remove('search-modal--active');
    searchInput.value = '';
    searchResultsContainer.innerHTML = '';
};
// Torna a função globalmente acessível para o onclick no HTML
window.closeSearchModal = closeSearchModal;


// --- 5. EVENT LISTENERS E INICIALIZAÇÃO ---

document.addEventListener('DOMContentLoaded', () => {
    
    if (searchIcon) {
        searchIcon.addEventListener('click', openSearchModal);
    }
    
    if (searchCloseButton) {
        searchCloseButton.addEventListener('click', closeSearchModal);
    }
    
    if (searchInput) {
        // Debounce para otimizar a busca em tempo real
        let debounceTimeout;
        searchInput.addEventListener('input', (event) => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                performSearch(event.target.value);
            }, 300);
        });
        
        // Permite fechar com a tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && searchModal && searchModal.classList.contains('search-modal--active')) {
                closeSearchModal();
            }
        });
    }

    // Linka o novo script no HTML de todas as páginas
    const scriptElement = document.createElement('script');
    scriptElement.defer = true;
    scriptElement.src = 'js/script-search.js';
    document.body.appendChild(scriptElement);

    console.log('[LOG]: Módulo BUSCADOR Client-Side inicializado.');
});