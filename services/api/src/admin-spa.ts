/**
 * 后台管理站 SPA（自包含，无构建步骤）。数据驱动：一套表格+表单管所有实体。
 * 浏览器端 JS 一律字符串拼接，不用模板字面量（避免与本文件 TS 反引号的 ${} 冲突）。
 */

export const ADMIN_APP_HTML = `<!doctype html><html lang="zh"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>JDO 后台管理</title>
<style>
  *{box-sizing:border-box}
  body{margin:0;font-family:"Noto Sans SC",system-ui,sans-serif;background:#0e1116;color:#e8edf2;height:100vh;display:flex;flex-direction:column}
  header{padding:12px 20px;background:#161b22;border-bottom:1px solid #2b3440;display:flex;align-items:center;gap:12px}
  header h1{font-size:17px;margin:0}
  header .role{margin-left:auto;font-size:13px;color:#8b98a8}
  .layout{flex:1;display:flex;min-height:0}
  nav{width:180px;background:#11161d;border-right:1px solid #2b3440;overflow:auto;padding:8px 0}
  nav a{display:block;padding:10px 18px;color:#c2ccd6;text-decoration:none;font-size:14px;cursor:pointer;border-left:3px solid transparent}
  nav a:hover{background:#1b2230}
  nav a.active{background:#1b2230;border-left-color:#39d98a;color:#fff}
  nav .sec{font-size:11px;color:#5c6personally;color:#5c6b7a;padding:12px 18px 4px;text-transform:uppercase}
  main{flex:1;overflow:auto;padding:20px}
  .bar{display:flex;align-items:center;gap:12px;margin-bottom:14px}
  .bar h2{font-size:18px;margin:0}
  .bar .count{color:#8b98a8;font-size:13px}
  button{font-family:inherit;cursor:pointer;border:none;border-radius:8px;padding:7px 13px;font-size:13px}
  .btn-add{background:#39d98a;color:#06351f;font-weight:700;margin-left:auto}
  .btn-edit{background:#283a5a;color:#cfe0ff}
  .btn-del{background:#3a2730;color:#ff7b9c}
  .btn-save{background:#39d98a;color:#06351f;font-weight:700}
  .btn-cancel{background:#2b3440;color:#e8edf2}
  table{width:100%;border-collapse:collapse;font-size:13.5px}
  th,td{text-align:left;padding:9px 11px;border-bottom:1px solid #222b35;vertical-align:middle}
  th{color:#8b98a8;font-weight:500;position:sticky;top:0;background:#0e1116}
  tr:hover td{background:#141a22}
  .badge{font-size:12px;padding:3px 9px;border-radius:999px;cursor:pointer;border:none;font-family:inherit}
  .on{background:#1e3a2c;color:#39d98a}
  .off{background:#3a2730;color:#ff7b9c}
  .ops{display:flex;gap:6px}
  .panel{position:fixed;top:0;right:0;height:100vh;width:380px;background:#161b22;border-left:1px solid #2b3440;padding:22px;overflow:auto;transform:translateX(100%);transition:transform .2s;box-shadow:-8px 0 30px rgba(0,0,0,.4)}
  .panel.open{transform:translateX(0)}
  .panel h3{margin:0 0 16px}
  .field{margin-bottom:13px}
  .field label{display:block;font-size:12px;color:#8b98a8;margin-bottom:5px}
  .field input,.field select{width:100%;background:#0e1116;border:1px solid #2b3440;color:#e8edf2;border-radius:8px;padding:9px 11px;font-size:14px;font-family:inherit}
  .panel .row{display:flex;gap:10px;margin-top:18px}
  .kpi{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px}
  .kpi .card{background:#161b22;border:1px solid #2b3440;border-radius:12px;padding:16px}
  .kpi .v{font-size:28px;font-weight:700;color:#39d98a}
  .kpi .l{font-size:13px;color:#8b98a8;margin-top:4px}
  .hint{color:#8b98a8;font-size:12px;margin-top:6px}
</style></head>
<body>
<header><h1>🛠 JDO 后台管理</h1><span class="role">角色：超管（Demo 未挂 RBAC）</span></header>
<div class="layout">
  <nav id="nav"></nav>
  <main id="main"></main>
</div>
<div class="panel" id="panel"></div>
<script src="/admin-ui/app.js"></script>
</body></html>`;

