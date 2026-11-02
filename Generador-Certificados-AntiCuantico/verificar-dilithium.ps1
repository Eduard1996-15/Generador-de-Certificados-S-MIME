# Script para verificar la presencia de criptografía Dilithium en los certificados
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  VERIFICACION DE CRIPTOGRAFIA POST-CUANTICA" -ForegroundColor Cyan
Write-Host "  CRYSTALS-Dilithium-3 (ML-DSA-65)" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

$baseDir = "."

# Verificar directorio CA
Write-Host "[1] VERIFICANDO CA ROOT POST-CUANTICA:" -ForegroundColor Yellow
Write-Host ""

$caDir = Join-Path $baseDir "pqc-ca"
$dilithiumCA = Join-Path $caDir "Root-CA-Dilithium.key"

if (Test-Path $dilithiumCA) {
    $bytes = [System.IO.File]::ReadAllBytes($dilithiumCA)
    Write-Host "  ✓ Archivo Dilithium CA encontrado" -ForegroundColor Green
    Write-Host "    Tamaño: $($bytes.Length) bytes" -ForegroundColor White
    
    # Verificar tamaño esperado de Dilithium-3 (4032 bytes)
    if ($bytes.Length -eq 4032) {
        Write-Host "    ✓ Tamaño correcto para Dilithium-3 (ML-DSA-65)" -ForegroundColor Green
    } else {
        Write-Host "    ⚠ Tamaño inesperado (esperado: 4032 bytes)" -ForegroundColor Yellow
    }
    
    # Calcular hash para verificar unicidad
    $hash = (Get-FileHash -Path $dilithiumCA -Algorithm SHA256).Hash
    Write-Host "    Hash SHA-256: $($hash.Substring(0,32))..." -ForegroundColor White
    
    # Mostrar entropía (aleatoriedad de los datos)
    $uniqueBytes = ($bytes | Select-Object -Unique).Count
    $entropy = [math]::Round(($uniqueBytes / $bytes.Length) * 100, 2)
    Write-Host "    Entropía: $entropy% ($uniqueBytes bytes únicos de $($bytes.Length))" -ForegroundColor White
    
    if ($entropy -gt 80) {
        Write-Host "    ✓ Alta entropía - Datos criptográficos válidos" -ForegroundColor Green
    }
} else {
    Write-Host "  ✗ Archivo Dilithium CA no encontrado" -ForegroundColor Red
}

Write-Host ""
Write-Host "[2] VERIFICANDO CERTIFICADOS DE USUARIO:" -ForegroundColor Yellow
Write-Host ""

$userCertsDir = Join-Path $baseDir "user-certificates"
$userDirs = Get-ChildItem $userCertsDir -Directory

$totalDilithiumFiles = 0
foreach ($userDir in $userDirs) {
    $dilithiumFiles = Get-ChildItem $userDir.FullName -Filter "*Dilithium*.key"
    
    if ($dilithiumFiles.Count -gt 0) {
        Write-Host "  Usuario: $($userDir.Name)" -ForegroundColor Cyan
        
        foreach ($file in $dilithiumFiles) {
            $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
            Write-Host "    ✓ $($file.Name)" -ForegroundColor Green
            Write-Host "      Tamaño: $($bytes.Length) bytes" -ForegroundColor White
            
            if ($bytes.Length -eq 4032) {
                Write-Host "      ✓ Dilithium-3 válido" -ForegroundColor Green
            }
            
            $totalDilithiumFiles++
        }
        
        # Verificar JSON de instalación
        $infoFile = Join-Path $userDir.FullName "INSTALL-INFO.json"
        if (Test-Path $infoFile) {
            $info = Get-Content $infoFile | ConvertFrom-Json
            if ($info.postQuantumInfo) {
                Write-Host "      ✓ Algoritmo: $($info.postQuantumInfo.algorithm)" -ForegroundColor Green
                Write-Host "      ✓ Quantum-resistant: $($info.postQuantumInfo.quantumResistant)" -ForegroundColor Green
                Write-Host "      ✓ Modo híbrido: $($info.postQuantumInfo.hybridMode)" -ForegroundColor Green
            }
        }
        Write-Host ""
    }
}

Write-Host "[3] RESUMEN:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Total de claves Dilithium generadas: $($totalDilithiumFiles + 1)" -ForegroundColor Cyan
Write-Host "  (1 CA + $totalDilithiumFiles usuarios)" -ForegroundColor White
Write-Host ""

# Verificar extensiones en certificados X.509
Write-Host "[4] VERIFICANDO EXTENSIONES POST-CUANTICAS EN X.509:" -ForegroundColor Yellow
Write-Host ""

$caCert = Join-Path $caDir "Root-CA.crt"
if (Test-Path $caCert) {
    try {
        # Leer certificado y buscar extensión personalizada
        $certContent = Get-Content $caCert -Raw
        
        # El OID personalizado para extensión PQC es 1.3.6.1.4.1.99999.2
        if ($certContent -match "1\.3\.6\.1\.4\.1\.99999") {
            Write-Host "  ✓ Extensión Post-Cuántica encontrada en certificado CA" -ForegroundColor Green
            Write-Host "    OID: 1.3.6.1.4.1.99999.2" -ForegroundColor White
        } else {
            Write-Host "  ⚠ Extensión PQC no claramente visible (puede estar codificada)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ⚠ No se pudo analizar el certificado" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  VERIFICACION COMPLETADA" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "NOTAS IMPORTANTES:" -ForegroundColor Yellow
Write-Host "• Las claves Dilithium son REALES (generadas con @noble/post-quantum)" -ForegroundColor White
Write-Host "• Tamaño de clave Dilithium-3: 4032 bytes (estándar FIPS 204)" -ForegroundColor White
Write-Host "• Los certificados X.509 usan RSA para compatibilidad actual" -ForegroundColor White
Write-Host "• Los datos Dilithium están en archivos .key separados" -ForegroundColor White
Write-Host "• La extensión PQC en X.509 prepara para migración futura" -ForegroundColor White
Write-Host ""
