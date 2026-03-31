# RankerIQ — GCP Deployment Guide

## Prerequisites

- GCP account with billing enabled
- Domain name (e.g. `rankeriq.com`) with DNS managed via Cloudflare or GCP
- Your API keys ready: `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`

---

## Step 1: Provision GCP VM

```bash
# Create e2-medium VM (2 vCPU, 4 GB RAM, 50 GB SSD)
gcloud compute instances create rankeriq \
  --zone=asia-south1-a \
  --machine-type=e2-medium \
  --boot-disk-size=50GB \
  --boot-disk-type=pd-balanced \
  --image-family=ubuntu-2404-lts-amd64 \
  --image-project=ubuntu-os-cloud \
  --tags=http-server,https-server

# Reserve static IP
gcloud compute addresses create rankeriq-ip --region=asia-south1
STATIC_IP=$(gcloud compute addresses describe rankeriq-ip --region=asia-south1 --format='value(address)')
echo "Static IP: $STATIC_IP"

# Assign static IP to VM
gcloud compute instances delete-access-config rankeriq --zone=asia-south1-a --access-config-name="External NAT"
gcloud compute instances add-access-config rankeriq --zone=asia-south1-a --address=$STATIC_IP

# Open firewall (SSH + HTTP + HTTPS only)
gcloud compute firewall-rules create rankeriq-web \
  --allow=tcp:22,tcp:80,tcp:443 \
  --target-tags=http-server,https-server
```

**Cost:** ~$25/month (e2-medium with committed use discount)

---

## Step 2: Install Docker on VM

```bash
# SSH into VM
gcloud compute ssh rankeriq --zone=asia-south1-a

# Install Docker
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add your user to docker group (no sudo needed)
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker --version
docker compose version
```

---

## Step 3: Point Domain DNS

In your DNS provider (Cloudflare, etc.):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `rankeriq.com` | `<STATIC_IP>` | Auto |
| A | `www` | `<STATIC_IP>` | Auto |

Wait 5-10 minutes for propagation. Verify:

```bash
dig rankeriq.com +short
# Should show your static IP
```

---

## Step 4: Deploy the Application

### 4a. Clone the repo on the VM

```bash
git clone https://github.com/YOUR_USERNAME/RankerIQ.git
cd RankerIQ
```

### 4b. Create production `.env`

```bash
# Generate strong secrets
POSTGRES_PW=$(openssl rand -hex 16)
JWT_KEY=$(openssl rand -hex 32)

cat > .env << EOF
POSTGRES_PASSWORD=$POSTGRES_PW
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
OPENAI_BASE_URL=https://api.openai.com/v1
JWT_SECRET=$JWT_KEY
ELEVENLABS_API_KEY=xi-YOUR_KEY_HERE
NEXT_PUBLIC_BACKEND_URL=https://rankeriq.com
BACKEND_URL=http://backend:8080
RUST_LOG=info
EOF

# Verify — NEVER commit this file
cat .env
```

### 4c. Get SSL certificate (before starting nginx)

```bash
# Install certbot
sudo apt-get install -y certbot

# Get certificate (nginx must NOT be running yet)
sudo certbot certonly --standalone -d rankeriq.com -d www.rankeriq.com --agree-tos -m your@email.com

# Verify
sudo ls /etc/letsencrypt/live/rankeriq.com/
# Should show: cert.pem  chain.pem  fullchain.pem  privkey.pem

# Auto-renewal (certbot adds a systemd timer automatically)
sudo certbot renew --dry-run
```

### 4d. Build and start

```bash
# Build all images (first time takes ~10-15 min for Rust compilation)
docker compose build

# Start everything
docker compose up -d

# Check status
docker compose ps
docker compose logs -f --tail=50
```

### 4e. Verify

```bash
# Health check
curl -s https://rankeriq.com/health
# Should return: ok

# Test login
curl -s -X POST https://rankeriq.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@demo.com","password":"demo1234"}' | head -c 100
# Should return JSON with token
```

---

## Step 5: Set Up Backups

