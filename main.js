// Configuração do Supabase
const supabaseUrl = 'SUA_URL_SUPABASE';
const supabaseKey = 'SUA_CHAVE_SUPABASE';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Elementos do DOM
const sideMenu = document.querySelector('.side-menu');
const menuToggle = document.querySelector('.menu-toggle');
const closeMenu = document.querySelector('.close-menu');
const mainContent = document.querySelector('.main-content');
const themeToggle = document.getElementById('theme-toggle');
const introOverlay = document.getElementById('intro-overlay');
const entrarBtn = document.getElementById('entrar-btn');
const notificationBtn = document.getElementById('notification-btn');
const notificationsModal = document.getElementById('notifications-modal');
const closeModal = document.querySelector('.close-modal');
const surveyForm = document.getElementById('survey-form');
const reportForm = document.getElementById('report-form');
const exportBtn = document.getElementById('export-btn');

// Notificações
let notifications = [];

// Carregar tema salvo
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeToggle.checked = savedTheme === 'dark';

// Event Listeners
menuToggle.addEventListener('click', toggleMenu);
closeMenu.addEventListener('click', toggleMenu);
themeToggle.addEventListener('change', toggleTheme);
entrarBtn.addEventListener('click', hideIntro);
notificationBtn.addEventListener('click', showNotifications);
closeModal.addEventListener('click', () => notificationsModal.style.display = 'none');
window.addEventListener('click', (e) => {
    if (e.target === notificationsModal) {
        notificationsModal.style.display = 'none';
    }
});

// Formulários
if (surveyForm) {
    surveyForm.addEventListener('submit', handleSurveySubmit);
}

if (reportForm) {
    reportForm.addEventListener('submit', handleReportSubmit);
}

if (exportBtn) {
    exportBtn.addEventListener('click', exportData);
}

// Funções
function toggleMenu() {
    sideMenu.classList.toggle('active');
    mainContent.classList.toggle('shifted');
}

function toggleTheme() {
    const theme = themeToggle.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

function hideIntro() {
    introOverlay.classList.add('hidden');
    setTimeout(() => {
        introOverlay.style.display = 'none';
    }, 500);
}

function showNotifications() {
    updateNotificationBadge();
    renderNotifications();
    notificationsModal.style.display = 'block';
}

function updateNotificationBadge() {
    const unreadCount = notifications.filter(n => !n.read).length;
    const badge = document.querySelector('.notification-badge');
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? 'flex' : 'none';
}

function renderNotifications() {
    const container = document.getElementById('notifications-list');
    
    if (notifications.length === 0) {
        container.innerHTML = '<p>Nenhuma notificação no momento.</p>';
        return;
    }
    
    container.innerHTML = notifications.map(notification => `
        <div class="notification-item ${notification.read ? '' : 'unread'}">
            <h5>${notification.title}</h5>
            <p>${notification.message}</p>
            <small>${new Date(notification.date).toLocaleString()}</small>
        </div>
    `).join('');
    
    // Marcar como lidas
    notifications = notifications.map(n => ({...n, read: true}));
    updateNotificationBadge();
}

async function handleSurveySubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(surveyForm);
    const data = {
        faixa_etaria: formData.get('faixa_etaria'),
        escolaridade: formData.get('escolaridade'),
        genero: formData.get('genero'),
        conhecimento_direitos_humanos: parseInt(formData.get('conhecimento_direitos_humanos')),
        conhecimento_declaracao: formData.get('conhecimento_declaracao'),
        aplicacao_direitos_digital: formData.get('aplicacao_direitos_digital'),
        direitos_mais_ameacados: Array.from(formData.getAll('direitos_mais_ameacados')),
        preocupacao_dados: parseInt(formData.get('preocupacao_dados')),
        experiencia_negativa: formData.get('experiencia_negativa'),
        educacao_direitos_digital: formData.get('educacao_direitos_digital'),
        responsabilidade_protecao: Array.from(formData.getAll('responsabilidade_protecao')),
        regulamentacoes_suficientes: formData.get('regulamentacoes_suficientes'),
        preocupacao_ia: parseInt(formData.get('preocupacao_ia')),
        aspectos_preocupantes_ia: Array.from(formData.getAll('aspectos_preocupantes_ia'))
    };
    
    try {
        const { error } = await supabase
            .from('questionarios')
            .insert([data]);
            
        if (error) throw error;
        
        // Adicionar notificação
        addNotification('Questionário enviado', 'Obrigado por participar do nosso questionário sobre direitos digitais!');
        
        // Resetar formulário
        surveyForm.reset();
        
        // Atualizar dashboard
        updateDashboard();
        
        // Mostrar mensagem de sucesso
        alert('Questionário enviado com sucesso! Obrigado por sua participação.');
    } catch (error) {
        console.error('Erro ao enviar questionário:', error);
        alert('Ocorreu um erro ao enviar o questionário. Por favor, tente novamente.');
    }
}

