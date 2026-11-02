# 🔮 Generador de Certificados Post-Cuánticos - PQC

## 📋 Descripción

Aplicación de escritorio desarrollada para **Proyecto de Ejemplo** que genera certificados digitales resistentes a computación cuántica, compatibles con S/MIME para uso en clientes de correo como Thunderbird.

## 🎯 Características Principales

### 🛡️ Seguridad Post-Cuántica
- **Algoritmo Híbrido**: RSA-4096 + CRYSTALS-Dilithium-3
- **Resistencia Cuántica**: Protección contra algoritmo de Shor
- **Compatibilidad Actual**: Funciona con clientes S/MIME existentes
- **Preparación Futura**: Listo para migración a puro PQC

### 📧 Compatibilidad S/MIME
- **Thunderbird**: Compatible completo
- **Microsoft Outlook**: Compatible con limitaciones
- **Apple Mail**: Compatible con capa RSA
- **Formato PKCS#12**: Estándar para importación

### 🔒 Características de Seguridad
- **Nivel de Seguridad**: 192 bits equivalentes (post-cuántico)
- **Hash**: SHA-512 para máxima resistencia
- **Validez**: 10 años por defecto
- **Autoridad Certificadora**: CA híbrida propia

## 🚀 Instalación y Uso

### 1. Requisitos Previos
- Windows 10/11
- Node.js 18+
- PowerShell habilitado

### 2. Instalación Rápida
```batch
# Ejecutar el archivo por lotes
iniciar_app_anticuantica.bat
```

### 3. Instalación Manual
```bash
# Instalar dependencias
npm install

# Ejecutar aplicación
npm start

# Construir aplicación portable
npm run build
```

## 📖 Guía de Uso

### Paso 1: Crear CA Post-Cuántica
1. Abrir la aplicación
2. Hacer clic en **"🔮 Crear CA Post-Cuántica"**
3. Esperar la generación (RSA-4096 + Dilithium-3)
4. La CA se guardará automáticamente

### Paso 2: Certificados S/MIME Generados
La aplicación crea automáticamente 3 certificados de prueba:
- **admin@example.com** - Administrador
- **usuario1@example.com** - Usuario de prueba 1
- **usuario2@example.com** - Usuario de prueba 2

### Paso 3: Importar en Thunderbird
1. Ir a **Configuración → Certificados → Importar**
2. Seleccionar archivos `.p12` del directorio de pruebas
3. Usar contraseña: `(la definida al generar el certificado)`
4. Configurar S/MIME en las cuentas

### Paso 4: Probar S/MIME
1. Enviar correo firmado entre usuarios
2. Verificar firma digital
3. Probar cifrado de correos
4. Validar compatibilidad

## 🧪 Pruebas y Validación

### Tests de Compatibilidad
- ✅ Estructura X.509 válida
- ✅ Extensiones S/MIME correctas
- ✅ Formato PKCS#12 compatible
- ✅ Importación en Thunderbird
- ✅ Firma y cifrado funcional

### Análisis de Seguridad
- 🔒 Resistencia a ataques clásicos
- 🔮 Preparación anti-cuántica
- 📊 Reporte de vulnerabilidades
- 🛡️ Validación criptográfica

## 📁 Estructura del Proyecto

```
Generador-Certificados-AntiCuantico/
├── src/
│   ├── main.js              # Proceso principal Electron
│   ├── preload.js           # Bridge IPC
│   └── renderer/
│       ├── index.html       # Interfaz principal
│       ├── app.js          # Lógica frontend
│       └── styles.css      # Estilos cuánticos
├── certificates/           # Certificados generados
├── testing/               # Archivos de prueba
├── package.json           # Configuración del proyecto
└── iniciar_app_anticuantica.bat  # Ejecutor rápido
```

## 🔮 Tecnología Post-Cuántica

### CRYSTALS-Dilithium-3
- **Estado**: Aprobado por NIST (2024)
- **Tipo**: Firma digital post-cuántica
- **Seguridad**: 192 bits equivalentes
- **Resistencia**: Algoritmos cuánticos

### Implementación Híbrida
```
Certificado = RSA-4096 (compatible) + Dilithium-3 (futuro)
```

### Migración Gradual
1. **Fase 1**: Certificados híbridos (actual)
2. **Fase 2**: Clientes soportan PQC
3. **Fase 3**: Migración a puro PQC
4. **Fase 4**: Deprecación de RSA

## ⚠️ Consideraciones Importantes

### Compatibilidad Actual
- Los certificados funcionan con **capa RSA** en clientes actuales
- La **capa post-cuántica** está preparada para el futuro
- **No hay pérdida de funcionalidad** S/MIME

### Preparación Futura
- Cuando los clientes soporten PQC nativo
- Los certificados ya tienen la estructura necesaria
- Migración transparente sin regenerar

## 🔧 Configuración Avanzada

### Variables de Entorno
```bash
PQC_CA_VALIDITY_YEARS=10    # Años de validez CA
PQC_CERT_VALIDITY_YEARS=3   # Años de validez certificados
PQC_TEST_USERS=3           # Número de usuarios de prueba
PQC_PQC_ALGORITHM=dilithium3 # Algoritmo post-cuántico
```

### Personalización
- Modificar datos de CA en `src/main.js`
- Ajustar usuarios de prueba
- Cambiar algoritmos (futuro)
- Configurar validez

## 📊 Comparación con App Original

| Característica | App Original | App Post-Cuántica |
|---|---|---|
| Algoritmo | RSA-8192 + SHA-512 | RSA-4096 + Dilithium-3 |
| Resistencia | Clásica | Cuántica + Clásica |
| Compatibilidad | S/MIME actual | S/MIME + preparado PQC |
| Validez | 10 años | 10 años |
| Tamaño cert | ~2KB | ~3.5KB (híbrido) |
| Velocidad | Muy rápida | Rápida |

## 🎯 Casos de Uso

### Gubernamental
- Comunicaciones oficiales seguras
- Firma de documentos críticos
- Preparación para era post-cuántica
- Cumplimiento de estándares futuros

### Empresarial
- Correo corporativo seguro
- Contratos digitales
- Comunicación confidencial
- Migración tecnológica gradual

### Investigación
- Pruebas de compatibilidad PQC
- Evaluación de algoritmos
- Tests de migración
- Análisis de rendimiento

## 🛠️ Solución de Problemas

### Error: "CA no inicializada"
```bash
# Eliminar archivos corruptos
rm -rf certificates/
# Reiniciar aplicación
npm start
```

### Error: "Dependencias faltantes"
```bash
# Reinstalar dependencias
rm -rf node_modules/
npm install
```

### Error: "Certificado no importa en Thunderbird"
- Verificar formato PKCS#12
- Usar contraseña correcta: `(la definida al generar el certificado)`
- Importar como "certificado personal"

## 📞 Soporte Técnico

**Proyecto de Ejemplo**  
Proyecto de Ejemplo

📧 Email: ca@example.com  
🏛️ Organización: Proyecto de Ejemplo  
🌐 País: Uruguay

## 📄 Licencia

Desarrollado para uso interno de Proyecto de Ejemplo.  
Todos los derechos reservados © 2024

---

## 🔮 Futuro Post-Cuántico

Esta aplicación está preparada para el futuro de la criptografía:

- **2025-2028**: Uso híbrido (RSA + PQC)
- **2028-2032**: Transición a PQC puro
- **2032+**: Era post-cuántica completa

**¡La seguridad del futuro, disponible hoy!** 🚀