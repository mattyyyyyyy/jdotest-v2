/**
 * 后台管理站 SPA —— 落地 Claude Design 的「JDO 后台管理」设计稿。
 * 视觉(CSS/布局/组件/配色)1:1 还原设计稿(深色 Linear/Vercel 风, jdo-* 类 + data-theme 深浅切换)；
 * 渲染层用 vanilla JS 驱动真实 /api/v1/admin/* 数据(保留全部 CRUD/分页/批量/筛选/图片上传)。
 * 顶栏含日/夜切换(data-theme，记忆到 localStorage)。
 *
 * 设计来源：Claude Design bundle · 浏览器端 JS 一律字符串拼接，避免与 TS 反引号 ${} 冲突。
 */

const STYLE = `
:root{
  --bg:#0A0B0E; --bg-2:#11141A; --surface:#181C24; --surface-2:#1d222b; --overlay:#21262D;
  --border:rgba(255,255,255,.10); --border-2:rgba(255,255,255,.18); --border-soft:rgba(255,255,255,.06);
  --txt-1:#F1F5F9; --txt-2:#94A3B8; --txt-3:#64748B;
  --brand:#3B82F6; --accent:#06B6D4; --ok:#22C55E; --warn:#F59E0B; --err:#EF4444;
  --row-py:12px; --shadow:0 1px 2px rgba(0,0,0,.4),0 8px 24px rgba(0,0,0,.28);
  --sans:-apple-system,BlinkMacSystemFont,"PingFang SC","HarmonyOS Sans","Noto Sans SC","Microsoft YaHei",sans-serif;
  --mono:"JetBrains Mono",ui-monospace,SFMono-Regular,"SF Mono",Menlo,monospace;
}
html[data-theme="light"]{
  --bg:#F1F5F9; --bg-2:#FFFFFF; --surface:#FFFFFF; --surface-2:#F8FAFC; --overlay:#FFFFFF;
  --border:rgba(15,23,42,.10); --border-2:rgba(15,23,42,.18); --border-soft:rgba(15,23,42,.05);
  --txt-1:#0F172A; --txt-2:#475569; --txt-3:#94A3B8;
  --shadow:0 1px 2px rgba(15,23,42,.06),0 8px 24px rgba(15,23,42,.08);
}
html[data-density="compact"]{ --row-py:8px; } html[data-density="comfy"]{ --row-py:16px; }
*{box-sizing:border-box;} html,body{margin:0;height:100%;}
body{background:var(--bg);color:var(--txt-1);font-family:var(--sans);font-size:14px;line-height:1.5;-webkit-font-smoothing:antialiased;}
.mono{font-family:var(--mono);font-variant-numeric:tabular-nums;}
#root{height:100%;}
button{font-family:inherit;}
::-webkit-scrollbar{width:10px;height:10px;}
::-webkit-scrollbar-thumb{background:var(--border-2);border-radius:99px;border:2px solid transparent;background-clip:padding-box;}
.jdo-app{display:flex;height:100%;}
.jdo-sidebar{width:240px;flex-shrink:0;background:var(--bg-2);border-right:1px solid var(--border);display:flex;flex-direction:column;height:100%;}
.jdo-main{flex:1;min-width:0;display:flex;flex-direction:column;height:100%;}
.jdo-content{flex:1;overflow:auto;}
.jdo-content-inner{max-width:none;margin:0;padding:24px 32px 64px;animation:fade .28s ease;}
@keyframes fade{from{transform:translateY(7px);opacity:0;}to{transform:none;opacity:1;}}
.jdo-logo{display:flex;align-items:center;gap:9px;padding:18px 20px 14px;font-size:16px;font-weight:700;letter-spacing:.04em;}
.jdo-logo-mark{color:var(--brand);font-size:15px;}
.jdo-nav{flex:1;overflow:auto;padding:4px 12px 12px;}
.jdo-nav-group{margin-bottom:14px;}
.jdo-nav-grouptitle{font-size:11px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:var(--txt-3);padding:6px 10px;}
.jdo-nav-item{display:flex;align-items:center;gap:10px;width:100%;border:0;background:transparent;color:var(--txt-2);padding:8px 10px;border-radius:8px;font-size:13.5px;cursor:pointer;text-align:left;position:relative;transition:background .12s,color .12s;}
.jdo-nav-item:hover{background:var(--border-soft);color:var(--txt-1);}
.jdo-nav-item.active{background:color-mix(in oklab,var(--brand) 16%,transparent);color:var(--txt-1);font-weight:600;}
.jdo-nav-item.active::before{content:"";position:absolute;left:-12px;top:7px;bottom:7px;width:3px;border-radius:0 3px 3px 0;background:var(--brand);}
.jdo-sidebar-foot{display:flex;align-items:center;gap:10px;padding:12px 16px;border-top:1px solid var(--border);}
.jdo-avatar{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;flex-shrink:0;background:linear-gradient(135deg,var(--brand),color-mix(in oklab,var(--accent) 70%,var(--brand)));color:#fff;font-size:13px;font-weight:600;}
.jdo-topbar{height:56px;flex-shrink:0;border-bottom:1px solid var(--border);background:color-mix(in oklab,var(--bg) 80%,transparent);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:space-between;padding:0 24px;position:sticky;top:0;z-index:20;}
.jdo-crumb{display:flex;align-items:center;gap:8px;font-size:13.5px;}
.jdo-crumb-root{color:var(--txt-3);} .jdo-crumb-cur{color:var(--txt-1);font-weight:600;}
.jdo-topbar-right{display:flex;align-items:center;gap:12px;}
.jdo-globalsearch{display:flex;align-items:center;gap:8px;background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:7px 10px;width:280px;}
.jdo-globalsearch input{border:0;background:transparent;color:var(--txt-1);outline:none;flex:1;font-size:13px;font-family:inherit;}
.jdo-globalsearch input::placeholder{color:var(--txt-3);}
.jdo-globalsearch kbd{font-family:var(--mono);font-size:11px;color:var(--txt-3);border:1px solid var(--border);border-radius:5px;padding:1px 5px;}
.jdo-iconbtn{width:34px;height:34px;display:grid;place-items:center;border:1px solid var(--border);background:var(--surface);color:var(--txt-2);border-radius:8px;cursor:pointer;position:relative;transition:.12s;}
.jdo-iconbtn:hover{color:var(--txt-1);border-color:var(--border-2);}
.jdo-iconbtn.badge-dot::after{content:"";position:absolute;top:7px;right:8px;width:6px;height:6px;border-radius:50%;background:var(--err);box-shadow:0 0 0 2px var(--bg);}
.jdo-notif-pop{position:fixed;z-index:50;width:300px;background:var(--surface);border:1px solid var(--border-2);border-radius:14px;box-shadow:0 16px 48px rgba(0,0,0,.5);padding:8px;animation:notifIn .14s ease;}
@keyframes notifIn{from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:none;}}
.jdo-notif-head{font-size:12.5px;color:var(--txt-3);padding:8px 10px 6px;font-weight:600;}
.jdo-notif-empty{padding:18px 12px;color:var(--txt-3);font-size:13.5px;text-align:center;}
.jdo-notif-item{display:flex;align-items:center;gap:10px;width:100%;border:0;background:transparent;color:var(--txt-1);padding:11px 10px;border-radius:9px;cursor:pointer;font-family:inherit;font-size:14px;text-align:left;}
.jdo-notif-item:hover{background:var(--surface-2);}
.jdo-notif-item .jdo-notif-txt{flex:1;}
.jdo-notif-item .jdo-notif-cnt{color:var(--txt-3);font-size:12.5px;font-variant-numeric:tabular-nums;}
.jdo-pagehead{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:18px;gap:16px;}
.jdo-pagehead-left{display:flex;align-items:baseline;gap:12px;}
.jdo-pagetitle{font-size:20px;font-weight:700;margin:0;letter-spacing:-.01em;}
.jdo-count{font-size:13px;color:var(--txt-2);white-space:nowrap;} .jdo-count b{color:var(--txt-1);font-family:var(--mono);font-weight:600;}
.jdo-btn{display:inline-flex;align-items:center;gap:6px;border-radius:8px;border:1px solid transparent;font-size:13.5px;font-weight:500;padding:8px 14px;cursor:pointer;transition:.13s;white-space:nowrap;line-height:1;}
.jdo-btn.sm{padding:6px 10px;font-size:12.5px;border-radius:7px;}
.jdo-btn.primary{background:var(--brand);color:#fff;box-shadow:0 1px 0 rgba(255,255,255,.12) inset;}
.jdo-btn.primary:hover{background:color-mix(in oklab,var(--brand) 88%,#fff);}
.jdo-btn.ghost{background:var(--surface);border-color:var(--border);color:var(--txt-1);}
.jdo-btn.ghost:hover{border-color:var(--border-2);background:var(--surface-2);}
.jdo-btn.link{background:transparent;color:var(--txt-2);padding-left:6px;padding-right:6px;} .jdo-btn.link:hover{color:var(--txt-1);}
.jdo-btn.danger{color:var(--err);}
.jdo-tabs{display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap;}
.jdo-tab{display:inline-flex;align-items:center;gap:7px;border:1px solid var(--border);background:var(--surface);color:var(--txt-2);padding:6px 13px;border-radius:99px;font-size:13px;cursor:pointer;transition:.12s;}
.jdo-tab:hover{color:var(--txt-1);border-color:var(--border-2);}
.jdo-tab.active{background:var(--brand);border-color:var(--brand);color:#fff;font-weight:600;}
.jdo-tab-count{font-family:var(--mono);font-size:11px;padding:0 6px;border-radius:99px;background:rgba(255,255,255,.14);min-width:18px;text-align:center;}
.jdo-tab:not(.active) .jdo-tab-count{background:var(--border);color:var(--txt-3);}
.jdo-batchbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:12px;padding:9px 14px;border-radius:10px;background:color-mix(in oklab,var(--brand) 12%,var(--surface));border:1px solid color-mix(in oklab,var(--brand) 40%,var(--border));animation:slideDown .2s ease;}
@keyframes slideDown{from{opacity:0;transform:translateY(-4px);}to{opacity:1;transform:none;}}
.jdo-batch-count{font-size:13px;color:var(--txt-1);} .jdo-batch-count b{color:var(--brand);font-family:var(--mono);}
.jdo-batch-actions{display:flex;align-items:center;gap:8px;}
.jdo-tablecard{background:var(--surface);border:1px solid var(--border);border-radius:13px;overflow:hidden;box-shadow:var(--shadow);}
.jdo-table{width:100%;border-collapse:collapse;font-size:14px;}
.jdo-table thead th{position:sticky;top:0;z-index:2;background:var(--surface-2);color:var(--txt-2);font-size:12.5px;font-weight:600;text-align:left;padding:11px 14px;border-bottom:1px solid var(--border);white-space:nowrap;}
.jdo-table tbody td{padding:var(--row-py) 14px;border-bottom:1px solid var(--border-soft);color:var(--txt-2);vertical-align:middle;}
.jdo-table tbody tr:last-child td{border-bottom:0;}
.jdo-table tbody tr{transition:background .1s;}
.jdo-table tbody tr:hover{background:var(--border-soft);}
.jdo-table tbody tr.selected{background:color-mix(in oklab,var(--brand) 9%,transparent);}
.jdo-th-check{width:42px;text-align:center;}
.jdo-cell-name{display:flex;align-items:center;gap:10px;color:var(--txt-1);font-weight:500;}
.jdo-clamp{display:inline-block;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.jdo-check{width:18px;height:18px;border-radius:5px;border:1.5px solid var(--border-2);background:var(--surface);display:inline-grid;place-items:center;cursor:pointer;color:#fff;transition:.12s;padding:0;}
.jdo-check:hover{border-color:var(--brand);}
.jdo-check.on{background:var(--brand);border-color:var(--brand);}
.jdo-rowactions{display:inline-flex;gap:12px;justify-content:flex-end;}
.jdo-link{background:none;border:0;color:var(--brand);cursor:pointer;font-size:13.5px;padding:0;font-family:inherit;}
.jdo-link:hover{text-decoration:underline;} .jdo-link.danger{color:var(--err);}
.jdo-badge{display:inline-flex;align-items:center;gap:6px;border:0;border-radius:99px;padding:3px 10px;font-size:12.5px;font-weight:500;line-height:1.4;font-family:inherit;}
.jdo-badge.clickable{cursor:pointer;} .jdo-badge.clickable:hover{filter:brightness(1.18);box-shadow:0 0 0 1px currentColor inset;}
.jdo-badge-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
.jdo-pagination{display:flex;align-items:center;justify-content:space-between;margin-top:14px;}
.jdo-page-info{font-size:13px;color:var(--txt-2);} .jdo-page-info b{color:var(--txt-1);font-family:var(--mono);}
.jdo-page-btns{display:flex;gap:8px;}
.jdo-pagebtn{display:inline-flex;align-items:center;gap:4px;border:1px solid var(--border);background:var(--surface);color:var(--txt-1);padding:6px 12px;border-radius:8px;font-size:13px;cursor:pointer;transition:.12s;}
.jdo-pagebtn:hover:not(:disabled){border-color:var(--border-2);background:var(--surface-2);} .jdo-pagebtn:disabled{opacity:.4;cursor:not-allowed;}
.jdo-kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px;}
.jdo-kpi{background:var(--surface);border:1px solid var(--border);border-radius:13px;padding:18px 20px;box-shadow:var(--shadow);transition:.15s;}
.jdo-kpi:hover{border-color:var(--border-2);}
.jdo-kpi-label{font-size:13px;color:var(--txt-2);margin-bottom:10px;}
.jdo-kpi-value{font-size:30px;font-weight:700;line-height:1;color:var(--txt-1);letter-spacing:-.02em;}
.jdo-kpi-delta{display:inline-flex;align-items:center;gap:3px;font-size:12px;margin-top:11px;font-weight:600;font-family:var(--mono);}
.jdo-kpi-delta.up{color:var(--ok);} .jdo-kpi-delta.down{color:var(--err);}
.jdo-kpi-period{color:var(--txt-3);font-weight:400;margin-left:4px;font-family:var(--sans);}
.jdo-dash-row{display:grid;grid-template-columns:1.7fr 1fr;gap:14px;}
.jdo-card{background:var(--surface);border:1px solid var(--border);border-radius:13px;padding:20px 22px;box-shadow:var(--shadow);}
.jdo-card-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px;}
.jdo-card-title{font-size:15px;font-weight:600;color:var(--txt-1);}
.jdo-card-sub{font-size:12.5px;color:var(--txt-2);margin-top:3px;}
.jdo-chart{width:100%;height:220px;display:block;}
.jdo-todo-item{display:flex;align-items:center;justify-content:space-between;padding:13px 12px;border-radius:9px;border:0;background:transparent;cursor:pointer;color:var(--txt-2);font-size:13.5px;font-family:inherit;text-align:left;transition:.12s;border-bottom:1px solid var(--border-soft);width:100%;}
.jdo-todo-item:last-child{border-bottom:0;} .jdo-todo-item:hover{background:var(--border-soft);color:var(--txt-1);}
.jdo-todo-n{font-family:var(--mono);font-size:18px;font-weight:700;}
.jdo-drawer-root{position:fixed;inset:0;z-index:100;pointer-events:none;}
.jdo-drawer-root.open{pointer-events:auto;}
.jdo-drawer-scrim{position:absolute;inset:0;background:rgba(0,0,0,.5);opacity:0;transition:opacity .26s;}
.jdo-drawer-root.open .jdo-drawer-scrim{opacity:1;}
.jdo-drawer{position:absolute;top:0;right:0;height:100%;width:420px;background:var(--overlay);border-left:1px solid var(--border);display:flex;flex-direction:column;transform:translateX(100%);transition:transform .28s cubic-bezier(.22,1,.36,1);box-shadow:-12px 0 40px rgba(0,0,0,.4);}
.jdo-drawer-root.open .jdo-drawer{transform:none;}
.jdo-drawer-head{display:flex;align-items:flex-start;justify-content:space-between;padding:20px 22px 16px;border-bottom:1px solid var(--border);}
.jdo-drawer-title{font-size:16px;font-weight:600;} .jdo-drawer-sub{font-size:12.5px;color:var(--txt-3);margin-top:3px;font-family:var(--mono);}
.jdo-drawer-body{flex:1;overflow:auto;padding:20px 22px;display:flex;flex-direction:column;gap:16px;}
.jdo-drawer-foot{display:flex;justify-content:flex-end;gap:10px;padding:16px 22px;border-top:1px solid var(--border);}
.jdo-field{display:flex;flex-direction:column;gap:7px;}
.jdo-field-label{font-size:12.5px;color:var(--txt-2);font-weight:500;}
.jdo-field-hint{font-size:11.5px;color:var(--txt-3);}
.jdo-input{width:100%;background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:9px 11px;color:var(--txt-1);font-size:13.5px;font-family:inherit;outline:none;transition:.12s;}
.jdo-input::placeholder{color:var(--txt-3);}
.jdo-input:focus{border-color:var(--brand);box-shadow:0 0 0 3px color-mix(in oklab,var(--brand) 22%,transparent);}
.jdo-money{position:relative;display:flex;align-items:center;}
.jdo-money-sym{position:absolute;left:11px;color:var(--txt-3);font-family:var(--mono);pointer-events:none;}
.jdo-money .jdo-input{padding-left:24px;padding-right:38px;font-family:var(--mono);}
.jdo-money-unit{position:absolute;right:11px;color:var(--txt-3);font-size:12.5px;pointer-events:none;}
.jdo-select-wrap{position:relative;}
.jdo-select{appearance:none;-webkit-appearance:none;padding-right:32px;cursor:pointer;}
.jdo-select-caret{position:absolute;right:11px;top:50%;transform:translateY(-50%);color:var(--txt-3);pointer-events:none;}
.jdo-switch{position:relative;display:inline-flex;align-items:center;gap:9px;border:0;background:transparent;cursor:pointer;padding:0;font-family:inherit;}
.jdo-switch::before{content:"";width:40px;height:23px;border-radius:99px;background:var(--border);transition:.16s;flex-shrink:0;border:1px solid var(--border-2);}
.jdo-switch.on::before{background:var(--brand);border-color:var(--brand);}
.jdo-switch-knob{position:absolute;left:0;width:17px;height:17px;border-radius:50%;background:#fff;transition:.18s cubic-bezier(.22,1,.36,1);transform:translateX(4px);box-shadow:0 1px 3px rgba(0,0,0,.3);}
.jdo-switch.on .jdo-switch-knob{transform:translateX(20px);}
.jdo-imgfield{display:flex;gap:14px;align-items:flex-start;}
.jdo-imgfield-preview{width:88px;height:88px;border-radius:10px;overflow:hidden;flex-shrink:0;border:1px solid var(--border);background:var(--surface-2);}
.jdo-imgfield-preview img{width:100%;height:100%;object-fit:cover;}
.jdo-imgfield-ctrl{flex:1;display:flex;flex-direction:column;gap:9px;}
.jdo-settings{max-width:680px;}
.jdo-set-row{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:18px 0;border-top:1px solid var(--border-soft);}
.jdo-set-row:first-of-type{border-top:0;}
.jdo-set-label{font-size:14px;color:var(--txt-1);font-weight:500;}
.jdo-set-hint{font-size:12.5px;color:var(--txt-3);margin-top:3px;}
.jdo-set-ctrl{display:flex;align-items:center;gap:14px;}
.jdo-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:48px 0;color:var(--txt-3);font-size:13.5px;}
@media(max-width:1100px){.jdo-kpi-grid{grid-template-columns:repeat(2,1fr);}.jdo-dash-row{grid-template-columns:1fr;}}
`;