async function handleReportSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(reportForm);
    const data = {
        tipo_violacao: formData.get('tipo_violacao'),
        descricao: formData.get('descricao'),
        faixa_etaria: formData.get('faixa_etaria') || null,
        genero: formData.get('genero') || null
    };
    
    try {
        const { error } = await supabase
            .from('relatos')
            .insert([data]);
            
        if (error) throw error;
        
        // Adicionar notificação
        addNotification('Relato enviado', 'Obrigado por compartilhar sua experiência. Seu relato foi registrado de forma anônima.');
        
        // Resetar formulário
        reportForm.reset();
        
        // Atualizar dashboard
        updateDashboard();
        
        // Mostrar mensagem de sucesso
        alert('Relato enviado com sucesso! Obrigado por sua contribuição.');
    } catch (error) {
        console.error('Erro ao enviar relato:', error);
        alert('Ocorreu um erro ao enviar o relato. Por favor, tente novamente.');
    }
}

function addNotification(title, message) {
    const newNotification = {
        id: Date.now(),
        title,
        message,
        date: new Date(),
        read: false
    };
    
    notifications.unshift(newNotification);
    updateNotificationBadge();
}

async function updateDashboard() {
    try {
        // Chamar a função do Supabase para obter estatísticas
        const { data, error } = await supabase
            .rpc('get_estatisticas');
            
        if (error) throw error;
        
        // Atualizar estatísticas
        document.getElementById('total-questionarios').textContent = data.total_questionarios || 0;
        document.getElementById('total-relatos').textContent = data.total_relatos || 0;
        document.getElementById('conhecimento-medio').textContent = data.conhecimento_medio ? data.conhecimento_medio.toFixed(1) : '0';
        document.getElementById('preocupacao-media').textContent = data.preocupacao_dados_media ? data.preocupacao_dados_media.toFixed(1) : '0';
        
        // Atualizar gráficos
        updateCharts(data);
    } catch (error) {
        console.error('Erro ao atualizar dashboard:', error);
    }
}

