// Variables globales
let currentCertificate = null;
let currentP12Data = null;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    loadCAInfo();
    setupFormHandlers();
    setupTabHandlers();
    setupModalHandlers();
    setupButtonHandlers();
});

// Configurar manejadores de pestañas
function setupTabHandlers() {
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            showTab(tabName);
        });
    });
}

// Configurar manejadores de modal
function setupModalHandlers() {
    const closeBtn = document.getElementById('close-modal');
    const caCloseBtn = document.getElementById('close-ca-modal');
    const modal = document.getElementById('instructions-modal');
    const caModal = document.getElementById('ca-instructions-modal');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    if (caCloseBtn) {
        caCloseBtn.addEventListener('click', closeCAModal);
    }
    
    // Cerrar modal con click fuera
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
        if (event.target === caModal) {
            closeCAModal();
        }
    });
    
    // Cerrar modal con ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
            closeCAModal();
        }
    });
}

// Configurar manejadores de botones
function setupButtonHandlers() {
    setupResultButtonHandlers();
    setupCAButtonHandlers();
}

// Configurar manejadores de botones CA
function setupCAButtonHandlers() {
    const downloadCABtn = document.getElementById('download-ca-btn');
    const caInstructionsBtn = document.getElementById('ca-instructions-btn');
    const renewCABtn = document.getElementById('renew-ca-btn');
    
    if (downloadCABtn) {
        downloadCABtn.addEventListener('click', downloadCACertificate);
    }
    
    if (caInstructionsBtn) {
        caInstructionsBtn.addEventListener('click', showCAInstructions);
    }
    
    if (renewCABtn) {
        renewCABtn.addEventListener('click', renewCACertificate);
    }
}

// Configurar manejadores de botones del resultado
function setupResultButtonHandlers() {
    const downloadBtn = document.getElementById('download-p12-btn');
    const downloadPublicBtn = document.getElementById('download-public-btn');
    const instructionsBtn = document.getElementById('show-instructions-btn');
    
    if (downloadBtn) {
        // Remover listeners existentes
        downloadBtn.replaceWith(downloadBtn.cloneNode(true));
        const newDownloadBtn = document.getElementById('download-p12-btn');
        newDownloadBtn.addEventListener('click', downloadP12);
    }
    
    if (downloadPublicBtn) {
        // Remover listeners existentes
        downloadPublicBtn.replaceWith(downloadPublicBtn.cloneNode(true));
        const newDownloadPublicBtn = document.getElementById('download-public-btn');
        newDownloadPublicBtn.addEventListener('click', downloadPublicCertificate);
    }
    
    if (instructionsBtn) {
        // Remover listeners existentes  
        instructionsBtn.replaceWith(instructionsBtn.cloneNode(true));
        const newInstructionsBtn = document.getElementById('show-instructions-btn');
        newInstructionsBtn.addEventListener('click', showInstructions);
    }
}

// Gestión de pestañas
function showTab(tabName) {
    // Ocultar todas las pestañas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remover clase active de todos los botones
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar la pestaña seleccionada
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Activar el botón correspondiente
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Cargar contenido específico si es necesario
    if (tabName === 'ca-info') {
        loadCAInfo();
        loadCAStatus();
    } else if (tabName === 'stats') {
        loadStatistics();
        loadRecentCertificates();
    } else if (tabName === 'users') {
        loadUsersList();
    }
}

// Configurar manejadores de formularios
function setupFormHandlers() {
    // Formulario de generación de certificado
    document.getElementById('cert-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        await generateCertificate();
    });
    
    // Formulario de validación
    document.getElementById('validate-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        await validateCertificate();
    });
}

