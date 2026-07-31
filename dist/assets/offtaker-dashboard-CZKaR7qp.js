import"./styles-B_rwOSkn.js";import{J as M,t as w,g as i,d as F,r as Z,w as g,u as s,E as P,b as Q,I as e,G,k,h as f,p as a,a0 as A,S as T,l as c,s as o,M as I,N as O,a as p,F as v,j as h,v as b,A as j,x as J,P as $,y as W,i as l,H as L,n as m,K as H,m as Y,c as D,e as _,f as U,Q as K,R as X,z as E,T as V,U as ee,W as R,V as te,Z as ae,Y as ie,B as oe,C as re}from"./core-DJvTQki7.js";const z=[];let n=null,S={qty:"10",price:"150"},x={qty:"8",price:"120"};M.callDriver=t=>{w(`Dialing ${t} — placing the call from your phone`,"info")};M.editOffListing=(t,r)=>{n={kind:r.closest("[data-key]")?.getAttribute("data-key")==="o-maize"?"maize":"bran"},window.location.hash="#today",window.location.hash="#sell",w("Listing loaded into the form — update and save","info")};M.cancelOffEdit=()=>{n=null;const t=window.location.hash;window.location.hash="#today",window.location.hash=t||"#sell",w("Edit cancelled","info")};M.submitOffListing=()=>{if(n){const t=document.querySelectorAll(".dsh-input"),r=n.kind==="maize"?x:S;r.qty=(t[0]?.value||r.qty).trim()||r.qty,r.price=(t[1]?.value||r.price).trim()||r.price,n=null,window.location.hash="#today",window.location.hash="#sell",w("Listing updated");return}z.unshift({title:"Maize Bran · 10t · $150/t",thumb:"bran",badge:"PENDING APPROVAL",badgeTone:"amber",meta:"Submitted just now · Awaiting ZVIDA approval.",foot:`${i("Withdraw","danger sm","Listing withdrawn",void 0,"o-sell-list","withdraw")}`}),w("Listing submitted for approval"),window.location.hash="#sell"};M.exportInventory=()=>{F("o-inv"),w("Inventory CSV exported")};Z("o-inv","Inventory_Jul31.csv",["Batch,Commodity,Volume,Received,Status","B-1042,Maize,320,Jul 18,Overstock","B-1041,Soya,85,Jul 16,Normal","B-1040,Wheat,140,Jul 14,Normal","B-1039,Maize,60,Jul 08,Low"].join(`
`),"text/csv");g("o-sell-list",{pause:{to:"PAUSED",tone:"gray",toast:"Listing paused",foot:i("Resume","ghost sm","Listing resumed",void 0,"o-sell-list","resume")},resume:{to:"ACTIVE",tone:"green",toast:"Listing reactivated",foot:i("Edit","ghost sm","Editing listing","#sell")+i("Pause","ghost sm","Listing paused",void 0,"o-sell-list","pause")},withdraw:{done:"Withdrawn",toast:"Listing withdrawn"}});g("o-rfq",{request:{done:"Requested",toast:"Contract requested — ZVIDA notified"},submit:{done:"Submitted",toast:"RFQ submitted — ZVIDA will match anonymously"}});g("o-list",{submit:{done:"Submitted",toast:"Listing submitted for approval"}});g("o-quality-882",{approve:{target:".js-q882",sel:".dsh-badge",to:"APPROVED",tone:"green",nav:"#quality",done:"Approved",toast:"Quality approved — ZVIDA notified",foot:i("View Invoice","primary sm","Opening invoice INV-2210",void 0,"o-pay-2210","view")},reject:{target:".js-q882",sel:".dsh-badge",to:"REJECTED",tone:"red",nav:"#quality",done:"Rejected",toast:"Dispute raised with ZVIDA",foot:s("Dispute filed with ZVIDA","amber")}});g("o-quality-881",{approve:{target:".js-q881",sel:".dsh-badge",to:"APPROVED",tone:"green",nav:"#quality",done:"Approved",toast:"Quality approved — ZVIDA notified"},reject:{target:".js-q881",sel:".dsh-badge",to:"REJECTED",tone:"red",nav:"#quality",done:"Rejected",toast:"Dispute raised with ZVIDA"}});g("o-pay-2210",{pay:{to:"PAID",tone:"green",nav:"#finance",toast:"Invoice INV-2210 paid — $4,800 settled",meta:"Amount: <b>$4,800</b> · Paid in full · Receipt issued",foot:i("View Receipt","outline sm","Opening receipt",void 0,"o-pay-2210","receipt")},view:{nav:"#finance",insert:P({ref:"INV-2210",amount:"$4,800",terms:"NET_3",due:"Jul 25, 2026",status:"Due",lines:[{l:"Maize 20t @ $240/t",v:"$4,800"},{l:"Load #882 · Net 20t",v:"20t"}]}),toast:"Invoice INV-2210 opened"},receipt:{insert:s("Receipt emailed to accounts","green"),toast:"Receipt sent"}});g("o-pay-2211",{pay:{to:"PAID",tone:"green",nav:"#finance",toast:"Invoice INV-2211 paid — $4,500 settled",meta:"Amount: <b>$4,500</b> · Paid in full · Receipt issued",foot:i("View Receipt","outline sm","Opening receipt",void 0,"o-pay-2211","receipt")},view:{nav:"#finance",insert:P({ref:"INV-2211",amount:"$4,500",terms:"NET_7",due:"Jul 28, 2026",status:"Due",lines:[{l:"Soya 10t @ $450/t",v:"$4,500"},{l:"Load #883 · Net 10t",v:"10t"}]}),toast:"Invoice INV-2211 opened"},receipt:{insert:s("Receipt emailed to accounts","green"),toast:"Receipt sent"}});const u={today:{id:"today",label:"Today",icon:e.dashboard,title:"Today",sub:"Miller Corporation",render:()=>`
      ${oe({kick:"Offtaker operations",title:"Good morning, Miller",sub:"Load #882 is offloading now and 2 inbound loads are on the way. Confirm quality and keep silos moving.",actions:`${i("Place RFQ","onlight","Opening RFQ form","#buy")}${i("Approve Quality","onlight","Opening quality queue","#quality")}`,bg:"dash/hero-silo.jpg",stats:[{l:"Inbound loads",v:"2"},{l:"Stock on hand",v:"605 t"},{l:"On-time intake",v:"98%"}]})}
      ${re([{label:"Place RFQ",icon:e.buy,badge:2,toast:"Opening RFQ form",href:"#buy"},{label:"Approve Quality",icon:e.quality,badge:3,toast:"Opening quality queue",href:"#quality"},{label:"Pay Invoice",icon:e.payments,badge:2,toast:"Opening outstanding invoices",href:"#finance"},{label:"Silo Status",icon:e.warehouse,toast:"Opening warehouse",href:"#warehouse"}])}
      ${k([{label:"Inbound Loads",value:2,icon:e.deliveries,delta:"1 offloading now",up:!0,spark:[2,3,2,4,3,2,2],foot:"Expected today",open:"#deliveries"},{label:"Stock On Hand",value:605,icon:e.warehouse,delta:"Maize 320t · Soya 85t",up:!0,spark:[30,40,38,45,50,48,52],foot:"tons across 3 silos",open:"#warehouse"},{label:"Outstanding",value:"$9,300",icon:e.finance,delta:"2 invoices due",up:!1,spark:[20,24,28,26,30,28,34],foot:"NET terms",open:"#finance"},{label:"On-time Intake",value:98,icon:e.shield,delta:"Across 38 loads",up:!0,spark:[92,95,96,95,97,98,98],foot:"% of loads",open:"#perf"}])}
      ${f(`
        ${o("Today’s Schedule","View all","Opening full schedule",void 0,"#deliveries")}
        ${b({time:"08:00 AM",thumb:"grain",title:"Truck ABC-123 arrives at your silo",badge:"OFFLOADING",badgeTone:"blue",open:"#deliveries",key:"o882",meta:"Commodity: Maize (20t) · Supplier: ZVIDA (anonymous)",foot:`${h("Confirm Offload","success sm","lgAction","lg2214:deliver","Offload confirmed — payment workflow started")}${h("Call Driver","ghost sm","callDriver","John Doe +263 77 123 4567","Dialing John Doe…")}`})}
        ${b({time:"10:30 AM",thumb:"soya",title:"Truck DEF-456 en route · ETA 2 hours",badge:"IN TRANSIT",badgeTone:"indigo",open:"#deliveries",key:"o883",meta:"Commodity: Soya (10t) · Supplier: ZVIDA (anonymous)",foot:h("Track Live","primary sm","lgAction","lg2218:note","Live tracking opened — ETA 2 hours")})}
        ${b({time:"02:00 PM",thumb:"wheat",title:"Quality report for Load #882 is ready",badge:"PENDING",badgeTone:"amber",open:"#quality",meta:"Commodity: Maize (20t) · Supplier: ZVIDA (anonymous)",foot:i("Review & Approve","primary sm","Opening quality report","#quality")})}
      `,`
        ${a({title:"Silo Snapshot",icon:e.warehouse,sub:"FIFO inventory",body:`
            <div style="display:flex;align-items:center;gap:18px">
              ${A(70,"605 t",84)}
              <div style="flex:1;min-width:0">
                <div style="font-size:13.5px;font-weight:700">605 of 850 tons used</div>
                <div style="font-size:12px;color:var(--dsh-text-3);margin:4px 0 12px">Maize 320t · Soya 85t · Wheat 140t · Other 60t</div>
                ${O([{label:"Silo 1 (Maize)",pct:82},{label:"Silo 2 (Soya)",pct:45},{label:"Silo 3 (Wheat)",pct:68}])}
              </div>
            </div>`,link:"Open warehouse",linkToast:"Opening warehouse page",linkHref:"#warehouse"})}
        ${a({title:"Quality Pipeline",icon:e.quality,body:`
            ${c(e.quality,"Load #882 · Maize","Lab report ready · Grade B","Pending","plain")}
            ${c(e.quality,"Load #881 · Soya","Approved · Grade A","Approved","plain",!0)}`})}
      `)}
    `},buy:{id:"buy",label:"Buy",icon:e.buy,title:"Buy",sub:"Commodities & RFQs",render:()=>`
      ${o("ZVIDA Listings","View all","Opening all listings",void 0,"#buy")}
      ${D(["All","Maize","Soya","Wheat","Sorghum","Sugar Beans"],0,"buy")}
      ${a({body:I(["","Commodity","Qty","Price","Origin","Grade",""],[[v("grain","xs"),"Maize","20t","$240/t","Ruwa","Grade A",i("Request Contract","primary sm","Contract requested — ZVIDA notified",void 0,"o-rfq","request")],[v("soya","xs"),"Soya","10t","$490/t","Marondera","Grade A",i("Request Contract","primary sm","Contract requested — ZVIDA notified",void 0,"o-rfq","request")],[v("wheat","xs"),"Wheat","15t","$420/t","Bindura","Grade B",i("Request Contract","primary sm","Contract requested — ZVIDA notified",void 0,"o-rfq","request")]],[],[],["Maize","Soya","Wheat"],"buy"),flush:!0})}
      ${f(`
        ${o("Place RFQ")}
        ${a({title:"New RFQ",icon:e.buy,body:`
            <div class="dsh-field-grid">
              ${l("Commodity",L(["Maize","Soya","Wheat","Sorghum","Sugar Beans"]))}
              ${l("Target qty",m("20.0","tons"))}
            </div>
            <div class="dsh-field-grid">
              ${l("Max price ($/t)",m("240.00"))}
              ${l("Delivery date",m("2026-07-30"))}
            </div>
            ${l("Delivery point",L(["Harare Silo","Bulawayo Hub","Mutare Warehouse"]))}
            ${l("Recurring",`
              <div class="dsh-radio-row">
                <label class="dsh-radio"><input type="checkbox" /> Weekly</label>
                <label class="dsh-radio"><input type="checkbox" /> Monthly</label>
                <label class="dsh-radio"><input type="checkbox" /> Quarterly</label>
              </div>`)}
            <div class="dsh-btn-row" style="margin-top:14px">${i("Submit RFQ","primary","RFQ submitted — ZVIDA will match anonymously",void 0,"o-rfq","submit")}</div>`})}
      `,`
        ${o("Open RFQs")}
        ${a({body:`
            ${c(e.buy,"RFQ-2203 · Maize 25t","Max $240/t · Harare Silo","Matching","plain",!0)}
            ${c(e.buy,"RFQ-2202 · Soya 15t","Max $500/t · Bulawayo Hub","Matching","plain",!0)}
            ${c(e.buy,"RFQ-2201 · Wheat 20t","Max $420/t · Mutare","Open","plain")}`})}
        ${a({title:"Buying Power",icon:e.wallet,body:p("info","Line of credit of <b>$50,000</b> available against verified warehouse receipts.")})}
      `)}
    `},shop:{id:"shop",label:"Shop",icon:e.shop,title:"Shop",sub:"Marketplace inputs for your mill",render:()=>`
      ${o("Input Store",R()>0?`Cart (${R()})`:"Cart","Opening cart",void 0,"#cart")}
      ${l("Search",'<input class="dsh-input dsh-search2" data-mkt-search placeholder="Search inputs, sellers, categories…" />')}
      ${D(["All","Fertilizer","Seeds","Chemicals","Stockfeed","Livestock","Equipment"],0,"shop")}
      <div class="dsh-shop-grid">
        ${ae().map(t=>ie(t,"shop")).join("")}
      </div>
      <div style="font-size:12px;color:var(--dsh-text-3);margin-top:18px">ZVIDA-verified sellers only. Bulk grain is bought through RFQs on the Buy page.</div>
    `},cart:{id:"cart",label:"Cart",icon:e.shop,title:"Cart",sub:"Marketplace basket",hidden:!0,render:()=>{const t=ee(),r=V(),y=r+12;return`
      ${k([{label:"Items",value:R(),icon:e.shop,delta:"Verified sellers only",up:!0,spark:[1,2,2,3,2,3,3],foot:"Across the marketplace",open:"#shop"},{label:"Subtotal",value:$(r),icon:e.wallet,delta:"Input costs",up:!0,spark:[20,30,40,60,80,100,120],foot:"Before delivery",open:"#checkout"},{label:"Available Credit",value:"$50,000",icon:e.finance,delta:"Line of credit",up:!0,spark:[40,40,42,42,44,44,50],foot:"Against warehouse receipts",open:"#finance"}])}
      ${f(`
        ${o("Cart Items")}
        ${t.length===0?a({title:"Your cart is empty",icon:e.shop,body:p("info","Add inputs from the shop — they will appear here.","Browse the shop","Opening the input store","#shop")}):a({body:t.map(C=>te(C)).join(""),pad:"4px 20px 10px"})}
      `,`
        ${a({title:"Order Summary",icon:e.wallet,body:`
            ${E([{label:"Subtotal",value:$(r)},{label:"Delivery",value:"$12.00"},{label:"Total",value:$(y)}])}
            ${p("ok","Delivery to Miller Corp, Harare by <b>Saturday</b>. ZVIDA-backed sellers only.")}
            <div class="dsh-btn-row full">${i("Proceed to Checkout","primary","Opening checkout","#checkout")}</div>`})}
      `)}
    `}},checkout:{id:"checkout",label:"Checkout",icon:e.wallet,title:"Checkout",sub:"Delivery & payment",hidden:!0,render:()=>`
      <div class="dsh-checkout">
      ${o("Delivery Address")}
      ${a({body:`
          <div class="dsh-field-grid">
            ${l("Full name",m("Miller"))}
            ${l("Phone",m("+263 24 277 2200"))}
          </div>
          <div class="dsh-field-grid">
            ${l("Street / Facility",m("Miller Corp, Harare"))}
            ${l("City / Province",m("Harare"))}
          </div>`})}
      ${o("Delivery Speed")}
      ${a({body:`
          ${D([{label:"Standard — Free (Sat)",value:"Standard"},{label:"Express — +$8.00 (Tomorrow)",value:"Express"}],0,"delivery")}
          <div data-filter-group="delivery" data-filter-value="Standard">
            ${p("info","Free delivery · Arrives <b>Saturday, 08:00–12:00</b>.")}
          </div>
          <div data-filter-group="delivery" data-filter-value="Express" style="display:none">
            ${p("warn","+$8.00 · Arrives <b>tomorrow by 14:00</b>. Courier tracked.")}
          </div>`})}
      ${f(`
        ${o("Payment Method")}
        ${a({body:`
            ${D(["ZVIDA Wallet (Balance $28,400)","Line of Credit","EcoCash"],0,"pay")}
            <div data-filter-group="pay" data-filter-value="ZVIDA Wallet (Balance $28,400)">
              ${p("ok","Paid instantly from your wallet. No extra fees.")}
            </div>
            <div data-filter-group="pay" data-filter-value="Line of Credit" style="display:none">
              ${p("warn","Drawn against warehouse receipts at 2.5% flat. Auto-deducted at payout.")}
            </div>
            <div data-filter-group="pay" data-filter-value="EcoCash" style="display:none">
              ${p("info","You will receive an EcoCash payment request after the order is confirmed.")}
            </div>
            ${l("Delivery notes",m(void 0,"e.g. Deliver to the intake bay"))}`})}
      `,`
        ${o("Summary")}
        ${a({body:`
            ${E([{label:"Subtotal",value:$(V())},{label:"Delivery",value:"$12.00"},{label:"Total",value:$(V()+12)}])}
            <div class="dsh-btn-row full">${h("Confirm & Place Order","primary","marketPlace","","Order placed — seller notified")}</div>`})}
      `)}
      </div>
    `},"order-confirmed":{id:"order-confirmed",label:"Order Confirmed",icon:e.check,title:"Order Confirmed",sub:"Thank you",hidden:!0,render:()=>{const t=K();return`
      ${p("ok",`${t?t.ref:"Your order"} was placed. The sellers have been notified and will confirm shortly.`)}
      ${a({title:t?`Reference ${t.ref}`:"Reference #C-2213",icon:e.check,body:`
          ${t?X(t):""}
          <div style="display:flex;align-items:center;gap:18px;margin-top:10px">
            ${v(t?.items[0]?.thumb||"fert","md")}
            <div style="flex:1;min-width:0">
              <div style="font-size:13.5px;font-weight:700">${t?t.address:"Delivery to Miller Corp, Harare by Saturday"}</div>
              <div style="font-size:12px;color:var(--dsh-text-3);margin:4px 0 12px">Track your order status anytime from this page.</div>
              ${T(1,4,"Confirmed → Packed → Shipped → Delivered")}
            </div>
          </div>`})}
      <div class="dsh-btn-row">
        ${i("Track Order","outline sm","Opening your orders","#orders")}
        ${i("Back to Shop","primary","Opening the input store","#shop")}
      </div>
    `}},orders:{id:"orders",label:"Orders",icon:e.orders,title:"My Orders",sub:"Track and reorder",render:()=>{const t=Y().filter(y=>y.buyer.startsWith("Miller")),r=t.filter(y=>!["DELIVERED","CANCELLED","ESCALATED"].includes(y.status)).length;return`
      ${p("info",`${r} active ${r===1?"order":"orders"} in progress. Sellers confirm within 24 hours.`,"Go shopping","Opening the input store","#shop")}
      ${o("Your Orders","Shop more","Opening the input store",t.length,"#shop")}
      ${D(["All","Active","Pending","Loading","Offloading","Complete"],0,"orders")}
      ${t.length===0?a({title:"No orders yet",icon:e.orders,body:p("info","When you place an order it will appear here.","Browse the shop","Opening the input store","#shop")}):""}
      ${t.map(y=>_(y,"buyer","orders",U(y.status))).join("")}
    `}},sell:{id:"sell",label:"Sell",icon:e.sell,title:"Sell",sub:"By-products & overbought grain",render:()=>`
      ${o("Inventory — By-products")}
      ${a({body:`
          <div style="display:flex;align-items:center;gap:26px;flex-wrap:wrap">
            ${A(48,"48 t",88)}
            <div style="flex:1;min-width:240px">
              <div style="font-size:15px;font-weight:750;letter-spacing:-0.01em;margin-bottom:4px">By-product stock</div>
              <div style="font-size:13px;color:var(--dsh-text-2)">Maize Bran: 25t · Wheat Bran: 15t · Distressed Maize: 8t (stockfeed grade)</div>
            </div>
            ${s("Listable now","green")}
          </div>`})}
      ${f(`
        ${o("Create New Listing")}
        ${a({title:"New listing",icon:e.plus,body:`
            <div class="dsh-field-grid">
              ${l("Product type",L(["Maize Bran","Wheat Bran","Distressed Maize","Overbought Grain"],n&&n.kind==="maize"?2:0))}
              ${l("Quantity (tons)",m(n?n.kind==="maize"?x.qty:S.qty:"10.0"))}
            </div>
            <div class="dsh-field-grid">
              ${l("Grade",L(["Stockfeed Grade","Grade A","Grade B","Grade C"]))}
              ${l("Selling price ($/t)",m(n?n.kind==="maize"?x.price:S.price:"150.00"))}
            </div>
            ${n?p("ok",`Editing your <b>${n.kind==="maize"?"Distressed Maize":"Maize Bran"}</b> listing — update and save.`):""}
            <div class="dsh-btn-row" style="justify-content:space-between">
              ${H("Upload photo","ghost sm","image/*")}
              <span>
                ${n?h("Cancel","ghost","cancelOffEdit","sell","Edit cancelled"):""}
                ${h(n?"Save Changes":"Submit Listing","primary","submitOffListing","",n?"Listing updated":"Listing submitted for approval")}
              </span>
            </div>`})}
      `,`
        ${o("My Active Listings")}
        ${z.map(t=>b({title:t.title,thumb:t.thumb,badge:t.badge,badgeTone:t.badgeTone,time:t.meta,open:"#sell",foot:t.foot})).join("")}
        ${b({title:`Maize Bran · ${S.qty}t · $${S.price}/t`,thumb:"bran",badge:"ACTIVE",badgeTone:"green",key:"o-bran",open:"#sell",foot:`${h("Edit","ghost sm","editOffListing","","Listing loaded into the form")}${i("Pause","ghost sm","Listing paused",void 0,"o-sell-list","pause")}`})}
        ${b({title:`Distressed Maize · ${x.qty}t · $${x.price}/t`,thumb:"grain",badge:"ACTIVE",badgeTone:"green",key:"o-maize",open:"#sell",foot:`${h("Edit","ghost sm","editOffListing","","Listing loaded into the form")}${i("Pause","ghost sm","Listing paused",void 0,"o-sell-list","pause")}`})}
      `)}
    `},deliveries:{id:"deliveries",label:"Deliveries",icon:e.deliveries,title:"Deliveries",sub:"Inbound loads",render:()=>{const t=J().filter(d=>d.receiver.includes("Miller")),r=t.filter(d=>!["PAID","CANCELLED"].includes(d.status)),y=r.filter(d=>d.status==="IN_TRANSIT").length,C=r.filter(d=>["OFFLOADING","WEIGHED_2"].includes(d.status)).length,q=t.filter(d=>d.status==="PENDING_PAYMENT"),N=q.reduce((d,B)=>d+B.amount,0);return`
      ${k([{label:"Inbound Loads",value:r.length,icon:e.deliveries,delta:"From suppliers via ZVIDA",up:!0,spark:[2,3,2,3,4,3,Math.max(r.length,1)],foot:"Awaiting intake",open:"#deliveries"},{label:"Offloading",value:C,icon:e.weighbridge,delta:"Record second weight",up:!1,spark:[1,0,1,2,1,2,Math.max(C,1)],foot:"At intake bay",open:"#deliveries"},{label:"In Transit",value:y,icon:e.truck,delta:"Live GPS tracking",up:!0,spark:[0,1,1,0,2,1,Math.max(y,1)],foot:"En route to you",open:"#deliveries"},{label:"Payable to ZVIDA",value:q.length,icon:e.payments,delta:`${$(N)} invoiced`,up:!1,spark:[1,2,1,3,2,2,Math.max(q.length,1)],foot:"Pay ZVIDA on terms",open:"#finance"}])}
      ${p("info","Inbound consignments from ZVIDA. Record the second weight at intake to confirm net, then offload. You pay ZVIDA — ZVIDA pays the supplier.")}
      ${o("Inbound Consignments","Recent deliveries","Opening delivery history",t.filter(d=>d.status==="PAID").length,"#deliveries")}
      ${r.length?r.map(d=>W(d,"receiver")).join(""):p("ok","No inbound loads right now.")}
      ${o("Recent Deliveries")}
      ${a({body:I(["Load","Commodity","Net","Delivered"],[["#880","Maize","18.2t","Jul 15, 2026"],["#879","Soya","9.8t","Jul 12, 2026"],["#878","Maize","20.0t","Jul 10, 2026"]],[],["#finance","#finance","#finance"]),flush:!0})}
    `}},quality:{id:"quality",label:"Quality",icon:e.quality,title:"Quality",sub:"Lab results & approval",render:()=>`
      ${j([{label:"Pending Review",badge:3,active:!0},{label:"Approved",badge:12},{label:"Rejected",badge:2}])}
      ${a({body:`
          <div class="js-q882">
            <div style="display:flex;align-items:center;gap:24px;flex-wrap:wrap;margin-bottom:6px">
              ${v("grain","sm")}
              ${A(72,"B",76)}
              <div style="flex:1;min-width:200px">
                <div style="font-size:15px;font-weight:700">Load #882 · Maize (20t)</div>
                <div style="font-size:13px;color:var(--dsh-text-2);margin-top:4px">Lab: Moisture <b>14.5%</b> · Protein 8.2% · Foreign matter 1.5%<br/>Spec: Moisture max 14.0% · ${s("Grade B","amber")}</div>
              </div>
              <div class="dsh-btn-row">${i("Approve","success sm","Quality approved — ZVIDA notified",void 0,"o-quality-882","approve")}${i("Reject","danger sm","Dispute raised with ZVIDA",void 0,"o-quality-882","reject")}</div>
            </div>
          </div>`})}
      ${a({body:`
          <div class="js-q881">
            <div style="display:flex;align-items:center;gap:24px;flex-wrap:wrap;margin-bottom:6px">
              ${v("soya","sm")}
              ${A(96,"A",76)}
              <div style="flex:1;min-width:200px">
                <div style="font-size:15px;font-weight:700">Load #881 · Soya (10t)</div>
                <div style="font-size:13px;color:var(--dsh-text-2);margin-top:4px">Lab: Moisture <b>11.8%</b> · Protein 36% · Foreign matter 0.8% · ${s("Grade A","green")}</div>
              </div>
              <div class="dsh-btn-row">${i("Approve","success sm","Quality approved — ZVIDA notified",void 0,"o-quality-881","approve")}${i("Reject","danger sm","Dispute raised with ZVIDA",void 0,"o-quality-881","reject")}</div>
            </div>
          </div>`})}
      ${o("Recent Results")}
      ${a({body:I(["Load","Commodity","Grade","Result"],[["#880","Maize","A",s("Approved","green")],["#879","Soya","A",s("Approved","green")],["#878","Maize","B",s("Approved","green")]]),flush:!0})}
    `},finance:{id:"finance",label:"Finance",icon:e.finance,title:"Finance",sub:"Invoices & payments",render:()=>`
      ${k([{label:"Total Payable",value:"$9,300",icon:e.wallet,delta:"2 invoices open",up:!1,spark:[30,28,34,30,36,34,40],foot:"Across all loads",open:"#finance"},{label:"Due In 3 Days",value:"$4,800",icon:e.clock,delta:"Invoice INV-2210",up:!1,spark:[10,14,18,16,20,24,26],foot:"Next due date",open:"#deliveries"},{label:"Paid (Month)",value:"$10,880",icon:e.check,delta:"3 invoices settled",up:!0,spark:[20,30,26,38,44,50,56],foot:"This month",open:"#finance"},{label:"Avg Days to Pay",value:5,icon:e.scale,delta:"On NET terms",up:!0,spark:[8,7,6,6,5,5,5],foot:"days",open:"#perf"}])}
      ${f(`
        ${o("Outstanding Invoices")}
        ${b({title:"Invoice INV-2210 · Load #882",thumb:"grain",badge:"Due in 3 days",badgeTone:"amber",open:"#finance",meta:"Amount: <b>$4,800</b> · Terms: NET_3 · Due Jul 25, 2026",foot:`${i("Pay Now","primary sm","Invoice payment initiated",void 0,"o-pay-2210","pay")}${i("View Invoice","outline sm","Opening invoice",void 0,"o-pay-2210","view")}`})}
        ${b({title:"Invoice INV-2211 · Load #883",thumb:"soya",badge:"Due in 7 days",badgeTone:"amber",open:"#finance",meta:"Amount: <b>$4,500</b> · Terms: NET_7 · Due Jul 28, 2026",foot:`${i("Pay Now","primary sm","Invoice payment initiated",void 0,"o-pay-2211","pay")}${i("View Invoice","outline sm","Opening invoice",void 0,"o-pay-2211","view")}`})}
        ${o("Payment History")}
        ${a({body:`
            ${c(e.check,"Invoice INV-2208","Jul 15, 2026 · Paid","-$4,320","neg",!1,"#finance")}
            ${c(e.check,"Invoice INV-2205","Jul 12, 2026 · Paid","-$3,920","neg",!1,"#finance")}
            ${c(e.check,"Invoice INV-2201","Jul 10, 2026 · Paid","-$2,640","neg",!1,"#finance")}`})}
      `,`
        ${a({title:"Spend This Month",icon:e.trendingUp,body:O([{label:"Maize",pct:62},{label:"Soya",pct:24},{label:"Wheat",pct:14}])})}
        ${a({title:"Payment Method",icon:e.wallet,body:`${c(e.wallet,"EcoCash Corporate","Default · verified","Primary","plain",!0)}
            ${c(e.scale,"Bank Transfer","CBZ · •••• 4921","Backup","plain")}`})}
      `)}
    `},warehouse:{id:"warehouse",label:"Warehouse",icon:e.warehouse,title:"Warehouse",sub:"FIFO inventory & silos",render:()=>`
      ${p("warn","Overstock alert: <b>Maize</b> is above optimal FIFO target by 40%.")}
      ${o("FIFO Inventory")}
      ${a({body:I(["","Batch","Commodity","Volume","Received","Status"],[[v("grain","xs"),"B-1042","Maize","320t","Jul 18",s("Overstock","amber")],[v("soya","xs"),"B-1041","Soya","85t","Jul 16",s("Normal","green")],[v("wheat","xs"),"B-1040","Wheat","140t","Jul 14",s("Normal","green")],[v("grain","xs"),"B-1039","Maize","60t","Jul 08",s("Low","amber")]],[],["#quality","#quality","#quality","#quality"]),flush:!0})}
      ${o("Silo Capacity")}
      ${a({body:O([{label:"Silo 1 (Maize)",pct:82},{label:"Silo 2 (Soya)",pct:45},{label:"Silo 3 (Wheat)",pct:68}])})}
      <div class="dsh-btn-row" style="margin-top:12px">${h("Export Inventory","outline","exportInventory","","Inventory CSV exported")}</div>
    `},perf:{id:"perf",label:"Performance",icon:e.shield,title:"Performance",sub:"Intake reliability, quality & supplier scores",render:()=>`
      ${k([{label:"On-time Intake",value:98,icon:e.shield,delta:"Across 38 loads",up:!0,spark:[92,95,96,95,97,98,98],foot:"% of loads",open:"#perf"},{label:"Quality Pass Rate",value:96,icon:e.quality,delta:"Passed first check",up:!0,spark:[92,93,94,95,95,96,96],foot:"% of samples",open:"#perf"},{label:"Silo Throughput",value:605,icon:e.warehouse,delta:"This month",up:!0,spark:[30,40,38,45,50,48,52],foot:"tons received",open:"#perf"},{label:"Avg Supplier Rating",value:"4.8",icon:e.check,delta:"5 rated suppliers",up:!0,spark:[40,42,44,45,46,47,48],foot:"Out of 5.0",open:"#perf"}])}
      ${f(`
        ${o("Intake Record")}
        ${a({body:I(["Load","Commodity","Net","On-time","Grade"],[["#882","Maize","20t",s("Yes","green"),"A"],["#880","Maize","18.2t",s("Yes","green"),"A"],["#879","Soya","9.8t",s("Yes","green"),"B"],["#878","Maize","20t",s("Late 10m","amber"),"A"],["#877","Ground Nuts","4t",s("Yes","green"),"B"]]),flush:!0})}
        ${o("Reliability Breakdown")}
        ${a({body:O([{label:"Intake window adherence",pct:98},{label:"Quality checks completed",pct:100},{label:"Documentation accuracy",pct:97}])})}
      `,`
        ${a({title:"ZVIDA Score",icon:e.spark,body:`
            <div style="display:flex;align-items:center;gap:18px">
              ${A(88,"88",84)}
              <div style="flex:1;min-width:0">
                <div style="font-size:13.5px;font-weight:700">Tier 1 buyer</div>
                <div style="font-size:12px;color:var(--dsh-text-3);margin:4px 0 12px">Score unlocks priority supplier matching and better NET terms.</div>
                ${T(5,5,"Tier 1 · 5 of 5")}
              </div>
            </div>`})}
        ${a({title:"Supplier Scores",icon:e.quality,body:`
            ${c(e.quality,"James (Farm 42, Ruwa)","12 loads · Always on time","5.0","pos")}
            ${c(e.quality,"Prosper (Farm 12, Norton)","8 loads · Great moisture","4.9","pos")}
            ${c(e.quality,"Tapiwa (Farm 7, Chinhoyi)","6 loads · Late once","4.5","pos")}`})}
      `)}
    `},messages:{id:"messages",label:"Messages",icon:e.messages,title:"Messages",sub:"Chat with ZVIDA",render:()=>`
      ${G({name:"ZVIDA · Load #882",preview:"ETA updated to 11:00 AM",time:"Today"},[{sent:!1,text:"ZVIDA: Load #882 ETA updated to 11:00 AM.",time:"09:15 AM"},{sent:!0,text:"You: Received. Silo 1 will be ready.",time:"09:20 AM"},{sent:!1,text:"ZVIDA: Quality report will be uploaded after offload.",time:"09:22 AM"}],["ETA update?","Weighbridge numbers?","Upload lab report"])}
    `}};Q({name:"Miller",roleLabel:"Offtaker",company:"Miller Corporation",initials:"M",accent:"#7c3aed",accentHover:"#6d28d9",accentLight:"#f5f3ff",accentRgb:"124, 58, 237",gradientEnd:"#a78bfa",pages:[u.today,u.buy,u.shop,u.orders,u.cart,u.checkout,u["order-confirmed"],u.sell,u.deliveries,u.quality,u.finance,u.warehouse,u.perf,u.messages]});
