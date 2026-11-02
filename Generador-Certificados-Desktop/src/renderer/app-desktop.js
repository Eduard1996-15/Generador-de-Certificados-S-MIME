/**
 * Generador de Certificados S/MIME - Aplicación de Escritorio
 * 
 * Este archivo contiene la lógica de la interfaz de usuario para la aplicación 
 * de generación de certificados S/MIME. Maneja la interacción con el usuario, 
 * la generación de certificados, y la visualización de información.
 */

console.log('=== INICIANDO app-desktop.js ===');

// Variables globales
let currentCertificate = null;  // Almacena el certificado actualmente generado
let caInfo = null;              // Almacena la información de la Autoridad Certificadora
let helpModal = null;           // Referencia al modal de ayuda

console.log('Variables globales inicializadas');

/**
 * Utilidad personalizada para mostrar diálogos modales
 * Esta implementación sustituye al módulo dialog de Electron en el proceso de renderizado
 * ya que no es accesible directamente desde este contexto.
 */
const dialog = {
    showMessageBox: function(options) {
        return new Promise((resolve) => {
            console.log('Creando modal con opciones:', options);
            
            // Crear modal
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.display = 'block';
            modal.style.position = 'fixed';
            modal.style.zIndex = '9999';
            modal.style.left = '0';
            modal.style.top = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.overflow = 'auto';
            modal.style.backgroundColor = 'rgba(0,0,0,0.4)';
            
            const content = document.createElement('div');
            content.className = 'modal-content';
            content.style.backgroundColor = '#fefefe';
            content.style.margin = '5% auto';
            content.style.padding = '20px';
            content.style.border = '1px solid #888';
            content.style.width = '80%';
            content.style.maxWidth = '600px';
            content.style.borderRadius = '8px';
            content.style.position = 'relative';
            
            const close = document.createElement('span');
            close.className = 'close';
            close.innerHTML = '&times;';
            close.style.color = '#aaa';
            close.style.float = 'right';
            close.style.fontSize = '28px';
            close.style.fontWeight = 'bold';
            close.style.cursor = 'pointer';
            
            const title = document.createElement('h2');
            title.textContent = options.title || 'Información';
            title.style.marginTop = '0';
            
            const message = document.createElement('p');
            message.textContent = options.message || '';
            message.style.fontWeight = 'bold';
            message.style.marginBottom = '15px';
            
            const detail = document.createElement('pre');
            detail.textContent = options.detail || '';
            detail.style.whiteSpace = 'pre-wrap';
            detail.style.backgroundColor = '#f8f9fa';
            detail.style.padding = '15px';
            detail.style.borderRadius = '5px';
            detail.style.marginBottom = '20px';
            detail.style.maxHeight = '400px';
            detail.style.overflow = 'auto';
            
            const buttonContainer = document.createElement('div');
            buttonContainer.style.display = 'flex';
            buttonContainer.style.justifyContent = 'flex-end';
            buttonContainer.style.gap = '10px';
            
            content.appendChild(close);
            content.appendChild(title);
            content.appendChild(message);
            content.appendChild(detail);
            content.appendChild(buttonContainer);
            
            modal.appendChild(content);
            document.body.appendChild(modal);
            
            console.log('Modal añadido al DOM');
            
            // Función para cerrar el modal
            const closeModal = (responseIndex) => {
                console.log('Cerrando modal con respuesta:', responseIndex);
                try {
                    if (modal.parentNode) {
                        document.body.removeChild(modal);
                    }
                    resolve({ response: responseIndex });
                } catch (err) {
                    console.error('Error cerrando modal:', err);
                    resolve({ response: 0 });
                }
            };
            
            // Crear botones
            options.buttons.forEach((buttonText, index) => {
                const button = document.createElement('button');
                button.textContent = buttonText;
                button.className = index === 0 ? 'btn-secondary' : 'btn-primary';
                button.style.padding = '10px 20px';
                button.style.cursor = 'pointer';
                
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    closeModal(index);
                });
                
                buttonContainer.appendChild(button);
            });
            
            // Cerrar con X
            close.addEventListener('click', (e) => {
                e.stopPropagation();
                closeModal(0);
            });
            
            // Cerrar con click fuera (solo en el fondo del modal)
            modal.addEventListener('click', (event) => {
                if (event.target === modal) {
                    closeModal(0);
                }
            });
        });
    }
};

