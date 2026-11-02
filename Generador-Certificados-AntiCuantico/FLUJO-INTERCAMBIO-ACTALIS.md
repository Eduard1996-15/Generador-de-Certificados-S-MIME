# 🔄 Flujo de Intercambio con Actalis

## Diagrama de Compatibilidad S/MIME

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ESTÁNDAR S/MIME (RFC 5751)                       │
│                     ✅ Universal y compatible                        │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │
        ┌─────────────────────────┴─────────────────────────┐
        │                                                     │
        ▼                                                     ▼
┌──────────────────┐                                 ┌──────────────────┐
│  CA Comercial    │                                 │   CA PQC        │
│   (Actalis)      │                                 │ (Post-Cuántica)  │
├──────────────────┤                                 ├──────────────────┤
│ • RSA 2048/4096  │                                 │ • RSA 4096       │
│ • SHA-256/512    │                                 │ • SHA-512        │
│ • X.509 v3       │                                 │ • X.509 v3       │
│ • S/MIME         │◄────── COMPATIBLE ──────────────►│ • S/MIME         │
│                  │                                 │ • Dilithium-3    │
└──────────────────┘                                 │   (extensión)    │
                                                     └──────────────────┘
```

---

## Paso a Paso: Usuario Actalis te envía correo

### 1️⃣ Usuario Actalis envía correo firmado

```
┌─────────────────────────────────────────────────────────────┐
│  Usuario Actalis                                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Thunderbird con certificado Actalis instalado      │    │
│  │                                                      │    │
│  │ [Redactar] → [Firmar digitalmente] → [Enviar]      │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Correo + Firma Digital
                            │ (Incluye certificado público)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Tu Thunderbird                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ✅ Firma válida (Actalis CA reconocida)             │    │
│  │ 📎 Certificado del remitente extraído              │    │
│  │                                                      │    │
│  │ [Guardar certificado] → Ahora puedes cifrar para él │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 2️⃣ Tú le envías tu certificado PQC

```
┌─────────────────────────────────────────────────────────────┐
│  Tú (PQC)                                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 1. Generas certificado en la app                   │    │
│  │    → tunombre-Thunderbird-Certificate.p12          │    │
│  │                                                      │    │
│  │ 2. Envías por correo:                              │    │
│  │    📎 Adjunto: .p12                                │    │
│  │    📝 Contraseña: (mensaje aparte/WhatsApp)       │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Correo con .p12 adjunto
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Usuario Actalis                                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Thunderbird → Configuración → Certificados         │    │
│  │           → Importar → tunombre.p12                │    │
│  │           → Ingresar contraseña                    │    │
│  │                                                      │    │
│  │ ✅ Certificado PQC importado                       │    │
│  │ ✅ Ahora puede cifrar correos para ti              │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 3️⃣ Comunicación cifrada establecida

```
┌──────────────────┐                         ┌──────────────────┐
│  Usuario Actalis │                         │   Tú (PQC)      │
│                  │                         │                  │
│ Certificado:     │                         │ Certificado:     │
│ • Público: ✅     │                         │ • Público: ✅     │
│ • Privado: 🔒     │                         │ • Privado: 🔒     │
└──────────────────┘                         └──────────────────┘
        │                                             │
        │  📧 Correo cifrado                          │
        │  (Usa tu clave pública PQC)               │
        ├────────────────────────────────────────────►│
        │                                             │ (Descifra con
        │                                             │  tu clave privada)
        │                                             │
        │  📧 Respuesta cifrada                       │
        │  (Usa su clave pública Actalis)            │
        │◄────────────────────────────────────────────┤
        │                                             │
 (Descifra con                                        │
  su clave privada)                                   │
        │                                             │
        ▼                                             ▼
   ✅ Leyendo                                    ✅ Leyendo
```

---

## Comparación de Archivos

### Para comunicación EXTERNA (con Actalis):

```
Archivo: tunombre-Thunderbird-Certificate.p12
┌─────────────────────────────────────────────────────────┐
│  Formato: PKCS#12 (Estándar RFC 7292)                  │
│  ┌───────────────────────────────────────────────────┐  │
│  │ • Certificado X.509 (clave pública RSA-4096)     │  │
│  │ • Clave privada RSA-4096 (cifrada)               │  │
│  │ • Cadena de certificación (CA PQC)              │  │
│  │ • Metadatos (email, nombre, validez)             │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ✅ Compatible con:                                     │
│     • Thunderbird, Outlook, Apple Mail                 │
│     • Actalis, GlobalSign, DigiCert                    │
│     • Cualquier cliente S/MIME estándar                │
└─────────────────────────────────────────────────────────┘
```

### Para comunicación INTERNA (solo PQC):

```
Archivo: tunombre-HYBRID-PQC-Certificate.json
┌─────────────────────────────────────────────────────────┐
│  Formato: JSON + Cifrado Híbrido (Propietario PQC)    │
│  ┌───────────────────────────────────────────────────┐  │
│  │ • Certificado PKCS#12 (cifrado con AES-256)      │  │
│  │ • Clave AES protegida con RSA-4096               │  │
│  │ • Clave AES protegida con Dilithium-3            │  │
│  │ • AuthTag, IV, Metadatos                         │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ⚠️ Requiere:                                           │
│     • Sistema para descifrar                      │
│     • Clave privada RSA + Clave pública Dilithium     │
│     • NO compatible con clientes estándar              │
│                                                         │
│  ✅ Ventaja:                                            │
│     • Resistente a computadoras cuánticas             │
│     • Doble capa de protección (RSA + PQC)            │
└─────────────────────────────────────────────────────────┘
```

---

## Escenarios de Uso

### Escenario 1: Solo EXTERNO

```
PQC ↔️ Actalis/GlobalSign/DigiCert/otros

