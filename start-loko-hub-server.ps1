$ErrorActionPreference = "Stop"
$root = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
$port = 8765
$prefix = "http://127.0.0.1:$port/"

if (-not (Test-Path (Join-Path $root "index.html"))) { Write-Host "ERROR: index.html was not found."; exit 1 }

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
} catch {
    Write-Host "ERROR: port 8765 is unavailable." -ForegroundColor Red
    exit 1
}

$mime = @{
    ".html" = "text/html; charset=utf-8"
    ".css" = "text/css; charset=utf-8"
    ".js" = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".svg" = "image/svg+xml"
    ".png" = "image/png"
    ".jpg" = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".webp" = "image/webp"
}

Write-Host ("LOKO HUB: " + $prefix + "index.html") -ForegroundColor Green
Write-Host "Press Ctrl+C to stop." -ForegroundColor DarkGray

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $relative = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath).TrimStart("/")
        if ([string]::IsNullOrWhiteSpace($relative)) { $relative = "index.html" }

        if ($relative.Contains("..")) {
            $context.Response.StatusCode = 403
            $body = [Text.Encoding]::UTF8.GetBytes("Forbidden")
        } else {
            $filePath = Join-Path $root ($relative.Replace("/", "\"))
            if (-not (Test-Path $filePath -PathType Leaf)) {
                $context.Response.StatusCode = 404
                $body = [Text.Encoding]::UTF8.GetBytes("Not found")
            } else {
                $context.Response.StatusCode = 200
                $body = [IO.File]::ReadAllBytes($filePath)
                $extension = [IO.Path]::GetExtension($filePath).ToLowerInvariant()
                if ($mime.ContainsKey($extension)) { $context.Response.ContentType = $mime[$extension] }
            }
        }

        $context.Response.ContentLength64 = $body.Length
        $context.Response.OutputStream.Write($body, 0, $body.Length)
        $context.Response.OutputStream.Close()
    }
} finally {
    $listener.Stop()
    $listener.Close()
}
