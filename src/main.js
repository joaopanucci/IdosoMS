// Importações
import './style.css'
import { initializeApp } from './services/firebase.js'
import { AuthManager } from './auth/AuthManager.js'
import { Router } from './services/Router.js'

class App {
    constructor() {
        this.authManager = null
        this.router = null
        this.currentUser = null
        
        this.init()
    }

    async init() {
        try {
            console.log('🚀 Inicializando IdosoMS...')
            
            // Inicializar Firebase
            await initializeApp()
            console.log('✅ Firebase inicializado')
            
            // Inicializar gerenciador de autenticação
            this.authManager = new AuthManager()
            await this.authManager.init()
            console.log('✅ Auth Manager inicializado')
            
            // Inicializar roteador
            this.router = new Router()
            console.log('✅ Router inicializado')
            
            // Configurar listeners
            this.setupEventListeners()
            
            // Esconder loader inicial
            this.hideInitialLoader()
            
            console.log('✅ IdosoMS inicializado com sucesso!')
            
        } catch (error) {
            console.error('❌ Erro ao inicializar aplicação:', error)
            this.showError('Erro ao carregar aplicação. Tente recarregar a página.')
        }
    }

    setupEventListeners() {
        // Listener de mudança de estado de autenticação
        this.authManager.onAuthStateChange((user) => {
            this.currentUser = user
            this.handleAuthStateChange(user)
        })

        // Listener de mudança de rota
        window.addEventListener('popstate', () => {
            this.router.handleRoute()
        })

        // Listener de cliques em links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-route]')
            if (link) {
                e.preventDefault()
                const route = link.getAttribute('data-route')
                this.router.navigate(route)
            }
        })

        // Listener para logout
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="logout"]')) {
                e.preventDefault()
                this.handleLogout()
            }
        })

        // Service Worker
        if ('serviceWorker' in navigator) {
            this.registerServiceWorker()
        }
    }

    handleAuthStateChange(user) {
        if (user) {
            console.log('👤 Usuário autenticado:', user.email)
            this.router.navigate('/dashboard')
        } else {
            console.log('🚪 Usuário não autenticado')
            this.router.navigate('/login')
        }
    }

    async handleLogout() {
        try {
            await this.authManager.signOut()
            this.showNotification('Logout realizado com sucesso', 'success')
        } catch (error) {
            console.error('Erro ao fazer logout:', error)
            this.showNotification('Erro ao fazer logout', 'error')
        }
    }

    hideInitialLoader() {
        const loader = document.getElementById('initial-loader')
        if (loader) {
            loader.style.opacity = '0'
            setTimeout(() => {
                loader.remove()
            }, 300)
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div')
        errorDiv.innerHTML = `
            <div class="min-h-screen flex items-center justify-center bg-gray-50">
                <div class="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
                    <div class="flex items-center mb-4">
                        <div class="flex-shrink-0">
                            <svg class="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div class="ml-3">
                            <h3 class="text-lg font-medium text-gray-900">Erro</h3>
                        </div>
                    </div>
                    <p class="text-gray-600 mb-4">${message}</p>
                    <button onclick="window.location.reload()" class="btn btn-primary w-full">
                        Recarregar Página
                    </button>
                </div>
            </div>
        `
        
        document.getElementById('app').appendChild(errorDiv)
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div')
        const typeClasses = {
            success: 'bg-green-50 text-green-800 border-green-200',
            error: 'bg-red-50 text-red-800 border-red-200',
            warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
            info: 'bg-blue-50 text-blue-800 border-blue-200'
        }

        notification.className = `fixed top-4 right-4 max-w-sm w-full ${typeClasses[type]} border rounded-md p-4 shadow-lg z-50 animate-slideDown`
        notification.innerHTML = `
            <div class="flex items-center justify-between">
                <p class="text-sm font-medium">${message}</p>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-current opacity-75 hover:opacity-100">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                </button>
            </div>
        `

        document.body.appendChild(notification)

        // Auto-remover após 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove()
            }
        }, 5000)
    }

    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js')
            console.log('✅ Service Worker registrado:', registration)
        } catch (error) {
            console.warn('⚠️ Falha ao registrar Service Worker:', error)
        }
    }
}

// Inicializar aplicação quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new App())
} else {
    new App()
}

// Exportar para debug/desenvolvimento
window.app = App