// Elementos DOM
const form = document.getElementById('certificate-form');
const resultSection = document.getElementById('result-section');
const certificateInfo = document.getElementById('certificate-info');
const certificatesList = document.getElementById('certificates-list');
const generateBtn = document.getElementById('generate-btn');
const caDetails = document.getElementById('ca-details');

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadCertificatesList();
    loadCAInfo();

    setupHelpModal();
    
    // Formulario de generación
    form.addEventListener('submit', handleGenerateCertificate);
    
    // Botones de descarga
    document.getElementById('download-p12').addEventListener('click', () => downloadCertificate('p12'));
    document.getElementById('download-pem').addEventListener('click', () => downloadCertificate('pem'));
    document.getElementById('download-crt').addEventListener('click', () => downloadCertificate('crt'));
    
    // Botones de CA
    document.getElementById('download-ca-cert').addEventListener('click', downloadCACertificate);
    document.getElementById('view-ca-info').addEventListener('click', () => {
        console.log('Botón Ver Información Detallada clickeado');
        try {
            showCADetailedInfo();
        } catch (err) {
            console.error('Error al ejecutar showCADetailedInfo:', err);
            alert('ERROR: ' + err.message + '\n\nStack: ' + err.stack);
        }
    });
    document.getElementById('renew-ca').addEventListener('click', renewCA);
    
    // Botón nuevo certificado
    document.getElementById('new-certificate').addEventListener('click', resetForm);
    
    // Toolbar
    document.getElementById('refresh-list').addEventListener('click', loadCertificatesList);
    document.getElementById('export-json').addEventListener('click', () => exportData('json'));
    document.getElementById('export-csv').addEventListener('click', () => exportData('csv'));
    document.getElementById('view-revoked').addEventListener('click', showRevokedCertificatesModal);
    
    // Funcionalidad de revocación
    document.getElementById('export-crl').addEventListener('click', exportCRL);
    document.getElementById('confirm-revoke').addEventListener('click', confirmRevocation);
    document.getElementById('cancel-revoke').addEventListener('click', closeRevokeModal);
    document.getElementById('close-revoke-modal').addEventListener('click', closeRevokeModal);
    document.getElementById('close-revoked-modal').addEventListener('click', closeRevokedModal);
    
    // Funcionalidad de eliminación
    document.getElementById('clear-certificates').addEventListener('click', showClearModal);
    document.getElementById('confirm-delete').addEventListener('click', confirmDelete);
    document.getElementById('cancel-delete').addEventListener('click', closeDeleteModal);
    document.getElementById('close-delete-modal').addEventListener('click', closeDeleteModal);
    document.getElementById('confirm-clear').addEventListener('click', confirmClear);
    document.getElementById('cancel-clear').addEventListener('click', closeClearModal);
    document.getElementById('close-clear-modal').addEventListener('click', closeClearModal);
    

    
    // Listeners de Electron
    if (window.electronAPI) {
        window.electronAPI.onNewCertificate(() => resetForm());
        window.electronAPI.onExportCertificates(() => exportData('json'));
        window.electronAPI.onViewCAInfo(() => showCADetailedInfo());
        window.electronAPI.onExportCACert(() => downloadCACertificate());
        window.electronAPI.onShowHelp(() => showHelpModal());
    }
});

// Cargar información de la CA
async function loadCAInfo() {
    try {
        caDetails.innerHTML = '<div class="loading"> Cargando información de CA...</div>';
        
        const result = await window.electronAPI.getCAInfo();
        
        if (result.success) {
            caInfo = result.caInfo;
            
            // Formato fecha
            const validFrom = new Date(caInfo.validFrom).toLocaleDateString();
            const validTo = new Date(caInfo.validTo).toLocaleDateString();
            
            caDetails.innerHTML = `
                <div class="cert-info">
                    <div class="info-row">
                        <span class="label">Nombre:</span>
                        <span class="value">${caInfo.subject.CN}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Organización:</span>
                        <span class="value">${caInfo.subject.O}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Tamaño de Clave:</span>
                        <span class="value">${caInfo.keySize} bits</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Válido desde:</span>
                        <span class="value">${validFrom}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Válido hasta:</span>
                        <span class="value">${validTo}</span>
                    </div>
                </div>
            `;
        } else {
            caDetails.innerHTML = '<div class="error"> Error cargando información de CA</div>';
        }
    } catch (error) {
        caDetails.innerHTML = '<div class="error"> Error cargando información de CA</div>';
    }
}

