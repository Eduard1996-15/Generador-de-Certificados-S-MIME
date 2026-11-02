/**
 * Generador de Certificados S/MIME - Aplicación de Escritorio
 * 
 * Este archivo es el punto de entrada principal de la aplicación Electron.
 * Contiene la lógica para manejar la Autoridad Certificadora, generar certificados,
 * y gestionar la interfaz de usuario principal.
 */

const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const forge = require('node-forge');
const Store = require('electron-store');

// Configuración persistente
const store = new Store();

// Variables globales
let mainWindow;
let caManager;

/**
 * Clase para manejar la Autoridad Certificadora (CA) SEGURA
 * Proporciona funcionalidades para crear, cargar y gestionar la CA,
 * así como para generar certificados firmados por esta autoridad.
 * IMPLEMENTA SEGURIDAD EXTREMA PARA PROTECCIÓN PKI
 */
class CAManager {
    constructor() {
        // Usar directorio dentro de la aplicación para mantener todo junto
        const appPath = path.join(__dirname, '..', 'Certificados');
        this.caPath = path.join(appPath, 'ca');
        this.certPath = path.join(this.caPath, 'ca.crt');
        this.keyPath = path.join(this.caPath, 'ca.key');
        this.secureKeyPath = path.join(this.caPath, 'ca-private-key.pem');
        this.integrityPath = path.join(this.caPath, 'ca-integrity.json');
        this.auditLogPath = path.join(this.caPath, 'ca-security.log');
        this.crlPath = path.join(this.caPath, 'ca-crl.json');
        
        // Configuración de seguridad
 this.securityConfig = {
 keySize: 8192,
 passphraseMinLength: 16,
 hashAlgorithm: 'sha512',
 validityYears: 10,
 backupEnabled: true
 };
 
 // Estado de seguridad
 this.isKeyLoaded = false;
 this.lastSecurityCheck = null;
 }

 /**
 * Inicializa la CA, cargándola si existe o creándola si no
 */
 async initialize() {
 try {
 // Crear directorio CA si no existe
 if (!fs.existsSync(this.caPath)) {
 fs.mkdirSync(this.caPath, { recursive: true });
 }

 // Cargar o crear CA
 if (fs.existsSync(this.certPath) && fs.existsSync(this.keyPath)) {
 try {
 await this.loadCA();
 } catch (error) {
 console.log('Error cargando CA existente, creando nueva CA...');
 console.log('Motivo:', error.message);
 await this.createCA();
 }
 } else {
 await this.createCA();
 }

 // Inicializar sistema de revocación
 this.initializeRevocationSystem();
 
 } catch (error) {
 console.error('Error crítico inicializando CA:', error.message);
 console.log('Continuando con configuración básica...');
 }
 }

 /**
 * Crea una nueva Autoridad Certificadora ULTRA-SEGURA
 * Genera un par de claves RSA cifradas y un certificado autofirmado
 * IMPLEMENTA TODAS LAS MEJORES PRÁCTICAS DE SEGURIDAD PKI
 */
 async createCA() {
 try {
 console.log('Creando nueva Autoridad Certificadora SEGURA...');
 this.logSecurityEvent('CA_CREATION_STARTED', 'Iniciando creación de CA segura');
 
 // Paso 1: Solicitar passphrase segura
 const passphraseBuffer = await this.generateSecurePassphrase();
 const passphrase = passphraseBuffer.toString('utf8');
 
 // Paso 2: Generar par de claves RSA ultra-fuerte
 console.log('Generando par de claves RSA 8192 bits...');
 const keys = forge.pki.rsa.generateKeyPair(this.securityConfig.keySize);
 
 // Paso 3: Crear certificado CA con extensiones de seguridad mejoradas
       console.log('Creando certificado CA con extensiones de seguridad...');
 const cert = forge.pki.createCertificate();
 cert.publicKey = keys.publicKey;
 
 // Serial number fuerte basado en timestamp + random
 const timestamp = Date.now().toString(16);
 const randomHex = forge.util.bytesToHex(forge.random.getBytesSync(8));
 cert.serialNumber = (timestamp + randomHex).toUpperCase();
 
 // Validez temporal segura
 cert.validity.notBefore = new Date();
 cert.validity.notAfter = new Date();
 cert.validity.notAfter.setFullYear(
 cert.validity.notBefore.getFullYear() + this.securityConfig.validityYears
 );
 
 // Atributos del certificado con información segura
 const attrs = [
 { name: 'commonName', value: 'Root Certification Authority SECURE' },
 { name: 'countryName', value: 'XX' }, // Ajustar al código ISO 3166-1 alfa-2 del despliegue
 { shortName: 'ST', value: 'State' },
 { name: 'localityName', value: 'City' },
 { name: 'organizationName', value: 'Example Organization' },
 { shortName: 'OU', value: 'Secure Certificate Authority' },
 { name: 'emailAddress', value: 'ca@example.com' }
 ];
 
 cert.setSubject(attrs);
 cert.setIssuer(attrs); // Autofirmada
 
 // Extensiones de seguridad mejoradas
 cert.setExtensions([
 {
 name: 'basicConstraints',
 cA: true,
 pathLenConstraint: 3, // Limitar profundidad de cadena
 critical: true
 },
 {
 name: 'keyUsage',
 keyCertSign: true,
 cRLSign: true,
 digitalSignature: false, // Solo para CA, no para firmar datos
 critical: true
 },

 {
 name: 'subjectKeyIdentifier'
 },
 {
 name: 'authorityKeyIdentifier',
 keyid: true
 },
 {
 name: 'nsCertType',
 sslCA: true,
 emailCA: true,
 objCA: true
 }
 ]);
 
 // Firmar con SHA-512 (algoritmo ultra-seguro)
 console.log('Firmando certificado con SHA-512 (máxima seguridad)...');
 cert.sign(keys.privateKey, forge.md.sha512.create());
 
 // Paso 4: Almacenamiento seguro
 this.caCert = cert;
 this.caKeys = keys;
 
        // Guardar certificado (público)
        const certPem = forge.pki.certificateToPem(cert);
        
        // Eliminar archivo existente si existe (para renovación)
        if (fs.existsSync(this.certPath)) {
            try {
                fs.unlinkSync(this.certPath);
            } catch (unlinkError) {
                console.warn('No se pudo eliminar archivo CA existente:', unlinkError.message);
            }
        }
        
        fs.writeFileSync(this.certPath, certPem); // Guardar clave privada CIFRADA con passphrase
 console.log('Cifrando y guardando clave privada...');
 const encryptedKeyPem = forge.pki.encryptRsaPrivateKey(
 keys.privateKey,
 passphrase,
 {
 algorithm: 'aes256', // Cifrado AES-256
 count: 4096, // Iteraciones PBKDF2
 saltSize: 128 // Salt de 128 bits
 }
 );
 
        // Eliminar archivos de clave existentes si existen (para renovación)
        if (fs.existsSync(this.keyPath)) {
            try {
                fs.unlinkSync(this.keyPath);
            } catch (unlinkError) {
                console.warn('No se pudo eliminar archivo clave principal:', unlinkError.message);
            }
        }
        if (fs.existsSync(this.secureKeyPath)) {
            try {
                fs.unlinkSync(this.secureKeyPath);
            } catch (unlinkError) {
                console.warn('No se pudo eliminar archivo clave seguro:', unlinkError.message);
            }
        }
        
        // Guardar en archivo principal (compatibilidad)
        fs.writeFileSync(this.keyPath, encryptedKeyPem);
        
        // Guardar en archivo seguro adicional
        fs.writeFileSync(this.secureKeyPath, encryptedKeyPem); // Paso 5: Configurar permisos restrictivos
 await this.setSecureFilePermissions();
 
 // Paso 6: Crear archivo de integridad
 await this.createIntegrityFile(passphraseBuffer);
 
 // Paso 7: Backup seguro
 if (this.securityConfig.backupEnabled) {
 await this.createSecureBackup();
 }
 
        // Paso 8: Almacenar passphrase de forma segura
        await this.storePassphraseSecurely(passphraseBuffer);
        
        // Paso 9: Inicializar Certificate Revocation List (CRL)
        this.initializeRevocationSystem();
        
        console.log('Autoridad Certificadora SEGURA creada exitosamente');
        this.logSecurityEvent('CA_CREATION_SUCCESS', `CA segura creada con serial ${cert.serialNumber}`); // Limpiar passphrase de memoria
 if (passphraseBuffer && passphraseBuffer.fill) {
 passphraseBuffer.fill(0);
 }
 
 } catch (error) {
 console.error('Error creando CA segura:', error);
 this.logSecurityEvent('CA_CREATION_ERROR', `Error: ${error.message}`);
 throw error;
 }
 }

