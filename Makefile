.PHONY: help install build lint lint-fix format format-check typecheck test clean pre-pr check-all

# Default target
help:
	@echo "Available commands:"
	@echo "  make install       - Install dependencies"
	@echo "  make build         - Build TypeScript to dist/"
	@echo "  make lint          - Run ESLint"
	@echo "  make lint-fix      - Fix linting issues"
	@echo "  make format        - Format code with Prettier"
	@echo "  make format-check  - Check code formatting"
	@echo "  make typecheck     - Run TypeScript type check"
	@echo "  make test          - Run tests"
	@echo "  make clean         - Remove build artifacts and node_modules"
	@echo "  make pre-pr        - Run all checks before creating PR"
	@echo "  make check-all     - Run all quality checks"

# Install dependencies
install:
	npm ci

# Build project
build:
	npm run build

# Run ESLint
lint:
	npm run lint

# Fix linting issues
lint-fix:
	npm run lint:fix

# Format code with Prettier
format:
	npm run format

# Check code formatting
format-check:
	npm run format:check

# Run TypeScript type check
typecheck:
	npm run typecheck

# Run tests
test:
	npm test

# Clean build artifacts and dependencies
clean:
	rm -rf dist node_modules package-lock.json

# Run all checks before creating PR (quality gate)
pre-pr: build lint typecheck format-check
	@echo ""
	@echo "✅ All pre-PR checks passed!"
	@echo ""
	@echo "You can now create a PR."

# Run all quality checks
check-all: lint format-check typecheck test
	@echo ""
	@echo "✅ All checks passed!"
