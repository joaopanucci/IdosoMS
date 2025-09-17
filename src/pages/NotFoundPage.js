/**
 * Página 404 - Não encontrada
 */

export default class NotFoundPage {
    constructor() {}

    async render() {
        return this.createNotFoundHTML()
    }

    createNotFoundHTML() {
        const container = document.createElement('div')
        container.className = 'min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8'
        
        container.innerHTML = `
            <div class="sm:mx-auto sm:w-full sm:max-w-md">
                <div class="text-center">
                    <div class="mx-auto h-24 w-24 bg-red-100 rounded-full flex items-center justify-center mb-8">
                        <svg class="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    
                    <h1 class="text-9xl font-bold text-gray-300 mb-4">404</h1>
                    <h2 class="text-2xl font-bold text-gray-900 mb-4">Página não encontrada</h2>
                    <p class="text-gray-600 mb-8">
                        A página que você está procurando não existe ou foi movida.
                    </p>
                    
                    <div class="space-x-4">
                        <a 
                            href="/dashboard" 
                            data-route="/dashboard"
                            class="btn btn-primary"
                        >
                            Ir ao Dashboard
                        </a>
                        <button 
                            onclick="history.back()" 
                            class="btn btn-outline"
                        >
                            Voltar
                        </button>
                    </div>
                </div>
            </div>
        `
        
        return container
    }
}