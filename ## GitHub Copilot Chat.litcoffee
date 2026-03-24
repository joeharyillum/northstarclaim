## GitHub Copilot Chat

- Extension: 0.39.1 (prod)
- VS Code: 1.111.0 (ce099c1ed25d9eb3076c11e4a280f3eb52b4fbeb)
- OS: win32 10.0.26200 x64
- GitHub Account: joeharyillum

## Network

User Settings:
```json
  "http.systemCertificatesNode": true,
  "github.copilot.advanced.debug.useElectronFetcher": true,
  "github.copilot.advanced.debug.useNodeFetcher": false,
  "github.copilot.advanced.debug.useNodeFetchFetcher": true
```

Connecting to https://api.github.com:
- DNS ipv4 Lookup: 4.225.11.201 (20 ms)
- DNS ipv6 Lookup: Error (28 ms): getaddrinfo ENOTFOUND api.github.com
- Proxy URL: None (2 ms)
- Electron fetch (configured): HTTP 200 (130 ms)
- Node.js https: HTTP 200 (381 ms)
- Node.js fetch: HTTP 200 (59 ms)

Connecting to https://api.githubcopilot.com/_ping:
- DNS ipv4 Lookup: 140.82.113.22 (8 ms)
- DNS ipv6 Lookup: Error (275 ms): getaddrinfo ENOTFOUND api.githubcopilot.com
- Proxy URL: None (267 ms)
- Electron fetch (configured): HTTP 200 (336 ms)
- Node.js https: HTTP 200 (406 ms)
- Node.js fetch: HTTP 200 (1147 ms)

Connecting to https://copilot-proxy.githubusercontent.com/_ping:
- DNS ipv4 Lookup: 4.225.11.192 (26 ms)
- DNS ipv6 Lookup: Error (28 ms): getaddrinfo ENOTFOUND copilot-proxy.githubusercontent.com
- Proxy URL: None (46 ms)
- Electron fetch (configured): HTTP 200 (158 ms)
- Node.js https: HTTP 200 (266 ms)
- Node.js fetch: HTTP 200 (280 ms)

Connecting to https://mobile.events.data.microsoft.com: HTTP 404 (631 ms)
Connecting to https://dc.services.visualstudio.com: HTTP 404 (187 ms)
Connecting to https://copilot-telemetry.githubusercontent.com/_ping: HTTP 200 (365 ms)
Connecting to https://copilot-telemetry.githubusercontent.com/_ping: HTTP 200 (374 ms)
Connecting to https://default.exp-tas.com: HTTP 400 (179 ms)

Number of system certificates: 76

## Documentation

In corporate networks: [Troubleshooting firewall settings for GitHub Copilot](https://docs.github.com/en/copilot/troubleshooting-github-copilot/troubleshooting-firewall-settings-for-github-copilot).