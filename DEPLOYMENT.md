# SCTE-35 Encoder & Stream Injector - Deployment Guide

## Table of Contents
- [Overview](#overview)
- [System Requirements](#system-requirements)
- [Quick Start](#quick-start)
- [Detailed Deployment](#detailed-deployment)
- [Configuration](#configuration)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)
- [Security](#security)
- [Scaling](#scaling)

## Overview

The SCTE-35 Encoder & Stream Injector is a comprehensive web-based solution for creating SCTE-35 cues and injecting them into live video streams. This guide covers deployment from development to production environments.

### Features
- **SCTE-35 Encoding**: Full support for splice insert and time signal commands
- **Multi-Protocol Streaming**: SRT, HLS, DASH, and RTMP support
- **Real-time Injection**: Live SCTE-35 cue insertion into streams
- **Monitoring Dashboard**: Real-time stream health and performance metrics
- **Professional UI**: Intuitive web interface for all operations

## System Requirements

### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **OS**: Ubuntu 20.04+, CentOS 8+, or equivalent
- **Node.js**: 18.x or higher
- **Network**: Stable internet connection

### Recommended Requirements (Production)
- **CPU**: 4+ cores
- **RAM**: 8GB+ 
- **Storage**: 50GB+ SSD
- **OS**: Ubuntu 22.04 LTS (recommended)
- **Node.js**: 18.x or higher
- **Database**: PostgreSQL 14+
- **Load Balancer**: For high availability
- **SSL Certificate**: For secure connections

## Quick Start

### Development Deployment

1. **Clone the repository**
   ```bash
   git clone https://github.com/shihan84/SCTE-35-Encoder-Stream-Injector.git
   cd SCTE-35-Encoder-Stream-Injector
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

### Production Deployment (Single Server)

1. **Server Preparation**
   ```bash
   # Update system
   sudo apt-get update && sudo apt-get upgrade -y
   
   # Install Node.js 18
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   npm install -g pm2
   ```

2. **Application Setup**
   ```bash
   # Clone repository
   git clone https://github.com/shihan84/SCTE-35-Encoder-Stream-Injector.git
   cd SCTE-35-Encoder-Stream-Injector
   
   # Install dependencies
   npm install
   
   # Build application
   npm run build
   ```

3. **Environment Configuration**
   ```bash
   # Create environment file
   cp .env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

4. **Start Application**
   ```bash
   # Start with PM2
   pm2 start server.ts --name "scte35-encoder"
   
   # Save PM2 configuration
   pm2 save
   pm2 startup
   ```

## Detailed Deployment

### 1. Server Preparation

#### System Update
```bash
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y curl git build-essential
```

#### Install Node.js
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### Install PM2 (Process Manager)
```bash
npm install -g pm2
pm2 --version
```

#### Create Application User
```bash
sudo useradd -m -s /bin/bash scte35
sudo usermod -aG sudo scte35
```

### 2. Database Setup

#### Option 1: SQLite (Development/Small Production)
```bash
# SQLite is included by default
# No additional setup required
```

#### Option 2: PostgreSQL (Production Recommended)
```bash
# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres createdb scte35_encoder
sudo -u postgres createuser scte35_user
sudo -u postgres psql -c "ALTER USER scte35_user PASSWORD 'your_secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE scte35_encoder TO scte35_user;"
```

### 3. Application Deployment

#### Clone and Setup Application
```bash
# Switch to application user
sudo -u scte35 -i

# Clone repository
git clone https://github.com/shihan84/SCTE-35-Encoder-Stream-Injector.git
cd SCTE-35-Encoder-Stream-Injector

# Install dependencies
npm install

# Build application
npm run build

# Create necessary directories
sudo mkdir -p /var/log/scte35
sudo mkdir -p /var/www/hls
sudo mkdir -p /var/www/dash
sudo chown -R scte35:scte35 /var/log/scte35
sudo chown -R scte35:scte35 /var/www/hls
sudo chown -R scte35:scte35 /var/www/dash
```

#### Environment Configuration
Create `.env` file:
```bash
# Application
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# Database (PostgreSQL example)
DATABASE_URL="postgresql://scte35_user:your_secure_password@localhost:5432/scte35_encoder"

# Stream Configuration
SRT_INPUT_PORT=9000
SRT_OUTPUT_PORT=9001
RTMP_PORT=1935
HLS_OUTPUT_DIR=/var/www/hls
DASH_OUTPUT_DIR=/var/www/dash

# Security
JWT_SECRET=your-jwt-secret-key-here
ENCRYPTION_KEY=your-encryption-key-here

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/scte35/app.log
```

#### Database Migration
```bash
# If using Prisma
npm run db:push
npm run db:generate
```

### 4. Web Server Configuration

#### Install Nginx
```bash
sudo apt-get install -y nginx
```

#### SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

#### Nginx Configuration
Create `/etc/nginx/sites-available/scte35`:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Application Proxy
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # WebSocket Support
    location /api/stream/ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static Files (if needed)
    location /static/ {
        alias /var/www/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/scte35 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Process Management

#### PM2 Configuration
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'scte35-encoder',
    script: 'server.ts',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/scte35/error.log',
    out_file: '/var/log/scte35/out.log',
    log_file: '/var/log/scte35/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
}
```

#### Start Application
```bash
# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### 6. Firewall Configuration

#### UFW Configuration
```bash
# Enable UFW
sudo ufw enable

# Allow essential services
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https

# Allow streaming ports
sudo ufw allow 9000:9005/tcp
sudo ufw allow 1935/tcp

# Check status
sudo ufw status
```

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment | `development` | Yes |
| `PORT` | Application port | `3000` | No |
| `DATABASE_URL` | Database connection string | - | Yes |
| `SRT_INPUT_PORT` | SRT input port | `9000` | No |
| `SRT_OUTPUT_PORT` | SRT output port | `9001` | No |
| `RTMP_PORT` | RTMP port | `1935` | No |
| `JWT_SECRET` | JWT secret key | - | Yes |
| `LOG_LEVEL` | Logging level | `info` | No |

### Stream Configuration

#### SRT Configuration
```bash
# Input URL format
srt://localhost:9000?streamid=live/input

# Output URL format
srt://localhost:9001?streamid=live/output
```

#### HLS Configuration
```bash
# Output directory
/var/www/hls

# Input URL format
http://input-server/live/stream.m3u8

# Output URL format
http://your-domain.com/hls/stream.m3u8
```

#### DASH Configuration
```bash
# Output directory
/var/www/dash

# Input URL format
http://input-server/live/stream.mpd

# Output URL format
http://your-domain.com/dash/stream.mpd
```

## Monitoring

### Application Health Checks

```bash
# Overall health
curl https://your-domain.com/api/health

# Stream status
curl https://your-domain.com/api/stream/status

# Stream metrics
curl https://your-domain.com/api/stream/metrics

# System health
curl https://your-domain.com/api/stream/health
```

### PM2 Monitoring

```bash
# Monitor all processes
pm2 monit

# View logs
pm2 logs scte35-encoder

# Check process status
pm2 status

# Restart application
pm2 restart scte35-encoder
```

### System Monitoring

```bash
# System resources
htop
df -h
free -h

# Application logs
tail -f /var/log/scte35/combined.log

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check PM2 status
pm2 status

# View error logs
pm2 logs scte35-encoder --err

# Check port availability
sudo netstat -tulpn | grep :3000

# Check Node.js version
node --version
npm --version
```

#### Database Connection Issues
```bash
# Test database connection
psql -h localhost -U scte35_user -d scte35_encoder

# Check PostgreSQL status
sudo systemctl status postgresql

# Check database logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

#### Stream Issues
```bash
# Check stream status
curl https://your-domain.com/api/stream/status

# Check if ports are open
sudo netstat -tulpn | grep :9000
sudo netstat -tulpn | grep :1935

# Test SRT connection
# Use SRT tools to test connectivity
```

#### Nginx Issues
```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Performance Issues

#### High Memory Usage
```bash
# Check memory usage
pm2 monit

# Restart application
pm2 restart scte35-encoder

# Increase memory limit
pm2 reload scte35-encoder --update-env
```

#### High CPU Usage
```bash
# Check CPU usage
top

# Check number of instances
pm2 scale scte35-encoder 4

# Monitor performance
pm2 monit
```

## Security

### Application Security

#### Environment Variables
- Never commit sensitive data to version control
- Use strong, random secrets
- Rotate secrets regularly

#### Authentication
- Implement proper authentication for production
- Use JWT tokens with proper expiration
- Implement rate limiting

#### Network Security
- Use HTTPS everywhere
- Implement proper firewall rules
- Monitor access logs

### Stream Security

#### SRT Security
```bash
# SRT with encryption
srt://localhost:9000?streamid=live/input&passphrase=your-secret

# SRT with access control
srt://localhost:9000?streamid=live/input&streamid=allowed-id
```

#### Access Control
- Implement IP whitelisting
- Use authentication for stream endpoints
- Monitor for unauthorized access attempts

## Scaling

### Horizontal Scaling

#### Load Balancer Setup
```nginx
# Load balancer configuration
upstream scte35_backend {
    server server1:3000;
    server server2:3000;
    server server3:3000;
}

server {
    listen 443 ssl;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://scte35_backend;
        # ... other proxy settings
    }
}
```

#### Database Scaling
```bash
# Read replicas
# Configure primary-replica replication
# Use connection pooling

# Example connection string with read replicas
DATABASE_URL="postgresql://user:pass@primary-host,replica1-host,replica2-host/dbname"
```

### Vertical Scaling

#### Server Resources
```bash
# Monitor resource usage
htop
df -h
free -h

# Upgrade server resources as needed
# Add more CPU cores
# Increase RAM
# Add faster storage
```

#### Application Optimization
```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 server.ts

# Optimize database queries
# Add indexing
# Use connection pooling

# Implement caching
# Use Redis for session storage
# Cache frequently accessed data
```

### CDN Integration

#### Static Assets
```nginx
# Serve static assets via CDN
location /static/ {
    proxy_pass https://your-cdn-provider.com;
}
```

#### Stream Distribution
```bash
# Use CDN for HLS/DASH streams
# Configure edge caching
# Implement geographic distribution
```

## Backup and Recovery

### Database Backup
```bash
# PostgreSQL backup
pg_dump scte35_encoder > backup_$(date +%Y%m%d_%H%M%S).sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump scte35_encoder > $BACKUP_DIR/backup_$DATE.sql
```

### Application Backup
```bash
# Backup application files
tar -czf backup_$(date +%Y%m%d).tar.gz \
  /path/to/application \
  /etc/nginx/sites-available/scte35 \
  /etc/letsencrypt/live/your-domain.com
```

### Recovery Procedure
```bash
# Restore database
psql -h localhost -U scte35_user -d scte35_encoder < backup_file.sql

# Restore application
tar -xzf backup_file.tar.gz -C /

# Restart services
pm2 restart scte35-encoder
sudo systemctl reload nginx
```

This deployment guide provides comprehensive instructions for deploying the SCTE-35 Encoder & Stream Injector in various environments, from development to production-scale deployments.