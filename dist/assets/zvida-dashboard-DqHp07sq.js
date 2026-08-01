import"./auth-ui-CasobAI5.js";import{J as M,t as R,d as j,r as I,w as l,g as n,u as s,b as V,I as e,m as J,k as $,Q as w,a as p,s as c,c as W,e as F,f as q,p as i,z as h,O as A,N as O,j as E,B as C,l as m,h as k,v as L,i as P,a0 as _,A as Z,x as H,a7 as Q,a8 as U,a9 as K,y as Y,C as X,D as ee,a2 as te,G as ae,aa as ie}from"./core-B4swM7IO.js";M.callDriver=o=>{R(`Dialing ${o} — placing the call from your phone`,"info")};M.exportTax=()=>{j("z-tax"),R("Tax compliance file exported")};M.exportCarbon=()=>{j("z-carbon"),R("Carbon footprint report exported")};I("z-tax","Tax_Compliance_Jul31.csv",["Contract,Commodity,Spread,Withholding","#882,Maize,800,80","#883,Soya,900,90","#884,Wheat,900,90"].join(`
`),"text/csv");I("z-carbon","Carbon_Footprint_Jul31.csv",["Contract,Km,Mode,kgCO2","#882,22,10t truck,142","#883,84,10t truck,410","#884,96,10t truck,468"].join(`
`),"text/csv");l("z-notify",{send:{done:"Sent",toast:"Broadcast sent to all parties"}});l("z-feed-approve",{approve:{done:"Approved",nav:"#listings",toast:"Listing approved at $240/t — James notified"}});l("z-feed-notify",{notify:{done:"Notified",nav:"#deliveries",toast:"Party notified about the delay"}});l("z-rev-882",{review:{target:".js-z-d882",sel:".dsh-badge",to:"IN REVIEW",tone:"blue",nav:"#disputes",done:"In Review",toast:"Resolution panel opened",foot:n("Confirm Decision","primary sm","Dispute resolved — both parties notified",void 0,"z-resolve-882","confirm")}});l("z-rev-879",{review:{done:"In Review",nav:"#disputes",toast:"Resolution panel opened",foot:s("Awaiting evidence from Peter","amber")}});l("z-resolve-882",{confirm:{target:".js-z-d882",to:"RESOLVED",tone:"green",nav:"#disputes",toast:"Dispute resolved — both parties notified",foot:s("Resolved","green")+' <span style="font-size:12px;color:var(--dsh-text-3)">Decision: $50 penalty applied to farmer payout.</span>'}});l("z-list-james",{approve:{to:"APPROVED",tone:"green",nav:"#listings",toast:"Listing approved — James notified",foot:s("Live for customers","green")},reject:{to:"REJECTED",tone:"red",nav:"#listings",toast:"Listing rejected — James notified",foot:s("Rejected","red")}});l("z-list-sarah",{approve:{to:"APPROVED",tone:"green",nav:"#listings",toast:"Listing approved — Sarah notified",foot:s("Live for customers","green")},reject:{to:"REJECTED",tone:"red",nav:"#listings",toast:"Listing rejected — Sarah notified",foot:s("Rejected","red")}});l("z-list-peter",{approve:{to:"APPROVED",tone:"green",nav:"#listings",toast:"Listing approved — Peter notified",foot:s("Live for customers","green")},reject:{to:"REJECTED",tone:"red",nav:"#listings",toast:"Listing rejected — Peter notified",foot:s("Rejected","red")}});l("z-automatch",{match:{done:"Matched",nav:"#deliveries",toast:"Contract created — parties notified"}});l("z-matchall",{all:{done:"Matched",nav:"#deliveries",toast:"5 contracts created — parties notified"}});l("z-pay-882",{release:{sel:".js-due-882",to:"Released",tone:"green",nav:"#payments",toast:"Payment of $4,000 released to James",foot:s("Released to James · Receipt sent","green")},hold:{sel:".js-due-882",to:"Held",tone:"amber",nav:"#payments",toast:"Payment held — reminder scheduled",foot:s("Held · reminder scheduled","amber")}});l("z-pay-883",{release:{sel:".js-due-883",to:"Released",tone:"green",nav:"#payments",toast:"Payment of $3,600 released to Sarah",foot:s("Released to Sarah · Receipt sent","green")},hold:{sel:".js-due-883",to:"Held",tone:"amber",nav:"#payments",toast:"Payment held — reminder scheduled",foot:s("Held · reminder scheduled","amber")}});l("z-pay-884",{release:{sel:".js-due-884",to:"Released",tone:"green",nav:"#payments",toast:"Payment of $4,200 released to Peter",foot:s("Released to Peter · Receipt sent","green")},hold:{sel:".js-due-884",to:"Held",tone:"amber",nav:"#payments",toast:"Payment held — reminder scheduled",foot:s("Held · reminder scheduled","amber")}});const u={control:{id:"control",label:"Control Tower",icon:e.dashboard,title:"Control Tower",sub:"ZVIDA Exchange — live operations",render:()=>`
      ${X({kick:"Operations overview",title:"Control Tower",sub:"Today’s spread sits at $4,200 across 12 open loads. Review urgent events, approvals and risk flags below.",actions:`${n("Match Trade","onlight","Opening blind matching","#matches")}${n("Release Payment","onlight","Opening pending payments","#payments")}`,bg:"dash/hero-office.jpg",stats:[{l:"Spread today",v:"$4,200"},{l:"Open loads",v:"12"},{l:"On-time",v:"96%"}]})}
      ${ee([{label:"Match Trade",icon:e.match,toast:"Opening blind matching",href:"#matches"},{label:"Release Payment",icon:e.payments,toast:"Opening pending payments",href:"#payments"},{label:"Approve Listing",icon:e.listings,badge:4,toast:"Opening approval queue",href:"#listings"},{label:"Notify All",icon:e.send,toast:"Broadcast sent to all parties",wf:"z-notify",action:"send"}])}
      ${$([{label:"Today’s Spread",value:"$4,200",icon:e.spark,delta:"12 loads in motion",up:!0,spark:[10,18,16,22,30,34,42],foot:"Gross margin for the day",open:"#reports"},{label:"This Week",value:"$18,500",icon:e.trendingUp,delta:"8% vs last week",up:!0,spark:[30,34,32,40,44,42,48],foot:"Across all load types",open:"#payments"},{label:"Pending Approvals",value:4,icon:e.listings,delta:"2 disputes open",up:!1,spark:[5,6,4,7,5,4,4],foot:"Listings & contracts",open:"#listings"},{label:"On-time Deliveries",value:96,icon:e.shield,delta:"Across 38 loads",up:!0,spark:[90,92,94,93,95,96,96],foot:"% of loads",open:"#deliveries"}])}
      ${k(`
        ${c("Urgent Feed","View all","Opening full activity log",void 0,"#reports")}
        ${te([{icon:e.disputes,tone:"danger",time:"09:00 AM",title:"Quality dispute — Miller Corp rejected Load #882",desc:"Maize · 14.5% moisture vs 14% spec · Supplier: James · Offtaker: Miller Corp",open:"#disputes",actions:n("Review","primary sm","Opening dispute review","#disputes")},{icon:e.listings,tone:"warn",time:"10:00 AM",title:"Listing approval — James listed 20t Maize @ $200/t",desc:"Reserve: $200/t · ZVIDA price: $240/t (suggested)",open:"#listings",actions:n("Set Price & Approve","primary sm","Listing approved at $240/t",void 0,"z-feed-approve","approve")},{icon:e.truck,tone:"default",time:"11:00 AM",title:"Truck delay — Driver John Doe (ABC-123) in traffic",desc:"ETA delayed by 1 hour · Load #882",open:"#deliveries",actions:`${n("Notify Supplier","ghost sm","Supplier notified",void 0,"z-feed-notify","notify")}${n("Notify Offtaker","ghost sm","Offtaker notified",void 0,"z-feed-notify","notify")}`},{icon:e.match,tone:"ok",time:"02:00 PM",title:"Blind match — Listing #441 matched to Offtaker #003",desc:"Spread: $800 (20t Maize @ $200 / $240)",open:"#deliveries",actions:n("View Contract","outline sm","Opening contract #882","#deliveries")}])}
      `,`
        ${i({title:"At a Glance",icon:e.spark,body:h([{label:"Today",value:"$4,200"},{label:"This Week",value:"$18,500"},{label:"This Month",value:"$42,300"}])})}
        ${i({title:"Risk Overlays",icon:e.alert,body:`
            ${p("warn","3 listings over 30 days old. Prices auto-reduce tomorrow.","View queue","Opening spoilage queue","#listings")}
            ${p("info","Rain forecast for Mashonaland East tomorrow. 5 loads at risk.","View loads","Opening affected loads","#deliveries")}`})}
        ${i({title:"Recently Matched",icon:e.match,body:`
            ${m(e.leaf,"ANON-1 → ANON-B1","Maize 20t · spread $800","+$800","pos",!1,"#matches")}
            ${m(e.leaf,"ANON-3 → ANON-B3","Wheat 15t · spread $600","+$600","pos",!1,"#matches")}
            ${m(e.leaf,"ANON-2 → ANON-B2","Soya 10t · spread $500","+$500","pos",!1,"#matches")}`})}
      `)}
    `},listings:{id:"listings",label:"Listings",icon:e.listings,title:"Listings",sub:"Approval queue",render:()=>`
      ${C([{label:"Pending Approval",badge:4,active:!0},{label:"Active Listings",badge:12},{label:"Rejected",badge:3}],"zlist")}
      ${k(`
        <div data-tab-group="zlist" data-tab="Pending Approval">
        ${x("James","grain","Maize",20,"Ruwa","Grade A",14.5,200,0,"",240,"z-list-james")}
        ${x("Sarah","soya","Soya",10,"Marondera","Grade A",12,450,15,"Auto-reducing in 3 days",490,"z-list-sarah")}
        ${x("Peter","wheat","Wheat",15,"Bindura","Grade B",13.2,380,32,"Auto-reducing in 3 days",420,"z-list-peter")}
        </div>
        <div data-tab-group="zlist" data-tab="Active Listings" style="display:none">
          ${i({body:O(["Supplier","Commodity","Qty","ZVIDA price","Status"],[["Tapiwa","Maize","30t","$215/t",s("Live","green")],["Rudo","Soya","12t","$470/t",s("Live","green")],["Farai","Wheat","25t","$395/t",s("Live","green")],["Tendai","Sugar Beans","8t","$640/t",s("Live","green")]],[],["#deliveries","#deliveries","#deliveries","#deliveries"]),flush:!0})}
        </div>
        <div data-tab-group="zlist" data-tab="Rejected" style="display:none">
          ${i({body:O(["Supplier","Commodity","Reason","Date"],[["Blessing","Maize",s("Moisture 16%","red"),"Jul 24"],["Chipo","Soya",s("Unverified GPS","red"),"Jul 20"],["Nomatter","Wheat",s("Duplicate listing","red"),"Jul 18"]]),flush:!0})}
        </div>
      `,`
        ${i({title:"Listing Stats",icon:e.listings,body:h([{label:"Pending",value:"4"},{label:"Active",value:"12"},{label:"Rejected",value:"3"}])})}
        ${i({title:"Pricing Policy",icon:e.percent,body:`
            ${p("info","Listings idle for 30+ days auto-reduce at <b>5% per week</b> to clear spoilage risk.")}
            <div style="font-size:12px;color:var(--dsh-text-3)">Spoilage queue runs at 06:00 AM daily.</div>`})}
        ${i({title:"Spread Benchmarks",icon:e.scale,body:A([{label:"Maize",pct:18},{label:"Soya",pct:14},{label:"Wheat",pct:12}])})}
      `)}
    `},matches:{id:"matches",label:"Matches",icon:e.match,title:"Matches",sub:"Anonymous blind matching",render:()=>`
      ${$([{label:"Open Listings",value:12,icon:e.listings,delta:"2 expiring soon",up:!1,spark:[10,12,11,13,12,12,12],foot:"Suppliers",open:"#listings"},{label:"Open RFQs",value:8,icon:e.buy,delta:"3 high priority",up:!0,spark:[6,7,6,8,7,8,8],foot:"Offtakers",open:"#listings"},{label:"Top Spread",value:"$800",icon:e.spark,delta:"Maize · ANON-1",up:!0,spark:[20,30,28,40,50,60,66],foot:"Best match today",open:"#reports"},{label:"Avg Spread",value:"$620",icon:e.scale,delta:"Across 8 deals",up:!0,spark:[30,34,32,40,44,42,48],foot:"Per matched deal",open:"#reports"}])}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:18px">
        ${i({title:"Supplier listings (anonymous)",icon:e.leaf,body:`
            ${y(!0,"Anonymous Supplier #1","20t Maize @ $200/t (COD) · Ruwa","GPS: -17.883, 31.033 · Grade A")}
            ${y(!1,"Anonymous Supplier #2","10t Soya @ $450/t (COC) · Marondera","GPS: -18.185, 31.550 · Grade A")}
            ${y(!1,"Anonymous Supplier #3","15t Wheat @ $380/t (COD) · Bindura","GPS: -17.292, 31.331 · Grade B")}`})}
        ${i({title:"Offtaker RFQs (anonymous)",icon:e.users,body:`
            ${y(!0,"Anonymous Buyer #1","25t Maize @ $240/t · Harare","GPS: -17.825, 31.033 · Grade A")}
            ${y(!1,"Anonymous Buyer #2","15t Soya @ $500/t · Harare","GPS: -17.825, 31.033 · Grade A")}
            ${y(!1,"Anonymous Buyer #3","20t Wheat @ $420/t · Chitungwiza","GPS: -18.000, 31.083 · Grade B")}`})}
      </div>
      ${c("Smart Queue — Top Matches by Spread")}
      <div class="dsh-queue">
        ${S(1,"Maize",20,200,240,800,"ANON-1","ANON-B1",50)}
        ${S(2,"Wheat",15,380,420,600,"ANON-3","ANON-B3",40)}
        ${S(3,"Soya",10,450,500,500,"ANON-2","ANON-B2",70)}
      </div>
      <div class="dsh-btn-row" style="margin-top:16px">${n("Match All","primary","5 contracts created — parties notified",void 0,"z-matchall","all")}</div>
    `},deliveries:{id:"deliveries",label:"Freight Ops",icon:e.deliveries,title:"Freight Ops",sub:"Consignments, weighbridge & payments",render:()=>{const o=H(),a=Q(o),r=o.filter(t=>!["PAID","CANCELLED"].includes(t.status)),d=o.filter(t=>t.status==="PENDING_PAYMENT");return`
      ${$([{label:"In Transit",value:a.inTransit,icon:e.truck,delta:"Live GPS tracking",up:!0,spark:[2,3,2,4,3,5,Math.max(a.inTransit,1)],foot:"Trucks on the road",open:"#deliveries"},{label:"Loading / Offloading",value:a.loading,icon:e.deliveries,delta:"At weighbridge or bay",up:!0,spark:[3,4,3,2,4,3,Math.max(a.loading,1)],foot:"Being processed",open:"#deliveries"},{label:"Awaiting Payment",value:a.pendingPay,icon:e.payments,delta:`${w(a.pendingValue)} held in escrow`,up:!1,spark:[2,3,4,5,4,5,Math.max(a.pendingPay,1)],foot:"ZVIDA settles on terms",open:"#payments"},{label:"Settled",value:a.paid,icon:e.wallet,delta:`${w(a.paidValue)} paid out`,up:!0,spark:[1,2,1,3,2,3,Math.max(a.paid,1)],foot:"Completed consignments",open:"#payments"}])}
      ${p("info","Consignment ledger — the first and second weighbridge weights set the net (scale loads use bucket counts). Payments sit at <b>awaiting ZVIDA</b> until settlement on the agreed COD / COC / NET terms.")}
      ${k(`
        ${c("Freight Feed","Open report","Opening freight report",void 0,"#reports")}
        ${K(o,4)}
        ${c("Open Consignments","Settled history","Opening settled consignments",a.paid,"#payments")}
        ${r.map(t=>Y(t,"admin")).join("")}
      `,`
        ${i({title:"Movement Overview",icon:e.deliveries,body:h([{label:"In transit",value:String(a.inTransit)},{label:"Loading / offloading",value:String(a.loading)},{label:"Awaiting payment",value:String(a.pendingPay)},{label:"Settled",value:String(a.paid)}])})}
        ${i({title:"Payment Releases",icon:e.payments,body:d.length?d.map(t=>m(e.payments,t.ref,`${t.supplier} · ${t.payTerm} · due ${t.due}`,U(t.amount),"pos",!1,"#payments")).join(""):p("ok","No payments pending — all consignments settled.")})}
        ${i({title:"Vehicle Pool",icon:e.truck,body:o.filter(t=>t.truck).slice(0,4).map(t=>m(e.truck,t.truck,`On ${t.ref} · ${t.driver||"unassigned"}`,t.status==="IN_TRANSIT"?"En route":t.status==="PENDING"?"Idle":"Active","plain",!1,"#deliveries")).join("")||p("info","No vehicles assigned yet.")})}
        ${i({title:"Payment Terms",icon:e.scale,body:p("info","COD and COC settle after the second weight; NET_3–NET_21 settle on the contract due date. Overrides require two-factor approval.")})}
      `)}
    `}},documents:{id:"documents",label:"Documents",icon:e.file,title:"Contract Documents",sub:"All parties · both price points",render:()=>Z("admin")},disputes:{id:"disputes",label:"Disputes",icon:e.disputes,title:"Disputes",sub:"Resolve quality & weight issues",render:()=>`
      ${C([{label:"Open",badge:2,active:!0},{label:"In Review",badge:1},{label:"Resolved",badge:5}])}
      ${k(`
        ${L({title:"Contract #882 · James vs Miller Corp",thumb:"grain",badge:"OPEN",badgeTone:"amber",cls:"js-z-d882",open:"#disputes",meta:"Type: <b>Quality</b> · Moisture 14.5% (exceeds 14% spec)<br/>Lab: Moisture 14.5% · Protein 8.2% · Foreign matter 1.5%<br/>Supplier claim: Grain was 13% at farm.",foot:n("Review","primary sm","Opening resolution panel",void 0,"z-rev-882","review")})}
        ${L({title:"Contract #879 · Peter vs Miller Corp",thumb:"wheat",badge:"OPEN",badgeTone:"amber",open:"#disputes",meta:"Type: <b>Weight</b> · Net 18.5t vs contracted 20t (1.5t short)<br/>Weighbridge: Gross 28.5t / Tare 10t / Net 18.5t · Shortfall 7.5%",foot:n("Review","primary sm","Opening resolution panel",void 0,"z-rev-879","review")})}
        ${c("Resolution — Contract #882")}
        ${i({title:"Dispute resolution",icon:e.disputes,body:`
            ${p("info",`Quality prediction: ${s("80% chance Grade A","blue")} based on supplier history.`)}
            ${P("Resolution option",`
              <div class="dsh-radio-row" style="flex-direction:column;gap:12px">
                <label class="dsh-radio"><input type="radio" name="resolution" checked /> Apply penalty to farmer — deduct $50 from supplier payout</label>
                <label class="dsh-radio"><input type="radio" name="resolution" /> Absorb loss — ZVIDA covers the $50</label>
                <label class="dsh-radio"><input type="radio" name="resolution" /> Send truck back — reject entire load</label>
                <label class="dsh-radio"><input type="radio" name="resolution" /> Amend contract — adjust price based on quality</label>
              </div>`)}
            ${P("Resolution notes",_(2,"Explain your decision…"))}
            <div class="dsh-btn-row">${n("Confirm Decision","primary","Dispute resolved — both parties notified",void 0,"z-resolve-882","confirm")}</div>`})}
      `,`
        ${i({title:"Dispute Overview",icon:e.disputes,body:h([{label:"Open",value:"2"},{label:"In review",value:"1"},{label:"Resolved",value:"5"}])})}
        ${i({title:"Resolution Trends",icon:e.scale,body:A([{label:"Quality",pct:60},{label:"Weight",pct:30},{label:"Late delivery",pct:10}])})}
        ${i({title:"Fairness Guard",icon:e.shield,body:p("ok","No repeated violations. Supplier and offtaker scores remain stable.")})}
      `)}
    `},payments:{id:"payments",label:"Payments",icon:e.payments,title:"Payments",sub:"Escrow & commission",render:()=>`
      ${C([{label:"Pending",badge:3,active:!0},{label:"Processing",badge:2},{label:"Completed",badge:12}])}
      ${z("Contract #882","James → Miller Corp","$4,000","$4,800","$800","NET_3","Due Jul 25 · 2 days","js-due-882")}
      ${z("Contract #883","Sarah → Miller Corp","$3,600","$4,500","$900","NET_7","Due Jul 28 · 5 days","js-due-883")}
      ${z("Contract #884","Peter → Miller Corp","$4,200","$5,100","$900","NET_21","Due Aug 10 · 21 days","js-due-884")}
      ${c("Commission Ledger")}
      ${i({body:h([{label:"Today",value:"$4,200"},{label:"This Week",value:"$18,500"},{label:"This Month",value:"$42,300"}])})}
      ${i({title:"Pending Commission",icon:e.scale,body:`
          ${m(e.scale,"Contract #882","Spread realized","+$800","pos",!1,"#reports")}
          ${m(e.scale,"Contract #883","Spread realized","+$900","pos",!1,"#reports")}
          ${m(e.scale,"Contract #884","Spread realized","+$900","pos",!1,"#reports")}`})}
    `},reports:{id:"reports",label:"Reports",icon:e.reports,title:"Reports",sub:"Margin & volume analytics",render:()=>`
      ${i({body:h([{label:"Gross Margin (Month)",value:"$42,300"},{label:"Cash Flow In",value:"$186k"},{label:"Cash Flow Out",value:"$152k"}])})}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        ${i({title:"Weekly Margin",icon:e.trendingUp,body:A([{label:"Week 1",pct:42},{label:"Week 2",pct:55},{label:"Week 3",pct:68},{label:"Week 4",pct:100}])})}
        ${i({title:"Cash Flow — This Month",icon:e.wallet,body:A([{label:"Inflows",pct:100},{label:"Outflows",pct:78,alt:!0},{label:"Net",pct:22}])})}
      </div>
      ${c("Top Commodities by Volume")}
      ${i({body:O(["Commodity","Volume","Margin"],[["Maize","420 t","$18,200"],["Soya","180 t","$11,500"],["Wheat","150 t","$7,800"],["Sugar Beans","90 t","$4,800"]],[2],["#payments","#payments","#payments","#payments"]),flush:!0})}
      ${c("Seasonality")}
      ${p("info","Peak volume expected <b>Sep–Nov</b> (harvest season). Plan truck capacity ahead.")}
      <div class="dsh-btn-row">${E("Export Tax Compliance File","outline","exportTax","","Tax file exported")}${E("Export Carbon Footprint Report","outline","exportCarbon","","Carbon report exported")}</div>
    `},marketplace:{id:"marketplace",label:"Orders",icon:e.shop,title:"Orders",sub:"Order oversight",render:()=>{const o=J(),a=o.filter(t=>!["DELIVERED","PAID","CANCELLED","ESCALATED"].includes(t.status)).length,r=o.filter(t=>t.status==="DELIVERED").reduce((t,g)=>t+g.total,0),d=o.filter(t=>t.status==="ESCALATED").length;return`
      ${$([{label:"Open Orders",value:a,icon:e.orders,delta:"Awaiting fulfilment",up:!0,spark:[2,3,4,3,5,4,Math.max(a,2)],foot:"Across all orders",open:"#marketplace"},{label:"GMV (Delivered)",value:w(r),icon:e.trendingUp,delta:"Completed orders",up:!0,spark:[40,60,90,80,120,140,Math.max(r/10,10)],foot:"Suppliers paid via NET_7",open:"#marketplace"},{label:"Escalated",value:d,icon:e.alert,delta:"Needs resolution",up:!1,spark:[1,0,1,0,1,0,Math.max(d,1)],foot:"Resolution desk",open:"#disputes"}])}
      ${p("info","Monitor orders end-to-end: ZVIDA confirms, driver delivers, payment releases. Escalate when a customer disputes a transaction.")}
      ${c("Order Board","Review disputes","Opening resolution desk",o.length,"#disputes")}
      ${W(["All","Active","Pending","Loading","Offloading","Complete","Escalated"],0,"zmkt")}
      ${o.map(t=>F(t,"admin","zmkt",q(t.status))).join("")}
    `}}};function x(o,a,r,d,t,g,b,v,f,N,D,T){const G=f===0?"green":f>30?"red":"amber",B=f===0?"New listing":`Spoilage: ${f} days`;return`<div class="dsh-item" style="display:flex;gap:16px">
    ${ae(a,"sm",r)}
    <div style="flex:1;min-width:0">
      <div class="dsh-item-top">
        <span class="dsh-item-title">${o} · ${r} · ${d}t</span>
        ${s(B,G)}
      </div>
      <div class="dsh-item-meta">${t} · ${g} · Moisture ${b}% · Reserve <b>$${v}/t</b></div>
      ${N?`<div style="font-size:12px;color:var(--dsh-warn);margin-top:4px">${ie(e.clock)} ${N}</div>`:""}
      <div class="dsh-item-foot">
        ${P("ZVIDA price",`<span style="display:flex;align-items:center;gap:8px"><span>$</span><input class="dsh-input" value="${D}.00" style="max-width:110px" /></span>`,`Suggested spread: $${D-v}/t`)}
        <div class="dsh-btn-row">${n("Approve","success",`Listing approved — ${o} notified`,void 0,T,"approve")}${n("Reject","danger","Listing rejected",void 0,T,"reject")}</div>
      </div>
    </div>
  </div>`}function y(o,a,r,d){return`<div class="dsh-match ${o?"selected":""}" data-toast="${a} selected">
    <span class="dsh-match-radio"></span>
    <div><div class="dsh-match-title">${a}</div><div class="dsh-match-meta">${r}</div><div class="dsh-match-meta">${d}</div></div>
  </div>`}function S(o,a,r,d,t,g,b,v,f){return`<div class="dsh-queue-card">
    <span class="dsh-queue-rank">#${o}</span>
    <div class="dsh-queue-body">
      <div class="dsh-queue-title">${a} — ${b} to ${v} · ${f}km</div>
      <div class="dsh-queue-meta">${r}t @ $${d} / $${t}</div>
    </div>
    <div class="dsh-queue-spread"><div class="v">$${g}</div><div class="l">spread</div></div>
    ${n("Auto-Match","primary sm",`Contract created: ${a} ${r}t`,void 0,"z-automatch","match")}
  </div>`}function z(o,a,r,d,t,g,b,v){return`<div class="dsh-item" data-open="#deliveries">
    <div class="dsh-item-top">
      <span class="dsh-item-title">${o} · ${a}</span>
      ${s(g,"blue")}
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:12px">
      <div><div style="font-size:10.5px;font-weight:650;text-transform:uppercase;letter-spacing:.05em;color:var(--dsh-text-3)">Supplier payout</div><div style="font-size:14px;font-weight:700;margin-top:2px">${r}</div></div>
      <div><div style="font-size:10.5px;font-weight:650;text-transform:uppercase;letter-spacing:.05em;color:var(--dsh-text-3)">Offtaker invoice</div><div style="font-size:14px;font-weight:700;margin-top:2px">${d}</div></div>
      <div><div style="font-size:10.5px;font-weight:650;text-transform:uppercase;letter-spacing:.05em;color:var(--dsh-text-3)">Spread</div><div style="font-size:14px;font-weight:700;margin-top:2px;color:var(--dsh-ok)">${t}</div></div>
      <div><div style="font-size:10.5px;font-weight:650;text-transform:uppercase;letter-spacing:.05em;color:var(--dsh-text-3)">Due</div><div class="${v}" style="font-size:14px;font-weight:700;margin-top:2px">${b}</div></div>
    </div>
    <div class="dsh-item-foot">
      ${n("Release Early","success sm",`Payment of ${r} released`,void 0,`z-pay-${v.slice(-3)}`,"release")}
      ${n("Hold","ghost sm","Payment held",void 0,`z-pay-${v.slice(-3)}`,"hold")}
      ${n("View Contract","outline sm","Opening contract","#deliveries")}
    </div>
  </div>`}V({name:"Admin",roleLabel:"ZVIDA",company:"ZVIDAMBANO Traders",initials:"Z",accent:"#2563eb",accentHover:"#1d4ed8",accentLight:"#eff6ff",accentRgb:"37, 99, 235",gradientEnd:"#60a5fa",pages:[u.control,u.marketplace,u.listings,u.matches,u.deliveries,u.documents,u.disputes,u.payments,u.reports],navGroups:[{label:"Overview",pages:["control"]},{label:"Trading",pages:["listings","matches","payments"]},{label:"Operations",pages:["deliveries","marketplace","documents","disputes"]},{label:"Analytics",pages:["reports"]}]});
