/**
 * Gerenciador de autenticação com Firebase Auth
 * Controla login, logout, registro e estado de autenticação
 */

import { 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword, 
    signOut,
    onAuthStateChanged,
    sendEmailVerification,
    sendPasswordResetEmail,
    updatePassword,
    updateProfile,
    deleteUser,
    reauthenticateWithCredential,
    EmailAuthProvider
} from 'firebase/auth'

import { 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc,
    serverTimestamp 
} from 'firebase/firestore'

import { auth, db } from '../services/firebase.js'
import { validateEmail, validatePassword, hashCPF, validateCPF } from '../utils/validators.js'

export class AuthManager {
    constructor() {
        this.currentUser = null
        this.userProfile = null
        this.authStateListeners = new Set()
        this.initialized = false
    }

    async init() {
        if (this.initialized) return

        console.log('🔐 Inicializando AuthManager...')
        
        // Configurar listener de mudança de estado
        onAuthStateChanged(auth, async (user) => {
            await this.handleAuthStateChange(user)
        })

        this.initialized = true
        console.log('✅ AuthManager inicializado')
    }

    /**
     * Handle mudança no estado de autenticação
     */
    async handleAuthStateChange(user) {
        this.currentUser = user
        this.userProfile = null

        if (user) {
            try {
                // Carregar perfil completo do usuário
                await this.loadUserProfile(user.uid)
                console.log('👤 Usuário autenticado:', user.email)
            } catch (error) {
                console.error('Erro ao carregar perfil:', error)
            }
        } else {
            console.log('🚪 Usuário não autenticado')
        }

        // Notificar listeners
        this.notifyAuthStateListeners(user)
    }

