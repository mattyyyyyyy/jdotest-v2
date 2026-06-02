#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ADB="${ADB:-$HOME/Library/Android/sdk/platform-tools/adb}"
SERIAL="${ANDROID_SERIAL:-emulator-5554}"
APK="$ROOT/app/build/outputs/apk/debug/app-debug.apk"
UI_ACTION="$ROOT/scripts/ui_action.py"
API_BASE="${API_BASE:-$(node "$ROOT/scripts/api-base.mjs" "$ROOT/app/build.gradle.kts")}"

dump() {
  "$ADB" -s "$SERIAL" exec-out uiautomator dump /dev/tty > "$1"
}

wait_for() {
  local xml="$1"
  local needle="$2"
  shift 2
  for _ in 1 2 3 4 5 6 7 8; do
    dump "$xml"
    if python3 "$UI_ACTION" assert "$xml" "$needle" "$@" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  echo "UI node not found after waiting: $needle" >&2
  return 1
}

tap_and_wait() {
  local needle="$1"
  local expected="$2"
  local tap_mode="${3:-exact}"
  local expected_mode="${4:-exact}"
  local tap_args=()
  local expected_args=()
  [[ "$tap_mode" == "contains" ]] && tap_args+=(--contains)
  [[ "$expected_mode" == "contains" ]] && expected_args+=(--contains)
  for attempt in 1 2 3; do
    dump /private/tmp/jdo-regression-live.xml
    local coords
    if coords="$(python3 "$UI_ACTION" tap /private/tmp/jdo-regression-live.xml "$needle" "${tap_args[@]}")"; then
      "$ADB" -s "$SERIAL" shell input tap $coords
      if wait_for /private/tmp/jdo-regression-target.xml "$expected" "${expected_args[@]}"; then
        return 0
      fi
    fi
    echo "[emulator] retry tap '$needle' ($attempt/3)"
  done
  echo "failed to open target '$expected' from '$needle'" >&2
  return 1
}

echo "[emulator] seed selected cart item"
curl -fsS -X POST "$API_BASE/cart/items" -H 'Content-Type: application/json' \
  --data '{"productId":"e1","qty":1,"spec":"回归测试"}' >/dev/null

echo "[emulator] install and launch"
"$ADB" -s "$SERIAL" install -r "$APK" >/dev/null
"$ADB" -s "$SERIAL" logcat -c
"$ADB" -s "$SERIAL" shell am force-stop com.jdo.ivi
"$ADB" -s "$SERIAL" shell am start -n com.jdo.ivi/.MainActivity >/dev/null
sleep 2

tap_and_wait JD 商城
tap_and_wait cart 购物车 exact contains
tap_and_wait 去结算 确认订单 contains contains
tap_and_wait 提交订单 扫码支付
tap_and_wait 我已支付 我的订单
dump /private/tmp/jdo-regression-orders.xml
python3 "$UI_ACTION" assert /private/tmp/jdo-regression-orders.xml 待发货

node --input-type=module - "$API_BASE" <<'NODE'
const api = process.argv[2];
const body = await fetch(`${api}/orders`).then((res) => res.json());
if (!body.items?.length) throw new Error('orders response is empty');
if (body.items[0].status !== 'PAID') throw new Error(`latest order should be PAID, got ${body.items[0].status}`);
console.log(`[emulator] latest backend order ${body.items[0].id} is PAID`);
NODE

CRASH="$("$ADB" -s "$SERIAL" logcat -b crash -d)"
if [[ -n "$CRASH" ]]; then
  echo "$CRASH"
  exit 1
fi
echo "[emulator] payment loop ok, crash buffer empty"
