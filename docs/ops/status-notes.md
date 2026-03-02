# StartupShop Status Notes

## Current production status (2026-03-02)

- ✅ DNS resolves globally for `startupshop.online` and `www.startupshop.online`
- ✅ HTTPS enabled via Let's Encrypt
- ✅ App live on `https://startupshop.online`
- ✅ Canonical redirect active: `https://www.startupshop.online` -> `https://startupshop.online`
- ✅ Health endpoint live: `https://startupshop.online/api/health`

## Deployment target

- App host: `72.62.235.141`
- App port: `3007`
- Nginx reverse proxy: active
- PM2 process: `startupshop`

## Access and operations

- Use key-based SSH via host alias: `lewkai-vps`
- Canonical deploy command:

```bash
./scripts/deploy-startupshop.sh
```

Dry run:

```bash
./scripts/deploy-startupshop.sh --dry-run
```