// Generar certificado
async function generateCertificate() {
    const form = document.getElementById('cert-form');
    const formData = new FormData(form);
    const loadingIcon = document.getElementById('loading-icon');
    const certIcon = document.getElementById('cert-icon');
    const btnText = document.getElementById('btn-text');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Mostrar estado de carga
    loadingIcon.style.display = 'inline-block';
    certIcon.style.display = 'none';
    btnText.textContent = 'Generando certificado...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('/api/certificates/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: formData.get('email'),
                commonName: formData.get('commonName'),
                organization: formData.get('organization'),
                country: formData.get('country'),
                keySize: parseInt(formData.get('keySize')),
                validityDays: parseInt(formData.get('validityDays')),
                password: formData.get('password')
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            currentCertificate = result.certificate;
            currentP12Data = result.p12;
            console.log('Certificado generado:', currentCertificate);
            console.log('P12 data length:', currentP12Data ? currentP12Data.length : 'undefined');
            showCertificateResult(result);
            showSuccessMessage('¡Certificado generado exitosamente!');
        } else {
            throw new Error(result.error || 'Error generando certificado');
        }
        
    } catch (error) {
        console.error('Error:', error);
        showErrorMessage(`Error generando certificado: ${error.message}`);
    } finally {
        // Restaurar estado del botón
        loadingIcon.style.display = 'none';
        certIcon.style.display = 'inline-block';
        btnText.textContent = 'Generar Certificado';
        submitBtn.disabled = false;
    }
}

// Mostrar resultado del certificado
function showCertificateResult(result) {
    const resultCard = document.getElementById('result-card');
    const certInfo = document.getElementById('cert-info');
    
    // Verificar que tenemos los datos del certificado
    const cert = result.certificate || {};
    
    certInfo.innerHTML = `
        <div class="cert-details">
            <h4><i class="fas fa-certificate"></i> Detalles del Certificado</h4>
            <table>
                <tr>
                    <td><strong>Email:</strong></td>
                    <td>${cert.email || 'No especificado'}</td>
                </tr>
                <tr>
                    <td><strong>Nombre Común:</strong></td>
                    <td>${cert.commonName || 'No especificado'}</td>
                </tr>
                <tr>
                    <td><strong>Organización:</strong></td>
                    <td>${cert.organization || 'No especificado'}</td>
                </tr>
                <tr>
                    <td><strong>País:</strong></td>
                    <td>${cert.country || 'No especificado'}</td>
                </tr>
                <tr>
                    <td><strong>Número de Serie:</strong></td>
                    <td class="fingerprint">${cert.serialNumber || 'No disponible'}</td>
                </tr>
                <tr>
                    <td><strong>Válido desde:</strong></td>
                    <td>${cert.validFrom ? new Date(cert.validFrom).toLocaleString('es-ES') : 'No disponible'}</td>
                </tr>
                <tr>
                    <td><strong>Válido hasta:</strong></td>
                    <td>${cert.validTo ? new Date(cert.validTo).toLocaleString('es-ES') : 'No disponible'}</td>
                </tr>
                <tr>
                    <td><strong>Tamaño de clave:</strong></td>
                    <td><span class="key-size-badge">${cert.keySize || 'N/A'} bits</span></td>
                </tr>
                <tr>
                    <td><strong>Fingerprint SHA256:</strong></td>
                    <td class="fingerprint">${cert.fingerprint || 'No disponible'}</td>
                </tr>
            </table>
        </div>
    `;
    
    resultCard.style.display = 'block';
    resultCard.scrollIntoView({ behavior: 'smooth' });
    
    // Reconfigurar los botones después de mostrar el resultado
    setupResultButtonHandlers();
}

// Descargar archivo P12
function downloadP12() {
    if (!currentP12Data) {
        showErrorMessage('No hay datos de certificado P12 disponibles para descargar');
        return;
    }
    
    if (!currentCertificate) {
        showErrorMessage('No hay información de certificado disponible');
        return;
    }
    
    try {
        // Convertir base64 a blob
        const binaryString = atob(currentP12Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        const blob = new Blob([bytes], { type: 'application/x-pkcs12' });
        const url = URL.createObjectURL(blob);
        
        // Crear elemento de descarga
        const a = document.createElement('a');
        a.href = url;
        
        // Generar nombre de archivo seguro
        const email = currentCertificate && currentCertificate.email ? currentCertificate.email : 'certificado';
        const safeEmail = email.replace('@', '_at_').replace(/[^a-zA-Z0-9_.-]/g, '_');
        a.download = `${safeEmail}_certificado.p12`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Liberar URL
        URL.revokeObjectURL(url);
        
        showSuccessMessage('Archivo P12 descargado correctamente');
        
    } catch (error) {
        console.error('Error descargando P12:', error);
        showErrorMessage('Error descargando el archivo P12');
    }
}

// Validar certificado
async function validateCertificate() {
    const certInput = document.getElementById('cert-input');
    const certificate = certInput.value.trim();
    
    if (!certificate) {
        showErrorMessage('Por favor, ingresa un certificado PEM');
        return;
    }
    
    try {
        const response = await fetch('/api/certificates/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ certificate })
        });
        
        const result = await response.json();
        showValidationResult(result);
        
    } catch (error) {
        console.error('Error validando certificado:', error);
        showErrorMessage(`Error validando certificado: ${error.message}`);
    }
}

