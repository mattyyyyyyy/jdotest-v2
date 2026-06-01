## 摘要

<本 PR 改了什么，1-2 句>

## 动机

<为什么改，关联哪个 requirement / scope / ADR / open-question>

## 测试证据（Observability · Harness 第⑤层）

- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] e2e（如适用）

实际命令与输出（贴关键片段，"我觉得做完了"不算做完）：

```
$ pnpm test
...
```

## 关联

- Requirement / Scope：
- ADR：
- OpenSpec change：
- Open question：

## 文档同步（唯一真相）

- [ ] 涉及的 `openspec` spec / ADR / `docs/INDEX.md` 已同步
- [ ] 改 schema 已先改 [backend-spec.md](../docs/backend-spec.md)；改 API 字段已先改 [api-contracts.md](../docs/api-contracts.md)
- [ ] 如有新约束，已写入 [constraints.md](../docs/constraints.md)
- [ ] 如有 open question 解决，已在 [open-questions.md](../docs/open-questions.md) 标"已解决"（保留指针）
- [ ] 完工已把 INDEX §Active Workstreams 行移到 §Recent Activity（附 commit）

## 风险

- 风险：
- 回滚方式：

> commit message 末尾需带 `agent: claude-<short-context>`（hook 强制）。
