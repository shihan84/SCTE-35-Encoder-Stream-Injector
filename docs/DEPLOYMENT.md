# SCTE-35 Encoder & Stream Injector - Deployment Guide

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Development Setup](#development-setup)
- [Production Deployment](#production-deployment)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Cloud Platform Deployment](#cloud-platform-deployment)
- [Configuration Management](#configuration-management)
- [Monitoring and Logging](#monitoring-and-logging)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)

## 🎯 Prerequisites

### System Requirements

- **Node.js**: 18.x or higher
- **npm**: 8.x or higher
- **Memory**: Minimum 512MB RAM, recommended 1GB+
- **Storage**: Minimum 1GB free disk space
- **Network**: Stable internet connection for external dependencies

### Software Dependencies

- **FFmpeg**: Required for stream processing (optional but recommended)
- **Redis**: For caching and session management (optional)
- **PostgreSQL**: For data persistence (optional)
- **Docker**: For containerized deployment (optional)
- **Kubernetes**: For orchestration (optional)

### Operating System Support

- **Linux**: Ubuntu 20.04+, CentOS 8+, Debian 10+
- **macOS**: Big Sur 11.x+
- **Windows**: Windows 10/11 (with WSL2 recommended)

## 🛠️ Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/scte35-encoder.git
cd scte35-encoder
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install FFmpeg (Ubuntu/Debian)
sudo apt update
sudo apt install ffmpeg

# Install FFmpeg (macOS)
brew install ffmpeg

# Install FFmpeg (Windows)
# Download from https://ffmpeg.org/download.html
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Edit environment variables
nano .env.local
```

Configure the essential environment variables:

```env
# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development

# Stream Configuration
FFMPEG_PATH=/usr/bin/ffmpeg
SRT_LAUNCHER_PATH=/usr/local/bin/srt-live-transmit

# Monitoring Configuration
METRICS_INTERVAL=1000
HEALTH_CHECK_INTERVAL=5000

# Security
API_KEY=your-development-api-key
CORS_ORIGIN=http://localhost:3000
```

### 4. Database Setup (Optional)

If using PostgreSQL for persistence:

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres createdb scte35_encoder
sudo -u postgres createuser scte35_user

# Set password
sudo -u postgres psql -c "ALTER USER scte35_user PASSWORD 'your_password';"

# Grant privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE scte35_encoder TO scte35_user;"

# Run migrations
npm run db:migrate
```

### 5. Redis Setup (Optional)

```bash
# Install Redis
sudo apt install redis-server

# Start Redis service
sudo systemctl start redis
sudo systemctl enable redis

# Verify Redis is running
redis-cli ping
# Should return: PONG
```

### 6. Start Development Server

```bash
# Start the development server
npm run dev

# Or with specific port
PORT=3001 npm run dev
```

The application will be available at `http://localhost:3000`.

## 🚀 Production Deployment

### 1. Build the Application

```bash
# Build the production bundle
npm run build

# Run type checking
npm run type-check

# Run tests
npm test

# Run linting
npm run lint
```

### 2. Environment Configuration for Production

Create a production environment file:

```bash
cp .env.example .env.production
```

Configure production settings:

```env
# Application Configuration
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NODE_ENV=production

# Stream Configuration
FFMPEG_PATH=/usr/bin/ffmpeg
SRT_LAUNCHER_PATH=/usr/local/bin/srt-live-transmit

# Database Configuration
DATABASE_URL=postgresql://scte35_user:your_password@localhost:5432/scte35_encoder

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Monitoring Configuration
METRICS_INTERVAL=1000
HEALTH_CHECK_INTERVAL=5000

# Security
API_KEY=your-production-api-key
CORS_ORIGIN=https://your-domain.com

# Performance
CLUSTER_MODE=false
WORKER_COUNT=4
MEMORY_LIMIT=512MB
```

### 3. Production Database Setup

```bash
# Create production database
sudo -u postgres createdb scte35_encoder_prod
sudo -u postgres createuser scte35_prod_user

# Set strong password
sudo -u postgres psql -c "ALTER USER scte35_prod_user PASSWORD 'your_strong_password';"

# Grant privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE scte35_encoder_prod TO scte35_prod_user;"

# Run production migrations
NODE_ENV=production npm run db:migrate
```

### 4. Start Production Server

```bash
# Start the production server
npm start

# Or with PM2 (recommended)
npm install -g pm2
pm2 start ecosystem.config.js
```

Create an ecosystem configuration file for PM2:

```javascript
// ecosystem.config.js
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
```

## 🐳 Docker Deployment

### 1. Create Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat ffmpeg
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

ENV NODE_ENV=production

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

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_BASE_URL=https://your-domain.com
      - DATABASE_URL=postgresql://scte35_user:your_password@postgres:5432/scte35_encoder
      - REDIS_URL=redis://redis:6379
      - FFMPEG_PATH=/usr/bin/ffmpeg
    depends_on:
      - postgres
      - redis
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=scte35_encoder
      - POSTGRES_USER=scte35_user
      - POSTGRES_PASSWORD=your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### 3. Create nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    server {
        listen 80;
        server_name your-domain.com www.your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com www.your-domain.com;

        # SSL configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Gzip compression
        gzip on;
        gzip_vary on;
        gzip_min_length 1024;
        gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

        # Main application
        location / {
            proxy_pass http://app;
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

        # API rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Static files
        location /_next/static/ {
            alias /app/.next/static/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

### 4. Deploy with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Update and redeploy
docker-compose pull
docker-compose up -d --force-recreate
```

## ☸️ Kubernetes Deployment

### 1. Create Kubernetes Manifests

#### Deployment Manifest

```yaml
# deployment.yaml
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
        - name: NEXT_PUBLIC_BASE_URL
          value: "https://your-domain.com"
        - name: REDIS_URL
          value: "redis://redis-service:6379"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: scte35-secret
              key: database-url
        - name: API_KEY
          valueFrom:
            secretKeyRef:
              name: scte35-secret
              key: api-key
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
        volumeMounts:
        - name: logs
          mountPath: /app/logs
      volumes:
      - name: logs
        emptyDir: {}
```

#### Service Manifest

```yaml
# service.yaml
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
  type: ClusterIP
```

#### Ingress Manifest

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: scte35-encoder-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
spec:
  tls:
  - hosts:
    - your-domain.com
    secretName: scte35-tls
  rules:
  - host: your-domain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: scte35-encoder-service
            port:
              number: 80
```

#### Secret Manifest

```yaml
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: scte35-secret
type: Opaque
data:
  database-url: cG9zdGdyZXNxbDovL3NjdGUzNV91c2VyOnlvdXJfc3Ryb25nX3Bhc3N3b3JkQHBvc3RncmVzOjU0MzIvc2N0ZTM1X2VuY29kZXI=
  api-key: eW91cl9wcm9kdWN0aW9uX2FwaV9rZXk=
```

#### ConfigMap Manifest

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: scte35-config
data:
  NEXT_PUBLIC_BASE_URL: "https://your-domain.com"
  METRICS_INTERVAL: "1000"
  HEALTH_CHECK_INTERVAL: "5000"
  WORKER_COUNT: "4"
  MEMORY_LIMIT: "512MB"
```

### 2. Deploy to Kubernetes

```bash
# Apply all manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -l app=scte35-encoder

# View logs
kubectl logs -f deployment/scte35-encoder

# Check services
kubectl get services

# Check ingress
kubectl get ingress
```

### 3. Horizontal Pod Autoscaler

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: scte35-encoder-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: scte35-encoder
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## ☁️ Cloud Platform Deployment

### AWS ECS Deployment

#### 1. Create Task Definition

```json
{
  "family": "scte35-encoder",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::123456789012:role/scte35TaskRole",
  "containerDefinitions": [
    {
      "name": "scte35-encoder",
      "image": "your-registry/scte35-encoder:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "NEXT_PUBLIC_BASE_URL",
          "value": "https://your-domain.com"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:scte35-database-url:password::"
        },
        {
          "name": "API_KEY",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:scte35-api-key:password::"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/scte35-encoder",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "curl -f http://localhost:3000/api/health || exit 1"
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

#### 2. Create Service

```json
{
  "serviceName": "scte35-encoder-service",
  "taskDefinition": "scte35-encoder",
  "loadBalancers": [
    {
      "targetGroupArn": "arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/scte35-target-group/1234567890123456",
      "containerName": "scte35-encoder",
      "containerPort": 3000
    }
  ],
  "desiredCount": 3,
  "launchType": "FARGATE",
  "networkConfiguration": {
    "awsvpcConfiguration": {
      "subnets": ["subnet-12345", "subnet-67890"],
      "securityGroups": ["sg-12345"],
      "assignPublicIp": "ENABLED"
    }
  }
}
```

### Google Cloud Run Deployment

#### 1. Build and Push Docker Image

```bash
# Build Docker image
docker build -t gcr.io/your-project/scte35-encoder:latest .

# Push to Google Container Registry
docker push gcr.io/your-project/scte35-encoder:latest
```

#### 2. Deploy to Cloud Run

```bash
# Deploy to Cloud Run
gcloud run deploy scte35-encoder \
  --image gcr.io/your-project/scte35-encoder:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 1 \
  --set-env-vars \
    NODE_ENV=production,\
    NEXT_PUBLIC_BASE_URL=https://your-domain.com,\
    DATABASE_URL=postgresql://user:password@host:5432/dbname
```

### Azure Container Instances

#### 1. Create Container Group

```bash
# Create resource group
az group create --name scte35-encoder-rg --location eastus

# Create container group
az container create \
  --resource-group scte35-encoder-rg \
  --name scte35-encoder \
  --image your-registry/scte35-encoder:latest \
  --dns-name-label scte35-encoder-unique \
  --ports 80 3000 \
  --environment-variables \
    'NODE_ENV=production' \
    'NEXT_PUBLIC_BASE_URL=https://your-domain.com' \
  --secure-environment-variables \
    'DATABASE_URL=postgresql://user:password@host:5432/dbname' \
    'API_KEY=your-api-key' \
  --cpu 1 \
  --memory 1.5 \
  --restart-policy Always
```

## ⚙️ Configuration Management

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment (development/production) | `development` | Yes |
| `NEXT_PUBLIC_BASE_URL` | Public base URL | `http://localhost:3000` | Yes |
| `PORT` | Application port | `3000` | No |
| `FFMPEG_PATH` | Path to FFmpeg binary | `/usr/bin/ffmpeg` | No |
| `DATABASE_URL` | Database connection string | - | No |
| `REDIS_URL` | Redis connection string | - | No |
| `API_KEY` | API key for authentication | - | No |
| `CORS_ORIGIN` | CORS allowed origins | `http://localhost:3000` | No |
| `METRICS_INTERVAL` | Metrics collection interval (ms) | `1000` | No |
| `HEALTH_CHECK_INTERVAL` | Health check interval (ms) | `5000` | No |
| `WORKER_COUNT` | Number of worker processes | `4` | No |
| `MEMORY_LIMIT` | Memory limit per process | `512MB` | No |

### Configuration Files

#### Next.js Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: []
  },
  images: {
    domains: ['your-domain.com']
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' }
        ]
      }
    ]
  }
};

module.exports = nextConfig;
```

#### TypeScript Configuration

```json
// tsconfig.json
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

## 📊 Monitoring and Logging

### Application Monitoring

#### Health Check Endpoints

```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
}

// src/app/api/ready/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Check database connection
    await db.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'ready',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'not_ready',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}
```

#### Metrics Collection

```typescript
// src/lib/metrics.ts
export class MetricsCollector {
  private metrics: Map<string, number> = new Map();
  
  constructor() {
    this.startCollection();
  }
  
  private startCollection() {
    setInterval(() => {
      this.collectSystemMetrics();
      this.collectApplicationMetrics();
    }, 1000);
  }
  
  private collectSystemMetrics() {
    const usage = process.memoryUsage();
    this.metrics.set('memory_rss', usage.rss);
    this.metrics.set('memory_heap_total', usage.heapTotal);
    this.metrics.set('memory_heap_used', usage.heapUsed);
    this.metrics.set('memory_external', usage.external);
    
    const cpuUsage = process.cpuUsage();
    this.metrics.set('cpu_user', cpuUsage.user);
    this.metrics.set('cpu_system', cpuUsage.system);
  }
  
  private collectApplicationMetrics() {
    // Collect application-specific metrics
    this.metrics.set('active_streams', this.getActiveStreamsCount());
    this.metrics.set('scte35_encodes_per_minute', this.getEncodeRate());
    this.metrics.set('stream_injections_per_minute', this.getInjectionRate());
  }
  
  public getMetrics() {
    return Object.fromEntries(this.metrics);
  }
  
  private getActiveStreamsCount(): number {
    // Implementation depends on your stream tracking
    return 0;
  }
  
  private getEncodeRate(): number {
    // Implementation depends on your metrics tracking
    return 0;
  }
  
  private getInjectionRate(): number {
    // Implementation depends on your metrics tracking
    return 0;
  }
}
```

### Logging Configuration

#### Winston Logger Setup

```typescript
// src/lib/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'scte35-encoder' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;
```

#### Structured Logging

```typescript
// Example usage in API routes
import logger from '@/lib/logger';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    
    logger.info('SCTE-35 encode request received', {
      requestId: generateRequestId(),
      method: 'POST',
      endpoint: '/api/scte35/encode',
      body: sanitizeBody(body)
    });
    
    const result = await encodeSCTE35(body);
    
    logger.info('SCTE-35 encode completed', {
      requestId: generateRequestId(),
      duration: Date.now() - startTime,
      success: true
    });
    
    return NextResponse.json(result);
  } catch (error) {
    logger.error('SCTE-35 encode failed', {
      requestId: generateRequestId(),
      duration: Date.now() - startTime,
      success: false,
      error: error.message,
      stack: error.stack
    });
    
    return NextResponse.json(
      { error: 'Failed to encode SCTE-35' },
      { status: 500 }
    );
  }
}

function generateRequestId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function sanitizeBody(body: any): any {
  // Remove sensitive information from logs
  const { apiKey, ...sanitized } = body;
  return sanitized;
}
```

## 🔒 Security Considerations

### Environment Security

1. **Use Environment Variables**: Never hardcode sensitive information
2. **Secrets Management**: Use proper secrets management (AWS Secrets Manager, Azure Key Vault, etc.)
3. **HTTPS Only**: Always use HTTPS in production
4. **CORS Configuration**: Restrict CORS to specific domains
5. **Rate Limiting**: Implement rate limiting for API endpoints

### Application Security

1. **Input Validation**: Validate all input data
2. **SQL Injection Prevention**: Use parameterized queries
3. **XSS Prevention**: Sanitize user input and use Content Security Policy
4. **Authentication**: Implement proper authentication and authorization
5. **Security Headers**: Set appropriate security headers

### Network Security

1. **Firewall Rules**: Configure firewall rules to restrict access
2. **VPN Access**: Use VPN for administrative access
3. **Network Segmentation**: Separate application, database, and monitoring networks
4. **DDoS Protection**: Implement DDoS protection measures

### Data Security

1. **Encryption**: Encrypt sensitive data at rest and in transit
2. **Backup Strategy**: Implement regular backup procedures
3. **Access Control**: Implement proper access controls
4. **Audit Logging**: Maintain comprehensive audit logs

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

#### 2. Database Connection Issues

```bash
# Check database connectivity
psql -h localhost -U scte35_user -d scte35_encoder

# Check PostgreSQL service status
sudo systemctl status postgresql

# View PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

#### 3. Redis Connection Issues

```bash
# Check Redis connectivity
redis-cli ping

# Check Redis service status
sudo systemctl status redis

# View Redis logs
sudo tail -f /var/log/redis/redis-server.log
```

#### 4. FFmpeg Issues

```bash
# Check FFmpeg installation
ffmpeg -version

# Test FFmpeg functionality
ffmpeg -f lavfi -i testsrc=duration=10:size=320x240:rate=1 -c:v libx264 -t 10 test.mp4
```

#### 5. Memory Issues

```bash
# Check memory usage
free -h

# Check Node.js memory usage
node --inspect index.js

# Monitor memory leaks
npm install -g heapdump
node --expose-gc index.js
```

### Performance Issues

#### 1. High CPU Usage

```bash
# Monitor CPU usage
top -p $(pgrep -f "node.*scte35")

# Check Node.js process details
ps aux | grep node

# Profile CPU usage
node --prof index.js
```

#### 2. High Memory Usage

```bash
# Check memory usage
free -h

# Check Node.js heap usage
node --inspect --heapsnapshot-signal=SIGUSR2 index.js

# Generate heap snapshot
kill -USR2 <PID>
```

#### 3. Slow Response Times

```bash
# Check network latency
ping your-domain.com

# Check response times
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com/api/health

# Monitor network connections
netstat -an | grep :3000
```

### Log Analysis

#### 1. Application Logs

```bash
# View application logs
tail -f logs/combined.log

# Filter error logs
grep "ERROR" logs/combined.log

# Search for specific events
grep "SCTE-35" logs/combined.log
```

#### 2. System Logs

```bash
# View system logs
sudo journalctl -u nginx -f

# View authentication logs
sudo journalctl -u sshd -f

# View system performance logs
sudo journalctl -u systemd --since "1 hour ago"
```

#### 3. Database Logs

```bash
# View PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# View slow queries
sudo tail -f /var/log/postgresql/postgresql-15-slow.log
```

### Health Checks

#### 1. Application Health

```bash
# Check application health
curl https://your-domain.com/api/health

# Check readiness
curl https://your-domain.com/api/ready

# Check metrics
curl https://your-domain.com/api/metrics
```

#### 2. Database Health

```bash
# Check database connectivity
psql -h localhost -U scte35_user -d scte35_encoder -c "SELECT 1;"

# Check database size
psql -h localhost -U scte35_user -d scte35_encoder -c "SELECT pg_size_pretty(pg_database_size('scte35_encoder'));"

# Check active connections
psql -h localhost -U scte35_user -d scte35_encoder -c "SELECT count(*) FROM pg_stat_activity;"
```

#### 3. Redis Health

```bash
# Check Redis connectivity
redis-cli ping

# Check Redis memory usage
redis-cli info memory

# Check Redis slow log
redis-cli slowlog get 10
```

This comprehensive deployment guide should help you successfully deploy and maintain the SCTE-35 Encoder & Stream Injector system in various environments, from development to production-scale deployments.