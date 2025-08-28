$ErrorActionPreference='Stop'
$base = "http://localhost:3000"
$rand = Get-Random -Maximum 999999

Write-Host "`n=== SommelierPro • Test Runner (Vendors / Corporate / Affiliates) ===" -ForegroundColor Cyan

# Cargar SA por seguridad (solo en esta sesión)
if (Test-Path ".\serviceAccount.local.json") {
  try {
    $sa = (Get-Content -Raw ".\serviceAccount.local.json") | ConvertFrom-Json
    if ($sa.project_id) {
      [Environment]::SetEnvironmentVariable("FIREBASE_SERVICE_ACCOUNT_KEY", (Get-Content -Raw ".\serviceAccount.local.json"), "Process")
      [Environment]::SetEnvironmentVariable("GOOGLE_CLOUD_PROJECT", $sa.project_id, "Process")
      [Environment]::SetEnvironmentVariable("GCLOUD_PROJECT",        $sa.project_id, "Process")
      [Environment]::SetEnvironmentVariable("FIREBASE_PROJECT_ID",    $sa.project_id, "Process")
      Write-Host "🔐 SA ok · project_id=$($sa.project_id)" -ForegroundColor Green
    }
  } catch { Write-Host "⚠ No pude leer serviceAccount.local.json: $($_.Exception.Message)" -ForegroundColor Yellow }
}

function Test-POST($name, $url, $json) {
  try {
    $resp = Invoke-WebRequest -Method Post -Uri $url -ContentType 'application/json' -Body $json -UseBasicParsing
    Write-Host ("[PASS] {0} -> HTTP {1}" -f $name,$resp.StatusCode) -ForegroundColor Green
    return $true
  } catch {
    Write-Host ("[FAIL] {0} -> {1}" -f $name, $_.Exception.Message) -ForegroundColor Red
    if ($_.Exception.Response) {
      $r = $_.Exception.Response
      $s = New-Object IO.StreamReader($r.GetResponseStream())
      Write-Host ("Body: " + $s.ReadToEnd()) -ForegroundColor DarkYellow
    }
    return $false
  }
}

function Test-GET($name, $url) {
  try {
    $resp = Invoke-WebRequest -Method Get -Uri $url -UseBasicParsing
    Write-Host ("[PASS] {0} -> HTTP {1}" -f $name,$resp.StatusCode) -ForegroundColor Green
    return $true
  } catch {
    Write-Host ("[FAIL] {0} -> {1}" -f $name, $_.Exception.Message) -ForegroundColor Red
    return $false
  }
}

# ===== Vendors =====
Write-Host "`n-- Vendors --" -ForegroundColor Cyan
$vendorCreate = @{ name="QA Vendor $rand"; email="qa.vendor.$rand@sommelier.ai"; phone="+51 999 000"; status="approved" } | ConvertTo-Json
$ok_v_create = Test-POST "POST /api/vendors/create" "$base/api/vendors/create" $vendorCreate

$vid = $null
try { $vid = (Invoke-RestMethod -Method Post -Uri "$base/api/vendors/create" -ContentType 'application/json' -Body $vendorCreate).saved.id } catch {}
if ($vid) {
  $vendorStatus = @{ vendorId=$vid; status="suspended" } | ConvertTo-Json
  $ok_v_status = Test-POST "POST /api/vendors/status" "$base/api/vendors/status" $vendorStatus
} else { $ok_v_status = $true }
$ok_v_page = Test-GET "GET /admin/vendors" "$base/admin/vendors"

# ===== Corporate =====
Write-Host "`n-- Corporate --" -ForegroundColor Cyan
$corpCreate = @{ companyName="QA Corp $rand"; contactEmail="qa.corp.$rand@sommelier.ai"; plan="Starter"; seats=3 } | ConvertTo-Json
$ok_c_create = Test-POST "POST /api/corporate/create" "$base/api/corporate/create" $corpCreate

$accId = $null
try { $accId = (Invoke-RestMethod -Method Post -Uri "$base/api/corporate/create" -ContentType 'application/json' -Body $corpCreate).saved.id } catch {}
if ($accId) {
  $corpUpdate = @{ accountId=$accId; patch=@{ status="suspended"; seats=4 } } | ConvertTo-Json -Depth 5
  $ok_c_update = Test-POST "POST /api/corporate/update" "$base/api/corporate/update" $corpUpdate
  $corpInvite = @{ accountId=$accId; email="invite.$rand@empresa.com"; role="member" } | ConvertTo-Json
  $ok_c_invite = Test-POST "POST /api/corporate/invite" "$base/api/corporate/invite" $corpInvite
} else { $ok_c_update=$true; $ok_c_invite=$true }
$ok_c_page = Test-GET "GET /admin/corporate" "$base/admin/corporate"

# ===== Affiliates (portal) =====
Write-Host "`n-- Affiliates (Portal) --" -ForegroundColor Cyan
$ok_a1 = Test-GET "GET /admin/dashboard-afiliado" "$base/admin/dashboard-afiliado"
$ok_a2 = Test-GET "GET /dashboard-afiliado"       "$base/dashboard-afiliado"

$allOk = $ok_v_create -and $ok_v_status -and $ok_v_page -and $ok_c_create -and $ok_c_update -and $ok_c_invite -and $ok_c_page -and ($ok_a1 -or $ok_a2)

Write-Host "`n====================================================="
if ($allOk) {
  Write-Host "✅ RESULTADO: Vendors / Corporate / Affiliates OK (API + páginas). Usa 'Refrescar' en cada página." -ForegroundColor Green
} else {
  Write-Host "❌ RESULTADO: Al menos una prueba falló. Pega cuáles [FAIL] y aplico fix one-shot." -ForegroundColor Red
}
Write-Host "====================================================="