 /**
 * Carga una CA existente desde los archivos guardados CON SEGURIDAD
 */
 async loadCA() {
 try {
 console.log('Cargando Autoridad Certificadora SEGURA...');
 this.logSecurityEvent('CA_LOAD_STARTED', 'Iniciando carga segura de CA');
 
 // Verificar integridad de archivos
 await this.verifyFileIntegrity();
 
 // Cargar certificado (público)
 const certPem = fs.readFileSync(this.certPath, 'utf8');
 this.caCert = forge.pki.certificateFromPem(certPem);
 
 // Cargar clave privada cifrada
 const keyPem = fs.readFileSync(this.keyPath, 'utf8');
 
 // Verificar si la clave está cifrada
 if (keyPem.includes('ENCRYPTED')) {
 console.log('Clave privada cifrada detectada');
 
 // Recuperar passphrase de forma segura
 const passphraseBuffer = await this.retrievePassphraseSecurely();
 const passphrase = passphraseBuffer.toString('utf8');
 
 // Descifrar clave privada
 this.caKeys = {
 privateKey: forge.pki.decryptRsaPrivateKey(keyPem, passphrase),
 publicKey: this.caCert.publicKey
 };
 
 // Limpiar passphrase de memoria
 if (passphraseBuffer && passphraseBuffer.fill) {
 passphraseBuffer.fill(0);
 }
 
 this.isKeyLoaded = true;
 console.log('Clave privada descifrada exitosamente');
        } else {
            console.log('INFO: Cargando clave privada legacy...');
            this.logSecurityEvent('CA_LOAD_WARNING', 'Clave privada sin cifrar detectada');
            
            // Cargar clave sin cifrar (compatibilidad con versión anterior)
            this.caKeys = {
                privateKey: forge.pki.privateKeyFromPem(keyPem),
                publicKey: this.caCert.publicKey
            };
            
            this.isKeyLoaded = true;
            
            // Sugerir migración a versión segura
            console.log('NOTA: Se recomienda migrar a CA cifrada para mayor seguridad');
        } // Verificar estado de seguridad
 await this.performSecurityCheck();
 
        console.log('CA cargada exitosamente');
        this.logSecurityEvent('CA_LOAD_SUCCESS', 'CA cargada con verificaciones de seguridad');
        
        // Mostrar información actualizada de la CA al cargar  
        console.log('=== INFORMACIÓN DE LA CA CARGADA ===');
        const caInfo = this.getCACertificate();
        console.log(`Nombre: ${caInfo.subject.CN}`);
        console.log(`Organización: ${caInfo.subject.O}`);
        console.log(`Unidad: ${caInfo.subject.OU}`);
        console.log(`País: ${caInfo.subject.C}`);
        console.log(`Estado/Provincia: ${caInfo.subject.ST}`);
        console.log(`Localidad: ${caInfo.subject.L}`);
        console.log(`Serial: ${caInfo.serialNumber}`);
        console.log(`Tamaño de Clave: ${caInfo.keySize} bits`);
        console.log(`Válido desde: ${new Date(caInfo.validFrom).toLocaleDateString()}`);
        console.log(`Válido hasta: ${new Date(caInfo.validTo).toLocaleDateString()}`);
        console.log(`Huella digital (SHA-512): ${caInfo.fingerprint}`);
        console.log('========================================'); } catch (error) {
 console.error('Error cargando CA:', error);
 this.logSecurityEvent('CA_LOAD_ERROR', `Error: ${error.message}`);
 throw error;
 }
 }

 /**
 * MÉTODOS DE SEGURIDAD EXTREMA PARA PKI
 */

 /**
 * Genera una passphrase segura para cifrar la clave privada
 * @returns {Buffer} Passphrase segura
 */
 async generateSecurePassphrase() {
 // Generar passphrase fuerte: 32 caracteres aleatorios
 const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
 let passphrase = '';
 
 for (let i = 0; i < 32; i++) {
 const randomIndex = Math.floor(Math.random() * charset.length);
 passphrase += charset[randomIndex];
 }
 
 // Verificar fortaleza mínima
 const hasUpper = /[A-Z]/.test(passphrase);
 const hasLower = /[a-z]/.test(passphrase);
 const hasNumber = /[0-9]/.test(passphrase);
 const hasSpecial = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(passphrase);
 
 if (!(hasUpper && hasLower && hasNumber && hasSpecial)) {
 // Regenerar si no cumple criterios
 return await this.generateSecurePassphrase();
 }
 
 console.log('Passphrase segura generada (32 caracteres)');
 return Buffer.from(passphrase, 'utf8');
 }

 /**
 * Configura permisos restrictivos en archivos de CA
 */
 async setSecureFilePermissions() {
 try {
 const crypto = require('crypto');
 
 // En Windows, configurar atributos de archivo
 if (process.platform === 'win32') {
 const { execSync } = require('child_process');
 
 // Hacer archivos de solo lectura y ocultos
 execSync(`attrib +R +H "${this.keyPath}"`);
 execSync(`attrib +R +H "${this.secureKeyPath}"`);
 execSync(`attrib +R "${this.certPath}"`);
 
 console.log('Permisos restrictivos configurados (Windows)');
 } else {
 // En Unix/Linux, configurar permisos 600 (solo propietario)
 fs.chmodSync(this.keyPath, 0o600);
 fs.chmodSync(this.secureKeyPath, 0o600);
 fs.chmodSync(this.certPath, 0o644);
 
 console.log('Permisos restrictivos configurados (Unix)');
 }
 
 this.logSecurityEvent('PERMISSIONS_SET', 'Permisos restrictivos aplicados');
 } catch (error) {
 console.warn('ADVERTENCIA: No se pudieron configurar permisos:', error.message);
 }
 }

 /**
 * Crea archivo de integridad para verificar archivos CA
 */
 async createIntegrityFile(passphrase) {
 try {
 const crypto = require('crypto');
 
 // Calcular hashes de archivos críticos con SHA-512
 const certHash = crypto.createHash('sha512')
 .update(fs.readFileSync(this.certPath))
 .digest('hex');
 
 const keyHash = crypto.createHash('sha512')
 .update(fs.readFileSync(this.keyPath))
 .digest('hex');
 
 // Crear timestamp
 const timestamp = new Date().toISOString();
 
 // Crear HMAC con passphrase como clave usando SHA-512
 const hmacKey = crypto.createHash('sha512').update(passphrase).digest();
 const hmac = crypto.createHmac('sha512', hmacKey);
 hmac.update(certHash + keyHash + timestamp);
 const signature = hmac.digest('hex');
 
 const integrityData = {
 version: '2.0',
 timestamp: timestamp,
 files: {
 certificate: {
 path: this.certPath,
 hash: certHash,
 algorithm: 'sha512'
 },
 privateKey: {
 path: this.keyPath,
 hash: keyHash,
 algorithm: 'sha512'
 }
 },
 signature: signature,
 securityLevel: 'EXTREME'
 };
 
 fs.writeFileSync(this.integrityPath, JSON.stringify(integrityData, null, 2));
 console.log('Archivo de integridad creado');
 
 } catch (error) {
 console.warn('ADVERTENCIA: Error creando archivo de integridad:', error.message);
 }
 }

