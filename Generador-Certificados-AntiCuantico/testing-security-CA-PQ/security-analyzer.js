/**
 * 🔒 ANALIZADOR DE SEGURIDAD POST-CUÁNTICA
 * ========================================
 * Sistema de testing de seguridad para CA y certificados post-cuánticos
 * Similar al CA Desktop pero especializado en criptografía post-cuántica
 * 
 * Proyecto de Ejemplo
 * Autor: Sistema de Análisis de Seguridad PQC
 * Fecha: Octubre 2025
 */

const forge = require('node-forge');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class PostQuantumSecurityAnalyzer {
    constructor(caPath, userCertsPath) {
        this.caPath = caPath;
        this.userCertsPath = userCertsPath;
        this.vulnerabilities = [];
        this.warnings = [];
        this.recommendations = [];
        this.score = 100;
        
        // Niveles de severidad
        this.SEVERITY = {
            CRITICAL: { name: 'CRÍTICO', color: '🔴', points: -25 },
            HIGH: { name: 'ALTO', color: '🟠', points: -15 },
            MEDIUM: { name: 'MEDIO', color: '🟡', points: -10 },
            LOW: { name: 'BAJO', color: '🟢', points: -5 },
            INFO: { name: 'INFO', color: '🔵', points: 0 }
        };
        
        // Configuración de seguridad recomendada
        this.SECURITY_CONFIG = {
            minRSAKeySize: 4096,
            minValidityYears: 1,
            maxValidityYears: 15,
            requiredExtensions: ['keyUsage', 'basicConstraints'],
            requiredDilithiumKeySize: 4032, // Dilithium-3 private key
            minPasswordLength: 12,
            requiredSignatureAlgorithm: 'sha512WithRSAEncryption'
        };
    }

    /**
     * 🎯 Ejecutar análisis completo de seguridad
     */
    async runFullSecurityAnalysis() {
        console.log('\n' + '='.repeat(80));
        console.log('🔒 ANALIZADOR DE SEGURIDAD POST-CUÁNTICA');
        console.log('='.repeat(80));
        console.log(`📅 Fecha: ${new Date().toLocaleString('es')}`);
        console.log(`📂 CA Path: ${this.caPath}`);
        console.log(`📂 Certificados: ${this.userCertsPath}\n`);

        const results = {
            timestamp: new Date().toISOString(),
            ca: await this.analyzeCA(),
            certificates: await this.analyzeUserCertificates(),
            cryptography: await this.analyzeCryptographicStrength(),
            postQuantum: await this.analyzePostQuantumReadiness(),
            pkcs12: await this.analyzePKCS12Security(),
            hybridEncryption: await this.analyzeHybridEncryption(),
            overall: this.calculateOverallScore()
        };

        // Generar reporte
        await this.generateSecurityReport(results);
        
        return results;
    }

    /**
     * 🏛️ Analizar seguridad de la CA raíz
     */
    async analyzeCA() {
        console.log('🏛️ Analizando Autoridad Certificadora...\n');
        
        const caResults = {
            exists: false,
            valid: false,
            issues: [],
            keyStrength: null,
            dilithiumPresent: false,
            expirationDate: null,
            daysUntilExpiration: null
        };

        try {
            // Verificar existencia de archivos CA
            const caCertPath = path.join(this.caPath, 'Root-CA-PostQuantum.crt');
            const caKeyPath = path.join(this.caPath, 'Root-CA-PrivateKey.key');
            const dilithiumKeyPath = path.join(this.caPath, 'Root-CA-Dilithium.key');

            if (!fs.existsSync(caCertPath)) {
                this.addVulnerability('CRITICAL', 'CA-001', 
                    'Certificado de CA no encontrado',
                    'No existe el archivo de certificado de la CA',
                    'Generar una nueva CA usando el botón "Crear Nueva CA"'
                );
                return caResults;
            }

            caResults.exists = true;

            // Cargar certificado CA
            const caCertPem = fs.readFileSync(caCertPath, 'utf8');
            const caCert = forge.pki.certificateFromPem(caCertPem);

            // Verificar validez temporal
            const now = new Date();
            const notBefore = new Date(caCert.validity.notBefore);
            const notAfter = new Date(caCert.validity.notAfter);
            
            caResults.expirationDate = notAfter.toISOString();
            caResults.daysUntilExpiration = Math.floor((notAfter - now) / (1000 * 60 * 60 * 24));

            console.log(`📅 Válido desde: ${notBefore.toLocaleDateString('es')}`);
            console.log(`📅 Válido hasta: ${notAfter.toLocaleDateString('es')}`);
            console.log(`⏳ Días restantes: ${caResults.daysUntilExpiration}`);

            if (now < notBefore) {
                this.addVulnerability('CRITICAL', 'CA-002',
                    'Certificado CA aún no válido',
                    `El certificado no será válido hasta ${notBefore.toLocaleDateString('es')}`,
                    'Verificar configuración del reloj del sistema'
                );
            }

            if (now > notAfter) {
                this.addVulnerability('CRITICAL', 'CA-003',
                    'Certificado CA expirado',
                    `El certificado expiró el ${notAfter.toLocaleDateString('es')}`,
                    'Renovar la CA inmediatamente'
                );
            } else if (caResults.daysUntilExpiration < 90) {
                this.addVulnerability('HIGH', 'CA-004',
                    'Certificado CA próximo a expirar',
                    `El certificado expirará en ${caResults.daysUntilExpiration} días`,
                    'Planificar renovación de la CA'
                );
            } else if (caResults.daysUntilExpiration < 365) {
                this.addVulnerability('MEDIUM', 'CA-005',
                    'Certificado CA con menos de 1 año de validez',
                    `El certificado expirará en ${caResults.daysUntilExpiration} días`,
                    'Considerar renovación de la CA en los próximos meses'
                );
            }

            caResults.valid = (now >= notBefore && now <= notAfter);

            // Verificar tamaño de clave RSA
            const publicKey = caCert.publicKey;
            const keySize = publicKey.n.bitLength();
            caResults.keyStrength = keySize;

            console.log(`🔑 Tamaño de clave RSA: ${keySize} bits`);

            if (keySize < 2048) {
                this.addVulnerability('CRITICAL', 'CA-006',
                    'Clave RSA de CA demasiado débil',
                    `La clave RSA tiene ${keySize} bits, mínimo recomendado: 2048 bits`,
                    'Regenerar CA con clave RSA de al menos 4096 bits'
                );
            } else if (keySize < 4096) {
                this.addVulnerability('MEDIUM', 'CA-007',
                    'Clave RSA de CA por debajo del estándar recomendado',
                    `La clave RSA tiene ${keySize} bits, recomendado: 4096 bits para post-cuántico`,
                    'Considerar regenerar CA con clave RSA-4096'
                );
            } else {
                console.log('✅ Tamaño de clave RSA adecuado (4096+ bits)');
            }

            // Verificar algoritmo de firma
            const signatureAlgorithm = caCert.signatureOid;
            console.log(`📝 Algoritmo de firma: ${signatureAlgorithm}`);

            if (signatureAlgorithm.includes('md5') || signatureAlgorithm.includes('sha1')) {
                this.addVulnerability('CRITICAL', 'CA-008',
                    'Algoritmo de firma obsoleto',
                    `Usando ${signatureAlgorithm} que es vulnerable`,
                    'Regenerar CA usando SHA-256 o superior'
                );
            } else if (!signatureAlgorithm.includes('sha512')) {
                this.addVulnerability('LOW', 'CA-009',
                    'Algoritmo de firma no óptimo',
                    `Usando ${signatureAlgorithm}, recomendado: SHA-512`,
                    'Considerar usar SHA-512 para máxima seguridad'
                );
            } else {
                console.log('✅ Algoritmo de firma seguro (SHA-512)');
            }

            // Verificar extensiones críticas
            const extensions = caCert.extensions;
            const hasBasicConstraints = extensions.some(ext => ext.name === 'basicConstraints');
            const hasKeyUsage = extensions.some(ext => ext.name === 'keyUsage');

            if (!hasBasicConstraints) {
                this.addVulnerability('HIGH', 'CA-010',
                    'Falta extensión basicConstraints',
                    'El certificado CA no tiene la extensión basicConstraints',
                    'Regenerar CA con extensión basicConstraints marcada como crítica'
                );
            } else {
                const bcExt = extensions.find(ext => ext.name === 'basicConstraints');
                if (!bcExt.cA) {
                    this.addVulnerability('CRITICAL', 'CA-011',
                        'CA no marcada como autoridad certificadora',
                        'basicConstraints.cA no está en true',
                        'Regenerar CA con basicConstraints.cA = true'
                    );
                } else {
                    console.log('✅ basicConstraints correctamente configurado');
                }
            }

            if (!hasKeyUsage) {
                this.addVulnerability('MEDIUM', 'CA-012',
                    'Falta extensión keyUsage',
                    'El certificado CA no especifica keyUsage',
                    'Regenerar CA con keyUsage incluyendo keyCertSign y cRLSign'
                );
            } else {
                console.log('✅ keyUsage presente');
            }

            // Verificar claves Dilithium (post-cuánticas)
            if (fs.existsSync(dilithiumKeyPath)) {
                try {
                    const dilithiumKey = fs.readFileSync(dilithiumKeyPath, 'utf8');
                    const dilithiumData = JSON.parse(dilithiumKey);
                    
                    caResults.dilithiumPresent = true;
                    
                    const privateKeySize = Buffer.from(dilithiumData.privateKey, 'base64').length;
                    const publicKeySize = Buffer.from(dilithiumData.publicKey, 'base64').length;
                    
                    console.log(`🔐 Clave Dilithium detectada (formato JSON):`);
                    console.log(`   • Privada: ${privateKeySize} bytes`);
                    console.log(`   • Pública: ${publicKeySize} bytes`);

                    if (privateKeySize !== 4032 || publicKeySize !== 1952) {
                        this.addVulnerability('HIGH', 'CA-013',
                            'Tamaño de clave Dilithium incorrecto',
                            `Esperado: 4032/1952 bytes, Actual: ${privateKeySize}/${publicKeySize} bytes`,
                            'Regenerar claves Dilithium con parámetros correctos (Dilithium-3/ML-DSA-65)'
                        );
                    } else {
                        console.log('✅ Claves Dilithium con tamaño correcto (Dilithium-3)');
                    }
                } catch (jsonError) {
                    // Si no es JSON, intentar leer como archivo binario/PEM
                    try {
                        const dilithiumKeyBinary = fs.readFileSync(dilithiumKeyPath);
                        caResults.dilithiumPresent = true;
                        
                        const fileSize = dilithiumKeyBinary.length;
                        console.log(`🔐 Clave Dilithium detectada (formato binario/PEM):`);
                        console.log(`   • Tamaño de archivo: ${fileSize} bytes`);
                        
                        // Verificar tamaño aproximado (debe contener las claves)
                        if (fileSize < 4000) {
                            this.addVulnerability('HIGH', 'CA-013',
                                'Archivo de clave Dilithium demasiado pequeño',
                                `Tamaño: ${fileSize} bytes, esperado: >4000 bytes`,
                                'Regenerar claves Dilithium con parámetros correctos'
                            );
                        } else {
                            console.log('✅ Claves Dilithium presentes (tamaño adecuado)');
                        }
                    } catch (binaryError) {
                        this.addVulnerability('HIGH', 'CA-016',
                            'Error leyendo claves Dilithium',
                            `No se pudo parsear el archivo: ${jsonError.message}`,
                            'Verificar integridad del archivo de claves Dilithium'
                        );
                    }
                }
            } else {
                this.addVulnerability('HIGH', 'CA-014',
                    'Claves post-cuánticas no encontradas',
                    'No se encontraron claves CRYSTALS-Dilithium para la CA',
                    'Regenerar CA con soporte post-cuántico completo'
                );
            }

            // Verificar protección de clave privada
            if (fs.existsSync(caKeyPath)) {
                const keyPem = fs.readFileSync(caKeyPath, 'utf8');
                
                if (keyPem.includes('ENCRYPTED')) {
                    console.log('✅ Clave privada CA protegida con cifrado');
                } else {
                    this.addVulnerability('CRITICAL', 'CA-017',
                        'Clave privada CA sin cifrar',
                        'La clave privada de la CA está almacenada sin protección',
                        'Cifrar la clave privada con una contraseña robusta'
                    );
                }
            }

        } catch (error) {
            this.addVulnerability('CRITICAL', 'CA-099',
                'Error analizando CA',
                error.message,
                'Verificar integridad de archivos de la CA'
            );
        }

        console.log('\n' + '-'.repeat(80) + '\n');
        return caResults;
    }

    /**
     * 📧 Analizar certificados de usuario
     */
    async analyzeUserCertificates() {
        console.log('📧 Analizando Certificados de Usuario...\n');

        const results = {
            totalCertificates: 0,
            validCertificates: 0,
            expiredCertificates: 0,
            weakKeys: 0,
            issues: []
        };

        try {
            if (!fs.existsSync(this.userCertsPath)) {
                console.log('ℹ️  No hay certificados de usuario para analizar\n');
                return results;
            }

            const userDirs = fs.readdirSync(this.userCertsPath).filter(item => {
                return fs.statSync(path.join(this.userCertsPath, item)).isDirectory();
            });

            results.totalCertificates = userDirs.length;

            for (const userDir of userDirs) {
                const userPath = path.join(this.userCertsPath, userDir);
                const certFiles = fs.readdirSync(userPath).filter(f => f.endsWith('.crt'));

                for (const certFile of certFiles) {
                    const certPath = path.join(userPath, certFile);
                    await this.analyzeUserCertificate(certPath, userDir, results);
                }
            }

            console.log(`📊 Total certificados analizados: ${results.totalCertificates}`);
            console.log(`✅ Certificados válidos: ${results.validCertificates}`);
            console.log(`⚠️  Certificados expirados: ${results.expiredCertificates}`);
            console.log(`🔑 Certificados con claves débiles: ${results.weakKeys}`);

        } catch (error) {
            this.addVulnerability('HIGH', 'CERT-099',
                'Error analizando certificados de usuario',
                error.message,
                'Verificar estructura de carpetas de certificados'
            );
        }

        console.log('\n' + '-'.repeat(80) + '\n');
        return results;
    }

    /**
     * 📄 Analizar certificado individual
     */
    async analyzeUserCertificate(certPath, userName, results) {
        try {
            const certPem = fs.readFileSync(certPath, 'utf8');
            const cert = forge.pki.certificateFromPem(certPem);

            const now = new Date();
            const notAfter = new Date(cert.validity.notAfter);
            const isValid = (now <= notAfter);

            if (isValid) {
                results.validCertificates++;
            } else {
                results.expiredCertificates++;
                this.addVulnerability('MEDIUM', `CERT-${userName}`,
                    `Certificado expirado: ${userName}`,
                    `Expiró el ${notAfter.toLocaleDateString('es')}`,
                    'Renovar certificado del usuario'
                );
            }

            // Verificar tamaño de clave
            const keySize = cert.publicKey.n.bitLength();
            if (keySize < 4096) {
                results.weakKeys++;
                this.addVulnerability('MEDIUM', `CERT-KEY-${userName}`,
                    `Clave débil en certificado: ${userName}`,
                    `Clave RSA de ${keySize} bits, recomendado: 4096 bits`,
                    'Regenerar certificado con clave RSA-4096'
                );
            }

        } catch (error) {
            console.log(`⚠️  Error analizando ${certPath}: ${error.message}`);
        }
    }

    /**
     * 🔐 Analizar fortaleza criptográfica
     */
    async analyzeCryptographicStrength() {
        console.log('🔐 Analizando Fortaleza Criptográfica...\n');

        const results = {
            randomness: await this.testRandomness(),
            entropy: await this.testEntropy(),
            keyGeneration: 'OK'
        };

        console.log(`🎲 Test de aleatoriedad: ${results.randomness.passed ? '✅ PASÓ' : '❌ FALLÓ'}`);
        console.log(`📊 Test de entropía: ${results.entropy.passed ? '✅ PASÓ' : '❌ FALLÓ'}`);

        if (!results.randomness.passed) {
            this.addVulnerability('CRITICAL', 'CRYPTO-001',
                'Generador de números aleatorios débil',
                'Los números aleatorios no pasan tests estadísticos',
                'Verificar fuente de entropía del sistema'
            );
        }

        console.log('\n' + '-'.repeat(80) + '\n');
        return results;
    }

    /**
     * 🎲 Test de aleatoriedad (Chi-cuadrado simplificado)
     */
    async testRandomness() {
        const samples = 1000;
        const buckets = 256;
        const expected = samples / buckets;
        const counts = new Array(buckets).fill(0);

        // Generar muestras
        for (let i = 0; i < samples; i++) {
            const randomByte = crypto.randomBytes(1)[0];
            counts[randomByte]++;
        }

        // Calcular chi-cuadrado
        let chiSquare = 0;
        for (let i = 0; i < buckets; i++) {
            const diff = counts[i] - expected;
            chiSquare += (diff * diff) / expected;
        }

        // Para 255 grados de libertad, chi-cuadrado crítico (p=0.05) ≈ 293
        const passed = chiSquare < 300;

        return { passed, chiSquare, threshold: 300 };
    }

    /**
     * 📊 Test de entropía
     */
    async testEntropy() {
        const data = crypto.randomBytes(1000);
        const frequencies = new Array(256).fill(0);

        for (let i = 0; i < data.length; i++) {
            frequencies[data[i]]++;
        }

        let entropy = 0;
        for (let i = 0; i < 256; i++) {
            if (frequencies[i] > 0) {
                const p = frequencies[i] / data.length;
                entropy -= p * Math.log2(p);
            }
        }

        // Entropía máxima para bytes = 8 bits
        const passed = entropy > 7.5; // Permitir pequeña desviación

        return { passed, entropy, maxEntropy: 8 };
    }

    /**
     * 🛡️ Analizar preparación post-cuántica
     */
    async analyzePostQuantumReadiness() {
        console.log('🛡️ Analizando Preparación Post-Cuántica...\n');

        const results = {
            dilithiumImplemented: false,
            hybridMode: false,
            readinessScore: 0,
            recommendations: []
        };

        try {
            const dilithiumKeyPath = path.join(this.caPath, 'Root-CA-Dilithium.key');
            
            if (fs.existsSync(dilithiumKeyPath)) {
                results.dilithiumImplemented = true;
                results.readinessScore += 50;
                console.log('✅ CRYSTALS-Dilithium implementado');
            } else {
                console.log('❌ CRYSTALS-Dilithium NO implementado');
                this.addVulnerability('HIGH', 'PQC-001',
                    'Criptografía post-cuántica no implementada',
                    'No se encontraron claves Dilithium',
                    'Regenerar CA con soporte post-cuántico'
                );
            }

            // Verificar si hay certificados híbridos
            if (fs.existsSync(this.userCertsPath)) {
                const userDirs = fs.readdirSync(this.userCertsPath).filter(item => {
                    return fs.statSync(path.join(this.userCertsPath, item)).isDirectory();
                });

                for (const userDir of userDirs) {
                    const userPath = path.join(this.userCertsPath, userDir);
                    const hybridFiles = fs.readdirSync(userPath).filter(f => f.includes('HYBRID'));
                    
                    if (hybridFiles.length > 0) {
                        results.hybridMode = true;
                        results.readinessScore += 30;
                        console.log('✅ Modo híbrido activo (RSA + Dilithium)');
                        break;
                    }
                }
            }

            // Verificar biblioteca @noble/post-quantum
            const packageJsonPath = path.join(__dirname, '..', 'package.json');
            if (fs.existsSync(packageJsonPath)) {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                if (packageJson.dependencies && packageJson.dependencies['@noble/post-quantum']) {
                    results.readinessScore += 20;
                    console.log('✅ Biblioteca @noble/post-quantum presente');
                } else {
                    this.addVulnerability('MEDIUM', 'PQC-002',
                        'Biblioteca post-cuántica no encontrada',
                        '@noble/post-quantum no está en dependencias',
                        'Instalar @noble/post-quantum para soporte PQC'
                    );
                }
            }

            console.log(`\n📊 Puntuación de preparación post-cuántica: ${results.readinessScore}/100`);

            if (results.readinessScore < 50) {
                console.log('❌ Sistema NO preparado para amenazas cuánticas');
            } else if (results.readinessScore < 80) {
                console.log('⚠️  Sistema parcialmente preparado para amenazas cuánticas');
            } else {
                console.log('✅ Sistema BIEN preparado para amenazas cuánticas');
            }

        } catch (error) {
            this.addVulnerability('MEDIUM', 'PQC-099',
                'Error analizando preparación post-cuántica',
                error.message,
                'Verificar configuración del sistema'
            );
        }

        console.log('\n' + '-'.repeat(80) + '\n');
        return results;
    }

    /**
     * 📦 Analizar seguridad de archivos PKCS#12
     */
    async analyzePKCS12Security() {
        console.log('📦 Analizando Seguridad de Archivos PKCS#12...\n');

        const results = {
            totalP12Files: 0,
            protectedFiles: 0,
            issues: []
        };

        try {
            if (!fs.existsSync(this.userCertsPath)) {
                console.log('ℹ️  No hay archivos PKCS#12 para analizar\n');
                return results;
            }

            const userDirs = fs.readdirSync(this.userCertsPath).filter(item => {
                return fs.statSync(path.join(this.userCertsPath, item)).isDirectory();
            });

            for (const userDir of userDirs) {
                const userPath = path.join(this.userCertsPath, userDir);
                const p12Files = fs.readdirSync(userPath).filter(f => f.endsWith('.p12'));

                results.totalP12Files += p12Files.length;

                for (const p12File of p12Files) {
                    const p12Path = path.join(userPath, p12File);
                    const p12Data = fs.readFileSync(p12Path, 'binary');
                    
                    // Verificar que el archivo esté protegido con contraseña
                    // (intentar cargar sin contraseña debería fallar)
                    try {
                        const asn1 = forge.asn1.fromDer(p12Data);
                        forge.pkcs12.pkcs12FromAsn1(asn1, false, ''); // Sin password
                        
                        // Si llegamos aquí, no está protegido
                        this.addVulnerability('HIGH', `PKCS12-${userDir}`,
                            `Archivo PKCS#12 sin protección: ${p12File}`,
                            'El archivo no está protegido con contraseña',
                            'Regenerar archivo PKCS#12 con contraseña robusta'
                        );
                    } catch (e) {
                        // Error esperado = archivo protegido
                        results.protectedFiles++;
                    }
                }
            }

            console.log(`📊 Total archivos PKCS#12: ${results.totalP12Files}`);
            console.log(`🔒 Archivos protegidos: ${results.protectedFiles}`);
            console.log(`⚠️  Archivos sin protección: ${results.totalP12Files - results.protectedFiles}`);

        } catch (error) {
            this.addVulnerability('MEDIUM', 'PKCS12-099',
                'Error analizando archivos PKCS#12',
                error.message,
                'Verificar integridad de archivos'
            );
        }

        console.log('\n' + '-'.repeat(80) + '\n');
        return results;
    }

    /**
     * 🔄 Analizar cifrado híbrido
     */
    async analyzeHybridEncryption() {
        console.log('🔄 Analizando Cifrado Híbrido...\n');

        const results = {
            hybridFilesFound: 0,
            validHybridFiles: 0,
            issues: []
        };

        try {
            if (!fs.existsSync(this.userCertsPath)) {
                console.log('ℹ️  No hay archivos híbridos para analizar\n');
                return results;
            }

            const userDirs = fs.readdirSync(this.userCertsPath).filter(item => {
                return fs.statSync(path.join(this.userCertsPath, item)).isDirectory();
            });

            for (const userDir of userDirs) {
                const userPath = path.join(this.userCertsPath, userDir);
                const hybridFiles = fs.readdirSync(userPath).filter(f => f.includes('HYBRID') && f.endsWith('.json'));

                results.hybridFilesFound += hybridFiles.length;

                for (const hybridFile of hybridFiles) {
                    const hybridPath = path.join(userPath, hybridFile);
                    try {
                        const hybridData = JSON.parse(fs.readFileSync(hybridPath, 'utf8'));
                        
                        // Verificar estructura del archivo híbrido
                        const requiredFields = ['algorithm', 'encryptedData', 'rsaProtectedKey', 'dilithiumProtectedKey'];
                        const missingFields = requiredFields.filter(field => !hybridData[field]);
                        
                        if (missingFields.length > 0) {
                            this.addVulnerability('MEDIUM', `HYBRID-${userDir}`,
                                `Archivo híbrido incompleto: ${hybridFile}`,
                                `Faltan campos: ${missingFields.join(', ')}`,
                                'Regenerar archivo híbrido con estructura completa'
                            );
                        } else {
                            results.validHybridFiles++;
                            
                            // Verificar algoritmo
                            if (!hybridData.algorithm.includes('RSA') || !hybridData.algorithm.includes('DILITHIUM')) {
                                this.addVulnerability('LOW', `HYBRID-ALG-${userDir}`,
                                    `Algoritmo híbrido no óptimo: ${hybridFile}`,
                                    `Algoritmo: ${hybridData.algorithm}`,
                                    'Usar HYBRID-RSA4096-DILITHIUM3-AES256'
                                );
                            }
                        }
                    } catch (e) {
                        this.addVulnerability('MEDIUM', `HYBRID-PARSE-${userDir}`,
                            `Error parseando archivo híbrido: ${hybridFile}`,
                            e.message,
                            'Verificar integridad del archivo JSON'
                        );
                    }
                }
            }

            console.log(`📊 Total archivos híbridos: ${results.hybridFilesFound}`);
            console.log(`✅ Archivos híbridos válidos: ${results.validHybridFiles}`);

            if (results.hybridFilesFound === 0) {
                this.addVulnerability('INFO', 'HYBRID-000',
                    'No se encontraron archivos con cifrado híbrido',
                    'Los certificados no tienen protección híbrida activa',
                    'Generar nuevos certificados para obtener protección RSA + Dilithium'
                );
            }

        } catch (error) {
            this.addVulnerability('MEDIUM', 'HYBRID-099',
                'Error analizando cifrado híbrido',
                error.message,
                'Verificar estructura de archivos'
            );
        }

        console.log('\n' + '-'.repeat(80) + '\n');
        return results;
    }

    /**
     * 📊 Calcular puntuación general de seguridad
     */
    calculateOverallScore() {
        const finalScore = Math.max(0, this.score);
        
        let rating;
        let color;
        
        if (finalScore >= 90) {
            rating = 'EXCELENTE';
            color = '🟢';
        } else if (finalScore >= 75) {
            rating = 'BUENO';
            color = '🟡';
        } else if (finalScore >= 50) {
            rating = 'ACEPTABLE';
            color = '🟠';
        } else {
            rating = 'CRÍTICO';
            color = '🔴';
        }

        return {
            score: finalScore,
            rating,
            color,
            totalVulnerabilities: this.vulnerabilities.length,
            criticalVulnerabilities: this.vulnerabilities.filter(v => v.severity === 'CRÍTICO').length,
            highVulnerabilities: this.vulnerabilities.filter(v => v.severity === 'ALTO').length,
            mediumVulnerabilities: this.vulnerabilities.filter(v => v.severity === 'MEDIO').length,
            lowVulnerabilities: this.vulnerabilities.filter(v => v.severity === 'BAJO').length
        };
    }

    /**
     * ⚠️ Agregar vulnerabilidad detectada
     */
    addVulnerability(severity, code, title, description, recommendation) {
        const severityInfo = this.SEVERITY[severity];
        this.score += severityInfo.points;
        
        const vulnerability = {
            severity: severityInfo.name,
            color: severityInfo.color,
            code,
            title,
            description,
            recommendation,
            timestamp: new Date().toISOString()
        };
        
        this.vulnerabilities.push(vulnerability);
        
        console.log(`${severityInfo.color} [${severityInfo.name}] ${code}: ${title}`);
        console.log(`   ${description}`);
        console.log(`   💡 ${recommendation}\n`);
    }

    /**
     * 📄 Generar reporte de seguridad
     */
    async generateSecurityReport(results) {
        const reportPath = path.join(__dirname, 'SECURITY-REPORT.md');
        const jsonReportPath = path.join(__dirname, 'security-report.json');

        const report = `# 🔒 REPORTE DE SEGURIDAD POST-CUÁNTICA

**Fecha de análisis:** ${new Date().toLocaleString('es')}  
**Sistema:** Generador de Certificados Post-Cuánticos  
**Versión:** 1.0.0

---

## 📊 RESUMEN EJECUTIVO

### Puntuación General de Seguridad

\`\`\`
┌─────────────────────────────────────────┐
│  ${results.overall.color} PUNTUACIÓN: ${results.overall.score}/100         │
│  📈 CALIFICACIÓN: ${results.overall.rating.padEnd(20)}│
└─────────────────────────────────────────┘
\`\`\`

### Vulnerabilidades Detectadas

| Severidad | Cantidad |
|-----------|----------|
| 🔴 CRÍTICO | ${results.overall.criticalVulnerabilities} |
| 🟠 ALTO    | ${results.overall.highVulnerabilities} |
| 🟡 MEDIO   | ${results.overall.mediumVulnerabilities} |
| 🟢 BAJO    | ${results.overall.lowVulnerabilities} |
| **TOTAL**  | **${results.overall.totalVulnerabilities}** |

---

## 🏛️ ANÁLISIS DE AUTORIDAD CERTIFICADORA

**Estado:** ${results.ca.exists ? '✅ Presente' : '❌ No encontrada'}  
**Validez:** ${results.ca.valid ? '✅ Válida' : '❌ No válida'}  
**Fortaleza de clave RSA:** ${results.ca.keyStrength ? results.ca.keyStrength + ' bits' : 'N/A'}  
**Claves Dilithium:** ${results.ca.dilithiumPresent ? '✅ Presentes' : '❌ No encontradas'}  
**Fecha de expiración:** ${results.ca.expirationDate ? new Date(results.ca.expirationDate).toLocaleDateString('es') : 'N/A'}  
**Días restantes:** ${results.ca.daysUntilExpiration || 'N/A'}

---

## 📧 ANÁLISIS DE CERTIFICADOS DE USUARIO

**Total certificados:** ${results.certificates.totalCertificates}  
**Certificados válidos:** ${results.certificates.validCertificates}  
**Certificados expirados:** ${results.certificates.expiredCertificates}  
**Certificados con claves débiles:** ${results.certificates.weakKeys}

---

## 🔐 ANÁLISIS CRIPTOGRÁFICO

**Test de aleatoriedad:** ${results.cryptography.randomness.passed ? '✅ PASÓ' : '❌ FALLÓ'}  
**Chi-cuadrado:** ${results.cryptography.randomness.chiSquare.toFixed(2)} (umbral: ${results.cryptography.randomness.threshold})

**Test de entropía:** ${results.cryptography.entropy.passed ? '✅ PASÓ' : '❌ FALLÓ'}  
**Entropía medida:** ${results.cryptography.entropy.entropy.toFixed(2)} bits (máximo: ${results.cryptography.entropy.maxEntropy})

---

## 🛡️ PREPARACIÓN POST-CUÁNTICA

**Puntuación:** ${results.postQuantum.readinessScore}/100

- Dilithium implementado: ${results.postQuantum.dilithiumImplemented ? '✅' : '❌'}
- Modo híbrido activo: ${results.postQuantum.hybridMode ? '✅' : '❌'}

**Evaluación:**
${results.postQuantum.readinessScore >= 80 ? '✅ Sistema BIEN preparado para amenazas cuánticas' :
  results.postQuantum.readinessScore >= 50 ? '⚠️  Sistema PARCIALMENTE preparado' :
  '❌ Sistema NO preparado para amenazas cuánticas'}

---

## 📦 ANÁLISIS DE ARCHIVOS PKCS#12

**Total archivos:** ${results.pkcs12.totalP12Files}  
**Archivos protegidos:** ${results.pkcs12.protectedFiles}  
**Archivos sin protección:** ${results.pkcs12.totalP12Files - results.pkcs12.protectedFiles}

---

## 🔄 ANÁLISIS DE CIFRADO HÍBRIDO

**Archivos híbridos encontrados:** ${results.hybridEncryption.hybridFilesFound}  
**Archivos híbridos válidos:** ${results.hybridEncryption.validHybridFiles}

${results.hybridEncryption.hybridFilesFound > 0 ? 
  `✅ El sistema está utilizando cifrado híbrido activo (RSA + Dilithium)` :
  `⚠️  No se encontraron archivos con cifrado híbrido. Generar nuevos certificados para activar protección dual.`}

---

## ⚠️ VULNERABILIDADES DETALLADAS

${this.vulnerabilities.length > 0 ? this.vulnerabilities.map((v, i) => `
### ${i + 1}. ${v.color} [${v.severity}] ${v.code}: ${v.title}

**Descripción:** ${v.description}

**Recomendación:** 💡 ${v.recommendation}

---
`).join('') : '✅ No se detectaron vulnerabilidades'}

---

## 🎯 RECOMENDACIONES PRIORITARIAS

${this.generatePriorityRecommendations(results)}

---

## 📝 CONCLUSIONES

${this.generateConclusions(results)}

---

**Reporte generado automáticamente por el Analizador de Seguridad Post-Cuántica**  
**Proyecto de Ejemplo**
`;

        // Guardar reporte Markdown
        fs.writeFileSync(reportPath, report, 'utf8');
        console.log(`✅ Reporte Markdown guardado: ${reportPath}`);

        // Guardar reporte JSON
        fs.writeFileSync(jsonReportPath, JSON.stringify(results, null, 2), 'utf8');
        console.log(`✅ Reporte JSON guardado: ${jsonReportPath}`);

        return reportPath;
    }

    /**
     * 🎯 Generar recomendaciones prioritarias
     */
    generatePriorityRecommendations(results) {
        const recommendations = [];

        if (results.overall.criticalVulnerabilities > 0) {
            recommendations.push('🔴 **URGENTE:** Resolver inmediatamente las vulnerabilidades críticas detectadas.');
        }

        if (!results.ca.exists) {
            recommendations.push('🔴 **URGENTE:** Generar una Autoridad Certificadora antes de emitir certificados.');
        }

        if (results.ca.keyStrength && results.ca.keyStrength < 4096) {
            recommendations.push('🟠 **IMPORTANTE:** Actualizar la CA a RSA-4096 para máxima seguridad.');
        }

        if (!results.ca.dilithiumPresent) {
            recommendations.push('🟠 **IMPORTANTE:** Implementar claves Dilithium para resistencia cuántica.');
        }

        if (results.postQuantum.readinessScore < 50) {
            recommendations.push('🟠 **IMPORTANTE:** Mejorar preparación post-cuántica del sistema.');
        }

        if (results.pkcs12.totalP12Files > results.pkcs12.protectedFiles) {
            recommendations.push('🟡 **RECOMENDADO:** Proteger todos los archivos PKCS#12 con contraseñas robustas.');
        }

        if (results.hybridEncryption.hybridFilesFound === 0) {
            recommendations.push('🟡 **RECOMENDADO:** Generar certificados con cifrado híbrido para protección dual.');
        }

        if (recommendations.length === 0) {
            recommendations.push('✅ **EXCELENTE:** El sistema cumple con los estándares de seguridad recomendados.');
        }

        return recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n');
    }

    /**
     * 📝 Generar conclusiones
     */
    generateConclusions(results) {
        let conclusion = '';

        if (results.overall.score >= 90) {
            conclusion = `El sistema de certificados post-cuánticos presenta una **excelente postura de seguridad**. ` +
                        `La implementación cumple con los estándares internacionales y está preparada para amenazas cuánticas. ` +
                        `Se recomienda mantener actualizaciones regulares y monitoreo continuo.`;
        } else if (results.overall.score >= 75) {
            conclusion = `El sistema presenta una **buena postura de seguridad**, con algunas áreas de mejora identificadas. ` +
                        `Se recomienda atender las vulnerabilidades de severidad media y alta en el corto plazo. ` +
                        `El sistema está parcialmente preparado para amenazas cuánticas.`;
        } else if (results.overall.score >= 50) {
            conclusion = `El sistema presenta **deficiencias de seguridad** que requieren atención. ` +
                        `Es necesario implementar las recomendaciones prioritarias antes de usar en producción. ` +
                        `La preparación para amenazas cuánticas es insuficiente.`;
        } else {
            conclusion = `⚠️ **ADVERTENCIA CRÍTICA:** El sistema presenta **vulnerabilidades graves** que comprometen la seguridad. ` +
                        `**NO se recomienda usar en producción** hasta resolver las vulnerabilidades críticas. ` +
                        `Se requiere una revisión completa de la infraestructura de certificados.`;
        }

        return conclusion;
    }
}

// Exportar la clase
module.exports = PostQuantumSecurityAnalyzer;

// Si se ejecuta directamente
if (require.main === module) {
    const appPath = path.join(__dirname, '..');
    const caPath = path.join(appPath, 'pqc-ca');
    const userCertsPath = path.join(appPath, 'user-certificates');

    const analyzer = new PostQuantumSecurityAnalyzer(caPath, userCertsPath);
    
    analyzer.runFullSecurityAnalysis()
        .then(results => {
            console.log('\n' + '='.repeat(80));
            console.log(`🎯 ANÁLISIS COMPLETO - Puntuación final: ${results.overall.score}/100`);
            console.log(`📊 Calificación: ${results.overall.color} ${results.overall.rating}`);
            console.log('='.repeat(80) + '\n');
            
            process.exit(results.overall.score >= 50 ? 0 : 1);
        })
        .catch(error => {
            console.error('❌ Error ejecutando análisis:', error);
            process.exit(1);
        });
}
