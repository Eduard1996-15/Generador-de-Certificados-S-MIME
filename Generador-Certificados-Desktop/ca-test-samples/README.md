# 🔐 Sistema Universal de Testing de Seguridad CA

## 📋 Descripción

Este sistema permite analizar la seguridad de **cualquier Autoridad Certificadora (CA)** que coloques en una carpeta específica. Es completamente universal y puede evaluar:

- ✅ CAs generadas por la aplicación
- ✅ CAs de terceros (.crt, .cer, .pem)
- ✅ CAs de entidades públicas (AGESIC, DigiCert, etc.)
- ✅ CAs de prueba y desarrollo

## 🚀 Uso Rápido

### 1. Preparar CAs para análisis

Coloque los certificados CA en la carpeta:
```
<proyecto>/ca-test-samples/
```

**Formatos soportados:**
- `.crt` - Certificado X.509
- `.cer` - Certificado X.509 (formato Windows)
- `.pem` - Privacy Enhanced Mail

### 2. Ejecutar análisis

```bash
cd security-testing
python master_security_test.py "<ruta-al-proyecto>/ca-test-samples"
```

### 3. Revisar resultados

El sistema genera:
- 📊 `UNIVERSAL-CA-SECURITY-REPORT.json` - Reporte técnico completo
- 📋 `EXECUTIVE-UNIVERSAL-CA-SECURITY-SUMMARY.md` - Resumen ejecutivo

## 🔍 Qué Analiza

### Análisis Criptográfico
- **Tamaño de clave**: Evalúa si RSA tiene suficiente fortaleza
- **Algoritmo de firma**: Detecta algoritmos obsoletos (SHA-1, MD5)
- **Extensiones X.509**: Verifica configuración correcta de CA
- **Período de validez**: Identifica certificados expirados o próximos a expirar

### Evaluación de Riesgo
- 🔴 **CRÍTICO**: Claves < 2048 bits, algoritmos obsoletos
- 🟠 **ALTO**: Claves < 3072 bits, configuraciones subóptimas
- 🟡 **MEDIO**: Configuraciones aceptables con mejoras recomendadas
- 🟢 **BAJO**: Configuración óptima (RSA 4096+ bits, SHA-256+)

### Pruebas de Penetración
- Análisis de vulnerabilidades conocidas
- Testing de resistencia a ataques
- Evaluación de mejores prácticas PKI

## 📁 Estructura de Carpetas

```
proyecto/
├── ca-test-samples/          ← Coloque CAs aquí
│   ├── MICA.cer             ← CA de AGESIC (ejemplo)
│   ├── mi_ca_test.crt       ← Su CA de prueba
│   └── empresa_ca.pem       ← CA corporativa
├── security-testing/
│   ├── master_security_test.py  ← Script principal
│   ├── advanced_ca_pentest.py
│   └── extreme_ca_pentest.py
└── reportes/                ← Reportes generados
    ├── UNIVERSAL-CA-SECURITY-REPORT.json
    └── EXECUTIVE-UNIVERSAL-CA-SECURITY-SUMMARY.md
```

## 🎯 Casos de Uso

### Desarrollador
```bash
# Analizar CA propia + CA de referencia
cp mi_ca.crt ca-test-samples/
cp referencia_publica.cer ca-test-samples/
python security-testing/master_security_test.py .
```

### Auditor de Seguridad
```bash
# Analizar múltiples CAs de organización
cp ca_interna_1.crt ca-test-samples/
cp ca_interna_2.crt ca-test-samples/
cp ca_tercero.cer ca-test-samples/
python security-testing/master_security_test.py .
```

### Investigador
```bash
# Comparar CAs públicas conocidas
cp agesic_ca.cer ca-test-samples/
cp digicert_ca.crt ca-test-samples/
cp letsencrypt_ca.pem ca-test-samples/
python security-testing/master_security_test.py .
```

## 📊 Ejemplo de Reporte

```
CAs analizadas: 3
   MICA: MEDIO (C:0, H:1)
     Clave: 2048 bits, Firma: sha256WithRSAEncryption
   Generated_CA: BAJO (C:0, H:0)
     Clave: 8192 bits, Firma: sha256WithRSAEncryption
   DigiCert_Test: BAJO (C:0, H:0)
     Clave: 4096 bits, Firma: sha256WithRSAEncryption

Nivel de riesgo general: MEDIO
```

## ⚠️ Consideraciones Legales

### ✅ USO AUTORIZADO
- Entorno de desarrollo/testing
- Sistemas propios
- Con autorización explícita
- Fines educativos/investigación

### ❌ USO PROHIBIDO
- Sistemas de producción sin autorización
- Sistemas de terceros
- CAs públicas sin permiso
- Fines maliciosos

## 🔧 Requisitos Técnicos

### Dependencias Python
```bash
pip install cryptography pathlib
```

### Sistemas Compatibles
- ✅ Windows 10/11
- ✅ macOS
- ✅ Linux

### Espacio en Disco
- ~10 MB para reportes por CA
- Recomendado: 100 MB libres

## 🆘 Solución de Problemas

### Error: "No se encontraron certificados CA"
**Solución**: Verificar que los archivos estén en `ca-test-samples/` con extensión correcta (.crt/.cer/.pem)

### Error: "ModuleNotFoundError: cryptography"
**Solución**: Instalar dependencias con `pip install cryptography`

### Error: "Error analizando certificado"
**Solución**: Verificar que el archivo sea un certificado X.509 válido

### Warning: "CAs con vulnerabilidades críticas"
**Acción**: Revisar reporte detallado y considerar reemplazo de CAs problemáticas

## 📚 Referencias

- [RFC 5280 - X.509 PKI](https://tools.ietf.org/html/rfc5280)
- [NIST SP 800-57 - Key Management](https://csrc.nist.gov/publications/detail/sp/800-57-part-1/rev-5/final)
- [CA/Browser Forum - Baseline Requirements](https://cabforum.org/baseline-requirements-documents/)

---

**Desarrollado por**: Equipo de Desarrollo  
**Versión**: 2.0 - Universal CA Analyzer  
**Fecha**: Octubre 2025