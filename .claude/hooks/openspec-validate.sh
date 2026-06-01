#!/usr/bin/env bash
# OpenSpec 严格校验（CLAUDE.md §Feature 级 spec 走 OpenSpec）。
# 编辑 openspec/** 后跑 openspec validate --strict；CLI 未安装则优雅跳过。
set -uo pipefail

input=$(cat)
file_path=$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.filePath // empty')
case "$file_path" in
  *openspec/*) ;;
  *) exit 0 ;;
esac

if ! command -v openspec >/dev/null 2>&1; then
  echo "INFO(openspec): CLI 未安装，跳过 --strict 校验。建议 npm i -g @fission-ai/openspec@latest。" >&2
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
if ! out=$(openspec validate --strict 2>&1); then
  echo "BLOCKED(openspec): validate --strict 失败：" >&2
  echo "$out" >&2
  exit 2
fi
exit 0
