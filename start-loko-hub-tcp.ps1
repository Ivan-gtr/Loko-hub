$ErrorActionPreference = "Stop"
$root = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
$port = 8765
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse("127.0.0.1"), $port)

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

$listener.Start()
Write-Host ("LOKO HUB: http://127.0.0.1:$port/index.html") -ForegroundColor Green
Write-Host "Press Ctrl+C to stop." -ForegroundColor DarkGray

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        try {
            $stream = $client.GetStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $requestLine = $reader.ReadLine()
            while (($line = $reader.ReadLine()) -ne "" -and $null -ne $line) { }

            $requestPath = "/"
            if ($requestLine) {
                $parts = $requestLine.Split(" ")
                if ($parts.Length -gt 1) { $requestPath = $parts[1] }
            }

            $relative = [Uri]::UnescapeDataString($requestPath.Split("?")[0]).TrimStart("/")
            if ([string]::IsNullOrWhiteSpace($relative)) { $relative = "index.html" }
            $filePath = Join-Path $root ($relative.Replace("/", "\"))

            if ($relative.Contains("..") -or -not (Test-Path -LiteralPath $filePath -PathType Leaf)) {
                $status = "404 Not Found"
                $body = [Text.Encoding]::UTF8.GetBytes("Not found")
                $contentType = "text/plain; charset=utf-8"
            } else {
                $status = "200 OK"
                $body = [IO.File]::ReadAllBytes($filePath)
                $extension = [IO.Path]::GetExtension($filePath).ToLowerInvariant()
                $contentType = if ($mime.ContainsKey($extension)) { $mime[$extension] } else { "application/octet-stream" }
            }

            $header = "HTTP/1.1 $status`r`nContent-Type: $contentType`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
            $headerBytes = [Text.Encoding]::ASCII.GetBytes($header)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            $stream.Write($body, 0, $body.Length)
            $stream.Flush()
            $stream.Close()
        } finally {
            $client.Close()
        }
    }
} finally {
    $listener.Stop()
}
