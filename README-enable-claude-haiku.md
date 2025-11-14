Purpose:
  Enable "Claude Haiku 4.5" for all client configs.

Usage:
  1. Place client config files as JSON under:
     d:\Documents\Dev\yt_ai_analyst\clients\*.json
  2. Run (PowerShell):
     .\scripts\enable_claude_haiku_all_clients.ps1

Behavior:
  - Creates timestamped .bak for each modified config.
  - Sets features.claude_haiku.enabled = true and version = "4.5".
