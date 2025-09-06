# Installation Guide

This guide will help you set up the SCTE-35 Encoder & Stream Injection System on your local machine or server.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Installation](#detailed-installation)
- [Configuration](#configuration)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)

## Prerequisites

### System Requirements

- **Operating System**: Linux, macOS, or Windows 10+
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher
- **Memory**: Minimum 4GB RAM, 8GB recommended
- **Storage**: Minimum 2GB free space
- **Network**: Stable internet connection for dependencies

### Software Dependencies

#### Node.js
Download and install Node.js from the official website:
- [Node.js Download](https://nodejs.org/)

Verify installation:
```bash
node --version
npm --version
```

#### Git (Optional but recommended)
Download and install Git:
- [Git Download](https://git-scm.com/)

Verify installation:
```bash
git --version
```

#### FFmpeg (Optional for actual stream processing)
For production stream processing, install FFmpeg:

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**macOS (using Homebrew):**
```bash
brew install ffmpeg
```

**Windows:**
Download from [FFmpeg Official Site](https://ffmpeg.org/download.html)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/scte35-encoder.git
cd scte35-encoder
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Database

```bash
npm run db:push
```

### 4. Start Development Server

```bash
npm run dev
```

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Detailed Installation

### Step 1: Clone the Repository

#### Using Git (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-username/scte35-encoder.git

# Navigate to the project directory
cd scte35-encoder

# Check out the desired branch (optional)
git checkout main
```

#### Without Git

1. Download the ZIP file from GitHub
2. Extract the archive
3. Navigate to the extracted directory

### Step 2: Install Dependencies

#### Install Node.js Dependencies

```bash
# Install all npm dependencies
npm install
```

This will install:
- Next.js and related packages
- React and UI components
- Database ORM (Prisma)
- WebSocket libraries
- Development tools

#### Verify Installation

```bash
# Check if all dependencies are installed
npm list --depth=0
```

### Step 3: Database Setup

#### Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push
```

This will:
- Create the SQLite database file
- Set up the database schema
- Generate the Prisma client

#### Database Configuration

The default configuration uses SQLite. For production, you might want to use PostgreSQL or MySQL.

**SQLite (Default):**
```env
# .env.local
DATABASE_URL="file:./dev.db"
```

**PostgreSQL:**
```env
# .env.local
DATABASE_URL="postgresql://username:password@localhost:5432/scte35_encoder"
```

**MySQL:**
```env
# .env.local
DATABASE_URL="mysql://username:password@localhost:3306/scte35_encoder"
```

### Step 4: Environment Configuration

#### Create Environment File

```bash
# Copy the example environment file
cp .env.example .env.local
```

#### Edit Environment Variables

Edit `.env.local` file:

```env
# Application
NEXT_PUBLIC_APP_NAME="SCTE-35 Encoder"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Database
DATABASE_URL="file:./dev.db"

# Stream Configuration (Optional)
STREAM_DEFAULT_BITRATE=5000
STREAM_DEFAULT_RESOLUTION="1920x1080"
STREAM_DEFAULT_CODEC="h264"

# Security (Optional)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Logging
LOG_LEVEL="info"
```

### Step 5: Build the Application

#### Development Build

```bash
# Build for development
npm run build
```

#### Production Build

```bash
# Build for production
npm run build:prod
```

### Step 6: Start the Application

#### Development Mode

```bash
# Start development server with hot reload
npm run dev
```

The application will be available at:
- Web Interface: http://localhost:3000
- API: http://localhost:3000/api
- WebSocket: ws://localhost:3000/api/stream/ws

#### Production Mode

```bash
# Start production server
npm start
```

## Configuration

### Application Configuration

#### Main Configuration File

Edit `next.config.ts` for advanced Next.js configuration:

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Add custom configurations here
};

export default nextConfig;
```

#### TypeScript Configuration

Edit `tsconfig.json` for TypeScript configuration:

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Database Configuration

#### Prisma Schema

Edit `prisma/schema.prisma` for database configuration:

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Stream {
  id          String   @id @default(cuid())
  name        String
  inputUrl    String
  outputUrl   String
  streamType  String
  bitrate     Int
  resolution  String
  codec       String
  status      String   @default("stopped")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("streams")
}

model Injection {
  id           String   @id @default(cuid())
  streamId     String
  time         Int
  scte35Data   String
  description  String
  active       Boolean  @default(true)
  injected     Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("injections")
}
```

#### Database Migrations

```bash
# Create migration
npx prisma migrate dev --name init

# Apply migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset
```

### Stream Configuration

#### Default Stream Settings

Create a configuration file `src/config/streams.ts`:

```typescript
export const defaultStreamConfig = {
  srt: {
    defaultLatency: 2000,
    maxBandwidth: 10000000,
    bufferSize: 8192000,
  },
  hls: {
    segmentDuration: 6,
    playlistType: "event",
    hlsTime: 6,
    hlsListSize: 0,
  },
  dash: {
    segDuration: 6,
    fragDuration: 2,
    windowSize: 6,
    extraWindowSize: 6,
  },
  rtmp: {
    flashVer: "FMLE/3.0",
    tcUrl: "",
    pageUrl: "",
  },
};
```

### Security Configuration

#### Environment Variables for Security

```env
# .env.local
NEXTAUTH_SECRET="your-very-secure-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# CORS Configuration
ALLOWED_ORIGINS="http://localhost:3000,https://yourdomain.com"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

## Verification

### 1. Check Application Status

```bash
# Check if the application is running
curl http://localhost:3000

# Check API health
curl http://localhost:3000/api/health
```

### 2. Test SCTE-35 Encoding

```bash
# Test SCTE-35 encoding endpoint
curl -X POST http://localhost:3000/api/scte35/encode \
  -H "Content-Type: application/json" \
  -d '{
    "spliceInfo": {
      "tableId": 252,
      "protocolVersion": 0,
      "ptsAdjustment": 0,
      "cwIndex": 255,
      "tier": 4095,
      "spliceCommandType": 5
    },
    "command": {
      "spliceEventId": 1,
      "spliceEventCancelIndicator": false,
      "outOfNetworkIndicator": true,
      "programSpliceFlag": true,
      "durationFlag": true,
      "spliceImmediateFlag": false,
      "breakDurationAutoReturn": true,
      "breakDuration": 1800000,
      "uniqueProgramId": 1,
      "available": 0,
      "expected": 0,
      "spliceTimeSpecified": true,
      "spliceTimePts": 0
    },
    "commandType": "splice-insert"
  }'
```

### 3. Test WebSocket Connection

```javascript
// Test WebSocket connection in browser console
const ws = new WebSocket('ws://localhost:3000/api/stream/ws');

ws.onopen = () => {
  console.log('WebSocket connected');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

ws.onclose = () => {
  console.log('WebSocket disconnected');
};
```

### 4. Run Tests

```bash
# Run all tests
npm test

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# Run linting
npm run lint

# Type checking
npm run type-check
```

### 5. Check Database

```bash
# Check database connection
npx prisma db push

# View database schema
npx prisma studio

# Check Prisma client
npx prisma generate
```

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process (replace PID with actual process ID)
kill -9 PID

# Or use a different port
PORT=3001 npm run dev
```

#### 2. Database Connection Issues

**Error:** `Can't reach database server at localhost:5432`

**Solution:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# For SQLite, check file permissions
chmod 644 dev.db
```

#### 3. Module Installation Issues

**Error:** `npm ERR! network request failed`

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

#### 4. TypeScript Errors

**Error:** `TypeScript compilation failed`

**Solution:**
```bash
# Check TypeScript version
npm list typescript

# Reinstall TypeScript
npm install typescript@latest

# Check tsconfig.json
npx tsc --noEmit
```

#### 5. WebSocket Connection Issues

**Error:** `WebSocket connection failed`

**Solution:**
```bash
# Check if WebSocket server is running
curl -I http://localhost:3000/api/stream/ws

# Check firewall settings
sudo ufw status

# Allow port 3000
sudo ufw allow 3000
```

### Log Files and Debugging

#### Enable Debug Logging

```env
# .env.local
LOG_LEVEL="debug"
DEBUG="scte35-encoder:*"
```

#### Check Application Logs

```bash
# View development server logs
npm run dev 2>&1 | tee dev.log

# View production logs
npm start 2>&1 | tee server.log

# Check system logs
journalctl -u your-service-name -f
```

#### Database Debugging

```bash
# Enable Prisma logging
npx prisma studio

# Check database queries
npx prisma db seed

# Reset database
npx prisma migrate reset
```

## Production Deployment

### Docker Deployment

#### Build Docker Image

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/scte35_encoder
    depends_on:
      - db
    volumes:
      - ./logs:/app/logs

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=scte35_encoder
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

#### Build and Run

```bash
# Build and start services
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Kubernetes Deployment

#### Deployment YAML

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: scte35-encoder
  labels:
    app: scte35-encoder
spec:
  replicas: 3
  selector:
    matchLabels:
      app: scte35-encoder
  template:
    metadata:
      labels:
        app: scte35-encoder
    spec:
      containers:
      - name: scte35-encoder
        image: your-registry/scte35-encoder:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: scte35-secret
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

#### Service YAML

```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: scte35-encoder-service
spec:
  selector:
    app: scte35-encoder
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
```

#### Apply Configuration

```bash
# Apply Kubernetes configurations
kubectl apply -f k8s/

# Check deployment status
kubectl get deployment scte35-encoder

# Check pods
kubectl get pods -l app=scte35-encoder

# Check service
kubectl get service scte35-encoder-service
```

### Traditional Server Deployment

#### System Requirements

- **CPU**: 2+ cores
- **Memory**: 4GB+ RAM
- **Storage**: 20GB+ SSD
- **OS**: Ubuntu 20.04+ or CentOS 8+

#### Installation Steps

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2 (Process Manager)
sudo npm install -g pm2

# 4. Clone repository
git clone https://github.com/your-username/scte35-encoder.git
cd scte35-encoder

# 5. Install dependencies
npm install

# 6. Build application
npm run build

# 7. Create PM2 configuration
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'scte35-encoder',
    script: 'npm',
    args: 'start',
    cwd: './',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# 8. Start application
pm2 start ecosystem.config.js

# 9. Save PM2 configuration
pm2 save

# 10. Setup PM2 to start on boot
pm2 startup
```

#### Nginx Configuration

```nginx
# /etc/nginx/sites-available/scte35-encoder
server {
    listen 80;
    server_name your-domain.com;

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
        proxy_read_timeout 86400;
    }

    # WebSocket support
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
}

# Enable HTTPS
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/your/cert.pem;
    ssl_certificate_key /path/to/your/key.pem;

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
        proxy_read_timeout 86400;
    }
}
```

#### Enable Site

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/scte35-encoder /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

For additional support, please refer to our [GitHub Issues](https://github.com/your-username/scte35-encoder/issues) or [Documentation](../README.md).