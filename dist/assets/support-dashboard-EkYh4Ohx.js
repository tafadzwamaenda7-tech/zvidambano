import"./auth-ui-CasobAI5.js";import{w as n,u as t,J as h,t as y,b as $,I as e,k as p,h as d,s as i,p as s,z as g,a as r,l as a,O as b,N as u,a2 as f,j as k,g as o,a3 as l,q as T,c as A,v as S,i as m,a0 as v,C as R,D as w,K as O,L as D}from"./core-B4swM7IO.js";n("s-tk-1001",{assign:{to:"ASSIGNED",tone:"blue",toast:"Ticket #1001 assigned to you",foot:t("Assigned to you","blue")},resolve:{to:"RESOLVED",tone:"green",toast:"Ticket #1001 resolved",foot:t("Resolved","green")}});n("s-tk-1002",{assign:{to:"ASSIGNED",tone:"blue",toast:"Ticket #1002 assigned to you",foot:t("Assigned to you","blue")}});n("s-tk-1003",{claim:{to:"IN PROGRESS",tone:"amber",toast:"Ticket #1003 claimed",foot:t("In progress","amber")}});n("s-tk-1004",{claim:{to:"IN PROGRESS",tone:"amber",toast:"Ticket #1004 claimed",foot:t("In progress","amber")}});n("s-tk-1005",{claim:{to:"IN PROGRESS",tone:"amber",toast:"Ticket #1005 claimed",foot:t("In progress","amber")}});n("s-tk-1006",{claim:{to:"IN PROGRESS",tone:"amber",toast:"Ticket #1006 claimed",foot:t("In progress","amber")}});h.replyTicket=()=>{y("Reply sent — the user will be notified")};h.openResolution=()=>{y("Resolution panel opened — track the outcome below")};const c={inbox:{id:"inbox",label:"Inbox",icon:e.support,title:"Support Inbox",sub:"Help Desk — resolve tickets within SLA",render:()=>`
      ${R({kick:"Support Desk · Today",title:"Support Inbox",sub:"4 open tickets require attention. Resolve within 24h to stay inside SLA — the fastest desk in the industry.",actions:`${o("Open Tickets","onlight","Opening full ticket list","#tickets")}${o("Users","onlight","Opening user directory","#users")}`,bg:"dash/hero-office.jpg",stats:[{l:"Open tickets",v:"4"},{l:"Avg first reply",v:"18m"},{l:"SLA compliance",v:"98%"}]})}
      ${w([{label:"New Ticket",icon:e.plus,toast:"Opening ticket composer",href:"#tickets"},{label:"Ticket Queue",icon:e.listings,badge:4,toast:"Opening ticket queue",href:"#tickets"},{label:"User Directory",icon:e.users,toast:"Opening user directory",href:"#users"},{label:"Disputes",icon:e.disputes,badge:2,toast:"Opening dispute queue",href:"#disputes"}])}
      ${p([{label:"Open Tickets",value:4,icon:e.listings,delta:"1 high priority",up:!1,spark:[6,5,7,4,5,4,4],foot:"Within SLA",open:"#tickets"},{label:"Avg First Reply",value:"18m",icon:e.clock,delta:"Faster than SLA",up:!0,spark:[40,30,25,22,20,19,18],foot:"Target 30m",open:"#inbox"},{label:"SLA Compliance",value:98,icon:e.shield,delta:"Last 30 days",up:!0,spark:[94,95,96,95,97,98,98],foot:"% within SLA",open:"#reports"},{label:"CSAT Score",value:"4.8",icon:e.quality,delta:"4.7 last month",up:!0,spark:[40,42,44,46,45,47,48],foot:"Out of 5.0",open:"#reports"}])}
      ${d(`
        ${i("Priority Feed","All tickets","Opening all tickets",void 0,"#tickets")}
        ${f([{icon:e.listings,tone:"danger",time:"08:42 AM",title:"Ticket #1001 — Payment not received",desc:"James (Farmer) · Contract #882 · Payment due Aug 2 · flagged as URGENT.",actions:`${o("Assign to Me","primary sm","Ticket assigned",void 0,"s-tk-1001","assign")}${o("Resolve","success sm","Ticket resolved",void 0,"s-tk-1001","resolve")}`,open:"#tickets"},{icon:e.messages,tone:"warn",time:"09:10 AM",title:"Ticket #1002 — Truck delayed on route",desc:"Sarah Moyo (Driver) · Truck DEF-456 · Stuck at tollgate, needs guidance.",actions:o("Assign to Me","primary sm","Ticket assigned",void 0,"s-tk-1002","assign"),open:"#tickets"},{icon:e.shop,tone:"default",time:"09:35 AM",title:"Ticket #1003 — Order not delivered",desc:"Peter (Offtaker) · Order #C-2207 · Input store order stuck in transit.",actions:o("Claim Ticket","outline sm","Ticket claimed",void 0,"s-tk-1003","claim"),open:"#tickets"},{icon:e.disputes,tone:"danger",time:"10:05 AM",title:"Dispute #D-104 — Quality rejected",desc:"Miller Corp rejected Load #882 · Moisture above 14% · Escalated to mediation.",open:"#disputes"}])}
        ${i("Quick Reply")}
        ${s({title:"Send a reply",icon:e.send,body:`
            ${m("Ticket",O(["#1001 — James (Farmer)","#1002 — Sarah Moyo (Driver)","#1003 — Peter (Offtaker)","#1004 — Grace (Vendor)","#1005 — Tendai (Offtaker)","#1006 — Chipo (Farmer)"]))}
            ${m("Message",v(3,"Type your reply…"))}
            <div class="dsh-btn-row">
              ${D("Attach file","ghost sm","*/*")}
              ${k("Send Reply","primary","replyTicket","","Reply sent — the user will be notified")}
            </div>`})}
      `,`
        ${s({title:"Today’s Stats",icon:e.spark,body:`
            ${g([{label:"Tickets opened",value:"12"},{label:"Tickets resolved",value:"8"},{label:"Escalated",value:"2"},{label:"Avg resolution",value:"3.2h"}])}
            ${r("ok","You are <b>2 replies ahead</b> of target today.")}`})}
        ${s({title:"New Sign-ups",icon:e.users,link:"View all",linkToast:"Opening user directory",linkHref:"#users",body:`
            ${a(e.users,"Chipo Moyo","Farmer · Ruwa · Just joined","NEW","plain",!1,"#users")}
            ${a(e.users,"Tendai Ncube","Offtaker · Bulawayo · Just joined","NEW","plain",!1,"#users")}
            ${a(e.users,"Grace Tembo","Vendor · Harare · Just joined","NEW","plain",!1,"#users")}`})}
        ${s({title:"SLA Health",icon:e.shield,body:b([{label:"First reply < 30m",pct:92},{label:"Resolve < 24h",pct:96},{label:"CSAT > 4.5",pct:90}])})}
      `)}
    `},tickets:{id:"tickets",label:"Tickets",icon:e.listings,title:"Tickets",sub:"Full support queue",render:()=>`
      ${i("Ticket Queue","Export","Exporting ticket report",void 0,"#reports")}
      ${A(["All","Open","Assigned","In Progress","Resolved","Escalated"],0,"tickets")}
      ${s({body:u(["Ticket","From","Subject","Priority","Status","Age"],[["#1001","James (Farmer)","Payment not received",t("Urgent","red"),t("Open","red"),"2h"],["#1002","Sarah (Driver)","Truck delayed on route",t("High","amber"),t("Open","red"),"3h"],["#1003","Peter (Offtaker)","Order not delivered",t("High","amber"),t("Open","red"),"5h"],["#1004","Grace (Vendor)","Listing approval stuck",t("Medium","blue"),t("Open","red"),"1d"],["#1005","Tendai (Offtaker)","Quality certificate missing",t("Medium","blue"),t("Assigned","blue"),"6h"],["#1006","Chipo (Farmer)","How do I list produce?",t("Low","gray"),t("In Progress","amber"),"4h"]],[5],["#tickets","#tickets","#tickets","#tickets","#tickets","#tickets"]),flush:!0})}
      ${d(`
        ${i("Open Ticket Detail")}
        ${S({key:"tk-1001",title:"#1001 · Payment not received",badge:"URGENT",badgeTone:"red",thumb:"grain",meta:"James (Farmer) · Contract #882 · Payment of <b>$4,200</b> due Aug 2, 2026.",foot:`${o("Assign to Me","primary sm","Ticket #1001 assigned to you",void 0,"s-tk-1001","assign")}${o("Mark Resolved","success sm","Ticket #1001 resolved",void 0,"s-tk-1001","resolve")}`})}
        ${m("Resolution note",v(3,"Describe the resolution…"))}
        <div class="dsh-btn-row">
          ${k("Send Reply & Close","primary","replyTicket","","Reply sent — the user will be notified")}
          ${o("Escalate","ghost sm","Ticket escalated to ZVIDA admin")}
        </div>
      `,`
        ${i("Status Guide")}
        ${s({body:`
            ${a(e.check,"Open","Awaiting first reply",t("Red","red"))}
            ${a(e.clock,"Assigned","Owned by an agent",t("Blue","blue"))}
            ${a(e.spark,"In Progress","Being worked on",t("Amber","amber"))}
            ${a(e.shield,"Resolved","Closed after reply",t("Green","green"))}`})}
        ${r("info","Tickets marked <b>urgent</b> are surfaced to the ZVIDA Control Tower automatically.")}
      `)}
    `},users:{id:"users",label:"Users",icon:e.users,title:"User Directory",sub:"Every party on the exchange",render:()=>`
      ${p([{label:"Total Users",value:46,icon:e.users,delta:"12 this month",up:!0,spark:[10,14,18,22,28,36,46],foot:"Across all roles",open:"#users"},{label:"Farmers",value:22,icon:e.farm,delta:"48% of platform",up:!0,spark:[8,10,12,15,18,20,22],foot:"Active suppliers",open:"#users"},{label:"Verified Partners",value:9,icon:e.shield,delta:"Brokers & vendors",up:!0,spark:[4,5,6,7,7,8,9],foot:"KYC completed",open:"#users"},{label:"Support Tickets",value:4,icon:e.listings,delta:"2 escalated",up:!1,spark:[5,4,6,3,4,3,4],foot:"Open today",open:"#tickets"}])}
      ${i("All Users","Add user","Opening add user form")}
      ${s({body:u(["User","Role","Location","Status","Member since"],[[`${l("J",28)} James Moyo`,"Farmer","Ruwa",t("Active","green"),"Jan 2024"],[`${l("S",28)} Sarah Moyo`,"Driver","Harare",t("Active","green"),"Mar 2024"],[`${l("P",28)} Peter Dube`,"Offtaker","Harare",t("Active","green"),"Feb 2024"],[`${l("G",28)} Grace Tembo`,"Vendor","Harare",t("Active","green"),"Jun 2025"],[`${l("T",28)} Tendai Ncube`,"Offtaker","Bulawayo",t("Pending KYC","amber"),"Jul 2026"],[`${l("C",28)} Chipo Moyo`,"Farmer","Ruwa",t("New","blue"),"Today"]],[0],["#users","#users","#users","#users","#users","#users"]),flush:!0})}
      ${d(`
        ${i("Recent Activity")}
        ${s({body:`
            ${a(e.users,"Chipo Moyo signed up","Farmer · Ruwa · Just now","","plain",!1,"#users")}
            ${a(e.users,"Tendai Ncube signed up","Offtaker · Bulawayo · 2h ago","","plain",!1,"#users")}
            ${a(e.quality,"Grace Tembo verified","Vendor KYC completed · 5h ago","","plain",!1,"#users")}
            ${a(e.disputes,"Peter Dube opened dispute","Load #882 quality · 3h ago","","plain",!1,"#disputes")}`})}
      `,`
        ${s({title:"Role Breakdown",icon:e.users,body:b([{label:"Farmers",pct:48},{label:"Offtakers",pct:22},{label:"Vendors",pct:11},{label:"Drivers",pct:13},{label:"Brokers",pct:6}])})}
        ${s({title:"Profile preview",icon:e.farm,body:T([{k:"Name",v:"James Moyo"},{k:"Role",v:"Farmer"},{k:"Location",v:"Farm 42, Ruwa"},{k:"GPS",v:"-17.883, 31.033"},{k:"Status",v:`${t("Active","green")}`}])})}
      `)}
    `},disputes:{id:"disputes",label:"Disputes",icon:e.disputes,title:"Disputes",sub:"Mediation queue",render:()=>`
      ${r("warn","<b>2 disputes</b> in mediation. Resolution panels are open — both parties are awaiting a decision.","View guidance","Opening dispute playbook")}
      ${p([{label:"Open Disputes",value:2,icon:e.disputes,delta:"1 escalated",up:!1,spark:[1,2,2,3,2,2,2],foot:"Needs decision",open:"#disputes"},{label:"Resolved (30d)",value:9,icon:e.check,delta:"Avg 2.1 days",up:!0,spark:[4,5,6,7,8,8,9],foot:"Both parties notified",open:"#reports"}])}
      ${i("In Mediation")}
      ${s({body:u(["Ref","Parties","Issue","Age","Status"],[["D-104","James vs Miller Corp","Moisture above 14% on Load #882",t("Escalated","red"),"2d"],["D-103","Peter vs Sarah","Delivery window missed by 4h",t("Reviewing","amber"),"1d"]],[4],["#disputes","#disputes"]),flush:!0})}
      ${d(`
        ${i("Dispute Detail — D-104")}
        ${s({title:"Quality rejection on Load #882",icon:e.disputes,body:`
            ${f([{icon:e.disputes,tone:"danger",time:"Jul 30",title:"Miller Corp rejected Load #882",desc:"Reported moisture at 14.8% — above the 14% contract limit.",open:"#disputes"},{icon:e.messages,tone:"default",time:"Jul 31",title:"James disputes the reading",desc:"Weighbridge certificate shows 13.9% at origin. Evidence attached.",open:"#disputes"}])}
            ${r("info","Both weighbridge readings are on file. Recommend independent re-sampling at destination.")}
            <div class="dsh-btn-row">
              ${k("Open Resolution Panel","primary","openResolution","","Resolution panel opened — track the outcome below")}
              ${o("Mediate","ghost sm","Mediation session scheduled")}
            </div>`})}
      `,`
        ${i("Mediation Playbook")}
        ${s({body:`
            ${a(e.check,"1 · Verify evidence","Both weighbridge certificates")}
            ${a(e.spark,"2 · Escalate if needed","Surfaced to Control Tower")}
            ${a(e.shield,"3 · Decide & notify","Notify both parties")}`})}
        ${r("ok","Resolved disputes are surfaced to the farmer’s <b>Performance</b> page as rating input.")}
      `)}
    `},reports:{id:"reports",label:"Reports",icon:e.reports,title:"Reports",sub:"Desk performance",render:()=>`
      ${p([{label:"Tickets This Month",value:148,icon:e.listings,delta:"+14% vs last",up:!0,spark:[20,26,24,30,34,32,40],foot:"All channels",open:"#reports"},{label:"Avg Resolution Time",value:"3.2h",icon:e.clock,delta:"Target 24h",up:!0,spark:[40,38,34,30,28,24,22],foot:"Per ticket",open:"#reports"},{label:"SLA Compliance",value:98,icon:e.shield,delta:"Above 95% target",up:!0,spark:[90,92,94,95,97,97,98],foot:"% within SLA",open:"#reports"},{label:"CSAT",value:"4.8",icon:e.quality,delta:"127 responses",up:!0,spark:[42,43,45,46,47,47,48],foot:"Out of 5.0",open:"#reports"}])}
      ${d(`
        ${i("Ticket Volume")}
        ${s({body:b([{label:"Payments",pct:32},{label:"Delivery & tracking",pct:26},{label:"Listings & approvals",pct:18},{label:"Quality & disputes",pct:14},{label:"Account & access",pct:10}])})}
        ${i("Channel Mix")}
        ${s({body:u(["Channel","Tickets","CSAT"],[["In-app chat","86","4.9"],["Email","34","4.6"],["Phone","22","4.8"],["WhatsApp","6","4.7"]],[1]),flush:!0})}
      `,`
        ${i("Monthly Snapshot")}
        ${s({body:`
            ${g([{label:"Tickets opened",value:"148"},{label:"Tickets resolved",value:"139"},{label:"Escalated to ZVIDA",value:"7"},{label:"Median reply",value:"18m"}])}
            ${r("ok","98% SLA compliance — keep it up.")}`})}
        ${i("Download")}
        ${s({body:`
            ${a(e.file,"Tickets_Jul2026.csv","All support tickets","DL","plain",!1,"#reports")}
            ${a(e.file,"CSAT_Jul2026.csv","Satisfaction responses","DL","plain",!1,"#reports")}
            ${a(e.file,"Escalations_Jul2026.csv","Escalated cases","DL","plain",!1,"#reports")}`})}
      `)}
    `}};$({name:"Support",roleLabel:"Support",company:"ZVIDA Support Desk",initials:"S",accent:"#7c3aed",accentHover:"#6d28d9",accentLight:"#f5f3ff",accentRgb:"124, 58, 237",gradientEnd:"#a78bfa",pages:[c.inbox,c.tickets,c.users,c.disputes,c.reports],navGroups:[{label:"Operations",pages:["inbox","tickets","disputes"]},{label:"Platform",pages:["users","reports"]}]});
