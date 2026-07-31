import"./styles-B_rwOSkn.js";import{w as S,D as B,g as r,j as p,E as z,u as y,J as v,t as m,d as _,l as n,F as b,r as I,b as q,I as e,G,s as a,p as i,a as s,i as c,H as R,K as V,q as W,h as T,L as Y,k as E,M as F,N as H,O as U,v as w,x as Q,P as D,y as K,m as X,c as L,e as ee,f as te,Q as ae,R as ie,S as O,z as Z,T as M,U as oe,V as re,W as P,X as ne,Y as J,Z as se,B as le,C as de,_ as ce,n as C,$ as ue,a0 as N}from"./core-DJvTQki7.js";S("f-sched-882",{start:{to:"IN TRANSIT",tone:"indigo",nav:"#contracts",toast:"Loading started — ZVIDA notified",meta:"Driver: <b>John Doe</b> (+263 77 123 4567) · Truck ABC-123 (Scania R450) · Trailer XYZ-789<br/>Contract #882 · 20 tons Maize · Truck en route to Miller Corp",foot:r("Track Live","primary sm","Opening live tracking",void 0,"f-sched-882","track")+p("Call Driver","ghost sm","callDriver","John Doe +263 77 123 4567","Dialing John Doe…")},track:{nav:"#contracts",insert:B("Farm 42 Ruwa","Miller Corp Harare",{x:16,y:62},{x:76,y:40},74),toast:"Live tracking opened — truck moving at 72 km/h"}});S("f-sched-883",{track:{nav:"#contracts",insert:B("Farm 12 Marondera","Miller Corp Harare",{x:20,y:66},{x:78,y:36},46),toast:"Live tracking opened — ETA 2 hours"}});S("f-fin-882",{view:{nav:"#finance",insert:z({ref:"#882",amount:"$4,200",terms:"NET_3",due:"Aug 2, 2026",status:"Scheduled",lines:[{l:"Maize 20t @ $210/t",v:"$4,200"},{l:"Seed loan deduction",v:"-$400"},{l:"Payout due to you",v:"$3,800"}]}),toast:"Invoice #882 opened"}});S("f-fin-883",{view:{nav:"#finance",insert:z({ref:"#883",amount:"$3,600",terms:"NET_3",due:"Aug 5, 2026",status:"Scheduled",lines:[{l:"Soya 10t @ $360/t",v:"$3,600"},{l:"Payout due to you",v:"$3,600"}]}),toast:"Invoice #883 opened"}});S("f-soya-list",{pause:{to:"PAUSED",tone:"gray",toast:"Listing paused",foot:r("Resume","ghost sm","Listing resumed",void 0,"f-soya-list","resume")},resume:{to:"ACTIVE",tone:"green",toast:"Listing reactivated",foot:r("Edit","ghost sm","Editing listing","#sell")+r("Pause","ghost sm","Listing paused",void 0,"f-soya-list","pause")}});S("f-soya-new",{withdraw:{done:"Withdrawn",toast:"Listing withdrawn"}});S("f-wheat",{accept:{to:"ACCEPTED",tone:"green",toast:"Counter-offer accepted — contract issued",meta:"Contract issued at <b>$370/t</b> · ZVIDA will arrange pickup.",foot:r("View Contract","outline sm","Opening contract","#contracts")},counter:{to:"COUNTER SENT",tone:"blue",toast:"Counter-offer sent to ZVIDA",meta:"Your counter: <b>$380/t</b> · Awaiting ZVIDA reply.",foot:y("Awaiting ZVIDA reply","blue")},decline:{to:"DECLINED",tone:"red",toast:"Counter-offer declined",meta:"Listing closed — you declined ZVIDA’s offer.",foot:r("Re-list","outline sm","Opening listing form","#sell")}});const j=[];let f=null,$={qty:"10",reserve:"450"};v.editListing=(t,l)=>{f={kind:"soya"},window.location.hash="#today",window.location.hash="#sell",m("Listing loaded into the form — update and save","info")};v.cancelEdit=t=>{f=null;const l=window.location.hash;window.location.hash="#today",window.location.hash=l||`#${t||"sell"}`,m("Edit cancelled","info")};v.callDriver=t=>{m(`Dialing ${t} — placing the call from your phone`,"info")};v.submitListing=()=>{if(f){const t=document.querySelectorAll(".dsh-input");$.qty=(t[0]?.value||$.qty).trim()||$.qty,$.reserve=(t[2]?.value||$.reserve).trim()||$.reserve,f=null,window.location.hash="#today",window.location.hash="#sell",m("Listing updated");return}j.unshift({title:"Maize · 20t · Reserve $200/t",thumb:"grain",badge:"PENDING APPROVAL",badgeTone:"amber",meta:"Submitted just now · Awaiting ZVIDA approval.",foot:`${r("Withdraw","danger sm","Listing withdrawn",void 0,"f-soya-new","withdraw")}`}),m("Listing submitted for approval"),window.location.hash="#sell"};v.dlAll=()=>{["inv-882","rcpt-882","inv-880","rcpt-880","cert-882","wb-882"].forEach(t=>_(t)),m("Downloaded 6 documents")};v.diaryAdd=()=>{const t=document.querySelector(".dsh-timeline");t&&t.insertAdjacentHTML("afterbegin",'<div class="dsh-tl-item"><div class="dsh-tl-title">Manual diary entry</div><div class="dsh-tl-sub">Added just now</div><div class="dsh-tl-tag">Note</div></div>'),m("Diary entry added")};v.equipAdd=()=>{const t=document.querySelector("[data-eq-list]");t&&t.insertAdjacentHTML("beforeend",n(e.truck,"Knapsack Sprayer","Just added · Operational","Ready")),m("Equipment added")};v.voiceRecord=()=>{const t=document.querySelector('[data-js="voiceRecord"]');t&&(t.classList.contains("dsh-rec")?(t.classList.remove("dsh-rec"),t.textContent="Record",m("Voice note saved and sent to ZVIDA")):(t.classList.add("dsh-rec"),t.textContent="Stop & Send",m("Recording… tap Stop & Send when done")))};v.voicePlay=()=>{m("Playing latest voice note · 0:42","info")};v.submitTicket=()=>{const t=document.querySelector('[data-js="submitTicket"]');t&&(t.textContent="Submitted",t.disabled=!0),m("Ticket #T-104 submitted — we reply within 24h")};v.openGallery=t=>{const l={rice:"Premium Rice 25kg",samp:"Maize Meal Samp",flour:"Flour 10kg",bran:"Wheat Bran",soyaMeal:"Soya Meal",popcorn:"Popcorn",beans:"Navy Beans",groundnuts:"Groundnuts"};document.querySelector(".dsh-lightbox")?.remove();const o=document.createElement("div");o.className="dsh-lightbox",o.innerHTML=`<div class="dsh-lightbox-back" data-close></div>
    <div class="dsh-lightbox-card">
      <div class="dsh-lightbox-img">${b(t,"lg")}</div>
      <div class="dsh-lightbox-title">${l[t]||"Product"}</div>
      <div class="dsh-lightbox-sub">Browse more products in the input store below.</div>
      <button class="dsh-btn primary" data-close>Close</button>
    </div>`,document.body.appendChild(o),o.addEventListener("click",h=>{h.target.closest("[data-close]")&&o.remove()})};function x(t){const l=k=>k.replace(/[()\\]/g,""),o=t.map(k=>`BT /F1 11 Tf 72 ${720-t.indexOf(k)*16} Td (${l(k)}) Tj ET`).join(`
`),h=[],A=[];let d=0;const g=k=>{h.push(k),A.push(d),d+=k.length};return g(`%PDF-1.4
`),g(`1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
`),g(`2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
`),g(`3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
`),g(`4 0 obj<</Length ${o.length}>>stream
${o}
endstream
endobj
`),g(`5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
`),g(`xref
0 6
0000000000 65535 f 
`),A.slice(1).forEach(k=>g(String(k).padStart(10,"0")+` 00000 n 
`)),g(`trailer<</Size 6/Root 1 0 R>>
startxref
${d}
%%EOF`),h.join("")}I("inv-882","Invoice_882.pdf",x(["ZVIDAMBANO INVOICE #882","","Contract #882 - 20 tons Maize (COD)","Rate: $210/t","Amount: $4,200","Seed loan deduction: -$400","Payout due: $3,800","Terms: NET_3 - due Aug 2, 2026"]),"application/pdf");I("rcpt-882","Receipt_882.pdf",x(["ZVIDAMBANO RECEIPT #882","","Contract #882 - $4,200","Status: Received Jul 31, 2026"]),"application/pdf");I("inv-880","Invoice_880.pdf",x(["ZVIDAMBANO INVOICE #880","","Contract #880 - 20 tons Maize","Amount: $4,000","Terms: NET_3","Status: Paid"]),"application/pdf");I("rcpt-880","Receipt_880.pdf",x(["ZVIDAMBANO RECEIPT #880","","Contract #880 - $4,000","Status: Received Jul 15, 2026"]),"application/pdf");I("cert-882","Weighbridge_Certificate_882.pdf",x(["WEIGHBRIDGE CERTIFICATE #882","","Gross: 30,000 kg","Tare: 10,000 kg","Net: 20,000 kg","Station: Ruwa Weighbridge"]),"application/pdf");I("wb-882","Gross_Weight_882.jpg","Weighbridge capture - gross 30,000 kg","image/jpeg");const u={today:{id:"today",label:"Today",icon:e.dashboard,title:"Today",sub:"James, Farm 42 Ruwa",render:()=>`
      ${le({kick:"Friday, 31 July 2026",title:"Good morning, James",sub:"Your maize load arrives at 08:00. Track deliveries, release payments and manage your silo — all in one place.",actions:`${r("List Produce","onlight","Opening new listing form","#sell")}${r("Contact ZVIDA","onlight","Opening chat with ZVIDA","#messages")}`,bg:"dash/hero-farm.jpg",stats:[{l:"Silo balance",v:"30 t"},{l:"Active contracts",v:"3"},{l:"Next payout",v:"$4,200"}]})}
      ${de([{label:"New Listing",icon:e.sell,toast:"Opening new listing form",href:"#sell"},{label:"Voice Note",icon:e.mic,toast:"Opening voice notes",href:"#messages"},{label:"Track Truck",icon:e.route,toast:"Opening live truck tracking",href:"#contracts"},{label:"Call ZVIDA",icon:e.phone,toast:"Opening chat with ZVIDA",href:"#messages"}])}
      ${E([{label:"Active Contracts",value:3,icon:e.contracts,delta:"1 new this week",up:!0,spark:[2,3,3,4,3,4,3],foot:"Across this season",open:"#contracts"},{label:"Silo Balance",value:30,icon:e.box,delta:"20t committed",up:!0,spark:[20,30,28,34,30,32,30],foot:"50t total capacity",open:"#sell"},{label:"Next Payout",value:"$4,200",icon:e.finance,delta:"NET_3 · in 2 days",up:!0,spark:[10,18,15,22,30,26,42],foot:"Contract #882",open:"#finance"},{label:"On-time Rate",value:100,icon:e.shield,delta:"Across 12 deals",up:!0,spark:[90,95,92,96,98,97,100],foot:"% of deliveries",open:"#perf"}])}
      ${ce([{name:"Maize",price:"$295/t",old:"$310/t"},{name:"Soya",price:"$520/t",old:"$505/t"},{name:"Wheat",price:"$360/t"},{name:"Ground Nuts",price:"$2.30/kg"},{name:"Sugar Beans",price:"$680/t"},{name:"Rice",price:"$780/t"},{name:"Sorghum",price:"$340/t"}])}
      ${T(`
        ${a("Today’s Schedule","View all","Opening full schedule",void 0,"#contracts")}
        ${w({time:"08:00 AM",thumb:"grain",title:"Truck ABC-123 arrives at your farm",badge:"LOADING",badgeTone:"blue",open:"#contracts",key:"c882",meta:`Driver: <b>John Doe</b> (+263 77 123 4567) · Truck ABC-123 (Scania R450) · Trailer XYZ-789 (Grain Tipper, 35t)<br/>Contract #882 · 20 tons Maize · ${y("50% paid (Loading)","green")} ${y("50% pending (Offloading)","amber")}`,foot:`${p("Call Driver","ghost sm","callDriver","John Doe +263 77 123 4567","Dialing John Doe…")}${r("Start Loading","primary sm","Loading started — ZVIDA notified",void 0,"f-sched-882","start")}`})}
        ${w({time:"10:30 AM",thumb:"soya",title:"Loading Soya at Farm 12 · ETA 2 hours",badge:"LOADING",badgeTone:"blue",open:"#contracts",key:"c883",meta:"Driver: <b>Sarah Moyo</b> (+263 78 987 6543) · Truck DEF-456<br/>Contract #883 · 10 tons Soya",foot:r("Track Live","primary sm","Opening live tracking",void 0,"f-sched-883","track")})}
        ${w({time:"02:00 PM",thumb:"wheat",title:"Payout for Contract #882 ($4,200) scheduled",badge:"SCHEDULED",badgeTone:"green",open:"#finance",meta:"NET_3 · Funds release automatically when the countdown completes.",foot:r("View Invoice","outline sm","Opening invoice",void 0,"f-fin-882","view")})}
        ${a("Late Payment Radar")}
        ${s("ok","No overdue payments. All funds on schedule.","View history","Opening payment history","#finance")}
      `,`
        ${i({title:"Silo Status",icon:e.box,sub:"Maize · 2026 harvest",body:`
            <div style="display:flex;align-items:center;gap:18px">
              ${N(60,"30 t",84)}
              <div style="flex:1;min-width:0">
                <div style="font-size:13.5px;font-weight:700">30 of 50 tons remaining</div>
                <div style="font-size:12px;color:var(--dsh-text-3);margin:4px 0 12px">20 tons committed against active contracts.</div>
                ${O(3,5,"Committed capacity")}
              </div>
            </div>`,link:"Manage silo",linkToast:"Opening silo management",linkHref:"#sell"})}
        ${i({title:"Field Watch",icon:e.cloud,body:`
            ${s("info","Rain forecast for Mashonaland East tomorrow. Keep harvest tarps ready.")}
            <div style="font-size:12px;color:var(--dsh-text-3)">Updated 06:00 AM · Weather by MetZim</div>`})}
        ${i({title:"Quick Support",icon:e.messages,body:`
            ${n(e.finance,"When will I get paid?","NET_3 or NET_7 after delivery confirmation","","plain",!1,"#finance")}
            ${n(e.route,"Track a delivery","Open Today → Track Truck","","plain",!1,"#contracts")}
            ${n(e.sell,"List produce fast","Go to Sell → Create New Listing","","plain",!1,"#sell")}`})}
      `)}
    `},sell:{id:"sell",label:"Sell",icon:e.sell,title:"Sell",sub:"Virtual silo & listings",render:()=>`
      ${a("My Stock (Virtual Silo)")}
      ${i({body:`
          <div style="display:flex;align-items:center;gap:26px;flex-wrap:wrap">
            ${N(60,"30 t",88)}
            <div style="flex:1;min-width:240px">
              <div style="font-size:15px;font-weight:750;letter-spacing:-0.01em;margin-bottom:4px">Maize — 30 tons remaining</div>
              <div style="font-size:13px;color:var(--dsh-text-2);margin-bottom:12px">50t total − 20t sold. You have 30 tons available to list.</div>
              ${O(3,5,"Committed against active contracts")}
            </div>
            ${y("List now","green")}
          </div>`})}
      ${T(`
        ${a("Create New Listing")}
        ${i({title:"New listing",icon:e.plus,body:`
            ${c("Commodity",R(["Maize","Soya","Wheat","Groundnuts","Livestock"],f?1:0))}
            <div class="dsh-field-grid">
              ${c("Quantity (tons)",C(f?$.qty:"20.0"))}
              ${c("Grade",R(["Grade A","Grade B","Grade C"]))}
            </div>
            <div class="dsh-field-grid">
              ${c("Moisture %",C("14.5"))}
              ${c("Reserve Price ($/t)",C(f?$.reserve:"200.00"))}
            </div>
            ${f?s("ok","Editing your <b>Soya</b> listing — update and save."):s("info","ZVIDA is currently offering <b>$295/t</b> for Maize.")}
            ${c("Collection type",`
              <div class="dsh-radio-row">
                <label class="dsh-radio"><input type="radio" name="collection" checked /> COD — I deliver to ZVIDA</label>
                <label class="dsh-radio"><input type="radio" name="collection" /> COC — ZVIDA collects from farm</label>
              </div>`)}
            <div class="dsh-btn-row" style="justify-content:space-between">
              ${V("Upload photo","ghost sm","image/*")}
              <span>
                ${f?p("Cancel","ghost","cancelEdit","sell","Edit cancelled"):""}
                ${p(f?"Save Changes":"Submit Listing","primary","submitListing","",f?"Listing updated":"Listing submitted for approval")}
              </span>
            </div>`})}
      `,`
        ${a("My Active Listings")}
        ${j.map(t=>w({title:t.title,thumb:t.thumb,badge:t.badge,badgeTone:t.badgeTone,time:t.meta,open:"#sell",foot:t.foot})).join("")}
        ${w({key:"soya",title:`Soya · ${$.qty}t · Reserve $${$.reserve}/t`,thumb:"soya",badge:"ACTIVE",badgeTone:"green",open:"#sell",meta:"Hidden from your marketplace view.",foot:`${p("Edit","ghost sm","editListing","soya","Listing loaded into the form")}${r("Pause","ghost sm","Listing paused",void 0,"f-soya-list","pause")}`})}
        ${w({title:"Wheat · 15t · Reserve $380/t",thumb:"wheat",badge:"COUNTER-OFFER",badgeTone:"amber",open:"#sell",meta:"ZVIDA counter-offer: <b>$370/t</b>",foot:`${r("Accept","success sm","Counter-offer accepted",void 0,"f-wheat","accept")}${r("Counter","outline sm","Sending counter-offer",void 0,"f-wheat","counter")}${r("Decline","danger sm","Counter-offer declined",void 0,"f-wheat","decline")}`})}
      `)}
    `},shop:{id:"shop",label:"Shop",icon:e.shop,title:"Shop",sub:"Buy inputs from verified sellers",render:()=>`
      ${a("Popular This Week")}
      <div class="dsh-gallery">
        <div data-gallery-key="rice">${b("rice","lg")}</div>
        <div data-gallery-key="samp">${b("samp","lg")}</div>
        <div data-gallery-key="flour">${b("flour","lg")}</div>
        <div data-gallery-key="bran">${b("bran","lg")}</div>
        <div data-gallery-key="soyaMeal">${b("soyaMeal","lg")}</div>
        <div data-gallery-key="popcorn">${b("popcorn","lg")}</div>
        <div data-gallery-key="beans">${b("beans","lg")}</div>
        <div data-gallery-key="groundnuts">${b("groundnuts","lg")}</div>
      </div>
      ${a("Input Store",P()>0?`Cart (${P()})`:"Cart","Opening cart",void 0,"#cart")}
      ${c("Search",'<input class="dsh-input dsh-search2" data-mkt-search placeholder="Search inputs, sellers, categories…" />')}
      ${L(["All","Fertilizer","Seeds","Chemicals","Stockfeed","Livestock","Equipment"],0,"shop")}
      <div class="dsh-shop-grid">
        ${se().map(t=>J(t,"shop")).join("")}
      </div>
      <div style="font-size:12px;color:var(--dsh-text-3);margin-top:18px">ZVIDA-verified sellers only. Your own grain listings are hidden here — manage them under Sell.</div>
    `},cart:{id:"cart",label:"Cart",icon:e.shop,title:"Cart",sub:"Inputs for your farm",hidden:!0,render:()=>{const t=oe(),l=t.length===0?`${i({title:"Your cart is empty",icon:e.shop,body:s("info","Add inputs from the shop — they will appear here.","Continue shopping","Opening the input store","#shop")})}`:t.map(A=>re(A)).join(""),o=M(),h=o+12;return`
      ${E([{label:"Items",value:P(),icon:e.shop,delta:"Verified sellers only",up:!0,spark:[1,2,2,3,2,3,3],foot:"Across 3 stores",open:"#shop"},{label:"Subtotal",value:D(o),icon:e.wallet,delta:"Input costs",up:!0,spark:[20,30,40,60,80,100,120],foot:"Before delivery",open:"#checkout"},{label:"Available Credit",value:"$50,000",icon:e.finance,delta:"Line of credit",up:!0,spark:[40,40,42,42,44,44,50],foot:"Against warehouse receipts",open:"#finance"}])}
      ${T(`
        ${a("Cart Items")}
        ${i({body:l,pad:"4px 20px 10px"})}
        ${a("Frequently Bought Together")}
        <div class="dsh-shop-grid">
          ${ne().map(A=>J(A,"rec")).join("")}
        </div>
      `,`
        ${i({title:"Order Summary",icon:e.wallet,body:`
            ${Z([{label:"Subtotal",value:D(o)},{label:"Delivery",value:"$12.00"},{label:"Total",value:D(h)}])}
            ${s("ok","Delivery to Farm 42, Ruwa by <b>Saturday</b>. ZVIDA-backed sellers only.")}
            <div class="dsh-btn-row full">${r("Proceed to Checkout","primary","Opening checkout","#checkout")}</div>`})}
      `)}
    `}},checkout:{id:"checkout",label:"Checkout",icon:e.wallet,title:"Checkout",sub:"Delivery & payment",hidden:!0,render:()=>`
      <div class="dsh-checkout">
      ${a("Delivery Address")}
      ${i({body:`
          <div class="dsh-field-grid">
            ${c("Full name",C("James"))}
            ${c("Phone",C("+263 77 555 0011"))}
          </div>
          <div class="dsh-field-grid">
            ${c("Street / Farm",C("Farm 42, Ruwa"))}
            ${c("City / Province",C("Harare"))}
          </div>`})}
      ${a("Delivery Speed")}
      ${i({body:`
          ${L([{label:"Standard — Free (Sat)",value:"Standard"},{label:"Express — +$8.00 (Tomorrow)",value:"Express"}],0,"delivery")}
          <div data-filter-group="delivery" data-filter-value="Standard">
            ${s("info","Free delivery · Arrives <b>Saturday, 08:00–12:00</b>.")}
          </div>
          <div data-filter-group="delivery" data-filter-value="Express" style="display:none">
            ${s("warn","+$8.00 · Arrives <b>tomorrow by 14:00</b>. Courier tracked.")}
          </div>`})}
      ${T(`
        ${a("Payment Method")}
        ${i({body:`
            ${L(["ZVIDA Wallet (Balance $8,940)","Input Loan Credit","EcoCash"],0,"pay")}
            <div data-filter-group="pay" data-filter-value="ZVIDA Wallet (Balance $8,940)">
              ${s("ok","Paid instantly from your wallet. No extra fees.")}
            </div>
            <div data-filter-group="pay" data-filter-value="Input Loan Credit" style="display:none">
              ${s("warn","Borrowed against warehouse receipts at 2.5% flat. Auto-deducted at payout.")}
            </div>
            <div data-filter-group="pay" data-filter-value="EcoCash" style="display:none">
              ${s("info","You will receive an EcoCash payment request after the order is confirmed.")}
            </div>
            ${c("Delivery notes",C(void 0,"e.g. Leave at the silo gate"))}`})}
      `,`
        ${a("Summary")}
        ${i({body:`
            ${Z([{label:"Subtotal",value:D(M())},{label:"Delivery",value:"$12.00"},{label:"Total",value:D(M()+12)}])}
            <div class="dsh-btn-row full">${p("Confirm & Place Order","primary","marketPlace","","Order placed — seller notified")}</div>`})}
      `)}
      </div>
    `},"order-confirmed":{id:"order-confirmed",label:"Order Confirmed",icon:e.check,title:"Order Confirmed",sub:"Thank you",hidden:!0,render:()=>{const t=ae();return`
      ${s("ok",`${t?t.ref:"Your order"} was placed. The sellers have been notified and will confirm shortly.`)}
      ${i({title:t?`Reference ${t.ref}`:"Reference #C-2210",icon:e.check,body:`
          ${t?ie(t):""}
          <div style="display:flex;align-items:center;gap:18px;margin-top:10px">
            ${b(t?.items[0]?.thumb||"fert","md")}
            <div style="flex:1;min-width:0">
              <div style="font-size:13.5px;font-weight:700">${t?t.address:"Delivery to Farm 42, Ruwa by Saturday"}</div>
              <div style="font-size:12px;color:var(--dsh-text-3);margin:4px 0 12px">Track your order status anytime from this page.</div>
              ${O(1,4,"Confirmed → Packed → Shipped → Delivered")}
            </div>
          </div>`})}
      <div class="dsh-btn-row">
        ${r("Track Order","outline sm","Opening your orders","#orders")}
        ${r("Back to Shop","primary","Opening the input store","#shop")}
      </div>
    `}},orders:{id:"orders",label:"Orders",icon:e.orders,title:"My Orders",sub:"Track and reorder",render:()=>{const t=X().filter(o=>o.buyer.startsWith("James")||o.buyer==="James (Farmer)"),l=t.filter(o=>!["DELIVERED","CANCELLED","ESCALATED"].includes(o.status)).length;return`
      ${s("info",`${l} active ${l===1?"order":"orders"} in progress. Sellers confirm within 24 hours.`,"Go shopping","Opening the input store","#shop")}
      ${a("Your Orders","Shop more","Opening the input store",t.length,"#shop")}
      ${L(["All","Active","Pending","Loading","Offloading","Complete"],0,"orders")}
      ${t.length===0?i({title:"No orders yet",icon:e.orders,body:s("info","When you place an order it will appear here.","Browse the shop","Opening the input store","#shop")}):""}
      ${t.map(o=>ee(o,"buyer","orders",te(o.status))).join("")}
    `}},contracts:{id:"contracts",label:"Contracts",icon:e.contracts,title:"Contracts",sub:"Live loads & payments",render:()=>{const t=Q().filter(d=>d.supplier.startsWith("James")),l=t.filter(d=>!["PAID","CANCELLED"].includes(d.status)),o=t.filter(d=>d.status==="PENDING_PAYMENT"),h=t.filter(d=>d.status==="PAID"),A=o.reduce((d,g)=>d+g.amount,0);return`
      ${E([{label:"Active Loads",value:l.length,icon:e.truck,delta:"In motion",up:!0,spark:[1,2,2,1,2,3,Math.max(l.length,1)],foot:"Your consignments",open:"#contracts"},{label:"Awaiting ZVIDA Payment",value:o.length,icon:e.wallet,delta:`${D(A)} held in escrow`,up:!1,spark:[0,1,0,1,1,2,Math.max(o.length,1)],foot:"Releases on terms",open:"#contracts"},{label:"Settled",value:h.length,icon:e.check,delta:"Paid to your wallet",up:!0,spark:[1,1,2,2,3,3,Math.max(h.length,1)],foot:"Completed loads",open:"#contracts"}])}
      ${s("info","Record the first weighbridge weight (or the scale bucket count) to push the load forward. ZVIDA pays into your wallet after delivery — COD, COC or NET terms.")}
      ${a("My Consignments","Settled history","Opening settled loads",h.length,"#contracts")}
      ${l.length?l.map(d=>K(d,"supplier")).join(""):s("ok","No open consignments — check back after harvest.")}
      ${a("Completed Deals")}
      ${i({body:F(["Contract","Commodity","Amount","Paid"],[["#880","Maize","$4,000","Jul 15, 2026"],["#879","Soya","$3,600","Jul 12, 2026"],["#878","Maize","$2,450","Jul 10, 2026"]],[2],["#finance","#finance","#finance"]),flush:!0})}
    `}},finance:{id:"finance",label:"Finance",icon:e.finance,title:"Finance",sub:"Payouts & transactions",render:()=>`
      ${E([{label:"Balance (USD)",value:"$8,940",icon:e.wallet,delta:"Updated today",up:!0,spark:[20,28,26,34,40,38,44],foot:"Wallet balance",open:"#perf"},{label:"Next Payout",value:"$4,200",icon:e.clock,delta:"NET_3 · in 2 days",up:!0,spark:[10,14,12,18,24,22,28],foot:"Contract #882",open:"#contracts"},{label:"Seed Loan",value:"$400",icon:e.reports,delta:"Auto-deducted",up:!1,spark:[10,10,10,10,10,10,10],foot:"Due at payout",open:"#finance"},{label:"Total Earned",value:"$12,580",icon:e.trendingUp,delta:"Since January",up:!0,spark:[20,30,28,40,52,60,66],foot:"This season",open:"#perf"}])}
      ${T(`
        ${a("Upcoming Payments")}
        ${w({title:"Contract #882 — $4,200",thumb:"grain",badge:"Paid in 2 days · NET_3",badgeTone:"green",key:"c882",meta:"Countdown: <b>2d 04h 12m</b> until automatic release.",foot:r("View Invoice","outline sm","Opening invoice #882",void 0,"f-fin-882","view")})}
        ${w({title:"Contract #883 — $3,600",thumb:"soya",badge:"Paid in 5 days · NET_3",badgeTone:"green",key:"c883",meta:"Countdown: <b>5d 04h 12m</b> until automatic release.",foot:r("View Invoice","outline sm","Opening invoice #883",void 0,"f-fin-883","view")})}
        ${a("Upcoming Deductions")}
        ${w({title:"Seed Loan — $400",badge:"Auto-applied",badgeTone:"amber",meta:"Deducted from Contract #882. You will receive <b>$3,800</b>.",foot:r("View Invoice","ghost sm","Opening invoice #882",void 0,"f-fin-882","view")})}
        ${a("Transaction History")}
        ${i({body:`
            ${n(e.check,"Contract #880","Jul 15, 2026 · Received","+$4,000","pos",!1,"#contracts")}
            ${n(e.check,"Contract #879","Jul 12, 2026 · Received","+$3,600","pos",!1,"#contracts")}
            ${n(e.check,"Contract #878","Jul 10, 2026 · Received","+$2,450","pos",!1,"#contracts")}
            ${n(e.check,"Contract #877","Jul 05, 2026 · Received","+$1,540","pos",!1,"#contracts")}
            ${n(e.check,"Contract #876","Jul 01, 2026 · Received","+$990","pos",!1,"#contracts")}`})}
      `,`
        ${a("Your Documents")}
        ${U([{name:"Invoice_882.pdf",meta:"Contract #882 · $4,200",dl:"inv-882"},{name:"Receipt_882.pdf",meta:"Contract #882 · $4,200 received",dl:"rcpt-882"},{name:"Weighbridge_882.pdf",meta:"Contract #882 · gross/tare/net",dl:"cert-882"},{name:"Invoice_880.pdf",meta:"Contract #880 · $4,000",dl:"inv-880"},{name:"Receipt_880.pdf",meta:"Contract #880 · $4,000 received",dl:"rcpt-880"}])}
        ${p("Download All Documents","primary","dlAll","","Downloaded all documents")}
      `)}
    `},perf:{id:"perf",label:"Performance",icon:e.shield,title:"Performance",sub:"Reliability, ratings & delivery record",render:()=>`
      ${E([{label:"On-time Rate",value:100,icon:e.shield,delta:"Across 12 deals",up:!0,spark:[90,95,92,96,98,97,100],foot:"% of deliveries",open:"#perf"},{label:"ZVIDA Score",value:92,icon:e.spark,delta:"Top 10% of suppliers",up:!0,spark:[80,84,82,88,90,88,92],foot:"Out of 100",open:"#perf"},{label:"Dispute-free Deals",value:12,icon:e.check,delta:"No open disputes",up:!0,spark:[8,9,10,10,11,11,12],foot:"Out of 12 deals",open:"#perf"},{label:"Avg Buyer Rating",value:"4.9",icon:e.quality,delta:"2 buyer ratings",up:!0,spark:[10,20,30,40,42,46,49],foot:"Out of 5.0",open:"#perf"}])}
      ${T(`
        ${a("Delivery Track Record")}
        ${i({body:F(["Contract","Commodity","Qty","On-time","Rating"],[["#882","Maize","20t",y("Yes","green"),"—"],["#880","Maize","18.2t",y("Yes","green"),"5.0"],["#879","Soya","9.8t",y("Yes","green"),"4.8"],["#878","Maize","20t",y("Yes","green"),"5.0"],["#877","Ground Nuts","4t",y("Yes","green"),"—"]]),flush:!0})}
        ${a("Reliability Breakdown")}
        ${i({body:H([{label:"On-time loading",pct:100},{label:"Moisture consistency",pct:92},{label:"Documentation accuracy",pct:96},{label:"Quality vs spec",pct:95}])})}
      `,`
        ${i({title:"ZVIDA Score",icon:e.spark,body:`
            <div style="display:flex;align-items:center;gap:18px">
              ${N(92,"92",84)}
              <div style="flex:1;min-width:0">
                <div style="font-size:13.5px;font-weight:700">Top 10% of suppliers</div>
                <div style="font-size:12px;color:var(--dsh-text-3);margin:4px 0 12px">Score unlocks priority matching and faster NET_3 payouts.</div>
                ${O(5,5,"Tier 2 · 5 of 5")}
              </div>
            </div>`})}
        ${i({title:"Buyer Ratings",icon:e.quality,body:`
            ${n(e.quality,"Miller Corp","12 loads · Always on time","5.0","pos")}
            ${n(e.quality,"GrainCorp","8 loads · Great moisture","4.8","pos")}`})}
      `)}
    `},farm:{id:"farm",label:"Farm",icon:e.farm,title:"Farm",sub:"Profile, diary & equipment",render:()=>`
      ${i({title:"Farm profile",icon:e.farm,body:W([{k:"Farm",v:`James’s Farm, Ruwa, Zimbabwe ${y("Verified · Tier 2","green")}`},{k:"GPS",v:"-17.883, 31.033"},{k:"Total acreage",v:"20 hectares"},{k:"Member since",v:"January 2024"}])})}
      ${T(`
        ${a("Crop Diary")}
        ${i({body:Y([{title:"Planted SC403 Maize (Field A)",sub:"Jul 10, 2026 · 5 ha"},{title:"Sprayed Insecticide (Field B)",sub:"Jul 05, 2026"},{title:"Applied Urea Fertilizer (Field A)",sub:"Jun 28, 2026"},{title:"Planted Soya (Field C)",sub:"Jun 15, 2026 · 3 ha"}])})}
        ${p("Add Entry","outline sm","diaryAdd","","Diary entry added")}
      `,`
        ${a("Equipment")}
        ${i({body:`
            <div data-eq-list>
            ${n(e.truck,"Tractor (Case IH)","Maintenance due in 50 hours","In use")}
            ${n(e.truck,"Trailer","Operational","Ready")}
            ${n(e.truck,"Harrow","Needs repair","Attention","neg")}
            </div>`})}
        ${p("Add Equipment","outline sm","equipAdd","","Equipment added")}
      `)}
    `},messages:{id:"messages",label:"Messages",icon:e.messages,title:"Messages",sub:"Chat & support",render:()=>`
      ${G({name:"Contract #882 · Maize",preview:"Truck #12 arrives 08:00",time:"Today"},[{sent:!1,text:"ZVIDA: Truck #12 will arrive at 08:00 AM tomorrow.",time:"07:45 AM"},{sent:!0,text:"You: Ok, I will be ready.",time:"07:50 AM"},{sent:!1,text:"ZVIDA: Great. Don’t forget the moisture reading before loading.",time:"07:52 AM"}],["Where is my truck?","Payment status?","Upload weighbridge photo"])}
      ${a("Voice Notes")}
      ${i({title:"Send a voice note",icon:e.mic,body:`
          ${s("info","Tap record, speak, and send — ZVIDA transcribes it and files it against your contract.")}
          <div class="dsh-btn-row">
            ${p("Record","primary","voiceRecord","","Recording started")}${p("Play Latest","ghost sm","voicePlay","","Playing your latest voice note")}
          </div>
          ${n(e.mic,"Grain moisture update — today 09:15 AM","Filed against Contract #882","0:42","plain",!1,"#messages")}
          ${n(e.mic,"Silo capacity note — yesterday","Filed against Contract #881","0:31","plain",!1,"#messages")}`})}
      ${a("Support — FAQ & Tickets")}
      ${i({title:"Support",icon:e.messages,body:`
          ${n(e.leaf,"How do I list my produce?","Go to Sell → Create New Listing","","plain",!1,"#sell")}
          ${n(e.finance,"When will I get paid?","NET_3 or NET_7 after delivery confirmation","","plain",!1,"#finance")}
          ${n(e.route,"How do I track my delivery?","Open Today → Track Truck","","plain",!1,"#contracts")}
          <div class="dsh-field-grid" style="margin-top:16px">
            ${c("Subject",C(void 0,"What is the issue?"))}
            ${c("Priority",R(["Low","Medium","High","Urgent"]))}
          </div>
          ${c("Message",ue(3,"Describe your problem…"))}
          <div class="dsh-btn-row">${V("Attach screenshot","ghost sm","image/*")}${p("Submit Ticket","primary","submitTicket","","Ticket #T-104 submitted — we reply within 24h")}</div>`})}
    `}};q({name:"James",roleLabel:"Farmer",company:"James’s Farm",initials:"J",accent:"#059669",accentHover:"#047857",accentLight:"#ecfdf5",accentRgb:"5, 150, 105",gradientEnd:"#10b981",pages:[u.today,u.sell,u.shop,u.orders,u.cart,u.checkout,u["order-confirmed"],u.contracts,u.finance,u.perf,u.farm,u.messages]});
