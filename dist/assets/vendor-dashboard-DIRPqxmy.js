import"./auth-ui-CasobAI5.js";import{J as b,t as h,_ as R,a4 as M,d as T,r as q,w as N,a as p,b as Z,I as e,A as B,h as w,s as r,p as l,i as c,n as u,j as y,l as m,q as G,u as d,k as P,N as S,x as _,Q as O,y as z,m as C,c as J,e as j,f as U,K,G as v,L as Y,a5 as k,g as A,C as H,D as W,a6 as Q}from"./core-B4swM7IO.js";const f="Vendor Supplies Ltd";let o=null;b.callBuyer=()=>{h("Dialing ZVIDA — placing the call from your phone","info")};b.editProduct=(t,i)=>{const s=i.closest("tr")?.querySelectorAll("td");s&&s.length>=3&&(o={oldName:s[0].textContent?.trim()||"",name:s[0].textContent?.trim()||"",price:(s[1].textContent||"").trim(),unit:(s[2].textContent||"").trim()}),window.location.hash="#today",window.location.hash="#listings",h("Product loaded into the form — update and save","info")};b.cancelProdEdit=()=>{o=null;const t=window.location.hash;window.location.hash="#today",window.location.hash=t||"#listings",h("Edit cancelled","info")};b.submitProduct=()=>{const t=document.querySelectorAll(".dsh-input");if(o){const L=(t[0]?.value||o.name).trim()||o.name,V=parseFloat((t[1]?.value||o.price).replace(/[$ ,]/g,""))||0,I=(t[2]?.value||o.unit).trim()||o.unit,x=o.oldName,$=R(f).find(F=>F.name===x);$&&($.name=L,$.price=V,$.unit=I),o=null,window.location.hash="#today",window.location.hash="#listings",h("Product updated");return}const i=document.querySelector(".dsh-select")?.value||"Fertilizer",a=(t[0]?.value||"").trim()||"New Product",s=parseFloat((t[1]?.value||"0").replace(/[$ ,]/g,""))||0,n=(t[2]?.value||"").trim()||"unit",D=parseInt(t[3]?.value||"0",10)||0,E={id:"v"+Date.now(),name:a,category:i,price:s,unit:n,seller:f,stock:D,rating:4.5,reviews:0,thumb:"fert"};M(E),h("Product listed for sale"),window.location.hash="#today",window.location.hash="#listings"};b.saveVendorSettings=()=>{const t=document.querySelector('[data-js="saveVendorSettings"]');t&&(t.textContent="Saved",t.disabled=!0),h("Bank details saved")};b.downloadStatement=()=>{T("v-stmt"),h("Statement downloaded")};q("v-stmt","Vendor_Statement_Jul2026.csv",["Date,Payout,Source,Status","Jul 15 2026,1120,ORD-5508,Paid","Jul 12 2026,860,ORD-5505,Paid","Jul 10 2026,640,ORD-5502,Paid"].join(`
`),"text/csv");N("v-list",{submit:{done:"Submitted",toast:"Product listed for sale"}});N("v-stock",{add:{done:"Added",toast:"Product form opened"},restock:{done:"Sent",nav:"#inventory",toast:"Restock request sent to ZVIDA",insert:p("ok","Restock request sent to ZVIDA — you will be notified when confirmed.")}});const g={today:{id:"today",label:"Today",icon:e.dashboard,title:"Today",sub:"Vendor Supplies Ltd",render:()=>{const t=C(f),i=t.filter(s=>!["DELIVERED","CANCELLED"].includes(s.status)),a=t.filter(s=>s.status==="NEW").length;return`
      ${H({kick:"Vendor Supplies Ltd · Verified",title:"Good morning",sub:`${i.length} orders to fulfil and 7 low-stock items need attention today.`,actions:`${A("New Order","primary","Opening new orders","#orders")}`,bg:"dash/hero-warehouse.jpg",stats:[{l:"Orders today",v:String(t.length)},{l:"Month sales",v:"$8,900"},{l:"Fulfilment rate",v:"98%"}]})}
      ${W([{label:"New Orders",icon:e.orders,badge:a,toast:"Opening new orders",href:"#orders"},{label:"Add Product",icon:e.plus,toast:"Opening product form",href:"#listings"},{label:"Restock Alert",icon:e.alert,badge:7,toast:"Opening low stock items",href:"#inventory"},{label:"Payouts",icon:e.wallet,toast:"Opening payouts",href:"#finance"}])}
      ${P([{label:"Open Orders",value:i.length,icon:e.orders,delta:`${a} need action`,up:!1,spark:[1,2,3,2,4,3,4],foot:"Across your store",open:"#orders"},{label:"Month Sales",value:"$8,900",icon:e.trendingUp,delta:"+9% this month",up:!0,spark:[20,26,24,30,36,40,44],foot:"Gross revenue",open:"#finance"},{label:"Pending Payouts",value:"$2,400",icon:e.wallet,delta:"3 payouts queued",up:!1,spark:[12,14,18,16,20,22,24],foot:"NET_7 terms",open:"#finance"},{label:"Fulfilment Rate",value:98,icon:e.shield,delta:"Across 300 orders",up:!0,spark:[90,93,95,94,96,97,98],foot:"% of orders",open:"#orders"}])}
      ${w(`
        ${r("Orders to Fulfil","View all","Opening order pipeline",void 0,"#orders")}
        ${i.length===0?p("ok","No open orders right now. New orders from ZVIDA customers will appear here."):i.slice(0,3).map(s=>Q(s,"seller")).join("")}
      `,`
        ${r("Low Stock Alerts")}
        ${p("warn","7 items below reorder level. Restock advised this week.","View stock","Opening inventory","#inventory")}
        ${l({body:S(["Product","Stock","Reorder level"],[["NPK Fertilizer","12 bags","20 bags"],["SC403 Maize Seed","8 kg","25 kg"],["Roundup Herbicide","5 L","15 L"]]),flush:!0})}
        ${l({title:"Today at a Glance",icon:e.trendingUp,body:`${m(e.orders,"Orders placed",`${t.length} all-time · ${a} new`,String(a),"plain",!0)}
            ${m(e.wallet,"Revenue (delivered)","Confirmed orders",O(t.filter(s=>s.status==="DELIVERED").reduce((s,n)=>s+n.total,0)),"pos")}`})}
      `)}`}},inventory:{id:"inventory",label:"Inventory",icon:e.inventory,title:"Inventory",sub:"Stock levels & restock",render:()=>`
      ${P([{label:"Total Products",value:94,icon:e.inventory,delta:"+3 this month",up:!0,spark:[10,12,12,13,14,14,15],foot:"Listed SKUs",open:"#listings"},{label:"Stock Value",value:"$18,400",icon:e.wallet,delta:"Restock advised",up:!1,spark:[30,34,32,36,35,38,37],foot:"At cost",open:"#inventory"},{label:"Low Stock Items",value:7,icon:e.alert,delta:"Below reorder level",up:!1,spark:[4,5,6,5,7,6,7],foot:"Restock advised",open:"#inventory"},{label:"Out of Stock",value:2,icon:e.x,delta:"Restock immediately",up:!1,spark:[1,2,2,3,2,2,2],foot:"Require action",open:"#inventory"}])}
      ${r("Stock Levels")}
      ${l({body:S(["","Product","Stock","Unit","Level","Status"],[[v("fert","xs"),"NPK Fertilizer","12","bags",k(60,"warn"),d("Low","amber")],[v("seed","xs"),"SC403 Maize Seed","48","kg",k(100,"ok"),d("Ok","green")],[v("chem","xs"),"Roundup Herbicide","5","L",k(33,"warn"),d("Low","amber")],[v("feed","xs"),"Poultry Mash Feed","60","bags",k(100,"ok"),d("Ok","green")],[v("chicks","xs"),"Day-old Chicks","0","units",k(0,"danger"),d("Out of stock","red")]],[],["#listings","#listings","#listings","#listings","#listings"]),flush:!0})}
      <div class="dsh-btn-row" style="margin-top:12px">${A("Add Product","primary","Product form opened","#listings")}${A("Restock Request","outline","Restock request sent to ZVIDA",void 0,"v-stock","restock")}</div>
    `},listings:{id:"listings",label:"Listings",icon:e.listings,title:"Listings",sub:"Add & manage products",render:()=>`
      ${w(`
        ${r("Add Product")}
        ${l({title:"New product",icon:e.plus,body:`
            <div class="dsh-field-grid">
              ${c("Product name",u(o?o.name:void 0,"e.g. NPK Fertilizer"))}
              ${c("Category",K(["Fertilizer","Seeds","Chemicals","Stockfeed","Livestock","Equipment"],0))}
            </div>
            <div class="dsh-field-grid">
              ${c("Price",u(o?o.price:void 0,"$ 45.00"))}
              ${c("Unit",u(o?o.unit:void 0,"50kg bag"))}
            </div>
            <div class="dsh-field-grid">
              ${c("Stock quantity",u("20"))}
              ${c("Reorder level",u("5"))}
            </div>
            <div style="margin-bottom:14px">
              <span class="dsh-label">Product image</span>
              ${v("fert","wide")}
              <div style="margin-top:10px">${Y("Upload image","ghost sm","image/*")}</div>
            </div>
            ${o?p("ok",`Editing <b>${o.name}</b> — update and save.`):""}
            <div class="dsh-btn-row">${o?y("Cancel","ghost","cancelProdEdit","listings","Edit cancelled"):""}${y(o?"Save Changes":"Submit Listing","primary","submitProduct","",o?"Product updated":"Product listed for sale")}</div>`})}
      `,`
        ${r("Active Listings")}
        ${l({body:`
            <div data-vend-list>
            ${S(["Product","Price","Unit","Stock","Status",""],R(f).map(t=>[t.name,O(t.price),t.unit,String(t.stock),t.stock<=0?d("Out of stock","red"):d("Active","green"),y("Edit","ghost sm","editProduct","","Product loaded into the form")]))}
            </div>`,flush:!0})}
        ${l({title:"Selling Tips",icon:e.spark,body:p("info","Products with real photos sell <b>2.4x</b> faster on average. Keep photos fresh.")})}
      `)}
    `},orders:{id:"orders",label:"Orders",icon:e.orders,title:"Orders",sub:"Order pipeline",render:()=>{const t=C(f),i=t.filter(a=>a.status==="NEW").length;return`
      ${p("info",`${i} new orders awaiting your confirmation.`,"Fulfil now","Showing new orders","#orders")}
      ${r("Order Pipeline","Manage listings","Opening your inventory",t.length,"#inventory")}
      ${J(["All","Active","Pending","Loading","Offloading","Complete"],0,"vord")}
      ${t.map(a=>j(a,"seller","vord",U(a.status))).join("")}
      ${t.length===0?p("ok","No orders yet. ZVIDA will send you orders as customers buy your products."):""}
    `}},dispatch:{id:"dispatch",label:"Dispatch",icon:e.truck,title:"Dispatch",sub:"Consignments to ZVIDA",render:()=>{const t=_().filter(n=>n.supplier===f),i=t.filter(n=>!["PAID","CANCELLED"].includes(n.status)),a=t.filter(n=>n.status==="PAID"),s=t.filter(n=>n.status==="PENDING_PAYMENT").reduce((n,D)=>n+D.amount,0);return`
      ${P([{label:"Open Consignments",value:i.length,icon:e.truck,delta:"To ZVIDA depots",up:!0,spark:[1,1,2,1,2,2,Math.max(i.length,1)],foot:"Dispatch queue",open:"#dispatch"},{label:"Awaiting Payment",value:t.filter(n=>n.status==="PENDING_PAYMENT").length,icon:e.wallet,delta:`${O(s)} in escrow`,up:!1,spark:[0,1,0,1,1,1,Math.max(t.filter(n=>n.status==="PENDING_PAYMENT").length,1)],foot:"ZVIDA settles on terms",open:"#finance"},{label:"Settled",value:a.length,icon:e.check,delta:"Paid to your bank",up:!0,spark:[1,2,1,2,3,3,Math.max(a.length,4)],foot:"Completed loads",open:"#finance"}])}
      ${p("info","Dispatch fertilizer and inputs to ZVIDA depots. Record the first weighbridge weight to start the consignment — ZVIDA pays on NET_21.")}
      ${r("Dispatch Queue","Settled loads","Opening settled loads",a.length,"#finance")}
      ${i.length?i.map(n=>z(n,"supplier")).join(""):p("ok","No open consignments right now.")}
    `}},finance:{id:"finance",label:"Finance",icon:e.finance,title:"Finance",sub:"Payouts & history",render:()=>`
      ${P([{label:"Month Sales",value:"$8,900",icon:e.trendingUp,delta:"+9% this month",up:!0,spark:[20,26,24,30,36,40,44],foot:"Gross revenue",open:"#finance"},{label:"Pending Payouts",value:"$2,400",icon:e.wallet,delta:"3 payouts queued",up:!1,spark:[12,14,18,16,20,22,24],foot:"NET_7 terms",open:"#finance"},{label:"Orders This Month",value:312,icon:e.orders,delta:"14 awaiting fulfilment",up:!0,spark:[30,40,38,48,56,60,66],foot:"Across all channels",open:"#orders"},{label:"Fulfilment Rate",value:98,icon:e.shield,delta:"Across 300 orders",up:!0,spark:[90,93,95,94,96,97,98],foot:"% of orders",open:"#orders"}])}
      ${w(`
        ${r("Pending Payouts")}
        ${l({body:`
            ${m(e.finance,"Payout PY-2212","ORD-5510 · Processing","$450","pos",!1,"#orders")}
            ${m(e.finance,"Payout PY-2211","ORD-5509 · Shipped","$375","pos",!1,"#orders")}
            ${m(e.finance,"Payout PY-2210","ORD-5508 · Delivered","$1,120","pos",!1,"#orders")}`})}
      `,`
        ${r("Payment History")}
        ${l({body:S(["Date","Payout","Source","Status"],[["Jul 15, 2026","$1,120","ORD-5508",d("Paid","green")],["Jul 12, 2026","$860","ORD-5505",d("Paid","green")],["Jul 10, 2026","$640","ORD-5502",d("Paid","green")]],[],["#orders","#orders","#orders"]),flush:!0})}
        ${y("Download Statement","outline","downloadStatement","","Statement downloaded")}
      `)}
    `},settings:{id:"settings",label:"Settings",icon:e.settings,title:"Settings",sub:"Company & banking",render:()=>`
      ${w(`
        ${r("Profile")}
        ${l({title:"Company",icon:e.users,body:G([{k:"Company",v:"Vendor Supplies Ltd"},{k:"Location",v:"Harare, Zimbabwe"},{k:"Phone",v:"+263 77 555 1212"},{k:"Status",v:`${d("Verified","green")}`}])})}
      `,`
        ${r("Bank Details")}
        ${l({title:"Payments",icon:e.wallet,body:`
            <div class="dsh-field-grid">
              ${c("Bank",u("CBZ Bank"))}
              ${c("Account number",u("•••• 4921"))}
            </div>
            <div class="dsh-field-grid">
              ${c("Mobile money",u("EcoCash +263 77 555 1212"))}
              ${c("Tax number",u("ZW-8842-113"))}
            </div>
            <div class="dsh-btn-row">${y("Save Changes","primary","saveVendorSettings","","Bank details saved")}</div>`})}
        ${l({title:"Store Rating",icon:e.shield,body:`${m(e.shield,"Seller score","4.9 / 5.0 · 300 orders","Top","pos",!0)}
            ${m(e.check,"Fulfilment rate","98% on time","Great","pos")}`})}
      `)}
    `},documents:{id:"documents",label:"Documents",icon:e.file,title:"Documents",sub:"Purchase orders, delivery notes & receipts",render:()=>B("supplier",f)}};Z({name:"Vendor",roleLabel:"Vendor",company:"Vendor Supplies Ltd",initials:"V",accent:"#0d9488",accentHover:"#0f766e",accentLight:"#f0fdfa",accentRgb:"13, 148, 136",gradientEnd:"#2dd4bf",pages:[g.today,g.inventory,g.listings,g.orders,g.dispatch,g.documents,g.finance,g.settings],navGroups:[{label:"Overview",pages:["today"]},{label:"Store",pages:["inventory","listings","orders"]},{label:"Logistics",pages:["dispatch","documents"]},{label:"Finance & Account",pages:["finance","settings"]}]});
