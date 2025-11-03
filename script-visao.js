/* * PROJECT_NAME: EcoLoop Digital Experience Platform
 * MODULE_ID: VISAO
 * FILE_NAME: script-visao.js
 * VERSION_CONTROL: v1.0.0-PROD-CRISTAL
 * AUTHOR_TEAM: Giga-ARCHITECTS OMEGA-TIER CRISTAL
 * CREATION_DATE: 2025-11-01
 * LICENSE_STATUS: PROPRIETARY & CONFIDENTIAL
 * DEPENDENCIES_EXTERNAL: Intersection Observer API
 * DESCRIPTION_EXTENDED: Gerencia a Linha do Tempo Animada (Timeline) de 2025 a 2030, usando Intersection Observer para animar o progresso na rolagem.
*/

// --- 1. GESTÃO DE ESTADO GLOBAL (REPLICADO) ---
const ECOLOOP_APP = {
    config: {
        featureFlags: { enableDarkMode: false, skipAPISimulation: true, observerThreshold: 0.15 } 
    },
    state: {
        isInitialized: false,
        currentModule: 'VISAO',
        isMenuOpen: false
    },
    methods: {}
};

// --- 2. FUNÇÃO CRÍTICA: CONTROLE DA TIMELINE ANIMADA ---
ECOLOOP_APP.methods.initTimelineAnimation = () => {
    const items = document.querySelectorAll('.timeline-item');
    const timelineContainer = document.querySelector('.timeline-container');
    const progressLine = document.getElementById('timeline-progress-line');
    const observerStatus = document.getElementById('observer-status');

    if (!items.length || !timelineContainer || !progressLine) return;

    // Calcula a altura da linha de progresso dinamicamente
    const updateProgressLine = () => {
        // Encontra o último item visível
        const lastVisibleItem = Array.from(items).reverse().find(item => item.classList.contains('in-view'));

        if (!lastVisibleItem) {
            // Se nenhum item estiver visível (topo da página), a altura é zero
            progressLine.style.height = '0px';
            return;
        }

        // Posição do topo do contêiner em relação à viewport
        const containerTop = timelineContainer.getBoundingClientRect().top + window.scrollY;
        
        // Posição do centro do dot do último item visível
        const dot = lastVisibleItem.querySelector('.timeline-dot');
        const dotTop = dot.getBoundingClientRect().top + window.scrollY;

        // Altura: da base do contêiner (containerTop) até o centro do dot (dotTop)
        // Subtrai containerTop para obter a altura relativa
        const newHeight = dotTop - containerTop + (dot.offsetHeight / 2);

        progressLine.style.height = `${newHeight}px`;
    };
    
    // Configuração do Intersection Observer
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Item entrou na viewport
                entry.target.classList.add('in-view');
                observerStatus.textContent = `[Status: ${entry.target.dataset.year} visível. Animando...]`;
                
                // CRÍTICO: Recalcula o progresso da linha toda vez que um novo item entra
                updateProgressLine();
                
                // Opcional: Desobservar após a primeira visualização para otimização
                // observer.unobserve(entry.target); 
            } else {
                // Item saiu da viewport (Se for necessário resetar a animação, o que não é o caso aqui)
            }
        });
    }, {
        root: null, // viewport como root
        threshold: ECOLOOP_APP.config.featureFlags.observerThreshold // 15% do item visível
    });

    // Observa todos os itens da timeline
    items.forEach(item => observer.observe(item));

    // Garante que a linha de progresso é atualizada se a rolagem continuar
    window.addEventListener('scroll', updateProgressLine);
    window.addEventListener('resize', updateProgressLine);
    
    // Atualização inicial (em caso de carregamento no meio da página)
    updateProgressLine();
};


// --- 3. INICIALIZAÇÃO DO MÓDULO ---
document.addEventListener('DOMContentLoaded', () => {
    // 3.1. Inicializa a navegação (omitida por brevidade)
    // ...

    // 3.2. Inicializa a animação da timeline
    ECOLOOP_APP.methods.initTimelineAnimation();

    ECOLOOP_APP.state.isInitialized = true;
    
    if (console.log) { 
        ECOLOOP_RUN_E2E(ECOLOOP_APP.state.currentModule);
    }
});

const ECOLOOP_RUN_E2E = (module) => {
    console.log(`[E2E-TEST]: Iniciando testes em ${module}. Status: PENDENTE (Requer Rolagem).`);
    // Teste de Componente Timeline: Verificar se a classe 'in-view' é adicionada ao rolar.
    // Teste de Performance: O Intersection Observer deve estar ativo.
    
    setTimeout(() => {
        // Simulação de rolagem para disparar o primeiro item
        window.scrollTo(0, 100); 
        console.log("[E2E-TEST]: Simulação de rolagem iniciada. Verifique se o item 2025 está animado.");
    }, 1000);
};

/* --- QA Nível CRÍTICO (TESTES UNITÁRIOS SIMULADOS) --- */
// TEST_U1: Teste de Interseção: Verificar se a classe 'in-view' é adicionada ao primeiro item (2025) após a rolagem.
// TEST_U2: Teste de Layout Responsivo: Garantir que a linha de progresso (left: 50%) se mantém centralizada em todas as larguras.
// TEST_U3: Teste de Performance: A função updateProgressLine não deve ser chamada sem a Intersection Observer.

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