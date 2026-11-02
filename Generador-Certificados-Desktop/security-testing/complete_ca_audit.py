#!/usr/bin/env python3
"""
=============================================================================
AUDITORÍA COMPLETA DE SEGURIDAD DE CERTIFICADOS CA
=============================================================================
Analiza CUALQUIER certificado CA (.crt, .pem, .cer) que coloques en esta carpeta
Detecta vulnerabilidades, debilidades y problemas de configuración

VERSIÓN: 2.0 - Análisis exhaustivo
AUTOR: Sistema de Auditoría
=============================================================================
"""

import os
import sys
import json
import time
import hashlib
import datetime
from pathlib import Path
from cryptography import x509
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, ec, dsa

class CompleteCAAudit:
    def __init__(self):
        self.script_dir = Path(__file__).parent.absolute()
        self.certificates = []
        self.vulnerabilities = []
        self.warnings = []
        self.info = []
        
    def find_certificates(self):
        """Buscar todos los certificados en la carpeta actual"""
        print(f"\n{'='*70}")
        print(f"🔍 BUSCANDO CERTIFICADOS EN: {self.script_dir}")
        print(f"{'='*70}")
        
        extensions = ['.crt', '.pem', '.cer', '.cert']
        found_files = []
        
        for ext in extensions:
            files = list(self.script_dir.glob(f"*{ext}"))
            found_files.extend(files)
            
        if not found_files:
            print(f"\n❌ NO SE ENCONTRARON CERTIFICADOS")
            print(f"\n💡 INSTRUCCIONES:")
            print(f"   1. Coloque sus certificados CA en esta carpeta:")
            print(f"      {self.script_dir}")
            print(f"   2. Formatos aceptados: .crt, .pem, .cer, .cert")
            print(f"   3. Ejecute nuevamente este script")
            return []
            
        print(f"\n✅ ENCONTRADOS {len(found_files)} CERTIFICADO(S):")
        for i, cert_file in enumerate(found_files, 1):
            print(f"   [{i}] {cert_file.name}")
            
        return found_files
        
    def load_certificate(self, cert_path):
        """Cargar y parsear certificado"""
        try:
            with open(cert_path, 'rb') as f:
                cert_data = f.read()
                
            # Intentar parsear como PEM
            try:
                cert = x509.load_pem_x509_certificate(cert_data, default_backend())
                return cert, 'PEM'
            except:
                pass
                
            # Intentar parsear como DER
            try:
                cert = x509.load_der_x509_certificate(cert_data, default_backend())
                return cert, 'DER'
            except:
                pass
                
            return None, None
            
        except Exception as e:
            print(f"   ❌ Error cargando {cert_path.name}: {e}")
            return None, None
            
    def analyze_certificate(self, cert_path):
        """Análisis completo de un certificado"""
        print(f"\n{'='*70}")
        print(f"📋 ANALIZANDO: {cert_path.name}")
        print(f"{'='*70}")
        
        cert, cert_format = self.load_certificate(cert_path)
        
        if not cert:
            print(f"❌ No se pudo parsear el certificado")
            return
            
        print(f"✅ Formato: {cert_format}")
        
        # Análisis detallado
        self.analyze_basic_info(cert, cert_path)
        self.analyze_key_strength(cert, cert_path)
        self.analyze_signature_algorithm(cert, cert_path)
        self.analyze_validity_period(cert, cert_path)
        self.analyze_extensions(cert, cert_path)
        self.analyze_subject_alternative_names(cert, cert_path)
        self.analyze_cryptographic_weaknesses(cert, cert_path)
        self.analyze_known_vulnerabilities(cert, cert_path)
        
    def analyze_basic_info(self, cert, cert_path):
        """Análisis de información básica"""
        print(f"\n📊 INFORMACIÓN BÁSICA:")
        print(f"{'─'*70}")
        
        # Subject
        subject = cert.subject
        print(f"   Emisor (Subject):")
        for attr in subject:
            print(f"      • {attr.oid._name}: {attr.value}")
            
        # Issuer
        issuer = cert.issuer
        print(f"\n   Autoridad Emisora (Issuer):")
        for attr in issuer:
            print(f"      • {attr.oid._name}: {attr.value}")
            
        # Número de serie
        serial = cert.serial_number
        serial_hex = hex(serial)[2:].upper()
        print(f"\n   Número de Serie: {serial_hex}")
        
        # Verificar si es auto-firmado
        is_self_signed = subject == issuer
        if is_self_signed:
            print(f"   🔐 Certificado: AUTO-FIRMADO (Root CA)")
        else:
            print(f"   🔗 Certificado: FIRMADO POR TERCERO (Intermediate/End Entity)")
            
    def analyze_key_strength(self, cert, cert_path):
        """Análisis de fortaleza de clave"""
        print(f"\n🔑 ANÁLISIS DE CLAVE PÚBLICA:")
        print(f"{'─'*70}")
        
        public_key = cert.public_key()
        
        if isinstance(public_key, rsa.RSAPublicKey):
            key_size = public_key.key_size
            print(f"   Algoritmo: RSA")
            print(f"   Tamaño: {key_size} bits")
            
            # Evaluar seguridad
            if key_size < 2048:
                self.vulnerabilities.append({
                    'cert': cert_path.name,
                    'severity': 'CRÍTICA',
                    'category': 'CRIPTOGRAFÍA',
                    'issue': f'Clave RSA demasiado pequeña: {key_size} bits',
                    'impact': 'Vulnerable a factorización, compromiso total posible',
                    'recommendation': 'Regenerar con RSA-4096 o superior'
                })
                print(f"   🚨 CRÍTICO: Clave RSA-{key_size} es INSEGURA")
                
            elif key_size < 4096:
                self.warnings.append({
                    'cert': cert_path.name,
                    'severity': 'MEDIA',
                    'issue': f'Clave RSA-{key_size} aceptable pero no óptima',
                    'recommendation': 'Considerar RSA-4096 o superior para máxima seguridad'
                })
                print(f"   ⚠️  ADVERTENCIA: RSA-{key_size} es aceptable pero RSA-4096+ es mejor")
                
            elif key_size >= 8192:
                print(f"   ✅ EXCELENTE: RSA-{key_size} máxima seguridad")
                
            else:
                print(f"   ✅ BUENO: RSA-{key_size} seguro")
                
            # Analizar exponente público
            public_numbers = public_key.public_numbers()
            e = public_numbers.e
            print(f"   Exponente público (e): {e}")
            
            if e < 65537:
                self.vulnerabilities.append({
                    'cert': cert_path.name,
                    'severity': 'ALTA',
                    'category': 'CRIPTOGRAFÍA',
                    'issue': f'Exponente público débil: {e}',
                    'impact': 'Vulnerable a ataques específicos',
                    'recommendation': 'Usar e = 65537 (estándar)'
                })
                print(f"   🚨 Exponente público débil (debería ser 65537)")
                
        elif isinstance(public_key, ec.EllipticCurvePublicKey):
            curve = public_key.curve
            print(f"   Algoritmo: ECC (Curva Elíptica)")
            print(f"   Curva: {curve.name}")
            
            # Evaluar curvas
            weak_curves = ['secp192r1', 'secp224r1', 'sect163k1']
            if curve.name in weak_curves:
                self.vulnerabilities.append({
                    'cert': cert_path.name,
                    'severity': 'ALTA',
                    'category': 'CRIPTOGRAFÍA',
                    'issue': f'Curva elíptica débil: {curve.name}',
                    'impact': 'Vulnerable a ataques',
                    'recommendation': 'Usar P-256, P-384 o P-521'
                })
                print(f"   🚨 Curva débil: {curve.name}")
            else:
                print(f"   ✅ Curva apropiada")
                
        elif isinstance(public_key, dsa.DSAPublicKey):
            key_size = public_key.key_size
            print(f"   Algoritmo: DSA")
            print(f"   Tamaño: {key_size} bits")
            
            self.warnings.append({
                'cert': cert_path.name,
                'severity': 'MEDIA',
                'issue': 'DSA está deprecado',
                'recommendation': 'Migrar a RSA o ECC'
            })
            print(f"   ⚠️  DSA está deprecado, considerar RSA o ECC")
            
        else:
            print(f"   ❓ Algoritmo desconocido: {type(public_key)}")
            
    def analyze_signature_algorithm(self, cert, cert_path):
        """Análisis del algoritmo de firma"""
        print(f"\n✍️  ANÁLISIS DE FIRMA:")
        print(f"{'─'*70}")
        
        sig_alg = cert.signature_algorithm_oid._name
        print(f"   Algoritmo: {sig_alg}")
        
        # Detectar algoritmos débiles o comprometidos
        weak_algorithms = {
            'md5': 'CRÍTICA - MD5 está COMPLETAMENTE ROTO',
            'sha1': 'CRÍTICA - SHA-1 está COMPROMETIDO',
            'sha224': 'ALTA - SHA-224 no recomendado',
        }
        
        for weak_alg, severity_msg in weak_algorithms.items():
            if weak_alg.lower() in sig_alg.lower():
                self.vulnerabilities.append({
                    'cert': cert_path.name,
                    'severity': 'CRÍTICA' if 'CRÍTICA' in severity_msg else 'ALTA',
                    'category': 'ALGORITMO COMPROMETIDO',
                    'issue': f'Algoritmo de firma inseguro: {sig_alg}',
                    'impact': severity_msg,
                    'recommendation': 'Regenerar con SHA-256, SHA-384 o SHA-512'
                })
                print(f"   🚨 {severity_msg}")
                return
                
        # Algoritmos seguros
        if 'sha256' in sig_alg.lower():
            print(f"   ✅ SHA-256 es seguro (estándar actual)")
        elif 'sha384' in sig_alg.lower():
            print(f"   ✅ SHA-384 es muy seguro")
        elif 'sha512' in sig_alg.lower():
            print(f"   ✅ SHA-512 es máxima seguridad")
        elif 'sha3' in sig_alg.lower():
            print(f"   ✅ SHA-3 es seguro (última generación)")
        else:
            print(f"   ❓ Algoritmo no reconocido")
            
    def analyze_validity_period(self, cert, cert_path):
        """Análisis de período de validez"""
        print(f"\n📅 PERÍODO DE VALIDEZ:")
        print(f"{'─'*70}")
        
        not_before = cert.not_valid_before
        not_after = cert.not_valid_after
        now = datetime.datetime.now()
        
        print(f"   Válido desde: {not_before}")
        print(f"   Válido hasta: {not_after}")
        
        # Calcular duración
        duration = not_after - not_before
        days = duration.days
        years = days / 365.25
        
        print(f"   Duración: {days} días ({years:.1f} años)")
        
        # Verificar estado actual
        if now < not_before:
            self.vulnerabilities.append({
                'cert': cert_path.name,
                'severity': 'ALTA',
                'category': 'VALIDEZ',
                'issue': 'Certificado AÚN NO VÁLIDO',
                'impact': 'No puede ser usado actualmente',
                'recommendation': 'Verificar fecha del sistema o regenerar'
            })
            print(f"   🚨 Certificado AÚN NO VÁLIDO")
            
        elif now > not_after:
            self.vulnerabilities.append({
                'cert': cert_path.name,
                'severity': 'CRÍTICA',
                'category': 'VALIDEZ',
                'issue': 'Certificado EXPIRADO',
                'impact': 'Certificado inválido, no debe ser usado',
                'recommendation': 'Regenerar inmediatamente'
            })
            print(f"   🚨 CRÍTICO: Certificado EXPIRADO")
            
        else:
            remaining = not_after - now
            remaining_days = remaining.days
            print(f"   ✅ Certificado VÁLIDO")
            print(f"   ⏳ Tiempo restante: {remaining_days} días")
            
            # Advertencia si está cerca de expirar
            if remaining_days < 30:
                self.warnings.append({
                    'cert': cert_path.name,
                    'severity': 'ALTA',
                    'issue': f'Certificado expira en {remaining_days} días',
                    'recommendation': 'Renovar pronto'
                })
                print(f"   ⚠️  URGENTE: Expira en {remaining_days} días")
            elif remaining_days < 90:
                self.warnings.append({
                    'cert': cert_path.name,
                    'severity': 'MEDIA',
                    'issue': f'Certificado expira en {remaining_days} días',
                    'recommendation': 'Planificar renovación'
                })
                print(f"   ⚠️  ATENCIÓN: Expira en {remaining_days} días")
                
        # Evaluar duración total
        if days > 825:  # Más de ~2.26 años
            self.warnings.append({
                'cert': cert_path.name,
                'severity': 'BAJA',
                'issue': f'Período de validez muy largo: {years:.1f} años',
                'recommendation': 'Considerar renovaciones más frecuentes (max 2 años)'
            })
            print(f"   ⚠️  Validez muy larga ({years:.1f} años), considerar max 2 años")
            
    def analyze_extensions(self, cert, cert_path):
        """Análisis de extensiones X.509"""
        print(f"\n🔧 EXTENSIONES X.509:")
        print(f"{'─'*70}")
        
        try:
            extensions = cert.extensions
            print(f"   Total de extensiones: {len(extensions)}")
            
            # Basic Constraints
            try:
                basic_constraints = cert.extensions.get_extension_for_oid(
                    x509.oid.ExtensionOID.BASIC_CONSTRAINTS
                ).value
                
                print(f"\n   • Basic Constraints:")
                print(f"      CA: {basic_constraints.ca}")
                
                if basic_constraints.ca:
                    print(f"      ✅ Marcado como CA")
                    if basic_constraints.path_length is not None:
                        print(f"      Path Length: {basic_constraints.path_length}")
                else:
                    self.warnings.append({
                        'cert': cert_path.name,
                        'severity': 'MEDIA',
                        'issue': 'No marcado como CA',
                        'recommendation': 'Verificar si debería ser una CA'
                    })
                    print(f"      ⚠️  NO marcado como CA")
                    
            except x509.ExtensionNotFound:
                self.vulnerabilities.append({
                    'cert': cert_path.name,
                    'severity': 'ALTA',
                    'category': 'CONFIGURACIÓN',
                    'issue': 'Falta extensión Basic Constraints',
                    'impact': 'No se puede determinar si es CA',
                    'recommendation': 'Agregar extensión Basic Constraints'
                })
                print(f"   🚨 FALTA: Basic Constraints")
                
            # Key Usage
            try:
                key_usage = cert.extensions.get_extension_for_oid(
                    x509.oid.ExtensionOID.KEY_USAGE
                ).value
                
                print(f"\n   • Key Usage:")
                if key_usage.digital_signature:
                    print(f"      ✅ Digital Signature")
                if key_usage.key_cert_sign:
                    print(f"      ✅ Certificate Signing")
                if key_usage.crl_sign:
                    print(f"      ✅ CRL Signing")
                if key_usage.key_encipherment:
                    print(f"      • Key Encipherment")
                if key_usage.data_encipherment:
                    print(f"      • Data Encipherment")
                    
            except x509.ExtensionNotFound:
                self.warnings.append({
                    'cert': cert_path.name,
                    'severity': 'MEDIA',
                    'issue': 'Falta extensión Key Usage',
                    'recommendation': 'Agregar Key Usage apropiado'
                })
                print(f"   ⚠️  FALTA: Key Usage")
                
            # Subject Key Identifier
            try:
                ski = cert.extensions.get_extension_for_oid(
                    x509.oid.ExtensionOID.SUBJECT_KEY_IDENTIFIER
                ).value
                print(f"\n   • Subject Key Identifier: ✅ Presente")
            except x509.ExtensionNotFound:
                print(f"\n   • Subject Key Identifier: ⚠️  Falta (recomendado)")
                
            # Authority Key Identifier
            try:
                aki = cert.extensions.get_extension_for_oid(
                    x509.oid.ExtensionOID.AUTHORITY_KEY_IDENTIFIER
                ).value
                print(f"   • Authority Key Identifier: ✅ Presente")
            except x509.ExtensionNotFound:
                print(f"   • Authority Key Identifier: ⚠️  Falta (recomendado)")
                
        except Exception as e:
            print(f"   ❓ Error analizando extensiones: {e}")
            
    def analyze_subject_alternative_names(self, cert, cert_path):
        """Análisis de Subject Alternative Names"""
        try:
            san = cert.extensions.get_extension_for_oid(
                x509.oid.ExtensionOID.SUBJECT_ALTERNATIVE_NAME
            ).value
            
            print(f"\n🌐 SUBJECT ALTERNATIVE NAMES (SAN):")
            print(f"{'─'*70}")
            
            dns_names = san.get_values_for_type(x509.DNSName)
            if dns_names:
                print(f"   DNS Names:")
                for name in dns_names:
                    print(f"      • {name}")
                    
            email_addresses = san.get_values_for_type(x509.RFC822Name)
            if email_addresses:
                print(f"   Email Addresses:")
                for email in email_addresses:
                    print(f"      • {email}")
                    
        except x509.ExtensionNotFound:
            pass  # SAN no es obligatorio para CAs
            
    def analyze_cryptographic_weaknesses(self, cert, cert_path):
        """Análisis de debilidades criptográficas conocidas"""
        print(f"\n🔬 ANÁLISIS CRIPTOGRÁFICO AVANZADO:")
        print(f"{'─'*70}")
        
        # Calcular fingerprints con diferentes algoritmos
        cert_der = cert.public_bytes(serialization.Encoding.DER)
        
        sha1_fp = hashlib.sha1(cert_der).hexdigest()
        sha256_fp = hashlib.sha256(cert_der).hexdigest()
        sha512_fp = hashlib.sha512(cert_der).hexdigest()
        
        print(f"   Fingerprints:")
        print(f"      SHA-1:   {sha1_fp[:32]}...")
        print(f"      SHA-256: {sha256_fp[:32]}...")
        print(f"      SHA-512: {sha512_fp[:32]}...")
        
        # Analizar entropía del número de serie
        serial_bytes = cert.serial_number.to_bytes((cert.serial_number.bit_length() + 7) // 8, 'big')
        serial_entropy = self.calculate_entropy(serial_bytes)
        
        print(f"\n   Entropía del número de serie: {serial_entropy:.2f} bits/byte")
        
        if serial_entropy < 7.0:
            self.warnings.append({
                'cert': cert_path.name,
                'severity': 'MEDIA',
                'issue': f'Baja entropía en número de serie: {serial_entropy:.2f}',
                'recommendation': 'Usar generador criptográfico fuerte para números de serie'
            })
            print(f"   ⚠️  Baja entropía (debería ser > 7.5)")
        else:
            print(f"   ✅ Entropía apropiada")
            
    def calculate_entropy(self, data):
        """Calcular entropía de Shannon"""
        import math
        if not data:
            return 0
            
        entropy = 0
        for x in range(256):
            p_x = float(data.count(x)) / len(data)
            if p_x > 0:
                entropy += - p_x * math.log2(p_x)
                
        return entropy
        
    def analyze_known_vulnerabilities(self, cert, cert_path):
        """Análisis de vulnerabilidades conocidas"""
        print(f"\n🛡️  VULNERABILIDADES CONOCIDAS:")
        print(f"{'─'*70}")
        
        issues_found = 0
        
        # ROBOT Attack (RSA)
        public_key = cert.public_key()
        if isinstance(public_key, rsa.RSAPublicKey):
            if public_key.key_size < 2048:
                issues_found += 1
                print(f"   🚨 Vulnerable a ROBOT Attack (RSA < 2048)")
                
        # POODLE, BEAST, etc. (verificar en algoritmo de firma)
        sig_alg = cert.signature_algorithm_oid._name.lower()
        if 'sha1' in sig_alg:
            issues_found += 1
            print(f"   🚨 Vulnerable a colisiones SHA-1")
            
        if issues_found == 0:
            print(f"   ✅ No se detectaron vulnerabilidades conocidas específicas")
            
    def generate_final_report(self):
        """Generar reporte final consolidado"""
        print(f"\n{'='*70}")
        print(f"📊 REPORTE FINAL DE AUDITORÍA")
        print(f"{'='*70}")
        
        total_vulns = len(self.vulnerabilities)
        total_warns = len(self.warnings)
        
        critical = sum(1 for v in self.vulnerabilities if v.get('severity') == 'CRÍTICA')
        high = sum(1 for v in self.vulnerabilities if v.get('severity') == 'ALTA')
        medium = sum(1 for v in self.vulnerabilities if v.get('severity') == 'MEDIA')
        
        print(f"\n📈 ESTADÍSTICAS:")
        print(f"   Certificados analizados: {len(self.certificates)}")
        print(f"   🚨 Vulnerabilidades críticas: {critical}")
        print(f"   🔴 Vulnerabilidades altas: {high}")
        print(f"   🟡 Vulnerabilidades medias: {medium}")
        print(f"   ⚠️  Advertencias: {total_warns}")
        
        # Determinar nivel de seguridad
        if critical > 0:
            security_level = "CRÍTICO - NO USAR EN PRODUCCIÓN"
            security_emoji = "🚨"
        elif high > 0:
            security_level = "INSEGURO - REQUIERE CORRECCIONES"
            security_emoji = "🔴"
        elif medium > 0:
            security_level = "ACEPTABLE - MEJORABLE"
            security_emoji = "🟡"
        elif total_warns > 0:
            security_level = "BUENO - ALGUNAS RECOMENDACIONES"
            security_emoji = "🟢"
        else:
            security_level = "EXCELENTE"
            security_emoji = "✅"
            
        print(f"\n{security_emoji} NIVEL DE SEGURIDAD: {security_level}")
        
        # Listar vulnerabilidades críticas
        if critical > 0:
            print(f"\n🚨 VULNERABILIDADES CRÍTICAS:")
            for vuln in self.vulnerabilities:
                if vuln.get('severity') == 'CRÍTICA':
                    print(f"\n   • {vuln['cert']}")
                    print(f"     Problema: {vuln['issue']}")
                    print(f"     Impacto: {vuln.get('impact', 'No especificado')}")
                    print(f"     Recomendación: {vuln['recommendation']}")
                    
        # Guardar reporte JSON
        report_data = {
            'timestamp': datetime.datetime.now().isoformat(),
            'certificates_analyzed': len(self.certificates),
            'summary': {
                'critical': critical,
                'high': high,
                'medium': medium,
                'warnings': total_warns,
                'security_level': security_level
            },
            'vulnerabilities': self.vulnerabilities,
            'warnings': self.warnings
        }
        
        report_file = self.script_dir / 'audit_report.json'
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)
            
        print(f"\n📄 Reporte detallado guardado en: {report_file}")
        
        # Recomendaciones finales
        print(f"\n💡 RECOMENDACIONES PRIORITARIAS:")
        if critical > 0:
            print(f"   1. 🚨 NO USAR estos certificados en producción")
            print(f"   2. 🔐 Regenerar con parámetros seguros mínimos:")
            print(f"      - RSA-4096 bits o superior")
            print(f"      - SHA-256 o superior")
            print(f"      - Validez máxima 2 años")
            print(f"   3. 🔍 Revisar todos los certificados emitidos")
        elif high > 0:
            print(f"   1. 🔴 Corregir vulnerabilidades altas urgentemente")
            print(f"   2. 🔄 Planificar migración a configuración más segura")
            print(f"   3. 📊 Realizar auditorías regulares")
        else:
            print(f"   1. ✅ Mantener buenas prácticas actuales")
            print(f"   2. 🔄 Renovar antes de expiración")
            print(f"   3. 📊 Auditorías periódicas recomendadas")
            
    def run_audit(self):
        """Ejecutar auditoría completa"""
        print(f"\n{'#'*70}")
        print(f"{'#'*70}")
        print(f"###   AUDITORÍA COMPLETA DE SEGURIDAD DE CERTIFICADOS CA   ###")
        print(f"{'#'*70}")
        print(f"{'#'*70}")
        
        # Buscar certificados
        cert_files = self.find_certificates()
        
        if not cert_files:
            return
            
        # Analizar cada certificado
        for cert_file in cert_files:
            self.certificates.append(cert_file)
            self.analyze_certificate(cert_file)
            
        # Generar reporte final
        self.generate_final_report()

def main():
    print("\n" + "="*70)
    print(" SISTEMA DE AUDITORÍA DE CERTIFICADOS CA")
    print("="*70)
    print("\nAnalizando TODOS los certificados (.crt, .pem, .cer)")
    print("en la carpeta actual...\n")
    
    auditor = CompleteCAAudit()
    auditor.run_audit()
    
    print(f"\n{'='*70}")
    print("✅ AUDITORÍA COMPLETADA")
    print(f"{'='*70}\n")

if __name__ == "__main__":
    main()
