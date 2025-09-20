#!/bin/bash
set -e

REPO="git@github.com:aboamera/cnrc.git"

echo "📄 Ensuring README.md exists..."
echo "# cnrc" > README.md

if [ ! -d ".git" ]; then
  echo "📂 Initializing new git repository..."
  git init
else
  echo "📂 Git repo already exists, skipping init."
fi

echo "➕ Adding all files..."
git add -A

echo "💾 Committing..."
git commit -m "first commit" || echo "⚠️ Nothing to commit"

echo "🌿 Setting branch to master..."
git branch -M master

echo "🔗 Adding remote origin..."
git remote remove origin 2>/dev/null || true
git remote add origin $REPO

echo "🚀 Pushing to GitHub..."
git push -u origin master

echo "✅ Done!"


# chmod +x init-repo.sh
# ./init-repo.sh