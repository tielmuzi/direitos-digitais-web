// Funções para inicializar e atualizar gráficos
let violationsChart, rightsChart, iaAgeChart, responsibilityChart;

async function initCharts() {
    try {
        // Obter dados do Supabase
        const { data, error } = await supabase
            .rpc('get_estatisticas');
            
        if (error) throw error;
        
        // Inicializar gráficos
        createViolationsChart(data);
        createRightsChart(data);
        createIAAgeChart(data);
        createResponsibilityChart(data);
    } catch (error) {
        console.error('Erro ao inicializar gráficos:', error);
    }
}

function createViolationsChart(data) {
    const ctx = document.getElementById('violations-chart').getContext('2d');
    const violationsData = data.violacoes_por_tipo ? Object.entries(data.violacoes_por_tipo) : [];
    
    if (violationsData.length > 0) {
        violationsChart = new Chart(ctx, {
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
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Número de Relatos'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Tipo de Violação'
                        }
                    }
                }
            }
        });
    } else {
        document.getElementById('violations-chart').parentElement.innerHTML = '<p>Não há dados suficientes para exibir este gráfico.</p>';
    }
}

function createRightsChart(data) {
    const ctx = document.getElementById('rights-chart').getContext('2d');
    
    // Dados de exemplo - na implementação real, você buscaria esses dados do Supabase
    const rightsData = {
        'Privacidade': 75,
        'Liberdade de expressão': 60,
        'Acesso à informação': 45,
        'Direito ao esquecimento': 30,
        'Igualdade e não discriminação': 55,
        'Direito à educação': 25,
        'Proteção contra violência e assédio': 65
    };
    
    rightsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(rightsData),
            datasets: [{
                data: Object.values(rightsData),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)',
                    'rgba(199, 199, 199, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(199, 199, 199, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                },
                title: {
                    display: true,
                    text: 'Direitos Mais Ameaçados no Ambiente Digital'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function createIAAgeChart(data) {
    const ctx = document.getElementById('ia-age-chart').getContext('2d');
    
    // Dados de exemplo - na implementação real, você buscaria esses dados do Supabase
    const ageGroups = ['Menos de 18', '18-25', '26-35', '36-45', '46-60', 'Mais de 60'];
    const iaConcernData = [3.2, 4.1, 4.3, 3.8, 3.5, 2.9];
    
    iaAgeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ageGroups,
            datasets: [{
                label: 'Nível médio de preocupação com IA (1-5)',
                data: iaConcernData,
                fill: false,
                backgroundColor: 'rgba(75, 192, 192, 0.7)',
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.1,
                pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5,
                    title: {
                        display: true,
                        text: 'Nível de Preocupação (1-5)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Faixa Etária'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw.toFixed(1)}`;
                        }
                    }
                }
            }
        }
    });
}

function createResponsibilityChart(data) {
    const ctx = document.getElementById('responsibility-chart').getContext('2d');
    
    // Dados de exemplo - na implementação real, você buscaria esses dados do Supabase
    const responsibilityData = {
        'Governos': 65,
        'Empresas': 80,
        'Organizações': 45,
        'Indivíduos': 55,
        'Sociedade Civil': 40
    };
    
    responsibilityChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: Object.keys(responsibilityData),
            datasets: [{
                label: 'Quem deve proteger direitos digitais?',
                data: Object.values(responsibilityData),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
            }]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.raw}%`;
                        }
                    }
                }
            }
        }
    });
}

// Atualizar gráficos quando novos dados são adicionados
function updateCharts(data) {
    if (violationsChart) {
        violationsChart.destroy();
    }
    
    if (rightsChart) {
        rightsChart.destroy();
    }
    
    if (iaAgeChart) {
        iaAgeChart.destroy();
    }
    
    if (responsibilityChart) {
        responsibilityChart.destroy();
    }
    
    createViolationsChart(data);
    createRightsChart(data);
    createIAAgeChart(data);
    createResponsibilityChart(data);
}

// Inicializar gráficos quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initCharts);