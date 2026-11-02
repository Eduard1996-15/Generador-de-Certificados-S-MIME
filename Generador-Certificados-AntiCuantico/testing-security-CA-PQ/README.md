# 🔒 Testing de Seguridad CA Post-Cuántica

Sistema de análisis de vulnerabilidades y fortaleza de seguridad para Autoridad Certificadora y certificados post-cuánticos.

---

## 📋 ¿Qué analiza este sistema?

### 🏛️ Análisis de CA (Autoridad Certificadora)
- ✅ Validez temporal del certificado
- ✅ Tamaño de claves RSA (mínimo 4096 bits recomendado)
- ✅ Algoritmo de firma (SHA-512 recomendado)
- ✅ Extensiones críticas (basicConstraints, keyUsage)
- ✅ Presencia de claves Dilithium (post-cuánticas)
- ✅ Protección de clave privada (cifrado)

### 📧 Análisis de Certificados de Usuario
- ✅ Certificados válidos vs expirados
- ✅ Fortaleza de claves RSA
- ✅ Cumplimiento de estándares

### 🔐 Análisis Criptográfico
- ✅ Test de aleatoriedad (Chi-cuadrado)
- ✅ Test de entropía
- ✅ Calidad de generadores de números aleatorios

### 🛡️ Preparación Post-Cuántica
- ✅ Implementación de CRYSTALS-Dilithium
- ✅ Modo híbrido RSA + Dilithium
- ✅ Puntuación de resistencia cuántica (0-100)

### 📦 Análisis PKCS#12
- ✅ Archivos protegidos con contraseña
- ✅ Detección de archivos sin cifrar

### 🔄 Análisis de Cifrado Híbrido
- ✅ Presencia de archivos híbridos
- ✅ Validación de estructura
- ✅ Verificación de algoritmos

---

## 🚀 Cómo ejecutar

### Opción 1: Script automático (Recomendado)

Simplemente ejecuta:
```
run-security-test.bat
```

### Opción 2: Comando manual

```bash
node security-analyzer.js
```

---

## 📊 Niveles de Severidad

| Severidad | Icono | Puntos | Descripción |
|-----------|-------|--------|-------------|
| **CRÍTICO** | 🔴 | -25 | Requiere acción inmediata |
| **ALTO** | 🟠 | -15 | Resolver en corto plazo |
| **MEDIO** | 🟡 | -10 | Atender cuando sea posible |
| **BAJO** | 🟢 | -5 | Mejora recomendada |
| **INFO** | 🔵 | 0 | Información adicional |

---

## 📈 Puntuación de Seguridad

| Puntuación | Calificación | Significado |
|------------|--------------|-------------|
| 90-100 | 🟢 EXCELENTE | Sistema seguro y listo para producción |
| 75-89 | 🟡 BUENO | Sistema aceptable con mejoras menores |
| 50-74 | 🟠 ACEPTABLE | Requiere mejoras antes de producción |
| 0-49 | 🔴 CRÍTICO | NO usar en producción |

---

## 📄 Reportes Generados

Después de ejecutar el análisis, se generan dos reportes:

### 1. `SECURITY-REPORT.md`
Reporte detallado en formato Markdown con:
- Resumen ejecutivo
- Análisis por categoría
- Lista de vulnerabilidades
- Recomendaciones prioritarias
- Conclusiones

### 2. `security-report.json`
Datos estructurados en JSON para:
- Integración con sistemas externos
- Análisis automatizado
- Histórico de análisis

---

## 🎯 Códigos de Vulnerabilidades

### CA (Autoridad Certificadora)
- `CA-001` a `CA-015`: Problemas con la CA
- `CA-099`: Error general de análisis

### Certificados
- `CERT-xxx`: Problemas con certificados de usuario
- `CERT-KEY-xxx`: Problemas con claves de certificados

### Criptografía
- `CRYPTO-001`: Generador de aleatorios débil

### Post-Cuántico
- `PQC-001`: Criptografía PQC no implementada
- `PQC-002`: Biblioteca faltante

### PKCS#12
- `PKCS12-xxx`: Problemas con archivos PKCS#12

