/**
 * Página de Dashboard/Início
 * Visão geral do sistema e acesso rápido às funcionalidades
 */

export default class DashboardPage {
    constructor() {
        this.authManager = null
        this.userProfile = null
        this.stats = {
            pacientes: 0,
            avaliacoes: 0,
            avaliacoes_mes: 0,
            risco_alto: 0
        }
        
        this.init()
    }

    init() {
        this.authManager = window.app?.authManager
        this.userProfile = this.authManager?.profile
    }

    async render() {
        await this.loadStats()
        return this.createDashboardHTML()
    }

    async loadStats() {
        // Simular carregamento de estatísticas
        // TODO: Implementar busca real no Firestore
        this.stats = {
            pacientes: Math.floor(Math.random() * 200) + 50,
            avaliacoes: Math.floor(Math.random() * 500) + 100,
            avaliacoes_mes: Math.floor(Math.random() * 50) + 10,
            risco_alto: Math.floor(Math.random() * 30) + 5
        }
    }

    createDashboardHTML() {
        const container = document.createElement('div')
        container.className = 'min-h-screen bg-gray-50'
        
        container.innerHTML = `
            <!-- Header -->
            <header class="bg-white shadow-sm border-b border-gray-200">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between items-center py-6">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                                    <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 2.676-1.148 5.131-2.958 7.201-5.306" />
                                    </svg>
                                </div>
                            </div>
                            <div class="ml-4">
                                <h1 class="text-2xl font-bold text-gray-900">IdosoMS</h1>
                                <p class="text-sm text-gray-500">Sistema de Avaliação de Vulnerabilidade</p>
                            </div>
                        </div>
                        
                        <div class="flex items-center space-x-4">
                            <div class="text-right">
                                <p class="text-sm font-medium text-gray-900">${this.userProfile?.name || 'Usuário'}</p>
                                <p class="text-xs text-gray-500">${this.userProfile?.municipio_nome || 'Município não definido'}</p>
                            </div>
                            <button 
                                data-action="logout"
                                class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                Sair
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Main Content -->
            <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <!-- Boas-vindas -->
                <div class="mb-8">
                    <h2 class="text-3xl font-bold text-gray-900 mb-2">
                        Bem-vindo, ${this.userProfile?.name?.split(' ')[0] || 'Usuário'}!
                    </h2>
                    <p class="text-gray-600">
                        Gerencie avaliações de vulnerabilidade de idosos de forma fácil e segura.
                    </p>
                </div>

                <!-- Estatísticas -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    ${this.createStatsCards()}
                </div>

                <!-- Ações Rápidas -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <!-- Ações Principais -->
                    <div class="bg-white overflow-hidden shadow rounded-lg">
                        <div class="p-6">
                            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                                Ações Rápidas
                            </h3>
                            <div class="space-y-3">
                                ${this.createQuickActions()}
                            </div>
                        </div>
                    </div>

                    <!-- Avaliações Recentes -->
                    <div class="bg-white overflow-hidden shadow rounded-lg">
                        <div class="p-6">
                            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                                Avaliações Recentes
                            </h3>
                            <div class="space-y-3">
                                ${this.createRecentEvaluations()}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Navegação Principal -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${this.createNavigationCards()}
                </div>
            </main>
        `
        
        this.attachEventListeners(container)
        return container
    }

    createStatsCards() {
        const stats = [
            {
                title: 'Total de Pacientes',
                value: this.stats.pacientes,
                icon: 'users',
                color: 'blue'
            },
            {
                title: 'Avaliações Realizadas', 
                value: this.stats.avaliacoes,
                icon: 'clipboard-check',
                color: 'green'
            },
            {
                title: 'Avaliações este Mês',
                value: this.stats.avaliacoes_mes,
                icon: 'calendar',
                color: 'purple'
            },
            {
                title: 'Risco Alto',
                value: this.stats.risco_alto,
                icon: 'exclamation-triangle',
                color: 'red'
            }
        ]

        return stats.map(stat => `
            <div class="bg-white overflow-hidden shadow rounded-lg">
                <div class="p-5">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="h-8 w-8 bg-${stat.color}-100 rounded-md flex items-center justify-center">
                                ${this.getIcon(stat.icon, `text-${stat.color}-600`)}
                            </div>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-500 truncate">
                                    ${stat.title}
                                </dt>
                                <dd class="text-2xl font-bold text-gray-900">
                                    ${stat.value}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        `).join('')
    }

