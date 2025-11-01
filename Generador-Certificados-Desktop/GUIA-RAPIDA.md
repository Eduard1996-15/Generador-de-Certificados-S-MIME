# Guía Rápida - Generador de Certificados S/MIME

## Inicio Rápido

### Generar un nuevo certificado

1. Abra la aplicación Generador de Certificados S/MIME
2. Complete el formulario:
   - **Email**: introduzca su dirección de correo electrónico
   - **Nombre**: (opcional) introduzca su nombre completo
   - **Tamaño de Clave**: seleccione RSA-4096 (recomendado)
   - **Validez**: seleccione el período de validez deseado
   - **Contraseña**: establezca una contraseña segura (mínimo 4 caracteres)
3. Haga clic en "Generar Certificado"
4. Descargue los archivos necesarios:
   - **PKCS#12 (.p12)**: archivo principal para importar en clientes de correo
   - **PEM (.pem)**: formato alternativo para algunos sistemas
   - **Público (.crt)**: certificado público para compartir con otros

### Importar en Thunderbird

1. Descargue el certificado CA haciendo clic en "Descargar Certificado CA (.crt)"
2. Abra Thunderbird
3. Vaya a Herramientas → Opciones → Avanzado → Certificados → Ver certificados
4. En la pestaña "Autoridades", haga clic en "Importar" y seleccione el archivo CA descargado
5. Marque las casillas "Confiar en esta CA para identificar sitios web" y "...para identificar usuarios de correo"
6. En la pestaña "Sus certificados", haga clic en "Importar"
7. Seleccione el archivo PKCS#12 (.p12) e introduzca la contraseña
8. Configure su cuenta: Propiedades de la cuenta → Seguridad → Usar firma digital → Utilizar el certificado importado

### Importar en Outlook

1. Descargue el certificado CA haciendo clic en "Descargar Certificado CA (.crt)"
2. Haga doble clic en el archivo .crt descargado
3. Seleccione "Instalar certificado" → "Equipo local"
4. Seleccione "Colocar todos los certificados en el siguiente almacén"
5. Haga clic en "Examinar" y seleccione "Entidades de certificación raíz de confianza"
6. Complete el asistente
7. Haga doble clic en su archivo PKCS#12 (.p12)
8. Siga el asistente e introduzca la contraseña cuando se le solicite
9. En Outlook, vaya a Archivo → Opciones → Centro de confianza → Configuración del Centro de confianza → Seguridad del correo electrónico
10. Configure las opciones de S/MIME según sus preferencias

## Referencia Rápida

### Modo Portable

La aplicación detecta automáticamente si puede ejecutarse en modo portable:

- Si tiene permisos de escritura en la carpeta donde se encuentra el .exe, creará una carpeta `data` ahí mismo para almacenar todos los certificados y configuraciones.
- Si no tiene permisos de escritura (por ejemplo, en `Program Files`), usará la carpeta de datos de usuario normal.

Para asegurar el modo portable:
1. Extraiga todos los archivos en una carpeta donde tenga permisos de escritura (por ejemplo, en un pendrive USB)
2. Ejecute directamente el archivo .exe
3. La aplicación creará automáticamente una carpeta `data` para almacenar los certificados y configuraciones

**Nota**: Al utilizar el modo portable, puede mover la carpeta completa entre diferentes ordenadores manteniendo todos sus certificados y configuraciones.

### Formatos de certificado

- **PKCS#12 (.p12)**: Contiene clave privada y certificado, protegido con contraseña. Use este formato para importar en clientes de correo.
- **PEM (.pem)**: Formato de texto con codificación Base64. Útil para servidores y algunos sistemas.
- **Público (.crt)**: Solo contiene la parte pública del certificado. Puede compartirse con otros para verificar sus firmas.

### Autoridad Certificadora (CA)

- Su CA personal es válida por 10 años
- Debe importar el certificado CA en todos los dispositivos donde use sus certificados
- No es reconocida globalmente como las CA comerciales
- Proporciona el mismo nivel de seguridad que las CA comerciales para cifrado y firma

### Consejos de seguridad

- Use contraseñas seguras para proteger sus certificados
- Guarde copias de seguridad de sus certificados en un lugar seguro
- No comparta su archivo PKCS#12 (.p12) ni su contraseña
- Puede compartir libremente su certificado público (.crt)
- Recuerde reinstalar su CA al cambiar de dispositivo

### Solución de problemas comunes

- **El certificado no funciona**: Verifique que ha importado correctamente la CA
- **"No es posible cifrar"**: El destinatario debe compartir su certificado público con usted
- **"Error de contraseña"**: Asegúrese de usar la contraseña correcta al importar
- **"Certificado no confiable"**: La CA no está correctamente instalada en el sistema

## Datos Técnicos

- Certificados X.509 compatibles con S/MIME v3
- Algoritmos: RSA (2048, 4096, 8192 bits) con SHA-256
- Certificados generados en Montevideo, Uruguay
- Almacenamiento local en formato JSON
- No requiere conexión a Internet

---

*Guía Rápida v1.0 - Generador de Certificados S/MIME*  
*Desarrollado por Desarrollador - Empresa*
