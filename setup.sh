#!/bin/bash

echo "🐶 Setting up Husky with commitlint..."

pnpm add -D husky @commitlint/config-conventional @commitlint/cli
pnpm exec husky init

cat > commitlint.config.js << 'EOF'
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'ci', 'perf', 'revert']],
    'subject-empty': [2, 'never'],
    'type-empty': [2, 'never'],
    'subject-max-length': [2, 'always', 72],
  },
}
EOF

cat > .husky/pre-commit << 'EOF'
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

echo "➡️ Linting staged files..."
pnpm lint || { echo "❌ Lint failed"; exit 1; }

echo "✅ Pre-commit passed"
EOF

chmod +x .husky/pre-commit

cat > .husky/commit-msg << 'EOF'
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Checking commit message..."

pnpm exec commitlint --edit "$1" || { echo "❌ Invalid commit message"; exit 1; }

echo "✅ Commit message valid"
EOF

chmod +x .husky/commit-msg

cat > .husky/pre-push << 'EOF'
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running pre-push checks..."

echo "➡️ Running full lint..."
pnpm lint || { echo "❌ Lint failed"; exit 1; }

echo "➡️ Running type check..."
pnpm typecheck || { echo "❌ Type check failed"; exit 1; }

echo "➡️ Running build..."
pnpm build || { echo "❌ Build failed"; exit 1; }

echo "✅ All checks passed. Pushing..."
EOF

chmod +x .husky/pre-push

echo "✅ Husky setup complete!"
echo ""
echo "Hooks installed:"
echo "  • pre-commit: lint"
echo "  • commit-msg: conventional commits"
echo "  • pre-push: lint + typecheck + build"
echo ""
echo "Valid commit messages:"
echo "  feat: add user authentication"
echo "  fix: resolve login redirect bug"
echo "  docs: update API documentation"
echo "  refactor: simplify dashboard layout"