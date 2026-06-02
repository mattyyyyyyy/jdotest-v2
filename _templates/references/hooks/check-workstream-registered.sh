#!/usr/bin/env bash
# 开工三件套强制（CLAUDE.md §开工三件套 / §Harness 第④层）。
# 规则：编辑任何业务文件前，docs/INDEX.md §Active Workstreams 必须已有真实登记行。
# 拦截必须用 exit 2（exit 1 只告警不拦截，这是社区 #1 实现 bug）。需要 jq。
set -uo pipefail

input=$(cat)
file_path=$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.filePath // empty')

# 豁免协作元文件本身：登记/护栏动作必须能写进去，否则死锁
case "$file_path" in
  */docs/INDEX.md|docs/INDEX.md|*/CLAUDE.md|CLAUDE.md|*/.claude/*|.claude/*) exit 0 ;;
esac

INDEX="${CLAUDE_PROJECT_DIR:-.}/docs/INDEX.md"
if [ ! -f "$INDEX" ]; then
  echo "BLOCKED(开工三件套): 找不到 $INDEX，无法校验登记。请先创建 docs/INDEX.md。" >&2
  exit 2
fi

# 取 Active Workstreams 到 Ownership Zones 之间的内容
section=$(awk '/Active Workstreams/{f=1} /Ownership Zones/{f=0} f' "$INDEX")
# 数据行 = 以 | 开头，排除表头(Agent)、分隔行(|---|)、占位行(暂无登记)
rows=$(printf '%s\n' "$section" | grep -E '^\|' | grep -vE '^\| *Agent|^\|[ :|-]+\|?$|暂无登记' || true)

if [ -z "$rows" ]; then
  echo "BLOCKED(开工三件套): docs/INDEX.md §Active Workstreams 仍是空/占位，未见任何在做登记。" >&2
  echo "请先 append 一行再编辑：| agent-id | 工作范围 | 起始 | 涉及文件 | 🔵 in-progress |" >&2
  exit 2
fi
exit 0