// Mostrar información detallada de CA
function showCADetailedInfo() {
    if (!caInfo) {
        alert('Información de CA no disponible. Por favor espere a que cargue.');
        return;
    }
    
    try {
        const validFrom = new Date(caInfo.validFrom).toLocaleDateString();
        const validTo = new Date(caInfo.validTo).toLocaleDateString();
        const validityDays = Math.floor((new Date(caInfo.validTo) - new Date(caInfo.validFrom)) / (1000 * 60 * 60 * 24));
        
        // Mostrar información completa con modal que tiene botones
        const infoMessage = `DATOS DEL CERTIFICADO:
${'─'.repeat(43)}
• Nombre: ${caInfo.subject.CN}
• Organización: ${caInfo.subject.O}
• Unidad: ${caInfo.subject.OU}
• País: ${caInfo.subject.C}
• Estado/Provincia: ${caInfo.subject.ST}
• Localidad: ${caInfo.subject.L}
• Email: ${caInfo.subject.EMAIL || 'N/A'}

CARACTERÍSTICAS DE SEGURIDAD:
${'─'.repeat(43)}
• Serial: ${caInfo.serialNumber}
• Tamaño de Clave: ${caInfo.keySize} bits
• Algoritmo: RSA-${caInfo.keySize}
• Hash: SHA-512

PERIODO DE VALIDEZ:
${'─'.repeat(43)}
• Válido desde: ${validFrom}
• Válido hasta: ${validTo}
• Días de validez: ${validityDays} días

HUELLA DIGITAL:
${'─'.repeat(43)}
SHA-512: ${caInfo.fingerprint}`;

        dialog.showMessageBox({
            title: 'Información de Autoridad Certificadora',
            message: 'Detalles del certificado de la CA',
            detail: infoMessage,
            buttons: ['Cerrar', 'Exportar CA', 'Auditoría Extrema'],
            noLink: true
        }).then(result => {
            if (result.response === 1) {
                downloadCACertificate();
            } else if (result.response === 2) {
                performExtremePKIAudit();
            }
        }).catch(err => {
            console.error('Error en dialog:', err);
        });
        
    } catch (error) {
        alert('Error mostrando información: ' + error.message);
    }
}

// Descargar certificado CA
async function downloadCACertificate() {
    try {
        const result = await window.electronAPI.saveCAcertificate();
        
        if (result.success) {
            showSuccess(`Certificado CA guardado en: ${result.path}`);
        } else {
            showError(`Error guardando certificado: ${result.error}`);
        }
    } catch (error) {
        showError(`Error guardando certificado: ${error.message}`);
    }
}

// 🔒 AUDITORÍA EXTREMA PKI - Análisis de vulnerabilidades
async function performExtremePKIAudit() {
    try {
        alert('Ejecutando auditoría extrema de seguridad PKI...\nEsto puede tomar unos momentos.');
        
        const result = await window.electronAPI.extremeSecurityAudit();
        
        if (result.success) {
            const audit = result.auditResult;
            
            let auditMessage = `AUDITORÍA EXTREMA PKI COMPLETADA\n\n`;
            auditMessage += `Puntuación de Seguridad: ${audit.securityScore}/100 (${audit.securityLevel})\n`;
            auditMessage += `Vulnerabilidades Críticas: ${audit.totalVulnerabilities}\n`;
            auditMessage += `Advertencias: ${audit.totalWarnings}\n\n`;
            
            if (audit.vulnerabilities.length > 0) {
                auditMessage += `VULNERABILIDADES DETECTADAS:\n`;
                audit.vulnerabilities.forEach((vuln, i) => {
                    auditMessage += `${i + 1}. [${vuln.severity}] ${vuln.issue}\n`;
                    auditMessage += `   ${vuln.description}\n`;
                    if (vuln.impact) auditMessage += `   Impacto: ${vuln.impact}\n`;
                });
                auditMessage += `\n`;
            }
            
            if (audit.warnings.length > 0) {
                auditMessage += `ADVERTENCIAS:\n`;
                audit.warnings.forEach((warn, i) => {
                    auditMessage += `${i + 1}. [${warn.severity}] ${warn.issue}\n`;
                    if (warn.recommendation) auditMessage += `   ${warn.recommendation}\n`;
                });
            }
            
            // Agregar detalles de lo que se probó
            auditMessage += `\nELEMENTOS ANALIZADOS:\n`;
            auditMessage += `• Tamaño y seguridad de clave RSA\n`;
            auditMessage += `• Algoritmo de firma (SHA-2/SHA-3)\n`;
            auditMessage += `• Cifrado de clave privada\n`;
            auditMessage += `• Período de validez del certificado\n`;
            auditMessage += `• Integridad de archivos CA\n`;
            auditMessage += `• Sistema de auditoría y logs\n`;
            auditMessage += `• Backups de seguridad\n`;
            auditMessage += `• Configuración de permisos\n`;
            auditMessage += `• Revocación de certificados (CRL)\n`;
            
            // Interpretación final
            auditMessage += `\nRESUMEN EJECUTIVO:\n`;
            if (audit.securityScore >= 90) {
                auditMessage += `[OK] Su CA tiene EXCELENTE seguridad\nTodos los controles críticos están implementados correctamente.`;
            } else if (audit.securityScore >= 70) {
                auditMessage += `[INFO] Su CA tiene seguridad ACEPTABLE\nAlgunos aspectos menores pueden mejorarse.`;
            } else if (audit.securityScore >= 50) {
                auditMessage += `[ADVERTENCIA] Su CA requiere MEJORAS SIGNIFICATIVAS\nSe detectaron problemas que deben corregirse.`;
            } else {
                auditMessage += `[CRÍTICO] Su CA presenta RIESGOS CRÍTICOS\nAcción inmediata requerida para proteger la infraestructura.`;
            }
            
            // Mostrar resultados detallados
            dialog.showMessageBox({
                title: 'Auditoría Extrema PKI - Resultados',
                message: 'Análisis de Vulnerabilidades Completado',
                detail: auditMessage,
                buttons: ['Cerrar', 'Ver Detalles Técnicos'],
                defaultId: 0,
                noLink: true
            }).then(dialogResult => {
                console.log('Dialog result:', dialogResult);
                if (dialogResult.response === 1) {
                    console.log('Mostrando detalles técnicos...');
                    try {
                        showDetailedAuditInfo(audit);
                    } catch (err) {
                        console.error('Error mostrando detalles:', err);
                        alert('Error al mostrar detalles: ' + err.message);
                    }
                }
            }).catch(err => {
                console.error('Error en dialog:', err);
            });
            
        } else {
            showError(`Error en auditoría extrema: ${result.error}`);
        }
    } catch (error) {
        showError(`Error ejecutando auditoría extrema: ${error.message}`);
    }
}

