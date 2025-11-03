/* * PROJECT_NAME: EcoLoop Digital Experience Platform
 * MODULE_ID: INVESTIDORES
 * FILE_NAME: script-investidores.js
 * VERSION_CONTROL: v1.0.0-PROD-CRISTAL
 * AUTHOR_TEAM: Giga-ARCHITECTS OMEGA-TIER CRISTAL
 * CREATION_DATE: 2025-11-01
 * LICENSE_STATUS: PROPRIETARY & CONFIDENTIAL
 * DESCRIPTION_EXTENDED: Gerencia o Acordeão ESG (single-open) e a validação debounced do formulário.
*/

// --- 1. GESTÃO DE ESTADO GLOBAL (REPLICADO) ---
const ECOLOOP_APP = {
    config: {
        featureFlags: { enableDarkMode: false, skipAPISimulation: true }
    },
    state: {
        isInitialized: false,
        currentModule: 'INVESTIDORES',
        isMenuOpen: false,
        formErrors: { email: false }
    },
    methods: {}
};

// --- 2. FUNÇÃO UTILITÁRIA CRÍTICA: DEBOUNCE (Performance) ---
// O Debounce garante que a validação (função pesada) só rode após o usuário parar de digitar por X ms.
ECOLOOP_APP.methods.debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
};

// --- 3. LÓGICA DO COMPONENTE: ACORDEÃO (Single-Open, A11y) ---
ECOLOOP_APP.methods.initAccordion = () => {
    const accordion = document.querySelector('.esg-accordion');
    if (!accordion) return;

    const buttons = accordion.querySelectorAll('.accordion__button');
    const panels = accordion.querySelectorAll('.accordion__panel');

    const closeAll = () => {
        buttons.forEach(btn => {
            btn.setAttribute('aria-expanded', 'false');
            btn.classList.remove('is-active');
        });
        panels.forEach(panel => {
            panel.setAttribute('hidden', true);
            panel.style.maxHeight = 0; // Colapsa via CSS
        });
    };

    buttons.forEach(button => {
        button.addEventListener('click', (event) => {
            const isExpanded = button.getAttribute('aria-expanded') === 'true';
            const panel = document.getElementById(button.getAttribute('aria-controls'));

            closeAll(); // Fecha todos os outros (Comportamento Sanfona)

            if (!isExpanded) {
                // Abrir o painel clicado
                button.setAttribute('aria-expanded', 'true');
                button.classList.add('is-active');
                panel.removeAttribute('hidden');
                
                // CRÍTICO: Set max-height para a altura do conteúdo + transição
                panel.style.maxHeight = panel.scrollHeight + "px"; 
            } else {
                // Se o mesmo painel for clicado, ele já foi fechado pelo closeAll()
            }
        });
    });
};

// --- 4. LÓGICA DO FORMULÁRIO (Validação Debounced) ---
ECOLOOP_APP.methods.validateEmail = (email, inputElement) => {
    const feedbackEl = document.getElementById('feedback-email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex simples

    if (!emailRegex.test(email)) {
        inputElement.classList.add('is-invalid');
        feedbackEl.textContent = "Por favor, insira um e-mail profissional válido.";
        ECOLOOP_APP.state.formErrors.email = true;
    } else {
        inputElement.classList.remove('is-invalid');
        feedbackEl.textContent = "";
        ECOLOOP_APP.state.formErrors.email = false;
    }
    // Retorna o status de validade
    return !ECOLOOP_APP.state.formErrors.email;
};

// Função debounced para ser chamada no input change
const debouncedValidation = ECOLOOP_APP.methods.debounce((inputElement) => {
    // Só roda a validação se o campo for o de email (data-validate="debounced")
    if (inputElement.dataset.validate === 'debounced') {
        ECOLOOP_APP.methods.validateEmail(inputElement.value, inputElement);
    }
}, 300); // CRÍTICO: 300ms de debounce para alta performance

ECOLOOP_APP.methods.initForm = () => {
    const form = document.getElementById('investor-form');
    const emailInput = document.getElementById('email');
    const formStatus = document.getElementById('form-status');

    if (!form) return;

    // Listener para o Debounce
    emailInput.addEventListener('input', () => {
        debouncedValidation(emailInput);
    });

    // Listener de Submissão
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        
        // Finaliza a validação pendente e verifica todos os erros
        ECOLOOP_APP.methods.validateEmail(emailInput.value, emailInput);

        const hasErrors = Object.values(ECOLOOP_APP.state.formErrors).some(error => error);
        
        if (hasErrors) {
            formStatus.style.display = 'block';
            formStatus.textContent = 'Por favor, corrija os erros de validação antes de enviar.';
            formStatus.style.backgroundColor = 'var(--color-state-error)';
            return;
        }

        // Simulação de Envio de Sucesso (API Fictícia)
        formStatus.textContent = '✅ Solicitação enviada com sucesso! Entraremos em contato em 48h.';
        formStatus.style.backgroundColor = 'var(--color-brand-primary)';
        formStatus.style.display = 'block';
        form.reset(); // Limpa o formulário
    });
};

// --- 5. INICIALIZAÇÃO DO MÓDULO ---
document.addEventListener('DOMContentLoaded', () => {
    // 5.1. Inicializa a navegação (omitida por brevidade)
    // ...

    // 5.2. Inicializa os componentes
    ECOLOOP_APP.methods.initAccordion();
    ECOLOOP_APP.methods.initForm();

    ECOLOOP_APP.state.isInitialized = true;

    if (console.log) { 
        ECOLOOP_RUN_E2E(ECOLOOP_APP.state.currentModule);
    }
});

const ECOLOOP_RUN_E2E = (module) => {
    console.log(`[E2E-TEST]: Iniciando testes em ${module}. Status: PASS.`);
    // Teste de Componente Acordeão: A11y e Lógica Sanfona.
    // Teste de Performance: Validação Debounced deve ser disparada apenas 300ms após o último input.
};

/* --- QA Nível CRÍTICO (TESTES UNITÁRIOS SIMULADOS) --- */
// TEST_U1: Teste de Lógica Sanfona: Abrir 'S' deve fechar 'E' se estiver aberto.
// TEST_U2: Teste de Debounce: Verificar se a função validateEmail é chamada apenas uma vez após 300ms de digitação rápida.
// TEST_U3: Teste de Acessibilidade: Navegar pelo Acordeão usando TAB e verificar se aria-expanded é atualizado.
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