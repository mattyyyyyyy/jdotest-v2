/**
 * 两个演示网页（自包含 HTML，无外部依赖）。
 * 注意：浏览器端 JS 一律用字符串拼接，不用模板字面量，
 * 以免与本文件的 TS 反引号模板冲突（避免出现 ${...}）。
 */

const BASE_CSS = `
  * { box-sizing: border-box; }
  body { margin:0; font-family: "Noto Sans SC", system-ui, sans-serif; background:#0e1116; color:#e8edf2; }
  header { padding:14px 20px; background:#161b22; border-bottom:1px solid #2b3440; display:flex; align-items:center; gap:12px; }
  header h1 { font-size:18px; margin:0; }
  .tag { font-size:12px; padding:2px 8px; border-radius:999px; }
  .pulse { width:9px; height:9px; border-radius:50%; background:#39d98a; box-shadow:0 0 0 0 rgba(57,217,138,.6); animation:p 1.5s infinite; }
  @keyframes p { 0%{box-shadow:0 0 0 0 rgba(57,217,138,.6)} 70%{box-shadow:0 0 0 8px rgba(57,217,138,0)} 100%{box-shadow:0 0 0 0 rgba(57,217,138,0)} }
  .meta { margin-left:auto; font-size:12px; color:#8b98a8; }
  main { padding:20px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:14px; }
  .card { background:#161b22; border:1px solid #2b3440; border-radius:14px; padding:14px; }
  .card h3 { margin:0 0 6px; font-size:15px; }
  .price { color:#ffd166; font-size:20px; font-weight:700; }
  .cat { font-size:12px; color:#8b98a8; }
  .stock { font-size:12px; color:#8b98a8; margin-top:4px; }
  .off { opacity:.45; }
  .badge-off { background:#3a2730; color:#ff7b9c; }
  .badge-on { background:#1e3a2c; color:#39d98a; }
  button { font-family:inherit; cursor:pointer; border:none; border-radius:9px; padding:7px 12px; font-size:13px; }
  .btn-toggle { background:#2b3440; color:#e8edf2; }
  .btn-price { background:#283a5a; color:#cfe0ff; }
  .btn-add { background:#39d98a; color:#06351f; font-weight:700; padding:9px 16px; }
  input { font-family:inherit; background:#0e1116; border:1px solid #2b3440; color:#e8edf2; border-radius:8px; padding:8px 10px; font-size:13px; }
  .row { display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-top:10px; }
  table { width:100%; border-collapse:collapse; }
  th,td { text-align:left; padding:9px 10px; border-bottom:1px solid #222b35; font-size:14px; }
  th { color:#8b98a8; font-weight:500; }
  .addbar { background:#161b22; border:1px solid #2b3440; border-radius:14px; padding:14px; margin-bottom:18px; display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
`;

export const STORE_HTML = `<!doctype html><html lang="zh"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>🛒 前台商城（自动刷新）</title><style>${BASE_CSS}</style></head>
<body>
<header>
  <div class="pulse"></div>
  <h1>🛒 前台商城</h1>
  <span class="tag badge-on">每 1.5 秒自动刷新</span>
  <span class="meta" id="meta">加载中…</span>
</header>
<main><div class="grid" id="grid"></div></main>
<script>
function yuan(f){ return "¥" + (f/100).toFixed(2); }
function catName(id, cats){ var c = cats.find(function(x){return x.id===id;}); return c?c.name:id; }
var cats = [];
function load(){
  fetch("/api/v1/categories").then(function(r){return r.json();}).then(function(d){ cats=d.items; });
  fetch("/api/v1/products").then(function(r){return r.json();}).then(function(d){
    var g = document.getElementById("grid"); g.innerHTML = "";
    d.items.forEach(function(p){
      var el = document.createElement("div"); el.className="card";
      el.innerHTML = "<div class='cat'>"+catName(p.categoryId,cats)+"</div>"+
        "<h3>"+p.title+"</h3>"+
        "<div class='price'>"+yuan(p.price)+"</div>"+
        "<div class='stock'>库存 "+p.stock+"</div>";
      g.appendChild(el);
    });
    var t = new Date();
    document.getElementById("meta").textContent = "在售 "+d.total+" 件 · 刷新于 "+t.toLocaleTimeString();
  });
}
load(); setInterval(load, 1500);
</script>
</body></html>`;

export const ADMIN_HTML = `<!doctype html><html lang="zh"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>🛠 后台管理</title><style>${BASE_CSS}</style></head>
<body>
<header>
  <h1>🛠 后台管理</h1>
  <span class="tag badge-off">改这里，前台会同步</span>
  <span class="meta" id="meta"></span>
</header>
<main>
  <div class="addbar">
    <strong>新增商品：</strong>
    <input id="t" placeholder="商品名" style="width:200px">
    <input id="p" type="number" placeholder="价格(元)" style="width:120px">
    <input id="s" type="number" placeholder="库存" style="width:100px">
    <input id="c" placeholder="分类id(如 goods)" style="width:140px" value="goods">
    <button class="btn-add" onclick="add()">+ 上架新商品</button>
  </div>
  <table><thead><tr><th>商品</th><th>分类</th><th>价格</th><th>库存</th><th>状态</th><th>操作</th></tr></thead>
  <tbody id="tb"></tbody></table>
</main>
<script>
function yuan(f){ return "¥" + (f/100).toFixed(2); }
function load(){
  fetch("/api/v1/admin/products").then(function(r){return r.json();}).then(function(d){
    var tb = document.getElementById("tb"); tb.innerHTML="";
    d.items.forEach(function(p){
      var tr = document.createElement("tr"); if(!p.onShelf) tr.className="off";
      var status = p.onShelf ? "<span class='tag badge-on'>已上架</span>" : "<span class='tag badge-off'>已下架</span>";
      tr.innerHTML = "<td>"+p.title+"</td><td>"+p.categoryId+"</td><td>"+yuan(p.price)+"</td><td>"+p.stock+"</td><td>"+status+"</td>"+
        "<td><div class='row' style='margin:0'>"+
        "<button class='btn-toggle' onclick=\\"toggle('"+p.id+"',"+(!p.onShelf)+")\\">"+(p.onShelf?"下架":"上架")+"</button>"+
        "<button class='btn-price' onclick=\\"chprice('"+p.id+"',"+p.price+")\\">改价</button>"+
        "</div></td>";
      tb.appendChild(tr);
    });
    document.getElementById("meta").textContent = "共 "+d.items.length+" 件（含下架）";
  });
}
function toggle(id, on){
  fetch("/api/v1/admin/products/"+id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({onShelf:on})}).then(load);
}
function chprice(id, cur){
  var v = prompt("改价（元）", (cur/100).toFixed(2));
  if(v===null) return;
  fetch("/api/v1/admin/products/"+id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({price:Math.round(parseFloat(v)*100)})}).then(load);
}
function add(){
  var t=document.getElementById("t").value, p=document.getElementById("p").value, s=document.getElementById("s").value, c=document.getElementById("c").value;
  if(!t||!p){ alert("填商品名和价格"); return; }
  fetch("/api/v1/admin/products",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({title:t,price:Math.round(parseFloat(p)*100),stock:parseInt(s||"0",10),categoryId:c||"goods"})}).then(function(){
    document.getElementById("t").value=""; document.getElementById("p").value=""; document.getElementById("s").value=""; load();
  });
}
load(); setInterval(load, 1500);
</script>
</body></html>`;