    createQuickActions() {
        const actions = [
            {
                title: 'Nova Avaliação IVCF-20',
                description: 'Realizar avaliação de vulnerabilidade clínico-funcional',
                href: '/avaliacao/nova?tipo=IVCF20',
                icon: 'plus',
                color: 'primary'
            },
            {
                title: 'Nova Avaliação IVSF-10', 
                description: 'Realizar avaliação de vulnerabilidade social-familiar',
                href: '/avaliacao/nova?tipo=IVSF10',
                icon: 'plus',
                color: 'primary'
            },
            {
                title: 'Cadastrar Paciente',
                description: 'Adicionar novo paciente ao sistema',
                href: '/pacientes/novo',
                icon: 'user-add',
                color: 'green'
            }
        ]

        return actions.map(action => `
            <a 
                href="${action.href}" 
                data-route="${action.href}"
                class="group flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
                <div class="flex-shrink-0">
                    <div class="h-10 w-10 bg-${action.color}-100 rounded-lg flex items-center justify-center group-hover:bg-${action.color}-200 transition-colors">
                        ${this.getIcon(action.icon, `text-${action.color}-600`)}
                    </div>
                </div>
                <div class="ml-4 min-w-0 flex-1">
                    <p class="text-sm font-medium text-gray-900 group-hover:text-${action.color}-600">
                        ${action.title}
                    </p>
                    <p class="text-sm text-gray-500">
                        ${action.description}
                    </p>
                </div>
            </a>
        `).join('')
    }

    createRecentEvaluations() {
        // Simulação de avaliações recentes
        const evaluations = [
            {
                patient: 'João Silva Santos',
                type: 'IVCF-20',
                risk: 'baixo',
                date: '2024-01-15'
            },
            {
                patient: 'Maria Santos',
                type: 'IVSF-10', 
                risk: 'moderado',
                date: '2024-01-14'
            },
            {
                patient: 'José Oliveira',
                type: 'IVCF-20',
                risk: 'alto',
                date: '2024-01-13'
            }
        ]

        return evaluations.map(evaluation => `
            <div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium text-gray-900 truncate">
                        ${evaluation.patient}
                    </p>
                    <p class="text-xs text-gray-500">
                        ${evaluation.type} • ${new Date(evaluation.date).toLocaleDateString('pt-BR')}
                    </p>
                </div>
                <div class="ml-4 flex-shrink-0">
                    <span class="badge bg-risk-${evaluation.risk}">
                        ${evaluation.risk}
                    </span>
                </div>
            </div>
        `).join('')
    }

    createNavigationCards() {
        const cards = [
            {
                title: 'Gerenciar Pacientes',
                description: 'Visualizar, editar e buscar pacientes cadastrados',
                href: '/pacientes',
                icon: 'users',
                color: 'blue'
            },
            {
                title: 'Relatórios',
                description: 'Gerar relatórios e visualizar estatísticas',
                href: '/relatorios',
                icon: 'chart-bar',
                color: 'purple'
            },
            {
                title: 'Gerenciar Usuários',
                description: 'Administrar usuários e permissões',
                href: '/usuarios',
                icon: 'user-group',
                color: 'green',
                permission: 'manage_users'
            },
            {
                title: 'Configurações',
                description: 'Configurar parâmetros do sistema',
                href: '/configuracoes',
                icon: 'cog',
                color: 'gray',
                permission: 'manage_parameters'
            },
            {
                title: 'Meu Perfil',
                description: 'Editar informações pessoais e senha',
                href: '/perfil',
                icon: 'user',
                color: 'indigo'
            },
            {
                title: 'Ajuda',
                description: 'Documentação e suporte técnico',
                href: '/ajuda',
                icon: 'question-mark-circle',
                color: 'yellow'
            }
        ]

        return cards
            .filter(card => !card.permission || this.hasPermission(card.permission))
            .map(card => `
                <a 
                    href="${card.href}" 
                    data-route="${card.href}"
                    class="group bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
                >
                    <div class="p-6">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="h-12 w-12 bg-${card.color}-100 rounded-lg flex items-center justify-center group-hover:bg-${card.color}-200 transition-colors">
                                    ${this.getIcon(card.icon, `text-${card.color}-600 h-6 w-6`)}
                                </div>
                            </div>
                            <div class="ml-4 min-w-0 flex-1">
                                <h3 class="text-lg font-medium text-gray-900 group-hover:text-${card.color}-600 transition-colors">
                                    ${card.title}
                                </h3>
                                <p class="text-sm text-gray-500">
                                    ${card.description}
                                </p>
                            </div>
                        </div>
                    </div>
                </a>
            `).join('')
    }

    getIcon(iconName, className = 'h-5 w-5') {
        const icons = {
            'users': `<svg class="${className}" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>`,
            'clipboard-check': `<svg class="${className}" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>`,
            'calendar': `<svg class="${className}" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`,
            'exclamation-triangle': `<svg class="${className}" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" /></svg>`,
            'plus': `<svg class="${className}" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>`,
            'user-add': `<svg class="${className}" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>`,
            'chart-bar': `<svg class="${className}" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>`,
            'user-group': `<svg class="${className}" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>`,
            'cog': `<svg class="${className}" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`,
            'user': `<svg class="${className}" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>`,
            'question-mark-circle': `<svg class="${className}" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
        }
        
        return icons[iconName] || icons['question-mark-circle']
    }

    hasPermission(permission) {
        return this.authManager?.hasPermission(permission) || false
    }

    attachEventListeners(container) {
        // Event listeners já são tratados pelo roteador principal
        // Aqui podemos adicionar listeners específicos se necessário
    }
}