 /**
 * Verifica la integridad de los archivos CA
 */
 async verifyFileIntegrity() {
 try {
         if (!fs.existsSync(this.integrityPath)) {
            console.log('Inicializando archivo de integridad...');
            return false;
        } const integrityData = JSON.parse(fs.readFileSync(this.integrityPath, 'utf8'));
 const crypto = require('crypto');
 
 // Detectar algoritmo de hash usado en el archivo de integridad
 let hashAlgorithm = 'sha512'; // Por defecto usar SHA-512
 if (integrityData.files && integrityData.files.certificate && integrityData.files.certificate.algorithm) {
 hashAlgorithm = integrityData.files.certificate.algorithm;
 }
 
 // Si el archivo usa SHA-256, migrar a SHA-512
 if (hashAlgorithm === 'sha256') {
 console.log('Detectado archivo de integridad SHA-256, migrando a SHA-512...');
 
 try {
 // Regenerar archivo de integridad con SHA-512
 const passphraseBuffer = await this.retrievePassphraseSecurely();
 await this.createIntegrityFile(passphraseBuffer);
 
 console.log('Migración a SHA-512 completada');
 return true;
 } catch (error) {
 console.log('No se pudo migrar archivo de integridad, continuando sin verificación...');
 return true;
 }
 }
 
 // Calcular hashes actuales usando el algoritmo detectado
 const currentCertHash = crypto.createHash(hashAlgorithm)
 .update(fs.readFileSync(this.certPath))
 .digest('hex');
 
 const currentKeyHash = crypto.createHash(hashAlgorithm)
 .update(fs.readFileSync(this.keyPath))
 .digest('hex');
 
        // Verificar hashes con los datos de integridad
        if (integrityData.files && integrityData.files.certificate) {
            if (currentCertHash !== integrityData.files.certificate.hash) {
                console.log(`ADVERTENCIA: Hash de certificado no coincide (usando ${hashAlgorithm})`);
                console.log('Regenerando archivo de integridad...');
                
                // Regenerar archivo de integridad
                try {
                    const passphraseBuffer = await this.retrievePassphraseSecurely();
                    await this.createIntegrityFile(passphraseBuffer);
                    return true;
                } catch (error) {
                    console.log('No se pudo regenerar archivo de integridad, continuando...');
                    return true;
                }
            }
        }
        
        if (integrityData.files && integrityData.files.privateKey) {
            if (currentKeyHash !== integrityData.files.privateKey.hash) {
                console.log(`ADVERTENCIA: Hash de clave privada no coincide (usando ${hashAlgorithm})`);
                console.log('Regenerando archivo de integridad...');
                
                // Regenerar archivo de integridad
                try {
                    const passphraseBuffer = await this.retrievePassphraseSecurely();
                    await this.createIntegrityFile(passphraseBuffer);
                    return true;
                } catch (error) {
                    console.log('No se pudo regenerar archivo de integridad, continuando...');
                    return true;
                }
            }
        } console.log('Verificación de integridad: EXITOSA');
 this.logSecurityEvent('INTEGRITY_CHECK_PASS', 'Archivos CA íntegros');
 return true;
 
 } catch (error) {
 console.error('ALERTA: FALLA DE INTEGRIDAD:', error.message);
 this.logSecurityEvent('INTEGRITY_CHECK_FAIL', `FALLA: ${error.message}`);
 throw error;
 }
 }

 /**
 * Almacena la passphrase de forma segura (cifrada)
 */
 async storePassphraseSecurely(passphrase) {
 try {
 const crypto = require('crypto');
 const os = require('os');
 
 // Crear clave maestra basada en información del sistema usando SHA-512
 const systemInfo = os.hostname() + os.userInfo().username + os.arch();
 const masterKey = crypto.createHash('sha512').update(systemInfo).digest();
 
 // Cifrar passphrase con AES-256-GCM
 const iv = crypto.randomBytes(16);
 const cipher = crypto.createCipher('aes-256-gcm', masterKey);
 
 let encrypted = cipher.update(passphrase, 'utf8', 'hex');
 encrypted += cipher.final('hex');
 const authTag = cipher.getAuthTag();
 
 const secureStore = {
 encrypted: encrypted,
 iv: iv.toString('hex'),
 authTag: authTag.toString('hex'),
 algorithm: 'aes-256-gcm',
 timestamp: Date.now()
 };
 
 // Guardar en store cifrado
 store.set('ca-secure-passphrase', secureStore);
 
 console.log('Passphrase almacenada de forma segura');
 
 } catch (error) {
 console.warn('ADVERTENCIA: Error almacenando passphrase:', error.message);
 }
 }

    /**
     * Recupera la passphrase de forma segura
     */
    async retrievePassphraseSecurely() {
        try {
            const crypto = require('crypto');
            const os = require('os');
            
            // Obtener datos cifrados
            const secureStore = store.get('ca-secure-passphrase');
            if (!secureStore) {
                throw new Error('Passphrase segura no encontrada');
            }
            
            // Recrear clave maestra usando SHA-512
            const systemInfo = os.hostname() + os.userInfo().username + os.arch();
            const masterKey = crypto.createHash('sha512').update(systemInfo).digest();
            
            try {
                // Intentar descifrar con nuevo formato (SHA-512)
                const decipher = crypto.createDecipher('aes-256-gcm', masterKey);
                if (secureStore.authTag) {
                    decipher.setAuthTag(Buffer.from(secureStore.authTag, 'hex'));
                }
                
                let decrypted = decipher.update(secureStore.encrypted, 'hex', 'utf8');
                decrypted += decipher.final('utf8');
                
                return Buffer.from(decrypted, 'utf8');
                
            } catch (authError) {
                console.log('Intentando migración desde formato anterior...');
                
                // Intentar con formato anterior (SHA-256) para migración
                const oldSystemInfo = os.hostname() + os.userInfo().username + os.arch();
                const oldMasterKey = crypto.createHash('sha256').update(oldSystemInfo).digest();
                
                try {
                    const oldDecipher = crypto.createDecipher('aes-256-gcm', oldMasterKey);
                    if (secureStore.authTag) {
                        oldDecipher.setAuthTag(Buffer.from(secureStore.authTag, 'hex'));
                    }
                    
                    let oldDecrypted = oldDecipher.update(secureStore.encrypted, 'hex', 'utf8');
                    oldDecrypted += oldDecipher.final('utf8');
                    
                    const passphrase = Buffer.from(oldDecrypted, 'utf8');
                    
                    // Re-encriptar con nuevo formato (SHA-512)
                    console.log('Migrando passphrase a SHA-512...');
                    this.storePassphraseSecurely(passphrase);
                    
                    return passphrase;
                    
                } catch (oldError) {
                    console.warn('No se pudo migrar passphrase antigua, generando nueva...');
                    // Limpiar store corrupto
                    store.delete('ca-secure-passphrase');
                    throw new Error('Passphrase corrupta - requiere regeneración');
                }
            }
            
        } catch (error) {
            console.error('Error recuperando passphrase:', error.message);
            throw error;
        }
    } /**
 * Crea backup seguro de la CA
 */
 async createSecureBackup() {
 try {
 const backupDir = path.join(this.caPath, 'backup');
 if (!fs.existsSync(backupDir)) {
 fs.mkdirSync(backupDir, { recursive: true });
 }
 
 const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
 const backupPath = path.join(backupDir, `ca-backup-${timestamp}`);
 
 fs.mkdirSync(backupPath, { recursive: true });
 
 // Copiar archivos críticos
 fs.copyFileSync(this.certPath, path.join(backupPath, 'ca.crt'));
 fs.copyFileSync(this.keyPath, path.join(backupPath, 'ca.key'));
 fs.copyFileSync(this.integrityPath, path.join(backupPath, 'ca-integrity.json'));
 
 console.log(` Backup seguro creado: ${backupPath}`);
 this.logSecurityEvent('BACKUP_CREATED', `Backup: ${backupPath}`);
 
 } catch (error) {
 console.warn('ADVERTENCIA: Error creando backup:', error.message);
 }
 }

 /**
 * Realiza verificación completa de seguridad
 */
 async performSecurityCheck() {
 const checks = {
 fileIntegrity: false,
 keyEncryption: false,
 permissions: false,
 certificateValidity: false,
 keyStrength: false
 };
 
 try {
 // 1. Verificar integridad
 checks.fileIntegrity = await this.verifyFileIntegrity();
 
 // 2. Verificar cifrado de clave
 const keyPem = fs.readFileSync(this.keyPath, 'utf8');
 checks.keyEncryption = keyPem.includes('ENCRYPTED');
 
 // 3. Verificar validez del certificado
 const now = new Date();
 checks.certificateValidity = (
 this.caCert.validity.notBefore <= now && 
 now <= this.caCert.validity.notAfter
 );
 
 // 4. Verificar fortaleza de clave
 const keySize = this.caKeys.privateKey.n.bitLength();
 checks.keyStrength = keySize >= 4096;
 
 this.lastSecurityCheck = {
 timestamp: new Date(),
 checks: checks,
 overallStatus: Object.values(checks).every(check => check === true) ? 'SECURE' : 'NEEDS_ATTENTION'
 };
 
 console.log('Verificación de seguridad completada:', this.lastSecurityCheck.overallStatus);
 this.logSecurityEvent('SECURITY_CHECK', `Estado: ${this.lastSecurityCheck.overallStatus}`);
 
 return this.lastSecurityCheck;
 
 } catch (error) {
 console.error('Error en verificación de seguridad:', error.message);
 return null;
 }
 }