### Híbrido
- `HYBRID-xxx`: Problemas con cifrado híbrido

---

## 💡 Recomendaciones Generales

### Para Producción (Puntuación >= 75)
1. ✅ CA con RSA-4096 + Dilithium-3
2. ✅ Algoritmo de firma SHA-512
3. ✅ Claves privadas cifradas
4. ✅ Certificados con validez adecuada
5. ✅ Archivos PKCS#12 protegidos
6. ✅ Cifrado híbrido activo

### Para Máxima Seguridad (Puntuación >= 90)
Además de lo anterior:
1. ✅ Test de aleatoriedad > 95%
2. ✅ Entropía óptima (> 7.8 bits)
3. ✅ Modo híbrido en todos los certificados
4. ✅ Preparación post-cuántica 100%

---

## 🔍 Ejemplo de Salida

```
================================================================================
🔒 ANALIZADOR DE SEGURIDAD POST-CUÁNTICA
================================================================================
📅 Fecha: 12/10/2025 14:30:00
📂 CA Path: C:\...\pqc-ca
📂 Certificados: C:\...\user-certificates

🏛️ Analizando Autoridad Certificadora...

📅 Válido desde: 12/10/2025
📅 Válido hasta: 12/10/2040
⏳ Días restantes: 5478
🔑 Tamaño de clave RSA: 4096 bits
✅ Tamaño de clave RSA adecuado (4096+ bits)
📝 Algoritmo de firma: sha512WithRSAEncryption
✅ Algoritmo de firma seguro (SHA-512)
✅ basicConstraints correctamente configurado
✅ keyUsage presente
🔐 Clave Dilithium detectada:
   • Privada: 4032 bytes
   • Pública: 1952 bytes
✅ Claves Dilithium con tamaño correcto (Dilithium-3)
✅ Clave privada CA protegida con cifrado

--------------------------------------------------------------------------------

📧 Analizando Certificados de Usuario...

📊 Total certificados analizados: 3
✅ Certificados válidos: 3
⚠️  Certificados expirados: 0
🔑 Certificados con claves débiles: 0

--------------------------------------------------------------------------------

🔐 Analizando Fortaleza Criptográfica...

🎲 Test de aleatoriedad: ✅ PASÓ
📊 Test de entropía: ✅ PASÓ

--------------------------------------------------------------------------------

🛡️ Analizando Preparación Post-Cuántica...

✅ CRYSTALS-Dilithium implementado
✅ Modo híbrido activo (RSA + Dilithium)
✅ Biblioteca @noble/post-quantum presente

📊 Puntuación de preparación post-cuántica: 100/100
✅ Sistema BIEN preparado para amenazas cuánticas

--------------------------------------------------------------------------------

📦 Analizando Seguridad de Archivos PKCS#12...

📊 Total archivos PKCS#12: 3
🔒 Archivos protegidos: 3
⚠️  Archivos sin protección: 0

--------------------------------------------------------------------------------

🔄 Analizando Cifrado Híbrido...

📊 Total archivos híbridos: 3
✅ Archivos híbridos válidos: 3

--------------------------------------------------------------------------------

================================================================================
🎯 ANÁLISIS COMPLETO - Puntuación final: 100/100
📊 Calificación: 🟢 EXCELENTE
================================================================================
```

---

## 🆘 Solución de Problemas

### Problema: "CA no encontrada"
**Solución:** Genera una CA usando el botón "Crear Nueva CA" en la aplicación principal.

### Problema: "Claves Dilithium no encontradas"
**Solución:** La CA debe regenerarse con soporte post-cuántico completo.

### Problema: "Puntuación baja"
**Solución:** Revisa el reporte `SECURITY-REPORT.md` y atiende las vulnerabilidades por orden de severidad.

### Problema: "Error ejecutando análisis"
**Solución:** Verifica que Node.js esté instalado y que las dependencias estén actualizadas.

---

## 📞 Contacto

**Proyecto de Ejemplo**  
República Oriental del Uruguay

Para reportar vulnerabilidades o consultas sobre seguridad, contactar al equipo de seguridad informática.

---

**Última actualización:** Octubre 2025
