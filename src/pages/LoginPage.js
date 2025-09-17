/**
 * Página de Login
 * Interface para autenticação de usuários
 */

import { validateEmail, validateCPF, formatCPF } from '../utils/validators.js'
import { municipiosMS, getMunicipioByIbge } from '../data/municipios.js'

export default class LoginPage {
    constructor() {
        this.isLogin = true // true = login, false = cadastro
        this.loading = false
        this.authManager = null
        
        this.init()
    }

    init() {
        this.authManager = window.app?.authManager
    }

    async render() {
        return this.createLoginHTML()
    }

    createLoginHTML() {
        const container = document.createElement('div')
        container.className = 'min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'
        
        container.innerHTML = `
            <div class="max-w-md w-full space-y-8">
                <div>
                    <div class="mx-auto h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center">
                        <svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 2.676-1.148 5.131-2.958 7.201-5.306" />
                        </svg>
                    </div>
                    <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        ${this.isLogin ? 'Entre na sua conta' : 'Criar nova conta'}
                    </h2>
                    <p class="mt-2 text-center text-sm text-gray-600">
                        Sistema de Avaliação de Vulnerabilidade de Idosos - MS
                    </p>
                </div>

                <!-- Alternador Login/Cadastro -->
                <div class="bg-gray-100 p-1 rounded-lg grid grid-cols-2 gap-1">
                    <button 
                        id="btn-login" 
                        class="tab-button ${this.isLogin ? 'active' : ''}"
                        data-tab="login"
                    >
                        Entrar
                    </button>
                    <button 
                        id="btn-register" 
                        class="tab-button ${!this.isLogin ? 'active' : ''}"
                        data-tab="register"
                    >
                        Cadastrar
                    </button>
                </div>

                <!-- Formulário -->
                <form id="auth-form" class="mt-8 space-y-6">
                    <div id="form-fields">
                        ${this.isLogin ? this.createLoginFields() : this.createRegisterFields()}
                    </div>

                    <div id="form-actions">
                        ${this.createFormActions()}
                    </div>
                </form>

                <!-- Links adicionais -->
                <div class="text-center">
                    ${this.isLogin ? this.createLoginLinks() : ''}
                </div>
            </div>
        `

        this.attachEventListeners(container)
        return container
    }

    createLoginFields() {
        return `
            <div class="space-y-4">
                <div>
                    <label for="email" class="form-label">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autocomplete="email"
                        required
                        class="form-input"
                        placeholder="seu@email.com"
                    >
                    <div class="form-error" id="email-error"></div>
                </div>
                
                <div>
                    <label for="password" class="form-label">Senha</label>
                    <input
                        id="password" 
                        name="password"
                        type="password"
                        autocomplete="current-password"
                        required
                        class="form-input"
                        placeholder="••••••••"
                    >
                    <div class="form-error" id="password-error"></div>
                </div>
            </div>
        `
    }

    createRegisterFields() {
        const municipiosOptions = municipiosMS
            .sort((a, b) => a.nome.localeCompare(b.nome))
            .map(m => `<option value="${m.ibge}">${m.nome}</option>`)
            .join('')

        return `
            <div class="space-y-4">
                <div>
                    <label for="name" class="form-label">Nome Completo</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        class="form-input"
                        placeholder="Seu nome completo"
                    >
                    <div class="form-error" id="name-error"></div>
                </div>

                <div>
                    <label for="email" class="form-label">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autocomplete="email"
                        required
                        class="form-input"
                        placeholder="seu@email.com"
                    >
                    <div class="form-error" id="email-error"></div>
                </div>

                <div>
                    <label for="cpf" class="form-label">CPF (opcional)</label>
                    <input
                        id="cpf"
                        name="cpf"
                        type="text"
                        class="form-input"
                        placeholder="000.000.000-00"
                        maxlength="14"
                    >
                    <div class="form-error" id="cpf-error"></div>
                </div>

                <div>
                    <label for="municipio" class="form-label">Município</label>
                    <select id="municipio" name="municipio" required class="form-input">
                        <option value="">Selecione um município</option>
                        ${municipiosOptions}
                    </select>
                    <div class="form-error" id="municipio-error"></div>
                </div>

                <div>
                    <label for="password" class="form-label">Senha</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autocomplete="new-password"
                        required
                        class="form-input"
                        placeholder="••••••••"
                    >
                    <div class="text-xs text-gray-500 mt-1">
                        Mínimo 8 caracteres com maiúscula, minúscula, número e símbolo
                    </div>
                    <div class="form-error" id="password-error"></div>
                </div>

                <div>
                    <label for="confirm-password" class="form-label">Confirmar Senha</label>
                    <input
                        id="confirm-password"
                        name="confirm-password"
                        type="password"
                        required
                        class="form-input"
                        placeholder="••••••••"
                    >
                    <div class="form-error" id="confirm-password-error"></div>
                </div>

                <div class="flex items-start">
                    <input
                        id="accept-lgpd"
                        name="accept-lgpd"
                        type="checkbox"
                        required
                        class="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    >
                    <label for="accept-lgpd" class="ml-2 block text-sm text-gray-700">
                        Aceito os <a href="#" class="text-primary-600 hover:text-primary-800">termos de uso</a> 
                        e concordo com o tratamento dos meus dados pessoais conforme a LGPD
                    </label>
                </div>
            </div>
        `
    }

