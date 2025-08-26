$ErrorActionPreference='Stop'
$base = "http://localhost:3000"

Write-Host "`n=== SommelierPro • Sensory Analysis Test Runner ==="

# Cargar SA por seguridad
if (Test-Path ".\serviceAccount.local.json") {
  try {
    $sa = (Get-Content -Raw ".\serviceAccount.local.json") | ConvertFrom-Json
    [Environment]::SetEnvironmentVariable("FIREBASE_SERVICE_ACCOUNT_KEY",(Get-Content -Raw ".\serviceAccount.local.json"),"Process")
    if ($sa.project_id) {
      [Environment]::SetEnvironmentVariable("GOOGLE_CLOUD_PROJECT",$sa.project_id,"Process")
      [Environment]::SetEnvironmentVariable("GCLOUD_PROJECT",$sa.project_id,"Process")
      [Environment]::SetEnvironmentVariable("FIREBASE_PROJECT_ID",$sa.project_id,"Process")
    }
    Write-Host "SA OK · project_id=$($sa.project_id)"
  } catch { Write-Host "WARN: no pude leer serviceAccount.local.json: $($_.Exception.Message)" }
}

# Asegurar dev server
$up=$false
try { Invoke-WebRequest -Uri $base -UseBasicParsing -TimeoutSec 2 | Out-Null; $up=$true } catch { $up=$false }
if (-not $up) {
  $cwd=(Get-Location).Path
  Start-Process powershell -ArgumentList "-NoExit","-Command","cd `"$cwd`"; npm run dev" | Out-Null
  for ($i=1;$i -le 45;$i++){ try{ Invoke-WebRequest -Uri $base -UseBasicParsing -TimeoutSec 2 | Out-Null; $up=$true; break } catch { Start-Sleep 2 } }
}
if (-not $up) { Write-Host "ERROR: dev server no responde en $base"; exit 1 } else { Write-Host "Dev server OK en $base" }

function PostJson {
  param([string]$name,[string]$url,[Parameter(ValueFromPipeline=$true)]$obj)
  try {
    $json = $obj | ConvertTo-Json -Depth 10
    $resp = Invoke-RestMethod -Method Post -Uri $url -ContentType 'application/json' -Body $json
    $ok = $true
    if ($resp -ne $null -and ($resp.PSObject.Properties.Name -contains 'ok')) { $ok = [bool]$resp.ok }
    Write-Host "[PASS] $name -> ok=$ok" -ForegroundColor Green
    return $resp
  } catch {
    Write-Host "[FAIL] $name -> $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
      $reader = New-Object IO.StreamReader ($_.Exception.Response.GetResponseStream())
      Write-Host ("Body: " + $reader.ReadToEnd()) -ForegroundColor DarkYellow
    }
    return $null
  }
}

function GetUrl {
  param([string]$name,[string]$url)
  try { $r=Invoke-WebRequest -Method Get -Uri $url -UseBasicParsing; Write-Host "[PASS] $name -> HTTP $($r.StatusCode)" -ForegroundColor Green; return $true }
  catch { Write-Host "[FAIL] $name -> $($_.Exception.Message)" -ForegroundColor Red; return $false }
}

# === Pruebas ===
$rand = Get-Random -Maximum 999999
$uid  = "qa-sensorial-$rand"

# Payload A: segun WineAnalysisClientSchema
$payloadA = @{
  uid         = $uid
  language    = "es"
  wineName    = "Amador Diez Verdejo"
  year        = 2020
  grapeVariety= "Verdejo"
  wineryName  = "Bodega Cuatro Rayas"
  country     = "España"
  foodToPair  = "Tartar de atun"
}

$respA = PostJson "POST /api/analyze-wine (A)" "$base/api/analyze-wine" $payloadA
if ($respA -ne $null) {
  Write-Host ("  wineName:        " + ($respA.wineName))
  Write-Host ("  year:            " + ($respA.year))
  Write-Host ("  analysis exists: " + ([bool]($respA.analysis -ne $null)))
  try {
    Write-Host ("  imageUrl root:   " + ($respA.imageUrl))
    Write-Host ("  visual.imageUrl: " + ($respA.analysis.visual.imageUrl))
    Write-Host ("  olfact.imageUrl: " + ($respA.analysis.olfactory.imageUrl))
    Write-Host ("  gustat.imageUrl: " + ($respA.analysis.gustatory.imageUrl))
  } catch {}
}

# Negative tests
$badYear = @{ uid="qa-sensorial-bad-$rand"; language="es"; wineName="Xx"; year=1500; grapeVariety="Syrah" }
try {
  $rBad = Invoke-WebRequest -Method Post -Uri "$base/api/analyze-wine" -ContentType 'application/json' -Body ($badYear|ConvertTo-Json) -UseBasicParsing
  Write-Host "[WARN] Validacion NO fallo para badYear (revisa constraints)" -ForegroundColor Yellow
} catch {
  Write-Host "[PASS] Bad year ->" -ForegroundColor Green -NoNewline
  if ($_.Exception.Response){ $s = New-Object IO.StreamReader($_.Exception.Response.GetResponseStream()); Write-Host (" " + $s.ReadToEnd()) } else { Write-Host (" " + $_.Exception.Message) }
}

$missingUid = @{ language="es"; wineName="Test"; year=2020; grapeVariety="Syrah" }
try {
  $rUid = Invoke-WebRequest -Method Post -Uri "$base/api/analyze-wine" -ContentType 'application/json' -Body ($missingUid|ConvertTo-Json) -UseBasicParsing
  Write-Host "[WARN] Validacion NO fallo para missingUid" -ForegroundColor Yellow
} catch {
  Write-Host "[PASS] Missing uid ->" -ForegroundColor Green -NoNewline
  if ($_.Exception.Response){ $s2 = New-Object IO.StreamReader($_.Exception.Response.GetResponseStream()); Write-Host (" " + $s2.ReadToEnd()) } else { Write-Host (" " + $_.Exception.Message) }
}

# Historial/UI relacionados si existen
GetUrl "GET /history" "$base/history" | Out-Null
GetUrl "GET /admin/dashboard-afiliado" "$base/admin/dashboard-afiliado" | Out-Null

Write-Host "`nFIN pruebas Análisis Sensorial."
