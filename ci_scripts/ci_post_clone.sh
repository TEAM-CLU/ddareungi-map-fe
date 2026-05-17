#!/bin/sh
set -e

REPOSITORY_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPOSITORY_ROOT"

if [ ! -d "node_modules/react-native" ]; then
  if command -v corepack >/dev/null 2>&1; then
    corepack enable
  fi

  if ! command -v pnpm >/dev/null 2>&1; then
    npm install -g pnpm
  fi

  pnpm install --frozen-lockfile
fi

if ! command -v bundle >/dev/null 2>&1; then
  gem install bundler
fi

bundle config set path vendor/bundle
bundle install

cd ios
bundle exec pod install
