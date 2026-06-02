## MODIFIED Requirements

### Requirement: 加购合并同款同规格

`POST /api/v1/cart/items { productId, qty, spec }` MUST add a line；当存在相同 `productId` + `spec` 的行时 MUST 累加数量而非新增行。成功 MUST 返回 201 + 最新购物车视图。新行置顶。

加购前 MUST 校验库存与上架状态（库存硬伤修复，consistency-plan P2#9）：商品不存在或已下架 MUST 返回 409 `PRODUCT_UNAVAILABLE`；当**累计数量**（购物车已有同款同规格数量 + 本次 qty）超过商品 `stock` 时 MUST 返回 409 `INSUFFICIENT_STOCK`（带 `available`），不加入购物车。

#### Scenario: 重复加购累加数量
- **GIVEN** 购物车已有「商品A·规格X·数量2」（A 库存充足）
- **WHEN** 再次 `POST /api/v1/cart/items { productId: A, qty: 1, spec: X }`
- **THEN** 该行数量变为 3（不新增行）
- **AND** 返回 201

#### Scenario: 下架商品加购被拒
- **GIVEN** 一个 `onShelf=false` 的商品
- **WHEN** 加购该商品
- **THEN** 系统返回 409 `PRODUCT_UNAVAILABLE`

#### Scenario: 超库存加购被拒
- **GIVEN** 某商品 `stock=1`
- **WHEN** 一次性加购 `qty=2`（或累计超过 1）
- **THEN** 系统返回 409 `INSUFFICIENT_STOCK`（`available=1`）
- **AND** 购物车不新增/不累加该款

### Requirement: 从购物车结算走订单状态机

`POST /api/v1/cart/checkout { channel? }` MUST 取所有**选中**项，经共享订单状态机 `DRAFT --submit--> PENDING_PAYMENT` 创建真实订单（`totalAmount` 为选中项现价×数量求和，单位分），并将已选项移出购物车（未选项保留）。无任何选中项 MUST 返回 400 `EMPTY_SELECTION`。

结算 MUST 服务端校验库存：任一选中项的商品不存在/已下架/`stock < qty` 时 MUST 返回 409 `INSUFFICIENT_STOCK`（带不满足的明细），且 MUST NOT 创建订单、MUST NOT 移出购物车（全有或全无）。结算成功后 MUST 按下单数量扣减对应商品 `stock`（售罄后 `stock` 归 0 即不可再购）。

#### Scenario: 结算选中项生成待支付订单并扣减库存
- **GIVEN** 购物车有 2 个选中项（库存均充足）+ 1 个未选项
- **WHEN** `POST /api/v1/cart/checkout`
- **THEN** 创建一个 `PENDING_PAYMENT` 订单（金额=选中项合计，分）
- **AND** 2 个选中项移出购物车，未选项保留
- **AND** 两个商品的 `stock` 各按下单数量减少

#### Scenario: 选中项库存不足整单被拒
- **GIVEN** 购物车有一个选中项，其商品 `stock` 小于该行数量
- **WHEN** `POST /api/v1/cart/checkout`
- **THEN** 系统返回 409 `INSUFFICIENT_STOCK`（含不满足明细）
- **AND** 不创建订单、购物车不变（全有或全无）

#### Scenario: 无选中项结算被拒
- **GIVEN** 购物车无任何选中项
- **WHEN** `POST /api/v1/cart/checkout`
- **THEN** 系统返回 400 `EMPTY_SELECTION`
