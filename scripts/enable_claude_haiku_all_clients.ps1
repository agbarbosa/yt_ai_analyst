param(
    [string]$ClientsDir = "d:\Documents\Dev\yt_ai_analyst\clients",
    [string]$FlagFile  = "d:\Documents\Dev\yt_ai_analyst\feature-flags\claude_haiku.json"
)

# Load flag data
$flag = Get-Content $FlagFile -Raw | ConvertFrom-Json

if (-not (Test-Path $ClientsDir)) {
    Write-Error "Clients directory '$ClientsDir' not found."
    exit 1
}

Get-ChildItem -Path $ClientsDir -Filter *.json -File | ForEach-Object {
    $path = $_.FullName
    try {
        $jsonText = Get-Content $path -Raw
        $config = $jsonText | ConvertFrom-Json
    } catch {
        Write-Warning "Skipping invalid JSON: $path"
        return
    }

    # Ensure features object exists
    if (-not $config.PSObject.Properties.Name -contains 'features') {
        $config | Add-Member -MemberType NoteProperty -Name features -Value @{}
    }

    # Upsert the claude_haiku feature
    $config.features.claude_haiku = @{
        enabled = $flag.enabled
        version = $flag.version
    }

    # Backup original
    $bak = "$path.bak.$(Get-Date -Format yyyyMMddHHmmss)"
    Copy-Item -Path $path -Destination $bak

    # Write updated config (pretty)
    $config | ConvertTo-Json -Depth 10 | Out-File -FilePath $path -Encoding UTF8

    Write-Output "Updated: $path (backup: $bak)"
}
