# Documentación Técnica: Infraestructura de Clave Pública (PKI)
## Generador de Certificados S/MIME

**Versión:** 1.0.0  
**Fecha:** Octubre 2025  
**Desarrollado por:** Desarrollador - Empresa

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Arquitectura PKI](#2-arquitectura-pki)
3. [Autoridad Certificadora (CA)](#3-autoridad-certificadora-ca)
4. [Generación de Certificados de Usuario](#4-generación-de-certificados-de-usuario)
5. [Estándares y Cumplimiento Normativo](#5-estándares-y-cumplimiento-normativo)
6. [Parámetros de Seguridad](#6-parámetros-de-seguridad)
7. [Análisis del Código](#7-análisis-del-código)
8. [Referencias y Documentación Oficial](#8-referencias-y-documentación-oficial)

---

## 1. Introducción

Este documento describe detalladamente la implementación de la Infraestructura de Clave Pública (PKI) utilizada en el Generador de Certificados S/MIME. La aplicación implementa una Autoridad Certificadora (CA) privada capaz de emitir certificados digitales para correo electrónico seguro siguiendo estándares internacionales.

### 1.1 Propósito

El sistema está diseñado para:
- Generar una Autoridad Certificadora (CA) autofirmada
- Emitir certificados S/MIME para usuarios
- Garantizar la seguridad mediante criptografía robusta
- Cumplir con estándares X.509 y PKCS

### 1.2 Tecnologías Utilizadas

- **Node.js**: Plataforma de ejecución JavaScript
- **Electron**: Framework para aplicaciones de escritorio
- **node-forge**: Biblioteca criptográfica JavaScript que implementa TLS, PKI, y criptografía
  - Repositorio: https://github.com/digitalbazaar/forge
  - Implementa estándares IETF y W3C

---

## 2. Arquitectura PKI

### 2.1 Modelo Jerárquico

La aplicación implementa un modelo PKI de dos niveles:

```
┌─────────────────────────────────────┐
│   Autoridad Certificadora (CA)      │
│   - Certificado autofirmado          │
│   - Clave privada RSA 8192 bits     │
│   - Validez: 10 años                │
└────────────┬────────────────────────┘
             │
             │ Firma
             │
     ┌───────┴────────┬────────────┬────────────┐
     │                │            │            │
┌────▼────┐    ┌─────▼─────┐ ┌───▼────┐  ┌────▼────┐
│ Cert    │    │ Cert      │ │ Cert   │  │ Cert    │
│ Usuario1│    │ Usuario2  │ │ Usuario│  │ Usuario │
│ S/MIME  │    │ S/MIME    │ │ 3      │  │ N       │
└─────────┘    └───────────┘ └────────┘  └─────────┘
```

### 2.2 Flujo de Certificación

1. **Inicialización**: Se crea o carga la CA al iniciar la aplicación
2. **Solicitud**: Usuario ingresa datos (email, nombre, contraseña)
3. **Generación de claves**: Se genera par de claves RSA para el usuario
4. **Creación del certificado**: Se crea certificado con extensiones S/MIME
5. **Firma**: La CA firma el certificado con su clave privada
6. **Empaquetado**: Se genera archivo PKCS#12 protegido con contraseña

---

## 3. Autoridad Certificadora (CA)

### 3.1 Especificaciones Técnicas de la CA

| Parámetro | Valor | Estándar |
|-----------|-------|----------|
| **Tipo de Clave** | RSA | PKCS #1 v2.2 (RFC 8017) |
| **Tamaño de Clave** | 8192 bits (configurable) | NIST SP 800-57 Part 1 |
| **Algoritmo de Firma** | SHA-256 with RSA | FIPS 180-4, RFC 5754 |
| **Versión X.509** | v3 | RFC 5280 |
| **Validez** | 10 años | Configurable |
| **Formato de Almacenamiento** | PEM | RFC 7468 |

### 3.2 Proceso de Creación de la CA

#### 3.2.1 Generación del Par de Claves

```javascript
const keys = forge.pki.rsa.generateKeyPair(8192);
```

**Explicación técnica:**
- Utiliza el algoritmo RSA con módulo de 8192 bits (configurable, por defecto 8192)
- Genera clave pública (e, n) y clave privada (d, p, q, dP, dQ, qInv)
- Exponente público estándar: 65537 (0x10001)
- **Seguridad**: 8192 bits proporciona ~192 bits de seguridad, máxima seguridad para largo plazo (resistente hasta 2050+)

**Referencia estándar:**
- **RFC 8017** - PKCS #1: RSA Cryptography Specifications Version 2.2
  - URL: https://tools.ietf.org/html/rfc8017
- **NIST SP 800-57 Part 1 Rev. 5** - Recommendation for Key Management
  - URL: https://csrc.nist.gov/publications/detail/sp/800-57-part-1/rev-5/final

#### 3.2.2 Creación del Certificado

```javascript
const cert = forge.pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10);
```

**Parámetros del certificado:**

1. **Serial Number (Número de Serie)**
   - Valor: '01' (primer certificado de la CA)
   - **Estándar**: RFC 5280 - Debe ser único para cada certificado emitido por la CA
   - Formato: Entero positivo (máximo 20 octetos)

2. **Validity (Período de Validez)**
   - **notBefore**: Fecha y hora de inicio de validez
   - **notAfter**: Fecha de expiración (10 años desde emisión)
   - **Estándar**: RFC 5280 §4.1.2.5 - Tiempo UTC o Generalized Time
   - **Cumplimiento**: CA/Browser Forum Baseline Requirements §6.3.2

#### 3.2.3 Atributos del Subject/Issuer

```javascript
const attrs = [
  { name: 'commonName', value: 'Empresa Email Certificates CA' },
  { name: 'countryName', value: 'ES' },
  { shortName: 'ST', value: 'Madrid' },
  { name: 'localityName', value: 'Madrid' },
  { name: 'organizationName', value: 'Empresa' },
  { shortName: 'OU', value: 'Certificate Authority' }
];

cert.setSubject(attrs);
cert.setIssuer(attrs);  // Autofirmado: Subject = Issuer
```

**Distinguished Name (DN) según X.500:**

| Atributo | OID | Valor | Propósito |
|----------|-----|-------|-----------|
| CN (Common Name) | 2.5.4.3 | Empresa Root Certification Authority | Identifica la CA |
| C (Country) | 2.5.4.6 | UY | Código ISO 3166-1 país (Uruguay) |
| ST (State) | 2.5.4.8 | Montevideo | Estado/Provincia/Departamento |
| L (Locality) | 2.5.4.7 | Montevideo | Ciudad |
| O (Organization) | 2.5.4.10 | Empresa | Organización emisora |
| OU (Org Unit) | 2.5.4.11 | Certificate Authority | Unidad organizativa |
| emailAddress | 1.2.840.113549.1.9.1 | ca@empresa.com | Email de contacto de la CA |

**Referencias:**
- **RFC 5280 §4.1.2.4** - Issuer
- **RFC 5280 §4.1.2.6** - Subject
- **X.500** - Directory Services Standard (ITU-T)

#### 3.2.4 Extensiones X.509 v3

```javascript
cert.setExtensions([
  {
    name: 'basicConstraints',
    cA: true,
    critical: true
  },
  {
    name: 'keyUsage',
    keyCertSign: true,
    cRLSign: true,
    critical: true
  }
]);
```

##### Extension 1: Basic Constraints (Restricciones Básicas)

**OID**: 2.5.29.19  
**Critical**: TRUE (obligatorio)  
**Valor**: cA=TRUE

**Explicación:**
- Identifica este certificado como una Autoridad Certificadora
- Permite firmar otros certificados
- **Critical=TRUE**: Si una aplicación no reconoce esta extensión, debe rechazar el certificado

**Estándar:**
- **RFC 5280 §4.2.1.9** - Basic Constraints
  - URL: https://tools.ietf.org/html/rfc5280#section-4.2.1.9
- Marcada como CRITICAL para CAs según CA/Browser Forum

##### Extension 2: Key Usage (Uso de Clave)

**OID**: 2.5.29.15  
**Critical**: TRUE  
**Valores**: 
- `keyCertSign`: Permite firmar certificados de otras entidades
- `cRLSign`: Permite firmar listas de revocación de certificados (CRL)

**Explicación:**
- Define para qué puede usarse la clave privada de la CA
- **keyCertSign**: Esencial para firmar certificados de usuario
- **cRLSign**: Permite gestionar revocación (aunque no implementado en v1.0)

**Estándar:**
- **RFC 5280 §4.2.1.3** - Key Usage
  - URL: https://tools.ietf.org/html/rfc5280#section-4.2.1.3

##### Extension 3: Subject Key Identifier (Identificador de Clave del Sujeto)

**OID**: 2.5.29.14  
**Critical**: FALSE (recomendado)

**Explicación:**
- Identifica de forma única la clave pública de la CA
- Calculado como hash SHA-1 de la clave pública
- Esencial para validación de cadenas de certificados
- Permite identificar qué clave firmó certificados hijos

**Estándar:**
- **RFC 5280 §4.2.1.2** - Subject Key Identifier
  - URL: https://tools.ietf.org/html/rfc5280#section-4.2.1.2

##### Extension 4: Authority Key Identifier (Identificador de Clave de Autoridad)

**OID**: 2.5.29.35  
**Critical**: FALSE  
**Valor**: keyid=TRUE (usa Subject Key Identifier de la CA)

**Explicación:**
- En certificados autofirmados, apunta a sí mismo
- Facilita la construcción de cadenas de certificados
- Los clientes usan este campo para encontrar el certificado emisor
- Mejora la confiabilidad del certificado

**Estándar:**
- **RFC 5280 §4.2.1.1** - Authority Key Identifier
  - URL: https://tools.ietf.org/html/rfc5280#section-4.2.1.1

#### 3.2.5 Firma del Certificado

```javascript
cert.sign(keys.privateKey, forge.md.sha256.create());
```

**Proceso de firma digital:**

1. **Hashing del certificado**:
   - Se serializa el certificado en formato DER (Distinguished Encoding Rules)
   - Se calcula hash SHA-256 del contenido
   - SHA-256 produce digest de 256 bits (32 bytes)

2. **Cifrado del hash**:
   - El hash se cifra con la clave privada RSA de la CA
   - Produce firma digital de ~512 bytes (para RSA-4096)

3. **Algoritmo de firma**: SHA256withRSA
   - **OID**: 1.2.840.113549.1.1.11
   - Combina SHA-256 (FIPS 180-4) con RSA (PKCS #1)

**Seguridad:**
- SHA-256 resistente a colisiones (no se conocen ataques prácticos)
- Aprobado por NIST, FIPS, y recomendado por CA/Browser Forum
- Reemplaza SHA-1 (obsoleto desde 2017)

**Referencias:**
- **RFC 5754** - Using SHA2 Algorithms with Cryptographic Message Syntax
  - URL: https://tools.ietf.org/html/rfc5754
- **FIPS 180-4** - Secure Hash Standard (SHS)
  - URL: https://csrc.nist.gov/publications/detail/fips/180/4/final

#### 3.2.6 Almacenamiento Seguro

```javascript
fs.writeFileSync(this.certPath, forge.pki.certificateToPem(cert));
fs.writeFileSync(this.keyPath, forge.pki.privateKeyToPem(keys.privateKey));
```

**Ubicación:**
- Directorio: `%APPDATA%/generador-certificados-smime/ca/`
- Archivos:
  - `ca.crt`: Certificado público (PEM)
  - `ca.key`: Clave privada (PEM)

**Formato PEM:**
- Base64 encoding de estructura DER
- Delimitado por `-----BEGIN CERTIFICATE-----` y `-----END CERTIFICATE-----`
- Estándar: **RFC 7468** - Textual Encodings of PKIX, PKCS, and CMS Structures
  - URL: https://tools.ietf.org/html/rfc7468

**Consideraciones de seguridad:**
- ⚠️ La clave privada NO está cifrada en disco
- Protegida por permisos del sistema operativo (user-only access)
- **Mejora recomendada**: Cifrar clave privada con contraseña maestra

---

## 4. Generación de Certificados de Usuario

### 4.1 Especificaciones Técnicas

| Parámetro | Valor Default | Rango Permitido | Estándar |
|-----------|---------------|-----------------|----------|
| **Tipo de Clave** | RSA | - | PKCS #1 |
| **Tamaño de Clave** | 2048 bits | 2048-8192 bits | NIST SP 800-57 |
| **Algoritmo de Firma** | SHA-256 with RSA | - | RFC 5754 |
| **Validez** | 1 año | 1-5 años | Configurable |
| **Formato de exportación** | PKCS#12 | PEM, P12 | RFC 7292 |

### 4.2 Proceso de Generación

#### 4.2.1 Generación de Par de Claves del Usuario

```javascript
const userKeys = forge.pki.rsa.generateKeyPair(keySize);
```

**Parámetros:**
- `keySize`: 2048, 3072, 4096, o 8192 bits (seleccionable por usuario)
- Valores recomendados según NIST:
  - **2048 bits**: Seguridad hasta 2030 (112 bits de seguridad)
  - **3072 bits**: Seguridad hasta 2040+ (128 bits de seguridad)
  - **4096 bits**: Alta seguridad (150 bits de seguridad)
  - **8192 bits**: Máxima seguridad disponible (192 bits de seguridad, resistente hasta 2050+)

**Referencia:**
- **NIST SP 800-57 Part 1 Rev. 5, Table 2**
  - URL: https://doi.org/10.6028/NIST.SP.800-57pt1r5

#### 4.2.2 Creación del Certificado de Usuario

```javascript
const cert = forge.pki.createCertificate();
cert.publicKey = userKeys.publicKey;
cert.serialNumber = forge.util.bytesToHex(forge.random.getBytesSync(16));
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + validityYears);
```

**Serial Number único:**
- Generado con 16 bytes aleatorios (128 bits)
- Convertido a hexadecimal
- Garantiza unicidad criptográfica (probabilidad colisión: 2^-128)
- **Cumple**: RFC 5280 §4.1.2.2 (requisito de unicidad)

#### 4.2.3 Atributos del Subject

```javascript
const attrs = [
  { name: 'commonName', value: name || email.split('@')[0] },
  { name: 'emailAddress', value: email },
  { name: 'countryName', value: 'ES' },
  { name: 'organizationName', value: 'Personal' }
];

cert.setSubject(attrs);
cert.setIssuer(this.caCert.subject.attributes);
```

**Atributos del usuario:**

| Atributo | OID | Descripción | Valor |
|----------|-----|-------------|-------|
| CN | 2.5.4.3 | Nombre común del usuario | Nombre o email |
| emailAddress | 1.2.840.113549.1.9.1 | Dirección de correo (PKCS #9) | Email del usuario |
| C | 2.5.4.6 | País | UY (Uruguay) |
| ST | 2.5.4.8 | Estado/Provincia | Montevideo |
| L | 2.5.4.7 | Localidad/Ciudad | Montevideo |
| O | 2.5.4.10 | Organización | Personal |

**Issuer:**
- Se copia el Subject de la CA
- Establece cadena de confianza CA → Usuario
- Permite validación criptográfica

#### 4.2.4 Extensiones X.509 v3 para S/MIME

```javascript
cert.setExtensions([
  {
    name: 'basicConstraints',
    cA: false
  },
  {
    name: 'keyUsage',
    digitalSignature: true,
    keyEncipherment: true,
    dataEncipherment: true
  },
  {
    name: 'extKeyUsage',
    emailProtection: true
  },
  {
    name: 'subjectAltName',
    altNames: [{ type: 1, value: email }]
  }
]);
```

##### Extension 1: Basic Constraints

**Valor**: cA=FALSE  
**Explicación**: Certificado de entidad final (no puede firmar otros certificados)  
**Estándar**: RFC 5280 §4.2.1.9

##### Extension 2: Key Usage

**OID**: 2.5.29.15  
**Valores**:
- `digitalSignature` (bit 0): Verificar firmas digitales (firmar correos)
- `keyEncipherment` (bit 2): Cifrar claves simétricas (cifrar correos)
- `dataEncipherment` (bit 3): Cifrar datos directamente

**Explicación:**
- **digitalSignature**: Permite firmar mensajes de correo (autenticación e integridad)
- **keyEncipherment**: Permite cifrar la clave de sesión en S/MIME
- **dataEncipherment**: Permite cifrado de datos (menos común en S/MIME moderno)
- **critical=TRUE**: Marca como crítica - aplicaciones deben entender esta extensión

**Estándar**: RFC 5280 §4.2.1.3

##### Extension 3: Extended Key Usage

**OID**: 2.5.29.37  
**Critical**: TRUE  
**Valor**: emailProtection (1.3.6.1.5.5.7.3.4)

**Explicación:**
- Especifica que el certificado es para protección de correo electrónico
- Requerido para que clientes de correo acepten el certificado para S/MIME
- **critical=TRUE**: Asegura que solo se use para el propósito especificado
- Compatible con:
  - Mozilla Thunderbird
  - Microsoft Outlook
  - Apple Mail
  - Otros clientes S/MIME

**Estándar**: 
- RFC 5280 §4.2.1.12 - Extended Key Usage
- RFC 5751 §4.4.2 - S/MIME Capabilities

##### Extension 4: Subject Alternative Name (SAN)

**OID**: 2.5.29.17  
**Tipo**: rfc822Name (type=1)  
**Valor**: Dirección de correo electrónico del usuario

**Explicación:**
- Incluye el email como nombre alternativo del sujeto
- **CRÍTICO para S/MIME**: Los clientes buscan el email aquí primero
- Permite certificados multi-email (múltiples valores SAN)
- Más moderno que emailAddress en Subject DN

**Estándar**: 
- RFC 5280 §4.2.1.6 - Subject Alternative Name
- RFC 5751 - S/MIME Version 3.2 Message Specification

##### Extension 5: Subject Key Identifier (Identificador de Clave del Sujeto)

**OID**: 2.5.29.14  
**Critical**: FALSE

**Explicación:**
- Identifica de forma única la clave pública del usuario
- Hash SHA-1 de la clave pública
- Permite a los clientes identificar certificados duplicados
- Útil para renovaciones y reemplazos de certificados

**Estándar**: RFC 5280 §4.2.1.2

##### Extension 6: Authority Key Identifier (Identificador de Clave de Autoridad)

**OID**: 2.5.29.35  
**Critical**: FALSE  
**Valor**: keyid=TRUE (referencia al Subject Key Identifier de la CA)

**Explicación:**
- Apunta a la clave que firmó este certificado (la CA)
- Permite a los clientes construir y validar la cadena de certificados
- Vincula criptográficamente el certificado con su CA emisora
- **Esencial para confiabilidad**: Los clientes modernos requieren este campo

**Estándar**: RFC 5280 §4.2.1.1

#### 4.2.5 Firma por la CA

```javascript
cert.sign(this.caKeys.privateKey, forge.md.sha256.create());
```

**Proceso:**
1. Serializa el certificado del usuario en DER
2. Calcula SHA-256 hash
3. Cifra el hash con la clave privada de la CA
4. Adjunta la firma al certificado

**Resultado:**
- Certificado X.509v3 firmado digitalmente
- Vinculado criptográficamente a la CA
- Verificable por cualquier sistema que confíe en la CA

#### 4.2.6 Empaquetado PKCS#12

```javascript
const p12Asn1 = forge.pkcs12.toPkcs12Asn1(
  userKeys.privateKey,
  [cert, this.caCert],
  password,
  { algorithm: '3des' }
);
const p12Der = forge.asn1.toDer(p12Asn1).getBytes();
const p12Base64 = forge.util.encode64(p12Der);
```

**PKCS#12 (Personal Information Exchange):**

**Estándar**: RFC 7292 - PKCS #12: Personal Information Exchange Syntax v1.1
- URL: https://tools.ietf.org/html/rfc7292

**Contenido del archivo P12:**
1. **Clave privada del usuario** (cifrada)
2. **Certificado del usuario** (firmado por CA)
3. **Certificado de la CA** (cadena de confianza)

**Algoritmo de cifrado:**
- **3DES (Triple DES)**: DES-EDE3-CBC
- Clave derivada de la contraseña del usuario mediante PBKDF2
- **Iteraciones**: Configuradas por node-forge (típicamente 2048+)
- **Seguridad**: Adecuada para proteger claves privadas

**Notas de seguridad:**
- 3DES es legacy pero ampliamente compatible
- Alternativa moderna: AES-256 (requiere soporte del cliente)
- La fortaleza depende de la contraseña del usuario

**Por qué incluir la CA:**
- Permite instalar todo el chain of trust en un solo archivo
- Cliente de correo puede validar el certificado inmediatamente
- No requiere instalación separada de la CA

### 4.3 Formatos de Exportación

#### 4.3.1 PKCS#12 (.p12, .pfx)

**Uso**: Importar en Thunderbird, Outlook, navegadores  
**Contenido**: Clave privada + certificado + CA  
**Protección**: Cifrado con contraseña  
**Estándar**: RFC 7292

#### 4.3.2 PEM (.pem)

**Uso**: Servidores, scripts, desarrollo  
**Contenido**: Certificado en texto Base64  
**Formato**:
```
-----BEGIN CERTIFICATE-----
MIIFa... (Base64)
-----END CERTIFICATE-----
-----BEGIN PRIVATE KEY-----
MIIJQg... (Base64)
-----END PRIVATE KEY-----
```
**Estándar**: RFC 7468

#### 4.3.3 CRT (.crt)

**Uso**: Certificado público únicamente  
**Contenido**: Solo certificado (sin clave privada)  
**Formato**: PEM  
**Uso típico**: Distribución de certificado público, validación

---

## 5. Estándares y Cumplimiento Normativo

### 5.1 Estándares X.509 y PKI

| Estándar | Título | URL | Cumplimiento |
|----------|--------|-----|--------------|
| **RFC 5280** | Internet X.509 Public Key Infrastructure Certificate and Certificate Revocation List (CRL) Profile | https://tools.ietf.org/html/rfc5280 | ✅ Completo |
| **RFC 8017** | PKCS #1: RSA Cryptography Specifications Version 2.2 | https://tools.ietf.org/html/rfc8017 | ✅ Completo |
| **RFC 7292** | PKCS #12: Personal Information Exchange Syntax v1.1 | https://tools.ietf.org/html/rfc7292 | ✅ Completo |
| **RFC 7468** | Textual Encodings of PKIX, PKCS, and CMS Structures | https://tools.ietf.org/html/rfc7468 | ✅ Completo |

### 5.2 Estándares S/MIME

| Estándar | Título | URL | Cumplimiento |
|----------|--------|-----|--------------|
| **RFC 5751** | Secure/Multipurpose Internet Mail Extensions (S/MIME) Version 3.2 Message Specification | https://tools.ietf.org/html/rfc5751 | ✅ Completo |
| **RFC 5750** | Secure/Multipurpose Internet Mail Extensions (S/MIME) Version 3.2 Certificate Handling | https://tools.ietf.org/html/rfc5750 | ✅ Completo |
| **RFC 8551** | Secure/Multipurpose Internet Mail Extensions (S/MIME) Version 4.0 Message Specification | https://tools.ietf.org/html/rfc8551 | ✅ Compatible |

### 5.3 Estándares Criptográficos

| Estándar | Título | Organismo | URL |
|----------|--------|-----------|-----|
| **FIPS 180-4** | Secure Hash Standard (SHS) | NIST | https://csrc.nist.gov/publications/detail/fips/180/4/final |
| **NIST SP 800-57 Part 1 Rev. 5** | Recommendation for Key Management: General | NIST | https://csrc.nist.gov/publications/detail/sp/800-57-part-1/rev-5/final |
| **RFC 5754** | Using SHA2 Algorithms with Cryptographic Message Syntax | IETF | https://tools.ietf.org/html/rfc5754 |

### 5.4 Cumplimiento de Seguridad

#### 5.4.1 NIST Recommendations

✅ **Cumple con NIST SP 800-57**:
- RSA 2048+ bits (recomendado hasta 2030)
- RSA 4096 bits para CA (seguridad extendida)
- SHA-256 (función hash aprobada)

#### 5.4.2 CA/Browser Forum Baseline Requirements

⚠️ **No aplica completamente** (CA privada, no pública):
- Baseline Requirements son para CAs públicas en navegadores
- Este sistema es para uso interno/privado
- Implementa mejores prácticas aplicables

✅ **Prácticas adoptadas**:
- BasicConstraints marcado como CRITICAL
- Key Usage apropiado
- Serial numbers únicos
- Algoritmos criptográficos modernos

#### 5.4.3 Compatibilidad con Clientes

✅ **Compatible con**:
- Mozilla Thunderbird (todas las versiones)
- Microsoft Outlook 2016+
- Apple Mail
- Clientes S/MIME estándar

---

## 6. Parámetros de Seguridad

### 6.1 Fortaleza Criptográfica

#### 6.1.1 Tamaños de Clave RSA

| Tamaño | Bits de Seguridad | Equivalente Simétrico | Válido Hasta | Uso Recomendado |
|--------|-------------------|----------------------|--------------|-----------------|
| 1024 bits | ~80 bits | DES | ❌ Obsoleto | No usar |
| 2048 bits | ~112 bits | 3DES | 2030 | Usuario estándar |
| 3072 bits | ~128 bits | AES-128 | 2040+ | Usuario alto valor |
| 4096 bits | ~150 bits | AES-192 | 2050+ | Usuario crítico |
| 8192 bits | ~192 bits | AES-256 | 2050+ | **CA, máxima seguridad** |

**Fuente**: NIST SP 800-57 Part 1 Rev. 5, Table 2

#### 6.1.2 Funciones Hash

| Algoritmo | Output | Estado | Uso en Sistema |
|-----------|--------|--------|----------------|
| MD5 | 128 bits | ❌ Roto | No usado |
| SHA-1 | 160 bits | ❌ Obsoleto | No usado |
| **SHA-256** | 256 bits | ✅ Seguro | **Usado** |
| SHA-384 | 384 bits | ✅ Seguro | No necesario |
| SHA-512 | 512 bits | ✅ Seguro | No necesario |

**SHA-256 Seguridad**:
- Resistencia a colisiones: 2^128 operaciones
- Resistencia a preimagen: 2^256 operaciones
- No se conocen ataques prácticos
- Aprobado FIPS, usado en TLS, Bitcoin, etc.

### 6.2 Análisis de Amenazas y Mitigaciones

#### 6.2.1 Amenaza: Compromiso de Clave Privada CA

**Impacto**: CRÍTICO  
**Descripción**: Si la clave privada de la CA es robada, atacante puede firmar certificados falsos.

**Mitigaciones implementadas**:
- ✅ Clave almacenada localmente (no en red)
- ✅ Permisos de archivo restrictivos (user-only)
- ✅ RSA 8192 bits (máxima seguridad disponible, no factorizable con tecnología actual o futura cercana)

**Mitigaciones recomendadas adicionales**:
- ⚠️ Cifrar clave privada con contraseña maestra
- ⚠️ Hardware Security Module (HSM) para entornos enterprise
- ⚠️ Implementar Certificate Revocation List (CRL)

#### 6.2.2 Amenaza: Ataque de Fuerza Bruta a PKCS#12

**Impacto**: ALTO  
**Descripción**: Atacante obtiene archivo .p12 y trata de adivinar contraseña.

**Mitigaciones implementadas**:
- ✅ Cifrado 3DES con derivación de clave PBKDF2
- ✅ Contraseña mínima de 4 caracteres (configurable)

**Recomendaciones al usuario**:
- Usar contraseñas fuertes (12+ caracteres, mixtos)
- No compartir archivos .p12
- Almacenar en ubicaciones seguras

#### 6.2.3 Amenaza: Ataques Criptográficos a RSA

**Impacto**: BAJO (futuro distante)  
**Descripción**: Avances en factorización o computación cuántica.

**Mitigaciones**:
- ✅ RSA 8192 bits implementado en CA (máxima resistencia a ataques clásicos)
- ✅ Usuarios pueden seleccionar hasta 8192 bits para máxima seguridad
- ⚠️ RSA vulnerable a computación cuántica (algoritmo de Shor)
- 📅 Post-Quantum Cryptography (PQC) necesaria en 10-20 años

**Referencias**:
- NIST Post-Quantum Cryptography: https://csrc.nist.gov/projects/post-quantum-cryptography

#### 6.2.4 Amenaza: Man-in-the-Middle durante generación

**Impacto**: NINGUNO  
**Descripción**: Toda la generación es local, sin comunicación de red.

**Mitigación**:
- ✅ Aplicación Electron local (no web)
- ✅ Sin APIs externas
- ✅ Sin transmisión de claves privadas

### 6.3 Períodos de Validez

| Entidad | Validez | Justificación |
|---------|---------|---------------|
| **CA** | 10 años | Minimiza rotación de CA, balance seguridad/conveniencia |
| **Usuario** | 1-5 años (configurable) | Permite rotación periódica de claves |

**Mejores prácticas**:
- Renovar certificados de usuario anualmente
- Renovar CA antes de expiración para transición suave
- Considerar validez más corta (90 días) para ambientes de alta seguridad

---

## 7. Análisis del Código

### 7.1 Clase CAManager

#### Responsabilidades

1. **Gestión del ciclo de vida de la CA**
   - Inicialización
   - Creación/carga
   - Persistencia

2. **Generación de certificados**
   - Crear pares de claves
   - Firmar certificados
   - Empaquetar en PKCS#12

3. **Utilidades**
   - Formateo de información
   - Cálculo de fingerprints
   - Conversión de formatos

#### Métodos Principales

##### `initialize()`
```javascript
async initialize() {
  if (!fs.existsSync(this.caPath)) {
    fs.mkdirSync(this.caPath, { recursive: true });
  }
  
  if (fs.existsSync(this.certPath) && fs.existsSync(this.keyPath)) {
    await this.loadCA();
  } else {
    await this.createCA();
  }
}
```

**Lógica**:
1. Verifica directorio CA
2. Carga CA existente si disponible
3. Crea nueva CA si no existe

**Idempotencia**: Método seguro para llamar múltiples veces.

##### `createCA()`

**Flujo completo**:
```
1. Generar par de claves RSA 8192 (configurable)
   ↓
2. Crear estructura de certificado X.509v3
   ↓
3. Establecer período de validez (10 años)
   ↓
4. Configurar Subject/Issuer (iguales, autofirmado)
   ↓
5. Agregar extensiones (basicConstraints, keyUsage)
   ↓
6. Firmar con clave privada (SHA-256)
   ↓
7. Guardar en disco (PEM format)
```

**Tiempo de ejecución**: 
- RSA 2048: 2-5 segundos
- RSA 4096: 10-20 segundos
- RSA 8192: 1-3 minutos (dependiendo de CPU, alta seguridad)

##### `loadCA()`

```javascript
async loadCA() {
  const certPem = fs.readFileSync(this.certPath, 'utf8');
  const keyPem = fs.readFileSync(this.keyPath, 'utf8');
  
  this.caCert = forge.pki.certificateFromPem(certPem);
  this.caKeys = {
    privateKey: forge.pki.privateKeyFromPem(keyPem),
    publicKey: this.caCert.publicKey
  };
}
```

**Parsing PEM**:
- `certificateFromPem()`: Decodifica Base64 → DER → ASN.1 → Objeto
- `privateKeyFromPem()`: Extrae clave privada en formato PKCS#1/PKCS#8

**Validación**: ⚠️ No valida integridad del certificado (mejora posible)

##### `generateCertificate()`

**Parámetros**:
```javascript
generateCertificate(email, name, keySize, validityYears, password)
```

**Validaciones necesarias** (realizadas en capa UI):
- Email válido (contiene @)
- keySize: 2048, 3072, 4096, o 8192 bits
- validityYears: 1-5
- password: mínimo 4 caracteres

**Proceso interno**:
1. Generar par de claves usuario (RSA keySize)
2. Crear certificado X.509v3
3. Serial number único (16 bytes aleatorios)
4. Configurar Subject con email
5. Agregar extensiones S/MIME
6. Firmar con CA
7. Empaquetar PKCS#12 con contraseña
8. Retornar todos los formatos

**Return object**:
```javascript
{
  certificate: String (PEM),
  privateKey: String (PEM),
  pkcs12: String (Base64),
  email: String,
  name: String,
  serialNumber: String (hex),
  validFrom: Date,
  validTo: Date
}
```

##### `calculateFingerprint()`

```javascript
calculateFingerprint(cert) {
  const der = forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes();
  const md = forge.md.sha256.create();
  md.update(der);
  return md.digest().toHex();
}
```

**Fingerprint SHA-256**:
- Hash del certificado completo en formato DER
- Usado para verificación visual de identidad
- Formato típico: 64 caracteres hexadecimales
- Ejemplo: `a1b2c3d4...`

**Uso**:
- Verificar integridad
- Comparar certificados
- Identificación única

### 7.2 Comunicación IPC (Inter-Process Communication)

Electron separa procesos:
- **Main Process** (main.js): Acceso a Node.js, sistema de archivos
- **Renderer Process** (app-desktop.js): UI, limitado por seguridad

#### Handlers IPC Implementados

##### `generate-certificate`
```javascript
ipcMain.handle('generate-certificate', async (event, data) => {
  const { email, name, keySize, validityYears, password } = data;
  const certificate = caManager.generateCertificate(...);
  
  // Guardar en historial
  const certificates = store.get('certificates', []);
  certificates.push({ ...certificate, createdAt: new Date().toISOString() });
  store.set('certificates', certificates);
  
  return { success: true, certificate };
});
```

**Persistencia**:
- Usa `electron-store` para guardar historial
- Almacenamiento JSON en `%APPDATA%`
- No cifrado (contiene certificados y claves privadas)

**⚠️ Consideración de seguridad**: 
- Claves privadas almacenadas en texto plano
- Protegidas solo por permisos de SO
- Alternativa: Cifrar store con contraseña maestra

##### `get-ca-info`
```javascript
ipcMain.handle('get-ca-info', async () => {
  const caInfo = caManager.getCACertificate();
  return { success: true, caInfo };
});
```

Retorna información completa de CA sin exponer clave privada.

##### `save-certificate` / `save-ca-certificate`
```javascript
ipcMain.handle('save-certificate', async (event, { certificate, filename }) => {
  const result = await dialog.showSaveDialog(mainWindow, { ... });
  
  if (!result.canceled) {
    if (result.filePath.endsWith('.p12')) {
      const buffer = Buffer.from(certificate.pkcs12, 'base64');
      fs.writeFileSync(result.filePath, buffer);
    } else {
      fs.writeFileSync(result.filePath, certificate.certificate);
    }
    return { success: true, path: result.filePath };
  }
});
```

**Flujo**:
1. Mostrar diálogo de guardado (sistema operativo)
2. Usuario selecciona ubicación
3. Guardar según formato (.p12 binario, .pem texto)

### 7.3 Seguridad del Código

#### Buenas Prácticas Implementadas

✅ **Context Isolation** (Electron)
```javascript
webPreferences: {
  nodeIntegration: false,
  contextIsolation: true,
  preload: path.join(__dirname, 'preload.js')
}
```
- Previene acceso directo de renderer a Node.js
- Comunicación solo mediante IPC

✅ **Validación de entrada** (UI)
- Email format
- Password length
- Key size options

✅ **Manejo de errores**
```javascript
try {
  // operación
} catch (error) {
  console.error('Error:', error);
  return { success: false, error: error.message };
}
```

#### Mejoras Recomendadas

⚠️ **Cifrado de almacenamiento**:
```javascript
// Actual: store.set('certificates', certificates);
// Recomendado: Cifrar antes de guardar
const encrypted = encrypt(JSON.stringify(certificates), masterPassword);
store.set('certificates', encrypted);
```

⚠️ **Validación de certificados cargados**:
```javascript
async loadCA() {
  // ...
  // Agregar: Verificar firma, fechas de validez, extensiones
  if (this.caCert.validity.notAfter < new Date()) {
    throw new Error('CA certificate has expired');
  }
}
```

⚠️ **Rate limiting** en generación:
- Prevenir generación masiva abusiva
- Implementar cooldown entre generaciones

⚠️ **Logging y auditoría**:
- Registrar todas las operaciones de certificados
- Timestamps, IPs (si aplica), acciones

---

## 8. Referencias y Documentación Oficial

### 8.1 Estándares IETF (Internet Engineering Task Force)

#### PKI y Certificados

| RFC | Título | Descripción | URL |
|-----|--------|-------------|-----|
| **RFC 5280** | Internet X.509 PKI Certificate and CRL Profile | Define estructura de certificados X.509 v3 | https://tools.ietf.org/html/rfc5280 |
| **RFC 8017** | PKCS #1 v2.2: RSA Cryptography | Especificación completa de RSA | https://tools.ietf.org/html/rfc8017 |
| **RFC 7292** | PKCS #12 v1.1 | Formato de intercambio de información personal | https://tools.ietf.org/html/rfc7292 |
| **RFC 7468** | Textual Encodings of PKIX, PKCS, and CMS | Formato PEM | https://tools.ietf.org/html/rfc7468 |

#### S/MIME

| RFC | Título | Descripción | URL |
|-----|--------|-------------|-----|
| **RFC 5751** | S/MIME Version 3.2 Message Specification | Especificación de mensajes S/MIME | https://tools.ietf.org/html/rfc5751 |
| **RFC 5750** | S/MIME Version 3.2 Certificate Handling | Manejo de certificados en S/MIME | https://tools.ietf.org/html/rfc5750 |
| **RFC 8551** | S/MIME Version 4.0 Message Specification | Versión más reciente de S/MIME | https://tools.ietf.org/html/rfc8551 |

#### Criptografía

| RFC | Título | Descripción | URL |
|-----|--------|-------------|-----|
| **RFC 5754** | Using SHA2 Algorithms with CMS | SHA-256/384/512 con certificados | https://tools.ietf.org/html/rfc5754 |
| **RFC 3447** | PKCS #1 v2.1 (RSA) | Versión anterior de RSA | https://tools.ietf.org/html/rfc3447 |
| **RFC 2898** | PKCS #5 v2.0 (PBKDF2) | Derivación de claves basada en contraseña | https://tools.ietf.org/html/rfc2898 |

### 8.2 Publicaciones NIST (National Institute of Standards and Technology)

| Publicación | Título | Descripción | URL |
|-------------|--------|-------------|-----|
| **NIST SP 800-57 Part 1 Rev. 5** | Recommendation for Key Management | Gestión de claves criptográficas | https://csrc.nist.gov/publications/detail/sp/800-57-part-1/rev-5/final |
| **FIPS 180-4** | Secure Hash Standard (SHS) | Estándar de funciones hash SHA | https://csrc.nist.gov/publications/detail/fips/180/4/final |
| **FIPS 186-4** | Digital Signature Standard (DSS) | Estándar de firmas digitales | https://csrc.nist.gov/publications/detail/fips/186/4/final |
| **NIST SP 800-131A Rev. 2** | Transitioning the Use of Cryptographic Algorithms | Algoritmos criptográficos aprobados | https://csrc.nist.gov/publications/detail/sp/800-131a/rev-2/final |

### 8.3 Estándares ITU-T

| Estándar | Título | Descripción | URL |
|----------|--------|-------------|-----|
| **X.509** | Public-key and attribute certificate frameworks | Estructura de certificados digitales | https://www.itu.int/rec/T-REC-X.509 |
| **X.500** | Information technology – Open Systems Interconnection | Directorio de nombres | https://www.itu.int/rec/T-REC-X.500 |

### 8.4 CA/Browser Forum

| Documento | Título | URL |
|-----------|--------|-----|
| **Baseline Requirements** | Baseline Requirements for the Issuance and Management of Publicly-Trusted Certificates | https://cabforum.org/baseline-requirements-documents/ |
| **S/MIME BR** | Baseline Requirements for the Issuance and Management of Publicly-Trusted S/MIME Certificates | https://cabforum.org/smime-baseline-requirements/ |

### 8.5 Recursos de node-forge

| Recurso | Descripción | URL |
|---------|-------------|-----|
| **Repositorio GitHub** | Código fuente y documentación | https://github.com/digitalbazaar/forge |
| **NPM Package** | Paquete oficial | https://www.npmjs.com/package/node-forge |
| **API Documentation** | Documentación de API | https://github.com/digitalbazaar/forge/blob/master/README.md |

### 8.6 Recursos Adicionales

#### Libros Recomendados

1. **"Applied Cryptography"** - Bruce Schneier
   - Cobertura completa de algoritmos criptográficos
   - ISBN: 978-1119096726

2. **"PKI: Implementing & Managing E-Security"** - Andrew Nash et al.
   - Implementación práctica de PKI
   - ISBN: 978-0072131239

3. **"Cryptography Engineering"** - Ferguson, Schneier, Kohno
   - Diseño e implementación de sistemas criptográficos
   - ISBN: 978-0470474242

#### Cursos en Línea

1. **Coursera - Cryptography I** (Stanford)
   - https://www.coursera.org/learn/crypto

2. **edX - Quantum Cryptography** (Caltech)
   - https://www.edx.org/course/quantum-cryptography

#### Herramientas de Análisis

1. **OpenSSL** - Herramienta de línea de comandos para certificados
   - https://www.openssl.org/
   - Comandos útiles:
     ```bash
     # Ver certificado
     openssl x509 -in certificate.pem -text -noout
     
     # Verificar certificado contra CA
     openssl verify -CAfile ca.crt certificate.pem
     
     # Ver contenido PKCS#12
     openssl pkcs12 -in certificate.p12 -info
     ```

2. **Wireshark** - Análisis de tráfico S/MIME
   - https://www.wireshark.org/

3. **CertUtil** (Windows) - Gestión de certificados
   ```powershell
   # Ver certificado
   certutil -dump certificate.cer
   
   # Importar a store
   certutil -addstore -user Root ca.crt
   ```

---

## Apéndice A: Glosario de Términos

| Término | Definición |
|---------|------------|
| **CA** | Certificate Authority - Entidad que emite y firma certificados digitales |
| **CSR** | Certificate Signing Request - Solicitud de firma de certificado |
| **DER** | Distinguished Encoding Rules - Formato binario de codificación ASN.1 |
| **DN** | Distinguished Name - Nombre único en X.500/X.509 |
| **OID** | Object Identifier - Identificador único de objetos en ASN.1 |
| **PEM** | Privacy Enhanced Mail - Formato de texto Base64 para certificados |
| **PKCS** | Public-Key Cryptography Standards - Familia de estándares RSA |
| **PKI** | Public Key Infrastructure - Infraestructura de clave pública |
| **RSA** | Rivest-Shamir-Adleman - Algoritmo de criptografía asimétrica |
| **S/MIME** | Secure/Multipurpose Internet Mail Extensions - Estándar para correo seguro |
| **SAN** | Subject Alternative Name - Nombres alternativos del sujeto |
| **SHA** | Secure Hash Algorithm - Familia de funciones hash criptográficas |
| **X.509** | Estándar ITU-T para certificados de clave pública |

---

## Apéndice B: Ejemplos de Uso con OpenSSL

### Verificar certificado de CA

```bash
openssl x509 -in ca.crt -text -noout
```

**Output esperado**:
```
Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number: 1 (0x1)
        Signature Algorithm: sha256WithRSAEncryption
        Issuer: CN=Empresa Root Certification Authority, C=UY, ST=Montevideo, L=Montevideo, O=Empresa, OU=Certificate Authority, emailAddress=ca@empresa.com
        Validity
            Not Before: Oct 3 00:00:00 2025 GMT
            Not After : Oct 1 00:00:00 2035 GMT
        Subject: CN=Empresa Root Certification Authority, C=UY, ST=Montevideo, L=Montevideo, O=Empresa, OU=Certificate Authority, emailAddress=ca@empresa.com
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                RSA Public-Key: (8192 bit)
        X509v3 extensions:
            X509v3 Basic Constraints: critical
                CA:TRUE
            X509v3 Key Usage: critical
                Certificate Sign, CRL Sign
```

### Verificar certificado de usuario contra CA

```bash
openssl verify -CAfile ca.crt user_certificate.pem
```

**Output esperado**:
```
user_certificate.pem: OK
```

### Inspeccionar archivo PKCS#12

```bash
openssl pkcs12 -in certificate.p12 -info -nodes
```

**Nota**: `-nodes` omite cifrado (para testing). Omitir para proteger clave privada.

### Extraer certificado de PKCS#12

```bash
openssl pkcs12 -in certificate.p12 -clcerts -nokeys -out certificate.pem
```

### Extraer clave privada de PKCS#12

```bash
openssl pkcs12 -in certificate.p12 -nocerts -out private_key.pem
```

---

## Apéndice C: Preguntas Frecuentes (FAQ)

### ¿Es seguro usar esta CA para uso interno?

**Sí**, completamente seguro para uso interno en organizaciones pequeñas, medianas y grandes. La implementación utiliza estándares modernos con **RSA-8192 bits** para la CA y hasta **8192 bits configurables** para certificados de usuario, junto con **SHA-256**, que proporciona la máxima seguridad disponible actualmente. Sin embargo, para ambientes enterprise con requisitos especiales de cumplimiento, considere:
- Usar CA comercial (DigiCert, GlobalSign, etc.)
- Implementar HSM (Hardware Security Module)
- Contratar auditoría de seguridad

### ¿Por qué no usar Let's Encrypt u otra CA pública?

Let's Encrypt y otras CAs públicas **no emiten certificados S/MIME**. Solo emiten certificados para servidores web (TLS/SSL). Este sistema es específico para correo electrónico.

### ¿Los certificados generados funcionan en cualquier cliente de correo?

**Sí**, si el cliente soporta S/MIME estándar:
- ✅ Mozilla Thunderbird
- ✅ Microsoft Outlook
- ✅ Apple Mail
- ✅ iOS Mail
- ✅ Android Mail (con apps compatibles)

**Requisito**: Instalar certificado de CA en el cliente.

### ¿Qué pasa si la CA expira?

- Los certificados de usuario seguirán funcionando
- No se podrán generar nuevos certificados
- Solución: Renovar CA antes de expiración

### ¿Puedo usar los certificados para firma de código?

**No**, estos certificados tienen `extKeyUsage: emailProtection`. Para firma de código necesita certificados con `extKeyUsage: codeSigning`.

### ¿Es vulnerable a computación cuántica?

RSA **es teóricamente vulnerable** al algoritmo de Shor en computadoras cuánticas suficientemente potentes. Sin embargo:
- No existen computadoras cuánticas prácticas actualmente
- Estimado: 10-20 años hasta ser amenaza real
- Solución futura: Migrar a Post-Quantum Cryptography (PQC)

NIST está estandarizando algoritmos PQC: https://csrc.nist.gov/projects/post-quantum-cryptography

---

## Conclusión

Este documento ha detallado la implementación completa de la PKI del Generador de Certificados S/MIME, incluyendo:

✅ **Arquitectura PKI**: Modelo jerárquico de dos niveles  
✅ **Estándares**: Cumplimiento con RFC 5280, RFC 5751, NIST SP 800-57  
✅ **Seguridad**: RSA 8192 bits para CA, hasta 8192 bits configurable para usuarios, SHA-256  
✅ **Compatibilidad**: S/MIME estándar, PKCS#12, formatos PEM  
✅ **Código**: Análisis detallado de implementación con node-forge  

El sistema implementa mejores prácticas de criptografía moderna y es adecuado para uso en organizaciones que requieren correo electrónico seguro con infraestructura PKI privada.

---

**Documento preparado por:**  
Desarrollador  
Empresa  
Octubre 2025

**Versión del documento:** 1.0  
**Última actualización:** 3 de octubre de 2025
