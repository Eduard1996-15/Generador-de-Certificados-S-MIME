# Documentación del Generador de Certificados S/MIME

**Versión 1.0.0**  
**Desarrollado por:** Desarrollador  
**Empresa:** Empresa  
**Fecha:** Agosto 2025

## Índice
1. [Introducción](#introducción)
2. [Requisitos del sistema](#requisitos-del-sistema)
3. [Instalación](#instalación)
4. [Guía de usuario](#guía-de-usuario)
5. [Funcionalidades principales](#funcionalidades-principales)
6. [Arquitectura de la aplicación](#arquitectura-de-la-aplicación)
7. [Componentes técnicos](#componentes-técnicos)
8. [Preguntas frecuentes](#preguntas-frecuentes)
9. [Solución de problemas](#solución-de-problemas)
10. [Referencias y recursos adicionales](#referencias-y-recursos-adicionales)

## Introducción

El **Generador de Certificados S/MIME** es una aplicación de escritorio desarrollada para crear y gestionar certificados digitales compatibles con el estándar S/MIME (Secure/Multipurpose Internet Mail Extensions). Estos certificados permiten firmar y cifrar correos electrónicos para garantizar su autenticidad, integridad y confidencialidad.

La aplicación proporciona una interfaz gráfica intuitiva que facilita:
- Creación de certificados personalizados para correo electrónico
- Gestión de certificados desde una interfaz sencilla
- Exportación en varios formatos (PKCS#12, PEM, CRT)
- Generación automática de una Autoridad Certificadora (CA) propia

Esta herramienta está especialmente diseñada para usuarios que necesitan implementar seguridad en sus comunicaciones por correo electrónico sin depender de autoridades certificadoras comerciales.

## Requisitos del sistema

### Requisitos mínimos
- **Sistema operativo:** Windows 10/11 (64 bits)
- **Procesador:** Intel Core i3 o equivalente
- **RAM:** 4 GB
- **Espacio en disco:** 200 MB
- **Conexión a Internet:** No requerida para el funcionamiento básico

### Software recomendado para el uso de certificados
- Cliente de correo como Mozilla Thunderbird, Microsoft Outlook, Apple Mail
- Navegadores web actualizados para gestión de certificados

## Instalación

### Instalación mediante el instalador
1. Ejecute el archivo `Generador de Certificados S/MIME Setup.exe`
2. Siga las instrucciones del asistente de instalación
3. Seleccione la carpeta de destino (por defecto: `C:\Program Files\Generador de Certificados S/MIME`)
4. Elija si desea crear accesos directos en el escritorio y/o en el menú de inicio
5. Complete la instalación y ejecute la aplicación

### Versión portable
1. Descomprima el archivo `Generador-Certificados-SMIME-portable.zip` en cualquier ubicación con permisos de escritura (como un pendrive USB)
2. Ejecute el archivo `Generador de Certificados S/MIME.exe` desde la carpeta extraída
3. La aplicación detectará automáticamente que está en modo portable y creará una carpeta `data` junto al ejecutable para almacenar toda la información
4. No se requiere instalación adicional

### Funcionamiento del modo portable
La aplicación puede funcionar en dos modos:

1. **Modo portable**: Cuando se ejecuta desde una ubicación con permisos de escritura, la aplicación crea una carpeta `data` junto al ejecutable para almacenar todos los certificados, la CA y las configuraciones. Esto permite mover la carpeta completa entre diferentes ordenadores manteniendo toda la configuración.

2. **Modo estándar**: Cuando se ejecuta desde una ubicación sin permisos de escritura (como `Program Files` tras la instalación), la aplicación usa la carpeta de datos de usuario del sistema para almacenar la información.

La aplicación determina automáticamente qué modo usar al iniciarse.

## Guía de usuario

### Inicio de la aplicación
Al iniciar la aplicación por primera vez, se creará automáticamente una Autoridad Certificadora (CA) personal que se utilizará para firmar todos los certificados que genere. Esta CA se almacena localmente en su equipo.

### Interfaz principal
La interfaz de la aplicación se divide en cuatro secciones principales:

1. **Generación de certificados:** Formulario para crear nuevos certificados
2. **Autoridad Certificadora:** Información y gestión de la CA
3. **Historial de certificados:** Lista de certificados generados previamente
4. **Ayuda y documentación:** Acceso a la documentación interna

### Generación de certificados
Para generar un nuevo certificado:

1. Complete el formulario con la siguiente información:
   - **Correo electrónico:** dirección de correo para la que se generará el certificado (obligatorio)
   - **Nombre completo:** su nombre o identificador (opcional)
   - **Tamaño de clave:** seleccione entre 2048, 4096 (recomendado) o 8192 bits
   - **Validez:** seleccione el período de validez (1, 2 o 3 años)
   - **Contraseña:** establezca una contraseña segura para proteger el certificado (obligatorio)

2. Haga clic en "Generar Certificado"
3. Una vez generado, podrá:
   - Ver los detalles del certificado generado
   - Descargar el certificado en formato PKCS#12 (.p12) para importarlo en su cliente de correo
   - Descargar el certificado en formato PEM (.pem)
   - Descargar el certificado público (.crt) para compartirlo

### Gestión de la Autoridad Certificadora
La sección de Autoridad Certificadora le permite:

1. Ver la información básica de su CA
2. Descargar el certificado público de la CA (.crt) para instalarlo en sus dispositivos
3. Ver información detallada de la CA, incluyendo huellas digitales y fechas de validez

Es esencial instalar el certificado de la CA en todos los dispositivos donde desee utilizar los certificados generados.

### Historial de certificados
En esta sección puede:

1. Ver todos los certificados generados anteriormente
2. Descargar cualquier certificado en diferentes formatos (P12, PEM, CRT)
3. Exportar la lista completa en formato JSON o CSV
4. Actualizar la lista si ha realizado cambios

## Funcionalidades principales

### Generación de certificados S/MIME
- Creación de certificados personalizados con diferentes tamaños de clave
- Inclusión de información de identificación personal
- Protección mediante contraseña (formato PKCS#12)
- Períodos de validez configurables

### Autoridad Certificadora (CA) integrada
- Generación automática de una CA propia
- Certificados con validez de 10 años
- Exportación del certificado CA para instalación en dispositivos
- Visualización de información detallada

### Gestión de certificados
- Almacenamiento local de los certificados generados
- Exportación en múltiples formatos (PKCS#12, PEM, CRT)
- Historial de certificados generados
- Exportación masiva en formatos JSON y CSV

### Utilidades adicionales
- Documentación integrada
- Interfaz intuitiva y responsive
- Información detallada sobre los certificados
- Guías de importación para diferentes clientes de correo

## Arquitectura de la aplicación

### Estructura general
La aplicación está construida utilizando Electron, un framework que permite desarrollar aplicaciones de escritorio con tecnologías web. La arquitectura se divide en dos procesos principales:

1. **Proceso principal (main process):** Gestiona la aplicación, ventanas y funcionalidades del sistema
2. **Proceso de renderizado (renderer process):** Maneja la interfaz de usuario y la interacción con el usuario

### Estructura de directorios
```
Generador-Certificados-Desktop/
├── src/                        # Código fuente
│   ├── main.js                 # Proceso principal y lógica de certificados
│   ├── preload.js              # Script de precarga para comunicación segura
│   └── renderer/               # Interfaz de usuario
│       ├── index.html          # Estructura HTML
│       ├── styles.css          # Estilos de la aplicación
│       └── app-desktop.js      # Lógica de la interfaz
├── assets/                     # Recursos (iconos, imágenes)
├── dist/                       # Archivos generados para distribución
└── package.json                # Configuración del proyecto
```

### Flujo de datos
1. El usuario interactúa con la interfaz (proceso de renderizado)
2. Las solicitudes se envían al proceso principal a través de IPC (Inter-Process Communication)
3. El proceso principal ejecuta la lógica criptográfica y devuelve resultados
4. La interfaz se actualiza con la información recibida

## Componentes técnicos

### Tecnologías utilizadas
- **Electron:** Framework para aplicaciones de escritorio
- **Node.js:** Entorno de ejecución JavaScript
- **node-forge:** Biblioteca criptográfica para generación de certificados
- **electron-store:** Almacenamiento persistente de datos
- **HTML/CSS/JavaScript:** Tecnologías web para la interfaz

### Módulos principales

#### Generación de certificados
El módulo de generación de certificados se basa en la biblioteca node-forge para:
- Crear pares de claves RSA (2048, 4096, 8192 bits)
- Generar certificados X.509 compatibles con S/MIME
- Firmar certificados con la CA propia
- Convertir certificados a distintos formatos (PKCS#12, PEM, CRT)

#### Autoridad Certificadora
La CA se implementa como una clase que proporciona:
- Creación y gestión de la CA raíz
- Almacenamiento seguro de claves
- Firma de certificados de usuario
- Exportación del certificado público

#### Almacenamiento
Se utiliza electron-store para:
- Almacenar los certificados generados
- Mantener un historial persistente
- Guardar preferencias de la aplicación

#### Interfaz de usuario
La interfaz se implementa con tecnologías web estándar:
- HTML para la estructura
- CSS para los estilos y diseño responsive
- JavaScript para la interactividad y comunicación con el proceso principal

## Preguntas frecuentes

### Generales
**P: ¿Los certificados generados son reconocidos globalmente?**  
R: No. Los certificados se generan con una CA propia que no está reconocida por los navegadores y clientes de correo de forma predeterminada. Debe importar el certificado de la CA en cada dispositivo donde desee usar los certificados.

**P: ¿Necesito conexión a Internet para usar la aplicación?**  
R: No. La aplicación funciona completamente sin conexión.

**P: ¿Dónde se almacenan los certificados generados?**  
R: Los certificados se almacenan localmente en su equipo, en la carpeta de datos de la aplicación.

### Técnicas
**P: ¿Qué algoritmos criptográficos se utilizan?**  
R: Se utilizan claves RSA con tamaños de 2048, 4096 o 8192 bits. Los certificados se firman utilizando SHA-256.

**P: ¿Puedo revocar certificados generados?**  
R: La versión actual no incluye gestión de revocación de certificados.

**P: ¿Es seguro utilizar una CA propia?**  
R: Sí, para comunicaciones personales o en entornos controlados. Sin embargo, no proporciona la misma confianza que una CA comercial para comunicaciones públicas.

**P: ¿Se pueden recuperar las contraseñas de los certificados?**  
R: No. La aplicación no almacena las contraseñas utilizadas para proteger los archivos PKCS#12. Asegúrese de guardar sus contraseñas en un lugar seguro.

## Solución de problemas

### Problemas comunes

**Problema: La aplicación no se inicia**  
Soluciones:
- Verifique que su sistema cumple con los requisitos mínimos
- Reinstale la aplicación
- Compruebe que no hay conflictos con software antivirus

**Problema: No puedo generar certificados**  
Soluciones:
- Asegúrese de ingresar una dirección de correo electrónico válida
- La contraseña debe tener al menos 4 caracteres
- Verifique que tiene permisos de escritura en su sistema

**Problema: El certificado no funciona en mi cliente de correo**  
Soluciones:
- Asegúrese de haber importado también el certificado de la CA
- Verifique que ha seguido correctamente los pasos de importación para su cliente
- Compruebe que el certificado no ha caducado

**Problema: He olvidado la contraseña de mi certificado**  
Soluciones:
- Las contraseñas no se pueden recuperar. Deberá generar un nuevo certificado
- Considere utilizar un gestor de contraseñas para almacenar sus claves de forma segura

### Registros y diagnóstico
Para problemas avanzados, puede acceder a los registros de la aplicación en:
- Windows: `%APPDATA%\Generador de Certificados S/MIME\logs\`

## Referencias y recursos adicionales

### S/MIME y certificados
- [Estándar S/MIME (RFC 8551)](https://tools.ietf.org/html/rfc8551)
- [Certificados X.509 (RFC 5280)](https://tools.ietf.org/html/rfc5280)
- [Uso de S/MIME en Mozilla Thunderbird](https://support.mozilla.org/kb/digitally-signing-and-encrypting-messages)
- [Configuración de S/MIME en Microsoft Outlook](https://support.microsoft.com/office/encrypt-messages-by-using-s-mime-in-outlook-on-the-web-878c79fc-7088-4b39-966f-14512658f480)

### Autoridades Certificadoras
- [Jerarquía de confianza de certificados](https://en.wikipedia.org/wiki/Public_key_infrastructure)
- [Buenas prácticas para CA privadas](https://smallstep.com/blog/build-a-tiny-ca-with-raspberry-pi-yubikey/)

### Criptografía y seguridad
- [Introducción a la criptografía de clave pública](https://en.wikipedia.org/wiki/Public-key_cryptography)
- [Seguridad en el correo electrónico](https://www.ncsc.gov.uk/guidance/email-security-and-anti-spoofing)

---

## Información de contacto

Para soporte técnico o consultas, póngase en contacto con:

**Desarrollador:** Desarrollador  
**Empresa:** Empresa  
**Localización:** Montevideo, Uruguay  
**Año:** 2025

---

*Documentación generada para el Generador de Certificados S/MIME v1.0.0*
