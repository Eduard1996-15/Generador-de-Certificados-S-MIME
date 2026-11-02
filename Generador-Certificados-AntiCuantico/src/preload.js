const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs seguras al renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Post-Quantum CA operations
  initializePostQuantumCA: () => ipcRenderer.invoke('init-post-quantum-ca'),
  checkPostQuantumCAStatus: () => ipcRenderer.invoke('check-pqc-ca-status'),
  getPostQuantumCAInfo: () => ipcRenderer.invoke('get-pqc-ca-info'),
  
  // Email certificate generation
  generateEmailCertificate: (userInfo) => ipcRenderer.invoke('generate-email-certificate', userInfo),
  openCertificateFolder: (email) => ipcRenderer.invoke('open-certificate-folder', email),
  
  
  // Download functions
  verifyKeyEncryption: () => ipcRenderer.invoke('verify-key-encryption'),
  forceRegenerateCA: () => ipcRenderer.invoke('force-regenerate-ca'),
  downloadCACertificate: () => ipcRenderer.invoke('download-ca-certificate'),
  downloadUserCertificate: (email, type) => ipcRenderer.invoke('download-user-certificate', email, type),
  
  // Utility functions
  showDirectory: (path) => ipcRenderer.invoke('show-directory', path),
  
  // Event listeners
  onCACreated: (callback) => {
    ipcRenderer.on('pqc-ca-created', callback);
  },
  
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});