// Mostrar resultado de validación
function showValidationResult(result) {
    const resultDiv = document.getElementById('validation-result');
    
    let statusClass = 'validation-error';
    let statusIcon = 'fas fa-times-circle';
    let statusText = 'Certificado Inválido';
    
    if (result.valid) {
        statusClass = 'validation-success';
        statusIcon = 'fas fa-check-circle';
        statusText = 'Certificado Válido';
    } else if (result.expired) {
        statusClass = 'validation-warning';
        statusIcon = 'fas fa-exclamation-triangle';
        statusText = 'Certificado Expirado';
    } else if (result.notYetValid) {
        statusClass = 'validation-warning';
        statusIcon = 'fas fa-clock';
        statusText = 'Certificado No Válido Aún';
    }
    
    let content = `
        <div class="${statusClass}">
            <h4><i class="${statusIcon}"></i> ${statusText}</h4>
    `;
    
    if (result.subject) {
        content += `
            <div class="cert-details" style="margin-top: 15px; background: rgba(255,255,255,0.1);">
                <table>
                    <tr><td><strong>Nombre Común:</strong></td><td>${result.subject.commonName || 'N/A'}</td></tr>
                    <tr><td><strong>Email:</strong></td><td>${result.subject.emailAddress || 'N/A'}</td></tr>
                    <tr><td><strong>Organización:</strong></td><td>${result.subject.organizationName || 'N/A'}</td></tr>
                    <tr><td><strong>País:</strong></td><td>${result.subject.countryName || 'N/A'}</td></tr>
                    <tr><td><strong>Válido desde:</strong></td><td>${new Date(result.validFrom).toLocaleString('es-ES')}</td></tr>
                    <tr><td><strong>Válido hasta:</strong></td><td>${new Date(result.validTo).toLocaleString('es-ES')}</td></tr>
                    <tr><td><strong>Número de serie:</strong></td><td class="fingerprint">${result.serialNumber}</td></tr>
                </table>
            </div>
        `;
    }
    
    if (result.error) {
        content += `<p><strong>Error:</strong> ${result.error}</p>`;
    }
    
    content += '</div>';
    
    resultDiv.innerHTML = content;
    resultDiv.style.display = 'block';
}

// Cargar información de la CA
async function loadCAInfo() {
    const caInfoContent = document.getElementById('ca-info-content');
    
    try {
        const response = await fetch('/api/certificates/ca-info');
        const caInfo = await response.json();
        
        caInfoContent.innerHTML = `
            <div class="cert-details">
                <h4><i class="fas fa-shield-alt"></i> Autoridad Certificadora</h4>
                <table>
                    <tr>
                        <td><strong>Nombre Común:</strong></td>
                        <td>${caInfo.subject.commonName}</td>
                    </tr>
                    <tr>
                        <td><strong>Organización:</strong></td>
                        <td>${caInfo.subject.organizationName}</td>
                    </tr>
                    <tr>
                        <td><strong>Unidad Organizacional:</strong></td>
                        <td>${caInfo.subject.organizationalUnitName}</td>
                    </tr>
                    <tr>
                        <td><strong>País:</strong></td>
                        <td>${caInfo.subject.countryName}</td>
                    </tr>
                    <tr>
                        <td><strong>Número de Serie:</strong></td>
                        <td class="fingerprint">${caInfo.serialNumber}</td>
                    </tr>
                    <tr>
                        <td><strong>Válido desde:</strong></td>
                        <td>${new Date(caInfo.validFrom).toLocaleString('es-ES')}</td>
                    </tr>
                    <tr>
                        <td><strong>Válido hasta:</strong></td>
                        <td>${new Date(caInfo.validTo).toLocaleString('es-ES')}</td>
                    </tr>
                    <tr>
                        <td><strong>Fingerprint SHA256:</strong></td>
                        <td class="fingerprint">${caInfo.fingerprint}</td>
                    </tr>
                </table>
            </div>
            <div class="note">
                <i class="fas fa-info-circle"></i>
                <strong>Información:</strong> Esta es la Autoridad Certificadora que firma todos los certificados 
                generados por esta aplicación. Es una CA auto-firmada creada específicamente para uso personal/organizacional.
            </div>
        `;
        
        // Configurar botones de CA después de cargar la información
        setupCAButtonHandlers();
        
    } catch (error) {
        console.error('Error cargando info de CA:', error);
        caInfoContent.innerHTML = `
            <div class="validation-error">
                <i class="fas fa-exclamation-triangle"></i>
                Error cargando información de la Autoridad Certificadora
            </div>
        `;
    }
}

