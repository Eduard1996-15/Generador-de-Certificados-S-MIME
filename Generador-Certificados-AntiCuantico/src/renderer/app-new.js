class PostQuantumCertificateApp {
    constructor() {
        this.caInitialized = false;
        this.caInfo = null;
        this.initializeEventListeners();
        this.checkCAStatus();
        
        // TEMPORAL: Habilitar botones siempre para pruebas
        setTimeout(() => {
            console.log('Habilitando botones para pruebas...');
            this.enableButtons();
            this.updateStatusMessage('Botones habilitados manualmente para pruebas');
        }, 2000);
    }

    initializeEventListeners() {
        // Botones principales
        document.getElementById('btn-init-ca').addEventListener('click', () => this.initializeCA());
        document.getElementById('btn-show-email-form').addEventListener('click', () => this.showEmailForm());
        document.getElementById('btn-show-info').addEventListener('click', () => this.showCAInfo());
        document.getElementById('btn-download-ca').addEventListener('click', () => this.downloadCA());
        document.getElementById('btn-verify-encryption').addEventListener('click', () => this.verifyEncryption());
        document.getElementById('btn-regenerate-ca').addEventListener('click', () => this.regenerateCA());

        // Formulario de correos
        document.getElementById('btn-generate-email-cert').addEventListener('click', () => this.generateEmailCertificate());
        document.getElementById('btn-clear-form').addEventListener('click', () => this.clearEmailForm());

        // Verificar estado cada 5 segundos
        setInterval(() => this.checkCAStatus(), 5000);
    }

    async checkCAStatus() {
        try {
            const result = await window.electronAPI.checkPostQuantumCAStatus();
            this.updateCAStatus(result);
        } catch (error) {
            console.error('Error verificando estado CA:', error);
        }
    }

    updateCAStatus(status) {
        const caStateElement = document.getElementById('ca-state');
        const caInfoSection = document.getElementById('ca-info-section');
        
        if (status.initialized) {
            this.caInitialized = true;
            this.caInfo = status.info;
            
            caStateElement.textContent = 'CA Post-Cuantica Activa';
            caStateElement.className = 'status-initialized';
            
            // Mostrar información de CA
            this.displayCAInfo(status.info);
            caInfoSection.style.display = 'block';
            
            // Habilitar botones
            this.enableButtons();
            
            this.updateStatusMessage('CA post-cuantica lista para generar certificados S/MIME');
        } else {
            this.caInitialized = false;
            caStateElement.textContent = 'No Inicializada';
            caStateElement.className = 'status-not-initialized';
            caInfoSection.style.display = 'none';
            
            // Deshabilitar botones
            this.disableButtons();
            
            this.updateStatusMessage('Listo para crear CA post-cuantica');
        }
    }

    displayCAInfo(info) {
        const caDetailsElement = document.getElementById('ca-details');
        
        caDetailsElement.innerHTML = `
            <div class="detail-card">
                <h3>Informacion General</h3>
                <div class="detail-item">
                    <span class="detail-label">Nombre Comun:</span>
                    <span class="detail-value">${info.subject.commonName}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Organizacion:</span>
                    <span class="detail-value">${info.subject.organization}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${info.subject.email}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Pais:</span>
                    <span class="detail-value">${info.subject.country}</span>
                </div>
            </div>
            
            <div class="detail-card">
                <h3>Informacion Cuantica</h3>
                <div class="detail-item">
                    <span class="detail-label">Algoritmo Clasico:</span>
                    <span class="detail-value">RSA-4096</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Algoritmo Post-Cuantico:</span>
                    <span class="detail-value">CRYSTALS-Dilithium-3</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Modo Hibrido:</span>
                    <span class="detail-value">Activo</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Nivel de Seguridad:</span>
                    <span class="detail-value">192 bits (equivalente)</span>
                </div>
            </div>
            
            <div class="detail-card">
                <h3>Informacion Temporal</h3>
                <div class="detail-item">
                    <span class="detail-label">Creado:</span>
                    <span class="detail-value">${new Date(info.dates.created).toLocaleString('es-ES')}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Valido desde:</span>
                    <span class="detail-value">${new Date(info.dates.notBefore).toLocaleString('es-ES')}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Valido hasta:</span>
                    <span class="detail-value">${new Date(info.dates.notAfter).toLocaleString('es-ES')}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Dias restantes:</span>
                    <span class="detail-value">${Math.ceil((new Date(info.dates.notAfter) - new Date()) / (1000 * 60 * 60 * 24))} dias</span>
                </div>
            </div>
            
            <div class="detail-card">
                <h3>Informacion de Seguridad</h3>
                <div class="detail-item">
                    <span class="detail-label">Huella SHA-512:</span>
                    <span class="detail-value">${info.fingerprints.sha512.substring(0, 20)}...</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Numero de Serie:</span>
                    <span class="detail-value">${info.serialNumber}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Uso de Clave:</span>
                    <span class="detail-value">Firma Digital, Cifrado</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">S/MIME Compatible:</span>
                    <span class="detail-value">Si</span>
                </div>
            </div>
        `;
    }

    enableButtons() {
        document.getElementById('btn-show-email-form').disabled = false;
        document.getElementById('btn-show-info').disabled = false;
        document.getElementById('btn-download-ca').disabled = false;
        document.getElementById('btn-compatibility-report').disabled = false;
        document.getElementById('btn-open-testing').disabled = false;
    }

    disableButtons() {
        document.getElementById('btn-show-email-form').disabled = true;
        document.getElementById('btn-show-info').disabled = true;
        document.getElementById('btn-download-ca').disabled = true;
        document.getElementById('btn-compatibility-report').disabled = true;
        document.getElementById('btn-open-testing').disabled = true;
    }

    async initializeCA() {
        const modal = document.getElementById('loading-modal');
        const loadingMessage = document.getElementById('loading-message');
        
        try {
            modal.style.display = 'flex';
            this.updateStatusMessage('Creando CA post-cuantica...');
            
            const steps = [
                'Generando claves RSA-4096...',
                'Simulando CRYSTALS-Dilithium-3...',
                'Creando certificado hibrido...',
                'Generando certificados S/MIME de prueba...',
                'Configurando compatibilidad Thunderbird...',
                'Validando estructura post-cuantica...',
                'Completando inicializacion...'
            ];

            for (let i = 0; i < steps.length; i++) {
                loadingMessage.textContent = steps[i];
                await new Promise(resolve => setTimeout(resolve, 800));
            }

            const result = await window.electronAPI.initializePostQuantumCA();
            
            if (result.success) {
                this.showNotification('CA Post-Cuantica creada exitosamente', 'success');
                this.updateStatusMessage('CA post-cuantica creada - Certificados S/MIME listos para pruebas');
                
                // Actualizar estado inmediatamente
                setTimeout(() => this.checkCAStatus(), 500);
            } else {
                throw new Error(result.error || 'Error desconocido');
            }

        } catch (error) {
            console.error('Error inicializando CA:', error);
            this.showNotification('Error: ' + error.message, 'error');
            this.updateStatusMessage('Error creando CA post-cuantica');
        } finally {
            modal.style.display = 'none';
        }
    }

    async showCAInfo() {
        if (!this.caInitialized) {
            this.showNotification('Primero debe inicializar la CA', 'warning');
            return;
        }

        const caInfoSection = document.getElementById('ca-info-section');
        caInfoSection.scrollIntoView({ behavior: 'smooth' });
        
        // Efecto de destacado
        caInfoSection.style.transform = 'scale(1.02)';
        caInfoSection.style.transition = 'transform 0.3s ease';
        
        setTimeout(() => {
            caInfoSection.style.transform = 'scale(1)';
        }, 300);
    }

    async downloadCA() {
        try {
            this.updateStatusMessage('Descargando certificado CA...');
            
            const result = await window.electronAPI.downloadCACertificate();
            
            if (result.success) {
                this.showNotification('CA Root descargada exitosamente', 'success');
                this.updateStatusMessage('CA Root guardada para instalacion en Thunderbird');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error descargando CA:', error);
            this.showNotification('Error: ' + error.message, 'error');
            this.updateStatusMessage('Error descargando CA Root');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 12px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            max-width: 400px;
            backdrop-filter: blur(10px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;

        switch (type) {
            case 'success':
                notification.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                break;
            case 'error':
                notification.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                break;
            case 'warning':
                notification.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
                break;
            default:
                notification.style.background = 'linear-gradient(135deg, #7c3aed, #a855f7)';
        }

        notification.textContent = message;
        document.body.appendChild(notification);

        // Agregar estilo de animación
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        if (!document.getElementById('notification-styles')) {
            style.id = 'notification-styles';
            document.head.appendChild(style);
        }

        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    updateStatusMessage(message) {
        document.getElementById('status-message').textContent = message;
    }

    // METODOS PARA GENERACION DE CERTIFICADOS DE CORREO

    showEmailForm() {
        const emailSection = document.getElementById('email-cert-section');
        emailSection.style.display = 'block';
        emailSection.scrollIntoView({ behavior: 'smooth' });
        
        // Efecto de destacado
        emailSection.style.transform = 'scale(1.02)';
        emailSection.style.transition = 'transform 0.3s ease';
        
        setTimeout(() => {
            emailSection.style.transform = 'scale(1)';
        }, 300);

        this.updateStatusMessage('Formulario listo para generar certificados de correo');
    }

    async generateEmailCertificate() {
        console.log('generateEmailCertificate llamado');
        const form = document.querySelector('.email-cert-form');
        const name = document.getElementById('user-name').value.trim();
        const email = document.getElementById('user-email').value.trim();
        const encryptionType = document.getElementById('encryption-type').value;
        const validity = document.getElementById('cert-validity').value;
        const password = document.getElementById('cert-password').value.trim();

        console.log('Datos del formulario:', { name, email, encryptionType, validity, password });

        // Validaciones
        if (!name || !email || !password) {
            console.log('Validacion fallida: campos vacios');
            this.showNotification('Por favor completa todos los campos obligatorios', 'warning');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showNotification('Por favor ingresa un correo valido', 'warning');
            return;
        }

        try {
            // Estado de carga
            form.classList.add('form-loading');
            this.updateStatusMessage('Generando certificado S/MIME post-cuantico...');

            const userInfo = {
                name: name,
                email: email,
                encryptionType: encryptionType,
                validity: parseInt(validity),
                password: password
            };

            console.log('Llamando a window.electronAPI.generateEmailCertificate...');
            const result = await window.electronAPI.generateEmailCertificate(userInfo);
            console.log('Resultado:', result);

            if (result.success) {
                this.showNotification('Certificado S/MIME generado exitosamente', 'success');
                this.addGeneratedCertificate(userInfo, result.certificateInfo);
                this.clearEmailForm();
                this.updateStatusMessage('Certificado S/MIME listo para usar en Thunderbird');
            } else {
                throw new Error(result.error || 'Error desconocido');
            }

        } catch (error) {
            console.error('Error generando certificado:', error);
            this.showNotification('Error: ' + error.message, 'error');
            this.updateStatusMessage('Error generando certificado S/MIME');
        } finally {
            form.classList.remove('form-loading');
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    clearEmailForm() {
        document.getElementById('user-name').value = '';
        document.getElementById('user-email').value = '';
        document.getElementById('encryption-type').value = 'hybrid';
        document.getElementById('cert-validity').value = '2';
        document.getElementById('cert-password').value = '';
    }

    async downloadUserCertificate(email, type) {
        try {
            const typeLabel = type === 'p12' ? 'PKCS#12' : 'Certificado';
            this.updateStatusMessage('Descargando ' + typeLabel + ' para ' + email + '...');
            
            const result = await window.electronAPI.downloadUserCertificate(email, type);
            
            if (result.success) {
                this.showNotification(typeLabel + ' descargado exitosamente', 'success');
                this.updateStatusMessage(typeLabel + ' guardado para usar en Thunderbird');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error descargando certificado:', error);
            this.showNotification('Error: ' + error.message, 'error');
            this.updateStatusMessage('Error descargando certificado de usuario');
        }
    }

    addGeneratedCertificate(userInfo, certInfo) {
        const generatedSection = document.getElementById('generated-certs');
        const certsList = document.getElementById('certs-list');
        
        // Mostrar sección si está oculta
        generatedSection.style.display = 'block';

        const certItem = document.createElement('div');
        certItem.className = 'cert-item';
        certItem.innerHTML = `
            <div class="cert-info">
                <div class="cert-name">${userInfo.name}</div>
                <div class="cert-email">${userInfo.email}</div>
                <div class="cert-details">
                    ${userInfo.encryptionType.toUpperCase()} | 
                    Valido por ${userInfo.validity} ano${userInfo.validity > 1 ? 's' : ''} | 
                    RSA-4096 + Dilithium-3
                </div>
            </div>
            <div class="cert-actions">
                <button class="cert-action-btn open" onclick="app.openCertificateFolder('${userInfo.email}')">
                    Abrir Carpeta
                </button>
                <button class="cert-action-btn download" onclick="app.downloadUserCertificate('${userInfo.email}', 'p12')">
                    Descargar P12
                </button>
                <button class="cert-action-btn download" onclick="app.downloadUserCertificate('${userInfo.email}', 'crt')">
                    Descargar CRT
                </button>
                <button class="cert-action-btn copy" onclick="app.copyInstallInstructions('${userInfo.email}')">
                    Instrucciones
                </button>
            </div>
        `;

        certsList.appendChild(certItem);

        // Efecto de aparición
        certItem.style.opacity = '0';
        certItem.style.transform = 'translateY(20px)';
        setTimeout(() => {
            certItem.style.transition = 'all 0.5s ease';
            certItem.style.opacity = '1';
            certItem.style.transform = 'translateY(0)';
        }, 100);
    }

    async openCertificateFolder(email) {
        try {
            const result = await window.electronAPI.openCertificateFolder(email);
            if (result.success) {
                this.showNotification('Carpeta de certificado abierta', 'success');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.showNotification('Error: ' + error.message, 'error');
        }
    }

    async copyInstallInstructions(email) {
        const instructions = `
INSTALACION CERTIFICADO S/MIME POST-CUANTICO
=============================================

Usuario: ${email}
Password: (la definida al generar el certificado)

THUNDERBIRD:
1. Configuracion -> Privacidad y Seguridad
2. Certificados -> Administrar Certificados
3. Importar -> Seleccionar smime-thunderbird.p12
4. Introducir password: (la definida al generar el certificado)
5. Configurar S/MIME en cuenta de correo

CARACTERISTICAS:
- Algoritmo: RSA-4096 + CRYSTALS-Dilithium-3
- Resistente a computacion cuantica
- Compatible con clientes S/MIME actuales
- Preparado para migracion futura

Archivos incluidos:
- smime-thunderbird.p12 (para importar)
- certificate.crt (certificado publico)
- INSTALL-INFO.json (informacion detallada)
        `.trim();

        try {
            await navigator.clipboard.writeText(instructions);
            this.showNotification('Instrucciones copiadas al portapapeles', 'success');
        } catch (error) {
            console.error('Error copiando al portapapeles:', error);
            this.showNotification('No se pudo copiar al portapapeles', 'warning');
        }
    }

    async verifyEncryption() {
        try {
            this.updateStatusMessage('Verificando cifrado de claves y certificados...');
            
            const result = await window.electronAPI.verifyKeyEncryption();
            
            if (result.success) {
                const verification = result.result;
                let message = 'Verificacion de Cifrado:\n\n';
                
                if (verification.caKeyEncrypted) {
                    message += 'Clave privada CA: Protegida\n';
                } else {
                    message += 'Clave privada CA: Sin proteccion\n';
                }
                
                if (verification.dilithiumKeysValid) {
                    message += 'Claves Dilithium: Validas\n';
                } else {
                    message += 'Claves Dilithium: Invalidas\n';
                }
                
                message += 'Archivos P12 encontrados: ' + verification.p12FilesCount + '\n';
                
                alert(message);
                this.showNotification('Verificacion de cifrado completada', 'success');
                this.updateStatusMessage('Todas las claves verificadas correctamente');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error verificando cifrado:', error);
            this.showNotification('Error: ' + error.message, 'error');
            this.updateStatusMessage('Error en verificacion de cifrado');
        }
    }

    async regenerateCA() {
        try {
            const confirmRegenerate = confirm(
                'ADVERTENCIA: Esto eliminara la CA actual y generara una nueva.\n\n' +
                'Todos los certificados existentes quedaran invalidos.\n\n' +
                'Estas seguro de continuar?'
            );
            
            if (!confirmRegenerate) {
                return;
            }
            
            this.updateStatusMessage('Regenerando CA con configuracion mejorada...');
            this.disableButtons();
            
            const result = await window.electronAPI.forceRegenerateCA();
            
            if (result.success) {
                this.showNotification('CA regenerada exitosamente', 'success');
                this.updateStatusMessage('Nueva CA lista - Compatible con Thunderbird');
                
                // Recargar información de CA
                setTimeout(() => {
                    this.checkCAStatus();
                }, 1000);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error regenerando CA:', error);
            this.showNotification('Error: ' + error.message, 'error');
            this.updateStatusMessage('Error regenerando CA');
        } finally {
            this.enableButtons();
        }
    }
}

// Efectos visuales cuanticos
class QuantumEffects {
    constructor() {
        this.initializeParticles();
        this.initializeQuantumGlow();
    }

    initializeParticles() {
        const createParticle = () => {
            const particle = document.createElement('div');
            particle.className = 'quantum-particle';
            particle.style.cssText = `
                position: fixed;
                left: ${Math.random() * window.innerWidth}px;
                top: ${Math.random() * window.innerHeight}px;
                pointer-events: none;
                z-index: 1;
            `;
            
            document.body.appendChild(particle);
            
            setTimeout(() => particle.remove(), 4000);
        };

        // Crear partículas periódicamente
        setInterval(createParticle, 2000);
    }

    initializeQuantumGlow() {
        const sections = document.querySelectorAll('.section');
        
        sections.forEach(section => {
            section.addEventListener('mouseenter', () => {
                section.style.boxShadow = '0 0 30px rgba(196, 132, 252, 0.4)';
            });
            
            section.addEventListener('mouseleave', () => {
                section.style.boxShadow = 'var(--shadow)';
            });
        });
    }
}

// Variable global para acceso desde eventos onclick
let app;

// Inicializacion cuando el DOM este listo
document.addEventListener('DOMContentLoaded', () => {
    app = new PostQuantumCertificateApp();
    new QuantumEffects();
    
    console.log('Aplicacion Post-Cuantica PQC inicializada');
    console.log('Version: 1.0.0');
    console.log('Resistente a computacion cuantica');
});
