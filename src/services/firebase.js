// Configuração do Firebase v9 (modular)
import { initializeApp } from 'firebase/app'
import { 
    getAuth, 
    connectAuthEmulator,
    setPersistence,
    browserLocalPersistence
} from 'firebase/auth'
import { 
    getFirestore, 
    connectFirestoreEmulator,
    enableNetwork,
    disableNetwork,
    enableIndexedDbPersistence,
    initializeFirestore
} from 'firebase/firestore'
import { 
    getStorage, 
    connectStorageEmulator 
} from 'firebase/storage'

// Configuração do projeto Firebase
// IMPORTANTE: Substitua pelos valores do seu projeto Firebase
const firebaseConfig = {
    apiKey: "sua-api-key",
    authDomain: "idoso-ms.firebaseapp.com", 
    projectId: "idoso-ms",
    storageBucket: "idoso-ms.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123def456"
}

// Variáveis globais
let app = null
let auth = null 
let db = null
let storage = null
let isInitialized = false

/**
 * Inicializa o Firebase e seus serviços
 */
export async function initializeFirebaseApp() {
    if (isInitialized) {
        return { app, auth, db, storage }
    }

    try {
        console.log('🔥 Inicializando Firebase...')
        
        // Inicializar app Firebase
        app = initializeApp(firebaseConfig)
        
        // Inicializar Auth
        auth = getAuth(app)
        await setPersistence(auth, browserLocalPersistence)
        
        // Inicializar Firestore com persistência offline
        db = initializeFirestore(app, {
            experimentalForceLongPolling: false,
            cacheSizeBytes: 50 * 1024 * 1024 // 50MB cache
        })
        
        // Inicializar Storage
        storage = getStorage(app)
        
        // Configurar emuladores em desenvolvimento
        if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
            await connectToEmulators()
        }
        
        // Habilitar persistência offline do Firestore
        await enableOfflinePersistence()
        
        isInitialized = true
        console.log('✅ Firebase inicializado com sucesso')
        
        return { app, auth, db, storage }
        
    } catch (error) {
        console.error('❌ Erro ao inicializar Firebase:', error)
        throw new Error(`Falha na inicialização do Firebase: ${error.message}`)
    }
}

/**
 * Conecta aos emuladores Firebase (desenvolvimento)
 */
async function connectToEmulators() {
    try {
        console.log('🔧 Conectando aos emuladores Firebase...')
        
        // Auth Emulator
        if (!auth._delegate?._config?.emulator) {
            connectAuthEmulator(auth, 'http://127.0.0.1:9099')
        }
        
        // Firestore Emulator
        if (!db._delegate?._databaseId?.projectId?.includes('demo-')) {
            connectFirestoreEmulator(db, '127.0.0.1', 8080)
        }
        
        // Storage Emulator
        if (!storage._location?.bucket?.includes('demo-')) {
            connectStorageEmulator(storage, '127.0.0.1', 9199)
        }
        
        console.log('✅ Emuladores conectados')
        
    } catch (error) {
        console.warn('⚠️ Erro ao conectar emuladores:', error.message)
        // Não bloquear a aplicação se emuladores falharem
    }
}

/**
 * Habilita persistência offline do Firestore
 */
async function enableOfflinePersistence() {
    try {
        await enableIndexedDbPersistence(db)
        console.log('✅ Persistência offline habilitada')
    } catch (error) {
        if (error.code === 'failed-precondition') {
            console.warn('⚠️ Múltiplas abas abertas, persistência limitada')
        } else if (error.code === 'unimplemented') {
            console.warn('⚠️ Browser não suporta persistência offline')
        } else {
            console.error('❌ Erro ao habilitar persistência:', error)
        }
    }
}

/**
 * Gerencia status de conexão online/offline
 */
export class ConnectionManager {
    constructor() {
        this.isOnline = navigator.onLine
        this.listeners = new Set()
        this.setupEventListeners()
    }

    setupEventListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true
            this.enableFirestore()
            this.notifyListeners('online')
        })

        window.addEventListener('offline', () => {
            this.isOnline = false
            this.disableFirestore()
            this.notifyListeners('offline')
        })
    }

    async enableFirestore() {
        try {
            await enableNetwork(db)
            console.log('📡 Firestore online')
        } catch (error) {
            console.error('Erro ao habilitar rede Firestore:', error)
        }
    }

    async disableFirestore() {
        try {
            await disableNetwork(db)
            console.log('📴 Firestore offline')
        } catch (error) {
            console.error('Erro ao desabilitar rede Firestore:', error)
        }
    }

    onConnectionChange(callback) {
        this.listeners.add(callback)
        return () => this.listeners.delete(callback)
    }

    notifyListeners(status) {
        this.listeners.forEach(callback => {
            try {
                callback(status, this.isOnline)
            } catch (error) {
                console.error('Erro em listener de conexão:', error)
            }
        })
    }
}

/**
 * Função de conveniência para inicializar tudo
 */
export async function initializeApp() {
    const firebase = await initializeFirebaseApp()
    const connectionManager = new ConnectionManager()
    
    return {
        ...firebase,
        connectionManager,
        isInitialized: () => isInitialized
    }
}

// Exportar instâncias para uso direto
export { app, auth, db, storage }

// Exportar como default para backwards compatibility
export default {
    initializeApp,
    initializeFirebaseApp,
    ConnectionManager,
    app: () => app,
    auth: () => auth, 
    db: () => db,
    storage: () => storage
}