/**
 * Sistema de roteamento SPA (Single Page Application)
 * Gerencia navegação entre páginas sem recarregar
 */

export class Router {
    constructor() {
        this.routes = new Map()
        this.currentRoute = null
        this.beforeRouteHooks = []
        this.afterRouteHooks = []
        this.notFoundHandler = null
        
        this.setupRoutes()
        this.init()
    }

    /**
     * Configurar rotas da aplicação
     */
    setupRoutes() {
        // Rotas públicas
        this.addRoute('/', {
            component: () => import('../pages/HomePage.js'),
            title: 'IdosoMS - Início',
            requireAuth: false
        })

        this.addRoute('/login', {
            component: () => import('../pages/LoginPage.js'),
            title: 'Login - IdosoMS',
            requireAuth: false,
            redirectIfAuth: '/dashboard'
        })

        // Rotas privadas
        this.addRoute('/dashboard', {
            component: () => import('../pages/DashboardPage.js'),
            title: 'Dashboard - IdosoMS',
            requireAuth: true
        })

        this.addRoute('/pacientes', {
            component: () => import('../pages/PacientesPage.js'),
            title: 'Pacientes - IdosoMS', 
            requireAuth: true
        })

        this.addRoute('/pacientes/novo', {
            component: () => import('../pages/NovoPacientePage.js'),
            title: 'Novo Paciente - IdosoMS',
            requireAuth: true,
            permissions: ['create_patient']
        })

        this.addRoute('/pacientes/:id', {
            component: () => import('../pages/PacienteDetalhePage.js'),
            title: 'Detalhes do Paciente - IdosoMS',
            requireAuth: true
        })

        this.addRoute('/avaliacao/nova', {
            component: () => import('../pages/NovaAvaliacaoPage.js'),
            title: 'Nova Avaliação - IdosoMS',
            requireAuth: true,
            permissions: ['create_patient']
        })

        this.addRoute('/usuarios', {
            component: () => import('../pages/UsuariosPage.js'),
            title: 'Gerenciar Usuários - IdosoMS',
            requireAuth: true,
            permissions: ['manage_users']
        })

        this.addRoute('/relatorios', {
            component: () => import('../pages/RelatoriosPage.js'),
            title: 'Relatórios - IdosoMS',
            requireAuth: true
        })

        this.addRoute('/perfil', {
            component: () => import('../pages/PerfilPage.js'),
            title: 'Meu Perfil - IdosoMS',
            requireAuth: true
        })

        this.addRoute('/configuracoes', {
            component: () => import('../pages/ConfiguracoesPage.js'),
            title: 'Configurações - IdosoMS',
            requireAuth: true,
            permissions: ['manage_parameters']
        })

        // Página 404
        this.setNotFoundHandler({
            component: () => import('../pages/NotFoundPage.js'),
            title: '404 - Página não encontrada'
        })
    }

    /**
     * Adicionar rota
     */
    addRoute(path, config) {
        this.routes.set(path, {
            path,
            ...config
        })
    }

    /**
     * Definir handler para páginas não encontradas
     */
    setNotFoundHandler(config) {
        this.notFoundHandler = config
    }

