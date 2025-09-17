/**
 * Utilitários para validação e formatação de dados
 */

/**
 * Valida CPF brasileiro
 * @param {string} cpf - CPF para validar
 * @returns {boolean} - True se válido
 */
export function validateCPF(cpf) {
    if (!cpf) return false
    
    // Remove formatação
    cpf = cpf.replace(/[^\d]/g, '')
    
    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false
    
    // Validação do primeiro dígito verificador
    let sum = 0
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i)
    }
    let remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cpf.charAt(9))) return false
    
    // Validação do segundo dígito verificador
    sum = 0
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cpf.charAt(10))) return false
    
    return true
}

/**
 * Formata CPF com máscara
 * @param {string} cpf - CPF para formatar
 * @returns {string} - CPF formatado
 */
export function formatCPF(cpf) {
    if (!cpf) return ''
    cpf = cpf.replace(/[^\d]/g, '')
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

/**
 * Mascara CPF para exibição (LGPD)
 * @param {string} cpf - CPF para mascarar
 * @returns {string} - CPF mascarado
 */
export function maskCPF(cpf) {
    if (!cpf) return ''
    const formatted = formatCPF(cpf)
    return formatted.replace(/(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/, '$1.***.**$4')
}

/**
 * Gera hash do CPF para armazenamento seguro
 * @param {string} cpf - CPF para fazer hash
 * @returns {string} - Hash do CPF
 */
export async function hashCPF(cpf) {
    if (!cpf) return ''
    
    const cleanCpf = cpf.replace(/[^\d]/g, '')
    const encoder = new TextEncoder()
    const data = encoder.encode(cleanCpf)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Valida email
 * @param {string} email - Email para validar
 * @returns {boolean} - True se válido
 */
export function validateEmail(email) {
    if (!email) return false
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * Valida telefone brasileiro
 * @param {string} phone - Telefone para validar
 * @returns {boolean} - True se válido
 */
export function validatePhone(phone) {
    if (!phone) return false
    const cleanPhone = phone.replace(/[^\d]/g, '')
    return cleanPhone.length >= 10 && cleanPhone.length <= 11
}

/**
 * Formata telefone brasileiro
 * @param {string} phone - Telefone para formatar
 * @returns {string} - Telefone formatado
 */
export function formatPhone(phone) {
    if (!phone) return ''
    const cleanPhone = phone.replace(/[^\d]/g, '')
    
    if (cleanPhone.length === 11) {
        return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    } else if (cleanPhone.length === 10) {
        return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    
    return cleanPhone
}

/**
 * Valida data de nascimento
 * @param {string|Date} birthDate - Data de nascimento
 * @returns {boolean} - True se válida
 */
export function validateBirthDate(birthDate) {
    if (!birthDate) return false
    
    const date = new Date(birthDate)
    const now = new Date()
    const age = now.getFullYear() - date.getFullYear()
    
    // Pessoa deve ter entre 0 e 120 anos
    return date <= now && age >= 0 && age <= 120
}

/**
 * Calcula idade a partir da data de nascimento
 * @param {string|Date} birthDate - Data de nascimento
 * @returns {number} - Idade em anos
 */
export function calculateAge(birthDate) {
    if (!birthDate) return 0
    
    const birth = new Date(birthDate)
    const now = new Date()
    let age = now.getFullYear() - birth.getFullYear()
    const monthDiff = now.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
        age--
    }
    
    return age
}

/**
 * Formata data brasileira
 * @param {string|Date} date - Data para formatar
 * @returns {string} - Data formatada (dd/mm/aaaa)
 */
export function formatDate(date) {
    if (!date) return ''
    
    const d = new Date(date)
    const day = d.getDate().toString().padStart(2, '0')
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const year = d.getFullYear()
    
    return `${day}/${month}/${year}`
}

/**
 * Formata data e hora brasileira
 * @param {string|Date} date - Data para formatar
 * @returns {string} - Data e hora formatada (dd/mm/aaaa hh:mm)
 */
export function formatDateTime(date) {
    if (!date) return ''
    
    const d = new Date(date)
    const dateStr = formatDate(d)
    const hours = d.getHours().toString().padStart(2, '0')
    const minutes = d.getMinutes().toString().padStart(2, '0')
    
    return `${dateStr} ${hours}:${minutes}`
}

/**
 * Valida senha forte
 * @param {string} password - Senha para validar
 * @returns {object} - Resultado da validação
 */
export function validatePassword(password) {
    if (!password) {
        return { valid: false, message: 'Senha é obrigatória' }
    }
    
    if (password.length < 8) {
        return { valid: false, message: 'Senha deve ter pelo menos 8 caracteres' }
    }
    
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Senha deve ter pelo menos uma letra maiúscula' }
    }
    
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Senha deve ter pelo menos uma letra minúscula' }
    }
    
    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Senha deve ter pelo menos um número' }
    }
    
    if (!/[^A-Za-z0-9]/.test(password)) {
        return { valid: false, message: 'Senha deve ter pelo menos um caractere especial' }
    }
    
    return { valid: true, message: 'Senha válida' }
}

/**
 * Remove acentos de string
 * @param {string} str - String para remover acentos
 * @returns {string} - String sem acentos
 */
export function removeAccents(str) {
    if (!str) return ''
    
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/**
 * Capitaliza primeira letra de cada palavra
 * @param {string} str - String para capitalizar
 * @returns {string} - String capitalizada
 */
export function capitalize(str) {
    if (!str) return ''
    
    return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
}

/**
 * Sanitiza string para uso seguro
 * @param {string} str - String para sanitizar
 * @returns {string} - String sanitizada
 */
export function sanitizeString(str) {
    if (!str) return ''
    
    return str.trim()
              .replace(/[<>]/g, '')
              .replace(/javascript:/gi, '')
              .replace(/on\w+=/gi, '')
}

/**
 * Valida código IBGE de município
 * @param {string} ibgeCode - Código IBGE
 * @returns {boolean} - True se válido
 */
export function validateIBGE(ibgeCode) {
    if (!ibgeCode) return false
    
    const code = ibgeCode.replace(/[^\d]/g, '')
    return code.length === 7 && /^50/.test(code) // MS começa com 50
}

/**
 * Debounce para limitar execução de função
 * @param {Function} func - Função para executar
 * @param {number} wait - Tempo de espera em ms
 * @returns {Function} - Função com debounce
 */
export function debounce(func, wait) {
    let timeout
    
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

/**
 * Throttle para limitar frequência de execução
 * @param {Function} func - Função para executar
 * @param {number} limit - Limite em ms
 * @returns {Function} - Função com throttle
 */
export function throttle(func, limit) {
    let inThrottle
    
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args)
            inThrottle = true
            setTimeout(() => inThrottle = false, limit)
        }
    }
}

/**
 * Gera ID único
 * @returns {string} - ID único
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * Deep clone de objeto
 * @param {any} obj - Objeto para clonar
 * @returns {any} - Clone do objeto
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj.getTime())
    if (obj instanceof Array) return obj.map(item => deepClone(item))
    if (typeof obj === 'object') {
        const clonedObj = {}
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key])
            }
        }
        return clonedObj
    }
}

/**
 * Compara se dois valores são iguais (deep comparison)
 * @param {any} a - Primeiro valor
 * @param {any} b - Segundo valor
 * @returns {boolean} - True se iguais
 */
export function isEqual(a, b) {
    if (a === b) return true
    if (a == null || b == null) return a === b
    if (typeof a !== typeof b) return false
    if (typeof a !== 'object') return a === b
    
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    
    if (keysA.length !== keysB.length) return false
    
    for (const key of keysA) {
        if (!keysB.includes(key)) return false
        if (!isEqual(a[key], b[key])) return false
    }
    
    return true
}