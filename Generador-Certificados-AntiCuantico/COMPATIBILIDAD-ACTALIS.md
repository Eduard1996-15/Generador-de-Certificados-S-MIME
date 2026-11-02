# 🔐 Compatibilidad con Actalis y otras CAs comerciales

## 📋 Resumen

**✅ SÍ es compatible** - Los certificados generados por este sistema son compatibles con Actalis y cualquier otra CA comercial que use el estándar S/MIME (X.509).

---

## 🔄 Cómo funciona el intercambio

### Escenario: Usuario con certificado Actalis ↔️ Usuario con certificado PQC

```
┌─────────────────────────────────────────────────────────────────┐
│  AMBOS usan el estándar S/MIME (RFC 5751)                       │
│  AMBOS usan certificados X.509 con RSA                          │
│  AMBOS son compatibles entre sí                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Flujo de cifrado:

```
Usuario Actalis                      Usuario PQC
     │                                    │
     │  1. Envía correo firmado           │
     │────────────────────────────────────>│
     │                                    │ (Extrae certificado público)
     │                                    │
     │  2. Responde cifrado               │
     │<────────────────────────────────────│
     │                                    │
     │ (Descifra con su clave privada)    │
     │                                    │
     ✅ Comunicación cifrada establecida   │
```

---

## 📦 Qué archivos compartir

### Para que OTROS te cifren correos:

**Archivo:** `tunombre-Thunderbird-Certificate.p12`  
**Contraseña:** La que elegiste al generar (ej: "Aa-12345")

```bash
# Ubicación:
user-certificates\tunombre\tunombre-Thunderbird-Certificate.p12
```

**Instrucciones para el destinatario:**
1. Abrir Thunderbird
2. Configuración → Certificados → Importar
3. Seleccionar tu archivo .p12
4. Ingresar la contraseña
5. Listo - Ya puede cifrarte correos

### Para que confíen en tu CA (opcional):

**Archivo:** `Root-CA-PostQuantum.crt`

```bash
# Ubicación:
pqc-ca\Root-CA-PostQuantum.crt
```

**Instrucciones:**
1. Thunderbird → Configuración → Certificados → Autoridades
2. Importar → Seleccionar Root-CA-PostQuantum.crt
3. ✅ Marcar "Confiar en esta CA para identificar correo electrónico"
4. Aceptar

**Efecto:** Thunderbird confiará automáticamente en TODOS los certificados emitidos por PQC.

---

## 🔑 Diferencias entre archivos

| Archivo | Uso | Compatible con Actalis | Post-Cuántico |
|---------|-----|------------------------|---------------|
| `*.p12` (PKCS#12) | Thunderbird estándar | ✅ SÍ | ❌ NO (solo RSA) |
| `*-HYBRID-PQC-Certificate.json` | Sistema interno | ❌ NO | ✅ SÍ (RSA + Dilithium) |
| `*.crt` (Certificado público) | Compartir clave pública | ✅ SÍ | ⚠️ Parcial (RSA funciona, Dilithium en extensión) |
| `Root-CA-PostQuantum.crt` | CA raíz | ✅ SÍ | ⚠️ Parcial |

---

## ⚡ Casos de uso prácticos

### Caso 1: Correo cifrado con usuario Actalis

**Escenario:** Juan (Actalis) ↔️ María (PQC)

```
1. Juan envía correo firmado a María
   → María extrae certificado público de Juan automáticamente

2. María genera su certificado PQC (.p12)
   → María envía su .p12 a Juan (con contraseña por canal seguro)

3. Juan importa certificado de María en Thunderbird
   → Juan ahora puede cifrar correos para María

4. María responde con correo cifrado
   → Juan descifra con su clave privada Actalis

✅ Resultado: Comunicación cifrada bidireccional funcionando
```

### Caso 2: Organización completa en PQC

**Escenario:** Todos en PQC usan certificados internos

```
1. Distribuir Root-CA-PostQuantum.crt a todos
   → Todos importan la CA raíz en Thunderbird

2. Cada usuario genera su certificado individual
   → Instalan su propio .p12

3. Comunicación interna:
   ✅ Todos confían automáticamente en certificados PQC
   ✅ No necesitan intercambiar certificados individuales
   ✅ Pueden usar archivos HYBRID para máxima seguridad

4. Comunicación externa (con Actalis/otros):
   ✅ Usan archivos .p12 estándar
   ⚠️ NO usan archivos HYBRID (no compatibles)
```

### Caso 3: Usuario PQC + múltiples CAs externas

**Escenario:** María (PQC) se comunica con Juan (Actalis), Pedro (GlobalSign), Ana (DigiCert)

```
María necesita:
1. Su certificado PQC (.p12) → Para que OTROS la cifren
2. Certificados públicos de:
   - Juan (Actalis)
   - Pedro (GlobalSign)
   - Ana (DigiCert)

Proceso:
1. Cada uno envía correo firmado a María
   → María guarda automáticamente sus certificados públicos

2. María puede cifrar para los 3:
   ✅ Juan: Usa su clave pública Actalis
   ✅ Pedro: Usa su clave pública GlobalSign
   ✅ Ana: Usa su clave pública DigiCert

3. Los 3 pueden cifrar para María:
   ✅ Usan su certificado PQC (.p12 que María compartió)