// Mostrar instrucciones
function showInstructions() {
    document.getElementById('instructions-modal').style.display = 'block';
}

// Cerrar modal
function closeModal() {
    document.getElementById('instructions-modal').style.display = 'none';
}

// Cerrar modal de CA
function closeCAModal() {
    document.getElementById('ca-instructions-modal').style.display = 'none';
}

// Descargar certificado CA
async function downloadCACertificate() {
    try {
        const response = await fetch('/api/certificates/ca-certificate');
        
        if (!response.ok) {
            throw new Error('Error descargando certificado CA');
        }
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'DGAT_CA_Certificate.crt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        showSuccessMessage('Certificado CA descargado correctamente');
        
    } catch (error) {
        console.error('Error descargando CA:', error);
        showErrorMessage(`Error descargando certificado CA: ${error.message}`);
    }
}

// Descargar certificado público para intercambio
async function downloadPublicCertificate() {
    if (!currentCertificate) {
        showErrorMessage('No hay certificado disponible para exportar');
        return;
    }
    
    console.log('Current certificate structure:', currentCertificate);
    
    try {
        // Verificar que el certificado tenga la estructura correcta
        if (!currentCertificate.cert && !currentCertificate.pem) {
            throw new Error('Certificado no tiene formato PEM válido');
        }
        
        // Preparar el objeto con la estructura esperada por el servidor
        const certData = {
            cert: currentCertificate.cert || currentCertificate.pem,
            email: currentCertificate.email || 'certificado'
        };
        
        const response = await fetch('/api/certificates/export-public', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ certificate: certData })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
            throw new Error(errorData.error || 'Error exportando certificado público');
        }
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        const email = currentCertificate && currentCertificate.email ? currentCertificate.email : 'certificado';
        const safeEmail = email.replace('@', '_at_').replace(/[^a-zA-Z0-9_.-]/g, '_');
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${safeEmail}_public.crt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        showSuccessMessage('Certificado público exportado correctamente');
        
    } catch (error) {
        console.error('Error exportando certificado público:', error);
        showErrorMessage(`Error exportando certificado: ${error.message}`);
    }
}

// Mostrar instrucciones de CA
function showCAInstructions() {
    document.getElementById('ca-instructions-modal').style.display = 'block';
}

