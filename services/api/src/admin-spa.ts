/**
 * 后台管理站 SPA —— 套开源 admin 模板范式（TailAdmin / shadcn dashboard 风格，Tailwind 实现）。
 * 布局：分组左导航 + 顶栏 + 面包屑 + 卡片化数据表格 + 搜索/状态Tab/批量操作/分页。
 * 数据驱动：列/字段定义来自 /api/v1/admin/resources。无构建步骤，由 API 直接托管。
 * 浏览器端 JS 一律字符串拼接，避免与本文件 TS 反引号的 ${} 冲突。
 *
 * 模板参考：TailAdmin (MIT) / shadcn-ui dashboard / Flowbite Admin。
 */

export const ADMIN_APP_HTML = `<!doctype html><html lang="zh"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>JDO 后台管理</title>
<script src="https://cdn.tailwindcss.com"></script>
<script>
tailwind.config = { theme: { extend: { colors: {
  brand: { DEFAULT: '#39d98a', 600: '#27c277' },
  ink: { 900:'#0b0f14', 850:'#0e141b', 800:'#141b24', 700:'#1b2430', 600:'#26323f' },
} } } };
</script>
<style>
  html,body{height:100%}
  body{font-family:"Noto Sans SC",system-ui,sans-serif;background:#0b0f14;color:#e6edf3}
  ::-webkit-scrollbar{width:10px;height:10px}
  ::-webkit-scrollbar-thumb{background:#26323f;border-radius:6px}
  .nav-a.active{background:#141b24;color:#fff;border-left-color:#39d98a}
</style></head>
<body>
<div class="flex h-screen overflow-hidden">
  <!-- 侧栏 -->
  <aside class="w-60 shrink-0 bg-ink-850 border-r border-ink-700 flex flex-col">
    <div class="h-14 flex items-center gap-2 px-5 border-b border-ink-700">
      <span class="text-brand text-xl">◆</span><span class="font-semibold">JDO 后台</span>
    </div>
    <nav id="nav" class="flex-1 overflow-y-auto py-2 text-[14px]"></nav>
    <div class="px-5 py-3 border-t border-ink-700 text-xs text-slate-500">超管 · Demo 未挂 RBAC</div>
  </aside>
  <!-- 右侧 -->
  <div class="flex-1 flex flex-col min-w-0">
    <header class="h-14 shrink-0 bg-ink-850 border-b border-ink-700 flex items-center gap-4 px-6">
      <div id="crumb" class="text-sm text-slate-400">后台</div>
      <div class="ml-auto flex items-center gap-3">
        <input id="topsearch" placeholder="搜索当前列表…" class="w-64 bg-ink-800 border border-ink-600 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand">
        <span class="text-slate-400 text-lg">🔔</span>
        <div class="w-8 h-8 rounded-full bg-brand/20 text-brand grid place-items-center text-sm">管</div>
      </div>
    </header>
    <main id="main" class="flex-1 overflow-y-auto p-6"></main>
  </div>
</div>
<!-- 编辑抽屉 -->
<div id="mask" class="fixed inset-0 bg-black/50 hidden z-40"></div>
<div id="panel" class="fixed top-0 right-0 h-screen w-[420px] bg-ink-850 border-l border-ink-700 p-6 overflow-y-auto translate-x-full transition-transform z-50"></div>
<script src="/admin-ui/app.js"></script>
</body></html>`;

