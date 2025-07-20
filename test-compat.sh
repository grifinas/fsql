#!/usr/bin/env bash

clear
# Ensure we're using a clean PATH to avoid Windows path issues in WSL
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

# Add NVM directory if it exists
if [ -d "$HOME/.nvm" ]; then
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
fi

# Get the project root directory from the test file path
PROJECT_ROOT="/mnt/d/backup/projects/monorepo/typescript/sqlparse"

# Convert paths to WSL format
TEST_FILE=$(wslpath "$1")

# Change to the project directory
cd "$PROJECT_ROOT"

# Run Jest with the converted paths
echo "Running jest with:"
echo "Test file: $TEST_FILE"
echo "Project root: $PROJECT_ROOT"

node "$PROJECT_ROOT/node_modules/jest/bin/jest.js" "$TEST_FILE" \
    --config="$PROJECT_ROOT/jest.config.ts" "${@:3}" 
    #| tee "$PROJECT_ROOT/jest_output.log"