# Requisitos para Desarrolladores

Este documento contiene información para desarrolladores que deseen trabajar en el proyecto Generador de Certificados S/MIME.

## Entorno de desarrollo

### Requisitos previos
- **Node.js**: versión 16.x o superior
- **npm**: versión 8.x o superior
- **Git**: para control de versiones
- **Visual Studio Code**: recomendado como IDE

### Dependencias principales
- **Electron**: v28.0.0
- **node-forge**: v1.3.1 (biblioteca criptográfica)
- **electron-store**: v8.1.0 (almacenamiento persistente)
- **electron-builder**: v24.0.0 (para empaquetar la aplicación)

## Configuración del entorno

1. Clone el repositorio:
```bash
git clone https://github.com/empresa-proyectos/generador-certificados-desktop.git
cd generador-certificados-desktop
```

2. Instale las dependencias:
```bash
npm install
```

3. Inicie la aplicación en modo desarrollo:
```bash
npm run start
```

## Estructura del proyecto

```
Generador-Certificados-Desktop/
├── src/                    # Código fuente
│   ├── main.js             # Proceso principal
│   ├── preload.js          # Script de precarga
│   └── renderer/           # Proceso de renderizado
│       ├── index.html      # Estructura HTML
│       ├── styles.css      # Estilos CSS
│       └── app-desktop.js  # Lógica del cliente
├── assets/                 # Recursos estáticos
├── certificates/           # Certificados de ejemplo (solo desarrollo)
└── dist/                   # Archivos compilados
```

## Scripts disponibles

- `npm run start`: Inicia la aplicación en modo desarrollo
- `npm run dev`: Inicia la aplicación con opciones de desarrollo adicionales
- `npm run build`: Empaqueta la aplicación para distribución
- `npm run build-win`: Empaqueta específicamente para Windows
- `npm run dist`: Genera archivos de distribución sin publicar
- `npm run pack`: Empaqueta sin crear instaladores

## Compilación para distribución

Para compilar la aplicación para distribución:

```bash
npm run build
```

Esto generará los archivos en la carpeta `dist/`, incluyendo:
- Instalador NSIS para Windows (.exe)
- Versión portable (.exe)

## Convenciones de código

- Utilice nombres de variables y funciones descriptivos
- Documente las funciones y módulos con comentarios JSDoc
- Siga las convenciones de estilo de JavaScript estándar
- Realice pruebas manuales antes de enviar cambios

## Notas importantes

- Los certificados generados en modo desarrollo no deben usarse en producción
- La CA se genera automáticamente la primera vez que se ejecuta la aplicación
- Las contraseñas de certificados no se almacenan en ningún lugar
- El código del generador de certificados está en la clase `CAManager` en `main.js`

---

*Documento para desarrolladores - Generador de Certificados S/MIME*