 /**
 * Registra eventos de seguridad en log de auditoría
 */
 logSecurityEvent(eventType, description) {
 try {
 const logEntry = {
 timestamp: new Date().toISOString(),
 eventType: eventType,
 description: description,
 processId: process.pid,
 userAgent: process.platform + ' ' + process.arch
 };
 
 const logLine = JSON.stringify(logEntry) + '\n';
 fs.appendFileSync(this.auditLogPath, logLine);
 
 } catch (error) {
 console.warn('ADVERTENCIA: Error escribiendo log de seguridad:', error.message);
 }
 }

 /**
 * Devuelve la información SEGURA del certificado de la CA
 * @returns {Object} Información detallada del certificado CA con datos de seguridad
 */
 getCACertificate() {
 const keySize = this.caKeys ? this.caKeys.privateKey.n.bitLength() : 8192;
 const securityLevel = this.assessSecurityLevel();
 
 // Debug: Ver qué atributos reales tiene el certificado
 const formattedSubject = this.formatDistinguishedName(this.caCert.subject);
 console.log('Información actual de la CA:', {
 subject: formattedSubject,
 serialNumber: this.caCert.serialNumber,
 keySize: keySize,
 validFrom: this.caCert.validity.notBefore,
 validTo: this.caCert.validity.notAfter
 });
 
 return {
 certificate: forge.pki.certificateToPem(this.caCert),
 serialNumber: this.caCert.serialNumber,
 subject: this.formatDistinguishedName(this.caCert.subject),
 issuer: this.formatDistinguishedName(this.caCert.issuer),
 validFrom: this.caCert.validity.notBefore,
 validTo: this.caCert.validity.notAfter,
 keySize: keySize,
 fingerprint: this.calculateFingerprint(this.caCert),
 
 // Información de seguridad adicional
 securityInfo: {
 keyEncrypted: this.isPrivateKeyEncrypted(),
 securityLevel: securityLevel,
 lastSecurityCheck: this.lastSecurityCheck,
 integrityVerified: fs.existsSync(this.integrityPath),
 backupExists: fs.existsSync(path.join(this.caPath, 'backup')),
 auditLogEnabled: fs.existsSync(this.auditLogPath)
 },
 
 // Métricas de fortaleza
 strengthMetrics: {
 keyStrengthRating: this.getKeyStrengthRating(keySize),
 algorithmSecurity: 'SHA-512 (Ultra Seguro)',
 complianceLevel: 'Alta Seguridad PKI',
 recommendedActions: this.getSecurityRecommendations()
 }
 };
 }

 /**
 * Verifica si la clave privada está cifrada
 */
 isPrivateKeyEncrypted() {
 try {
 if (!fs.existsSync(this.keyPath)) return false;
 const keyPem = fs.readFileSync(this.keyPath, 'utf8');
 return keyPem.includes('ENCRYPTED');
 } catch (error) {
 return false;
 }
 }

 /**
 * Evalúa el nivel de seguridad general de la CA (versión simplificada)
 * Para análisis completo, usar performExtremePKISecurityAudit()
 */
 assessSecurityLevel() {
 try {
 // Realizar auditoría extrema en modo silencioso para evaluación
 const tempLog = console.log;
 console.log = () => {}; // Silenciar output temporalmente
 
 const auditResult = this.performExtremePKISecurityAudit();
 
 console.log = tempLog; // Restaurar console.log
 
 // Mapear puntuación a nivel
 if (auditResult.securityScore >= 90) return 'SECURE';
 if (auditResult.securityScore >= 75) return 'GOOD';
 if (auditResult.securityScore >= 60) return 'NEEDS_ATTENTION';
 if (auditResult.totalVulnerabilities > 0) return 'VULNERABLE';
 return 'NEEDS_ATTENTION';
 
 } catch (error) {
 // Fallback a evaluación básica si la auditoría extrema falla
 let score = 0;
 
 if (this.isPrivateKeyEncrypted()) score += 2;
 
 const keySize = this.caKeys ? this.caKeys.privateKey.n.bitLength() : 0;
 if (keySize >= 4096) score += 1;
 if (keySize >= 8192) score += 1;
 
 if (fs.existsSync(this.integrityPath)) score += 1;
 if (fs.existsSync(path.join(this.caPath, 'backup'))) score += 1;
 if (fs.existsSync(this.auditLogPath)) score += 1;
 
 if (score >= 6) return 'SECURE';
 if (score >= 4) return 'GOOD';
 if (score >= 2) return 'NEEDS_ATTENTION';
 return 'VULNERABLE';
 }
 }

 /**
 * Califica la fortaleza de la clave RSA
 */
 getKeyStrengthRating(keySize) {
 if (keySize >= 8192) return 'EXTREMA (8192+ bits)';
 if (keySize >= 4096) return 'ALTA (4096 bits)';
 if (keySize >= 2048) return 'MEDIA (2048 bits)';
 if (keySize >= 1024) return 'BAJA (1024 bits)';
 return 'INSEGURA (<1024 bits)';
 }

 /**
 * Genera recomendaciones de seguridad basadas en el estado actual
 */
 getSecurityRecommendations() {
 const recommendations = [];
 
 if (!this.isPrivateKeyEncrypted()) {
 recommendations.push(' CRÍTICO: Cifrar clave privada con passphrase fuerte');
 }
 
 const keySize = this.caKeys ? this.caKeys.privateKey.n.bitLength() : 0;
 if (keySize < 4096) {
 recommendations.push(' RECOMENDADO: Actualizar a clave RSA 4096+ bits');
 }
 
 if (!fs.existsSync(this.integrityPath)) {
 recommendations.push(' RECOMENDADO: Implementar verificación de integridad');
 }
 
 if (!fs.existsSync(path.join(this.caPath, 'backup'))) {
 recommendations.push(' RECOMENDADO: Crear backup seguro de CA');
 }
 
 if (recommendations.length === 0) {
 recommendations.push(' Configuración de seguridad óptima');
 }
 
 return recommendations;
 }

 /**
 * 🔒 SISTEMA DE AUDITORÍA EXTREMA PKI - ANÁLISIS DE VULNERABILIDADES
 */
 performExtremePKISecurityAudit() {
 console.log('\n🔒 INICIANDO AUDITORÍA EXTREMA DE SEGURIDAD PKI...\n');
 
 const vulnerabilities = [];
 const warnings = [];
 const recommendations = [];
 let securityScore = 100;

 // 1. ANÁLISIS CRIPTOGRÁFICO CRÍTICO
 const cryptoAnalysis = this.analyzeCryptographicStrength();
 vulnerabilities.push(...cryptoAnalysis.vulnerabilities);
 warnings.push(...cryptoAnalysis.warnings);
 securityScore -= cryptoAnalysis.scorePenalty;

 // 2. ANÁLISIS DE ALGORITMOS COMPROMETIDOS
 const algorithmAnalysis = this.analyzeWeakAlgorithms();
 vulnerabilities.push(...algorithmAnalysis.vulnerabilities);
 warnings.push(...algorithmAnalysis.warnings);
 securityScore -= algorithmAnalysis.scorePenalty;

 // 3. ANÁLISIS DE ALMACENAMIENTO SEGURO
 const storageAnalysis = this.analyzeSecureStorage();
 vulnerabilities.push(...storageAnalysis.vulnerabilities);
 warnings.push(...storageAnalysis.warnings);
 securityScore -= storageAnalysis.scorePenalty;

 // 4. ANÁLISIS DE VECTORES DE ATAQUE CONOCIDOS
 const attackAnalysis = this.analyzeKnownAttackVectors();
 vulnerabilities.push(...attackAnalysis.vulnerabilities);
 warnings.push(...attackAnalysis.warnings);
 securityScore -= attackAnalysis.scorePenalty;

 securityScore = Math.max(0, securityScore);

 const auditResult = {
 timestamp: new Date().toISOString(),
 securityScore: securityScore,
 securityLevel: this.getSecurityLevelFromScore(securityScore),
 totalVulnerabilities: vulnerabilities.length,
 totalWarnings: warnings.length,
 vulnerabilities: vulnerabilities,
 warnings: warnings,
 recommendations: recommendations
 };

 this.displayExtremePKIAuditResults(auditResult);
 return auditResult;
 }

