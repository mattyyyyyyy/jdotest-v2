#!/usr/bin/env bash
# commit 自报家门（CLAUDE.md §Commit 自报家门）。
# git commit 的 message 必须带 `agent:` 尾标，否则拒绝。需要 jq。
# 注：选「拒绝」而非 PreToolUse 改写命令「自动追加」——改写命令脆弱（引号/多 -m/heredoc 都易错），
#     拒绝 + 可执行反馈让 agent 自己补，更可靠。
set -uo pipefail

input=$(cat)
cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // empty')
[ -z "$cmd" ] && exit 0

# 只拦 git commit（带 message 的）。--amend/-C/--no-edit 等沿用已有 message 的放行
printf '%s' "$cmd" | grep -qE 'git +commit' || exit 0
printf '%s' "$cmd" | grep -qE -- '--amend|--no-edit|-C |--reuse-message' && exit 0
# 没有 -m / -F 的交互式 commit 本环境不支持，留给其它机制
printf '%s' "$cmd" | grep -qE -- '-m|--message|-F|--file' || exit 0

if printf '%s' "$cmd" | grep -q 'agent:'; then
  exit 0
fi
echo "BLOCKED(commit 自报家门): commit message 末尾需追加一行 'agent: claude-<short-context>'。" >&2
echo "例：git commit -m \"feat: ...\" -m \"agent: claude-harness-reconcile\"" >&2
exit 2
