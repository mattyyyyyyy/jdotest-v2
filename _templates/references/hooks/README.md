# 实战 Hook 脚本（Harness 第④层 · 可直接复制）

这 5 个脚本是 [SKILL.md §强制执行机制（Harness 5 层）](../../SKILL.md) 里 `must` 级规则的**可运行实现**，全部用 `exit 2` 拦截（社区 #1 实现 bug：`exit 1` 只告警不拦截）。已在参考项目 jdotest-v2 实跑验证——同一会话里真实拦截过未登记的 `Write`、缺尾标的 `git commit`、`--all` 缺失导致的 openspec 空跑。

阶段 4「落地生成」时，**逐字复制**这 5 个文件到目标项目的 `.claude/hooks/`，再按 [kickoff-templates.md §.claude/settings.json](../kickoff-templates.md) 的模板挂载。这里是脚本的**唯一真相**，markdown 只放说明与指针，不再复制脚本正文。

| 脚本 | 事件 | 强制规则 |
|---|---|---|
| `check-workstream-registered.sh` | PreToolUse(Edit/Write/MultiEdit) | 开工三件套未登记 → 拒绝（豁免 INDEX/CLAUDE/.claude，否则登记动作被自己拦死）|
| `scan-secrets.sh` | PreToolUse(Edit/Write/MultiEdit) | 高置信度密钥/私钥 → 拒绝（只用低误报模式，保 hook 可信）|
| `check-agent-tag.sh` | PreToolUse(Bash) | `git commit` 缺 `agent:` 尾标 → 拒绝（"拒绝补尾标"比"自动改写命令追加"更可靠）|
| `check-index-updated.sh` | PostToolUse(Write/Edit/MultiEdit) | 新增 `docs/**/*.md` 未登记 INDEX → 反馈（防文档孤儿）|
| `openspec-validate.sh` | PostToolUse(Write/Edit/MultiEdit) | 改 `openspec/**` 跑 `validate --all --strict`（必须带 `--all` 否则空跑；CLI 缺失则优雅跳过）|

## 安装

```bash
mkdir -p .claude/hooks
cp <skill>/references/hooks/*.sh .claude/hooks/
chmod +x .claude/hooks/*.sh
# 再把 kickoff-templates.md 的 settings.json hooks 段写进 .claude/settings.json
```

## 依赖与注意

- 全部依赖 `jq`（解析 PreToolUse/PostToolUse 从 stdin 收到的 JSON）。
- `openspec-validate.sh` 在受限 PATH 下运行，已补 homebrew / usr-local / `~/.local/bin`；node/openspec 装在别处（nvm / volta 等）的，在脚本 `export PATH` 行最前面追加你的路径。
- hook schema 是**嵌套结构**（`matcher` 下挂 `"hooks": [{ "type": "command", "command": "…" }]`），不是扁平 `{ "matcher", "command" }`——扁平写法解析不报错但根本不触发。详见 kickoff-templates.md 的 schema 警告。
- 暂未 hook 化、以 `should` 软约束保留的：**文档同步**（源码↔spec/ADR 联动）、**测试 gate**（Stop 前跑 lint/test）——误报率高，规则收敛后再升级，避免噪音削弱护栏可信度。
