# Contributing

> 本文给**人类贡献者**；给 **AI agent** 的工作说明书是 [CLAUDE.md](./CLAUDE.md)（两者互相引用，不重复内容）。

## 编辑前（开工三件套 · hook 强制）

1. 读 [CLAUDE.md](./CLAUDE.md)（协作公约 + 锁定结论）
2. 读 [docs/INDEX.md](./docs/INDEX.md)：看 §Active Workstreams 是否他人在做、§Ownership Zones 路径归属
3. 在 §Active Workstreams append 一行登记本次工作

> 未登记直接编辑会被 `.claude/hooks/check-workstream-registered.sh` 拒绝（`exit 2`）。

## 完成定义 Definition of Done

- [ ] 文档已更新（唯一真相：改 schema 先改 backend-spec、改 API 先改 api-contracts）
- [ ] 已补测试，或明确说明跳过原因（深模块必须随实现写单测）
- [ ] `pnpm lint` / `typecheck` / `test` / `build` 通过
- [ ] 需记录的决策已写入 ADR；改 feature 行为走 OpenSpec change → archive
- [ ] INDEX 状态已同步（workstream 移到 Recent Activity，附 commit）

## Pull Request

- 用 [PR 模板](./.github/PULL_REQUEST_TEMPLATE.md)，贴测试命令 + 关键输出
- 关联 requirement / scope / ADR / open-question
- 标出风险与回滚方式

## Commit 规范

[Conventional Commits](https://www.conventionalcommits.org/)：`feat` / `fix` / `docs` / `refactor` / `test` / `chore` / `perf` / `style`。

**末尾必须追加** `agent: claude-<short-context>`（由 `.claude/hooks/check-agent-tag.sh` 强制；人类提交也建议带 `agent: human-<name>` 便于 `git log` 追溯）。

## 路径所有权

见 [docs/INDEX.md §Ownership Zones](./docs/INDEX.md) 与 [.github/CODEOWNERS](./.github/CODEOWNERS)。改别人 zone 的文件前先在对应文档协调。append-only 协作区（INDEX §Active Workstreams / §Recent Activity）只增不改删别人的行。

## 报告问题

- bug → Issue + 重现步骤 + 期望 / 实际
- 安全 / 密钥泄漏 → 不要开公开 Issue
- 文档错误 → 直接开 PR
