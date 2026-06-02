# cart Specification

## Purpose
消费端购物车：读取按商品现价 join（含 onShelf）、加购合并同款同规格、数量/选中更新（下限 1）与删除、从购物车结算走共享订单状态机（DRAFT→PENDING_PAYMENT，移出已选，空选 400）。
## Requirements
### Requirement: 购物车读取与价格按现价 join

The system MUST expose the cart via `GET /api/v1/cart`，每行 join 对应商品的**当前**字段：标题 / 图 / 现价（`price`，单位分）/ 数量 / 选中态 / 规格 / 商品当前是否上架（`onShelf`）。价格 MUST 取自商品现价而非加购时快照，使后台改价/下架即时反映到购物车。

#### Scenario: 购物车行反映商品现价
- **GIVEN** 购物车含某商品，后台调整了其现价
- **WHEN** `GET /api/v1/cart`
- **THEN** 该行 `price` 为商品最新现价（分）
- **AND** 行内带 `onShelf` 标记其当前上架状态

### Requirement: 加购合并同款同规格

`POST /api/v1/cart/items { productId, qty, spec }` MUST add a line；当存在相同 `productId` + `spec` 的行时 MUST 累加数量而非新增行。成功 MUST 返回 201 + 最新购物车视图。新行置顶。

#### Scenario: 重复加购累加数量
- **GIVEN** 购物车已有「商品A·规格X·数量2」
- **WHEN** 再次 `POST /api/v1/cart/items { productId: A, qty: 1, spec: X }`
- **THEN** 该行数量变为 3（不新增行）
- **AND** 返回 201

### Requirement: 数量/选中更新与删除

`PATCH /api/v1/cart/items/:id { qty?, selected? }` MUST update 数量（下限 1）与选中态；`DELETE /api/v1/cart/items/:id` MUST 删除该行。对不存在的行二者 MUST 返回 404 `CART_ITEM_NOT_FOUND`。

#### Scenario: 数量下限保护
- **WHEN** `PATCH` 将某行 qty 设为 0 或负数
- **THEN** 数量被钳制为最小 1

#### Scenario: 操作不存在的行 404
- **WHEN** `DELETE /api/v1/cart/items/不存在`
- **THEN** 系统返回 404 `CART_ITEM_NOT_FOUND`

### Requirement: 从购物车结算走订单状态机

`POST /api/v1/cart/checkout { channel? }` MUST 取所有**选中**项，经共享订单状态机 `DRAFT --submit--> PENDING_PAYMENT` 创建真实订单（`totalAmount` 为选中项现价×数量求和，单位分），并将已选项移出购物车（未选项保留）。无任何选中项 MUST 返回 400 `EMPTY_SELECTION`。

#### Scenario: 结算选中项生成待支付订单
- **GIVEN** 购物车有 2 个选中项 + 1 个未选项
- **WHEN** `POST /api/v1/cart/checkout`
- **THEN** 创建一个 `PENDING_PAYMENT` 订单（金额=选中项合计，分）
- **AND** 2 个选中项移出购物车，未选项保留

#### Scenario: 无选中项结算被拒
- **GIVEN** 购物车无任何选中项
- **WHEN** `POST /api/v1/cart/checkout`
- **THEN** 系统返回 400 `EMPTY_SELECTION`

