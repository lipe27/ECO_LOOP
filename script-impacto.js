/* * PROJECT_NAME: EcoLoop Digital Experience Platform
 * MODULE_ID: IMPACTO
 * FILE_NAME: script-impacto.js
 * VERSION_CONTROL: v1.0.0-PROD-CRISTAL
 * AUTHOR_TEAM: Giga-ARCHITECTS OMEGA-TIER CRISTAL
 * CREATION_DATE: 2025-11-01
 * LICENSE_STATUS: PROPRIETARY & CONFIDENTIAL
 * DESCRIPTION_EXTENDED: Gerencia a simulação de API, o contador animado (easing) e o tratamento de erro CRÍTICO.
*/

// --- 1. GESTÃO DE ESTADO GLOBAL (REPLICADO) ---
const ECOLOOP_APP = {
    config: {
        // CRÍTICO: Use esta flag para forçar o erro e testar o RMP.
        featureFlags: { enableDarkMode: false, skipAPISimulation: false, forceApiError: false } 
    },
    state: {
        isInitialized: false,
        currentModule: 'IMPACTO',
        isMenuOpen: false,
        metricsLoaded: false
    },
    methods: {}
};

// --- 2. SIMULAÇÃO DE LÓGICA DE BACKEND (DataService) ---

// Estrutura de resposta simulada (Dados)
const FAKE_API_RESPONSE = {
    realtime: {
        plasticKg: { value: 5870, unit: 'kg', duration: 2500, decimals: 0 },
        co2Tons: { value: 12.45, unit: 't', duration: 3000, decimals: 2 },
        productsUnits: { value: 350000, unit: 'unid.', duration: 2000, decimals: 0 }
    },
    qualitative: {
        communities: { value: 24, label: 'Comunidades Mapeadas' },
        trainingHours: { value: 12000, label: 'Horas de Treinamento Comunitário' }
    }
};

const DataService = {
    fetch: async (endpoint) => {
        return new Promise((resolve, reject) => {
            const latency = 1500; // Latência de 1.5s
            
            setTimeout(() => {
                // CRÍTICO: Lógica de Forçar Erro
                if (ECOLOOP_APP.config.featureFlags.forceApiError) {
                    console.error("[RMP-002]: Erro de API forçado. Rejeitando a Promise.");
                    return reject(new Error('Simulação de falha de conexão ou timeout.'));
                }
                
                if (endpoint === '/api/v2/metrics/realtime') {
                    resolve(FAKE_API_RESPONSE.realtime);
                } else if (endpoint === '/api/v2/metrics/qualitative') {
                    resolve(FAKE_API_RESPONSE.qualitative);
                } else {
                    reject(new Error('Endpoint não encontrado no mock.'));
                }
            }, latency * (ECOLOOP_APP.config.featureFlags.skipAPISimulation ? 0 : 1));
        });
    }
};

// --- 3. CONTADOR ANIMADO AVANÇADO (Cubic-Bezier Easing) ---
ECOLOOP_APP.methods.animateCounter = ({ id, target, duration, decimals = 0 }) => {
    const element = document.getElementById(id);
    if (!element) return;
    
    let start = 0;
    const startTimestamp = performance.now();
    const step = (timestamp) => {
        const elapsed = timestamp - startTimestamp;
        // Função de Easing: Saída Rápida (Cubic-bezier(0.19, 1, 0.22, 1))
        const progress = Math.min(1, elapsed / duration);
        // Ajusta a velocidade inicial para aceleração suave
        const easedProgress = 1 - Math.pow(1 - progress, 3); 
        
        const currentValue = start + (target - start) * easedProgress;
        
        // Formatação do número
        element.textContent = currentValue.toFixed(decimals).replace('.', ',');
        
        if (elapsed < duration) {
            window.requestAnimationFrame(step);
        } else {
            // Garante o valor final exato
            element.textContent = target.toFixed(decimals).replace('.', ',');
        }
    };
    
    window.requestAnimationFrame(step);
};

