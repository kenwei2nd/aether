# Concatenate 3 Higgsfield-generated MP4 clips into a single hero.mp4.
# Uses matched-frame editing: s1 → s2 → s3, each clip starts exactly where the previous ended.
# Run from repo root: pwsh tools/concat-segments.ps1
$ErrorActionPreference = 'Stop'

$root      = Resolve-Path "$PSScriptRoot\.."
$segments  = Join-Path $root 'public\segments'
$listFile  = Join-Path $segments 'segments.txt'
$outFile   = Join-Path $root 'public\hero.mp4'
$ffmpeg    = Join-Path $root 'node_modules\ffmpeg-static\ffmpeg.exe'

if (!(Test-Path $segments)) { throw "segments folder not found: $segments" }
if (!(Test-Path $ffmpeg))   { throw "ffmpeg-static not found. Run 'npm install' first." }

$lines = 1..3 | ForEach-Object { "file '$segments\s$_.mp4'".Replace('\', '/') }
$lines | Set-Content -Encoding ASCII -Path $listFile

Write-Host "Concatenating s1..s3 into $outFile"
& $ffmpeg -y -hide_banner -loglevel error -f concat -safe 0 -i $listFile `
    -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -movflags +faststart `
    $outFile

Write-Host "Done: $outFile"
