# Generador de Certificados S/MIME Desktop

Aplicación de escritorio profesional para la generación y gestión de certificados S/MIME.

## Características Principales

### Infraestructura PKI Robusta
- **Autoridad Certificadora RSA-8192**: Máxima fortaleza criptográfica
- **Certificados Configurables**: Tamaños de clave 2048-8192 bits
- **Estándares Internacionales**: Compatible con RFC 5280, RFC 5751
- **Ubicación**: Configurable (país, estado/provincia y localidad se definen en `src/main.js`)

### Funcionalidades de Seguridad
- Generación de CA con claves RSA-8192 bits
- Certificados X.509v3 con extensiones S/MIME
- Sistema de auditoría de seguridad integrado
- Análisis universal de CAs externas

### Sistema de Testing de Seguridad
- Auditoría automática de múltiples CAs
- Evaluación de fortaleza criptográfica
- Detección de vulnerabilidades
- Reportes ejecutivos detallados

## Estructura del Proyecto

```
Generador-Certificados-Desktop/
├── src/                          # Código fuente de la aplicación
│   ├── main.js                   # Proceso principal Electron
│   ├── preload.js               # Script de precarga
│   └── renderer/                # Interfaz de usuario
├── security-testing/            # Sistema de auditoría de CAs
├── ca-test-samples/             # Carpeta para CAs de prueba
├── assets/                      # Recursos e iconos
├── package.json                 # Configuración del proyecto
└── rebuild.bat                  # Script de construcción
```

## Instalación y Uso

### Desarrollo
```bash
npm install
npm start
```

### Construcción Portable
```bash
npm run rebuild
# o ejecutar rebuild.bat
```

### Testing de Seguridad
```bash
# Colocar certificados .crt/.cer/.pem en ca-test-samples/
python security-testing/master_security_test.py "ruta/del/proyecto"
```

## Especificaciones Técnicas

- **Framework**: Electron 28.0.0
- **Criptografía**: Node-forge 1.3.1
- **CA**: RSA-8192 bits, SHA-256
- **Certificados**: RSA 2048-8192 bits configurables
- **Formato**: X.509v3 con extensiones S/MIME
- **Compatibilidad**: Windows x64

## Funcionalidades Avanzadas

### Auditoría Universal de CAs
- Análisis automático de certificados externos
- Evaluación de fortaleza criptográfica
- Detección de algoritmos obsoletos
- Generación de reportes ejecutivos

### Estándares de Seguridad
- Claves RSA-8192 para máxima seguridad
- Algoritmos SHA-256 modernos
- Extensiones X.509v3 críticas
- Cumplimiento con mejores prácticas NIST

## Contacto

Consulte el repositorio del proyecto para reportar problemas o sugerencias.

## Licencia

MIT License - Uso profesional y educativo autorizado.