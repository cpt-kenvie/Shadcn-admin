#!/bin/bash
echo "Building HTEC Docker image..."
cd "$(dirname "$0")/../.."
docker build -f admin/docker/Dockerfile -t htec:latest .
echo "Build complete!"
echo ""
echo "To run: docker-compose -f admin/docker/docker-compose.yml up -d"