✅ S/MIME es interoperable entre TODAS las CAs
```

---

## 🛡️ Niveles de seguridad según destinatario

### Comunicación INTERNA (PQC ↔️ PQC):

**Nivel MÁXIMO - Post-Cuántico:**
```
✅ Usar archivos HYBRID-PQC-Certificate.json
✅ Protección RSA-4096 + Dilithium-3
✅ Resistente a computadoras cuánticas
✅ Requiere sistema PQC en ambos lados
```

**Nivel ALTO - RSA tradicional:**
```
✅ Usar archivos .p12 estándar
✅ Protección RSA-4096 (muy segura actualmente)
⚠️ Vulnerable a computadoras cuánticas futuras
✅ Compatible con Thunderbird estándar
```

### Comunicación EXTERNA (PQC ↔️ Actalis/otros):

**Nivel ALTO - RSA tradicional (ÚNICO compatible):**
```
✅ Usar archivos .p12 estándar
✅ Protección RSA-4096
✅ Compatible con TODAS las CAs comerciales
⚠️ Sin protección post-cuántica (limitación de S/MIME estándar)
```

---

## 🔬 Verificación de compatibilidad

### Test 1: Verificar que tu certificado es X.509 válido

```bash
# En la carpeta del certificado:
openssl pkcs12 -in tunombre-Thunderbird-Certificate.p12 -info -noout

# Debe mostrar:
# MAC verified OK
# PKCS12 structure is valid
```

### Test 2: Extraer certificado público

```bash
openssl pkcs12 -in tunombre-Thunderbird-Certificate.p12 -clcerts -nokeys -out public.crt

# Ver detalles:
openssl x509 -in public.crt -text -noout

# Debe mostrar:
# Public-Key: (4096 bit)
# Signature Algorithm: sha512WithRSAEncryption
# X509v3 extensions:
#     X509v3 Key Usage: Digital Signature, Key Encipherment
#     X509v3 Extended Key Usage: E-mail Protection
```

### Test 3: Importar en Thunderbird

```
1. Thunderbird → Configuración → Privacidad y Seguridad
2. Certificados → Ver certificados
3. Importar tu .p12
4. Si Thunderbird lo acepta → ✅ Es compatible con Actalis
```

---

## ❓ Preguntas Frecuentes

### ¿Actalis puede leer mi archivo HYBRID?
**❌ NO** - El archivo HYBRID usa formato propietario (JSON + RSA + Dilithium). Solo clientes que soporten este formato pueden usarlo.

### ¿Necesito instalar algo especial?
**Para comunicarte con Actalis: NO** - Solo necesitas Thunderbird estándar y tu archivo .p12

**Para usar HYBRID internamente: SÍ** - Necesitas el sistema PQC completo.

### ¿Mi CA PQC es confiable para Actalis?
**Técnicamente SÍ** - Es una CA válida que genera certificados X.509 estándar.

**En la práctica:** Actalis confiará en tu certificado si:
1. Importan tu certificado individual (.p12) → Confían solo en TI
2. Importan tu CA raíz (.crt) → Confían en TODOS los certificados PQC

### ¿Puedo usar el mismo certificado para interno y externo?
**SÍ** - El archivo `.p12` funciona para ambos:
- Interno: Compatible pero sin Dilithium
- Externo: Compatible con Actalis/GlobalSign/DigiCert/etc.

Si quieres máxima seguridad interna, usa HYBRID además del .p12.

### ¿Qué pasa si una computadora cuántica rompe RSA?
**Comunicación externa (Actalis):** ⚠️ Vulnerable - Toda la industria S/MIME debe migrar a post-cuántico

**Comunicación interna (PQC con HYBRID):** ✅ Protegida - Dilithium es resistente a cuánticas

---

## 📞 Instrucciones para compartir con usuarios Actalis

### Email de ejemplo para enviar:

```
Asunto: Certificado S/MIME para comunicación cifrada

Hola [Nombre],

Adjunto mi certificado S/MIME para que puedas enviarme correos cifrados.

📎 Archivo: [tunombre]-Thunderbird-Certificate.p12
🔑 Contraseña: [tu-contraseña]

Instrucciones de instalación:
1. Guardar el archivo .p12 adjunto
2. En Thunderbird: Configuración → Certificados → Importar
3. Seleccionar el archivo .p12
4. Ingresar la contraseña cuando se solicite
5. Confirmar la importación

Una vez instalado, podrás:
✅ Enviarme correos cifrados
✅ Verificar mis firmas digitales

Este certificado es compatible con Actalis y cualquier cliente S/MIME estándar.

Saludos,
[Tu nombre]
Proyecto de Ejemplo
```

### Archivo de texto para compartir contraseña (canal separado):

```
Contraseña del certificado: [tu-contraseña]

IMPORTANTE: Elimina este mensaje después de importar el certificado.
```

---

## 🎯 Conclusión

✅ **COMPATIBLE con Actalis** - Usa archivos `.p12` estándar  
✅ **COMPATIBLE con cualquier CA** - GlobalSign, DigiCert, Comodo, etc.  
✅ **Post-cuántico disponible** - Para comunicación interna con archivos HYBRID  
✅ **Interoperable** - S/MIME funciona entre todas las CAs  

**Recomendación:**
- Externo: Usa `.p12` (compatible universal)
- Interno: Usa `HYBRID` (máxima seguridad post-cuántica)

---

**Última actualización:** Octubre 2025  
**Proyecto de Ejemplo**
