const { contextBridge, ipcRenderer } = require('electron');

// Exponer API segura al renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Generar certificado
  generateCertificate: (data) => ipcRenderer.invoke('generate-certificate', data),
  
  // Obtener lista de certificados
  getCertificates: () => ipcRenderer.invoke('get-certificates'),
  
  // Obtener información de la CA
  getCAInfo: () => ipcRenderer.invoke('get-ca-info'),
  
  // Guardar certificado CA
  saveCAcertificate: () => ipcRenderer.invoke('save-ca-certificate'),
  
  // Guardar certificado
  saveCertificate: (data) => ipcRenderer.invoke('save-certificate', data),
  
  // Exportar datos
  exportData: (format) => ipcRenderer.invoke('export-data', format),
  
  // Renovar CA
  renewCA: () => ipcRenderer.invoke('renew-ca'),
  
  // Listeners para eventos desde main
  onNewCertificate: (callback) => {
    ipcRenderer.on('new-certificate', callback);
  },
  
  onExportCertificates: (callback) => {
    ipcRenderer.on('export-certificates', callback);
  },
  
  onViewCAInfo: (callback) => {
    ipcRenderer.on('view-ca-info', callback);
  },
  
  onExportCACert: (callback) => {
    ipcRenderer.on('export-ca-cert', callback);
  },
  
  onShowHelp: (callback) => {
    ipcRenderer.on('show-help', callback);
  }
});
