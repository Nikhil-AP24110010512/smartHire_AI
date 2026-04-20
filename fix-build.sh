#!/bin/bash

echo "🚀 Starting Smart Build Fixer..."

# 1. Flatten the directory if needed
if [ -d "dist/client" ]; then
    echo "📂 Flattening dist/client structure..."
    cp -r dist/client/* dist/
    rm -rf dist/client dist/server
fi

# 2. Ensure index.html exists in dist
if [ ! -f "dist/index.html" ]; then
    echo "📄 Copying base index.html to dist..."
    cp index.html dist/index.html
fi

# 3. Find the main entry point (usually assets/index-*.js)
ENTRY_FILE=$(ls dist/assets/index-*.js 2>/dev/null | head -n 1 | sed 's|dist/||')

if [ -n "$ENTRY_FILE" ]; then
    echo "✅ Found bundled entry point: $ENTRY_FILE"
    echo "🛠 Fixing entry point in dist/index.html..."
    
    # Use a more flexible search for the src path
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|src=\"/src/main.tsx\"|src=\"/$ENTRY_FILE\"|g" dist/index.html
    else
        sed -i "s|src=\"/src/main.tsx\"|src=\"/$ENTRY_FILE\"|g" dist/index.html
    fi
    
    echo "✨ Resulting script tag in dist/index.html:"
    grep "script" dist/index.html
else
    echo "❌ Error: Could not find bundled entry point in dist/assets/"
    ls -R dist/
fi