function updateCharts(data) {
    // Gráfico de tipos de violação
    const violationsCtx = document.getElementById('violations-chart').getContext('2d');
    const violationsData = data.violacoes_por_tipo ? Object.entries(data.violacoes_por_tipo) : [];
    
    if (window.violationsChart) {
        window.violationsChart.destroy();
    }
    
    if (violationsData.length > 0) {
        window.violationsChart = new Chart(violationsCtx, {
            type: 'bar',
            data: {
                labels: violationsData.map(item => item[0]),
                datasets: [{
                    label: 'Número de Relatos',
                    data: violationsData.map(item => item[1]),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(255, 159, 64, 0.7)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // Outros gráficos seriam atualizados de forma similar...
    // Implementação completa no arquivo chart.js
}

async function exportData() {
    try {
        // Obter dados do Supabase
        const { data: questionarios, error: qError } = await supabase
            .from('questionarios')
            .select('*');
            
        if (qError) throw qError;
        
        const { data: relatos, error: rError } = await supabase
            .from('relatos')
            .select('*');
            
        if (rError) throw rError;
        
        // Criar objeto com todos os dados
        const exportData = {
            questionarios: questionarios || [],
            relatos: relatos || [],
            exportDate: new Date().toISOString()
        };
        
        // Criar blob JSON
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Criar link de download
        const a = document.createElement('a');
        a.href = url;
        a.download = `dados-direitos-digitais-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Notificação
        addNotification('Dados exportados', 'Os dados foram exportados com sucesso em formato JSON.');
    } catch (error) {
        console.error('Erro ao exportar dados:', error);
        alert('Ocorreu um erro ao exportar os dados. Por favor, tente novamente.');
    }
}

// Quiz Interativo
function startQuiz() {
    const quizModal = document.getElementById('quiz-modal');
    const quizContainer = document.getElementById('quiz-container');
    
    const quizQuestions = [
        {
            question: "Qual destes NÃO é considerado um direito humano básico no ambiente digital?",
            options: [
                "Direito à privacidade",
                "Direito ao anonimato completo",
                "Direito à liberdade de expressão",
                "Direito à proteção contra discurso de ódio"
            ],
            correct: 1
        },
        {
            question: "O que é considerado cyberbullying?",
            options: [
                "Compartilhar memes na internet",
                "Práticas de intimidação, humilhação ou perseguição realizadas através de meios digitais",
                "Fazer compras online",
                "Usar redes sociais diariamente"
            ],
            correct: 1
        },
        {
            question: "Qual lei brasileira protege os dados pessoais dos cidadãos?",
            options: [
                "Lei do Direito Autoral",
                "Lei Geral de Proteção de Dados (LGPD)",
                "Lei do Software",
                "Lei de Crimes Digitais"
            ],
            correct: 1
        }
    ];
    
    let currentQuestion = 0;
    let score = 0;
    
    function showQuestion() {
        if (currentQuestion >= quizQuestions.length) {
            showResults();
            return;
        }
        
        const question = quizQuestions[currentQuestion];
        quizContainer.innerHTML = `
            <h4>Questão ${currentQuestion + 1} de ${quizQuestions.length}</h4>
            <p>${question.question}</p>
            <div class="quiz-options">
                ${question.options.map((option, index) => `
                    <label>
                        <input type="radio" name="quiz-answer" value="${index}">
                        ${option}
                    </label>
                `).join('')}
            </div>
            <div class="quiz-nav">
                ${currentQuestion > 0 ? '<button onclick="prevQuestion()">Anterior</button>' : '<button disabled>Anterior</button>'}
                <button onclick="nextQuestion()">${currentQuestion === quizQuestions.length - 1 ? 'Finalizar' : 'Próxima'}</button>
            </div>
        `;
    }
    
    function nextQuestion() {
        const selectedOption = document.querySelector('input[name="quiz-answer"]:checked');
        
        if (!selectedOption) {
            alert('Por favor, selecione uma opção antes de continuar.');
            return;
        }
        
        if (parseInt(selectedOption.value) === quizQuestions[currentQuestion].correct) {
            score++;
        }
        
        currentQuestion++;
        showQuestion();
    }
    
    function prevQuestion() {
        currentQuestion--;
        showQuestion();
    }
    
    function showResults() {
        const percentage = Math.round((score / quizQuestions.length) * 100);
        let message = '';
        
        if (percentage >= 80) {
            message = 'Excelente! Você demonstrou um ótimo conhecimento sobre direitos digitais.';
        } else if (percentage >= 50) {
            message = 'Bom! Você tem um conhecimento básico, mas pode aprender mais explorando nossos recursos.';
        } else {
            message = 'Continue aprendendo! Explore nossos recursos educacionais para melhorar seu conhecimento sobre direitos digitais.';
        }
        
        quizContainer.innerHTML = `
            <div class="quiz-result">
                <h3>Quiz Concluído!</h3>
                <p>Sua pontuação: ${score} de ${quizQuestions.length} (${percentage}%)</p>
                <p>${message}</p>
                <button onclick="closeQuiz()">Fechar</button>
                <button onclick="restartQuiz()">Tentar Novamente</button>
            </div>
        `;
    }
    
    window.nextQuestion = nextQuestion;
    window.prevQuestion = prevQuestion;
    window.closeQuiz = () => {
        quizModal.style.display = 'none';
    };
    window.restartQuiz = () => {
        currentQuestion = 0;
        score = 0;
        showQuestion();
    };
    
    showQuestion();
    quizModal.style.display = 'block';
}

// Simulador de Privacidade
function startPrivacySimulator() {
    const privacyModal = document.getElementById('privacy-modal');
    const privacySimulator = document.getElementById('privacy-simulator');
    
    privacySimulator.innerHTML = `
        <h3>Simulador de Configurações de Privacidade</h3>
        <p>Ajuste as configurações abaixo para ver como elas afetam sua segurança online:</p>
        
        <div class="privacy-setting">
            <label>
                <input type="checkbox" id="two-factor" checked>
                Autenticação em dois fatores
            </label>
            <p class="setting-info">Protege suas contas mesmo que sua senha seja comprometida.</p>
        </div>
        
        <div class="privacy-setting">
            <label>
                <input type="checkbox" id="data-sharing" checked>
                Compartilhamento de dados com terceiros
            </label>
            <p class="setting-info">Limita como empresas compartilham seus dados com anunciantes.</p>
        </div>
        
        <div class="privacy-setting">
            <label>
                <input type="checkbox" id="location" checked>
                Compartilhamento de localização
            </label>
            <p class="setting-info">Controla quais apps podem acessar sua localização.</p>
        </div>
        
        <div class="privacy-setting">
            <label>
                <input type="checkbox" id="cookies" checked>
                Cookies de rastreamento
            </label>
            <p class="setting-info">Limita como sites rastreiam sua navegação.</p>
        </div>
        
        <div class="privacy-result">
            <h4>Nível de Segurança:</h4>
            <div class="security-meter">
                <div class="meter-bar" id="meter-bar"></div>
            </div>
            <p id="security-feedback">Configurações ótimas! Sua privacidade está bem protegida.</p>
        </div>
        
        <button onclick="closePrivacySimulator()">Fechar</button>
    `;
    
    // Event listeners para as configurações
    const settings = ['two-factor', 'data-sharing', 'location', 'cookies'];
    settings.forEach(id => {
        document.getElementById(id).addEventListener('change', updateSecurityMeter);
    });
    
    function updateSecurityMeter() {
        const enabledSettings = settings.filter(id => document.getElementById(id).checked).length;
        const percentage = (enabledSettings / settings.length) * 100;
        const meterBar = document.getElementById('meter-bar');
        const feedback = document.getElementById('security-feedback');
        
        meterBar.style.width = `${percentage}%`;
        
        if (percentage >= 75) {
            meterBar.style.backgroundColor = '#34a853';
            feedback.textContent = 'Configurações ótimas! Sua privacidade está bem protegida.';
        } else if (percentage >= 50) {
            meterBar.style.backgroundColor = '#fbbc05';
            feedback.textContent = 'Configurações moderadas. Considere habilitar mais proteções.';
        } else {
            meterBar.style.backgroundColor = '#ea4335';
            feedback.textContent = 'Configurações fracas. Sua privacidade pode estar em risco.';
        }
    }
    
    window.closePrivacySimulator = () => {
        privacyModal.style.display = 'none';
    };
    
    privacyModal.style.display = 'block';
}

// Mapa de Violações
function showViolationsMap() {
    const mapModal = document.getElementById('map-modal');
    const mapContainer = document.getElementById('violations-map');
    
    mapContainer.innerHTML = `
        <div class="map-placeholder">
            <i class="fas fa-map-marked-alt"></i>
            <p>Mapa interativo mostrando a distribuição geográfica dos relatos de violações.</p>
            <p>Esta funcionalidade seria implementada com uma API de mapas como Google Maps ou Leaflet, mostrando marcadores baseados nos dados de localização dos relatos.</p>
        </div>
    `;
    
    mapModal.style.display = 'block';
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se há notificações salvas no localStorage
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
        notifications = JSON.parse(savedNotifications);
        updateNotificationBadge();
    }
    
    // Atualizar dashboard
    updateDashboard();
    
    // Configurar Service Worker para notificações push
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
                return registration.pushManager.getSubscription()
                    .then(subscription => {
                        if (subscription) {
                            return subscription;
                        }
                        
                        return registration.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: 'SUA_CHAVE_PUBLICA_VAPID'
                        });
                    });
            })
            .then(subscription => {
                console.log('Usuário inscrito para notificações push:', subscription);
                // Aqui você enviaria a subscription para seu servidor
            })
            .catch(err => {
                console.error('Erro no ServiceWorker:', err);
            });
    }
    
    // Simular notificações para demonstração
    setTimeout(() => {
        addNotification('Bem-vindo ao Direitos Digitais', 'Explore nosso questionário e recursos educacionais sobre direitos humanos no ambiente digital.');
    }, 5000);
});

// Salvar notificações ao sair
window.addEventListener('beforeunload', () => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
});