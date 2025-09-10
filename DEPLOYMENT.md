# 🚀 Production Deployment Guide

## Prerequisites

- **Node.js** 18+ 
- **FFmpeg** with SCTE-35 support
- **PostgreSQL** (optional, for advanced features)
- **Redis** (optional, for caching)
- **Docker** (optional, for containerized deployment)

## Quick Deployment

### 1. Clone and Install

```bash
git clone https://github.com/your-username/scte35-stream-injector.git
cd scte35-stream-injector
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp config.example.env .env.local

# Edit configuration
nano .env.local
```

### 3. Build and Start

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Docker Deployment

### 1. Build Docker Image

```bash
docker build -t scte35-stream-injector .
```

### 2. Run Container

```bash
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  scte35-stream-injector
```

### 3. Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    restart: unless-stopped

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=scte35_injector
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

## System Requirements

### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **Network**: 100 Mbps

### Recommended Requirements
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 50GB+ SSD
- **Network**: 1 Gbps

### Hardware Acceleration
- **NVIDIA GPU**: For CUDA acceleration
- **Intel GPU**: For Quick Sync Video
- **AMD GPU**: For VAAPI acceleration

## Security Configuration

### 1. Firewall Setup

```bash
# Allow HTTP/HTTPS
ufw allow 80
ufw allow 443

# Allow SRT ports
ufw allow 8888

# Allow SSH
ufw allow 22
```

### 2. SSL/TLS Configuration

```bash
# Using Let's Encrypt
certbot --nginx -d yourdomain.com

# Or using Cloudflare
# Configure SSL in Cloudflare dashboard
```

### 3. Environment Security

```bash
# Generate secure secrets
openssl rand -base64 32  # For NEXTAUTH_SECRET
openssl rand -base64 32  # For JWT_SECRET

# Set secure file permissions
chmod 600 .env.local
chown app:app .env.local
```

## Performance Optimization

### 1. Node.js Optimization

```bash
# Set production environment
export NODE_ENV=production

# Increase memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Enable clustering
npm install -g pm2
pm2 start ecosystem.config.js
```

### 2. FFmpeg Optimization

```bash
# Install hardware acceleration
# NVIDIA
sudo apt install nvidia-cuda-toolkit

# Intel
sudo apt install intel-media-va-driver-non-free

# AMD
sudo apt install mesa-va-drivers
```

### 3. Database Optimization

```sql
-- PostgreSQL optimization
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
```

## Monitoring Setup

### 1. Application Monitoring

```bash
# Install PM2 for process management
npm install -g pm2

# Start with monitoring
pm2 start ecosystem.config.js
pm2 monit
```

### 2. System Monitoring

```bash
# Install monitoring tools
sudo apt install htop iotop nethogs

# Monitor resources
htop
iotop
nethogs
```

### 3. Log Management

```bash
# Configure log rotation
sudo nano /etc/logrotate.d/scte35-injector

# Log rotation config
/var/log/scte35-injector.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 app app
}
```

## Load Balancing

### 1. Nginx Configuration

```nginx
upstream scte35_backend {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://scte35_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. HAProxy Configuration

```haproxy
global
    daemon
    maxconn 4096

defaults
    mode http
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms

frontend scte35_frontend
    bind *:80
    default_backend scte35_backend

backend scte35_backend
    balance roundrobin
    server app1 127.0.0.1:3000 check
    server app2 127.0.0.1:3001 check
    server app3 127.0.0.1:3002 check
```

## Backup Strategy

### 1. Database Backup

```bash
# PostgreSQL backup
pg_dump scte35_injector > backup_$(date +%Y%m%d_%H%M%S).sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump scte35_injector > $BACKUP_DIR/backup_$DATE.sql
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

### 2. Application Backup

```bash
# Backup application files
tar -czf scte35_backup_$(date +%Y%m%d).tar.gz \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=uploads \
  /path/to/scte35-stream-injector
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find process using port
   lsof -i :3000
   
   # Kill process
   kill -9 <PID>
   ```

2. **FFmpeg Not Found**
   ```bash
   # Install FFmpeg
   sudo apt update
   sudo apt install ffmpeg
   
   # Verify installation
   ffmpeg -version
   ```

3. **Permission Denied**
   ```bash
   # Fix permissions
   sudo chown -R app:app /path/to/app
   chmod +x examples/quick-start.sh
   ```

4. **Memory Issues**
   ```bash
   # Increase swap
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

### Log Analysis

```bash
# View application logs
tail -f /var/log/scte35-injector.log

# View system logs
journalctl -u scte35-injector -f

# View error logs
grep -i error /var/log/scte35-injector.log
```

## Health Checks

### 1. Application Health

```bash
# Check if application is running
curl http://localhost:3000/api/health

# Check stream status
curl http://localhost:3000/api/stream/status
```

### 2. System Health

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top
```

## Scaling

### Horizontal Scaling

1. **Multiple Instances**
   - Run multiple app instances on different ports
   - Use load balancer to distribute traffic
   - Implement session sharing with Redis

2. **Database Scaling**
   - Use read replicas for read operations
   - Implement connection pooling
   - Consider database sharding for large datasets

### Vertical Scaling

1. **Resource Upgrades**
   - Increase CPU cores
   - Add more RAM
   - Use faster storage (NVMe SSD)

2. **Hardware Acceleration**
   - Enable GPU acceleration
   - Use specialized hardware for encoding
   - Implement dedicated network interfaces

## Maintenance

### Regular Tasks

1. **Daily**
   - Check application logs
   - Monitor system resources
   - Verify stream health

2. **Weekly**
   - Update dependencies
   - Clean temporary files
   - Review performance metrics

3. **Monthly**
   - Security updates
   - Database optimization
   - Backup verification

### Update Procedure

```bash
# 1. Backup current version
cp -r /app /app_backup_$(date +%Y%m%d)

# 2. Pull latest changes
git pull origin main

# 3. Install dependencies
npm install

# 4. Build application
npm run build

# 5. Restart services
pm2 restart all

# 6. Verify deployment
curl http://localhost:3000/api/health
```

---

**For additional support, please refer to the [USAGE_GUIDE.md](USAGE_GUIDE.md) or create an issue on GitHub.**
