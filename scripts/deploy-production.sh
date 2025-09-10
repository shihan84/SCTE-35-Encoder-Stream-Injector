#!/bin/bash

# Enterprise SCTE-35 Encoder Production Deployment Script
set -e

echo "🚀 Starting Enterprise SCTE-35 Encoder Production Deployment..."

# Configuration
NAMESPACE="scte35-system"
APP_NAME="scte35-encoder"
VERSION=${1:-"latest"}
ENVIRONMENT=${2:-"production"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        log_error "docker is not installed"
        exit 1
    fi
    
    if ! kubectl cluster-info &> /dev/null; then
        log_error "kubectl is not connected to a cluster"
        exit 1
    fi
    
    log_info "Prerequisites check passed"
}

# Build Docker image
build_image() {
    log_info "Building Docker image..."
    
    docker build -f infrastructure/docker/Dockerfile.production -t ${APP_NAME}:${VERSION} .
    
    if [ $? -eq 0 ]; then
        log_info "Docker image built successfully"
    else
        log_error "Failed to build Docker image"
        exit 1
    fi
}

# Run tests
run_tests() {
    log_info "Running tests..."
    
    # Unit tests
    npm run test:unit
    
    # Integration tests
    npm run test:integration
    
    # Security scan
    npm audit --audit-level=high
    
    log_info "Tests completed successfully"
}

# Create namespace
create_namespace() {
    log_info "Creating namespace ${NAMESPACE}..."
    
    kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
    
    log_info "Namespace ${NAMESPACE} ready"
}

# Deploy secrets
deploy_secrets() {
    log_info "Deploying secrets..."
    
    # Check if secrets exist
    if kubectl get secret scte35-secrets -n ${NAMESPACE} &> /dev/null; then
        log_warn "Secrets already exist, skipping..."
        return
    fi
    
    # Create secrets from environment variables
    kubectl create secret generic scte35-secrets \
        --from-literal=database-url="${DATABASE_URL}" \
        --from-literal=redis-url="${REDIS_URL}" \
        --from-literal=jwt-secret="${JWT_SECRET}" \
        -n ${NAMESPACE}
    
    log_info "Secrets deployed successfully"
}

# Deploy application
deploy_application() {
    log_info "Deploying application..."
    
    # Update image version in Kubernetes manifest
    sed -i "s|image: scte35-encoder:.*|image: scte35-encoder:${VERSION}|g" infrastructure/kubernetes/scte35-encoder.yaml
    
    # Apply Kubernetes manifests
    kubectl apply -f infrastructure/kubernetes/scte35-encoder.yaml
    
    # Wait for deployment to be ready
    kubectl wait --for=condition=available --timeout=300s deployment/scte35-encoder -n ${NAMESPACE}
    
    log_info "Application deployed successfully"
}

# Run health checks
health_check() {
    log_info "Running health checks..."
    
    # Get service URL
    SERVICE_URL=$(kubectl get service scte35-encoder-service -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    
    if [ -z "$SERVICE_URL" ]; then
        SERVICE_URL="localhost:3000"
    fi
    
    # Wait for service to be ready
    sleep 30
    
    # Check health endpoint
    if curl -f http://${SERVICE_URL}/api/health; then
        log_info "Health check passed"
    else
        log_error "Health check failed"
        exit 1
    fi
    
    # Check metrics endpoint
    if curl -f http://${SERVICE_URL}/api/metrics; then
        log_info "Metrics endpoint accessible"
    else
        log_warn "Metrics endpoint not accessible"
    fi
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    # Get a pod name
    POD_NAME=$(kubectl get pods -n ${NAMESPACE} -l app=scte35-encoder -o jsonpath='{.items[0].metadata.name}')
    
    if [ -n "$POD_NAME" ]; then
        kubectl exec -n ${NAMESPACE} ${POD_NAME} -- npx prisma migrate deploy
        log_info "Database migrations completed"
    else
        log_error "No pods found for migration"
        exit 1
    fi
}

# Cleanup old resources
cleanup() {
    log_info "Cleaning up old resources..."
    
    # Remove old replicasets
    kubectl delete replicaset -l app=scte35-encoder -n ${NAMESPACE} --field-selector=status.replicas=0
    
    # Remove old images (keep last 3 versions)
    docker images ${APP_NAME} --format "table {{.Tag}}" | tail -n +4 | xargs -r docker rmi ${APP_NAME}:
    
    log_info "Cleanup completed"
}

# Main deployment flow
main() {
    log_info "Starting deployment for version ${VERSION} in environment ${ENVIRONMENT}"
    
    check_prerequisites
    run_tests
    build_image
    create_namespace
    deploy_secrets
    deploy_application
    run_migrations
    health_check
    cleanup
    
    log_info "🎉 Deployment completed successfully!"
    log_info "Application is available at: http://scte35-encoder.company.com"
    log_info "Metrics endpoint: http://scte35-encoder.company.com/api/metrics"
    log_info "Health endpoint: http://scte35-encoder.company.com/api/health"
}

# Rollback function
rollback() {
    log_warn "Rolling back to previous version..."
    
    # Get previous deployment
    PREVIOUS_VERSION=$(kubectl get deployment scte35-encoder -n ${NAMESPACE} -o jsonpath='{.metadata.annotations.deployment\.kubernetes\.io/revision}')
    
    if [ -n "$PREVIOUS_VERSION" ]; then
        kubectl rollout undo deployment/scte35-encoder -n ${NAMESPACE}
        kubectl rollout status deployment/scte35-encoder -n ${NAMESPACE}
        log_info "Rollback completed"
    else
        log_error "No previous version found for rollback"
        exit 1
    fi
}

# Handle command line arguments
case "${3:-deploy}" in
    "deploy")
        main
        ;;
    "rollback")
        rollback
        ;;
    *)
        echo "Usage: $0 [VERSION] [ENVIRONMENT] [COMMAND]"
        echo "Commands: deploy, rollback"
        echo "Example: $0 v1.0.1 production deploy"
        exit 1
        ;;
esac