// Mostrar detalles técnicos completos de la auditoría
function showDetailedAuditInfo(audit) {
    let detailMessage = `═══════════════════════════════════════════\n`;
    detailMessage += `   ANÁLISIS TÉCNICO DETALLADO - PKI\n`;
    detailMessage += `═══════════════════════════════════════════\n\n`;
    
    // Información de la CA (datos reales)
    detailMessage += `INFORMACIÓN DE LA CA:\n`;
    detailMessage += `${'─'.repeat(43)}\n`;
    detailMessage += `• Algoritmo: RSA-${caInfo?.keySize || 'N/A'}\n`;
    detailMessage += `• Hash: SHA-512\n`;
    detailMessage += `• Serial: ${caInfo?.serialNumber || 'N/A'}\n`;
    const validityDays = caInfo ? Math.floor((new Date(caInfo.validTo) - new Date(caInfo.validFrom)) / (1000 * 60 * 60 * 24)) : 'N/A';
    detailMessage += `• Validez: ${validityDays} días\n\n`;
    
    // Análisis de vulnerabilidades por categoría
    detailMessage += `ANÁLISIS DE SEGURIDAD:\n`;
    detailMessage += `${'─'.repeat(43)}\n\n`;
    
    // 1. Análisis Criptográfico
    const cryptoVulns = audit.vulnerabilities.filter(v => v.category === 'CRIPTOGRAFÍA RSA' || v.severity.includes('RSA'));
    detailMessage += `[1] Seguridad Criptográfica:\n`;
    if (cryptoVulns.length === 0) {
        detailMessage += `   [OK] RSA ${caInfo?.keySize} bits - Seguridad óptima\n`;
        detailMessage += `   [OK] Tamaño de clave suficiente\n`;
        detailMessage += `   [OK] Resistente a factorización conocida\n`;
    } else {
        cryptoVulns.forEach(v => {
            detailMessage += `   [FALLO] ${v.issue}\n`;
            detailMessage += `      ${v.description}\n`;
        });
    }
    detailMessage += `\n`;
    
    // 2. Análisis de Algoritmos
    const algoVulns = audit.vulnerabilities.filter(v => v.category === 'ALGORITMO COMPROMETIDO' || v.category === 'HASH COMPROMETIDO');
    detailMessage += `[2] Algoritmos Hash:\n`;
    if (algoVulns.length === 0) {
        detailMessage += `   [OK] SHA-512 - Criptográficamente seguro\n`;
        detailMessage += `   [OK] Sin algoritmos deprecados\n`;
        detailMessage += `   [OK] Resistente a colisiones\n`;
    } else {
        algoVulns.forEach(v => {
            detailMessage += `   [FALLO] ${v.issue}\n`;
        });
    }
    detailMessage += `\n`;
    
    // 3. Análisis de Almacenamiento
    const storageVulns = audit.vulnerabilities.filter(v => v.category === 'ALMACENAMIENTO INSEGURO');
    detailMessage += `[3] Almacenamiento Seguro:\n`;
    if (storageVulns.length === 0) {
        detailMessage += `   [OK] Clave privada cifrada (AES-256)\n`;
        detailMessage += `   [OK] Passphrase protegida\n`;
        detailMessage += `   [OK] Archivo de integridad presente\n`;
    } else {
        storageVulns.forEach(v => {
            detailMessage += `   [FALLO] ${v.issue}\n`;
            detailMessage += `      ${v.description}\n`;
        });
    }
    detailMessage += `\n`;
    
    // 4. Sistemas de Protección (información del audit)
    detailMessage += `[4] Sistemas de Protección:\n`;
    detailMessage += `   [INFO] Verificación de integridad\n`;
    detailMessage += `   [INFO] Sistema de backups\n`;
    detailMessage += `   [INFO] Logs de auditoría\n`;
    detailMessage += `   [INFO] Lista de revocación (CRL)\n\n`;
    
    // Recomendaciones prioritarias (si hay)
    if (audit.vulnerabilities.length > 0) {
        detailMessage += `ACCIONES RECOMENDADAS:\n`;
        detailMessage += `${'─'.repeat(43)}\n`;
        audit.vulnerabilities.slice(0, 3).forEach((vuln, i) => {
            detailMessage += `${i + 1}. Resolver: ${vuln.issue}\n`;
            if (vuln.impact) {
                detailMessage += `   Impacto: ${vuln.impact}\n`;
            }
        });
        detailMessage += `\n`;
    }
    
    // Estadísticas finales (datos reales)
    detailMessage += `RESUMEN DE AUDITORÍA:\n`;
    detailMessage += `${'─'.repeat(43)}\n`;
    detailMessage += `• Fecha: ${new Date(audit.timestamp).toLocaleString()}\n`;
    detailMessage += `• Vulnerabilidades críticas: ${audit.totalVulnerabilities}\n`;
    detailMessage += `• Advertencias: ${audit.totalWarnings}\n`;
    detailMessage += `• Puntuación final: ${audit.securityScore}/100\n`;
    detailMessage += `• Nivel de seguridad: ${audit.securityLevel}\n`;
    detailMessage += `\n${'═'.repeat(43)}`;
    
    // Usar alert() directo que es más confiable
    alert(detailMessage);
}