export const ADMIN_APP_JS = `
var RES = [], CUR = null, CATMAP = {}, CATS = [];
var PAGE = 1, PAGE_SIZE = 10, QUERY = '', FILTER = '__all__', SEL = {};
var ALL_ROWS = [];

var ORDER_CN = { DRAFT:'待提交', PENDING_PAYMENT:'待支付', PAID:'已支付', SHIPPING:'配送中', COMPLETED:'已完成', CANCELED:'已取消', EXPIRED:'已过期', REFUNDING:'退款中', REFUNDED:'已退款' };
var CHANNEL_CN = { car:'车机', phone:'手机' };
var COUPON_CN = { fixed:'满减', discount:'折扣' };
var AFT_CN = { pending:'待审', approved:'通过', rejected:'拒绝' };

// 导航分组（运营链路，对标主流后台）
var GROUPS = [
  { title:'概览', items:[ {k:'__analytics',label:'运营看板',icon:'📊'} ] },
  { title:'商品', keys:['products','categories'] },
  { title:'营销 / 内容', keys:['banners','heroRecs','coupons'] },
  { title:'交易', keys:['orders','aftersale','shipping'] },
  { title:'客户', keys:['users','reviews'] },
  { title:'履约', keys:['pickupPoints'] },
  { title:'系统', keys:['adminUsers'], items:[ {k:'__config',label:'系统配置',icon:'⚙'} ] },
];
var ICONS = { products:'📦', categories:'🏷', banners:'🖼', heroRecs:'🎯', coupons:'🎟', orders:'🧾', aftersale:'↩', shipping:'🚚', users:'👤', reviews:'⭐', pickupPoints:'📍', adminUsers:'🔑' };

function api(method, url, body){
  var opt = { method:method, headers:{} };
  if(body){ opt.headers['Content-Type']='application/json'; opt.body=JSON.stringify(body); }
  return fetch(url, opt).then(function(r){ return r.json().catch(function(){return null;}); });
}
function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/'/g,'&#39;').replace(/"/g,'&quot;'); }
function cfgOf(key){ for(var i=0;i<RES.length;i++){ if(RES[i].key===key) return RES[i]; } return null; }

function boolLabel(col,v){
  if(col==='onShelf') return v?'已上架':'已下架';
  if(col==='active') return v?'启用':'停用';
  if(col==='open') return v?'营业':'停业';
  if(col==='banned') return v?'已封禁':'正常';
  if(col==='hidden') return v?'已隐藏':'显示';
  return v?'是':'否';
}
function badge(text, kind){
  var c = kind==='ok' ? 'bg-emerald-500/15 text-emerald-400'
        : kind==='bad' ? 'bg-rose-500/15 text-rose-400'
        : 'bg-slate-500/15 text-slate-300';
  return "<span class='px-2 py-0.5 rounded-full text-xs "+c+"'>"+text+"</span>";
}
function fmtCell(row, col){
  var v = row[col.k];
  switch(col.type){
    case 'image': return "<img src='"+esc(v||'')+"' class='w-12 h-9 object-cover rounded-md bg-ink-700' onerror=\\"this.style.opacity=.2\\">";
    case 'bool':
      var on = !!v; var kind = (col.k==='banned'||col.k==='hidden') ? (on?'bad':'ok') : (on?'ok':'bad');
      return "<button onclick=\\"toggleBool('"+row.id+"','"+col.k+"',"+(on?'true':'false')+")\\" class='cursor-pointer'>"+badge(boolLabel(col.k,on), kind)+"</button>";
    case 'cat': return esc(CATMAP[v]||v||'');
    case 'yuan': return v==null?'':'¥'+v;
    case 'fen': return v==null?'':'<span class="font-mono">¥'+(Number(v)/100).toFixed(2)+'</span>';
    case 'num': return v==null?'':"<span class='font-mono'>"+v+"</span>";
    case 'list': return Array.isArray(v)? esc(v.join(' / ')) : esc(v);
    case 'orderStatus':
      var k = (v==='PAID'||v==='COMPLETED')?'ok':((v==='CANCELED'||v==='EXPIRED')?'bad':'mut');
      return badge(ORDER_CN[v]||v, k);
    case 'channel': return CHANNEL_CN[v]||v;
    case 'couponType': return COUPON_CN[v]||v;
    case 'aftStatus': return badge(AFT_CN[v]||v, v==='approved'?'ok':(v==='rejected'?'bad':'mut'));
    default: return esc(v);
  }
}

function buildNav(){
  var html = '';
  GROUPS.forEach(function(g){
    html += "<div class='px-5 pt-4 pb-1 text-[11px] uppercase tracking-wider text-slate-600'>"+g.title+"</div>";
    (g.keys||[]).forEach(function(key){
      var c = cfgOf(key); if(!c) return;
      html += navLink(key, (ICONS[key]||'•')+' '+c.label);
    });
    (g.items||[]).forEach(function(it){
      html += navLink(it.k, it.icon+' '+it.label);
    });
  });
  document.getElementById('nav').innerHTML = html;
}
function navLink(id, label){
  return "<a id='nav-"+id+"' onclick=\\"go('"+id+"')\\" class='nav-a block px-5 py-2 text-slate-300 hover:bg-ink-800 cursor-pointer border-l-2 border-transparent'>"+label+"</a>";
}
function setActive(id){
  document.querySelectorAll('#nav .nav-a').forEach(function(a){ a.classList.remove('active'); });
  var el = document.getElementById('nav-'+id); if(el) el.classList.add('active');
}
function setCrumb(parts){ document.getElementById('crumb').innerHTML = parts.map(esc).join(" <span class='text-slate-600'>/</span> "); }

function go(id){
  if(id==='__analytics') return showAnalytics();
  if(id==='__config') return showConfig();
  selectRes(id);
}

function selectRes(key){
  CUR = cfgOf(key); setActive(key); QUERY=''; PAGE=1; FILTER='__all__'; SEL={};
  document.getElementById('topsearch').value='';
  api('GET','/api/v1/admin/'+key).then(function(d){ ALL_ROWS = d.items||[]; renderList(); });
}

// 当前列表的快速筛选列（第一个 bool 或 orderStatus 列）
function quickCol(){ for(var i=0;i<CUR.columns.length;i++){ var c=CUR.columns[i]; if(c.type==='bool'||c.type==='orderStatus') return c; } return null; }
function filteredRows(){
  var rows = ALL_ROWS;
  var qc = quickCol();
  if(qc && FILTER!=='__all__'){
    rows = rows.filter(function(r){ return String(r[qc.k])===FILTER; });
  }
  if(QUERY){
    var q = QUERY.toLowerCase();
    rows = rows.filter(function(r){ return CUR.columns.some(function(c){ return String(r[c.k]==null?'':r[c.k]).toLowerCase().indexOf(q)>=0; }); });
  }
  return rows;
}

function renderList(){
  setCrumb(['后台', CUR.label]);
  var rows = filteredRows();
  var totalPages = Math.max(1, Math.ceil(rows.length/PAGE_SIZE));
  if(PAGE>totalPages) PAGE=totalPages;
  var pageRows = rows.slice((PAGE-1)*PAGE_SIZE, PAGE*PAGE_SIZE);
  var selIds = Object.keys(SEL).filter(function(k){return SEL[k];});

  var html = "";
  // 标题行
  html += "<div class='flex items-center gap-3 mb-4'>";
  html += "<h1 class='text-xl font-semibold'>"+esc(CUR.label)+"</h1>";
  html += "<span class='text-sm text-slate-500'>共 "+rows.length+" 条</span>";
  html += "<button onclick=\\"openForm()\\" class='ml-auto bg-brand hover:bg-brand-600 text-ink-900 font-semibold rounded-lg px-4 py-2 text-sm'>+ 新增</button>";
  html += "</div>";

  // 快速筛选 Tab
  var qc = quickCol();
  if(qc){
    var tabs = [['__all__','全部']];
    if(qc.type==='bool'){ tabs.push(['true',boolLabel(qc.k,true)]); tabs.push(['false',boolLabel(qc.k,false)]); }
    else { Object.keys(ORDER_CN).forEach(function(k){ tabs.push([k,ORDER_CN[k]]); }); }
    html += "<div class='flex gap-2 mb-4 flex-wrap'>";
    tabs.forEach(function(t){
      var on = FILTER===t[0];
      html += "<button onclick=\\"setFilter('"+t[0]+"')\\" class='px-3 py-1 rounded-full text-sm "+(on?'bg-brand text-ink-900 font-medium':'bg-ink-800 text-slate-300 hover:bg-ink-700')+"'>"+t[1]+"</button>";
    });
    html += "</div>";
  }

  // 批量操作条
  if(selIds.length){
    html += "<div class='flex items-center gap-3 mb-3 bg-ink-800 border border-ink-600 rounded-lg px-4 py-2 text-sm'>";
    html += "<span class='text-slate-300'>已选 "+selIds.length+" 项</span>";
    html += "<button onclick='bulkDelete()' class='text-rose-400 hover:underline'>批量删除</button>";
    if(CUR.key==='products'){ html += "<button onclick='bulkShelf(true)' class='text-emerald-400 hover:underline'>批量上架</button><button onclick='bulkShelf(false)' class='text-slate-300 hover:underline'>批量下架</button>"; }
    html += "<button onclick='clearSel()' class='ml-auto text-slate-500 hover:underline'>取消选择</button>";
    html += "</div>";
  }

  // 表格
  html += "<div class='bg-ink-850 border border-ink-700 rounded-xl overflow-hidden'>";
  html += "<table class='w-full text-sm'><thead><tr class='text-slate-400 border-b border-ink-700'>";
  html += "<th class='w-10 px-3 py-3'><input type='checkbox' "+(pageRows.length&&pageRows.every(function(r){return SEL[r.id];})?'checked':'')+" onclick='togglePage(this.checked)'></th>";
  CUR.columns.forEach(function(c){ html += "<th class='text-left px-3 py-3 font-medium'>"+esc(c.label)+"</th>"; });
  html += "<th class='text-right px-3 py-3 font-medium'>操作</th></tr></thead><tbody>";
  if(pageRows.length===0){ html += "<tr><td colspan='"+(CUR.columns.length+2)+"' class='text-center text-slate-500 py-12'>暂无数据</td></tr>"; }
  pageRows.forEach(function(row){
    html += "<tr class='border-b border-ink-800 hover:bg-ink-800/60'>";
    html += "<td class='px-3 py-2.5'><input type='checkbox' "+(SEL[row.id]?'checked':'')+" onclick=\\"toggleSel('"+row.id+"',this.checked)\\"></td>";
    CUR.columns.forEach(function(c){ html += "<td class='px-3 py-2.5'>"+fmtCell(row,c)+"</td>"; });
    html += "<td class='px-3 py-2.5 text-right whitespace-nowrap'>"
      + "<button onclick=\\"openForm('"+row.id+"')\\" class='text-sky-400 hover:underline mr-3'>编辑</button>"
      + "<button onclick=\\"delRow('"+row.id+"')\\" class='text-rose-400 hover:underline'>删除</button></td>";
    html += "</tr>";
  });
  html += "</tbody></table>";
  // 分页
  html += "<div class='flex items-center gap-3 px-4 py-3 text-sm text-slate-400 border-t border-ink-700'>";
  html += "<span>第 "+PAGE+" / "+totalPages+" 页</span>";
  html += "<div class='ml-auto flex gap-2'>";
  html += "<button onclick='gotoPage("+(PAGE-1)+")' "+(PAGE<=1?'disabled':'')+" class='px-3 py-1 rounded bg-ink-800 disabled:opacity-40'>上一页</button>";
  html += "<button onclick='gotoPage("+(PAGE+1)+")' "+(PAGE>=totalPages?'disabled':'')+" class='px-3 py-1 rounded bg-ink-800 disabled:opacity-40'>下一页</button>";
  html += "</div></div>";
  html += "</div>";

  document.getElementById('main').innerHTML = html;
}
function setFilter(v){ FILTER=v; PAGE=1; renderList(); }
function gotoPage(p){ if(p>=1){ PAGE=p; renderList(); } }
function toggleSel(id, on){ SEL[id]=on; renderList(); }
function togglePage(on){ filteredRows().slice((PAGE-1)*PAGE_SIZE,PAGE*PAGE_SIZE).forEach(function(r){ SEL[r.id]=on; }); renderList(); }
function clearSel(){ SEL={}; renderList(); }
function selectedIds(){ return Object.keys(SEL).filter(function(k){return SEL[k];}); }
function bulkDelete(){
  var ids = selectedIds(); if(!ids.length || !confirm('删除选中的 '+ids.length+' 项？')) return;
  Promise.all(ids.map(function(id){ return api('DELETE','/api/v1/admin/'+CUR.key+'/'+id); })).then(function(){ SEL={}; selectRes(CUR.key); });
}
function bulkShelf(on){
  var ids = selectedIds(); if(!ids.length) return;
  Promise.all(ids.map(function(id){ return api('PATCH','/api/v1/admin/'+CUR.key+'/'+id,{onShelf:on}); })).then(function(){ SEL={}; selectRes(CUR.key); });
}
function toggleBool(id, field, val){
  api('PATCH','/api/v1/admin/'+CUR.key+'/'+id, (function(){var o={};o[field]=!val;return o;})()).then(function(){ selectRes(CUR.key); });
}
function delRow(id){ if(!confirm('确认删除 '+id+' ?')) return; api('DELETE','/api/v1/admin/'+CUR.key+'/'+id).then(function(){ selectRes(CUR.key); }); }

// ---- 表单抽屉 ----
function selectOptions(type, val){
  var opts = [];
  if(type==='cat') opts = CATS.map(function(c){return [c.id,c.name];});
  else if(type==='orderStatus') opts = Object.keys(ORDER_CN).map(function(k){return [k,ORDER_CN[k]];});
  else if(type==='channel') opts = Object.keys(CHANNEL_CN).map(function(k){return [k,CHANNEL_CN[k]];});
  else if(type==='couponType') opts = Object.keys(COUPON_CN).map(function(k){return [k,COUPON_CN[k]];});
  else if(type==='aftStatus') opts = Object.keys(AFT_CN).map(function(k){return [k,AFT_CN[k]];});
  return opts.map(function(o){ return "<option value='"+o[0]+"'"+(String(val)===String(o[0])?' selected':'')+">"+o[1]+"</option>"; }).join('');
}
var inputCls = "w-full bg-ink-800 border border-ink-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand";
function openForm(id){
  var cfg=CUR, existing=null;
  var done=function(){
    var html = "<h3 class='text-lg font-semibold mb-5'>"+(id?'编辑 ':'新增 ')+esc(cfg.label)+"</h3>";
    cfg.fields.forEach(function(f){
      var val = existing && existing[f.k]!==undefined ? existing[f.k] : '';
      html += "<div class='mb-4'><label class='block text-xs text-slate-400 mb-1.5'>"+esc(f.label)+"</label>";
      if(f.type==='bool'){
        var isNew=!existing, pos=(f.k==='onShelf'||f.k==='active'||f.k==='open');
        var bv=(val===true||val==='true')||(isNew&&(val===''||val==null)&&pos);
        html += "<select id='f-"+f.k+"' class='"+inputCls+"'><option value='true'"+(bv?' selected':'')+">是</option><option value='false'"+(!bv?' selected':'')+">否</option></select>";
      } else if(f.type==='cat'||f.type==='orderStatus'||f.type==='channel'||f.type==='couponType'||f.type==='aftStatus'){
        html += "<select id='f-"+f.k+"' class='"+inputCls+"'>"+selectOptions(f.type,val)+"</select>";
      } else if(f.type==='money'){
        var yv=(val===''||val==null)?'':(Number(val)/100);
        html += "<input id='f-"+f.k+"' type='number' step='0.01' value='"+esc(yv)+"' class='"+inputCls+"'>";
      } else if(f.type==='image'){
        var iv=(val==null)?'':String(val);
        html += "<div class='flex items-center gap-3 mb-2'>"
          + "<img id='f-"+f.k+"-prev' src='"+esc(iv)+"' class='w-16 h-12 object-cover rounded-lg bg-ink-700 border border-ink-600' onerror=\\"this.style.opacity=.25\\">"
          + "<label class='bg-ink-700 hover:bg-ink-600 rounded-lg px-3 py-1.5 text-sm cursor-pointer'>上传图片<input type='file' accept='image/*' class='hidden' onchange=\\"onPickImage(this,'f-"+f.k+"')\\"></label></div>"
          + "<input id='f-"+f.k+"' value='"+esc(iv)+"' placeholder='图片 URL，或点上方上传' class='"+inputCls+"' oninput=\\"var p=document.getElementById('f-"+f.k+"-prev');if(p)p.src=this.value;\\">";
      } else {
        html += "<input id='f-"+f.k+"'"+(f.type==='num'?" type='number'":"")+" value='"+esc(val)+"' class='"+inputCls+"'>";
      }
      html += "</div>";
    });
    html += "<div class='flex gap-3 mt-6'>"
      + "<button onclick=\\"saveForm('"+(id||'')+"')\\" class='bg-brand hover:bg-brand-600 text-ink-900 font-semibold rounded-lg px-5 py-2 text-sm'>保存</button>"
      + "<button onclick='closePanel()' class='bg-ink-700 hover:bg-ink-600 rounded-lg px-5 py-2 text-sm'>取消</button></div>";
    var p=document.getElementById('panel'); p.innerHTML=html; p.classList.remove('translate-x-full'); document.getElementById('mask').classList.remove('hidden');
  };
  if(id){ api('GET','/api/v1/admin/'+cfg.key+'/'+id).then(function(r){ existing=r; done(); }); } else done();
}
function saveForm(id){
  var cfg=CUR, body={};
  cfg.fields.forEach(function(f){
    var el=document.getElementById('f-'+f.k); if(!el) return;
    var v=el.value;
    if(f.type==='bool') v=(v==='true');
    else if(f.type==='num') v=(v===''?0:Number(v));
    else if(f.type==='money') v=(v===''?0:Math.round(Number(v)*100));
    body[f.k]=v;
  });
  var req = id ? api('PATCH','/api/v1/admin/'+cfg.key+'/'+id, body) : api('POST','/api/v1/admin/'+cfg.key, body);
  req.then(function(){ closePanel(); selectRes(cfg.key); });
}
function closePanel(){ document.getElementById('panel').classList.add('translate-x-full'); document.getElementById('mask').classList.add('hidden'); }
function onPickImage(input, targetId){
  var file=input.files&&input.files[0]; if(!file) return;
  if(file.size>3*1024*1024){ alert('图片请小于 3MB'); return; }
  var rd=new FileReader();
  rd.onload=function(e){ var uri=e.target.result; var b=document.getElementById(targetId); if(b)b.value=uri; var pv=document.getElementById(targetId+'-prev'); if(pv){pv.src=uri;pv.style.opacity=1;} };
  rd.readAsDataURL(file);
}

// ---- 看板 / 配置 ----
function showAnalytics(){
  setActive('__analytics'); setCrumb(['后台','运营看板']);
  api('GET','/api/v1/admin/analytics').then(function(d){
    function card(v,l){ return "<div class='bg-ink-850 border border-ink-700 rounded-xl p-5'><div class='text-3xl font-bold text-brand'>"+v+"</div><div class='text-sm text-slate-400 mt-1'>"+l+"</div></div>"; }
    var html = "<h1 class='text-xl font-semibold mb-5'>运营看板</h1><div class='grid grid-cols-2 md:grid-cols-4 gap-4'>";
    html += card(d.pv,'PV 浏览量')+card(d.uv,'UV 访客')+card(d.orderTotal,'订单总数')+card('¥'+(d.gmv/100).toFixed(0),'GMV');
    html += card(d.channel.car,'车机入口订单')+card(d.channel.phone,'手机入口订单')+card(d.drivingSwitches,'行车态切换次数')+card('—','更多分析');
    html += "</div><p class='text-xs text-slate-500 mt-4'>车机 vs 手机入口对比 = PRD US-39；行车态切换 = US-37 埋点。</p>";
    document.getElementById('main').innerHTML = html;
  });
}
function showConfig(){
  setActive('__config'); setCrumb(['后台','系统配置']);
  api('GET','/api/v1/admin/config').then(function(c){
    var html = "<h1 class='text-xl font-semibold mb-5'>系统配置（行车态）</h1><div class='max-w-md space-y-4'>";
    html += "<div><label class='block text-xs text-slate-400 mb-1.5'>行车态车速阈值 km/h</label><input id='c-drivingSpeedThreshold' value='"+c.drivingSpeedThreshold+"' class='"+inputCls+"'></div>";
    html += "<div><label class='block text-xs text-slate-400 mb-1.5'>停车退出持续秒数</label><input id='c-drivingExitSeconds' value='"+c.drivingExitSeconds+"' class='"+inputCls+"'></div>";
    html += "<div><label class='block text-xs text-slate-400 mb-1.5'>行车态降级 Banner</label><select id='c-degradeBannerInDriving' class='"+inputCls+"'><option value='true'"+(c.degradeBannerInDriving?' selected':'')+">是</option><option value='false'"+(!c.degradeBannerInDriving?' selected':'')+">否</option></select></div>";
    html += "<button onclick='saveConfig()' class='bg-brand hover:bg-brand-600 text-ink-900 font-semibold rounded-lg px-5 py-2 text-sm'>保存配置</button></div>";
    document.getElementById('main').innerHTML = html;
  });
}
function saveConfig(){
  api('PATCH','/api/v1/admin/config',{
    drivingSpeedThreshold:Number(document.getElementById('c-drivingSpeedThreshold').value),
    drivingExitSeconds:Number(document.getElementById('c-drivingExitSeconds').value),
    degradeBannerInDriving:document.getElementById('c-degradeBannerInDriving').value==='true'
  }).then(function(){ alert('已保存'); });
}

// 顶栏搜索联动当前列表
document.getElementById('topsearch').addEventListener('input', function(e){ if(!CUR) return; QUERY=e.target.value; PAGE=1; renderList(); });
document.getElementById('mask').addEventListener('click', closePanel);

// 启动：先拉分类建映射，再加载资源
api('GET','/api/v1/admin/categories').then(function(cd){
  CATS=(cd&&cd.items)||[]; CATS.forEach(function(c){ CATMAP[c.id]=c.name; });
  return api('GET','/api/v1/admin/resources');
}).then(function(d){
  RES=(d&&d.items)||[]; buildNav(); selectRes('products');
});
`;
