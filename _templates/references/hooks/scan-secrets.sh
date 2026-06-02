#!/usr/bin/env bash
# 密钥扫描（CLAUDE.md §Harness：真密钥永不入仓）。
# 写入内容命中高置信度密钥模式 → 拒绝。只用低误报模式，保持 hook 可信。需要 jq。
set -uo pipefail

input=$(cat)
content=$(printf '%s' "$input" | jq -r '[.tool_input.content, .tool_input.new_string, .tool_input.replacement] | map(select(. != null)) | join("\n")')
[ -z "$content" ] && exit 0

# 高置信度密钥/私钥模式（AWS / 各类私钥 / OpenAI / GitHub PAT / Slack / Google API）
patterns='(AKIA[0-9A-Z]{16})|(-----BEGIN [A-Z ]*PRIVATE KEY-----)|(sk-[A-Za-z0-9]{20,})|(ghp_[A-Za-z0-9]{36})|(xox[baprs]-[A-Za-z0-9-]{10,})|(AIza[0-9A-Za-z_-]{35})'
if printf '%s' "$content" | grep -qE "$patterns"; then
  echo "BLOCKED(密钥扫描): 写入内容疑似包含密钥/私钥。仓库内只放占位值，真密钥走 .env / secret manager。" >&2
  exit 2
fi
exit 0
