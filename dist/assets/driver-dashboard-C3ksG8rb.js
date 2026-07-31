import"./styles-B_rwOSkn.js";import{r as k,w as L,b as P,J as b,t as v,d as E,I as e,m as I,k as f,a as g,s as l,c as T,e as N,f as R,p as o,j as c,l as i,g as u,h as A,i as V,n as W,o as C,q as w,u as D,v as j,x as y,y as m,z as S,A as B,B as F,C as J}from"./core-DJvTQki7.js";b.callDispatch=()=>{v("Dialing ZVIDA dispatch +263 24 277 8800 — placing the call from your phone","info")};b.openWhatsApp=()=>{v("Opening WhatsApp — +263 77 000 8800","info")};b.saveSettings=()=>{const t=document.querySelector('[data-js="saveSettings"]');t&&(t.textContent="Saved",t.disabled=!0),v("Payment settings saved")};b.downloadStatement=()=>{E("d-stmt"),v("Statement downloaded")};k("d-stmt","Statement_Jul2026.csv",["Trip,Route,Amount,Date,Status","LD-2042,Norton to Chegutu,180,Jul 30,Paid","LD-2041,Chinhoyi to Norton,210,Jul 29,Paid","LD-2039,Norton to Kadoma,160,Jul 28,Paid","LD-2037,Harare to Mutare,240,Jul 27,Paid"].join(`
`),"text/csv");k("d-lic","Driver_License_JohnDoe.pdf",O(["ZVIDAMBANO DRIVER RECORDS","","Driver: John Doe","License: DL-2024-0042","Class: Heavy Commercial (C)","Valid until: Dec 2026","Status: Verified"]),"application/pdf");k("d-ins","Insurance_ABC123.pdf",O(["ZVIDAMBANO VEHICLE RECORDS","","Vehicle: ABC-123 Scania R450","Cover: Comprehensive","Insured value: $85,000","Status: Active"]),"application/pdf");function O(t){const a=d=>d.replace(/[()\\]/g,""),n=t.map(d=>`BT /F1 11 Tf 72 ${720-t.indexOf(d)*16} Td (${a(d)}) Tj ET`).join(`
`),s=[],r=[];let $=0;const p=d=>{s.push(d),r.push($),$+=d.length};return p(`%PDF-1.4
`),p(`1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
`),p(`2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
`),p(`3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
`),p(`4 0 obj<</Length ${n.length}>>stream
${n}
endstream
endobj
`),p(`5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
`),p(`xref
0 6
0000000000 65535 f 
`),r.slice(1).forEach(d=>p(String(d).padStart(10,"0")+` 00000 n 
`)),p(`trailer<</Size 6/Root 1 0 R>>
startxref
${$}
%%EOF`),s.join("")}L("d-hero-start",{start:{nav:"#trips",toast:"Loading started — GPS tracking on"}});L("d-delay",{report:{done:"Reported",toast:"Delay reported — dispatch notified"}});const h={today:{id:"today",label:"Today",icon:e.dashboard,title:"Today",sub:"John Doe · Truck ABC-123",render:()=>{const t=y().filter(a=>a.driver==="John Doe"&&!["PAID","CANCELLED"].includes(a.status));return`
      <div class="dsh-offline"><span class="pulse"></span> Online · Last sync 08:00 AM</div>
      ${F({kick:"Online · GPS tracking active",title:"Good morning, John",sub:"Two loads scheduled today. Weighbridge steps are ready when you reach the farm.",actions:`${u("Start Load","primary","Loading started — GPS tracking on",void 0,"d-hero-start","start")}${u("Contact ZVIDA","onlight","Opening ZVIDA support","#support")}`,bg:"dash/hero-truck.jpg",stats:[{l:"Trips (month)",v:"23"},{l:"Earnings (month)",v:"$1,820"},{l:"On-time rate",v:"97%"}]})}
      ${J([{label:"Start Load",icon:e.truck,toast:"Opening first weight capture",href:"#weighbridge"},{label:"Upload First Weight",icon:e.camera,toast:"Opening weighbridge capture",href:"#weighbridge"},{label:"Confirm Offload",icon:e.check,toast:"Opening second weight capture",href:"#weighbridge"},{label:"Report Delay",icon:e.alert,toast:"Delay reported — dispatch notified",wf:"d-delay",action:"report"}])}
      ${f([{label:"Trips (Month)",value:23,icon:e.trips,delta:"+3 this week",up:!0,spark:[10,14,12,18,20,22,23],foot:"Total trips",open:"#trips"},{label:"Earnings (Month)",value:"$1,820",icon:e.earnings,delta:"+15% vs last month",up:!0,spark:[20,26,30,34,40,44,50],foot:"Before deposits",open:"#earnings"},{label:"Pending Deposits",value:"$200",icon:e.wallet,delta:`${t.length} active loads`,up:!1,spark:[12,14,13,16,15,18,17],foot:"Paid after offload",open:"#earnings"},{label:"On-time Rate",value:97,icon:e.shield,delta:"Across 23 trips",up:!0,spark:[90,92,94,93,95,96,97],foot:"% of trips",open:"#trips"}])}
      ${A(`
        ${l("Today’s Consignments","View all","Opening all trips",void 0,"#trips")}
        ${t.length?t.map(a=>m(a,"driver")).join(""):g("ok","No active consignments today.")}
      `,`
        ${o({title:"Consignment Snapshot",icon:e.trips,body:S([{label:"Active loads",value:String(t.length)},{label:"Loading / first weight",value:String(t.filter(a=>["LOADING","WEIGHED_1"].includes(a.status)).length)},{label:"Offloading / second weight",value:String(t.filter(a=>["OFFLOADING","WEIGHED_2"].includes(a.status)).length)},{label:"Awaiting payment",value:String(t.filter(a=>a.status==="PENDING_PAYMENT").length)}])})}
        ${o({title:"Earnings Snapshot",icon:e.earnings,body:`
            ${i(e.finance,"LD-2042 · Norton → Chegutu","Paid · 2 hours ago","+$180","pos",!1,"#earnings")}
            ${i(e.finance,"LD-2041 · Chinhoyi → Norton","Paid · Yesterday","+$210","pos",!1,"#earnings")}
            ${i(e.wallet,"Deposits pending","Awaiting offload confirmation","+$200","pos",!1,"#earnings")}`,link:"View earnings",linkToast:"Opening earnings page",linkHref:"#earnings"})}
        ${o({title:"Support",icon:e.messages,body:`${i(e.phone,"ZVIDA dispatch","+263 4 123 4567",c("Call","ghost sm","callDispatch","","Dialing ZVIDA dispatch…"),"plain",!1,"#support")}
            ${i(e.messages,"WhatsApp group","Region 3 drivers · active",c("Open","ghost sm","openWhatsApp","","Opening WhatsApp…"),"plain",!1,"#support")}`})}
      `)}
    `}},trips:{id:"trips",label:"My Trips",icon:e.trips,title:"My Trips",sub:"History & milestones",render:()=>{const t=y().filter(s=>s.driver==="John Doe"),a=t.filter(s=>!["PAID","CANCELLED"].includes(s.status)),n=t.filter(s=>["PAID","CANCELLED"].includes(s.status));return`
      ${B([{label:"Active",badge:a.length,active:!0},{label:"Completed",badge:n.length+23}],"dtrips")}
      <div data-tab-group="dtrips" data-tab="Active">
      ${a.length?a.map(s=>m(s,"driver")).join(""):g("ok","No active trips — new consignments will appear here.")}
      </div>
      <div data-tab-group="dtrips" data-tab="Completed" style="display:none">
      ${n.length?n.map(s=>m(s,"driver")).join(""):""}
      ${l("Trip History")}
      ${o({body:`
          ${i(e.route,"LD-2042 · Norton → Chegutu","Completed · 2 hours ago","+$180","pos",!1,"#earnings")}
          ${i(e.route,"LD-2041 · Chinhoyi → Norton","Completed · Yesterday","+$210","pos",!1,"#earnings")}
          ${i(e.route,"LD-2039 · Norton → Kadoma","Completed · 2 days ago","+$160","pos",!1,"#earnings")}
          ${i(e.route,"LD-2037 · Harare → Mutare","Completed · 3 days ago","+$240","pos",!1,"#earnings")}`})}
      </div>
    `}},weighbridge:{id:"weighbridge",label:"Weighbridge",icon:e.weighbridge,title:"Weighbridge",sub:"First & second weights",render:()=>{const t=y().filter(n=>n.driver==="John Doe"&&!["PAID","CANCELLED"].includes(n.status)),a=t.filter(n=>["LOADING","WEIGHED_1","OFFLOADING"].includes(n.status));return`
      ${g("info","Record the first weight at loading and the second weight at offloading. Scale loads use bucket counts. The system calculates net and amount automatically.")}
      ${l("Weighbridge Queue","My trips","Opening your trips",t.length,"#trips")}
      ${(a.length?a:t).length?(a.length?a:t).map(n=>m(n,"driver")).join(""):g("ok","No loads at the scale right now.")}
      ${l("System Calculates")}
      ${o({body:S([{label:"Weighbridge",value:"Net = W2 − W1"},{label:"Scale",value:"Bags × 50 + buckets × bucket size"},{label:"Amount",value:"Net tonnes × rate"}])})}
    `}},earnings:{id:"earnings",label:"Earnings",icon:e.earnings,title:"Earnings",sub:"Payouts & deposit status",render:()=>`
      ${f([{label:"Earnings (Month)",value:"$1,820",icon:e.earnings,delta:"+15% vs last month",up:!0,spark:[20,26,30,34,40,44,50],foot:"Across all trips",open:"#earnings"},{label:"Trips Completed",value:23,icon:e.trips,delta:"+3 this week",up:!0,spark:[12,14,16,18,20,21,23],foot:"This month",open:"#trips"},{label:"Pending Deposits",value:"$200",icon:e.wallet,delta:"2 loads awaiting offload",up:!1,spark:[10,12,14,13,15,16,17],foot:"Loads #882 · #883",open:"#trips"},{label:"On-time Rate",value:97,icon:e.shield,delta:"Across 23 trips",up:!0,spark:[90,92,94,93,95,96,97],foot:"% of trips",open:"#trips"}])}
      ${l("Deposit Status — Load #882")}
      ${j({title:"Deposit schedule",thumb:"grain",open:"#earnings",meta:`Loading deposit: <b>$100</b> ${D("Paid","green")}<br/>Final deposit (offloading): <b>$100</b> ${D("Pending","amber")}`,foot:u("Open Load #882","ghost sm","Opening load #882","#trips")})}
      ${l("Payment History")}
      ${o({body:`
          ${i(e.finance,"LD-2042 · Norton → Chegutu","Paid · 2 hours ago","+$180","pos",!1,"#trips")}
          ${i(e.finance,"LD-2041 · Chinhoyi → Norton","Paid · Yesterday","+$210","pos",!1,"#trips")}
          ${i(e.finance,"LD-2039 · Norton → Kadoma","Paid · 2 days ago","+$160","pos",!1,"#trips")}
          ${i(e.finance,"LD-2037 · Harare → Mutare","Paid · 3 days ago","+$240","pos",!1,"#trips")}`})}
      <div class="dsh-btn-row" style="margin-top:12px">${c("Download Statement","outline","downloadStatement","","Statement downloaded")}</div>
    `},settings:{id:"settings",label:"Settings",icon:e.settings,title:"Settings",sub:"Profile, vehicle & payments",render:()=>`
      ${A(`
        ${l("Profile")}
        ${o({title:"Personal",icon:e.users,body:w([{k:"Name",v:"John Doe"},{k:"Phone",v:"+263 77 123 4567"},{k:"Email",v:"john.doe@driver.com"},{k:"License",v:`DL-2024-0042 ${D("Verified","green")}`}])})}
        ${l("Vehicle")}
        ${o({title:"Truck",icon:e.truck,body:w([{k:"Truck",v:"ABC-123 · Scania R450 (White)"},{k:"Trailer",v:"XYZ-789 · Grain Tipper, 35t"}])})}
      `,`
        ${l("Payment Details")}
        ${o({title:"Payouts",icon:e.wallet,body:`
            ${V("Bank / Mobile money",W("EcoCash +263 77 123 4567"))}
            <div class="dsh-btn-row">${c("Save Changes","primary","saveSettings","","Settings saved")}</div>`})}
        ${o({title:"Documents",icon:e.file,body:`${i(e.file,"Driver license","Valid until Dec 2026",C("View","ghost sm","d-lic"),"plain")}
            ${i(e.shield,"Insurance","Comprehensive · ABC-123",C("View","ghost sm","d-ins"),"plain")}`})}
      `)}
    `},support:{id:"support",label:"Support",icon:e.support,title:"Support",sub:"ZVIDA dispatch & driver help",render:()=>`
      ${f([{label:"Dispatch Line",value:"24/7",icon:e.phone,delta:"Always available",up:!0,spark:[10,10,10,10,10,10,10],foot:"+263 24 277 8800",open:"#support"},{label:"Open Queries",value:1,icon:e.messages,delta:"Fuel advance · resolved",up:!0,spark:[3,2,2,1,1,1,1],foot:"Avg reply 15 min",open:"#support"}])}
      ${o({title:"Contact ZVIDA dispatch",icon:e.phone,body:`
          ${g("info","For emergencies, load issues or trip changes, dispatch is on call 24/7.")}
          <div class="dsh-btn-row">
            ${c("Call Dispatch","primary","callDispatch","","Dialing ZVIDA dispatch…")}${c("WhatsApp","outline","openWhatsApp","","Opening WhatsApp…")}
          </div>
          ${i(e.phone,"Dispatch line","24/7 · +263 24 277 8800",c("Call","ghost sm","callDispatch","","Dialing ZVIDA dispatch…"),"plain")}
          ${i(e.messages,"WhatsApp","+263 77 000 8800",c("Chat","ghost sm","openWhatsApp","","Opening WhatsApp…"),"plain")}`})}
      ${o({title:"FAQ",icon:e.support,body:`
          ${i(e.trips,"How do weighbridge steps work?","View the guide on your trips page",u("Open","ghost sm","Opening trips","#trips"))}
          ${i(e.earnings,"When are deposits paid?","50% at loading, 50% after offload",u("Open","ghost sm","Opening earnings","#earnings"))}
          ${i(e.shield,"What if I hit a delay?","Report it from Today — dispatch recalculates",u("Open","ghost sm","Opening today","#today"))}`})}
    `},marketplace:{id:"marketplace",label:"Marketplace",icon:e.shop,title:"Marketplace Deliveries",sub:"Ship farmer orders",render:()=>{const t=I(),a=t.filter(r=>r.status==="SHIPPED"),n=t.filter(r=>r.status==="OUT_FOR_DELIVERY"),s=t.filter(r=>["DELIVERED","PAID"].includes(r.status));return`
      ${f([{label:"Ready to Pick Up",value:a.length,icon:e.box,delta:"Shipped by sellers",up:!0,spark:[1,0,1,2,1,1,a.length],foot:"Pick up today",open:"#marketplace"},{label:"Out for Delivery",value:n.length,icon:e.route,delta:"En route to buyers",up:!1,spark:[0,1,1,0,2,1,n.length],foot:"Track until signed",open:"#marketplace"},{label:"Delivered",value:s.length,icon:e.check,delta:"Signed for",up:!0,spark:[2,3,3,4,4,5,s.length],foot:"Past marketplace runs",open:"#marketplace"}])}
      ${g("info","Pick up shipped orders from the vendor and deliver them to the farm gate. Confirm delivery when the buyer signs.")}
      ${l("Ready to Deliver","View trips","Opening your trips",a.length+n.length,"#trips")}
      ${T(["All","Active","Pending","Loading","Offloading","Complete"],0,"dmkt")}
      ${t.map(r=>N(r,"driver","dmkt",R(r.status))).join("")}
      ${a.length+n.length===0?g("ok","No marketplace deliveries right now. New shipped orders will appear here."):""}
    `}}};P({name:"John",roleLabel:"Driver",company:"John Doe · Transporter",initials:"J",accent:"#ea580c",accentHover:"#c2410c",accentLight:"#fff7ed",accentRgb:"234, 88, 12",gradientEnd:"#f97316",pages:[h.today,h.marketplace,h.trips,h.weighbridge,h.earnings,h.settings,h.support]});
