#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO="$(cd "$ROOT/../.." && pwd)"
GRADLE_BIN="${GRADLE_BIN:-$HOME/.local/gradle-8.14.3/bin/gradle}"

echo "[1/4] native source contracts"
node "$ROOT/scripts/check-native-contracts.mjs"

echo "[2/4] API regression"
(cd "$REPO" && pnpm --filter @jdo/api test && pnpm --filter @jdo/api typecheck)

echo "[3/4] Android debug build"
(cd "$ROOT" && \
  GRADLE_USER_HOME="${GRADLE_USER_HOME:-/private/tmp/jdo-gradle-home}" \
  ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}" \
  JAVA_HOME="${JAVA_HOME:-/Applications/Android Studio.app/Contents/jbr/Contents/Home}" \
  "$GRADLE_BIN" --no-daemon :app:assembleDebug)

echo "[4/4] optional emulator smoke"
if [[ "${1:-}" == "--emulator" ]]; then
  "$ROOT/scripts/emulator-payment-smoke.sh"
else
  echo "skip (run with --emulator to exercise cart -> checkout -> paid -> orders)"
fi

echo "regression ok"
