#!/bin/bash

# PROGRAM Platform Deployment Script
# This script sets up the full-stack application for development or production

set -e

echo "🚀 Starting PROGRAM Platform Deployment"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

# Create environment files if they don't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your actual secrets before running in production!"
fi

if [ ! -f "frontend/.env.local" ]; then
    echo "📝 Creating frontend/.env.local file..."
    cp frontend/.env.example frontend/.env.local
fi

# Function to use docker compose (newer versions) or docker-compose (older)
docker_compose_cmd() {
    if docker compose version &> /dev/null; then
        docker compose "$@"
    else
        docker-compose "$@"
    fi
}

# For production deployment
if [ "$1" = "prod" ]; then
    echo "🏭 Setting up production environment..."

    # Generate secure secrets if not set
    if grep -q "change-me-in-production" .env; then
        echo "🔐 Generating secure secrets..."

        # Generate JWT secrets
        JWT_ACCESS_SECRET=$(openssl rand -hex 32)
        JWT_REFRESH_SECRET=$(openssl rand -hex 32)
        REFRESH_TOKEN_PEPPER=$(openssl rand -hex 32)

        # Update .env file
        sed -i.bak "s/JWT_ACCESS_SECRET=.*/JWT_ACCESS_SECRET=$JWT_ACCESS_SECRET/" .env
        sed -i.bak "s/JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET/" .env
        sed -i.bak "s/REFRESH_TOKEN_PEPPER=.*/REFRESH_TOKEN_PEPPER=$REFRESH_TOKEN_PEPPER/" .env

        echo "✅ Secrets generated and saved to .env"
        echo "⚠️  BACKUP YOUR .env FILE SECURELY!"
    fi

    echo "🐳 Starting production containers..."
    docker_compose_cmd -f docker-compose.prod.yml up -d --build

    echo "⏳ Waiting for services to be healthy..."
    sleep 30

    echo "✅ Production deployment complete!"
    echo "🌐 Frontend: http://localhost"
    echo "🔗 API: http://localhost/api/v1"
    echo "📊 Database: localhost:5432"

# For development deployment
else
    echo "🛠️  Setting up development environment..."

    echo "🐳 Starting development containers..."
    docker_compose_cmd up -d --build

    echo "⏳ Waiting for database to be ready..."
    sleep 10

    echo "✅ Development environment ready!"
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔗 API: http://localhost:4000"
    echo "📊 Database: localhost:5432"
    echo "🔄 Hot reload enabled for both frontend and backend"
fi

echo ""
echo "📚 Useful commands:"
echo "  • View logs: docker_compose_cmd logs -f"
echo "  • Stop services: docker_compose_cmd down"
echo "  • Rebuild: docker_compose_cmd up -d --build"
echo ""
echo "🎉 Happy coding!"