// Cerrar modal con click fuera
window.onclick = function(event) {
    const modal = document.getElementById('instructions-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Cerrar modal con ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

// Funciones de utilidad para mensajes
function showSuccessMessage(message) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    // Añadir estilos
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1001;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remover después de 4 segundos
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

function showErrorMessage(message) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    
    // Añadir estilos
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1001;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remover después de 6 segundos (más tiempo para errores)
    setTimeout(() => {
        notification.remove();
    }, 6000);
}

// Añadir estilos CSS para las animaciones de notificaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(style);

// ========== NUEVAS FUNCIONES PARA CA Y USUARIOS ==========

// Cargar estado de la CA
async function loadCAStatus() {
    const statusContent = document.getElementById('ca-status-content');
    
    try {
        const response = await fetch('/api/certificates/ca/status');
        const status = await response.json();
        
        if (status.initialized) {
            let statusClass = 'ca-status-good';
            let statusIcon = 'fas fa-check-circle';
            let statusText = 'CA Válida y Operativa';
            
            if (status.needsRenewal) {
                statusClass = 'ca-status-warning';
                statusIcon = 'fas fa-exclamation-triangle';
                statusText = '⚠️ CA Requiere Renovación Pronto';
            } else if (!status.valid) {
                statusClass = 'ca-status-error';
                statusIcon = 'fas fa-times-circle';
                statusText = '❌ CA Expirada';
            }
            
            statusContent.innerHTML = `
                <div class="ca-status ${statusClass}">
                    <div class="status-header">
                        <i class="${statusIcon}"></i>
                        <h4>${statusText}</h4>
                    </div>
                    
                    <div class="status-details">
                        <div class="progress-section">
                            <div class="progress-label">
                                <span>Tiempo de vida utilizado</span>
                                <span>${status.percentageUsed}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${status.percentageUsed}%"></div>
                            </div>
                            <div class="progress-info">
                                <span>Días restantes: ${status.daysUntilExpiry}</span>
                                <span>Total: ${status.totalValidityDays} días</span>
                            </div>
                        </div>
                        
                        <div class="status-grid">
                            <div class="status-item">
                                <strong>Válida desde:</strong>
                                <span>${new Date(status.validFrom).toLocaleString('es-ES')}</span>
                            </div>
                            <div class="status-item">
                                <strong>Válida hasta:</strong>
                                <span>${new Date(status.validTo).toLocaleString('es-ES')}</span>
                            </div>
                            <div class="status-item">
                                <strong>Fingerprint:</strong>
                                <span class="fingerprint">${status.fingerprint}</span>
                            </div>
                            <div class="status-item">
                                <strong>Número de serie:</strong>
                                <span>${status.serialNumber}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            statusContent.innerHTML = `
                <div class="ca-status ca-status-error">
                    <i class="fas fa-times-circle"></i>
                    <p>Error: CA no inicializada</p>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error cargando estado de CA:', error);
        statusContent.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                Error cargando estado de CA: ${error.message}
            </div>
        `;
    }
}

// Renovar CA
async function renewCACertificate() {
    const renewBtn = document.getElementById('renew-ca-btn');
    
    // Confirmar renovación
    const confirmed = confirm(
        '⚠️ ADVERTENCIA: Renovar la CA invalidará todos los certificados existentes.\\n\\n' +
        'Los usuarios deberán:\\n' +
        '1. Instalar la nueva CA\\n' +
        '2. Generar nuevos certificados\\n\\n' +
        '¿Estás seguro de que quieres continuar?'
    );
    
    if (!confirmed) return;
    
    const validityYears = prompt('¿Por cuántos años quieres que sea válida la nueva CA?', '10');
    if (!validityYears || isNaN(validityYears) || validityYears < 1 || validityYears > 30) {
        showErrorMessage('Años de validez inválidos (debe ser entre 1 y 30)');
        return;
    }
    
    try {
        // Mostrar estado de carga
        const originalText = renewBtn.innerHTML;
        renewBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Renovando CA...';
        renewBtn.disabled = true;
        
        const response = await fetch('/api/certificates/ca/renew', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ validityYears: parseInt(validityYears) })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showSuccessMessage('✅ CA renovada exitosamente.');
            
            // Recargar información
            await loadCAInfo();
            await loadCAStatus();
            
        } else {
            throw new Error(result.error || 'Error renovando CA');
        }
        
    } catch (error) {
        console.error('Error renovando CA:', error);
        showErrorMessage(`Error renovando CA: ${error.message}`);
    } finally {
        renewBtn.innerHTML = originalText;
        renewBtn.disabled = false;
    }
}

// Cargar lista de usuarios
async function loadUsersList() {
    const usersContent = document.getElementById('users-content');
    
    try {
        const response = await fetch('/api/certificates/users');
        const data = await response.json();
        
        if (data.users && data.users.length > 0) {
            const usersList = data.users.map(user => {
                const isActive = user.activeCertificates > 0;
                const statusIcon = isActive 
                    ? '<i class="fas fa-check-circle" style="color: #28a745;"></i>' 
                    : '<i class="fas fa-clock" style="color: #ffc107;"></i>';
                
                return `
                    <div class="user-item">
                        <div class="user-header">
                            <div class="user-info">
                                <div class="user-email">
                                    <i class="fas fa-envelope"></i> ${user.email}
                                </div>
                                <div class="user-name">${user.commonName}</div>
                            </div>
                            <div class="user-status">
                                ${statusIcon}
                                <span>${isActive ? 'Activo' : 'Sin certificados activos'}</span>
                            </div>
                        </div>
                        
                        <div class="user-details">
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <strong>Organización:</strong>
                                    <span>${user.organization || 'No especificada'}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>País:</strong>
                                    <span>${user.country}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Primer certificado:</strong>
                                    <span>${new Date(user.firstCertificate).toLocaleDateString('es-ES')}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Último certificado:</strong>
                                    <span>${new Date(user.lastCertificate).toLocaleDateString('es-ES')}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Total certificados:</strong>
                                    <span>${user.totalCertificates}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Certificados activos:</strong>
                                    <span>${user.activeCertificates}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Total descargas:</strong>
                                    <span>${user.totalDownloads}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            
            usersContent.innerHTML = `
                <div class="users-summary">
                    <div class="summary-stats">
                        <div class="summary-item">
                            <i class="fas fa-users"></i>
                            <span>${data.total} usuarios registrados</span>
                        </div>
                        <div class="summary-item">
                            <i class="fas fa-check-circle"></i>
                            <span>${data.users.filter(u => u.activeCertificates > 0).length} usuarios activos</span>
                        </div>
                    </div>
                </div>
                
                <div class="users-list">
                    ${usersList}
                </div>
            `;
            
            // Configurar botones de exportación
            setupExportButtons();
            
        } else {
            usersContent.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-user-plus"></i>
                    <p>No hay usuarios registrados aún</p>
                    <small>Los usuarios aparecerán aquí después de generar certificados</small>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error cargando usuarios:', error);
        usersContent.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                Error cargando usuarios: ${error.message}
            </div>
        `;
    }
}

// Configurar botones de exportación
function setupExportButtons() {
    const exportCSVBtn = document.getElementById('export-csv-btn');
    const exportJSONBtn = document.getElementById('export-json-btn');
    
    if (exportCSVBtn) {
        exportCSVBtn.addEventListener('click', () => exportData('csv'));
    }
    
    if (exportJSONBtn) {
        exportJSONBtn.addEventListener('click', () => exportData('json'));
    }
}

// Exportar datos
async function exportData(format) {
    try {
        const response = await fetch(`/api/certificates/export/${format}`);
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            
            // Obtener nombre del archivo desde el header
            const contentDisposition = response.headers.get('content-disposition');
            const filename = contentDisposition 
                ? contentDisposition.split('filename=')[1].replace(/"/g, '')
                : `certificados-${new Date().toISOString().split('T')[0]}.${format}`;
            
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            showSuccessMessage(`✅ Archivo ${format.toUpperCase()} descargado correctamente`);
        } else {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
    } catch (error) {
        console.error(`Error exportando ${format}:`, error);
        showErrorMessage(`Error exportando archivo ${format.toUpperCase()}: ${error.message}`);
    }
}

// Cargar estadísticas del sistema
async function loadStatistics() {
    const statsContent = document.getElementById('stats-content');
    
    try {
        const response = await fetch('/api/certificates/stats');
        const stats = await response.json();
        
        const keySizeChart = Object.entries(stats.keySizeDistribution || {})
            .map(([size, count]) => `
                <div class="stat-bar">
                    <span class="stat-label">RSA-${size}</span>
                    <div class="stat-progress">
                        <div class="stat-fill" style="width: ${(count / stats.total) * 100}%"></div>
                    </div>
                    <span class="stat-value">${count}</span>
                </div>
            `).join('');

        const orgChart = Object.entries(stats.organizationDistribution || {})
            .slice(0, 5) // Top 5 organizaciones
            .map(([org, count]) => `
                <div class="stat-bar">
                    <span class="stat-label">${org.length > 20 ? org.substring(0, 20) + '...' : org}</span>
                    <div class="stat-progress">
                        <div class="stat-fill" style="width: ${(count / stats.total) * 100}%"></div>
                    </div>
                    <span class="stat-value">${count}</span>
                </div>
            `).join('');

        statsContent.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-certificate"></i></div>
                    <div class="stat-info">
                        <div class="stat-number">${stats.total}</div>
                        <div class="stat-label">Total Certificados</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon active"><i class="fas fa-check-circle"></i></div>
                    <div class="stat-info">
                        <div class="stat-number">${stats.active}</div>
                        <div class="stat-label">Activos</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon expired"><i class="fas fa-clock"></i></div>
                    <div class="stat-info">
                        <div class="stat-number">${stats.expired}</div>
                        <div class="stat-label">Expirados</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon revoked"><i class="fas fa-ban"></i></div>
                    <div class="stat-info">
                        <div class="stat-number">${stats.revoked}</div>
                        <div class="stat-label">Revocados</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-download"></i></div>
                    <div class="stat-info">
                        <div class="stat-number">${stats.totalDownloads}</div>
                        <div class="stat-label">Descargas</div>
                    </div>
                </div>
            </div>
            
            <div class="charts-grid">
                <div class="chart-section">
                    <h4><i class="fas fa-key"></i> Distribución por Tamaño de Clave</h4>
                    <div class="chart-content">
                        ${keySizeChart || '<p class="no-data">No hay datos disponibles</p>'}
                    </div>
                </div>
                
                <div class="chart-section">
                    <h4><i class="fas fa-building"></i> Top Organizaciones</h4>
                    <div class="chart-content">
                        ${orgChart || '<p class="no-data">No hay datos disponibles</p>'}
                    </div>
                </div>
            </div>
            
            ${stats.lastGenerated ? `
                <div class="info-card">
                    <i class="fas fa-info-circle"></i>
                    <span>Último certificado generado: ${new Date(stats.lastGenerated).toLocaleString('es-ES')}</span>
                </div>
            ` : ''}
        `;
        
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
        statsContent.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                Error cargando estadísticas: ${error.message}
            </div>
        `;
    }
}

// Cargar certificados recientes
async function loadRecentCertificates() {
    const recentCerts = document.getElementById('recent-certs');
    
    try {
        const response = await fetch('/api/certificates/list?limit=10');
        const data = await response.json();
        
        if (data.certificates && data.certificates.length > 0) {
            const certsList = data.certificates
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map(cert => {
                    const isExpired = new Date(cert.validTo) < new Date();
                    const isRevoked = cert.status === 'revoked';
                    
                    let statusIcon = '<i class="fas fa-check-circle" style="color: #28a745;"></i>';
                    let statusText = 'Activo';
                    
                    if (isRevoked) {
                        statusIcon = '<i class="fas fa-ban" style="color: #dc3545;"></i>';
                        statusText = 'Revocado';
                    } else if (isExpired) {
                        statusIcon = '<i class="fas fa-clock" style="color: #ffc107;"></i>';
                        statusText = 'Expirado';
                    }
                    
                    return `
                        <div class="cert-item">
                            <div class="cert-item-header">
                                <div class="cert-email">
                                    <i class="fas fa-envelope"></i> ${cert.email}
                                </div>
                                <div class="cert-status">
                                    ${statusIcon} ${statusText}
                                </div>
                            </div>
                            <div class="cert-item-details">
                                <span><strong>CN:</strong> ${cert.commonName}</span>
                                <span><strong>Org:</strong> ${cert.organization}</span>
                                <span><strong>Creado:</strong> ${new Date(cert.createdAt).toLocaleDateString('es-ES')}</span>
                                <span><strong>Expira:</strong> ${new Date(cert.validTo).toLocaleDateString('es-ES')}</span>
                                <span><strong>Clave:</strong> RSA-${cert.keySize}</span>
                                <span><strong>Descargas:</strong> ${cert.downloadCount || 0}</span>
                            </div>
                            <div class="cert-fingerprint">
                                <small>${cert.fingerprint}</small>
                            </div>
                        </div>
                    `;
                }).join('');
                
            recentCerts.innerHTML = certsList;
        } else {
            recentCerts.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-inbox"></i>
                    <p>No hay certificados registrados aún</p>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error cargando certificados recientes:', error);
        recentCerts.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                Error cargando certificados: ${error.message}
            </div>
        `;
    }
}
