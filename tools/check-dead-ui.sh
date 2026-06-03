#!/usr/bin/env bash
# 护栏：抓消费端 Compose 屏里的「死按钮」——交互控件带空 handler（点了没反应）。
# 命中即失败。故意的无操作请在该行加注释 `// dead-ok: <原因>` 显式放行。
# 背景：纯靠后端单测会漏掉这类 UI 坑（详见 docs/testing-strategy.md）。
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SCR="$ROOT/apps/android-ivi/app/src/main/java/com/jdo/ivi/ui/screens"
[ -d "$SCR" ] || { echo "跳过：未找到 $SCR"; exit 0; }

# 交互控件 + 空 lambda：clickable{}, onClick={}, 及项目按钮组件后跟空 {}
PATTERN='clickable *\{ *\}|onClick *= *\{ *\}|(OutlineButton|PrimaryButton|IconBtn|QuickTile|Chip|ProfileTile|SettingsSwitch|TextButton|Tile)\([^{]*\) *\{ *\}'

hits=$(grep -rnE "$PATTERN" "$SCR" 2>/dev/null | grep -vE 'dead-ok' || true)

if [ -n "$hits" ]; then
  echo "❌ 发现死按钮（交互控件空 handler，点了没反应）："
  echo "$hits" | sed 's/^/   /'
  echo ""
  echo "→ 修复：给它真实动作，或删掉这个可点控件。"
  echo "→ 确属故意无操作（如当前页的 tab）：该行加 // dead-ok: <原因>"
  exit 1
fi
echo "✅ 无死按钮（消费端屏交互控件均有 handler 或已 dead-ok 放行）"