    /**
     * Carrega perfil completo do usuário do Firestore
     */
    async loadUserProfile(uid) {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid))
            
            if (userDoc.exists()) {
                this.userProfile = {
                    uid,
                    ...userDoc.data()
                }
            } else {
                console.warn('Perfil do usuário não encontrado no Firestore')
                this.userProfile = {
                    uid,
                    email: this.currentUser?.email,
                    name: this.currentUser?.displayName || '',
                    role: 'agente', // Role padrão
                    ibge_municipio: null,
                    createdAt: new Date()
                }
            }
        } catch (error) {
            console.error('Erro ao carregar perfil:', error)
            throw error
        }
    }

    /**
     * Login com email e senha
     */
    async signIn(email, password) {
        try {
            // Validar dados
            if (!validateEmail(email)) {
                throw new Error('Email inválido')
            }

            if (!password) {
                throw new Error('Senha é obrigatória')
            }

            console.log('🔑 Fazendo login...')
            
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const user = userCredential.user

            // Verificar se email foi verificado
            if (!user.emailVerified) {
                throw new Error('Email não verificado. Verifique sua caixa de entrada.')
            }

            console.log('✅ Login realizado com sucesso')
            return user

        } catch (error) {
            console.error('❌ Erro no login:', error)
            
            // Traduzir erros do Firebase
            const errorMessage = this.translateFirebaseError(error.code) || error.message
            throw new Error(errorMessage)
        }
    }

    /**
     * Registro de novo usuário
     */
    async signUp(userData) {
        try {
            // Validar dados obrigatórios
            this.validateUserData(userData)

            console.log('📝 Criando conta...')

            const { email, password, name, cpf, role, ibge_municipio } = userData

            // Criar usuário no Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            const user = userCredential.user

            // Atualizar nome de exibição
            await updateProfile(user, { displayName: name })

            // Criar perfil no Firestore
            const profileData = {
                name: name.trim(),
                email: email.toLowerCase(),
                cpf_hash: cpf ? await hashCPF(cpf) : null,
                role: role || 'agente',
                ibge_municipio: ibge_municipio || null,
                municipio_nome: '',
                equipes: [],
                cnes_unidades: [],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                emailVerified: false,
                active: true
            }

            await setDoc(doc(db, 'users', user.uid), profileData)

            // Enviar email de verificação
            await sendEmailVerification(user)

            console.log('✅ Conta criada com sucesso')
            
            return user

        } catch (error) {
            console.error('❌ Erro no registro:', error)
            
            const errorMessage = this.translateFirebaseError(error.code) || error.message
            throw new Error(errorMessage)
        }
    }

    /**
     * Logout
     */
    async signOut() {
        try {
            console.log('🚪 Fazendo logout...')
            await signOut(auth)
            console.log('✅ Logout realizado')
        } catch (error) {
            console.error('❌ Erro no logout:', error)
            throw new Error('Erro ao fazer logout')
        }
    }

    /**
     * Enviar email de redefinição de senha
     */
    async resetPassword(email) {
        try {
            if (!validateEmail(email)) {
                throw new Error('Email inválido')
            }

            console.log('📧 Enviando email de redefinição...')
            await sendPasswordResetEmail(auth, email)
            console.log('✅ Email de redefinição enviado')
        } catch (error) {
            console.error('❌ Erro ao enviar email:', error)
            const errorMessage = this.translateFirebaseError(error.code) || error.message
            throw new Error(errorMessage)
        }
    }

    /**
     * Atualizar senha do usuário atual
     */
    async updateUserPassword(currentPassword, newPassword) {
        try {
            if (!this.currentUser) {
                throw new Error('Usuário não autenticado')
            }

            // Validar nova senha
            const passwordValidation = validatePassword(newPassword)
            if (!passwordValidation.valid) {
                throw new Error(passwordValidation.message)
            }

            console.log('🔒 Atualizando senha...')

            // Reautenticar usuário
            const credential = EmailAuthProvider.credential(
                this.currentUser.email, 
                currentPassword
            )
            await reauthenticateWithCredential(this.currentUser, credential)

            // Atualizar senha
            await updatePassword(this.currentUser, newPassword)

            console.log('✅ Senha atualizada')
        } catch (error) {
            console.error('❌ Erro ao atualizar senha:', error)
            const errorMessage = this.translateFirebaseError(error.code) || error.message
            throw new Error(errorMessage)
        }
    }

    /**
     * Atualizar perfil do usuário
     */
    async updateUserProfile(updates) {
        try {
            if (!this.currentUser) {
                throw new Error('Usuário não autenticado')
            }

            console.log('👤 Atualizando perfil...')

            // Atualizar no Firestore
            const updateData = {
                ...updates,
                updatedAt: serverTimestamp()
            }

            await updateDoc(doc(db, 'users', this.currentUser.uid), updateData)

            // Atualizar nome de exibição no Auth se necessário
            if (updates.name && updates.name !== this.currentUser.displayName) {
                await updateProfile(this.currentUser, { displayName: updates.name })
            }

            // Recarregar perfil
            await this.loadUserProfile(this.currentUser.uid)

            console.log('✅ Perfil atualizado')
        } catch (error) {
            console.error('❌ Erro ao atualizar perfil:', error)
            throw new Error('Erro ao atualizar perfil')
        }
    }

    /**
     * Reenviar email de verificação
     */
    async resendEmailVerification() {
        try {
            if (!this.currentUser) {
                throw new Error('Usuário não autenticado')
            }

            console.log('📧 Reenviando email de verificação...')
            await sendEmailVerification(this.currentUser)
            console.log('✅ Email reenviado')
        } catch (error) {
            console.error('❌ Erro ao reenviar email:', error)
            throw new Error('Erro ao reenviar email de verificação')
        }
    }

    /**
     * Verificar se usuário tem permissão
     */
    hasPermission(permission) {
        if (!this.userProfile) return false

        const role = this.userProfile.role
        const permissions = {
            'create_user': ['superadmin', 'admin', 'coord'],
            'manage_users': ['superadmin', 'admin', 'coord'], 
            'delete_user': ['superadmin', 'admin'],
            'create_patient': ['superadmin', 'admin', 'coord', 'agente'],
            'view_all_municipalities': ['superadmin', 'admin'],
            'export_data': ['superadmin', 'admin', 'coord'],
            'manage_parameters': ['superadmin', 'admin']
        }

        return permissions[permission]?.includes(role) || false
    }

    /**
     * Verificar se usuário pode acessar município
     */
    canAccessMunicipality(ibgeCode) {
        if (!this.userProfile) return false
        
        const role = this.userProfile.role
        
        // SuperAdmin e Admin podem acessar todos
        if (['superadmin', 'admin'].includes(role)) return true
        
        // Outros só podem acessar seu município
        return this.userProfile.ibge_municipio === ibgeCode
    }

    /**
     * Validar dados do usuário
     */
    validateUserData(userData) {
        const { email, password, name, cpf } = userData

        if (!email || !validateEmail(email)) {
            throw new Error('Email inválido')
        }

        const passwordValidation = validatePassword(password)
        if (!passwordValidation.valid) {
            throw new Error(passwordValidation.message)
        }

        if (!name || name.trim().length < 2) {
            throw new Error('Nome deve ter pelo menos 2 caracteres')
        }

        if (cpf && !validateCPF(cpf)) {
            throw new Error('CPF inválido')
        }
    }

    /**
     * Traduzir erros do Firebase
     */
    translateFirebaseError(errorCode) {
        const errorMessages = {
            'auth/user-not-found': 'Usuário não encontrado',
            'auth/wrong-password': 'Senha incorreta',
            'auth/email-already-in-use': 'Email já está em uso',
            'auth/weak-password': 'Senha muito fraca',
            'auth/invalid-email': 'Email inválido',
            'auth/user-disabled': 'Usuário desabilitado',
            'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
            'auth/network-request-failed': 'Erro de conexão. Verifique sua internet',
            'auth/requires-recent-login': 'Operação sensível. Faça login novamente'
        }

        return errorMessages[errorCode]
    }

    /**
     * Adicionar listener de mudança de estado
     */
    onAuthStateChange(callback) {
        this.authStateListeners.add(callback)
        
        // Se já temos um usuário, chama imediatamente
        if (this.currentUser) {
            callback(this.currentUser)
        }

        // Retorna função para remover listener
        return () => this.authStateListeners.delete(callback)
    }

    /**
     * Notificar listeners sobre mudança de estado
     */
    notifyAuthStateListeners(user) {
        this.authStateListeners.forEach(callback => {
            try {
                callback(user)
            } catch (error) {
                console.error('Erro em auth state listener:', error)
            }
        })
    }

    /**
     * Getters para propriedades importantes
     */
    get isAuthenticated() {
        return !!this.currentUser
    }

    get isEmailVerified() {
        return this.currentUser?.emailVerified || false
    }

    get user() {
        return this.currentUser
    }

    get profile() {
        return this.userProfile
    }

    get userRole() {
        return this.userProfile?.role || null
    }

    get userMunicipality() {
        return this.userProfile?.ibge_municipio || null
    }
}