// --- 4. FUNÇÃO CRÍTICA DE CARREGAMENTO DE DADOS ---
ECOLOOP_APP.methods.fetchDashboardData = async () => {
    const spinner = document.querySelector('.impacto-dashboard__spinner-wrapper');
    const metricCards = document.querySelectorAll('.impacto-metric');
    
    spinner.style.display = 'flex'; // Mostrar spinner

    try {
        // Simulação de chamadas concorrentes (Promise.all)
        const [realtimeData, qualitativeData] = await Promise.all([
            DataService.fetch('/api/v2/metrics/realtime'),
            DataService.fetch('/api/v2/metrics/qualitative')
        ]);
        
        // 4.1. Processar dados em tempo real (Contadores)
        Object.entries(realtimeData).forEach(([key, metric]) => {
            ECOLOOP_APP.methods.animateCounter({
                id: `counter-${key}`,
                target: metric.value,
                duration: metric.duration,
                decimals: metric.decimals
            });
            // Opcional: Atualizar a unidade se viesse da API
            document.querySelector(`#counter-${key}`).nextElementSibling.textContent = metric.unit;
        });

        // 4.2. Processar dados qualitativos (Badges)
        Object.entries(qualitativeData).forEach(([key, metric]) => {
            const badgeValueEl = document.querySelector(`.badge-item[data-badge-id="${key}"] .badge-item__value`);
            if (badgeValueEl) {
                // Simplesmente injeta o valor para métricas não animadas
                badgeValueEl.textContent = metric.value.toLocaleString('pt-BR');
            }
        });
        
        // 4.3. Sucesso: Esconder spinner e mostrar métricas
        spinner.style.opacity = 0;
        setTimeout(() => {
            spinner.style.display = 'none';
            metricCards.forEach(card => card.classList.add('is-loaded'));
            ECOLOOP_APP.state.metricsLoaded = true;
        }, 500); // Espera a transição de opacidade

    } catch (error) {
        console.error("Erro ao carregar dashboard:", error.message);
        // RMP CRÍTICO: Exibir banner de erro
        document.getElementById('alert-api-error').style.display = 'block';
        
        spinner.style.display = 'none';
        
        // Fallback: Mostrar cards com valores de 0
        metricCards.forEach(card => card.classList.add('is-loaded'));
    }
};


// --- 5. INICIALIZAÇÃO DO MÓDULO ---
document.addEventListener('DOMContentLoaded', () => {
    // 5.1. Inicializa a navegação (função replicada do Pacote 2)
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const header = document.querySelector('.main-header');

    if (menuToggle && mainNav && header) {
        // Inicialização da Navegação aqui (omitida para brevidade, mas deve ser copiada da pág. 2)
    }

    // 5.2. Inicia o carregamento de dados
    ECOLOOP_APP.methods.fetchDashboardData();
    ECOLOOP_APP.state.isInitialized = true;
    
    // 5.3. Hook de Teste E2E
    if (console.log) { 
        ECOLOOP_RUN_E2E(ECOLOOP_APP.state.currentModule);
    }
});

const ECOLOOP_RUN_E2E = (module) => {
    console.log(`[E2E-TEST]: Iniciando testes em ${module}. Status: PENDENTE.`);
    // Teste E2E deve ser finalizado APÓS o carregamento da API simulada.
    setTimeout(() => {
        if (ECOLOOP_APP.state.metricsLoaded) {
             console.log(`[E2E-TEST]: Dashboard carregado e contadores iniciados: OK.`);
        } else {
             console.log(`[E2E-TEST]: Dashboard falhou no carregamento (RMP ativado).`);
        }
    }, 4000); // Espera o tempo de API + animação

};

/* --- QA Nível CRÍTICO (TESTES UNITÁRIOS SIMULADOS) --- */
// TEST_U1: Teste de Formatação de Decimal: Garantir que o contador co2Tons use vírgula (12,45).
// TEST_U2: Teste de Concorrência: Verificar se o Promise.all resolve ambos os endpoints antes de esconder o spinner.
// TEST_U3: Teste de Resiliência: Forçar 'forceApiError: true' e verificar se o #alert-api-error aparece.
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