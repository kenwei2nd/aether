# Extract the exact last frame from a clip for matched-frame editing.
# Usage: pwsh tools/extract-last-frame.ps1 -Input public/segments/s1.mp4 -Output public/segments/s1_last.png
param(
  [string]$Input  = "public\segments\s1.mp4",
  [string]$Output = "public\segments\s1_last.png"
)
$ErrorActionPreference = 'Stop'
$root   = Resolve-Path "$PSScriptRoot\.."
$ffmpeg = Join-Path $root 'node_modules\ffmpeg-static\ffmpeg.exe'
$src    = if ([System.IO.Path]::IsPathRooted($Input)) { $Input } else { Join-Path $root $Input }
$dst    = if ([System.IO.Path]::IsPathRooted($Output)) { $Output } else { Join-Path $root $Output }

# Count frames, then extract frame N-1 (0-indexed last)
$frameCount = & $ffmpeg -i $src -map 0:v:0 -f null - 2>&1 |
    Select-String 'frame=\s*(\d+)' | ForEach-Object { $_.Matches[0].Groups[1].Value } | Select-Object -Last 1

Write-Host "Total frames: $frameCount"
$lastIdx = [int]$frameCount - 1
& $ffmpeg -y -hide_banner -loglevel error -i $src -vf "select=eq(n\,$lastIdx)" -vframes 1 $dst
Write-Host "Saved last frame: $dst"
