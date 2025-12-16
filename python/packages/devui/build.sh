#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "Starting build process..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Step 0: Generate/update version number
echo "Updating version number..."
CURRENT_DATE=$(date +%y%m%d)
CURRENT_VERSION=$(grep 'version = ' pyproject.toml | head -1 | sed 's/.*version = "\([^"]*\)".*/\1/')
echo "Current version: $CURRENT_VERSION"

# Extract current date and increment number from version using sed
VERSION_DATE=$(echo "$CURRENT_VERSION" | sed -n 's/^1\.0\.0b\([0-9]\{6\}\)\([0-9]\{2\}\)$/\1/p')
VERSION_INCREMENT=$(echo "$CURRENT_VERSION" | sed -n 's/^1\.0\.0b\([0-9]\{6\}\)\([0-9]\{2\}\)$/\2/p')

if [ -n "$VERSION_DATE" ] && [ -n "$VERSION_INCREMENT" ]; then
    if [ "$VERSION_DATE" = "$CURRENT_DATE" ]; then
        # Same date, increment the number
        NEW_INCREMENT=$(printf "%02d" $((VERSION_INCREMENT + 1)))
        NEW_VERSION="1.0.0b${CURRENT_DATE}${NEW_INCREMENT}"
    else
        # New date, start with 01
        NEW_VERSION="1.0.0b${CURRENT_DATE}01"
    fi
else
    # Fallback if version doesn't match expected pattern
    NEW_VERSION="1.0.0b${CURRENT_DATE}01"
fi

echo "New version: $NEW_VERSION"
# Use a more robust approach to update the version
python3 -c "
import re
with open('pyproject.toml', 'r') as f:
    content = f.read()
content = re.sub(r'version = \"[^\"]*\"', f'version = \"$NEW_VERSION\"', content)
with open('pyproject.toml', 'w') as f:
    f.write(content)
"

# Clean up any existing build artifacts
echo "Cleaning up existing build artifacts..."
rm -rf dist/ build/ *.egg-info/ agent_framework_devui_extended/

# Step 1: Copy agent_framework_devui to agent_framework_devui_extended
echo "Copying agent_framework_devui to agent_framework_devui_extended..."
cp -r agent_framework_devui agent_framework_devui_extended

# Step 2: Build frontend
echo "Building frontend..."
cd frontend
if command -v yarn > /dev/null 2>&1; then
    yarn install
    yarn build
else
    echo "Error: yarn is not installed. Please install yarn first."
    exit 1
fi
cd ..

# Step 3: Build Python distribution
echo "Building Python distribution..."
if command -v python > /dev/null 2>&1; then
    python -m pip install --upgrade pip
    python -m pip install --upgrade build
    python -m build
else
    echo "Error: python is not installed or not in PATH."
    exit 1
fi

# Step 4: Clean up - remove the copied directory
echo "Cleaning up copied directory..."
rm -rf agent_framework_devui_extended/

echo "Build completed successfully!"
echo "Distribution files are available in the 'dist/' directory."
echo "Final version: $NEW_VERSION"

echo -e "${GREEN}Build completed successfully!${NC}"
echo -e "${GREEN}Distribution files are available in the 'dist/' directory.${NC}"
