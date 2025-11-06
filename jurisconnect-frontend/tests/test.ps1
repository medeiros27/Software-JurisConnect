$tests = @{
  "Node.js" = { node -v }
  "npm" = { npm -v }
  "Git" = { git -v }
  "Python" = { python -v }
  "VS Code" = { code -v }
}

foreach ($test in $tests.GetEnumerator()) {
  try {
    Invoke-Expression $test.Value | Out-Null
    Write-Host "✅ $($test.Name): OK" -ForegroundColor Green
  } catch {
    Write-Host "❌ $($test.Name): NÃO INSTALADO" -ForegroundColor Red
  }
}