export const ADMIN_APP_HTML = `<!doctype html><html lang="zh-CN" data-theme="dark" data-density="regular"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>JDO 车机电商 · 后台管理</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>${STYLE}</style></head>
<body>
<div class="jdo-app">
  <aside class="jdo-sidebar" id="sidebar"></aside>
  <div class="jdo-main">
    <header class="jdo-topbar" id="topbar"></header>
    <div class="jdo-content"><div class="jdo-content-inner" id="content"></div></div>
  </div>
</div>
<div class="jdo-drawer-root" id="drawer"><div class="jdo-drawer-scrim" onclick="closePanel()"></div><aside class="jdo-drawer" id="drawer-inner"></aside></div>
<script src="/admin-ui/app.js"></script>
</body></html>`;

export const ADMIN_APP_JS = `
var RES=[], CUR=null, CATMAP={}, CATS=[], PAGE=1, PAGE_SIZE=10, QUERY='', FILTER='__all__', SEL={}, ROWS=[], VIEW='products';
var ORDER_CN={DRAFT:'待提交',PENDING_PAYMENT:'待支付',PAID:'已支付',SHIPPING:'配送中',COMPLETED:'已完成',CANCELED:'已取消',EXPIRED:'已过期',REFUNDING:'退款中',REFUNDED:'已退款'};
var CHANNEL_CN={car:'车机',phone:'手机'}, COUPON_CN={fixed:'满减',discount:'折扣'}, AFT_CN={pending:'待审',approved:'通过',rejected:'拒绝'};
var TONE={green:['rgba(34,197,94,.14)','#4ade80','#22c55e'],red:['rgba(239,68,68,.14)','#f87171','#ef4444'],amber:['rgba(245,158,11,.14)','#fbbf24','#f59e0b'],cyan:['rgba(6,182,212,.14)','#22d3ee','#06b6d4'],blue:['rgba(59,130,246,.14)','#60a5fa','#3b82f6'],gray:['rgba(148,163,184,.12)','#94a3b8','#64748b']};
var IP={dashboard:'M3 13h8V3H3v10zm10 8h8V3h-8v18zM3 21h8v-6H3v6z',box:'M21 8l-9-5-9 5v8l9 5 9-5V8zM3 8l9 5 9-5M12 13v8',tag:'M20.59 13.41L11 3.83A2 2 0 009.59 3.24H4a1 1 0 00-1 1v5.59a2 2 0 00.59 1.41l9.58 9.59a2 2 0 002.82 0l4.6-4.6a2 2 0 000-2.82z',image:'M3 5h18v14H3zM3 15l5-5 4 4 3-3 6 6',grid:'M3 3h8v8H3zM13 3h8v8h-8zM13 13h8v8h-8zM3 13h8v8H3z',cart:'M3 3h2l2.4 12.2a2 2 0 002 1.6h9.7a2 2 0 002-1.6L23 7H6M9 21a1 1 0 100-2 1 1 0 000 2zM20 21a1 1 0 100-2 1 1 0 000 2z',refresh:'M3 12a9 9 0 0115.5-6.4L21 8M21 3v5h-5M21 12a9 9 0 01-15.5 6.4L3 16M3 21v-5h5',truck:'M1 4h13v12H1zM14 8h4l3 3v5h-7M5.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',users:'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.87M16 3.13A4 4 0 0116 11',star:'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',pin:'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 13a3 3 0 100-6 3 3 0 000 6z',shield:'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',settings:'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-2.82 1.17V21a2 2 0 11-4 0v-.09A1.65 1.65 0 007.5 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 003.6 15H3.5a2 2 0 110-4h.09A1.65 1.65 0 005.6 7.5a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 0010.5 3.6V3.5a2 2 0 114 0v.09a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0020.4 9h.1a2 2 0 110 4h-.09a1.65 1.65 0 00-1.01 2z',sparkles:'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z',search:'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3',bell:'M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9zM13.7 21a2 2 0 01-3.4 0',plus:'M12 5v14M5 12h14',close:'M18 6L6 18M6 6l12 12',chevL:'M15 18l-6-6 6-6',chevR:'M9 18l6-6-6-6',chevD:'M6 9l6 6 6-6',check:'M20 6L9 17l-5-5',upload:'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12',arrowUp:'M12 19V5M5 12l7-7 7 7',arrowDn:'M12 5v14M19 12l-7 7-7-7',sun:'M12 17a5 5 0 100-10 5 5 0 000 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',moon:'M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z'};
function ic(name,size,stroke){size=size||16;stroke=stroke||1.6;var d=IP[name];if(!d)return '';return "<svg width='"+size+"' height='"+size+"' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='"+stroke+"' stroke-linecap='round' stroke-linejoin='round' style='flex-shrink:0;vertical-align:middle'><path d='"+d+"'/></svg>";}
var TOKEN='',CURRENT_ADMIN=null;
function api(m,u,b){var o={method:m,headers:{}};if(TOKEN)o.headers['Authorization']='Bearer '+TOKEN;if(b){o.headers['Content-Type']='application/json';o.body=JSON.stringify(b);}return fetch(u,o).then(function(r){return r.json().catch(function(){return null;});});}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/'/g,'&#39;').replace(/"/g,'&quot;');}
function cfgOf(k){for(var i=0;i<RES.length;i++){if(RES[i].key===k)return RES[i];}return null;}
function badge(tone,text,clickAttr){var t=TONE[tone]||TONE.gray;return "<button class='jdo-badge"+(clickAttr?' clickable':'')+"' style='background:"+t[0]+";color:"+t[1]+"'"+(clickAttr?(' onclick="'+clickAttr+'"'):'')+"><span class='jdo-badge-dot' style='background:"+t[2]+"'></span>"+esc(text)+"</button>";}

// 导航(对标设计稿 IA，映射到真实 resource key)
var NAV=[
  {g:'概览',items:[{k:'__dash',l:'运营看板',ic:'dashboard'}]},
  {g:'商品',items:[{k:'products',l:'商品管理',ic:'box'},{k:'categories',l:'分类管理',ic:'grid'}]},
  {g:'营销 / 内容',items:[{k:'banners',l:'Banner 横幅',ic:'image'},{k:'heroRecs',l:'推荐位',ic:'sparkles'},{k:'coupons',l:'优惠券',ic:'tag'}]},
  {g:'交易',items:[{k:'orders',l:'订单管理',ic:'cart'},{k:'aftersale',l:'售后',ic:'refresh'},{k:'shipping',l:'物流',ic:'truck'}]},
  {g:'客户',items:[{k:'users',l:'用户管理',ic:'users'},{k:'reviews',l:'评价管理',ic:'star'}]},
  {g:'履约',items:[{k:'pickupPoints',l:'自提点',ic:'pin'}]},
  {g:'系统',items:[{k:'adminUsers',l:'账号 / 角色',ic:'shield'},{k:'__config',l:'系统配置',ic:'settings'}]}
];
function labelOf(k){for(var i=0;i<NAV.length;i++)for(var j=0;j<NAV[i].items.length;j++)if(NAV[i].items[j].k===k)return NAV[i].items[j].l;return '';}

function renderShell(){
  var s="<div class='jdo-logo'><span class='jdo-logo-mark'>◆</span><span>JDO <span style='color:var(--txt-2);font-weight:500'>后台</span></span></div><nav class='jdo-nav'>";
  NAV.forEach(function(grp){
    s+="<div class='jdo-nav-group'><div class='jdo-nav-grouptitle'>"+grp.g+"</div>";
    grp.items.forEach(function(it){ s+="<button class='jdo-nav-item' id='nav-"+it.k+"' onclick=\\"go('"+it.k+"')\\">"+ic(it.ic,17)+"<span>"+it.l+"</span></button>"; });
    s+="</div>";
  });
  var _ad=CURRENT_ADMIN||{role:'超管',account:'admin'};s+="</nav><div class='jdo-sidebar-foot'><div class='jdo-avatar' style='width:30px;height:30px'>"+esc(String(_ad.role||'管').charAt(0))+"</div><div style='line-height:1.3'><div style='font-size:13px;color:var(--txt-1);font-weight:600'>"+esc(_ad.role||'')+" · "+esc(_ad.account||'')+"</div><div style='font-size:11px;color:var(--txt-3)'>"+esc(_ad.account||'')+"@jdo</div></div></div>";
  document.getElementById('sidebar').innerHTML=s;
}
function renderTopbar(curLabel){
  var dark=document.documentElement.getAttribute('data-theme')!=='light';
  document.getElementById('topbar').innerHTML=
    "<div class='jdo-crumb'><span class='jdo-crumb-root'>后台</span>"+ic('chevR',13)+"<span class='jdo-crumb-cur'>"+esc(curLabel)+"</span></div>"+
    "<div class='jdo-topbar-right'>"+
      "<div class='jdo-globalsearch'>"+ic('search',15)+"<input id='topsearch' placeholder='搜索当前列表…'><kbd>⌘K</kbd></div>"+
      "<button class='jdo-iconbtn' title='日/夜切换' onclick='toggleTheme()'>"+ic(dark?'sun':'moon',18)+"</button>"+
      "<button class='jdo-iconbtn badge-dot' id='notif-bell' title='运营提醒' onclick='openNotif()'>"+ic('bell',18)+"</button>"+
      "<div class='jdo-avatar'>李</div>"+
    "</div>";
  var ts=document.getElementById('topsearch'); if(ts) ts.addEventListener('input',function(e){ if(CUR){QUERY=e.target.value;PAGE=1;renderList();} });
}
function setActive(k){var a=document.querySelectorAll('.jdo-nav-item');for(var i=0;i<a.length;i++)a[i].classList.remove('active');var el=document.getElementById('nav-'+k);if(el)el.classList.add('active');}
function toggleTheme(){var h=document.documentElement;var nx=h.getAttribute('data-theme')==='light'?'dark':'light';h.setAttribute('data-theme',nx);try{localStorage.setItem('jdo-admin-theme',nx);}catch(e){}renderTopbar(labelOf(VIEW)||'—');}

function go(k){VIEW=k;setActive(k);if(k==='__dash')return showDash();if(k==='__config')return showConfig();selectRes(k);}
function selectRes(key){CUR=cfgOf(key);QUERY='';PAGE=1;FILTER='__all__';SEL={};renderTopbar(CUR.label);api('GET','/api/v1/admin/'+key).then(function(d){ROWS=d.items||[];renderList();});}

function fmtCell(row,col){
  var v=row[col.k];
  switch(col.type){
    case 'image': return "<img src='"+esc(v||'')+"' style='width:40px;height:40px;border-radius:9px;object-fit:cover;background:var(--surface-2);box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)' onerror=\\"this.style.opacity=.25\\">";
    case 'bool':
      var on=!!v; var tone=(col.k==='banned'||col.k==='hidden')?(on?'red':'green'):(on?'green':'gray');
      return badge(tone, boolLabel(col.k,on), "toggleBool('"+row.id+"','"+col.k+"',"+(on?'true':'false')+")");
    case 'cat': return "<span style='color:var(--txt-1)'>"+esc(CATMAP[v]||v||'')+"</span>";
    case 'fen': return "<span class='mono' style='color:var(--txt-1)'>¥"+(Number(v)/100).toFixed(2)+"</span>";
    case 'num': return "<span class='mono'>"+(v==null?'':v)+"</span>";
    case 'list': return "<span class='jdo-clamp'>"+(Array.isArray(v)?esc(v.join(' / ')):esc(v))+"</span>";
    case 'orderStatus': var m={PENDING_PAYMENT:'amber',PAID:'blue',SHIPPING:'cyan',COMPLETED:'green',CANCELED:'gray',EXPIRED:'gray',REFUNDING:'amber',REFUNDED:'gray',DRAFT:'gray'}; return badge(m[v]||'gray',ORDER_CN[v]||v);
    case 'channel': return "<span style='color:"+(v==='car'?'var(--accent)':'var(--txt-2)')+"'>"+(CHANNEL_CN[v]||v)+"</span>";
    case 'couponType': return COUPON_CN[v]||v;
    case 'aftStatus': return badge(v==='approved'?'green':(v==='rejected'?'red':'amber'),AFT_CN[v]||v);
    default: return col.k==='title'?("<span style='color:var(--txt-1);font-weight:500'>"+esc(v)+"</span>"):esc(v);
  }
}
function boolLabel(c,v){if(c==='onShelf')return v?'已上架':'已下架';if(c==='active')return v?'启用':'停用';if(c==='open')return v?'营业':'停业';if(c==='banned')return v?'已封禁':'正常';if(c==='hidden')return v?'已隐藏':'显示';return v?'是':'否';}

function quickCol(){for(var i=0;i<CUR.columns.length;i++){var c=CUR.columns[i];if(c.type==='bool'||c.type==='orderStatus')return c;}return null;}
function filtered(){var rows=ROWS;var qc=quickCol();if(qc&&FILTER!=='__all__')rows=rows.filter(function(r){return String(r[qc.k])===FILTER;});if(QUERY){var q=QUERY.toLowerCase();rows=rows.filter(function(r){return CUR.columns.some(function(c){return String(r[c.k]==null?'':r[c.k]).toLowerCase().indexOf(q)>=0;});});}return rows;}
function selIds(){return Object.keys(SEL).filter(function(k){return SEL[k];});}

function renderList(){
  var rows=filtered(), pages=Math.max(1,Math.ceil(rows.length/PAGE_SIZE)); if(PAGE>pages)PAGE=pages;
  var pageRows=rows.slice((PAGE-1)*PAGE_SIZE,PAGE*PAGE_SIZE), sel=selIds();
  var h="<div class='jdo-pagehead'><div class='jdo-pagehead-left'><h1 class='jdo-pagetitle'>"+esc(CUR.label)+"</h1><span class='jdo-count'>共 <b>"+rows.length+"</b> 条</span></div>";
  h+="<button class='jdo-btn primary' onclick=\\"openForm()\\">"+ic('plus',16)+"新增</button></div>";
  // tabs
  var qc=quickCol();
  if(qc){
    var tabs=[['__all__','全部',rows0Count('__all__',qc)]];
    if(qc.type==='bool'){tabs.push(['true',boolLabel(qc.k,true),rows0Count('true',qc)]);tabs.push(['false',boolLabel(qc.k,false),rows0Count('false',qc)]);}
    else {Object.keys(ORDER_CN).forEach(function(k){var c=rows0Count(k,qc);if(c>0||FILTER===k)tabs.push([k,ORDER_CN[k],c]);});}
    h+="<div class='jdo-tabs'>";
    tabs.forEach(function(t){h+="<button class='jdo-tab"+(FILTER===t[0]?' active':'')+"' onclick=\\"setFilter('"+t[0]+"')\\">"+t[1]+"<span class='jdo-tab-count'>"+t[2]+"</span></button>";});
    h+="</div>";
  }
  // batch bar
  if(sel.length){
    h+="<div class='jdo-batchbar'><span class='jdo-batch-count'>已选 <b>"+sel.length+"</b> 项</span><div class='jdo-batch-actions'>";
    if(CUR.key==='products'){h+="<button class='jdo-btn ghost sm' onclick='bulkShelf(true)'>批量上架</button><button class='jdo-btn ghost sm' onclick='bulkShelf(false)'>批量下架</button>";}
    h+="<button class='jdo-btn ghost sm danger' onclick='bulkDelete()'>"+ic('close',13)+"批量删除</button><button class='jdo-btn link sm' onclick='clearSel()'>取消选择</button></div></div>";
  }
  // table
  var allOn=pageRows.length&&pageRows.every(function(r){return SEL[r.id];});
  h+="<div class='jdo-tablecard'><table class='jdo-table'><thead><tr>";
  h+="<th class='jdo-th-check'><button class='jdo-check"+(allOn?' on':'')+"' onclick='togglePage("+(allOn?'false':'true')+")'>"+(allOn?ic('check',12,3):'')+"</button></th>";
  CUR.columns.forEach(function(c){h+="<th>"+esc(c.label)+"</th>";});
  h+="<th style='text-align:right'>操作</th></tr></thead><tbody>";
  if(pageRows.length===0){h+="<tr><td colspan='"+(CUR.columns.length+2)+"'><div class='jdo-empty'>"+ic('box',30)+"<span>暂无数据</span></div></td></tr>";}
  pageRows.forEach(function(r){
    var on=!!SEL[r.id];
    h+="<tr class='"+(on?'selected':'')+"'><td class='jdo-th-check'><button class='jdo-check"+(on?' on':'')+"' onclick=\\"toggleSel('"+r.id+"',"+(on?'false':'true')+")\\">"+(on?ic('check',12,3):'')+"</button></td>";
    CUR.columns.forEach(function(c){h+="<td>"+fmtCell(r,c)+"</td>";});
    h+="<td><div class='jdo-rowactions'><button class='jdo-link' onclick=\\"openForm('"+r.id+"')\\">编辑</button><button class='jdo-link danger' onclick=\\"delRow('"+r.id+"')\\">删除</button></div></td></tr>";
  });
  h+="</tbody></table></div>";
  h+="<div class='jdo-pagination'><span class='jdo-page-info'>第 <b>"+PAGE+"</b> / "+pages+" 页</span><div class='jdo-page-btns'><button class='jdo-pagebtn' "+(PAGE<=1?'disabled':'')+" onclick='gotoPage("+(PAGE-1)+")'>"+ic('chevL',15)+"上一页</button><button class='jdo-pagebtn' "+(PAGE>=pages?'disabled':'')+" onclick='gotoPage("+(PAGE+1)+")'>下一页"+ic('chevR',15)+"</button></div></div>";
  document.getElementById('content').innerHTML=h;
}
function rows0Count(val,qc){var base=ROWS;if(QUERY){var q=QUERY.toLowerCase();base=base.filter(function(r){return CUR.columns.some(function(c){return String(r[c.k]==null?'':r[c.k]).toLowerCase().indexOf(q)>=0;});});}if(val==='__all__')return base.length;return base.filter(function(r){return String(r[qc.k])===val;}).length;}
function setFilter(v){FILTER=v;PAGE=1;renderList();}
function gotoPage(p){if(p>=1){PAGE=p;renderList();}}
function toggleSel(id,on){SEL[id]=on;renderList();}
function togglePage(on){filtered().slice((PAGE-1)*PAGE_SIZE,PAGE*PAGE_SIZE).forEach(function(r){SEL[r.id]=on;});renderList();}
function clearSel(){SEL={};renderList();}
function toggleBool(id,f,val){var o={};o[f]=!val;api('PATCH','/api/v1/admin/'+CUR.key+'/'+id,o).then(function(){selectRes(CUR.key);});}
function delRow(id){if(!confirm('确认删除 '+id+' ?'))return;api('DELETE','/api/v1/admin/'+CUR.key+'/'+id).then(function(){selectRes(CUR.key);});}
function bulkDelete(){var ids=selIds();if(!ids.length||!confirm('删除选中 '+ids.length+' 项？'))return;Promise.all(ids.map(function(id){return api('DELETE','/api/v1/admin/'+CUR.key+'/'+id);})).then(function(){SEL={};selectRes(CUR.key);});}
function bulkShelf(on){var ids=selIds();if(!ids.length)return;Promise.all(ids.map(function(id){return api('PATCH','/api/v1/admin/'+CUR.key+'/'+id,{onShelf:on});})).then(function(){SEL={};selectRes(CUR.key);});}

// ── 抽屉表单 ──
function selOpts(type,val){var o=[];if(type==='cat')o=CATS.map(function(c){return [c.id,c.name];});else if(type==='orderStatus')o=Object.keys(ORDER_CN).map(function(k){return [k,ORDER_CN[k]];});else if(type==='channel')o=Object.keys(CHANNEL_CN).map(function(k){return [k,CHANNEL_CN[k]];});else if(type==='couponType')o=Object.keys(COUPON_CN).map(function(k){return [k,COUPON_CN[k]];});else if(type==='aftStatus')o=Object.keys(AFT_CN).map(function(k){return [k,AFT_CN[k]];});return o.map(function(x){return "<option value='"+x[0]+"'"+(String(val)===String(x[0])?' selected':'')+">"+x[1]+"</option>";}).join('');}
function openForm(id){
  var cfg=CUR, ex=null;
  var done=function(){
    var b="";
    cfg.fields.forEach(function(f){
      var val=ex&&ex[f.k]!==undefined?ex[f.k]:'';
      b+="<label class='jdo-field'><span class='jdo-field-label'>"+esc(f.label)+"</span>";
      if(f.type==='bool'){var isNew=!ex,pos=(f.k==='onShelf'||f.k==='active'||f.k==='open');var bv=(val===true||val==='true')||(isNew&&(val===''||val==null)&&pos);b+="<button type='button' class='jdo-switch"+(bv?' on':'')+"' id='f-"+f.k+"' data-on='"+(bv?'1':'0')+"' onclick=\\"this.classList.toggle('on');this.setAttribute('data-on',this.classList.contains('on')?'1':'0')\\"><span class='jdo-switch-knob'></span></button>";}
      else if(f.type==='cat'||f.type==='orderStatus'||f.type==='channel'||f.type==='couponType'||f.type==='aftStatus'){b+="<div class='jdo-select-wrap'><select class='jdo-input jdo-select' id='f-"+f.k+"'>"+selOpts(f.type,val)+"</select><span class='jdo-select-caret'>"+ic('chevD',14)+"</span></div>";}
      else if(f.type==='money'){var yv=(val===''||val==null)?'':(Number(val)/100);b+="<div class='jdo-money'><span class='jdo-money-sym'>¥</span><input class='jdo-input' type='number' step='0.01' id='f-"+f.k+"' value='"+esc(yv)+"'><span class='jdo-money-unit'>元</span></div>";}
      else if(f.type==='image'){var iv=(val==null)?'':String(val);b+="<div class='jdo-imgfield'><div class='jdo-imgfield-preview'><img id='f-"+f.k+"-prev' src='"+esc(iv)+"' onerror=\\"this.style.opacity=.25\\"></div><div class='jdo-imgfield-ctrl'><label class='jdo-btn ghost sm' style='align-self:flex-start'>"+ic('upload',14)+"上传图片<input type='file' accept='image/*' hidden onchange=\\"onPickImage(this,'f-"+f.k+"')\\"></label><input class='jdo-input' id='f-"+f.k+"' placeholder='或填写图片 URL' value='"+esc(iv)+"' oninput=\\"var p=document.getElementById('f-"+f.k+"-prev');if(p){p.src=this.value;p.style.opacity=1;}\\"></div></div>";}
      else {b+="<input class='jdo-input' id='f-"+f.k+"'"+(f.type==='num'?" type='number'":"")+" value='"+esc(val)+"'>";}
      if(f.label&&f.label.indexOf('(')>=0)b+="<span class='jdo-field-hint'>"+esc(f.label.slice(f.label.indexOf('(')))+"</span>";
      b+="</label>";
    });
    document.getElementById('drawer-inner').innerHTML=
      "<div class='jdo-drawer-head'><div><div class='jdo-drawer-title'>"+(id?'编辑':'新增')+" · "+esc(cfg.label)+"</div>"+(id?"<div class='jdo-drawer-sub'>"+esc(id)+"</div>":"")+"</div><button class='jdo-iconbtn' onclick='closePanel()'>"+ic('close',18)+"</button></div>"+
      "<div class='jdo-drawer-body'>"+b+"</div>"+
      "<div class='jdo-drawer-foot'><button class='jdo-btn ghost' onclick='closePanel()'>取消</button><button class='jdo-btn primary' onclick=\\"saveForm('"+(id||'')+"')\\">保存</button></div>";
    document.getElementById('drawer').classList.add('open');
  };
  if(id)api('GET','/api/v1/admin/'+cfg.key+'/'+id).then(function(r){ex=r;done();});else done();
}
function saveForm(id){var cfg=CUR,body={};cfg.fields.forEach(function(f){var el=document.getElementById('f-'+f.k);if(!el)return;var v;if(f.type==='bool')v=el.getAttribute('data-on')==='1';else{v=el.value;if(f.type==='num')v=(v===''?0:Number(v));else if(f.type==='money')v=(v===''?0:Math.round(Number(v)*100));}body[f.k]=v;});var req=id?api('PATCH','/api/v1/admin/'+cfg.key+'/'+id,body):api('POST','/api/v1/admin/'+cfg.key,body);req.then(function(){closePanel();selectRes(cfg.key);});}
function closePanel(){document.getElementById('drawer').classList.remove('open');}
function onPickImage(input,tid){var f=input.files&&input.files[0];if(!f)return;if(f.size>3*1024*1024){alert('图片请小于 3MB');return;}var rd=new FileReader();rd.onload=function(e){var b=document.getElementById(tid);if(b)b.value=e.target.result;var p=document.getElementById(tid+'-prev');if(p){p.src=e.target.result;p.style.opacity=1;}};rd.readAsDataURL(f);}

// ── 看板 ──
function showDash(){
  setActive('__dash');renderTopbar('运营看板');
  Promise.all([api('GET','/api/v1/admin/analytics'),api('GET','/api/v1/admin/orders'),api('GET','/api/v1/admin/aftersale')]).then(function(res){
    var a=res[0],orders=(res[1]&&res[1].items)||[],aft=(res[2]&&res[2].items)||[];
    var kpi=[['GMV','¥'+((a.gmv||0)/100).toLocaleString('zh-CN'),'up',12],['订单总数',String(a.orderTotal||0),'up',8],['UV 访客',String(a.uv||0),'up',5],['行车态切换',String(a.drivingSwitches||0),'down',3]];
    var h="<div class='jdo-pagehead'><div class='jdo-pagehead-left'><h1 class='jdo-pagetitle'>运营看板</h1></div></div><div class='jdo-kpi-grid'>";
    kpi.forEach(function(k){h+="<div class='jdo-kpi'><div class='jdo-kpi-label'>"+k[0]+"</div><div class='jdo-kpi-value mono'>"+k[1]+"</div><div class='jdo-kpi-delta "+k[2]+"'>"+ic(k[2]==='up'?'arrowUp':'arrowDn',12,2.4)+k[3]+"%<span class='jdo-kpi-period'>较上周</span></div></div>";});
    h+="</div><div class='jdo-dash-row'>";
    h+="<div class='jdo-card'><div class='jdo-card-head'><div><div class='jdo-card-title'>GMV 趋势</div><div class='jdo-card-sub'>近 14 天 · 车机 vs 手机入口</div></div></div>"+areaChart()+"</div>";
    var todos=[['待发货订单',orders.filter(function(o){return o.status==='PAID';}).length,'orders'],['待支付订单',orders.filter(function(o){return o.status==='PENDING_PAYMENT';}).length,'orders'],['待审售后',aft.filter(function(x){return x.status==='pending';}).length,'aftersale'],['配送中',orders.filter(function(o){return o.status==='SHIPPING';}).length,'orders']];
    h+="<div class='jdo-card'><div class='jdo-card-head'><div class='jdo-card-title'>待办事项</div></div><div>";
    todos.forEach(function(t){h+="<button class='jdo-todo-item' onclick=\\"go('"+t[2]+"')\\"><span>"+t[0]+"</span><span class='jdo-todo-n' style='color:"+(t[1]>0?'var(--warn)':'var(--txt-3)')+"'>"+t[1]+"</span></button>";});
    h+="</div></div></div>";
    document.getElementById('content').innerHTML=h;
  });
}
function areaChart(){
  var pts=[42,38,55,48,62,70,58,75,82,68,90,86,98,110];var w=620,hh=200,mx=Math.max.apply(null,pts),step=w/(pts.length-1);
  var line='',area='M0 '+hh;pts.forEach(function(v,i){var x=i*step,y=hh-(v/mx)*(hh-20);line+=(i?'L':'M')+x.toFixed(1)+' '+y.toFixed(1)+' ';area+=' L'+x.toFixed(1)+' '+y.toFixed(1);});area+=' L'+w+' '+hh+' Z';
  return "<svg class='jdo-chart' viewBox='0 0 "+w+" "+hh+"' preserveAspectRatio='none'><defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='var(--brand)' stop-opacity='.35'/><stop offset='1' stop-color='var(--brand)' stop-opacity='0'/></linearGradient></defs><path d='"+area+"' fill='url(#g)'/><path d='"+line+"' fill='none' stroke='var(--brand)' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'/></svg>";
}
function showConfig(){
  setActive('__config');renderTopbar('系统配置');
  api('GET','/api/v1/admin/config').then(function(c){
    var h="<div class='jdo-pagehead'><div class='jdo-pagehead-left'><h1 class='jdo-pagetitle'>系统配置</h1></div></div><div class='jdo-card jdo-settings'>";
    h+="<div class='jdo-set-row'><div><div class='jdo-set-label'>行车态车速阈值</div><div class='jdo-set-hint'>超过此速度进入行车态降级</div></div><div class='jdo-set-ctrl'><input class='jdo-input mono' style='width:90px' id='c-spd' value='"+c.drivingSpeedThreshold+"'><span style='color:var(--txt-3)'>km/h</span></div></div>";
    h+="<div class='jdo-set-row'><div><div class='jdo-set-label'>停车退出持续秒数</div></div><div class='jdo-set-ctrl'><input class='jdo-input mono' style='width:90px' id='c-exit' value='"+c.drivingExitSeconds+"'><span style='color:var(--txt-3)'>秒</span></div></div>";
    h+="<div class='jdo-set-row'><div><div class='jdo-set-label'>行车态降级 Banner</div></div><div class='jdo-set-ctrl'><button type='button' class='jdo-switch"+(c.degradeBannerInDriving?' on':'')+"' id='c-deg' onclick=\\"this.classList.toggle('on')\\"><span class='jdo-switch-knob'></span></button></div></div>";
    h+="<div style='display:flex;justify-content:flex-end;margin-top:18px'><button class='jdo-btn primary' onclick='saveConfig()'>保存配置</button></div></div>";
    document.getElementById('content').innerHTML=h;
  });
}
function saveConfig(){api('PATCH','/api/v1/admin/config',{drivingSpeedThreshold:Number(document.getElementById('c-spd').value),drivingExitSeconds:Number(document.getElementById('c-exit').value),degradeBannerInDriving:document.getElementById('c-deg').classList.contains('on')}).then(function(){alert('已保存');});}

// 运营提醒（消息铃铛）：从实时数据派生待办，点击跳转对应资源。
function closeNotif(){var p=document.getElementById('notif-pop');if(p)p.remove();}
function openNotif(){
  if(document.getElementById('notif-pop')){closeNotif();return;} // 再点关闭
  Promise.all([api('GET','/api/v1/admin/orders'),api('GET','/api/v1/admin/aftersale'),api('GET','/api/v1/admin/products')]).then(function(res){
    var orders=(res[0]&&res[0].items)||[],aft=(res[1]&&res[1].items)||[],prods=(res[2]&&res[2].items)||[];
    var toShip=orders.filter(function(o){return o.status==='PAID';}).length;
    var refund=orders.filter(function(o){return o.status==='REFUNDING';}).length;
    var aftPending=aft.filter(function(a){return a.status==='pending';}).length;
    var lowStock=prods.filter(function(p){return Number(p.stock)<=5;}).length;
    var items=[];
    if(toShip)items.push(['truck','待发货订单',toShip+' 单','orders','PAID']);
    if(refund)items.push(['refresh','退款待处理',refund+' 单','orders','REFUNDING']);
    if(aftPending)items.push(['shield','售后待处理',aftPending+' 单','aftersale','']);
    if(lowStock)items.push(['box','低库存(≤5)',lowStock+' 个','products','']);
    var html="<div class='jdo-notif-head'>运营提醒</div>";
    if(!items.length)html+="<div class='jdo-notif-empty'>暂无待办，一切正常 ✓</div>";
    else items.forEach(function(it){html+="<button class='jdo-notif-item' onclick=\\"closeNotif();selectRes('"+it[3]+"')"+(it[4]?(";setTimeout(function(){setFilter('"+it[4]+"');},150)"):"")+"\\">"+ic(it[0],16)+"<span class='jdo-notif-txt'>"+it[1]+"</span><span class='jdo-notif-cnt'>"+it[2]+"</span></button>";});
    var pop=document.createElement('div');pop.id='notif-pop';pop.className='jdo-notif-pop';pop.innerHTML=html;document.body.appendChild(pop);
    var bell=document.getElementById('notif-bell');if(bell){var r=bell.getBoundingClientRect();pop.style.top=(r.bottom+8)+'px';pop.style.right=Math.max(12,(window.innerWidth-r.right))+'px';}
  });
}
// 全局：⌘K/Ctrl+K 聚焦搜索；点击外部 / Esc 关通知。
document.addEventListener('keydown',function(e){
  if((e.metaKey||e.ctrlKey)&&(e.key==='k'||e.key==='K')){e.preventDefault();var ts=document.getElementById('topsearch');if(ts)ts.focus();}
  if(e.key==='Escape')closeNotif();
});
document.addEventListener('click',function(e){var p=document.getElementById('notif-pop');if(p&&!p.contains(e.target)&&!(e.target.closest&&e.target.closest('#notif-bell')))closeNotif();});

// 启动
try{var th=localStorage.getItem('jdo-admin-theme');if(th)document.documentElement.setAttribute('data-theme',th);}catch(e){}
// admin-auth 守卫上线后：开屏先登录拿 admin token（Demo 超管），再加载数据。
function bootLogin(){return fetch('/api/v1/admin/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({account:'admin',password:'admin123'})}).then(function(r){return r.json();}).then(function(d){TOKEN=(d&&d.accessToken)||'';CURRENT_ADMIN=(d&&d.admin)||null;}).catch(function(){});}
bootLogin().then(function(){return api('GET','/api/v1/admin/categories');}).then(function(cd){CATS=(cd&&cd.items)||[];CATS.forEach(function(c){CATMAP[c.id]=c.name;});return api('GET','/api/v1/admin/resources');}).then(function(d){RES=(d&&d.items)||[];renderShell();go('products');});
`;
