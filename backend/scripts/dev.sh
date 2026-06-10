#!/usr/bin/env bash
set -euo pipefail

CONTAINER_NAME="pulsecheck-db"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

if ! docker info >/dev/null 2>&1; then
  echo "Docker is not running. Start Docker Desktop, then try again."
  exit 1
fi

if docker ps -a --format '{{.Names}}' | grep -qx "${CONTAINER_NAME}"; then
  echo "Starting Postgres container (${CONTAINER_NAME})..."
  docker start "${CONTAINER_NAME}" >/dev/null
else
  echo "Creating Postgres container (${CONTAINER_NAME})..."
  docker run --name "${CONTAINER_NAME}" \
    -e POSTGRES_PASSWORD=postgres \
    -e POSTGRES_DB=pulsecheck \
    -p 5432:5432 \
    -d postgres:16 >/dev/null
fi

echo "Waiting for Postgres to be ready..."
until docker exec "${CONTAINER_NAME}" pg_isready -U postgres -q; do
  sleep 1
done

cd "${BACKEND_DIR}"

echo "Starting Prisma Studio at http://localhost:5555 ..."
npx prisma studio --port 5555 --browser none &
STUDIO_PID=$!

cleanup() {
  kill "${STUDIO_PID}" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "Starting API server at http://localhost:3000 ..."
npx tsx watch src/index.ts
