#!/usr/bin/env bash
# 防文档孤儿（CLAUDE.md §第一原则；skill 反模式「文档孤儿」）。
# 写入 docs/**/*.md 后，若文件名未被 docs/INDEX.md 引用 → 反馈提醒（PostToolUse exit 2 把反馈喂回 agent）。
set -uo pipefail

input=$(cat)
file_path=$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.filePath // empty')
case "$file_path" in
  *docs/*.md) ;;
  *) exit 0 ;;
esac

base=$(basename "$file_path")
[ "$base" = "INDEX.md" ] && exit 0

INDEX="${CLAUDE_PROJECT_DIR:-.}/docs/INDEX.md"
[ -f "$INDEX" ] || exit 0

if ! grep -qF "$base" "$INDEX"; then
  echo "REMINDER(防孤儿): $file_path 尚未登记到 docs/INDEX.md。" >&2
  echo "请在 INDEX 对应小节加一行（标题链接 / 一句话摘要 / 状态 / 日期），否则成为文档孤儿。" >&2
  exit 2
fi
exit 0