Usar: tunombre-Thunderbird-Certificate.p12
✅ Compatible universal
⚠️ Sin protección post-cuántica (limitación S/MIME)
```

### Escenario 2: Solo INTERNO

```
PQC ↔️ PQC

Opción A: tunombre-HYBRID-PQC-Certificate.json
✅ Máxima seguridad (RSA + Dilithium)
✅ Resistente a cuánticas
⚠️ Requiere sistema PQC en ambos lados

Opción B: tunombre-Thunderbird-Certificate.p12
✅ Compatible Thunderbird estándar
✅ RSA-4096 (muy seguro actualmente)
⚠️ Sin Dilithium
```

### Escenario 3: MIXTO (interno + externo)

```
PQC ↔️ PQC + Actalis + otros

Solución: Usar AMBOS archivos
• .p12 → Para Thunderbird (interno y externo)
• .json → Para máxima seguridad interna (cuando ambos tienen sistema)

Usuario recibe:
1. tunombre-Thunderbird-Certificate.p12 (siempre)
2. tunombre-HYBRID-PQC-Certificate.json (solo si es PQC)
```

---

## Matriz de Compatibilidad

| Desde / Para | Actalis | GlobalSign | DigiCert | PQC (.p12) | PQC (HYBRID) |
|--------------|---------|------------|----------|-------------|---------------|
| **Actalis** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **GlobalSign** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **DigiCert** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **PQC (.p12)** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **PQC (HYBRID)** | ❌* | ❌* | ❌* | ❌* | ✅ |

*❌ = No directamente, pero el archivo HYBRID contiene un .p12 dentro que puede extraerse

---

## Checklist de Compatibilidad

### ✅ Para comunicarte con Actalis necesitas:

- [x] Tu certificado generado (.p12)
- [x] Thunderbird o cliente S/MIME instalado
- [x] Certificado público del usuario Actalis (lo obtienes cuando te envía correo firmado)
- [ ] ~~Tu CA raíz~~ (NO necesario para cifrado básico)
- [ ] ~~Sistema especial~~ (Thunderbird estándar funciona)
- [ ] ~~Software adicional~~ (No necesario)

### ✅ Para que usuario Actalis te cifre correos:

- [x] Enviarle tu .p12 + contraseña
- [x] Que lo importe en su cliente de correo
- [ ] ~~Que instale software especial~~ (No necesario)
- [ ] ~~Que tenga tu CA raíz~~ (No necesario para cifrado)

---

## 🎯 Resumen Visual

```
TU SISTEMA PQC genera 2 tipos de archivos:

┌─────────────────────────────────────────────────────────────┐
│                         .p12                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   📦 PKCS#12                        │    │
│  │                                                      │    │
│  │  ┌────────────┐    ┌────────────┐                  │    │
│  │  │ RSA-4096   │    │  X.509 v3  │                  │    │
│  │  │ Clave      │    │Certificado │                  │    │
│  │  │ Privada    │    │  Público   │                  │    │
│  │  └────────────┘    └────────────┘                  │    │
│  │                                                      │    │
│  │  ✅ Compatible con TODA la industria S/MIME        │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      HYBRID.json                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              🔐 Cifrado Híbrido                     │    │
│  │                                                      │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │    │
│  │  │   AES    │  │   RSA    │  │Dilithium │          │    │
│  │  │  Cifrado │  │Protección│  │Protección│          │    │
│  │  │  Datos   │  │   Capa   │  │   Capa   │          │    │
│  │  └──────────┘  └──────────┘  └──────────┘          │    │
│  │                                                      │    │
│  │  ⚠️ Solo para sistemas PQC (post-cuántico)        │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

Para Actalis: Usa .p12 ✅
Para PQC interno con máxima seguridad: Usa HYBRID.json ✅
```

---

**Conclusión:** Tu sistema es 100% compatible con Actalis usando archivos `.p12` estándar. El cifrado híbrido es un EXTRA de seguridad para uso interno.
