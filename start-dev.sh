#!/bin/bash

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :"$1" >/dev/null 2>&1
}

# Check if pnpm is installed
if ! command_exists pnpm; then
    echo "Error: pnpm is not installed. Please install pnpm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    pnpm install
fi

# Default dev port for Vite
DEV_PORT=${DEV_PORT:-5173}

# Check and free the port if necessary
if port_in_use "$DEV_PORT"; then
    echo "Port $DEV_PORT is in use. Attempting to free it..."
    PID=$(lsof -ti :"$DEV_PORT")
    if [ -n "$PID" ]; then
        kill -9 "$PID" || true
        echo "Freed port $DEV_PORT (killed PID $PID)."
    fi
fi

echo "Starting landing dev server on port $DEV_PORT..."
pnpm --filter landing dev -- --port "$DEV_PORT"