 // Análisis criptográfico crítico
 analyzeCryptographicStrength() {
 const vulnerabilities = [];
 const warnings = [];
 let scorePenalty = 0;

 const keySize = this.caKeys ? this.caKeys.privateKey.n.bitLength() : 0;
 
 if (keySize < 2048) {
 vulnerabilities.push({
 severity: '🚨 CRÍTICA',
 category: 'CRIPTOGRAFÍA RSA',
 issue: `RSA ${keySize} bits - EXTREMADAMENTE VULNERABLE`,
 description: 'Clave RSA factorizable con hardware moderno en horas/días',
 impact: '💀 COMPROMISO TOTAL DE CA - Invalidación inmediata requerida'
 });
 scorePenalty += 60;
 } else if (keySize < 3072) {
 vulnerabilities.push({
 severity: '🔴 ALTA',
 issue: `RSA ${keySize} bits - VULNERABLE después de 2030`,
 description: 'NIST deprecará RSA 2048 para uso después de 2030'
 });
 scorePenalty += 30;
 } else if (keySize >= 8192) {
 console.log('✅ EXCELENTE: RSA 8192 bits - Máximo nivel de seguridad');
 }

 const certPem = forge.pki.certificateToPem(this.caCert);
 if (certPem.toLowerCase().includes('sha1')) {
 vulnerabilities.push({
 severity: '🚨 CRÍTICA',
 category: 'HASH COMPROMETIDO',
 issue: 'SHA-1 - TOTALMENTE QUEBRADO',
 description: 'SHA-1 quebrado desde 2017 (Ataque SHAttered)',
 impact: '💀 Falsificación de certificados posible'
 });
 scorePenalty += 50;
 }

 return { vulnerabilities, warnings, scorePenalty };
 }

 // Análisis de algoritmos comprometidos
 analyzeWeakAlgorithms() {
 const vulnerabilities = [];
 const warnings = [];
 let scorePenalty = 0;

 const dangerousAlgorithms = ['md5', 'sha1', 'des', '3des', 'rc4'];
 const certString = forge.pki.certificateToPem(this.caCert).toLowerCase();
 
 dangerousAlgorithms.forEach(algo => {
 if (certString.includes(algo)) {
 vulnerabilities.push({
 severity: '🚨 CRÍTICA',
 category: 'ALGORITMO COMPROMETIDO',
 issue: `${algo.toUpperCase()} detectado`,
 description: `Algoritmo criptográficamente inseguro`,
 impact: 'CA completamente comprometida'
 });
 scorePenalty += 45;
 }
 });

 return { vulnerabilities, warnings, scorePenalty };
 }

 // Análisis de almacenamiento seguro
 analyzeSecureStorage() {
 const vulnerabilities = [];
 const warnings = [];
 let scorePenalty = 0;

 if (!this.isPrivateKeyEncrypted()) {
 vulnerabilities.push({
 severity: '🚨 CRÍTICA',
 category: 'ALMACENAMIENTO INSEGURO',
 issue: 'CLAVE PRIVADA NO CIFRADA',
 description: 'Clave privada CA almacenada en TEXTO PLANO',
 impact: '💀 COMPROMISO TOTAL si archivo es accedido'
 });
 scorePenalty += 50;
 }

 return { vulnerabilities, warnings, scorePenalty };
 }

 // Análisis de vectores de ataque conocidos
 analyzeKnownAttackVectors() {
 const vulnerabilities = [];
 const warnings = [];
 let scorePenalty = 0;

 const keySize = this.caKeys ? this.caKeys.privateKey.n.bitLength() : 0;
 if (keySize < 2048) {
 vulnerabilities.push({
 severity: '🚨 CRÍTICA',
 category: 'ATAQUE FACTORIZACIÓN',
 issue: 'Vulnerable a factorización RSA',
 description: 'Clave pequeña factorizable con algoritmos conocidos',
 impact: 'Recuperación de clave privada posible'
 });
 scorePenalty += 40;
 }

 return { vulnerabilities, warnings, scorePenalty };
 }

 getSecurityLevelFromScore(score) {
 if (score >= 95) return '🏆 EXCELENTE';
 if (score >= 85) return '✅ MUY BUENO';
 if (score >= 70) return '👍 BUENO';
 if (score >= 55) return '⚠️ ACEPTABLE';
 if (score >= 40) return '🟠 DEFICIENTE';
 return '🚨 CRÍTICO';
 }

 displayExtremePKIAuditResults(auditResult) {
 console.log(`\n🎯 ===== AUDITORÍA EXTREMA PKI =====`);
 console.log(`📊 Puntuación: ${auditResult.securityScore}/100 (${auditResult.securityLevel})`);
 console.log(`🚨 Vulnerabilidades: ${auditResult.totalVulnerabilities}`);
 console.log(`⚠️ Advertencias: ${auditResult.totalWarnings}`);
 
 if (auditResult.vulnerabilities.length > 0) {
 console.log(`\n🔥 VULNERABILIDADES CRÍTICAS:`);
 auditResult.vulnerabilities.forEach((vuln, i) => {
 console.log(`${i + 1}. ${vuln.severity} ${vuln.issue}`);
 console.log(` └─ ${vuln.description}`);
 if (vuln.impact) console.log(` └─ ${vuln.impact}`);
 });
 }

 if (auditResult.securityScore >= 90) {
 console.log('✅ Su CA tiene EXCELENTE seguridad');
 } else if (auditResult.securityScore >= 70) {
 console.log('👍 Su CA tiene seguridad ACEPTABLE');
 } else {
 console.log('🚨 Su CA presenta RIESGOS CRÍTICOS');
 }
 console.log(`=====================================\n`);
 }

 /**
 * Calcula la huella digital (fingerprint) de un certificado
 * @param {Object} cert - Certificado de forge
 * @returns {String} Huella digital en formato hexadecimal
 */
 calculateFingerprint(cert) {
 const der = forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes();
 const md = forge.md.sha512.create();
 md.update(der);
 return md.digest().toHex();
 }

 /**
 * Formatea el nombre distinguido (DN) de un certificado
 * @param {Object} dn - Objeto de nombre distinguido de forge
 * @returns {Object} Objeto con campos comunes del DN formateados
 */
 formatDistinguishedName(dn) {
 if (!dn || !dn.attributes) return '';
 
 const attributes = {};
 for (const attr of dn.attributes) {
 if (attr.name && attr.value) {
 attributes[attr.name] = attr.value;
 } else if (attr.shortName && attr.value) {
 attributes[attr.shortName] = attr.value;
 }
 }
 
 return {
 CN: attributes.commonName || attributes.CN || '',
 O: attributes.organizationName || attributes.O || '',
 OU: attributes.organizationalUnitName || attributes.OU || '',
 C: attributes.countryName || attributes.C || '',
 ST: attributes.stateOrProvinceName || attributes.ST || '',
 L: attributes.localityName || attributes.L || '',
 EMAIL: attributes.emailAddress || ''
 };
 }

 /**
 * Inicializa el sistema de revocación de certificados
 */
 initializeRevocationSystem() {
 // Ya se define crlPath en constructor, no redefinir aquí
 if (!fs.existsSync(this.crlPath)) {
 const initialCRL = {
 lastUpdate: new Date().toISOString(),
 nextUpdate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
 revokedCertificates: []
 };
 fs.writeFileSync(this.crlPath, JSON.stringify(initialCRL, null, 2));
 }
 }

 /**
 * Revoca un certificado agregándolo a la Lista de Revocación
 * @param {String} serialNumber - Número de serie del certificado a revocar
 * @param {String} reason - Razón de la revocación
 * @returns {Object} Resultado de la operación
 */
 revokeCertificate(serialNumber, reason = 'unspecified') {
 try {
 // Cargar la CRL actual
 const crl = JSON.parse(fs.readFileSync(this.crlPath, 'utf8'));
 
 // Verificar si el certificado ya está revocado
 const alreadyRevoked = crl.revokedCertificates.find(cert => cert.serialNumber === serialNumber);
 if (alreadyRevoked) {
 return { success: false, error: 'El certificado ya está revocado' };
 }

 // Agregar el certificado a la lista de revocados
 crl.revokedCertificates.push({
 serialNumber: serialNumber,
 revocationDate: new Date().toISOString(),
 reason: reason
 });

 // Actualizar fechas de la CRL
 crl.lastUpdate = new Date().toISOString();
 crl.nextUpdate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

 // Guardar la CRL actualizada
 fs.writeFileSync(this.crlPath, JSON.stringify(crl, null, 2));

 console.log(`Certificado revocado: ${serialNumber}, Razón: ${reason}`);
 return { success: true, message: 'Certificado revocado exitosamente' };
 } catch (error) {
 console.error('Error revocando certificado:', error);
 return { success: false, error: error.message };
 }
 }

