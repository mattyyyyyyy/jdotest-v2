#!/usr/bin/env bash
# OpenSpec 严格校验（CLAUDE.md §Feature 级 spec 走 OpenSpec）。
# 编辑 openspec/** 后跑 openspec validate --all --strict；CLI 未安装则优雅跳过。需要 jq。
set -uo pipefail

# hook 在受限 PATH 下运行，主动把常见 node/openspec 位置补进来。
# 若你的 node/openspec 装在别处（如 nvm / volta / ~/.local/node20/bin），在下行最前面追加它。
export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.local/bin:$PATH"
export OPENSPEC_TELEMETRY=0

input=$(cat)
file_path=$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.filePath // empty')
case "$file_path" in
  *openspec/*) ;;
  *) exit 0 ;;
esac

if ! command -v openspec >/dev/null 2>&1; then
  echo "INFO(openspec): CLI 未安装，跳过校验。装法：npm i -g @fission-ai/openspec@latest。" >&2
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
# 注意：必须带 --all（或 --changes/--specs），单跑 `validate --strict` 是空跑（"Nothing to validate"）
if ! out=$(openspec validate --all --strict 2>&1); then
  echo "BLOCKED(openspec): validate --all --strict 失败：" >&2
  echo "$out" >&2
  exit 2
fi
exit 0
