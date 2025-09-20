#!/bin/bash
set -e  # stop on first error

REPO="git@github.com:aboamera/cnrc.git"

echo "📄 Creating README.md..."
echo "# cnrc" > README.md

echo "📂 Initializing git repository..."
git init

echo "➕ Adding all files..."
git add -A   # safer than "git add *"

echo "💾 Committing..."
git commit -m "first commit"

echo "🌿 Renaming branch to master..."
git branch -M master

echo "🔗 Adding remote origin: $REPO"
git remote add origin $REPO

echo "🚀 Pushing to GitHub..."
git push -u origin master

echo "✅ Repository initialized and pushed successfully!"

# chmod +x init-repo.sh
# ./init-repo.sh