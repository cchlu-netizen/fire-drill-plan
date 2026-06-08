param(
  [string]$FilePath = "$PSScriptRoot\..\消防訓練計畫.html"
)

$ErrorActionPreference = "Stop"

# 取得目前 Gist ID
$gistId = "1c837d6668b7f9135d99e4c2fd3db27c"
$fileName = "fire-drill-plan-2026-2027.html"

if (-not (Test-Path $FilePath)) {
  Write-Error "找不到檔案: $FilePath"
  exit 1
}

# 驗證 gh CLI 可用
$ghVersion = gh --version 2>$null
if (-not $ghVersion) {
  Write-Error "請先安裝 GitHub CLI (gh)"
  exit 1
}

Write-Host "🚀 正在複製檔案並部署至 Gist ..." -ForegroundColor Cyan

# 複製到 repo 並更新
Copy-Item $FilePath "$PSScriptRoot\index.html" -Force

# 更新 Gist
$content = Get-Content $FilePath -Raw
$content | gh gist edit $gistId --filename $fileName 2>&1

if ($LASTEXITCODE -eq 0) {
  Write-Host "✅ Gist 更新成功！" -ForegroundColor Green
  Write-Host "   網址: https://gist.github.com/cchlu-netizen/$gistId" -ForegroundColor Cyan
  Write-Host "   線上預覽: https://gist.githack.com/cchlu-netizen/$gistId/raw/$fileName" -ForegroundColor Cyan
  
  # 順便 push 到 GitHub Pages
  Set-Location $PSScriptRoot
  git add index.html
  git commit -m "auto: update fire drill plan $(Get-Date -Format 'yyyy-MM-dd')"
  git push origin main 2>&1
  
  if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ GitHub Pages 同步更新！" -ForegroundColor Green
    Write-Host "   https://cchlu-netizen.github.io/fire-drill-plan/" -ForegroundColor Cyan
  }
} else {
  Write-Error "❌ Gist 更新失敗"
}
