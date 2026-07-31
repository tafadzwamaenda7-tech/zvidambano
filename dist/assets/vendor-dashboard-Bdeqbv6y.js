import"./styles-B_rwOSkn.js";import{J as k,t as h,Z as C,a1 as M,d as F,r as T,w as R,a as p,b as q,I as e,h as $,s as r,p as l,i as c,n as u,j as b,l as g,q as Z,u as d,k as w,M as P,x as B,P as D,y as _,m as A,c as J,e as j,f as z,H as G,F as f,K as U,g as O,B as H,C as K,a2 as Y}from"./core-DJvTQki7.js";const v="Vendor Supplies Ltd";let o=null;k.callBuyer=()=>{h("Dialing ZVIDA buyer desk — placing the call from your phone","info")};k.editProduct=(t,i)=>{const n=i.closest("tr")?.querySelectorAll("td");n&&n.length>=3&&(o={oldName:n[0].textContent?.trim()||"",name:n[0].textContent?.trim()||"",price:(n[1].textContent||"").trim(),unit:(n[2].textContent||"").trim()}),window.location.hash="#today",window.location.hash="#listings",h("Product loaded into the form — update and save","info")};k.cancelProdEdit=()=>{o=null;const t=window.location.hash;window.location.hash="#today",window.location.hash=t||"#listings",h("Edit cancelled","info")};k.submitProduct=()=>{const t=document.querySelectorAll(".dsh-input");if(o){const E=(t[0]?.value||o.name).trim()||o.name,L=parseFloat((t[1]?.value||o.price).replace(/[$ ,]/g,""))||0,V=(t[2]?.value||o.unit).trim()||o.unit,I=o.oldName,y=C(v).find(x=>x.name===I);y&&(y.name=E,y.price=L,y.unit=V),o=null,window.location.hash="#today",window.location.hash="#listings",h("Product updated");return}const i=document.querySelector(".dsh-select")?.value||"Fertilizer",a=(t[0]?.value||"").trim()||"New Product",n=parseFloat((t[1]?.value||"0").replace(/[$ ,]/g,""))||0,s=(t[2]?.value||"").trim()||"unit",S=parseInt(t[3]?.value||"0",10)||0,N={id:"v"+Date.now(),name:a,category:i,price:n,unit:s,seller:v,stock:S,rating:4.5,reviews:0,thumb:"fert"};M(N),h("Product listed on the marketplace"),window.location.hash="#today",window.location.hash="#listings"};k.saveVendorSettings=()=>{const t=document.querySelector('[data-js="saveVendorSettings"]');t&&(t.textContent="Saved",t.disabled=!0),h("Bank details saved")};k.downloadStatement=()=>{F("v-stmt"),h("Statement downloaded")};T("v-stmt","Vendor_Statement_Jul2026.csv",["Date,Payout,Source,Status","Jul 15 2026,1120,ORD-5508,Paid","Jul 12 2026,860,ORD-5505,Paid","Jul 10 2026,640,ORD-5502,Paid"].join(`
`),"text/csv");R("v-list",{submit:{done:"Submitted",toast:"Product listed on the marketplace"}});R("v-stock",{add:{done:"Added",toast:"Product form opened"},restock:{done:"Sent",nav:"#inventory",toast:"Restock request sent to ZVIDA",insert:p("ok","Restock request sent to ZVIDA — you will be notified when confirmed.")}});const m={today:{id:"today",label:"Today",icon:e.dashboard,title:"Today",sub:"Vendor Supplies Ltd",render:()=>{const t=A(v),i=t.filter(n=>!["DELIVERED","CANCELLED"].includes(n.status)),a=t.filter(n=>n.status==="NEW").length;return`
      ${H({kick:"Vendor Supplies Ltd · Verified",title:"Good morning",sub:`${i.length} orders to fulfil and 7 low-stock items need attention today.`,actions:`${O("New Order","primary","Opening new orders","#orders")}`,bg:"dash/hero-warehouse.jpg",stats:[{l:"Orders today",v:String(t.length)},{l:"Month sales",v:"$8,900"},{l:"Fulfilment rate",v:"98%"}]})}
      ${K([{label:"New Orders",icon:e.orders,badge:a,toast:"Opening new orders",href:"#orders"},{label:"Add Product",icon:e.plus,toast:"Opening product form",href:"#listings"},{label:"Restock Alert",icon:e.alert,badge:7,toast:"Opening low stock items",href:"#inventory"},{label:"Payouts",icon:e.wallet,toast:"Opening payouts",href:"#finance"}])}
      ${w([{label:"Open Orders",value:i.length,icon:e.orders,delta:`${a} need action`,up:!1,spark:[1,2,3,2,4,3,4],foot:"Across the marketplace",open:"#orders"},{label:"Month Sales",value:"$8,900",icon:e.trendingUp,delta:"+9% this month",up:!0,spark:[20,26,24,30,36,40,44],foot:"Gross revenue",open:"#finance"},{label:"Pending Payouts",value:"$2,400",icon:e.wallet,delta:"3 payouts queued",up:!1,spark:[12,14,18,16,20,22,24],foot:"NET_7 terms",open:"#finance"},{label:"Fulfilment Rate",value:98,icon:e.shield,delta:"Across 300 orders",up:!0,spark:[90,93,95,94,96,97,98],foot:"% of orders",open:"#orders"}])}
      ${$(`
        ${r("Orders to Fulfil","View all","Opening order pipeline",void 0,"#orders")}
        ${i.length===0?p("ok","No open orders right now. New marketplace orders will appear here."):i.slice(0,3).map(n=>Y(n,"seller")).join("")}
      `,`
        ${r("Low Stock Alerts")}
        ${p("warn","7 items below reorder level. Restock advised this week.","View stock","Opening inventory","#inventory")}
        ${l({body:P(["Product","Stock","Reorder level"],[["NPK Fertilizer","12 bags","20 bags"],["SC403 Maize Seed","8 kg","25 kg"],["Roundup Herbicide","5 L","15 L"]]),flush:!0})}
        ${l({title:"Marketplace Today",icon:e.trendingUp,body:`${g(e.orders,"Orders placed",`${t.length} all-time · ${a} new`,String(a),"plain",!0)}
            ${g(e.wallet,"Revenue (delivered)","Confirmed marketplace orders",D(t.filter(n=>n.status==="DELIVERED").reduce((n,s)=>n+s.total,0)),"pos")}`})}
      `)}`}},inventory:{id:"inventory",label:"Inventory",icon:e.inventory,title:"Inventory",sub:"Stock levels & restock",render:()=>`
      ${w([{label:"Total Products",value:94,icon:e.inventory,delta:"+3 this month",up:!0,spark:[10,12,12,13,14,14,15],foot:"Listed SKUs",open:"#listings"},{label:"Stock Value",value:"$18,400",icon:e.wallet,delta:"Restock advised",up:!1,spark:[30,34,32,36,35,38,37],foot:"At cost",open:"#inventory"},{label:"Low Stock Items",value:7,icon:e.alert,delta:"Below reorder level",up:!1,spark:[4,5,6,5,7,6,7],foot:"Restock advised",open:"#inventory"},{label:"Out of Stock",value:2,icon:e.x,delta:"Restock immediately",up:!1,spark:[1,2,2,3,2,2,2],foot:"Require action",open:"#inventory"}])}
      ${r("Stock Levels")}
      ${l({body:P(["","Product","Stock","Unit","Status"],[[f("fert","xs"),"NPK Fertilizer","12","bags",d("Low","amber")],[f("seed","xs"),"SC403 Maize Seed","48","kg",d("Ok","green")],[f("chem","xs"),"Roundup Herbicide","5","L",d("Low","amber")],[f("feed","xs"),"Poultry Mash Feed","60","bags",d("Ok","green")],[f("chicks","xs"),"Day-old Chicks","0","units",d("Out of stock","red")]],[],["#listings","#listings","#listings","#listings","#listings"]),flush:!0})}
      <div class="dsh-btn-row" style="margin-top:12px">${O("Add Product","primary","Product form opened","#listings")}${O("Restock Request","outline","Restock request sent to ZVIDA",void 0,"v-stock","restock")}</div>
    `},listings:{id:"listings",label:"Listings",icon:e.listings,title:"Listings",sub:"Add & manage products",render:()=>`
      ${$(`
        ${r("Add Product")}
        ${l({title:"New product",icon:e.plus,body:`
            <div class="dsh-field-grid">
              ${c("Product name",u(o?o.name:void 0,"e.g. NPK Fertilizer"))}
              ${c("Category",G(["Fertilizer","Seeds","Chemicals","Stockfeed","Livestock","Equipment"],0))}
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
              ${f("fert","wide")}
              <div style="margin-top:10px">${U("Upload image","ghost sm","image/*")}</div>
            </div>
            ${o?p("ok",`Editing <b>${o.name}</b> — update and save.`):""}
            <div class="dsh-btn-row">${o?b("Cancel","ghost","cancelProdEdit","listings","Edit cancelled"):""}${b(o?"Save Changes":"Submit Listing","primary","submitProduct","",o?"Product updated":"Product listed on the marketplace")}</div>`})}
      `,`
        ${r("Active Listings")}
        ${l({body:`
            <div data-vend-list>
            ${P(["Product","Price","Unit","Stock","Status",""],C(v).map(t=>[t.name,D(t.price),t.unit,String(t.stock),t.stock<=0?d("Out of stock","red"):d("Active","green"),b("Edit","ghost sm","editProduct","","Product loaded into the form")]))}
            </div>`,flush:!0})}
        ${l({title:"Selling Tips",icon:e.spark,body:p("info","Products with real photos sell <b>2.4x</b> faster on average. Keep photos fresh.")})}
      `)}
    `},orders:{id:"orders",label:"Orders",icon:e.orders,title:"Orders",sub:"Marketplace order pipeline",render:()=>{const t=A(v),i=t.filter(a=>a.status==="NEW").length;return`
      ${p("info",`${i} new marketplace orders awaiting your confirmation.`,"Fulfil now","Showing new orders","#orders")}
      ${r("Order Pipeline","Manage listings","Opening your inventory",t.length,"#inventory")}
      ${J(["All","Active","Pending","Loading","Offloading","Complete"],0,"vord")}
      ${t.map(a=>j(a,"seller","vord",z(a.status))).join("")}
      ${t.length===0?p("ok","No orders yet. Farmers see your listings live on the marketplace."):""}
    `}},dispatch:{id:"dispatch",label:"Dispatch",icon:e.truck,title:"Dispatch",sub:"Consignments to ZVIDA",render:()=>{const t=B().filter(s=>s.supplier===v),i=t.filter(s=>!["PAID","CANCELLED"].includes(s.status)),a=t.filter(s=>s.status==="PAID"),n=t.filter(s=>s.status==="PENDING_PAYMENT").reduce((s,S)=>s+S.amount,0);return`
      ${w([{label:"Open Consignments",value:i.length,icon:e.truck,delta:"To ZVIDA depots",up:!0,spark:[1,1,2,1,2,2,Math.max(i.length,1)],foot:"Dispatch queue",open:"#dispatch"},{label:"Awaiting Payment",value:t.filter(s=>s.status==="PENDING_PAYMENT").length,icon:e.wallet,delta:`${D(n)} in escrow`,up:!1,spark:[0,1,0,1,1,1,Math.max(t.filter(s=>s.status==="PENDING_PAYMENT").length,1)],foot:"ZVIDA settles on terms",open:"#finance"},{label:"Settled",value:a.length,icon:e.check,delta:"Paid to your bank",up:!0,spark:[1,2,1,2,3,3,Math.max(a.length,4)],foot:"Completed loads",open:"#finance"}])}
      ${p("info","Dispatch fertilizer and inputs to ZVIDA depots. Record the first weighbridge weight to start the consignment — ZVIDA pays on NET_21.")}
      ${r("Dispatch Queue","Settled loads","Opening settled loads",a.length,"#finance")}
      ${i.length?i.map(s=>_(s,"supplier")).join(""):p("ok","No open consignments right now.")}
    `}},finance:{id:"finance",label:"Finance",icon:e.finance,title:"Finance",sub:"Payouts & history",render:()=>`
      ${w([{label:"Month Sales",value:"$8,900",icon:e.trendingUp,delta:"+9% this month",up:!0,spark:[20,26,24,30,36,40,44],foot:"Gross revenue",open:"#finance"},{label:"Pending Payouts",value:"$2,400",icon:e.wallet,delta:"3 payouts queued",up:!1,spark:[12,14,18,16,20,22,24],foot:"NET_7 terms",open:"#finance"},{label:"Orders This Month",value:312,icon:e.orders,delta:"14 awaiting fulfilment",up:!0,spark:[30,40,38,48,56,60,66],foot:"Across all channels",open:"#orders"},{label:"Fulfilment Rate",value:98,icon:e.shield,delta:"Across 300 orders",up:!0,spark:[90,93,95,94,96,97,98],foot:"% of orders",open:"#orders"}])}
      ${$(`
        ${r("Pending Payouts")}
        ${l({body:`
            ${g(e.finance,"Payout PY-2212","ORD-5510 · Processing","$450","pos",!1,"#orders")}
            ${g(e.finance,"Payout PY-2211","ORD-5509 · Shipped","$375","pos",!1,"#orders")}
            ${g(e.finance,"Payout PY-2210","ORD-5508 · Delivered","$1,120","pos",!1,"#orders")}`})}
      `,`
        ${r("Payment History")}
        ${l({body:P(["Date","Payout","Source","Status"],[["Jul 15, 2026","$1,120","ORD-5508",d("Paid","green")],["Jul 12, 2026","$860","ORD-5505",d("Paid","green")],["Jul 10, 2026","$640","ORD-5502",d("Paid","green")]],[],["#orders","#orders","#orders"]),flush:!0})}
        ${b("Download Statement","outline","downloadStatement","","Statement downloaded")}
      `)}
    `},settings:{id:"settings",label:"Settings",icon:e.settings,title:"Settings",sub:"Company & banking",render:()=>`
      ${$(`
        ${r("Profile")}
        ${l({title:"Company",icon:e.users,body:Z([{k:"Company",v:"Vendor Supplies Ltd"},{k:"Location",v:"Harare, Zimbabwe"},{k:"Phone",v:"+263 77 555 1212"},{k:"Status",v:`${d("Verified","green")}`}])})}
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
            <div class="dsh-btn-row">${b("Save Changes","primary","saveVendorSettings","","Bank details saved")}</div>`})}
        ${l({title:"Store Rating",icon:e.shield,body:`${g(e.shield,"Seller score","4.9 / 5.0 · 300 orders","Top","pos",!0)}
            ${g(e.check,"Fulfilment rate","98% on time","Great","pos")}`})}
      `)}
    `}};q({name:"Vendor",roleLabel:"Vendor",company:"Vendor Supplies Ltd",initials:"V",accent:"#0d9488",accentHover:"#0f766e",accentLight:"#f0fdfa",accentRgb:"13, 148, 136",gradientEnd:"#2dd4bf",pages:[m.today,m.inventory,m.listings,m.orders,m.dispatch,m.finance,m.settings]});