    createFormActions() {
        return `
            <div>
                <button
                    type="submit"
                    id="submit-button"
                    class="btn btn-primary w-full flex justify-center py-3 px-4 text-sm font-medium"
                    ${this.loading ? 'disabled' : ''}
                >
                    ${this.loading ? 
                        '<div class="loading-spinner w-5 h-5"></div>' : 
                        (this.isLogin ? 'Entrar' : 'Criar Conta')
                    }
                </button>
            </div>
        `
    }

    createLoginLinks() {
        return `
            <div class="text-sm space-y-2">
                <a href="#" id="forgot-password-link" class="text-primary-600 hover:text-primary-800">
                    Esqueceu sua senha?
                </a>
            </div>
        `
    }

    attachEventListeners(container) {
        // Alternador de abas
        const tabs = container.querySelectorAll('.tab-button')
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault()
                const tabType = tab.dataset.tab
                this.switchTab(tabType, container)
            })
        })

        // Formatação de CPF
        const cpfInput = container.querySelector('#cpf')
        if (cpfInput) {
            cpfInput.addEventListener('input', (e) => {
                const formatted = formatCPF(e.target.value)
                e.target.value = formatted
            })
        }

        // Submit do formulário
        const form = container.querySelector('#auth-form')
        form.addEventListener('submit', (e) => {
            e.preventDefault()
            this.handleSubmit(container)
        })

        // Link de esqueci senha
        const forgotLink = container.querySelector('#forgot-password-link')
        if (forgotLink) {
            forgotLink.addEventListener('click', (e) => {
                e.preventDefault()
                this.handleForgotPassword(container)
            })
        }
    }

    switchTab(tabType, container) {
        this.isLogin = tabType === 'login'
        
        // Atualizar botões
        const tabs = container.querySelectorAll('.tab-button')
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabType)
        })

        // Atualizar campos do formulário
        const fieldsContainer = container.querySelector('#form-fields')
        fieldsContainer.innerHTML = this.isLogin ? this.createLoginFields() : this.createRegisterFields()

        // Atualizar título
        const title = container.querySelector('h2')
        title.textContent = this.isLogin ? 'Entre na sua conta' : 'Criar nova conta'

        // Atualizar botão
        const submitBtn = container.querySelector('#submit-button')
        submitBtn.textContent = this.isLogin ? 'Entrar' : 'Criar Conta'

        // Reatachar listeners específicos
        this.attachSpecificListeners(container)
    }

    attachSpecificListeners(container) {
        // CPF formatting para registro
        if (!this.isLogin) {
            const cpfInput = container.querySelector('#cpf')
            if (cpfInput) {
                cpfInput.addEventListener('input', (e) => {
                    e.target.value = formatCPF(e.target.value)
                })
            }
        }
    }

    async handleSubmit(container) {
        if (this.loading) return

        const formData = new FormData(container.querySelector('#auth-form'))
        
        if (this.isLogin) {
            await this.handleLogin(formData, container)
        } else {
            await this.handleRegister(formData, container)
        }
    }

    async handleLogin(formData, container) {
        try {
            this.setLoading(true, container)
            this.clearErrors(container)

            const email = formData.get('email')
            const password = formData.get('password')

            // Validações
            if (!this.validateLogin(email, password, container)) {
                return
            }

            // Fazer login
            await this.authManager.signIn(email, password)
            
            this.showSuccess('Login realizado com sucesso!')
            
        } catch (error) {
            console.error('Erro no login:', error)
            this.showError(error.message || 'Erro ao fazer login', container)
        } finally {
            this.setLoading(false, container)
        }
    }

    async handleRegister(formData, container) {
        try {
            this.setLoading(true, container)
            this.clearErrors(container)

            const userData = {
                name: formData.get('name'),
                email: formData.get('email'),
                cpf: formData.get('cpf'),
                ibge_municipio: formData.get('municipio'),
                password: formData.get('password'),
                confirmPassword: formData.get('confirm-password'),
                acceptLgpd: formData.get('accept-lgpd')
            }

            // Validações
            if (!this.validateRegister(userData, container)) {
                return
            }

            // Criar conta
            await this.authManager.signUp(userData)
            
            this.showSuccess('Conta criada! Verifique seu email para ativar.')
            
        } catch (error) {
            console.error('Erro no cadastro:', error)
            this.showError(error.message || 'Erro ao criar conta', container)
        } finally {
            this.setLoading(false, container)
        }
    }

    validateLogin(email, password, container) {
        let valid = true

        if (!email || !validateEmail(email)) {
            this.showFieldError('email', 'Email inválido', container)
            valid = false
        }

        if (!password) {
            this.showFieldError('password', 'Senha é obrigatória', container)
            valid = false
        }

        return valid
    }

    validateRegister(userData, container) {
        let valid = true

        if (!userData.name || userData.name.trim().length < 2) {
            this.showFieldError('name', 'Nome deve ter pelo menos 2 caracteres', container)
            valid = false
        }

        if (!validateEmail(userData.email)) {
            this.showFieldError('email', 'Email inválido', container)
            valid = false
        }

        if (userData.cpf && !validateCPF(userData.cpf)) {
            this.showFieldError('cpf', 'CPF inválido', container)
            valid = false
        }

        if (!userData.ibge_municipio) {
            this.showFieldError('municipio', 'Selecione um município', container)
            valid = false
        }

        if (!userData.password || userData.password.length < 8) {
            this.showFieldError('password', 'Senha deve ter pelo menos 8 caracteres', container)
            valid = false
        }

        if (userData.password !== userData.confirmPassword) {
            this.showFieldError('confirm-password', 'Senhas não coincidem', container)
            valid = false
        }

        if (!userData.acceptLgpd) {
            this.showError('Você deve aceitar os termos para continuar', container)
            valid = false
        }

        return valid
    }

    async handleForgotPassword(container) {
        const email = container.querySelector('#email')?.value
        
        if (!email || !validateEmail(email)) {
            this.showError('Digite um email válido primeiro', container)
            return
        }

        try {
            await this.authManager.resetPassword(email)
            this.showSuccess('Email de recuperação enviado!')
        } catch (error) {
            this.showError(error.message || 'Erro ao enviar email', container)
        }
    }

    setLoading(loading, container) {
        this.loading = loading
        const submitBtn = container.querySelector('#submit-button')
        
        if (loading) {
            submitBtn.disabled = true
            submitBtn.innerHTML = '<div class="loading-spinner w-5 h-5"></div>'
        } else {
            submitBtn.disabled = false
            submitBtn.textContent = this.isLogin ? 'Entrar' : 'Criar Conta'
        }
    }

    showFieldError(fieldName, message, container) {
        const errorDiv = container.querySelector(`#${fieldName}-error`)
        if (errorDiv) {
            errorDiv.textContent = message
        }
    }

    clearErrors(container) {
        const errorDivs = container.querySelectorAll('.form-error')
        errorDivs.forEach(div => div.textContent = '')
    }

    showError(message, container) {
        // Implementar notificação de erro
        console.error(message)
        if (window.app?.showNotification) {
            window.app.showNotification(message, 'error')
        }
    }

    showSuccess(message) {
        // Implementar notificação de sucesso
        console.log(message)
        if (window.app?.showNotification) {
            window.app.showNotification(message, 'success')
        }
    }
}

// CSS adicional para as abas
const style = document.createElement('style')
style.textContent = `
    .tab-button {
        @apply px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200;
    }
    
    .tab-button:not(.active) {
        @apply text-gray-600 hover:text-gray-800;
    }
    
    .tab-button.active {
        @apply bg-white text-primary-600 shadow-sm;
    }
`
document.head.appendChild(style)