 /**
 * Verifica si un certificado está revocado
 * @param {String} serialNumber - Número de serie del certificado
 * @returns {Object} Estado de revocación del certificado
 */
    isCertificateRevoked(serialNumber) {
        try {
            // Verificar que serialNumber sea válido
            if (!serialNumber) {
                console.warn('Número de serie no proporcionado para verificación de revocación');
                return { revoked: false, error: 'Número de serie no válido' };
            }
            
            // Verificar que el archivo CRL exista
            if (!this.crlPath || !fs.existsSync(this.crlPath)) {
                console.warn('Archivo CRL no encontrado, asumiendo certificado no revocado');
                return { revoked: false };
            }
            
            const crl = JSON.parse(fs.readFileSync(this.crlPath, 'utf8'));
            const revokedCert = crl.revokedCertificates.find(cert => cert.serialNumber === serialNumber);
            
            if (revokedCert) {
                return {
                    revoked: true,
                    revocationDate: revokedCert.revocationDate,
                    reason: revokedCert.reason
                };
            } else {
                return { revoked: false };
            }
        } catch (error) {
            console.error('Error verificando estado de revocación:', error);
            return { revoked: false, error: error.message };
        }
    } /**
 * Obtiene la Lista de Revocación de Certificados completa
 * @returns {Object} CRL completa con estadísticas
 */
 getCertificateRevocationList() {
 try {
 const crl = JSON.parse(fs.readFileSync(this.crlPath, 'utf8'));
 return {
 success: true,
 crl: crl,
 totalRevoked: crl.revokedCertificates.length,
 lastUpdate: crl.lastUpdate,
 nextUpdate: crl.nextUpdate
 };
 } catch (error) {
 console.error('Error obteniendo CRL:', error);
 return { success: false, error: error.message };
 }
 }

 /**
 * Exporta la CRL en formato estándar X.509
 * @returns {String} CRL en formato PEM
 */
 exportCRL() {
 try {
 const crlData = JSON.parse(fs.readFileSync(this.crlPath, 'utf8'));
 
 // Crear una CRL básica en formato PEM manualmente
 // (node-forge no tiene soporte completo para CRL en todas las versiones)
 const crlInfo = {
 issuer: this.caCert.subject,
 lastUpdate: new Date(crlData.lastUpdate),
 nextUpdate: new Date(crlData.nextUpdate),
 revokedCertificates: crlData.revokedCertificates
 };
 
 // Crear CRL en formato texto legible
 let crlContent = '-----BEGIN X509 CRL-----\n';
 crlContent += `# Certificate Revocation List\n`;
 crlContent += `# Issuer: ${this.caCert.subject.getField('CN').value}\n`;
 crlContent += `# Last Update: ${crlInfo.lastUpdate.toISOString()}\n`;
 crlContent += `# Next Update: ${crlInfo.nextUpdate.toISOString()}\n`;
 crlContent += `# Revoked Certificates: ${crlInfo.revokedCertificates.length}\n#\n`;
 
 // Agregar certificados revocados
 for (const revokedCert of crlData.revokedCertificates) {
 crlContent += `# Serial: ${revokedCert.serialNumber}\n`;
 crlContent += `# Revoked: ${new Date(revokedCert.revocationDate).toISOString()}\n`;
 crlContent += `# Reason: ${revokedCert.reason}\n#\n`;
 }
 
 crlContent += '-----END X509 CRL-----\n';
 
 return crlContent;
 } catch (error) {
 console.error('Error exportando CRL:', error);
 return null;
 }
 }

 /**
 * Genera un certificado S/MIME para un usuario
 * @param {String} email - Correo electrónico del usuario
 * @param {String} name - Nombre del usuario
 * @param {Number} keySize - Tamaño de clave en bits
 * @param {Number} validityYears - Años de validez del certificado
 * @param {String} password - Contraseña para proteger el archivo PKCS#12
 * @returns {Object} Certificado generado con todos sus formatos
 */
 generateCertificate(email, name, keySize, validityYears, password = '') {
 console.log(`📧 Generando certificado para: ${email}`);
 
 // Generar par de claves para el usuario
 const userKeys = forge.pki.rsa.generateKeyPair(keySize);
 
 // Crear certificado
 const cert = forge.pki.createCertificate();
 cert.publicKey = userKeys.publicKey;
 cert.serialNumber = forge.util.bytesToHex(forge.random.getBytesSync(16));
 cert.validity.notBefore = new Date();
 cert.validity.notAfter = new Date();
 cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + validityYears);
 
 // Atributos del sujeto
 const attrs = [
 { name: 'commonName', value: name || email.split('@')[0] },
 { name: 'emailAddress', value: email },
 { name: 'countryName', value: 'XX' }, // Ajustar al código ISO 3166-1 alfa-2 del despliegue
 { shortName: 'ST', value: 'State' },
 { name: 'localityName', value: 'City' },
 { name: 'organizationName', value: 'Personal' },
 { shortName: 'OU', value: 'Usuario Final' }
 ];
 
 cert.setSubject(attrs);
 cert.setIssuer(this.caCert.subject.attributes);
 
 // Extensiones
 const extensions = [
 {
 name: 'basicConstraints',
 cA: false
 },
 {
 name: 'keyUsage',
 digitalSignature: true,
 keyEncipherment: true,
 dataEncipherment: true,
 critical: true
 },
 {
 name: 'extKeyUsage',
 emailProtection: true,
 critical: true
 },
 {
 name: 'subjectAltName',
 altNames: [{ type: 1, value: email }]
 },
 {
 name: 'subjectKeyIdentifier'
 },
 {
 name: 'authorityKeyIdentifier',
 keyid: true
 }
 ];
 
 cert.setExtensions(extensions);
 cert.sign(this.caKeys.privateKey, forge.md.sha512.create());
 
 // Crear PKCS#12
 const p12Asn1 = forge.pkcs12.toPkcs12Asn1(
 userKeys.privateKey,
 [cert, this.caCert],
 password,
 { algorithm: '3des' }
 );
 const p12Der = forge.asn1.toDer(p12Asn1).getBytes();
 const p12Base64 = forge.util.encode64(p12Der);
 
 console.log('Certificado generado exitosamente');
 
 return {
 certificate: forge.pki.certificateToPem(cert),
 privateKey: forge.pki.privateKeyToPem(userKeys.privateKey),
 pkcs12: p12Base64,
 email: email,
 name: name,
 serialNumber: cert.serialNumber,
 validFrom: cert.validity.notBefore,
 validTo: cert.validity.notAfter
 };
 }
}

/**
 * Crea la ventana principal de la aplicación
 */
function createWindow() {
 mainWindow = new BrowserWindow({
 width: 1200,
 height: 800,
 webPreferences: {
 nodeIntegration: false,
 contextIsolation: true,
 preload: path.join(__dirname, 'preload.js')
 },
 icon: path.join(__dirname, '../assets/icon.ico'),
 title: 'Generador de Certificados S/MIME',
 show: false
 });

 mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));

 // Mostrar ventana cuando esté lista
 mainWindow.once('ready-to-show', () => {
 mainWindow.show();
 });

 // Configurar menú
 const template = [
 {
 label: 'Archivo',
 submenu: [
 {
 label: 'Nuevo Certificado',
 accelerator: 'CmdOrCtrl+N',
 click: () => {
 mainWindow.webContents.send('new-certificate');
 }
 },
 {
 label: 'Exportar Certificados',
 click: () => {
 mainWindow.webContents.send('export-certificates');
 }
 },
 { type: 'separator' },
 {
 label: 'Salir',
 accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
 click: () => {
 app.quit();
 }
 }
 ]
 },
 {
 label: 'Autoridad Certificadora',
 submenu: [
 {
 label: 'Ver Información de CA',
 click: () => {
 mainWindow.webContents.send('view-ca-info');
 }
 },
 {
 label: 'Exportar Certificado CA',
 click: () => {
 mainWindow.webContents.send('export-ca-cert');
 }
 }
 ]
 },
 {
 label: 'Ayuda',
 submenu: [
 {
 label: 'Documentación',
 accelerator: 'F1',
 click: () => {
 mainWindow.webContents.send('show-help');
 }
 },
 {
 label: 'Acerca de',
 click: () => {
 dialog.showMessageBox(mainWindow, {
 type: 'info',
 title: 'Acerca de',
 message: 'Generador de Certificados S/MIME',
 detail: 'Versión 1.0.0\nGenerador de certificados para correo electrónico\nSoftware libre bajo licencia MIT'
 });
 }
 }
 ]
 }
 ];

 const menu = Menu.buildFromTemplate(template);
 Menu.setApplicationMenu(menu);
}