    /**
     * Inicializar roteador
     */
    init() {
        // Interceptar cliques em links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-route]')
            if (link) {
                e.preventDefault()
                const route = link.getAttribute('data-route')
                this.navigate(route)
            }
        })

        // Interceptar navegação do browser
        window.addEventListener('popstate', (e) => {
            this.handleRoute(window.location.pathname)
        })

        // Carregar rota inicial
        this.handleRoute(window.location.pathname)
    }

    /**
     * Navegar para rota
     */
    navigate(path, options = {}) {
        const { replace = false } = options
        
        if (replace) {
            history.replaceState({}, '', path)
        } else {
            history.pushState({}, '', path)
        }
        
        this.handleRoute(path)
    }

    /**
     * Processar rota atual
     */
    async handleRoute(path = window.location.pathname) {
        try {
            // Encontrar rota correspondente
            const route = this.findRoute(path)
            
            if (!route) {
                await this.handleNotFound()
                return
            }

            // Executar hooks antes da rota
            const canContinue = await this.runBeforeHooks(route, path)
            if (!canContinue) return

            // Verificar autenticação
            if (route.requireAuth && !this.isAuthenticated()) {
                this.navigate('/login')
                return
            }

            // Redirect se já autenticado
            if (route.redirectIfAuth && this.isAuthenticated()) {
                this.navigate(route.redirectIfAuth)
                return
            }

            // Verificar permissões
            if (route.permissions && !this.hasPermissions(route.permissions)) {
                this.navigate('/dashboard')
                this.showAccessDenied()
                return
            }

            // Carregar e renderizar componente
            await this.loadRoute(route, path)
            
            // Executar hooks após a rota
            await this.runAfterHooks(route, path)

        } catch (error) {
            console.error('Erro ao processar rota:', error)
            await this.handleError(error)
        }
    }

    /**
     * Encontrar rota correspondente
     */
    findRoute(path) {
        // Busca exata primeiro
        if (this.routes.has(path)) {
            return this.routes.get(path)
        }

        // Busca com parâmetros
        for (const [routePath, config] of this.routes) {
            const params = this.matchRoute(routePath, path)
            if (params !== null) {
                return { ...config, params }
            }
        }

        return null
    }

    /**
     * Verificar se rota com parâmetros corresponde ao path
     */
    matchRoute(routePath, path) {
        const routeParts = routePath.split('/')
        const pathParts = path.split('/')

        if (routeParts.length !== pathParts.length) {
            return null
        }

        const params = {}
        
        for (let i = 0; i < routeParts.length; i++) {
            const routePart = routeParts[i]
            const pathPart = pathParts[i]

            if (routePart.startsWith(':')) {
                const paramName = routePart.slice(1)
                params[paramName] = pathPart
            } else if (routePart !== pathPart) {
                return null
            }
        }

        return params
    }

    /**
     * Carregar e renderizar rota
     */
    async loadRoute(route, path) {
        try {
            // Mostrar indicador de carregamento
            this.showLoading()

            // Atualizar título da página
            document.title = route.title || 'IdosoMS'

            // Carregar componente dinamicamente
            const module = await route.component()
            const Component = module.default || module

            // Limpar container principal
            const app = document.getElementById('app')
            app.innerHTML = ''

            // Criar instância do componente
            let componentInstance
            if (typeof Component === 'function') {
                componentInstance = new Component(route.params || {})
            } else {
                componentInstance = Component
            }

            // Renderizar componente
            if (componentInstance.render) {
                app.appendChild(await componentInstance.render())
            } else if (componentInstance instanceof HTMLElement) {
                app.appendChild(componentInstance)
            } else {
                throw new Error('Componente inválido')
            }

            // Inicializar componente se tiver método init
            if (componentInstance.init) {
                await componentInstance.init()
            }

            this.currentRoute = { route, path, component: componentInstance }

        } catch (error) {
            console.error('Erro ao carregar componente:', error)
            throw error
        } finally {
            this.hideLoading()
        }
    }

    /**
     * Processar página não encontrada
     */
    async handleNotFound() {
        if (this.notFoundHandler) {
            await this.loadRoute(this.notFoundHandler, window.location.pathname)
        } else {
            document.getElementById('app').innerHTML = `
                <div class="min-h-screen flex items-center justify-center">
                    <div class="text-center">
                        <h1 class="text-4xl font-bold text-gray-900 mb-4">404</h1>
                        <p class="text-gray-600 mb-8">Página não encontrada</p>
                        <a href="/" data-route="/" class="btn btn-primary">Voltar ao Início</a>
                    </div>
                </div>
            `
        }
    }

    /**
     * Processar erro de carregamento
     */
    async handleError(error) {
        console.error('Erro na rota:', error)
        
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen flex items-center justify-center">
                <div class="text-center max-w-md">
                    <div class="text-red-500 mb-4">
                        <svg class="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 class="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar página</h1>
                    <p class="text-gray-600 mb-8">${error.message || 'Erro desconhecido'}</p>
                    <div class="space-x-4">
                        <button onclick="window.location.reload()" class="btn btn-primary">
                            Recarregar
                        </button>
                        <a href="/dashboard" data-route="/dashboard" class="btn btn-outline">
                            Ir ao Dashboard
                        </a>
                    </div>
                </div>
            </div>
        `
    }

    /**
     * Mostrar indicador de carregamento
     */
    showLoading() {
        const app = document.getElementById('app')
        app.innerHTML = `
            <div class="min-h-screen flex items-center justify-center">
                <div class="text-center">
                    <div class="loading-spinner w-8 h-8 mb-4"></div>
                    <p class="text-gray-600">Carregando...</p>
                </div>
            </div>
        `
    }

    /**
     * Esconder indicador de carregamento
     */
    hideLoading() {
        // Loading será substituído pelo conteúdo da página
    }

    /**
     * Mostrar mensagem de acesso negado
     */
    showAccessDenied() {
        // Implementar notificação de acesso negado
        console.warn('Acesso negado à rota')
    }

    /**
     * Executar hooks antes da rota
     */
    async runBeforeHooks(route, path) {
        for (const hook of this.beforeRouteHooks) {
            try {
                const result = await hook(route, path)
                if (result === false) return false
            } catch (error) {
                console.error('Erro em before hook:', error)
                return false
            }
        }
        return true
    }

    /**
     * Executar hooks após a rota
     */
    async runAfterHooks(route, path) {
        for (const hook of this.afterRouteHooks) {
            try {
                await hook(route, path)
            } catch (error) {
                console.error('Erro em after hook:', error)
            }
        }
    }

    /**
     * Adicionar hook antes da rota
     */
    beforeRoute(hook) {
        this.beforeRouteHooks.push(hook)
    }

    /**
     * Adicionar hook após a rota  
     */
    afterRoute(hook) {
        this.afterRouteHooks.push(hook)
    }

    /**
     * Verificar se usuário está autenticado
     */
    isAuthenticated() {
        // Implementar verificação via AuthManager
        return window.app?.authManager?.isAuthenticated || false
    }

    /**
     * Verificar se usuário tem permissões
     */
    hasPermissions(permissions) {
        if (!Array.isArray(permissions)) {
            permissions = [permissions]
        }

        return permissions.every(permission => 
            window.app?.authManager?.hasPermission(permission) || false
        )
    }

    /**
     * Obter rota atual
     */
    getCurrentRoute() {
        return this.currentRoute
    }

    /**
     * Obter parâmetros da rota atual
     */
    getRouteParams() {
        return this.currentRoute?.route?.params || {}
    }

    /**
     * Voltar na história
     */
    back() {
        history.back()
    }

    /**
     * Avançar na história
     */
    forward() {
        history.forward()
    }
}