// Configurar modal de ayuda
function setupHelpModal() {
    helpModal = document.getElementById('help-modal');
    const closeBtn = helpModal.querySelector('.close');
    const tabButtons = helpModal.querySelectorAll('.tab-button');
    const tabContents = helpModal.querySelectorAll('.tab-content');
    
    // Cerrar modal
    closeBtn.addEventListener('click', () => {
        helpModal.style.display = 'none';
    });
    
    // Cerrar al hacer clic fuera del contenido
    window.addEventListener('click', (event) => {
        if (event.target === helpModal) {
            helpModal.style.display = 'none';
        }
    });
    
    // Cambiar pestañas
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Desactivar todas las pestañas
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Activar pestaña seleccionada
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Mostrar modal de ayuda
function showHelpModal() {
    helpModal.style.display = 'block';
}

// Generar certificado
async function handleGenerateCertificate(event) {
    event.preventDefault();
    
    const formData = new FormData(form);
    const data = {
        email: formData.get('email'),
        name: formData.get('name') || formData.get('email').split('@')[0],
        keySize: parseInt(formData.get('keySize')),
        validityYears: parseInt(formData.get('validity')),
        password: formData.get('password')
    };
    // Validar datos
    if (!data.email || !data.email.includes('@')) {
        showError('Por favor ingresa un email válido');
        return;
    }
    if (!data.password || data.password.length < 4) {
        showError('La contraseña debe tener al menos 4 caracteres');
        return;
    }
    
    // Mostrar loading
    generateBtn.disabled = true;
    generateBtn.innerHTML = ' Generando...';
    
    try {
        const result = await window.electronAPI.generateCertificate(data);
        
        if (result.success) {
            currentCertificate = result.certificate;
            showCertificateResult(result.certificate);
            loadCertificatesList(); // Actualizar lista
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Error generando certificado: ' + error.message);
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = ' Generar Certificado';
    }
}

// Mostrar resultado del certificado
function showCertificateResult(certificate) {
    const validFrom = new Date(certificate.validFrom).toLocaleDateString();
    const validTo = new Date(certificate.validTo).toLocaleDateString();
    
    certificateInfo.innerHTML = `
        <div class="cert-info">
            <div class="info-row">
                <span class="label"> Email:</span>
                <span class="value">${certificate.email}</span>
            </div>
            <div class="info-row">
                <span class="label"> Nombre:</span>
                <span class="value">${certificate.name}</span>
            </div>
            <div class="info-row">
                <span class="label"> Serial:</span>
                <span class="value">${certificate.serialNumber}</span>
            </div>
            <div class="info-row">
                <span class="label"> Válido desde:</span>
                <span class="value">${validFrom}</span>
            </div>
            <div class="info-row">
                <span class="label"> Válido hasta:</span>
                <span class="value">${validTo}</span>
            </div>
        </div>
        
        <div class="success-message">
             <strong>Certificado generado exitosamente</strong><br>
            Puedes descargarlo en formato PKCS#12 para importar en Thunderbird o PEM para otros usos.
        </div>
    `;
    
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

// Descargar certificado
async function downloadCertificate(format) {
    if (!currentCertificate) {
        showError('No hay certificado para descargar');
        return;
    }
    
    let filename = `${currentCertificate.email.replace('@', '_')}_certificate.${format}`;
    let certToSave = currentCertificate;
    // Si es .crt, solo guardar el certificado público en formato PEM
    if (format === 'crt') {
        filename = `${currentCertificate.email.replace('@', '_')}_public.crt`;
        certToSave = { certificate: currentCertificate.certificate };
    }
    try {
        const result = await window.electronAPI.saveCertificate({
            certificate: certToSave,
            filename: filename
        });
        if (result.success) {
            showSuccess(`Certificado guardado en: ${result.path}`);
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Error guardando certificado: ' + error.message);
    }
}

// Cargar lista de certificados
async function loadCertificatesList() {
    try {
        certificatesList.innerHTML = '<div class="loading"> Cargando certificados...</div>';
        
        const certificates = await window.electronAPI.getCertificates();
        
        if (certificates.length === 0) {
            certificatesList.innerHTML = '<div class="empty-state"> No hay certificados generados</div>';
            return;
        }
        
        // Verificar estado de revocación para cada certificado (en paralelo para mejor rendimiento)
        const certificatesWithStatus = await Promise.all(
            certificates.map(async (cert) => {
                const status = await checkCertificateStatus(cert);
                return { ...cert, revocationStatus: status };
            })
        );
        
        const html = certificatesWithStatus.map(cert => {
            const createdAt = new Date(cert.createdAt).toLocaleDateString('es-ES');
            const validTo = new Date(cert.validTo).toLocaleDateString('es-ES');
            const isRevoked = cert.revocationStatus.revoked;
            
            let statusBadge = '';
            let revocationDetails = '';
            let revokeButton = '';
            
            if (isRevoked) {
                const revocationDate = new Date(cert.revocationStatus.revocationDate).toLocaleDateString('es-ES');
                const reasonText = getRevokeReasonText(cert.revocationStatus.reason);
                
                statusBadge = '<span class="certificate-status revoked">🚫 REVOCADO</span>';
                revocationDetails = `
                    <div class="revocation-details">
                        <div class="revocation-date">📅 Revocado: ${revocationDate}</div>
                        <div class="revocation-reason">🔐 Razón: ${reasonText}</div>
                    </div>
                `;
            } else {
                statusBadge = '<span class="certificate-status active">✅ ACTIVO</span>';
                revokeButton = `<button class="btn-danger revoke-btn" onclick="showRevokeModal(${JSON.stringify(cert).replace(/"/g, '&quot;')})">🗑️ Revocar</button>`;
            }
            
            return `
                <div class="certificate-item ${isRevoked ? 'revoked' : ''}">
                    <div class="cert-header">
                        <span class="cert-email">📧 ${cert.email}</span>
                        ${statusBadge}
                        <span class="cert-date">📅 ${createdAt}</span>
                    </div>
                    <div class="cert-details">
                        <span>👤 ${cert.name || 'Sin nombre'}</span>
                        <span>💾 ${cert.serialNumber.substring(0, 16)}...</span>
                        <span>⏰ Válido hasta: ${validTo}</span>
                    </div>
                    ${revocationDetails}

                    <div class="cert-actions">
                        <button class="btn-small" onclick="downloadCertificateFromList('${cert.serialNumber}', 'p12')" ${isRevoked ? 'title="Certificado revocado - Solo para archivo"' : ''}>📦 P12</button>
                        <button class="btn-small" onclick="downloadCertificateFromList('${cert.serialNumber}', 'pem')" ${isRevoked ? 'title="Certificado revocado - Solo para archivo"' : ''}>📄 PEM</button>
                        <button class="btn-small" onclick="downloadCertificateFromList('${cert.serialNumber}', 'crt')" ${isRevoked ? 'title="Certificado revocado - Solo para archivo"' : ''}>🔐 CRT</button>
                        ${revokeButton}
                        <button class="delete-btn" onclick="showDeleteModal('${cert.serialNumber}', '${cert.email.replace(/'/g, "\\'")}', '${cert.name ? cert.name.replace(/'/g, "\\'") : 'Sin nombre'}')" title="Eliminar de la lista">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
        certificatesList.innerHTML = html;
    } catch (error) {
        certificatesList.innerHTML = '<div class="error">❌ Error cargando certificados</div>';
    }
}

// Descargar certificado desde la lista
async function downloadCertificateFromList(serialNumber, format) {
    try {
        const certificates = await window.electronAPI.getCertificates();
        const certificate = certificates.find(cert => cert.serialNumber === serialNumber);
        if (!certificate) {
            showError('Certificado no encontrado');
            return;
        }
        let filename = `${certificate.email.replace('@', '_')}_certificate.${format}`;
        let certToSave = certificate;
        if (format === 'crt') {
            filename = `${certificate.email.replace('@', '_')}_public.crt`;
            certToSave = { certificate: certificate.certificate };
        }
        const result = await window.electronAPI.saveCertificate({
            certificate: certToSave,
            filename: filename
        });
        if (result.success) {
            showSuccess(`Certificado guardado en: ${result.path}`);
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Error descargando certificado: ' + error.message);
    }
}

// Exportar datos
async function exportData(format) {
    try {
        const result = await window.electronAPI.exportData(format);
        
        if (result.success) {
            showSuccess(`Datos exportados en: ${result.path}`);
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Error exportando datos: ' + error.message);
    }
}

// Resetear formulario
function resetForm() {
    form.reset();
    resultSection.style.display = 'none';
    currentCertificate = null;
    document.getElementById('email').focus();
}

// Mostrar mensaje de error
function showError(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-error';
    alert.innerHTML = ` ${message}`;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        document.body.removeChild(alert);
    }, 5000);
}

// Mostrar mensaje de éxito
function showSuccess(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-success';
    alert.innerHTML = ` ${message}`;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        document.body.removeChild(alert);
    }, 5000);
}

// Renovar Autoridad Certificadora con 8192 bits
async function renewCA() {
    const result = await dialog.showMessageBox({
        title: 'Renovar Autoridad Certificadora',
        message: '¿Está seguro de que desea renovar la Autoridad Certificadora?',
        detail: `Esta acción generará una nueva CA con claves de 8192 bits y mayor seguridad.

⚠️ IMPORTANTE:
• Todos los certificados existentes seguirán funcionando
• Nuevos certificados serán firmados por la nueva CA (8192 bits)
• Deberá redistribuir el nuevo certificado CA a todos los equipos
• Se recomienda hacer una copia de seguridad antes de continuar

La operación puede tardar varios minutos debido al tamaño de clave de 8192 bits.`,
        buttons: ['Cancelar', 'Renovar CA'],
        noLink: true
    });
    
    if (result.response === 1) {
        try {
            // Mostrar mensaje de progreso
            const progressAlert = document.createElement('div');
            progressAlert.className = 'alert alert-info';
            progressAlert.innerHTML = ` Renovando CA con 8192 bits... Esto puede tardar varios minutos.`;
            document.body.appendChild(progressAlert);
            
            const renewResult = await window.electronAPI.renewCA();
            
            // Remover mensaje de progreso
            document.body.removeChild(progressAlert);
            
            if (renewResult.success) {
                showSuccess('CA renovada exitosamente con 8192 bits. Los nuevos certificados usarán la nueva CA.');
                // Recargar información de CA
                loadCAInfo();
            } else {
                showError(renewResult.error);
            }
        } catch (error) {
            showError('Error renovando CA: ' + error.message);
        }
    }
}

// Variables para funcionalidad de revocación
let currentCertificateToRevoke = null;

// Mostrar modal de revocación
function showRevokeModal(certificate) {
    currentCertificateToRevoke = certificate;
    const modal = document.getElementById('revoke-modal');
    const certInfo = document.getElementById('revoke-cert-info');
    
    const validTo = new Date(certificate.validTo).toLocaleDateString('es-ES');
    
    certInfo.innerHTML = `
        <div class="cert-info-revoke">
            <h4>📧 ${certificate.email}</h4>
            <p><strong>Nombre:</strong> ${certificate.name || 'No especificado'}</p>
            <p><strong>Número de Serie:</strong> ${certificate.serialNumber}</p>
            <p><strong>Válido hasta:</strong> ${validTo}</p>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Confirmar revocación
async function confirmRevocation() {
    if (!currentCertificateToRevoke) return;
    
    const reason = document.getElementById('revoke-reason').value;
    
    try {
        const result = await window.electronAPI.revokeCertificate({
            serialNumber: currentCertificateToRevoke.serialNumber,
            reason: reason
        });
        
        if (result.success) {
            showSuccess('Certificado revocado exitosamente');
            closeRevokeModal();
            // Recargar la lista de certificados para mostrar el estado actualizado
            loadCertificatesList();
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Error revocando certificado: ' + error.message);
    }
}

// Cerrar modal de revocación
function closeRevokeModal() {
    const modal = document.getElementById('revoke-modal');
    modal.style.display = 'none';
    currentCertificateToRevoke = null;
    document.getElementById('revoke-reason').value = 'unspecified';
}

// Mostrar certificados revocados
async function showRevokedCertificatesModal() {
    const modal = document.getElementById('revoked-certificates-modal');
    const statsList = document.getElementById('crl-stats');
    const revokedList = document.getElementById('revoked-certificates-list');
    
    modal.style.display = 'block';
    
    try {
        // Obtener CRL
        const crlResult = await window.electronAPI.getRevokedCertificates();
        
        if (crlResult.success) {
            const { crl, totalRevoked, lastUpdate, nextUpdate } = crlResult;
            
            // Mostrar estadísticas
            const lastUpdateDate = new Date(lastUpdate).toLocaleString('es-ES');
            const nextUpdateDate = new Date(nextUpdate).toLocaleString('es-ES');
            
            statsList.innerHTML = `
                <div class="crl-stats">
                    <div class="crl-stat-item">
                        <strong>Total Revocados</strong>
                        <span>${totalRevoked}</span>
                    </div>
                    <div class="crl-stat-item">
                        <strong>Última Actualización</strong>
                        <span>${lastUpdateDate}</span>
                    </div>
                    <div class="crl-stat-item">
                        <strong>Próxima Actualización</strong>
                        <span>${nextUpdateDate}</span>
                    </div>
                </div>
            `;
            
            // Mostrar certificados revocados
            if (crl.revokedCertificates.length > 0) {
                // Obtener información completa de certificados para mostrar detalles
                const allCertificates = await window.electronAPI.getCertificates();
                
                const revokedHtml = crl.revokedCertificates.map(revokedCert => {
                    const fullCert = allCertificates.find(cert => cert.serialNumber === revokedCert.serialNumber);
                    const revocationDate = new Date(revokedCert.revocationDate).toLocaleString('es-ES');
                    const reasonText = getRevokeReasonText(revokedCert.reason);
                    
                    return `
                        <div class="cert-item revoked-cert">
                            <div class="cert-main">
                                <span class="cert-email">📧 ${fullCert ? fullCert.email : 'Certificado eliminado'}</span>
                                <span class="certificate-status revoked">🚫 REVOCADO</span>
                            </div>
                            <div class="cert-details">
                                <span>💾 ${revokedCert.serialNumber.substring(0, 16)}...</span>
                                <span>📅 Revocado: ${revocationDate}</span>
                                <span class="revocation-reason">🔐 Razón: ${reasonText}</span>
                            </div>
                        </div>
                    `;
                }).join('');
                
                revokedList.innerHTML = revokedHtml;
            } else {
                revokedList.innerHTML = '<div class="no-data">✅ No hay certificados revocados</div>';
            }
        } else {
            revokedList.innerHTML = '<div class="error">❌ Error cargando certificados revocados</div>';
        }
    } catch (error) {
        revokedList.innerHTML = '<div class="error">❌ Error: ' + error.message + '</div>';
    }
}

// Obtener texto descriptivo de la razón de revocación
function getRevokeReasonText(reason) {
    const reasons = {
        'unspecified': 'No especificada',
        'keyCompromise': 'Compromiso de clave privada',
        'caCompromise': 'Compromiso de la CA',
        'affiliationChanged': 'Cambio de afiliación',
        'superseded': 'Reemplazado por nuevo certificado',
        'cessationOfOperation': 'Cese de operaciones',
        'certificateHold': 'Suspensión temporal'
    };
    return reasons[reason] || reason;
}

// Cerrar modal de certificados revocados
function closeRevokedModal() {
    const modal = document.getElementById('revoked-certificates-modal');
    modal.style.display = 'none';
}

// Exportar Lista de Revocación
async function exportCRL() {
    try {
        const result = await window.electronAPI.exportCRL();
        
        if (result.success) {
            showSuccess(`Lista de Revocación exportada en: ${result.path}`);
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Error exportando CRL: ' + error.message);
    }
}

// Verificar estado de certificado y actualizar la visualización
async function checkCertificateStatus(certificate) {
    try {
        const statusResult = await window.electronAPI.checkCertificateStatus(certificate.serialNumber);
        
        if (statusResult.success && statusResult.status.revoked) {
            return {
                revoked: true,
                revocationDate: statusResult.status.revocationDate,
                reason: statusResult.status.reason
            };
        } else {
            return { revoked: false };
        }
    } catch (error) {
        console.error('Error verificando estado de certificado:', error);
        return { revoked: false };
    }
}

// Variables para manejar la eliminación
let certificateToDelete = null;

// Mostrar modal de confirmación para eliminar certificado individual
function showDeleteModal(serialNumber, email, name) {
    certificateToDelete = { serialNumber, email, name };
    
    const modal = document.getElementById('delete-certificate-modal');
    const certInfo = document.getElementById('delete-cert-info');
    
    certInfo.innerHTML = `
        <div class="cert-info-display">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Serial:</strong> ${serialNumber.substring(0, 16)}...</p>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Cerrar modal de eliminación individual
function closeDeleteModal() {
    document.getElementById('delete-certificate-modal').style.display = 'none';
    certificateToDelete = null;
}

// Confirmar eliminación individual
async function confirmDelete() {
    if (!certificateToDelete) return;
    
    try {
        const result = await window.electronAPI.deleteCertificate(certificateToDelete.serialNumber);
        
        if (result.success) {
            showSuccess(result.message);
            loadCertificatesList(); // Actualizar lista
            closeDeleteModal();
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Error eliminando certificado: ' + error.message);
    }
}

// Mostrar modal de confirmación para limpiar toda la lista
function showClearModal() {
    const modal = document.getElementById('clear-certificates-modal');
    modal.style.display = 'block';
}

// Cerrar modal de limpieza
function closeClearModal() {
    document.getElementById('clear-certificates-modal').style.display = 'none';
}

// Confirmar limpieza de toda la lista
async function confirmClear() {
    try {
        const result = await window.electronAPI.clearCertificates();
        
        if (result.success) {
            showSuccess(result.message);
            loadCertificatesList(); // Actualizar lista
            closeClearModal();
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Error limpiando lista: ' + error.message);
    }
}



// Exportar paquete de confianza combinado
async function exportTrustBundle() {
    try {
        const result = await window.electronAPI.exportTrustBundle();
        
        if (result.success) {
            showSuccess(`Paquete de confianza exportado exitosamente. ${result.files} archivos creados en: ${result.path}`);
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Error exportando paquete de confianza: ' + error.message);
    }
}
