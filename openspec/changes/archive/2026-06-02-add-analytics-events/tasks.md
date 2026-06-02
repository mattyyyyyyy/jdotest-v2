## 1. 实现（✅）

- [x] 1.1 store metrics（pv/uv/drivingSwitches 种子基线 + trackEvent 去重累加 + SQLite 持久化）
  - Files: `services/api/src/store.ts`
- [x] 1.2 `POST /api/v1/events` 上报 + analytics 改读 store.metrics()
  - Files: `services/api/src/app.ts`、`packages/api-contracts/openapi.yaml`
- [x] 1.3 测试：pageview→pv+1 / driving-switch→drivingSwitches+1 / uv 按 visitorId 去重
  - Files: `services/api/src/app.test.ts`

## Done When

- [x] `openspec validate add-analytics-events --strict` 通过
- [x] 测试全绿（98）+ typecheck 净
- [ ] `openspec archive add-analytics-events --yes`
- [ ] open-questions Q15 标解决 + INDEX 同步
