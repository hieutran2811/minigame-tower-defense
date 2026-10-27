$ErrorActionPreference = 'Stop'
$repoRoot = (git rev-parse --show-toplevel)
if ($LASTEXITCODE -ne 0) { throw 'Run from this repository.' }
$expectedRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if ([System.IO.Path]::GetFullPath($repoRoot) -ne $expectedRoot) {
  throw 'Installer does not belong to this repository.'
}
$currentHooks = git config --local --get core.hooksPath
if ($LASTEXITCODE -gt 1) { throw 'Cannot read repository hook configuration.' }
if ($currentHooks -and $currentHooks -ne '.githooks') {
  throw 'Existing core.hooksPath found; it will not be overwritten.'
}
foreach ($name in @('pre-commit', 'pre-push')) {
  $legacyHook = Join-Path $repoRoot ".git/hooks/$name"
  if (-not $currentHooks -and (Test-Path -LiteralPath $legacyHook)) {
    throw "Existing $name hook found; integrate it manually."
  }
}
git config --local core.hooksPath .githooks
if ($LASTEXITCODE -ne 0) { throw 'Could not install local Git hooks.' }
Write-Output 'Local Git hooks installed. Codex hooks still require /hooks review and trust.'
