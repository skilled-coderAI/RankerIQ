try {
    $r = Invoke-WebRequest -Uri "http://localhost:8080/health" -UseBasicParsing
    Write-Host "STATUS: $($r.StatusCode)"
    Write-Host "BODY: $($r.Content)"
} catch {
    Write-Host "ERROR: $($_.Exception.Message)"
}