```bash
# Create GCS bucket
gsutil mb -l asia-south1 gs://rankeriq-backups

# Create backup script
cat > ~/backup.sh << 'EOF'
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
docker compose -f /home/$USER/RankerIQ/docker-compose.yml exec -T postgres \
  pg_dump -U rankeriq rankeriq | gzip > /tmp/rankeriq_$TIMESTAMP.sql.gz
gsutil cp /tmp/rankeriq_$TIMESTAMP.sql.gz gs://rankeriq-backups/
rm /tmp/rankeriq_$TIMESTAMP.sql.gz
echo "Backup completed: rankeriq_$TIMESTAMP.sql.gz"
EOF
chmod +x ~/backup.sh

# Test backup
~/backup.sh

# Add daily cron (2 AM IST = 8:30 PM UTC)
(crontab -l 2>/dev/null; echo "30 20 * * * /home/$USER/backup.sh >> /home/$USER/backup.log 2>&1") | crontab -

# Restore procedure (if needed):
# gsutil cp gs://rankeriq-backups/rankeriq_TIMESTAMP.sql.gz /tmp/
# gunzip /tmp/rankeriq_TIMESTAMP.sql.gz
# docker compose exec -T postgres psql -U rankeriq rankeriq < /tmp/rankeriq_TIMESTAMP.sql
```

**Cost:** ~$1/month for 10 GB on GCS

---

## Build Times Reference

| Component | First Build | Rebuild (cached) |
|-----------|------------|-------------------|
| Backend (Rust) | ~10-15 min | ~30s (code changes only) |
| Frontend (Next.js) | ~2-3 min | ~30s |
| PostgreSQL | Instant (pulls image) | Instant |
| Nginx | Instant (pulls image) | Instant |
| **Total first deploy** | **~15-20 min** | — |

---

## Common Operations

### View logs

```bash
docker compose logs backend -f --tail=100
docker compose logs frontend -f --tail=100
docker compose logs postgres -f --tail=100
docker compose logs nginx -f --tail=100
```

### Restart a service

```bash
docker compose restart backend
docker compose restart frontend
```

### Deploy code update

```bash
cd ~/RankerIQ
git pull origin main

# Rebuild only changed services
docker compose build backend frontend
docker compose up -d

# Verify
docker compose ps
curl -s https://rankeriq.com/health
```

### Rebuild everything from scratch

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Database shell

```bash
docker compose exec postgres psql -U rankeriq rankeriq
```

### Check disk usage

```bash
docker system df
df -h
```

---

## Security Checklist (Post-Deploy)

```bash
# 1. Disable password SSH (key-only)
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# 2. Enable auto-updates
sudo apt-get install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# 3. Verify firewall
gcloud compute firewall-rules list --filter="targetTags=http-server"
# Only ports 22, 80, 443 should be open

# 4. Run security audits
cd ~/RankerIQ
docker compose exec backend cargo audit 2>/dev/null || echo "Install cargo-audit: cargo install cargo-audit"
```

---

## Monitoring

### GCP Uptime Check

```bash
# Create uptime check (checks /health every 5 min)
gcloud monitoring uptime create rankeriq-health \
  --resource-type=uptime-url \
  --hostname=rankeriq.com \
  --path=/health \
  --check-interval=300 \
  --timeout=10
```

### Manual health check

```bash
# Quick status
curl -sf https://rankeriq.com/health && echo " OK" || echo " DOWN"

# Full stack check
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
```

---

## Cost Summary

| Resource | Monthly |
|----------|---------|
| e2-medium VM | ~$25 |
| 50 GB disk | ~$5 |
| Static IP + egress | ~$3 |
| GCS backups | ~$1 |
| OpenAI API | ~$10-20 |
| ElevenLabs | ~$5 |
| Domain | ~$1 |
| **Total** | **~$50-60** |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Cannot connect to Docker daemon` | `sudo systemctl start docker` |
| Backend can't reach PostgreSQL | Check `docker compose ps` — postgres must be `healthy` |
| SSL certificate expired | `sudo certbot renew && docker compose restart nginx` |
| Out of disk space | `docker system prune -a` to remove old images |
| Backend OOM killed | Check `docker compose logs backend` — may need e2-standard-2 (8 GB) |
| Frontend shows blank page | Check `NEXT_PUBLIC_BACKEND_URL` is set correctly in `.env` |
| 502 Bad Gateway | Backend crashed — `docker compose restart backend && docker compose logs backend -f` |