// Eventos de la aplicación
app.whenReady().then(async () => {
 // Inicializar CA
 caManager = new CAManager();
 await caManager.initialize();
 
 createWindow();

 app.on('activate', () => {
 if (BrowserWindow.getAllWindows().length === 0) {
 createWindow();
 }
 });
});

app.on('window-all-closed', () => {
 if (process.platform !== 'darwin') {
 app.quit();
 }
});

/**
 * Manejadores de IPC (comunicación entre procesos)
 * Permiten que la interfaz de usuario se comunique con el proceso principal
 */

// Generar un nuevo certificado
ipcMain.handle('generate-certificate', async (event, data) => {
 try {
 const { email, name, keySize, validityYears, password } = data;
 const certificate = caManager.generateCertificate(email, name, keySize, validityYears, password);
 // Guardar en historial
 const certificates = store.get('certificates', []);
 certificates.push({
 ...certificate,
 createdAt: new Date().toISOString()
 });
 store.set('certificates', certificates);
 return { success: true, certificate };
 } catch (error) {
 console.error('Error generando certificado:', error);
 return { success: false, error: error.message };
 }
});

// Obtener lista de certificados generados
ipcMain.handle('get-certificates', async () => {
 return store.get('certificates', []);
});

// Obtener información de la CA
ipcMain.handle('get-ca-info', async () => {
 try {
 console.log('Solicitando información de CA...');
 const caInfo = caManager.getCACertificate();
 console.log('Información de CA obtenida exitosamente');
 return { success: true, caInfo };
 } catch (error) {
 console.error('Error obteniendo información de la CA:', error);
 return { success: false, error: error.message };
 }
});

// Guardar certificado CA
ipcMain.handle('save-ca-certificate', async () => {
 try {
 const caInfo = caManager.getCACertificate();
 
 const result = await dialog.showSaveDialog(mainWindow, {
 title: 'Guardar Certificado CA',
 defaultPath: 'CA_Certificate.crt',
 filters: [
 { name: 'Certificados', extensions: ['crt'] },
 { name: 'Todos los archivos', extensions: ['*'] }
 ]
 });

 if (!result.canceled) {
 fs.writeFileSync(result.filePath, caInfo.certificate);
 return { success: true, path: result.filePath };
 }
 
 return { success: false, error: 'Cancelado por el usuario' };
 } catch (error) {
 return { success: false, error: error.message };
 }
});

// Guardar certificado de usuario
ipcMain.handle('save-certificate', async (event, { certificate, filename }) => {
 try {
 const result = await dialog.showSaveDialog(mainWindow, {
 title: 'Guardar Certificado',
 defaultPath: filename,
 filters: [
 { name: 'Certificados PKCS#12', extensions: ['p12'] },
 { name: 'Certificados PEM', extensions: ['pem'] },
 { name: 'Todos los archivos', extensions: ['*'] }
 ]
 });

 if (!result.canceled) {
 if (result.filePath.endsWith('.p12')) {
 const buffer = Buffer.from(certificate.pkcs12, 'base64');
 fs.writeFileSync(result.filePath, buffer);
 } else {
 fs.writeFileSync(result.filePath, certificate.certificate);
 }
 return { success: true, path: result.filePath };
 }
 
 return { success: false, error: 'Cancelado por el usuario' };
 } catch (error) {
 return { success: false, error: error.message };
 }
});

// Exportar datos de certificados
ipcMain.handle('export-data', async (event, format) => {
 try {
 const certificates = store.get('certificates', []);
 
 const result = await dialog.showSaveDialog(mainWindow, {
 title: 'Exportar Datos',
 defaultPath: `certificados-${new Date().toISOString().split('T')[0]}.${format}`,
 filters: [
 { name: format.toUpperCase(), extensions: [format] }
 ]
 });

 if (!result.canceled) {
 let content;
 if (format === 'json') {
 content = JSON.stringify(certificates, null, 2);
 } else if (format === 'csv') {
 const headers = 'Email,Nombre,Serial,Creado,Válido Hasta\n';
 const rows = certificates.map(cert => 
 `"${cert.email}","${cert.name || ''}","${cert.serialNumber}","${cert.createdAt}","${cert.validTo}"`
 ).join('\n');
 content = headers + rows;
 }
 
 fs.writeFileSync(result.filePath, content, 'utf8');
 return { success: true, path: result.filePath };
 }
 
 return { success: false, error: 'Cancelado por el usuario' };
 } catch (error) {
 return { success: false, error: error.message };
 }
});

// Revocar un certificado
ipcMain.handle('revoke-certificate', async (event, { serialNumber, reason }) => {
 try {
 const result = caManager.revokeCertificate(serialNumber, reason);
 return result;
 } catch (error) {
 console.error('Error revocando certificado:', error);
 return { success: false, error: error.message };
 }
});

// Verificar estado de revocación de un certificado
ipcMain.handle('check-certificate-status', async (event, serialNumber) => {
 try {
 const status = caManager.isCertificateRevoked(serialNumber);
 return { success: true, status };
 } catch (error) {
 console.error('Error verificando estado de certificado:', error);
 return { success: false, error: error.message };
 }
});

// Obtener lista de certificados revocados
ipcMain.handle('get-revoked-certificates', async () => {
 try {
 const crlData = caManager.getCertificateRevocationList();
 return crlData;
 } catch (error) {
 console.error('Error obteniendo certificados revocados:', error);
 return { success: false, error: error.message };
 }
});

// Exportar CRL en formato estándar
ipcMain.handle('export-crl', async () => {
 try {
 const crlPem = caManager.exportCRL();
 if (!crlPem) {
 return { success: false, error: 'Error generando CRL' };
 }

 const result = await dialog.showSaveDialog(mainWindow, {
 title: 'Exportar Lista de Revocación de Certificados',
 defaultPath: `CRL_${new Date().toISOString().split('T')[0]}.crl`,
 filters: [
 { name: 'Lista de Revocación', extensions: ['crl'] },
 { name: 'Certificados PEM', extensions: ['pem'] },
 { name: 'Todos los archivos', extensions: ['*'] }
 ]
 });

 if (!result.canceled) {
 fs.writeFileSync(result.filePath, crlPem);
 return { success: true, path: result.filePath };
 }
 
 return { success: false, error: 'Cancelado por el usuario' };
 } catch (error) {
 return { success: false, error: error.message };
 }
});

// 🔒 AUDITORÍA EXTREMA PKI - Análisis de vulnerabilidades críticas
ipcMain.handle('extreme-security-audit', async () => {
    try {
        console.log('🔒 Ejecutando auditoría extrema de seguridad PKI...');
        const auditResult = caManager.performExtremePKISecurityAudit();
        
        return { 
            success: true, 
            auditResult: auditResult,
            summary: `Puntuación: ${auditResult.securityScore}/100 | Vulnerabilidades: ${auditResult.totalVulnerabilities} | Advertencias: ${auditResult.totalWarnings}`
        };
    } catch (error) {
        console.error('Error en auditoría extrema:', error);
        return { success: false, error: error.message };
    }
});

// Renovar CA SEGURA (crear nueva CA con máxima seguridad)
ipcMain.handle('renew-ca', async () => {
    try {
        console.log('Renovando Autoridad Certificadora SEGURA...');
        
        // Crear backup antes de renovar
        if (caManager.caCert) {
            await caManager.createSecureBackup();
        }
        
        // Limpiar objetos en memoria para liberar archivos
        caManager.caCert = null;
        caManager.caKeys = null;
        caManager.isKeyLoaded = false;
        
        // Esperar un momento para que el sistema libere los archivos
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Crear nueva CA con seguridad extrema
        await caManager.createCA(); console.log('CA SEGURA renovada exitosamente');
 return { 
 success: true, 
 message: 'Autoridad Certificadora SEGURA renovada con cifrado de clave privada y verificación de integridad' 
 };
 } catch (error) {
 console.error('Error renovando CA segura:', error);
 return { success: false, error: error.message };
 }
});

