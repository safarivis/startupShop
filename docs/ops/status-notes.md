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

## Daily automation (laptop cron)

Configured on Louis laptop (`crontab -l`):

```bash
0 13 * * * flock -n /tmp/startupshop-deploy.lock /home/louisdup/lewkai/scripts/run-startupshop-cron.sh
```

### What runs at 13:00 daily

1. `scripts/deploy-startupshop.sh`
   - syncs local startupShop source to VPS `/opt/startupshop`
   - validates listings
   - builds app
   - restarts PM2 app `startupshop`
   - checks health endpoint
2. `scripts/send-startupshop-report.sh`
   - sends success/failure email report via Resend

### Logging + reporting

- Cron/deploy log:
  - `/home/louisdup/lewkai/logs/startupshop-cron.log`
- Resend API response (last send):
  - `/tmp/startupshop-resend-last.json`
- Report recipient:
  - `louisrdup@gmail.com`
- Report sender:
  - `startupShopAgent@lewkai.com`

### Secrets source (local only)

- `~/.config/lewkai/secrets/vps.env`
- Required keys include:
  - VPS SSH/deploy values
  - `RESEND_API_KEY`
  - `REPORT_FROM_EMAIL`
  - `REPORT_TO_EMAIL`
