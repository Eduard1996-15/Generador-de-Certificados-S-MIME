/**
 * Generador de Certificados S/MIME - Aplicación de Escritorio
 * Ideado y desarrollado por Analista Programador Eduard Suárez
 * 
 * Este archivo contiene la lógica de la interfaz de usuario para la aplicación 
 * de generación de certificados S/MIME. Maneja la interacción con el usuario, 
 * la generación de certificados, y la visualización de información.
 */

// Variables globales
let currentCertificate = null;  // Almacena el certificado actualmente generado
let caInfo = null;              // Almacena la información de la Autoridad Certificadora
let helpModal = null;           // Referencia al modal de ayuda

/**
 * Utilidad personalizada para mostrar diálogos modales
 * Esta implementación sustituye al módulo dialog de Electron en el proceso de renderizado
 * ya que no es accesible directamente desde este contexto.
 */
const dialog = {
    showMessageBox: function(options) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.display = 'block';
            
            const content = document.createElement('div');
            content.className = 'modal-content';
            
            const close = document.createElement('span');
            close.className = 'close';
            close.innerHTML = '&times;';
            
            const title = document.createElement('h2');
            title.textContent = options.title || 'Información';
            
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
            
            options.buttons.forEach((buttonText, index) => {
                const button = document.createElement('button');
                button.textContent = buttonText;
                button.className = index === 0 ? 'btn-secondary' : 'btn-primary';
                
                button.addEventListener('click', () => {
                    document.body.removeChild(modal);
                    resolve({ response: index });
                });
                
                buttonContainer.appendChild(button);
            });
            
            close.addEventListener('click', () => {
                document.body.removeChild(modal);
                resolve({ response: 0 });
            });
            
            window.addEventListener('click', (event) => {
                if (event.target === modal) {
                    document.body.removeChild(modal);
                    resolve({ response: 0 });
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
    document.getElementById('view-ca-info').addEventListener('click', showCADetailedInfo);
    document.getElementById('renew-ca').addEventListener('click', renewCA);
    
    // Botón nuevo certificado
    document.getElementById('new-certificate').addEventListener('click', resetForm);
    
    // Toolbar
    document.getElementById('refresh-list').addEventListener('click', loadCertificatesList);
    document.getElementById('export-json').addEventListener('click', () => exportData('json'));
    document.getElementById('export-csv').addEventListener('click', () => exportData('csv'));
    
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
        showError('Información de CA no disponible');
        return;
    }
    
    const validFrom = new Date(caInfo.validFrom).toLocaleDateString();
    const validTo = new Date(caInfo.validTo).toLocaleDateString();
    
    dialog.showMessageBox({
        title: 'Información de Autoridad Certificadora',
        message: 'Detalles del certificado de la Autoridad Certificadora',
        detail: `Nombre: ${caInfo.subject.CN}
Organización: ${caInfo.subject.O}
Unidad: ${caInfo.subject.OU}
País: ${caInfo.subject.C}
Estado/Provincia: ${caInfo.subject.ST}
Localidad: ${caInfo.subject.L}
Serial: ${caInfo.serialNumber}
Tamaño de Clave: ${caInfo.keySize} bits
Válido desde: ${validFrom}
Válido hasta: ${validTo}
Huella digital (SHA-256): ${caInfo.fingerprint}`,
        buttons: ['Cerrar', 'Exportar CA'],
        noLink: true
    }).then(result => {
        if (result.response === 1) {
            downloadCACertificate();
        }
    });
}

// Descargar certificado CA
async function downloadCACertificate() {
    try {
        const result = await window.electronAPI.saveCAcertificate();
        
        if (result.success) {
            showSuccess(`Certificado CA guardado en: ${result.path}`);
        } else {
            showError(result.error);
        }
    } catch (error) {
        showError('Error guardando certificado CA: ' + error.message);
    }
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
        
        const html = certificates.map(cert => {
            const createdAt = new Date(cert.createdAt).toLocaleDateString();
            const validTo = new Date(cert.validTo).toLocaleDateString();
            return `
                <div class="certificate-item">
                    <div class="cert-header">
                        <span class="cert-email"> ${cert.email}</span>
                        <span class="cert-date"> ${createdAt}</span>
                    </div>
                    <div class="cert-details">
                        <span> ${cert.name}</span>
                        <span> ${cert.serialNumber.substring(0, 16)}...</span>
                        <span> Válido hasta: ${validTo}</span>
                    </div>
                    <div class="cert-actions">
                        <button class="btn-small" onclick="downloadCertificateFromList('${cert.serialNumber}', 'p12')">P12</button>
                        <button class="btn-small" onclick="downloadCertificateFromList('${cert.serialNumber}', 'pem')">PEM</button>
                        <button class="btn-small" onclick="downloadCertificateFromList('${cert.serialNumber}', 'crt')">CRT</button>
                    </div>
                </div>
            `;
        }).join('');
        certificatesList.innerHTML = html;
    } catch (error) {
        certificatesList.innerHTML = '<div class="error"> Error cargando certificados</div>';
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