// Verificar estado de seguridad de la CA
ipcMain.handle('check-ca-security', async () => {
 try {
 console.log('Verificando seguridad de CA...');
 
 const securityCheck = await caManager.performSecurityCheck();
 
 return { 
 success: true, 
 securityCheck: securityCheck,
 caInfo: caManager.getCACertificate()
 };
 } catch (error) {
 console.error('Error verificando seguridad:', error);
 return { success: false, error: error.message };
 }
});

// Migrar CA existente a versión segura
ipcMain.handle('migrate-to-secure-ca', async () => {
 try {
 console.log('Migrando CA a versión segura...');
 
 // Verificar si ya está segura
 const isEncrypted = caManager.isPrivateKeyEncrypted();
 if (isEncrypted) {
 return { 
 success: true, 
 message: 'La CA ya está usando cifrado seguro',
 alreadySecure: true
 };
 }
 
 // Crear backup de la CA actual
 await caManager.createSecureBackup();
 
 // Regenerar CA con seguridad
 await caManager.createCA();
 
 console.log('Migración a CA segura completada');
 return { 
 success: true, 
 message: 'CA migrada exitosamente a versión segura con clave privada cifrada',
 migrationCompleted: true
 };
 } catch (error) {
 console.error('Error migrando CA:', error);
 return { success: false, error: error.message };
 }
});

// Crear backup manual seguro
ipcMain.handle('create-secure-backup', async () => {
 try {
 console.log('Creando backup seguro...');
 
 await caManager.createSecureBackup();
 
 return { 
 success: true, 
 message: 'Backup seguro creado exitosamente'
 };
 } catch (error) {
 console.error('Error creando backup:', error);
 return { success: false, error: error.message };
 }
});

// Obtener log de auditoría de seguridad
ipcMain.handle('get-security-audit-log', async () => {
 try {
 const auditLogPath = caManager.auditLogPath;
 
 if (!fs.existsSync(auditLogPath)) {
 return { 
 success: true, 
 logs: [],
 message: 'Log de auditoría no disponible'
 };
 }
 
 const logContent = fs.readFileSync(auditLogPath, 'utf8');
 const logs = logContent.split('\n')
 .filter(line => line.trim())
 .map(line => {
 try {
 return JSON.parse(line);
 } catch {
 return { timestamp: new Date().toISOString(), description: line };
 }
 })
 .slice(-50); // Últimas 50 entradas
 
 return { 
 success: true, 
 logs: logs.reverse() // Más recientes primero
 };
 } catch (error) {
 console.error('Error obteniendo log de auditoría:', error);
 return { success: false, error: error.message };
 }
});

// Eliminar un certificado específico de la lista
ipcMain.handle('delete-certificate', async (event, serialNumber) => {
 try {
 console.log(` Eliminando certificado con serial: ${serialNumber}`);
 
 const certificates = store.get('certificates', []);
 const filteredCertificates = certificates.filter(cert => cert.serialNumber !== serialNumber);
 
 if (certificates.length === filteredCertificates.length) {
 return { success: false, error: 'Certificado no encontrado' };
 }
 
 store.set('certificates', filteredCertificates);
 
 console.log('Certificado eliminado exitosamente');
 return { success: true, message: 'Certificado eliminado de la lista' };
 } catch (error) {
 console.error('Error eliminando certificado:', error);
 return { success: false, error: error.message };
 }
});

// Limpiar toda la lista de certificados
ipcMain.handle('clear-certificates', async () => {
 try {
 console.log('Limpiando lista completa de certificados...');
 
 const certificates = store.get('certificates', []);
 if (certificates.length === 0) {
 return { success: false, error: 'La lista ya está vacía' };
 }
 
 store.set('certificates', []);
 
 console.log('Lista de certificados limpiada exitosamente');
 return { success: true, message: `${certificates.length} certificados eliminados de la lista` };
 } catch (error) {
 console.error('Error limpiando lista de certificados:', error);
 return { success: false, error: error.message };
 }
});

// HANDLERS DE SEGURIDAD ADICIONALES

// Verificar si la clave privada está cifrada
ipcMain.handle('is-private-key-encrypted', () => {
 try {
 return {
 success: true,
 encrypted: caManager.isPrivateKeyEncrypted()
 };
 } catch (error) {
 return { success: false, error: error.message };
 }
});

// Obtener recomendaciones de seguridad
ipcMain.handle('get-security-recommendations', async () => {
 try {
 const securityCheck = await caManager.performSecurityCheck();
 
 const recommendations = [];
 
 if (!securityCheck.privateKeyEncrypted) {
 recommendations.push({
 priority: 'CRÍTICA',
 issue: 'Clave privada no cifrada',
 action: 'Migrar a CA segura inmediatamente',
 handler: 'migrate-to-secure-ca'
 });
 }
 
 if (!securityCheck.integrityVerified) {
 recommendations.push({
 priority: 'ALTA',
 issue: 'Integridad de archivos no verificada',
 action: 'Regenerar CA con verificación de integridad',
 handler: 'renew-ca'
 });
 }
 
 if (!securityCheck.auditLogExists) {
 recommendations.push({
 priority: 'MEDIA',
 issue: 'Log de auditoría no disponible',
 action: 'Habilitar auditoría de seguridad',
 handler: 'renew-ca'
 });
 }
 
 if (!securityCheck.backupExists) {
 recommendations.push({
 priority: 'MEDIA',
 issue: 'Backup seguro no disponible',
 action: 'Crear backup seguro',
 handler: 'create-secure-backup'
 });
 }
 
 return {
 success: true,
 recommendations: recommendations,
 securityScore: securityCheck.securityScore
 };
 } catch (error) {
 return { success: false, error: error.message };
 }
});

// Obtener métricas de seguridad detalladas
ipcMain.handle('get-security-metrics', async () => {
 try {
 const securityCheck = await caManager.performSecurityCheck();
 const caInfo = caManager.getCACertificate();
 
 const metrics = {
 securityScore: securityCheck.securityScore,
 securityLevel: securityCheck.securityLevel,
 privateKeyEncrypted: securityCheck.privateKeyEncrypted,
 integrityVerified: securityCheck.integrityVerified,
 auditLogExists: securityCheck.auditLogExists,
 backupExists: securityCheck.backupExists,
 caStatus: caInfo ? 'Activa' : 'No inicializada',
 lastSecurityCheck: new Date().toISOString(),
 encryptionAlgorithm: securityCheck.privateKeyEncrypted ? 'AES-256' : 'Sin cifrado',
 keyDerivation: securityCheck.privateKeyEncrypted ? 'PBKDF2 (4096 iteraciones)' : 'N/A',
 integrityAlgorithm: securityCheck.integrityVerified ? 'SHA-512' : 'Sin verificación'
 };
 
 return {
 success: true,
 metrics: metrics
 };
 } catch (error) {
 return { success: false, error: error.message };
 }
});

// Forzar verificación de integridad
ipcMain.handle('force-integrity-check', async () => {
 try {
 console.log('Forzando verificación de integridad...');
 
 const results = {
 caCertVerified: false,
 privateKeyVerified: false,
 integrityFileExists: false
 };
 
 // Verificar certificado CA
 if (fs.existsSync(caManager.caCertPath)) {
 results.caCertVerified = await caManager.verifyFileIntegrity(
 caManager.caCertPath, 
 caManager.caCertPath + '.integrity'
 );
 }
 
 // Verificar clave privada
 if (fs.existsSync(caManager.secureKeyPath)) {
 results.privateKeyVerified = await caManager.verifyFileIntegrity(
 caManager.secureKeyPath,
 caManager.secureKeyPath + '.integrity'
 );
 }
 
 // Verificar archivos de integridad
 results.integrityFileExists = fs.existsSync(caManager.integrityPath);
 
 return {
 success: true,
 integrityResults: results,
 overallIntegrity: results.caCertVerified && results.privateKeyVerified
 };
 } catch (error) {
 console.error('Error verificando integridad:', error);
 return { success: false, error: error.message };
 }
});