export const ADMIN_APP_JS = `
var RES = [];
var CUR = null;
function api(method, url, body){
  var opt = { method: method, headers: {} };
  if(body){ opt.headers["Content-Type"]="application/json"; opt.body = JSON.stringify(body); }
  return fetch(url, opt).then(function(r){ return r.json().catch(function(){return null;}); });
}
function fmt(v){
  if(v===true) return "是"; if(v===false) return "否";
  if(v===null||v===undefined) return "";
  if(Array.isArray(v)) return v.join(" / ");
  if(typeof v==="object") return JSON.stringify(v);
  return String(v);
}
function buildNav(){
  var nav = document.getElementById("nav");
  var html = "<div class='sec'>概览</div>";
  html += "<a onclick=\\"showAnalytics()\\" id='nav-analytics'>📊 运营看板</a>";
  html += "<div class='sec'>数据管理</div>";
  RES.forEach(function(r){
    html += "<a onclick=\\"selectRes('"+r.key+"')\\" id='nav-"+r.key+"'>"+r.label+"</a>";
  });
  html += "<div class='sec'>系统</div>";
  html += "<a onclick=\\"showConfig()\\" id='nav-config'>⚙ 系统配置</a>";
  nav.innerHTML = html;
}
function setActive(id){
  var as = document.querySelectorAll("nav a");
  for(var i=0;i<as.length;i++) as[i].classList.remove("active");
  var el = document.getElementById(id); if(el) el.classList.add("active");
}
function cfgOf(key){ for(var i=0;i<RES.length;i++){ if(RES[i].key===key) return RES[i]; } return null; }

function selectRes(key){
  CUR = cfgOf(key); setActive("nav-"+key);
  api("GET","/api/v1/admin/"+key).then(function(d){ renderTable(d.items||[]); });
}
function renderTable(items){
  var cfg = CUR;
  var html = "<div class='bar'><h2>"+cfg.label+"</h2><span class='count'>共 "+items.length+" 条</span>"+
    "<button class='btn-add' onclick=\\"openForm()\\">+ 新增</button></div>";
  html += "<table><thead><tr>";
  cfg.columns.forEach(function(c){ html += "<th>"+c+"</th>"; });
  html += "<th>操作</th></tr></thead><tbody>";
  items.forEach(function(row){
    html += "<tr>";
    cfg.columns.forEach(function(c){
      var v = row[c];
      if(typeof v==="boolean"){
        var cls = v?"on":"off"; var txt = boolLabel(c,v);
        html += "<td><button class='badge "+cls+"' onclick=\\"toggleBool('"+row.id+"','"+c+"',"+v+")\\">"+txt+"</button></td>";
      } else {
        html += "<td>"+fmt(v)+"</td>";
      }
    });
    html += "<td><div class='ops'>"+
      "<button class='btn-edit' onclick=\\"openForm('"+row.id+"')\\">编辑</button>"+
      "<button class='btn-del' onclick=\\"delRow('"+row.id+"')\\">删除</button>"+
      "</div></td></tr>";
  });
  html += "</tbody></table>";
  document.getElementById("main").innerHTML = html;
}
function boolLabel(col,v){
  if(col==="onShelf") return v?"已上架":"已下架";
  if(col==="active") return v?"启用":"停用";
  if(col==="open") return v?"营业":"停业";
  if(col==="banned") return v?"已封禁":"正常";
  if(col==="hidden") return v?"已隐藏":"显示";
  return v?"是":"否";
}
function toggleBool(id, field, val){
  var patch = {}; patch[field] = !val;
  api("PATCH","/api/v1/admin/"+CUR.key+"/"+id, patch).then(function(){ selectRes(CUR.key); });
}
function delRow(id){
  if(!confirm("确认删除 "+id+" ?")) return;
  api("DELETE","/api/v1/admin/"+CUR.key+"/"+id).then(function(){ selectRes(CUR.key); });
}
function openForm(id){
  var cfg = CUR;
  var existing = null;
  var done = function(){
    var html = "<h3>"+(id?"编辑 ":"新增 ")+cfg.label+"</h3>";
    cfg.fields.forEach(function(f){
      var val = existing && existing[f]!==undefined ? existing[f] : "";
      if(typeof val==="boolean" || f==="onShelf"||f==="active"||f==="open"||f==="banned"||f==="hidden"){
        var bv = val===true || val==="true";
        html += "<div class='field'><label>"+f+"</label><select id='f-"+f+"'>"+
          "<option value='true'"+(bv?" selected":"")+">是</option>"+
          "<option value='false'"+(!bv?" selected":"")+">否</option></select></div>";
      } else {
        html += "<div class='field'><label>"+f+"</label><input id='f-"+f+"' value='"+String(val).replace(/'/g,"&#39;")+"'></div>";
      }
    });
    html += "<div class='hint'>金额类字段：products 价格按元，orders/coupons 按分。</div>";
    html += "<div class='row'><button class='btn-save' onclick=\\"saveForm('"+(id||"")+"')\\">保存</button>"+
      "<button class='btn-cancel' onclick=\\"closePanel()\\">取消</button></div>";
    var p = document.getElementById("panel"); p.innerHTML = html; p.classList.add("open");
  };
  if(id){ api("GET","/api/v1/admin/"+cfg.key+"/"+id).then(function(r){ existing=r; done(); }); }
  else { done(); }
}
function saveForm(id){
  var cfg = CUR; var body = {};
  cfg.fields.forEach(function(f){
    var el = document.getElementById("f-"+f); if(!el) return;
    var v = el.value;
    if(v==="true") v=true; else if(v==="false") v=false;
    else if(v!=="" && !isNaN(Number(v)) && (f==="price"||f==="ori"||f==="stock"||f==="sort"||f==="amount"||f==="threshold"||f==="points"||f==="star")) v=Number(v);
    body[f]=v;
  });
  var req = id ? api("PATCH","/api/v1/admin/"+cfg.key+"/"+id, body)
              : api("POST","/api/v1/admin/"+cfg.key, body);
  req.then(function(){ closePanel(); selectRes(cfg.key); });
}
function closePanel(){ document.getElementById("panel").classList.remove("open"); }

function showAnalytics(){
  setActive("nav-analytics");
  api("GET","/api/v1/admin/analytics").then(function(d){
    var html = "<div class='bar'><h2>📊 运营看板</h2></div><div class='kpi'>";
    function card(v,l){ return "<div class='card'><div class='v'>"+v+"</div><div class='l'>"+l+"</div></div>"; }
    html += card(d.pv, "PV 浏览量");
    html += card(d.uv, "UV 访客");
    html += card(d.orderTotal, "订单总数");
    html += card("¥"+(d.gmv/100).toFixed(0), "GMV");
    html += card(d.channel.car, "车机入口订单");
    html += card(d.channel.phone, "手机入口订单");
    html += card(d.drivingSwitches, "行车态切换次数");
    html += "</div><p class='hint'>车机 vs 手机入口对比 = PRD US-39；行车态切换 = US-37 埋点。</p>";
    document.getElementById("main").innerHTML = html;
  });
}
function showConfig(){
  setActive("nav-config");
  api("GET","/api/v1/admin/config").then(function(c){
    var html = "<div class='bar'><h2>⚙ 系统配置（行车态）</h2></div>";
    html += "<div class='field'><label>行车态车速阈值 km/h</label><input id='c-drivingSpeedThreshold' value='"+c.drivingSpeedThreshold+"'></div>";
    html += "<div class='field'><label>停车退出持续秒数</label><input id='c-drivingExitSeconds' value='"+c.drivingExitSeconds+"'></div>";
    html += "<div class='field'><label>行车态降级 Banner</label><select id='c-degradeBannerInDriving'>"+
      "<option value='true'"+(c.degradeBannerInDriving?" selected":"")+">是</option>"+
      "<option value='false'"+(!c.degradeBannerInDriving?" selected":"")+">否</option></select></div>";
    html += "<div class='row'><button class='btn-save' onclick='saveConfig()'>保存配置</button></div>";
    document.getElementById("main").innerHTML = html;
  });
}
function saveConfig(){
  var body = {
    drivingSpeedThreshold: Number(document.getElementById("c-drivingSpeedThreshold").value),
    drivingExitSeconds: Number(document.getElementById("c-drivingExitSeconds").value),
    degradeBannerInDriving: document.getElementById("c-degradeBannerInDriving").value==="true"
  };
  api("PATCH","/api/v1/admin/config", body).then(function(){ alert("已保存"); });
}

api("GET","/api/v1/admin/resources").then(function(d){
  RES = d.items || [];
  buildNav();
  selectRes("products"); // 默认进商品管理
});
`;
