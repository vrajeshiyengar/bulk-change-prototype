(()=>{
'use strict';
/* ================= utilities ================= */
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nf=new Intl.NumberFormat('en-US');
const fmtN=n=>nf.format(Math.round(n));
const clone=o=>JSON.parse(JSON.stringify(o));
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const D=(y,m,d)=>new Date(y,m,d);
const fmtD=(d,y)=>d?`${d.getDate()} ${MONTHS[d.getMonth()]}${y?' '+d.getFullYear():''}`:'';
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const fromIso=s=>{const p=String(s||'').split('-').map(Number);return p.length===3&&p[0]?D(p[0],p[1]-1,p[2]):null};
const fmtIso=s=>{const d=fromIso(s);return d?fmtD(d,true):''};
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const TODAY=D(2026,10,20), NEXTP=D(2026,11,1);
const NOWL='20 Nov 2026, 11:20 IST';
function runFor(dt){const y=dt.getFullYear(),m=dt.getMonth();return dt.getDate()<=15?D(y,m,15):D(y,m+1,0)}
function nextRun(run){const y=run.getFullYear(),m=run.getMonth();return run.getDate()===15?D(y,m+1,0):D(y,m+1,15)}
function cutoffOf(run){const c=new Date(run);c.setDate(c.getDate()-3);return c}
function payInfo(dt){let run=runFor(dt),retro=false;if(run<TODAY){retro=true;run=runFor(TODAY)}return{run,cutoff:cutoffOf(run),retro,prorated:!retro&&dt.getDate()!==1&&dt.getDate()!==16,next:nextRun(run)}}
const initials=n=>String(n).split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();
const pl=(n,a,b)=>`${fmtN(n)} ${n===1?a:(b||a+'s')}`;
const norm2=s=>String(s).toLowerCase().replace(/[^a-z0-9]/g,'');
const slug=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
const FUNNEL='<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M1 2h10L7.2 6.6V10L4.8 11V6.6z" fill="currentColor"/></svg>';

/* ================= domain constants ================= */
const DEPTS=['Customer Support','Engineering','Sales','Marketing','Product','Design','Finance','People','IT'];
const DEPT_W=[['Customer Support',22],['Engineering',25],['Sales',15],['Marketing',9],['Product',7],['Design',6],['Finance',5],['People',6],['IT',5]];
const TEAMS={'Customer Support':['Tier 1','Tier 2','Escalations'],'Engineering':['Platform','Payments','Growth','Infrastructure'],'Sales':['SMB','Mid-market','Enterprise'],'Marketing':['Brand','Demand Gen','Product Marketing'],'Product':['Core HR','Payroll','Apps'],'Design':['Product Design','Research'],'Finance':['FP&A','Accounting'],'People':['HR Ops','Talent'],'IT':['Workplace IT','Security'],'Executive':['Office of the CEO']};
const ALLTEAMS=[...new Set(Object.values(TEAMS).flat())];
const LOC={'San Francisco':{state:'CA',country:'US'},'New York':{state:'NY',country:'US'},'Austin':{state:'TX',country:'US'},'Denver':{state:'CO',country:'US'},'Toronto':{state:'ON',country:'CA'}};
const LOCS=Object.keys(LOC);
const FX={USD:1,CAD:1.37,GBP:0.79,EUR:0.92,INR:84.2,AUD:1.53,SGD:1.34};const FX_NOTE='the company rates set by Priya Shah (Finance) in Settings › Currencies on 20 Nov 2026';
const curCode=e=>LOC[e.location].country==='CA'?'CAD':'USD';const conv=(a,from,to)=>a/FX[from]*FX[to];const usd=(e,v)=>conv(v,curCode(e),'USD');
const PAYTYPES=['Hourly','Salaried'];
const PTO=['US Standard (15 days)','US Senior (20 days)','Canada · Ontario (2 weeks)','Canada · Ontario 2027 (3 weeks)','Unlimited (exempt)'];
const ptoCountry=p=>String(p).startsWith('Canada')?'CA':String(p).startsWith('US')?'US':null;
const LAPTOPS=['MacBook Pro 14 M1','MacBook Pro 14 M3','MacBook Pro 16 M3','MacBook Air 13 M2','Dell Latitude 7440'];
const BENEFITS=['Standard','Executive','Part-time','Canada · Standard'];
const LOC_W=[['San Francisco',36],['New York',22],['Austin',17],['Denver',13],['Toronto',12]];
const LEVELS=['L1','L2','L3','L4','L5','L6','L7','L8'];
const LV_W=[['L1',10],['L2',25],['L3',25],['L4',18],['L5',12],['L6',6],['L7',3],['L8',1]];
const RATINGS=['Exceeds','Meets','Partially meets','Below'];
const RT_W=[['Exceeds',22],['Meets',58],['Partially meets',15],['Below',5]];
const BANDS={L1:[55,70,85],L2:[70,88,105],L3:[90,112,135],L4:[115,140,165],L5:[140,170,200],L6:[170,205,240],L7:[205,245,285],L8:[245,295,345]};
const DMULT={'Customer Support':.75,'Engineering':1.15,'Product':1.15,'Design':1.05,'Sales':1,'Marketing':1,'Finance':1,'People':.95,'IT':.95,'Executive':1.4};
const EQ={L1:0,L2:0,L3:1500,L4:4000,L5:8000,L6:15000,L7:30000,L8:60000};
const ROLE={'Engineering':'Software Engineer','Sales':'Account Executive','Marketing':'Marketing Manager','Product':'Product Manager','Design':'Product Designer','Finance':'Financial Analyst','People':'People Partner','IT':'IT Engineer'};
const FIRST=['Lavonne','Emmitt','Kenji','Tobias','Marisol','Hollis','Anneliese','Cyrus','Delphine','Ezekiel','Florence','Gideon','Harriet','Ismael','Juniper','Kasimir','Leontine','Maverick','Nadia','Osvaldo','Petra','Quincy','Rosalind','Silas','Theodora','Ulrich','Verna','Wendell','Ximena','Yusuf','Zelda','Arjun','Mei','Tomas','Ines','Kofi','Sanna','Rhett','Ayla','Bram','Celeste','Dario','Elva','Lorine','Garnet','Mafalda','Otis','Reva'];
const LAST=['Kshlerin','Wuckert','Hackett','Runolfsdottir','Bergstrom','Schaden','Gutkowski','Haley','Lind','Kub','Turcotte','Rau','Bode','Hilpert','Mayer','Rempel','Zieme','Ondricka','Cormier','Dicki','Abernathy','Bechtelar','Collier','Daugherty','Ebert','Funk','Gerlach','Heller','Jacobi','Koepp','Larkin','Mraz','Nader','Oberbrunner','Prosacco','Quigley','Reichert','Stiedemann','Tromp','Upton','Volkman','Wehner','Yost','Considine'];
const lvlN=l=>parseInt(String(l).slice(1),10)||0;
function ladder(dept,level){const n=lvlN(level);if(dept==='Executive')return'Chief Executive Officer';
  if(dept==='Customer Support')return['Support Associate','Support Specialist','Senior Support Specialist','Manager Customer Support','Senior Manager Customer Support','Director Customer Support','Head of Customer Support','VP Customer Support'][n-1];
  const R=ROLE[dept];return[`Associate ${R}`,R,`Senior ${R}`,`Staff ${R}`,`Principal ${R}`,`Director, ${dept}`,`Head of ${dept}`,`VP ${dept}`][n-1]}
const hourlyRole=(dept,level)=>dept==='Customer Support'&&lvlN(level)<=4;
const curOf=e=>LOC[e.location].country==='CA'?'CA$':'$';
const r5=x=>Math.round(x*2)/2, r100=x=>Math.round(x/100)*100;
function band(e,level,per,dept,loc){const b=BANDS[level]||BANDS.L3;const m=DMULT[dept||e.department]||1;const cad=LOC[loc||e.location].country==='CA'?1.25:1;
  const a=b.map(x=>x*1000*m*cad);if(per==='Hourly')return{min:r5(a[0]/2080),mid:r5(a[1]/2080),max:r5(a[2]/2080)};return{min:r100(a[0]),mid:r100(a[1]),max:r100(a[2])}}
const roundComp=(v,per)=>per==='Hourly'?r5(v):r100(v);
const annual=(v,per)=>per==='Hourly'?v*2080:v;

/* ================= fake company ================= */
let EMP=[],EMPI={},CONFLICT=new Set(),NAMEIDX={};
function gen(N){
  const r=rng(N*7+3);const pick=a=>a[Math.floor(r()*a.length)];
  const wp=items=>{let x=r()*items.reduce((s,i)=>s+i[1],0);for(const[v,w]of items){x-=w;if(x<=0)return v}return items[0][0]};
  const E=[],used={};
  function mk(o){const id='E'+(1001+E.length);const key=(o.first+o.last).toLowerCase();const n=used[key]=(used[key]||0)+1;
    const e={id,first:o.first,last:o.last,name:o.first+' '+o.last,department:o.dept,team:o.team||pick(TEAMS[o.dept]),level:o.level,location:o.loc||'San Francisco',
      rating:o.rating||'Meets',etype:o.etype||'Full-time',status:o.status||'Active',languages:o.languages||['English'],manager:null};
    e.email=(o.email||`${o.first}.${o.last}${n>1?n-1:''}@acmecorp.com`).toLowerCase();
    e.title=o.title||ladder(o.dept,o.level);e.per=o.per||(hourlyRole(o.dept,o.level)?'Hourly':'Salaried');
    const b=band(e,e.level,e.per);e.compensation=o.comp??roundComp(b.min+(b.max-b.min)*(.22+r()*.5),e.per);
    e.bonus=o.bonus??(lvlN(e.level)>=5?r100(annual(e.compensation,e.per)*(.1+r()*.1)):0);
    e.equity=o.equity??Math.round(EQ[e.level]*(.8+r()*.4)/100)*100;
    e.startDate=o.start||iso(addDays(TODAY,-Math.round(20+Math.pow(r(),1.4)*3600)));
    const tech=['Engineering','Product','Design'].includes(e.department);const ca=LOC[e.location].country==='CA';
    e.timeOff=ca?'Canada · Ontario (2 weeks)':lvlN(e.level)>=6?'US Senior (20 days)':'US Standard (15 days)';
    e.laptop=tech?(r()<.5?'MacBook Pro 14 M1':'MacBook Pro 14 M3'):(r()<.6?'MacBook Air 13 M2':'Dell Latitude 7440');e.refresh=iso(addDays(TODAY,-Math.round(30+r()*1500)));
    e.benefits=ca?'Canada · Standard':lvlN(e.level)>=7?'Executive':'Standard';e.oncall=e.department==='Engineering'?['None','None','Primary','Secondary'][Math.floor(r()*4)]:'None';e.spotBonus=0;
    e.quota=e.department==='Sales'?Math.round(45+r()*90):'';e.activeDays=Math.floor(r()*8);e.lastActive=iso(addDays(TODAY,-Math.floor(Math.pow(r(),3)*120)));
    e.costCenter='CC-'+(100+Math.max(0,DEPTS.indexOf(e.department)));E.push(e);return e}
  mk({first:'Odessa',last:'Marvin',dept:'Executive',level:'L8',title:'Chief Executive Officer',rating:'Exceeds',team:'Office of the CEO',start:'2016-03-01'});
  mk({first:'Fleda',last:'Pfannerstill',dept:'Customer Support',level:'L7',team:'Escalations',languages:['English','Spanish'],start:'2018-06-11'});
  mk({first:'Virge',last:'Considine',dept:'Customer Support',level:'L4',team:'Tier 1',title:'Manager Customer Support',per:'Hourly',comp:50,email:'virge.considine0@acmecorp.com',rating:'Exceeds',equity:0,bonus:0,start:'2021-09-20'});
  mk({first:'Priya',last:'Shah',dept:'Finance',level:'L7',team:'FP&A',start:'2019-01-07'});
  mk({first:'Raj',last:'Patel',dept:'IT',level:'L6',team:'Security',start:'2020-04-13'});
  mk({first:'Jason',last:'Lee',dept:'Product',level:'L4',team:'Core HR',loc:'New York',start:'2023-02-27'});
  mk({first:'Dana',last:'Okuneva',dept:'People',level:'L6',team:'HR Ops',start:'2019-08-19'});
  while(E.length<N){const dept=wp(DEPT_W);const level=wp(LV_W);const pr=r();
    mk({first:pick(FIRST),last:pick(LAST),dept,level,loc:wp(LOC_W),rating:wp(RT_W),etype:r()<.04?'Contractor':'Full-time',
      status:r()<.02?'On leave':(r()<.012?'Scheduled termination':'Active'),languages:pr<.5?['English']:pr<.72?['English','Spanish']:pr<.9?['English','French']:['English','Spanish','French']})}
  const ceo=E[0];const byDept={};E.forEach(e=>{if(e!==ceo)(byDept[e.department]=byDept[e.department]||[]).push(e)});
  Object.values(byDept).forEach(list=>{const head=list.reduce((a,b)=>lvlN(b.level)>lvlN(a.level)?b:a,list[0]);head.manager=ceo.id;
    list.forEach(e=>{if(e===head)return;const cands=list.filter(x=>x!==e&&lvlN(x.level)>lvlN(e.level)&&lvlN(x.level)>=5);
      if(!cands.length){e.manager=head.id;return}const minL=Math.min(...cands.map(x=>lvlN(x.level)));const c2=cands.filter(x=>lvlN(x.level)===minL);e.manager=c2[Math.floor(r()*c2.length)].id})});
  return E}
function build(N){AGGC=null;EMP=gen(N);EMPI={};NAMEIDX={};EMP.forEach(e=>{EMPI[e.id]=e;e.reports=[];NAMEIDX[e.name.toLowerCase()]=NAMEIDX[e.name.toLowerCase()]||e.id});
  EMP.forEach(e=>{if(e.manager)EMPI[e.manager].reports.push(e.id)});
  CONFLICT=new Set(EMP.filter(e=>e.department==='Engineering'&&e.team==='Platform').slice(0,40).map(e=>e.id));
  $('#dl-people').innerHTML=EMP.map(e=>`<option value="${esc(e.name)} · ${e.id}"></option>`).join('');
  $('#dl-mgr').innerHTML=EMP.filter(e=>lvlN(e.level)>=5).map(e=>`<option value="${esc(e.name)} · ${e.id}">${esc(e.title)}</option>`).join('');
  const ts=new Set();DEPTS.forEach(dp=>LEVELS.forEach(l=>ts.add(ladder(dp,l))));$('#dl-titles').innerHTML=[...ts].map(t=>`<option value="${esc(t)}"></option>`).join('')}
function parsePerson(s){if(!s)return null;const m=String(s).match(/\bE\d{4,}\b/i);if(m&&EMPI[m[0].toUpperCase()])return m[0].toUpperCase();const k=String(s).trim().toLowerCase();if(NAMEIDX[k])return NAMEIDX[k];
  const byMail=EMP.find(e=>e.email===k);return byMail?byMail.id:null}
function under(e,mid){if(!e)return false;let x=e.manager,g=0;while(x&&g<20){if(x===mid)return true;x=EMPI[x]?.manager;g++}return false}

/* ================= value fields (bulk change) ================= */
const FIELDS={
  title:{label:'Title',grp:'emp',type:'text'},
  department:{label:'Department',grp:'emp',type:'select',opts:()=>DEPTS,approval:true},
  team:{label:'Team',grp:'emp',type:'team'},
  manager:{label:'Manager',grp:'emp',type:'person',approval:true},
  location:{label:'Work location',grp:'emp',type:'select',opts:()=>LOCS,approval:true},
  email:{label:'Work email',grp:'emp',type:'text',identity:true},
  compensation:{label:'Base pay',grp:'pay',type:'money',approval:true},
  per:{label:'Pay type',grp:'pay',type:'select',opts:()=>PAYTYPES,approval:true},
  bonus:{label:'Target annual bonus',grp:'pay',type:'money',approval:true},
  spotBonus:{label:'One-time bonus',grp:'pay',type:'money',approval:true},
  equity:{label:'Equity grant (shares)',grp:'pay',type:'int',approval:true},
  timeOff:{label:'Time off policy',grp:'time',type:'select',opts:()=>PTO},
  laptop:{label:'Laptop model',grp:'dev',type:'select',opts:()=>LAPTOPS},
  refresh:{label:'Device refresh date',grp:'dev',type:'date'},
  benefits:{label:'Benefits class',grp:'ben',type:'select',opts:()=>BENEFITS,approval:true},
  level:{label:'Level',grp:'add',type:'select',opts:()=>LEVELS},
  rating:{label:'Performance rating',grp:'add',type:'select',opts:()=>RATINGS},
  costCenter:{label:'Cost center',grp:'add',type:'select',opts:()=>DEPTS.map((d,i)=>'CC-'+(100+i))},
  oncall:{label:'On-call rotation',grp:'add',type:'select',opts:()=>['None','Primary','Secondary']}
};
const FGROUPS=[['emp','Employment information','Profile'],['pay','Compensation','Payroll'],['time','Time off','Time off'],['dev','Devices','Device Management'],['ben','Benefits','Benefits administration'],['add','Additional information','Custom fields defined in Rippling']];
const MONEY=new Set(['compensation','bonus','spotBonus']);
const fhash=s2=>{let h=2166136261;for(let i=0;i<s2.length;i++){h^=s2.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const STDPATH={title:['Employment information','Job'],level:['Employment information','Job'],oncall:['Employment information','Job'],department:['Employment information','Organization'],team:['Employment information','Organization'],manager:['Employment information','Organization'],costCenter:['Employment information','Organization'],
  location:['Employment information','Location'],email:['Employment information','Contact'],compensation:['Compensation','Base pay'],per:['Compensation','Base pay'],bonus:['Compensation','Bonus'],spotBonus:['Compensation','Bonus'],equity:['Compensation','Equity'],
  timeOff:['Time off','Policies'],laptop:['Devices and apps','Devices'],refresh:['Devices and apps','Devices'],benefits:['Benefits','Eligibility'],rating:['Performance','Reviews']};
const CATORDER=['Employment information','Compensation','Payroll and tax','Time off','Benefits','Devices and apps','Performance','Learning','Workplace','Compliance','Custom fields','Connectors (read-only)','Personal information'];
let CATALOG=null,CATIDX=null;
function catalog(){if(CATALOG)return CATALOG;const C=[];const slug=x=>x.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
  const add=(path,label,type,o={})=>C.push({key:'x_'+slug(path[1]+'_'+label),label,type,path,src:o.src||'Custom field',opts:o.opts,ro:o.ro,lock:o.lock,ai:o.ai,gen:o.gen});
  Object.entries(FIELDS).forEach(([k,F])=>C.push({key:k,label:F.label,type:F.type==='team'||F.type==='person'?'select':F.type,path:STDPATH[k]||['Employment information','Job'],src:'Standard'}));
  const YN=['Yes','No'];
  ['Employee number','Job code','FLSA status','Employment category','Seniority date','Probation end date','Shift','Work schedule','Weekly hours','Union','Bargaining unit'].forEach((l,i)=>add(['Employment information','Job'],l,[ 'text','text','select','select','date','date','select','select','int','select','text'][i],{src:'Standard',opts:[0,0,['Exempt','Non-exempt'],['Regular','Temporary','Intern'],0,0,['Day','Evening','Night','Rotating'],['Mon–Fri','4×10','Rotating'],0,['None','Teamsters','UFCW'],0][i]||undefined}));
  ['Division','Business unit','Region','HR business partner','Recruiter','Executive sponsor','Skip-level manager'].forEach(l=>add(['Employment information','Organization'],l,'text',{src:'Standard'}));
  ['Work phone','Desk phone extension','Slack handle','Preferred name','Pronouns','Time zone'].forEach(l=>add(['Employment information','Contact'],l,'text',{src:'Standard'}));
  ['Remote status','Home state','Work country','Commute zone'].forEach(l=>add(['Employment information','Location'],l,'select',{src:'Standard',opts:l==='Remote status'?['On-site','Hybrid','Remote']:l==='Commute zone'?['Zone A','Zone B','Zone C']:l==='Work country'?['United States','Canada']:['CA','NY','TX','WA','IL','ON']}));
  const ALW=['Home office stipend','Phone allowance','Internet allowance','Wellness stipend','Learning budget','Commuter benefit','Meal allowance','Co-working allowance','Car allowance','Relocation allowance','Childcare stipend','Gym allowance'];
  ALW.forEach(a=>{add(['Compensation','Allowances'],a+' (monthly)','money',{ai:a.toLowerCase()});add(['Compensation','Allowances'],a+' eligibility','select',{opts:YN,ai:a.toLowerCase()})});
  ['Commission plan','Commission rate %','Accelerator above quota %','Quota (annual)','Draw amount','Clawback period (months)'].forEach((l,i)=>add(['Compensation','Commission'],l,['select','int','int','money','money','int'][i],{opts:i===0?['None','AE 2026','SDR 2026','AM 2026']:undefined,ai:i===0?'commission':undefined}));
  ['Grant type','Vesting schedule','Vesting start date','Refresh grant (shares)','Early exercise allowed'].forEach((l,i)=>add(['Compensation','Equity'],l,['select','select','date','int','select'][i],{opts:[['RSU','ISO','NSO'],['4 years, 1-year cliff','3 years monthly','2 years'],0,0,YN][i]||undefined}));
  ['Sign-on bonus','Retention bonus','Referral bonus','Patent bonus','Holiday bonus'].forEach(l=>add(['Compensation','Bonus'],l,'money',{ai:l.toLowerCase()}));
  const EARN=['Shift differential','On-call pay','Overtime rate multiplier','Holiday pay','Night premium','Hazard pay','Tool allowance','Uniform allowance','Union dues','Charity deduction','Garnishment','Loan repayment','Parking deduction','Gym deduction','Stock purchase plan %','Pension top-up'];
  EARN.forEach(l=>add(['Payroll and tax','Earnings and deductions'],l+' (per pay period)',/multiplier|%/.test(l)?'int':'money',{ai:l.toLowerCase()}));
  const ST='Alabama Alaska Arizona Arkansas California Colorado Connecticut Delaware Florida Georgia Hawaii Idaho Illinois Indiana Iowa Kansas Kentucky Louisiana Maine Maryland Massachusetts Michigan Minnesota Mississippi Missouri Montana Nebraska Nevada New_Hampshire New_Jersey New_Mexico New_York North_Carolina North_Dakota Ohio Oklahoma Oregon Pennsylvania Rhode_Island South_Carolina South_Dakota Tennessee Texas Utah Vermont Virginia Washington West_Virginia Wisconsin Wyoming'.split(' ').map(x=>x.replace(/_/g,' '));
  ST.forEach(st=>{add(['Payroll and tax','US state tax'],st+' additional withholding','money',{ai:st.toLowerCase()+' withholding'});add(['Payroll and tax','US state tax'],st+' exempt from withholding','select',{opts:YN});add(['Payroll and tax','US state tax'],st+' filing status','select',{opts:['Single','Married','Head of household']});add(['Payroll and tax','US state tax'],st+' allowances','int')});
  'Alberta;British Columbia;Manitoba;New Brunswick;Newfoundland and Labrador;Nova Scotia;Ontario;Prince Edward Island;Quebec;Saskatchewan;Northwest Territories;Nunavut;Yukon'.split(';').forEach(p=>{add(['Payroll and tax','Canada provincial tax'],p+' TD1 claim amount','money');add(['Payroll and tax','Canada provincial tax'],p+' additional tax','money');add(['Payroll and tax','Canada provincial tax'],p+' exempt','select',{opts:YN})});
  ['Federal filing status','Federal additional withholding','Federal exempt','Multiple jobs checkbox','Dependents amount','Canada TD1 federal claim','CPP exempt','EI exempt'].forEach((l,i)=>add(['Payroll and tax','Federal tax'],l,[ 'select','money','select','select','money','money','select','select'][i],{opts:[['Single','Married filing jointly','Head of household'],0,YN,YN,0,0,YN,YN][i]||undefined}));
  ['Pay schedule','Payment method','Pay group','Workers comp code','SUI state'].forEach((l,i)=>add(['Payroll and tax','Pay setup'],l,'select',{src:'Standard',opts:[['Semi-monthly','Bi-weekly','Monthly'],['Direct deposit','Paper check'],['US Salaried','US Hourly','Canada'],['8810','8742','7380'],['CA','NY','TX','WA']][i]}));
  ['Vacation','Sick','Personal','Parental','Bereavement','Jury duty','Volunteer','Floating holiday','Sabbatical','Compassionate care','Religious observance','Study leave'].forEach(t=>{add(['Time off','Accruals'],t+' accrual rate (hours per pay period)','int',{ai:t.toLowerCase()});add(['Time off','Accruals'],t+' carry-over cap (hours)','int');add(['Time off','Balances'],t+' balance adjustment (hours)','int')});
  ['Holiday calendar','Time off approver','Time tracking required','Overtime policy'].forEach((l,i)=>add(['Time off','Policies'],l,'select',{src:'Standard',opts:[['US 2027','Canada · Ontario 2027'],['Manager','Skip-level','HR'],YN,['Federal','California daily','None']][i]}));
  ['Medical','Dental','Vision','Life','AD&D','Short-term disability','Long-term disability','FSA','HSA','401(k)','RRSP','Commuter','EAP','Pet insurance','Legal plan'].forEach(b=>{add(['Benefits','Plans'],b+' plan','select',{opts:['Not enrolled','Base','Plus','Premium'],ai:b.toLowerCase()});add(['Benefits','Plans'],b+' coverage tier','select',{opts:['Employee','Employee + spouse','Employee + children','Family']});add(['Benefits','Contributions'],b+' employee contribution %','int')});
  ['Benefits waiting period (days)','Benefits effective date','COBRA eligible'].forEach((l,i)=>add(['Benefits','Eligibility'],l,['int','date','select'][i],{src:'Standard',opts:i===2?YN:undefined}));
  const APPS='Slack Google Workspace GitHub Jira Confluence Figma Notion Zoom Salesforce HubSpot Zendesk Intercom Asana Linear Miro Loom Okta 1Password Datadog PagerDuty AWS GCP Azure Snowflake Tableau Looker Workday Greenhouse Lever Lattice Culture_Amp Gong Outreach DocuSign Dropbox Box Adobe_Creative_Cloud Canva Grammarly ChatGPT_Enterprise Claude Cursor Sentry Postman Vercel Cloudflare Twilio Stripe NetSuite Expensify Brex Ramp Carta Calendly Airtable Smartsheet Monday ClickUp Trello Webflow Contentful Segment Amplitude Mixpanel Heap Hotjar Optimizely LaunchDarkly CircleCI Buildkite Terraform_Cloud HashiCorp_Vault Snyk CrowdStrike Jamf Kandji Microsoft_365 Teams Webex RingCentral Aircall Dialpad Highspot Seismic Clari'.split(' ').map(x=>x.replace(/_/g,' '));
  APPS.forEach(a=>{add(['Devices and apps','App access'],a+' licence tier','select',{opts:['None','Standard','Pro','Admin'],ai:a.toLowerCase(),src:'App field'});add(['Devices and apps','App access'],a+' access group','text',{src:'App field'});add(['Devices and apps','App access'],a+' role','select',{opts:['Member','Editor','Admin','Viewer'],src:'App field'})});
  ['Monitor model','Phone model','Mobile plan','Headset model','Hardware budget','Device return date','MDM profile','Device encryption required'].forEach((l,i)=>add(['Devices and apps','Devices'],l,['select','select','select','text','money','date','select','select'][i],{opts:[['Dell U2723QE','LG 27UL850','None'],['iPhone 15','Pixel 8','None'],['Unlimited','10 GB','None'],0,0,0,['Standard','Engineering','Executive'],YN][i]||undefined,ai:i===0?'monitor':i===1?'phone':undefined}));
  ['Performance review cycle','Calibrated rating','Goal plan','Review manager','Promotion readiness','Flight risk','Succession candidate'].forEach((l,i)=>add(['Performance','Reviews'],l,i===3?'text':'select',{opts:[['FY26 annual','H1 2027'],['Strong','Solid','Developing'],['FY27 goals'],0,['Ready now','Ready in 1 year','Not yet'],['Low','Medium','High'],YN][i]||undefined}));
  const CERTS='AWS Solutions Architect;AWS Developer;GCP Professional Cloud Architect;Azure Administrator;Kubernetes CKA;CISSP;CISM;Security+;PMP;Scrum Master;Product Owner;SHRM-CP;SHRM-SCP;PHR;CPA;CFA;CPP;Salesforce Administrator;Six Sigma Green Belt;ITIL Foundation;First aid;Forklift operator;Food safety;Fire warden;Data protection officer;ISO 27001 lead auditor;Terraform Associate;Snowflake SnowPro;Tableau Desktop Specialist;Google Analytics'.split(';');
  CERTS.forEach(c=>{add(['Learning','Certifications'],c+' certification expiry','date',{ai:c.toLowerCase()});add(['Learning','Certifications'],c+' certified','select',{opts:YN})});
  'Security awareness;Anti-harassment;Code of conduct;Data privacy;Insider trading;Anti-bribery;Manager essentials;Inclusive hiring;Interviewer training;Incident response;Secure coding;Export controls;HIPAA;GDPR;SOC 2 controls;Accessibility basics;Workplace safety;Expense policy;Travel policy;New manager onboarding'.split(';').forEach(t=>add(['Learning','Training'],t+' training completed on','date',{ai:t.toLowerCase()}));
  ['Desk','Floor','Building','Parking spot','Locker','Badge access level','Mail stop','Assigned office'].forEach((l,i)=>add(['Workplace','Office'],l,i===5?'select':'text',{opts:i===5?['Standard','After hours','All areas']:undefined,ai:i===0?'desk':i===3?'parking':undefined}));
  LOCS.forEach(c=>add(['Workplace','Badge access by site'],c+' office access','select',{opts:['None','Business hours','24/7'],ai:c.toLowerCase()+' office access'}));
  ['Background check status','Background check date','Right to work expiry','I-9 verified on','Visa type','Visa expiry','NDA signed on','Code of conduct acknowledged on','Conflict of interest declared','Export control classification'].forEach((l,i)=>add(['Compliance','Employment checks'],l,[ 'select','date','date','date','select','date','date','date','select','select'][i],{opts:[['Clear','Pending','Review'],0,0,0,['None','H-1B','L-1','O-1','TN'],0,0,0,YN,['EAR99','5D002','None']][i]||undefined,ai:i===4||i===5?'visa':undefined}));
  const DCF={Engineering:['Primary language','Security clearance','Pager ID','Architecture guild','Tech lead of'],Sales:['Territory','Segment','Book of business','Sales region','Deal desk approver'],'Customer Support':['Queue','Support tier','Languages supported','Escalation group'],Marketing:['Brand owner','Campaign region','Agency contact'],Product:['Product area','PM pod','Roadmap owner'],Design:['Design system role','Research panel'],Finance:['Approval limit','Entity owner'],People:['HRBP for','Comp partner for']};
  Object.entries(DCF).forEach(([dp,ls])=>ls.forEach(l=>add(['Custom fields',dp],l,'text',{ai:l.toLowerCase()})));
  [['Salesforce',['Quota attainment % (FY26)','Open pipeline (USD)','Closed won this quarter (USD)','Accounts owned']],['Amplitude',['Weekly active days','Features used (30 days)']],['Segment',['Last active date','Sessions (30 days)']],['Zendesk',['Tickets solved (30 days)','CSAT (90 days)']],['Greenhouse',['Interviews conducted (FY26)','Hiring manager for open roles']],['Lattice',['Engagement score','Goals on track %']]].forEach(([src,ls])=>ls.forEach(l=>add(['Connectors (read-only)',src],l,'text',{src:'Connector',ro:`Synced from ${src}. Edit it in ${src}; Rippling reads it for targeting and rules.`})));
  ['Legal name','Date of birth','Home address','Personal email','Personal phone','SSN / SIN','Bank account','Emergency contact','Marital status','Gender'].forEach(l=>add(['Personal information','Personal'],l,'text',{src:'Standard',lock:'Needs the Personal information permission. Ask Dana Okuneva (People).'}));
  annotate(C);CATALOG=C;CATIDX={};C.forEach(x=>CATIDX[x.key]=x);return C}
/* field descriptions and last bulk-change use */
const FDESC={title:'Job title shown on the profile, in the org chart and in connected apps.',level:'Job level from the job architecture. Drives the compensation band.',oncall:'Which on-call rotation the person is in. Syncs to PagerDuty schedules.',
  department:'The department the person belongs to. Decides device policy, Slack and Google groups.',team:'Team within the department. Filtered by Department.',manager:'Direct manager. Changes approval chains and reporting lines.',costCenter:'Cost center that payroll costs are booked to in the general ledger.',
  location:'Primary work location. Sets the legal entity, pay currency, tax state and holiday calendar.',email:'Primary work email. It is the sign-in for every connected app.',compensation:'Base salary per year, or hourly rate for hourly employees, in the person\'s pay currency.',
  per:'Hourly or salaried. Changes overtime eligibility and how payroll calculates pay.',bonus:'Annual bonus target as an amount. Paid by the bonus plan, not on every run.',spotBonus:'A one-off payment in the next payroll run. Taxed as supplemental income.',
  equity:'Number of shares in the current grant. Synced to Carta.',timeOff:'The time off policy the person accrues under. Tied to a country.',laptop:'The laptop model assigned in Device Management. A change orders a new device.',
  refresh:'Date the current laptop is due for replacement.',benefits:'Benefits eligibility class. A change opens an enrollment window.',rating:'Rating from the latest performance cycle.'};
const HIST={'Employment information':['Profile clean-up','Sales reorg · West','Title harmonisation'],'Compensation':['Mid-cycle market adjustments','Q3 allowance update','FY25 annual review'],'Payroll and tax':['W-4 corrections','Pay schedule migration'],
  'Time off':['2026 accrual reset','Ontario policy update'],'Benefits':['Open enrollment 2026 fixes','Benefits class audit'],'Devices and apps':['Okta rollout','Figma seat clean-up','Laptop refresh · Q3'],'Performance':['FY25 calibration import'],
  'Learning':['Annual compliance training','Certification audit'],'Workplace':['Austin office move','Badge access review'],'Compliance':['I-9 re-verification','Visa expiry tracking'],'Custom fields':['Territory realignment','Support queue rebalance']};
const STDUSE={compensation:[6,'BC-2036','Mid-cycle market adjustments'],level:[6,'BC-2036','Mid-cycle market adjustments'],title:[6,'BC-2036','Mid-cycle market adjustments'],department:[19,'BC-2033','Sales reorg · West'],team:[19,'BC-2033','Sales reorg · West'],
  manager:[19,'BC-2033','Sales reorg · West'],location:[59,'BC-2019','Austin office move'],laptop:[140,'BC-2014','Laptop refresh · Q3'],refresh:[140,'BC-2014','Laptop refresh · Q3'],spotBonus:[27,'BC-2034','Q3 spot awards'],bonus:[320,'BC-1987','FY25 annual review'],
  equity:[320,'BC-1987','FY25 annual review'],timeOff:[330,'BC-1979','2026 accrual reset'],benefits:[210,'BC-2003','Open enrollment 2026 fixes'],costCenter:[95,'BC-2011','Finance cost center remap'],oncall:[12,'BC-2035','On-call rotation Q4'],email:[400,'BC-1968','Domain change'],per:[470,'BC-1955','Hourly reclassification'],rating:[null]};
function annotate(C){C.forEach(x=>{const h=fhash('u|'+x.key);const st=STDUSE[x.key];
  if(x.ro||x.lock)x.used=null;else if(st){x.used=st[0]===null?null:{days:st[0],id:st[1],name:st[2]}}
  else if(h%5===0)x.used=null;else{const r=(h>>>3)%100;const days=r<14?1+(h>>>9)%29:r<42?31+(h>>>9)%149:181+(h>>>9)%700;const hs=HIST[x.path[0]]||['Profile clean-up'];x.used={days,id:'BC-'+(1900+(h>>>12)%135),name:hs[(h>>>15)%hs.length]}}
  if(x.used)x.used.date=addDays(TODAY,-x.used.days);
  if(FDESC[x.key])x.desc=FDESC[x.key];else if(!x.desc){const L=x.label,sub=x.path[1];let m;
    if((m=L.match(/^(.*) licence tier$/)))x.desc=`${m[1]} seat level, provisioned through the ${m[1]} integration. A change updates the seat in ${m[1]}.`;
    else if((m=L.match(/^(.*) role$/)))x.desc=`Role in ${m[1]}, pushed on the next sync.`;
    else if((m=L.match(/^(.*) additional withholding$/)))x.desc=`Extra ${m[1]} income tax withheld each pay period, on top of the calculated amount.`;
    else if((m=L.match(/^(.*) filing status$/)))x.desc=`Filing status from the ${m[1]} withholding form.`;
    else if((m=L.match(/^(.*) \(monthly\)$/)))x.desc=`${m[1]} paid monthly through payroll.`;
    else if((m=L.match(/^(.*) accrual rate/)))x.desc=`Hours of ${m[1].toLowerCase()} earned each pay period. Overrides the policy default for this person.`;
    else if((m=L.match(/^(.*) carry-over cap/)))x.desc=`Most ${m[1].toLowerCase()} hours that roll into next year.`;
    else if((m=L.match(/^(.*) balance adjustment/)))x.desc=`One-off adjustment to the ${m[1].toLowerCase()} balance, logged in the time off ledger.`;
    else if((m=L.match(/^(.*) plan$/))&&sub==='Plans')x.desc=`${m[1]} plan the person is enrolled in.`;
    else if((m=L.match(/^(.*) certification expiry$/)))x.desc=`When the ${m[1]} certification lapses. Used for renewal reminders.`;
    else if((m=L.match(/^(.*) training completed on$/)))x.desc=`Completion date of the ${m[1]} course, synced from the learning platform.`;
    else if((m=L.match(/^(.*) office access$/)))x.desc=`Badge access hours for the ${m[1]} office.`;
    else if(x.ro)x.desc=x.ro;else if(x.lock)x.desc=x.lock}});}
function usedTxt(u){if(!u)return'';const d=u.days;return d<1?'today':d===1?'yesterday':d<30?`${d} days ago`:d<365?`${Math.round(d/30)} mo ago`:`${(d/365).toFixed(1).replace(/\.0$/,'')} yr ago`}
function usedTier(u){return!u?'never':u.days<=30?'new':u.days<=182?'mid':'old'}
function useHtml(x){const u=x.used;if(x.ro||x.lock)return'';if(!u)return`<span class="use u-never" title="Not used in a bulk change yet">Not used yet</span>`;const t=usedTier(u);
  return`<span class="use u-${t}" title="Last used ${fmtIso(iso(u.date))} in ${esc(u.id)} · ${esc(u.name)}"><i></i>${usedTxt(u)}</span>`}
const fo=k=>{const i=FORDER.indexOf(k);return i<0?999:i};
let MATV=null;
function ensureField(k){const c=catalog().find?CATIDX[k]:null;if(!c)return;if(!FIELDS[k]){FIELDS[k]={label:c.label,grp:'cat',type:c.type==='select'?'select':c.type,opts:c.opts?()=>c.opts:undefined,custom:true};if(c.type==='money')MONEY.add(k)}
  if(!MATV||MATV.emp!==EMP)MATV={emp:EMP,done:new Set()};if(MATV.done.has(k)||FIELDS[k].custom!==true)return;MATV.done.add(k);
  EMP.forEach(e=>{const h=fhash(e.id+'|'+k);const t=c.type;let v='';
    if(t==='select')v=c.opts?c.opts[h%c.opts.length]:'';else if(t==='money')v=h%3===0?0:[25,50,75,100,150,200,250][h%7];else if(t==='int')v=h%12;else if(t==='date')v=h%4===0?'':iso(addDays(TODAY,-(h%900)));else v=h%3===0?'':(c.label.split(' ')[0]+'-'+(100+h%800));e[k]=v})}
function aiFields(text){const t=' '+String(text||'').toLowerCase()+' ';const out=new Set();const add=(...k)=>k.forEach(x=>out.add(x));
  if(/promot/.test(t))add('level','title','compensation');if(/\b(raise|merit|salary|base pay|pay rise|increase)\b/.test(t))add('compensation');if(/hourly|salaried|pay type/.test(t))add('per');
  if(/bonus/.test(t))add(/one[- ]time|spot|launch|thank/.test(t)?'spotBonus':'bonus');if(/equity|shares|rsu|grant/.test(t))add('equity');if(/reorg|restructur|reorganis|reorganiz/.test(t))add('department','team','manager');
  if(/\bmanager|reports? to\b/.test(t))add('manager');if(/\bteam\b/.test(t)&&!/team (?:offsite|lunch)/.test(t))add('team');if(/department/.test(t))add('department');
  if(/\b(move|moving|relocat|office move|location)\b/.test(t))add('location');if(/\btitle/.test(t))add('title');if(/email|rename/.test(t))add('email');
  if(/laptop|device refresh|hardware/.test(t))add('laptop','refresh');if(/time off|pto|vacation policy|leave policy/.test(t))add('timeOff');if(/benefit/.test(t))add('benefits');if(/on[- ]call|pager/.test(t))add('oncall');
  if(/cost cent/.test(t))add('costCenter');if(/rating|performance/.test(t))add('rating');if(/\blevel\b/.test(t))add('level');
  for(const c of catalog()){if(out.size>=14)break;if(c.ro||c.lock)continue;const key=c.ai;if(key&&t.includes(' '+key)&&!out.has(c.key)){if(/licence tier$|plan$|\(monthly\)$|expiry$|completed on$|office access$|additional withholding$|accrual rate|^desk$|^parking|^visa type|^monitor|^phone model|commission plan/i.test(c.label))out.add(c.key)}}
  return[...out]}

const FORDER=['compensation','per','bonus','spotBonus','equity','level','title','department','team','manager','location','email','timeOff','laptop','refresh','benefits','rating','costCenter','oncall'];
function fmtVal(e,f,v){if(v===undefined||v===null||v==='')return'';
  if(MONEY.has(f)){const n=+v;if(f==='spotBonus'&&!n)return'—';const c=curOf(e);return c+(f==='compensation'&&n<1000?n.toFixed(n%1?2:0):fmtN(n))}
  if(f==='equity')return fmtN(+v);if(f==='manager')return EMPI[v]?EMPI[v].name:'';if(FIELDS[f]&&FIELDS[f].type==='date')return fmtIso(v);return String(v)}
function parseMoney(s){if(s===undefined||s===null)return NaN;let t=String(s).trim().toLowerCase().replace(/ca\$|usd|\$|\s|%/g,'');if(!t)return NaN;
  let mult=1;if(/k$/.test(t)){mult=1000;t=t.slice(0,-1)}t=t.replace(/,/g,'');const n=parseFloat(t);return isFinite(n)&&/^-?[\d.]+$/.test(t)?n*mult:NaN}

/* ================= condition engine (one catalog for every builder and column filter) ================= */
const CF={
  empid:{label:'Employee ID',type:'id',grp:'Employee',get:e=>e.id},
  title:{label:'Title',type:'text',grp:'Employment information',get:e=>e.title},
  department:{label:'Department',type:'pick',grp:'Employment information',get:e=>e.department,opts:()=>DEPTS},
  team:{label:'Team',type:'pick',grp:'Employment information',get:e=>e.team,opts:()=>ALLTEAMS},
  manager:{label:'Manager',type:'person',grp:'Employment information',get:e=>e.manager},
  location:{label:'Work location',type:'pick',grp:'Employment information',get:e=>e.location,opts:()=>LOCS},
  email:{label:'Work email',type:'text',grp:'Employment information',get:e=>e.email},
  etype:{label:'Employment type',type:'pick',grp:'Employment information',get:e=>e.etype,opts:()=>['Full-time','Contractor']},
  status:{label:'Employment status',type:'pick',grp:'Employment information',get:e=>e.status,opts:()=>['Active','On leave','Scheduled termination']},
  startDate:{label:'Start date',type:'date',grp:'Employment information',get:e=>e.startDate},
  compensation:{label:'Base pay (annualised)',type:'num',money:true,grp:'Compensation',get:e=>annual(e.compensation,e.per)},
  per:{label:'Pay type',type:'pick',grp:'Compensation',get:e=>e.per,opts:()=>PAYTYPES},
  bonus:{label:'Target annual bonus',type:'num',money:true,grp:'Compensation',get:e=>e.bonus},
  equity:{label:'Equity grant (shares)',type:'num',grp:'Compensation',get:e=>e.equity},
  timeOff:{label:'Time off policy',type:'pick',grp:'Time off',get:e=>e.timeOff,opts:()=>PTO},
  laptop:{label:'Laptop model',type:'pick',grp:'Devices',get:e=>e.laptop,opts:()=>LAPTOPS},
  refresh:{label:'Device refresh date',type:'date',grp:'Devices',get:e=>e.refresh},
  benefits:{label:'Benefits class',type:'pick',grp:'Benefits',get:e=>e.benefits,opts:()=>BENEFITS},
  level:{label:'Level',type:'ord',grp:'Additional information',get:e=>e.level,opts:()=>LEVELS},
  rating:{label:'Performance rating',type:'pick',grp:'Additional information',get:e=>e.rating,opts:()=>RATINGS},
  costCenter:{label:'Cost center',type:'pick',grp:'Additional information',get:e=>e.costCenter,opts:()=>DEPTS.map((d,i)=>'CC-'+(100+i))},
  oncall:{label:'On-call rotation',type:'pick',grp:'Additional information',get:e=>e.oncall,opts:()=>['None','Primary','Secondary']},
  languages:{label:'Languages spoken',type:'multi',grp:'Additional information',get:e=>e.languages,opts:()=>['English','Spanish','French']},
  quota:{label:'Quota attainment % (FY26)',type:'num',grp:'Custom attributes from connectors',src:'Salesforce',get:e=>e.quota},
  activeDays:{label:'Weekly active days',type:'num',grp:'Custom attributes from connectors',src:'Amplitude',get:e=>e.activeDays},
  lastActive:{label:'Last active date',type:'date',grp:'Custom attributes from connectors',src:'Segment',get:e=>e.lastActive},
  deptHeadcount:{label:'Department headcount',type:'num',grp:'Group totals',agg:true,get:e=>AGG().dc[e.department]},
  teamHeadcount:{label:'Team headcount',type:'num',grp:'Group totals',agg:true,get:e=>AGG().tc[e.department+'|'+e.team]},
  deptPay:{label:'Department total base pay (USD)',type:'num',grp:'Group totals',agg:true,get:e=>AGG().dp[e.department]},
  deptAvgPay:{label:'Department average base pay (USD)',type:'num',grp:'Group totals',agg:true,get:e=>AGG().da[e.department]},
  reportsCount:{label:'Direct reports',type:'num',grp:'Group totals',agg:true,get:e=>e.reports.length},
  mgrSpan:{label:"Manager's direct reports",type:'num',grp:'Group totals',agg:true,get:e=>EMPI[e.manager]?EMPI[e.manager].reports.length:0}
};
let AGGC=null;function AGG(){if(AGGC)return AGGC;const dc={},tc={},dp={};EMP.forEach(e=>{dc[e.department]=(dc[e.department]||0)+1;const k=e.department+'|'+e.team;tc[k]=(tc[k]||0)+1;dp[e.department]=(dp[e.department]||0)+usd(e,annual(e.compensation,e.per))});
  const da={};Object.keys(dp).forEach(k=>{dp[k]=Math.round(dp[k]);da[k]=Math.round(dp[k]/dc[k])});return AGGC={dc,tc,dp,da}}
const CONN_NOTE={Salesforce:'Synced daily from Salesforce through a custom connector',Amplitude:'Synced daily from Amplitude through a custom connector',Segment:'Synced hourly from Segment through a custom connector'};
const OPS={
  id:[['inseg','belongs to segment'],['notinseg',"doesn't belong to segment"],['eq','is exactly'],['ne','is not'],['anyof','is any of'],['noneof','is none of'],['starts','starts with'],['contains','contains']],
  text:[['contains','contains'],['ncontains','does not contain'],['starts','starts with'],['ends','ends with'],['eq','is exactly'],['ne','is not'],['empty','is empty'],['nempty','is not empty']],
  pick:[['anyof','is any of'],['noneof','is none of'],['empty','is empty'],['nempty','is not empty']],
  ord:[['anyof','is any of'],['noneof','is none of'],['gte','is at least'],['lte','is at most'],['between','is between']],
  num:[['eq','='],['ne','≠'],['gt','>'],['gte','≥'],['lt','<'],['lte','≤'],['between','is between'],['nbetween','is not between'],['empty','is empty'],['nempty','is not empty']],
  date:[['on','is'],['before','is before'],['after','is after'],['between','is between'],['empty','is empty'],['nempty','is not empty']],
  person:[['is','is'],['isnot','is not'],['reports','reports directly to'],['reportsAll','reports to (any level)'],['empty','is empty']],
  multi:[['hasany','has any of'],['hasall','has all of'],['hasnone','has none of'],['empty','is empty']],
  bool:[['yes','is Yes'],['no','is No']]
};
const TYPE_LABEL={text:'Text',num:'Number',date:'Date',bool:'Yes / No',pick:'Picklist',ord:'Ordered list',id:'Employee ID',person:'Person',multi:'Multi-select'};
const NOVAL=new Set(['empty','nempty','yes','no']),TWO=new Set(['between','nbetween']),LISTOP=new Set(['anyof','noneof','hasany','hasall','hasnone']);
const opLabel=(t,o)=>((OPS[t]||[]).find(x=>x[0]===o)||[0,o])[1];
const isEmpty=v=>v===undefined||v===null||v===''||(Array.isArray(v)&&!v.length);
function complete(c){if(NOVAL.has(c.op))return true;const v=c.v||[];const ok=x=>x!==undefined&&x!==null&&x!=='';const F=CF[c.f];
  if(F&&F.type==='date'&&['on','before','after'].includes(c.op))return ok(v[0])&&(v[0]!=='exact'||ok(v[1]));
  if(TWO.has(c.op))return ok(v[0])&&ok(v[1]);if(LISTOP.has(c.op))return v.length>0;return ok(v[0])}
const REL=[['today','Today'],['tomorrow','Tomorrow'],['yesterday','Yesterday'],['pastweek','In the past week'],['pastmonth','In the past month'],['pastyear','In the past year'],['exact','Exact date']];
const relLabel=t=>(REL.find(x=>x[0]===t)||[0,''])[1];
function relRange(tok,ex){const T=TODAY;switch(tok){case'today':return[T,T];case'tomorrow':return[addDays(T,1),addDays(T,1)];case'yesterday':return[addDays(T,-1),addDays(T,-1)];
  case'pastweek':return[addDays(T,-7),T];case'pastmonth':{const a=new Date(T);a.setMonth(a.getMonth()-1);return[a,T]}case'pastyear':{const a=new Date(T);a.setFullYear(a.getFullYear()-1);return[a,T]}
  case'exact':{const d=fromIso(ex);return d?[d,d]:null}}return null}
function testVal(t,val,c,e){const v=c.v||[];const op=c.op;
  if(op==='empty')return isEmpty(val);if(op==='nempty')return!isEmpty(val);
  switch(t){
    case'id':{const id=e.id;if(op==='inseg')return segHas(v[0],id);if(op==='notinseg')return!segHas(v[0],id);if(op==='eq')return id===v[0];if(op==='ne')return id!==v[0];
      if(op==='anyof')return v.includes(id);if(op==='noneof')return!v.includes(id);const q=String(v[0]||'').toUpperCase();if(op==='starts')return id.startsWith(q);if(op==='contains')return id.includes(q);return false}
    case'text':{const s=String(val??'').toLowerCase(),q=String(v[0]??'').toLowerCase();switch(op){case'contains':return s.includes(q);case'ncontains':return!s.includes(q);case'starts':return s.startsWith(q);case'ends':return s.endsWith(q);case'eq':return s===q;case'ne':return s!==q}return false}
    case'pick':return op==='anyof'?v.includes(val):op==='noneof'?!v.includes(val):false;
    case'ord':{const n=lvlN(val);if(op==='anyof')return v.includes(val);if(op==='noneof')return!v.includes(val);if(op==='gte')return n>=lvlN(v[0]);if(op==='lte')return n<=lvlN(v[0]);if(op==='between'){const a=lvlN(v[0]),b=lvlN(v[1]);return n>=Math.min(a,b)&&n<=Math.max(a,b)}return false}
    case'num':{if(isEmpty(val))return op==='ne'||op==='nbetween';const n=+val,a=+v[0],b=+v[1];switch(op){case'eq':return n===a;case'ne':return n!==a;case'gt':return n>a;case'gte':return n>=a;case'lt':return n<a;case'lte':return n<=a;case'between':return n>=Math.min(a,b)&&n<=Math.max(a,b);case'nbetween':return n<Math.min(a,b)||n>Math.max(a,b)}return false}
    case'date':{if(isEmpty(val))return false;const s=String(val);if(op==='between'){const a=String(v[0]||''),b=String(v[1]||'');return s>=(a<b?a:b)&&s<=(a<b?b:a)}
      const r=relRange(v[0],v[1]);if(!r)return false;const a=iso(r[0]),b=iso(r[1]);return op==='on'?s>=a&&s<=b:op==='before'?s<a:op==='after'?s>b:false}
    case'person':{if(op==='is')return val===v[0];if(op==='isnot')return val!==v[0];if(op==='reports')return e.manager===v[0];if(op==='reportsAll')return under(e,v[0]);return false}
    case'multi':{const arr=Array.isArray(val)?val:[];if(op==='hasany')return v.some(x=>arr.includes(x));if(op==='hasall')return v.every(x=>arr.includes(x));if(op==='hasnone')return!v.some(x=>arr.includes(x));return false}
    case'bool':{const y=val===true||/^(yes|y|true|1)$/i.test(String(val??'').trim());return op==='yes'?y:!y}}
  return false}
const fieldOf=c=>CF[c.f]||{label:c.f,type:'text',get:()=>''};
const testCond=(c,e)=>{const F=fieldOf(c);let v=F.get(e);if(F.money&&typeof v==='number')v=conv(v,curCode(e),c.cur||'USD');return testVal(F.type,v,c,e)};
function groupMatch(g,e){const cs=g.conds.filter(complete);if(!cs.length)return false;const m=g.mode||'all';
  if(m==='all')return cs.every(c=>testCond(c,e));if(m==='any')return cs.some(c=>testCond(c,e));
  let k=0;for(const c of cs)if(testCond(c,e))k++;const n=+g.n||1;return m==='atleast'?k>=n:m==='atmost'?k<=n:k===n}
function evalGroups(groups,e){for(let i=0;i<groups.length;i++){if(!groups[i].conds.some(complete))continue;if(groupMatch(groups[i],e))return i}return-1}
function names(ids){const n=ids.map(id=>EMPI[id]?.name||id);return n.length>3?n.slice(0,3).join(', ')+` and ${n.length-3} more`:n.join(', ')}
function fmtCV(t,x){if(t==='num')return isFinite(+x)?fmtN(+x):String(x);if(t==='date')return fmtIso(x)||String(x);return String(x)}
function condTxt(c){const F=fieldOf(c);const v=c.v||[];let vt='';
  if(!NOVAL.has(c.op)){if(F.type==='id'){vt=(c.op==='inseg'||c.op==='notinseg')?`"${segName(v[0])}"`:['eq','ne','anyof','noneof'].includes(c.op)?names(v):`"${v[0]||''}"`}
    else if(F.type==='person')vt=EMPI[v[0]]?.name||'…';else if(F.type==='date'&&c.op!=='between')vt=v[0]==='exact'?fmtIso(v[1]):relLabel(v[0]).toLowerCase();
    else if(TWO.has(c.op))vt=`${fmtCV(F.type,v[0])} and ${fmtCV(F.type,v[1])}`;else if(LISTOP.has(c.op))vt=v.join(', ');else if(F.type==='text')vt=`"${v[0]||''}"`;else vt=fmtCV(F.type,v[0])}
  if(F.money&&vt&&!NOVAL.has(c.op))vt+=' '+(c.cur||'USD');
  return`${F.label} ${opLabel(F.type,c.op)}${vt?' '+vt:''}`}
function groupsTxt(groups){const live=groups.filter(g=>g.conds.some(complete));if(!live.length)return'';
  return live.map(g=>{const cs=g.conds.filter(complete);const m=g.mode||'all';let s;
    if(m==='all'||m==='any')s=cs.map(condTxt).join(m==='all'?' and ':' or ');else s=`${{atleast:'at least',atmost:'at most',exactly:'exactly'}[m]} ${g.n||1} of: ${cs.map(condTxt).join('; ')}`;
    return live.length>1&&cs.length>1?`(${s})`:s}).join(', or ')}
/* ================= segments store ================= */
let SEGS=[],SEGN=110;const SEGC=new Map();const SEGSTACK=[];
const segById=id=>SEGS.find(s=>s.id===id);
const segName=id=>segById(id)?.name||'(deleted segment)';
function members(id){if(SEGC.has(id))return SEGC.get(id);const s=segById(id);if(!s)return new Set();
  if(s.type==='static'){const m=new Set(s.members.filter(x=>EMPI[x]));SEGC.set(id,m);return m}
  if(SEGSTACK.includes(id))return new Set();SEGSTACK.push(id);const m=new Set();for(const e of EMP)if(evalGroups(s.groups,e)>=0)m.add(e.id);SEGSTACK.pop();SEGC.set(id,m);return m}
const segHas=(id,eid)=>members(id).has(eid);
const typeBadge=s=>s.type==='dynamic'?'<span class="badge b-dyn">Dynamic</span>':`<span class="badge b-stat">Static · ${esc(String(s.snapshotAt||'').split(',')[0])}</span>`;
function segDef(s){if(s.type==='dynamic')return groupsTxt(s.groups);if(s.source==='csv')return`${s.file.name} · ${pl(s.columns.length,'column')}`;return'Snapshot of: '+groupsTxt(s.groups)}
function usedIn(s){if(!s)return[];const out=[...(s.usedSeed||[])];[S.d,...S.parked].filter(Boolean).forEach(d=>{if(d.who.groups.some(g=>g.conds.some(c=>c.f==='empid'&&(c.op==='inseg'||c.op==='notinseg')&&c.v[0]===s.id)))out.push(d.name||'Untitled change')});return out}
function detectType(vals){const vs=vals.filter(v=>v!=='');if(!vs.length)return'text';
  if(vs.every(v=>/^(yes|no|y|n|true|false)$/i.test(v)))return'bool';
  if(vs.every(v=>isFinite(parseMoney(v))))return'num';
  if(vs.every(v=>parseDateStr(v)))return'date';
  const d=new Set(vs);if(d.size<=8&&vs.length>=d.size*2)return'pick';return'text'}
function parseDateStr(s){s=String(s).trim();let m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);if(m)return`${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`;
  m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);if(m)return`${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
  m=s.match(/^(\d{1,2}) ([A-Za-z]{3})[a-z]* (\d{4})$/);if(m){const mi=MONTHS.findIndex(x=>x.toLowerCase()===m[2].toLowerCase());if(mi>=0)return iso(D(+m[3],mi,+m[1]))}return null}
function coerce(t,raw){if(raw==='')return'';if(t==='num'){const n=parseMoney(raw);return isFinite(n)?n:''}if(t==='bool')return/^(yes|y|true|1)$/i.test(raw);if(t==='date')return parseDateStr(raw)||'';return raw}
function loadFile(se,name,text){const rows=parseCSV(text||'');if(rows.length<2){toast('That file has no data rows.');return false}
  const H=rows[0].map(h=>h.trim());let key=H.findIndex(h=>['employeeid','id','empid'].includes(norm2(h)));if(key<0)key=H.findIndex(h=>['workemail','email'].includes(norm2(h)));
  if(key<0)key=H.findIndex((h,i)=>rows.slice(1,6).every(r=>/^E\d+$/i.test((r[i]||'').trim())));if(key<0)key=0;
  se.file={name,raw:rows,header:H,keyCol:key,types:{},showUnmatched:false};se.tf={};se.sort=null;se.excluded=new Set();reparse(se);return true}
function reparse(se){const f=se.file;const H=f.header;const body=f.raw.slice(1);f.rowsN=body.length;
  const skip=new Set([f.keyCol]);H.forEach((h,i)=>{if(['name','employeename','fullname'].includes(norm2(h)))skip.add(i)});
  f.cols=H.map((h,i)=>({i,key:'f_'+(slug(h)||'col'+i),label:h||'Column '+(i+1)})).filter(c=>!skip.has(c.i));
  f.cols.forEach(c=>{c.type=f.types[c.key]||detectType(body.map(r=>(r[c.i]||'').trim()))});
  f.values={};f.matched=[];f.unmatched=[];const seen=new Set();
  body.forEach(r=>{const k=(r[f.keyCol]||'').trim();if(!k)return;const id=EMPI[k.toUpperCase()]?k.toUpperCase():parsePerson(k);if(!id){f.unmatched.push(k);return}if(seen.has(id))return;seen.add(id);f.matched.push(id);
    const o={};f.cols.forEach(c=>{o[c.key]=coerce(c.type,(r[c.i]||'').trim())});f.values[id]=o})}
function sampleNominations(){const r=rng(EMP.length+77);const pool=EMP.filter(e=>e.department!=='Executive'&&e.etype==='Full-time'&&(e.rating==='Exceeds'||(e.rating==='Meets'&&r()<.3)));
  const pick=pool.filter(()=>r()<.55).slice(0,Math.max(6,Math.round(EMP.length*.1)));
  const lines=[csvLine(['Employee ID','Employee name','Nominated by','Calibrated rating','Promo flag','Proposed level','Proposed increase %','Nomination date'])];
  pick.forEach((e,i)=>{const yes=i===0||(e.rating==='Exceeds'?r()<.72:r()<.3);const flag=yes?(i%5===0?'Y':i%7===0?'yes':'Yes'):(i%6===0?'N':'No');const inc=yes?6+Math.floor(r()*7):2+Math.floor(r()*3);
    const dd=1+Math.floor(r()*28);const date=i%4===0?`${String(dd).padStart(2,'0')}/10/2026`:`2026-10-${String(dd).padStart(2,'0')}`;
    lines.push(csvLine([i%9===4?e.email:e.id,e.name,EMPI[e.manager]?.name||'',yes?'Strong':(r()<.5?'Solid':'Developing'),flag,'L'+Math.min(8,lvlN(e.level)+(yes?1:0)),i%3===0?inc+'%':String(inc),date]))});
  lines.push(csvLine(['E9991','Left in October','','','No','','','']),csvLine(['E9874','Typo row','','','Yes','','','']),csvLine(['jordan.smith@acmecorp.com','Not in Rippling','','','Yes','','','']));
  return lines.join('\n')}
function sampleMovers(){const r=rng(EMP.length+31);const pool=EMP.filter(e=>e.location!=='Austin'&&e.location!=='Toronto'&&['Sales','Customer Support','Marketing'].includes(e.department)&&e.etype==='Full-time');
  const pick=pool.filter(()=>r()<.25).slice(0,Math.max(5,Math.round(EMP.length*.05)));
  const lines=[csvLine(['Work email','Employee name','Desk','Move date','Relocation package','Parking needed','Notes'])];
  pick.forEach((e,i)=>{const dd=4+Math.floor(r()*24);lines.push(csvLine([i%5===2?' '+e.email.toUpperCase()+' ':e.email,e.name,`${'ABC'[i%3]}-${String(10+Math.floor(r()*40))}`,`${String(dd).padStart(2,'0')}/01/2027`,r()<.6?'Yes':'No',r()<.4?'Y':'N',i%4===0?'Needs a standing desk':'']))});
  lines.push(csvLine(['casey.nguyen@acmecorp.com','Not in Rippling','B-11','11/01/2027','Yes','N','']),csvLine(['old.contractor@agency.com','External','C-02','18/01/2027','No','N','']));
  return lines.join('\n')}
function sampleCompChanges(){const r=rng(EMP.length+5);const rows=EMP.filter(e=>e.etype==='Full-time'&&e.status==='Active'&&e.rating!=='Below'&&e.department!=='Executive').filter(()=>r()<.2).slice(0,400);
  const lines=[csvLine(['Employee ID','Name','Base pay (new)','Level (new)','Title (new)','Manager notes'])];let k=0;
  rows.forEach(e=>{const promo=e.rating==='Exceeds'&&lvlN(e.level)<7&&r()<.35;const nl=promo?'L'+(lvlN(e.level)+1):'';const b=band(e,nl||e.level,e.per);
    let v=roundComp(promo?Math.max(e.compensation*1.08,b.min+(b.mid-b.min)*.5):e.compensation*(1.03+r()*.05),e.per);k++;
    const amt=e.per==='Hourly'?'$'+v.toFixed(2):[`$${fmtN(v)}`,String(v),(v/1000).toFixed(1)+'k',v.toString().replace(/(\d)(?=(\d\d)+\d{3}$)/g,'$1,').replace(/(\d)(\d{3})$/,'$1,$2')][k%4];
    lines.push(csvLine([e.id,e.name,amt,nl,promo?ladder(e.department,nl):'',promo?'Promotion approved in calibration':(r()<.08?'Hold for mid-year':'')]))});
  lines.push(csvLine(['E9991','Former employee','$90,000','','','']),csvLine(['E9992','Typo row','abc','','','']));return lines.join('\n')}
function sampleLaptops(){const old=iso(addDays(TODAY,-1095));const rows=EMP.filter(e=>['Engineering','Product','Design'].includes(e.department)&&e.refresh<old).slice(0,300);
  const lines=[csvLine(['Employee ID','Name','Laptop model (new)','Device refresh date (new)','Ship to','Notes'])];
  rows.forEach((e,i)=>lines.push(csvLine([e.id,e.name,lvlN(e.level)>=5?'MacBook Pro 16 M3':'MacBook Pro 14 M3',i%3===0?'15/01/2027':'2027-01-15',i%4===0?'Home address on file':e.location+' office',i%7===0?'Needs a UK keyboard':''])));
  lines.push(csvLine(['E9990','Former employee','MacBook Pro 14 M3','2027-01-15','','']));return lines.join('\n')}
function sampleBonus(){const rows=EMP.filter(e=>e.department==='Engineering'&&(e.team==='Platform'||e.team==='Infrastructure')).slice(0,200);
  const lines=[csvLine(['Work email','Name','One-time bonus (new)','Currency','Reason'])];
  rows.forEach((e,i)=>{const ca=curCode(e)==='CAD';lines.push(csvLine([e.email,e.name,e.team==='Platform'?(ca&&i%2?'1370':'1000'):'500',e.team==='Platform'&&ca&&i%2?'CAD':'USD',e.team==='Platform'?'Q4 platform launch':'Launch support']))});
  lines.push(csvLine(['ana.contractor@agency.com','External','1000','USD','Not in Rippling']),csvLine([rows[0]?rows[0].email:'x@acmecorp.com','Duplicate currency typo','900','EUR','Unsupported currency']));return lines.join('\n')}
const SAMPLES={'promotion-nominations-fy26.csv':()=>sampleNominations(),'austin-office-movers.csv':()=>sampleMovers(),'fy26-comp-changes.csv':()=>sampleCompChanges(),'laptop-refresh-q1-2027.csv':()=>sampleLaptops(),'q4-launch-bonus.csv':()=>sampleBonus()};
function makeSeeds(){SEGS=[];SEGN=110;SEGC.clear();
  const dyn=(id,name,desc,groups,owner,updated,usedSeed)=>({id,name,desc,type:'dynamic',source:'conditions',groups,owner,updated,created:updated,usedSeed:usedSeed||[],version:1});
  SEGS.push(dyn('SEG-101','All full-time employees','Everyone on a full-time contract.',[{mode:'all',conds:[{f:'etype',op:'anyof',v:['Full-time']}]}],'Dana Okuneva','12 Nov 2026'));
  const se=newEditor({type:'static',source:'csv'});loadFile(se,'promotion-nominations-fy26.csv',SAMPLES['promotion-nominations-fy26.csv']());const pf=se.file.cols.find(c=>c.label==='Promo flag');
  se.tf={[pf.key]:{cond:null,vals:['Yes']}};const keep=tableRows(se,edBase(se),edColsAll(se));
  SEGS.push({id:'SEG-104',name:'FY26 promotion nominees',desc:'Calibration nominations with Promo flag = Yes.',type:'static',source:'csv',members:keep.map(e=>e.id),columns:clone(se.file.cols),
    values:Object.fromEntries(keep.map(e=>[e.id,se.file.values[e.id]])),file:{name:se.file.name,rows:se.file.rowsN,matched:se.file.matched.length,unmatched:se.file.unmatched.slice()},
    provenance:{filters:['Promo flag is Yes'],excluded:[],search:''},snapshotAt:'14 Nov 2026, 18:40 IST',owner:'Priya Shah',updated:'14 Nov 2026',created:'14 Nov 2026',usedSeed:[],version:1});
  SEGS.push(dyn('SEG-102','Engineering · US · L5 and above','Senior engineers outside Canada.',[{mode:'all',conds:[{f:'department',op:'anyof',v:['Engineering']},{f:'location',op:'noneof',v:['Toronto']},{f:'level',op:'gte',v:['L5']}]}],'Dana Okuneva','3 Nov 2026',['Q4 reorg · Platform']));
  SEGS.push(dyn('SEG-103','L7s in San Francisco, or Marketing in Austin who speak Spanish and French','Bilingual go-to-market leads for the LATAM and Quebec launch.',[{mode:'all',conds:[{f:'level',op:'anyof',v:['L7']},{f:'location',op:'anyof',v:['San Francisco']}]},{mode:'all',conds:[{f:'department',op:'anyof',v:['Marketing']},{f:'location',op:'anyof',v:['Austin']},{f:'languages',op:'hasall',v:['Spanish','French']}]}],'You','19 Nov 2026'));
  SEGS.push(dyn('SEG-106','On leave or leaving','People on leave or with a scheduled termination.',[{mode:'any',conds:[{f:'status',op:'anyof',v:['On leave','Scheduled termination']}]}],'Dana Okuneva','1 Nov 2026'));
  const ag=[{mode:'all',conds:[{f:'location',op:'anyof',v:['Austin']},{f:'startDate',op:'before',v:['exact','2026-07-01']}]}];
  SEGS.push({id:'SEG-105',name:'Austin office movers · Q3',desc:'Austin-based people at the time of the Q3 move.',type:'static',source:'conditions',groups:ag,members:EMP.filter(e=>evalGroups(ag,e)>=0).slice(0,Math.max(3,Math.round(EMP.length*.03))).map(e=>e.id),
    snapshotAt:'22 Sep 2026, 16:05 IST',owner:'You',updated:'22 Sep 2026',created:'22 Sep 2026',usedSeed:['Austin office move'],version:1})}

/* ================= state ================= */
const S={fOpen:new Set(),fShut:new Set(),fAll:new Set(),fFilt:[],fSel:false,aiPicked:new Set(),whatQ:'',route:'bulk',parked:[],size:412,notes:false,step:'setup',d:null,pop:null,ov:null,menu:false,approver:false,whatQ:'',setF:null,followups:0,timer:null,
  se:null,sv:null,segId:null,segTab:'members',slQ:'',slType:'all',slSort:null,hm:null,hmd:null,hmAll:[],gq:'',demo:false,modName:'',insOpen:false,colsOpen:null,segMenu:false,newMenu:false};
try{S.notes=localStorage.getItem('bc-notes')==='1'}catch(_){}
let DRAFTN=2041;
const STEPS=[{k:'setup',t:'Details',h:'Change details'},{k:'who',t:'Segments',h:'Target segments'},{k:'what',t:'Fields',h:'Fields to update'},{k:'values',t:'Values',h:'Enter values'},{k:'review',t:'Review & confirm',h:'Review and confirm'},{k:'impact',t:'Impact & approvals',h:'Impact & approvals'},{k:'status',t:'Submit & track',h:'Submission status'}];
function blankDraft(){return{id:'BC-'+(DRAFTN++),name:'',reason:'',date:null,dateKind:null,template:null,
  who:{groups:[{mode:'all',conds:[]}],incLeave:true,incTerm:false,incContract:false,cnt:null,prev:null,paste:'',pasteOpen:false},
  seq:10,mseq:{},msrc:{},cseq:{},actN:0,log:[],hist:{u:[],r:[]},fields:[],modes:{},same:{},sameCur:{},manual:{},csv:{},csvHits:new Set(),rules:[],moved:new Set(),exceptions:new Set(),applyMode:'together',ack:{},ackNote:{},
  grid:{changed:false,group:null,dept:'',issue:null,collapsed:new Set(),tool:null,scroll:0},show:{},
  cutoff:{choice:'next',confirmed:false},appSync:'effective',digest:true,notifyEmp:false,notifyMgr:true,accessAck:false,run:null,visited:new Set(['setup']),rejected:new Map()}}
function demoDraft(){const d=blankDraft();d.name='FY26 annual review';d.reason='Outcomes of the FY26 performance review cycle';d.date=NEXTP;d.dateKind='next';d.template='comp';
  d.who.groups=[{mode:'all',conds:[{f:'empid',op:'inseg',v:['SEG-101']}]}];d.fields=['compensation','title','level'];d.fields.forEach(f=>d.modes[f]='diff');
  const rs=[{field:'compensation',op:'pct',a:8,cap:'max',where:[{mode:'all',conds:[{f:'rating',op:'anyof',v:['Exceeds']}]}]},{field:'compensation',op:'pct',a:4,cap:'max',where:[{mode:'all',conds:[{f:'rating',op:'anyof',v:['Meets']}]}]}];
  logAct(d,'Created the draft',{at:'10:31 IST',kind:'draft'});
  rs.forEach((r,i)=>{d.actN++;const p=execChange(d,r,null,'Change '+d.actN);logAct(d,`Change ${d.actN}: ${ruleTxt(r)}`,{at:['10:42 IST','10:44 IST'][i],cells:p.writes.length,kind:'change'})});
  seedPromos(d);const nc=Object.values(d.csv).reduce((s2,x)=>s2+Object.keys(x).length,0);logAct(d,'Uploaded promotion-nominations-fy26.csv',{at:'10:51 IST',cells:nc,kind:'upload'});
  ['setup','who','what','values'].forEach(k=>d.visited.add(k));return d}
function extraDrafts(){const v=x=>['setup','who','what','values'].forEach(k=>x.visited.add(k));
  const go=(x,r,at)=>{x.actN++;const p=execChange(x,r,null,'Change '+x.actN);logAct(x,`Change ${x.actN}: ${ruleTxt(r)}`,{at,cells:p.writes.length,kind:'change'})};
  const c=blankDraft();c.name='Q4 launch bonus · Platform team';c.reason='Thank-you bonus for the Q4 platform launch';c.date=D(2026,11,15);c.dateKind='custom';
  c.who.groups=[{mode:'all',conds:[{f:'department',op:'anyof',v:['Engineering']},{f:'team',op:'anyof',v:['Platform']}]}];c.fields=['spotBonus'];c.modes={spotBonus:'diff'};v(c);
  const a=blankDraft();a.name='Laptop refresh · Q1 2027';a.reason='Replace laptops older than three years';a.date=D(2027,0,15);a.dateKind='custom';
  a.who.groups=[{mode:'all',conds:[{f:'department',op:'anyof',v:['Engineering','Product','Design']},{f:'refresh',op:'before',v:['exact',iso(addDays(TODAY,-1095))]}]}];a.fields=['laptop','refresh'];a.modes={laptop:'diff',refresh:'diff'};v(a);
  const b=blankDraft();b.name='2027 time off policy · Ontario';b.reason='New Ontario policy with three weeks of vacation from 1 Jan 2027';b.date=D(2027,0,1);b.dateKind='custom';
  b.who.groups=[{mode:'all',conds:[{f:'location',op:'anyof',v:['Toronto']}]}];b.fields=['timeOff'];b.modes={timeOff:'diff'};v(b);
  const prev=S.d;[c,a,b].forEach(x=>{S.d=x;dirty()});S.d=prev;dirty();
  go(c,{field:'spotBonus',op:'set',a:1000,cur:'USD',where:[]},'09:12 IST');go(a,{field:'laptop',op:'set',a:'MacBook Pro 14 M3',where:[]},'09:40 IST');go(a,{field:'refresh',op:'set',a:'2027-01-15',where:[]},'09:41 IST');
  go(b,{field:'timeOff',op:'set',a:'Canada · Ontario 2027 (3 weeks)',where:[]},'08:55 IST');return[c,a,b]}
function seedPromos(d){d.csv={};const r=rng(EMP.length+11);let k=0;
  cohort(d).list.forEach(e=>{const n=lvlN(e.level);if(e.rating==='Exceeds'&&n<7&&e.department!=='Executive'&&r()<.4){k++;const nl='L'+(n+1);const b=band(e,nl,e.per);
    let c=Math.max(b.min+(b.mid-b.min)*.6,e.compensation*1.06);if(k%11===0)c=b.max*1.06;else if(k%7===0)c=Math.min(e.compensation*1.19,b.max*.98);
    d.csv[e.id]={level:nl,title:k%13===0?e.title:ladder(e.department,nl),compensation:roundComp(c,e.per)};d.cseq=d.cseq||{};const q=++d.seq;['level','title','compensation'].forEach(f=>d.cseq[e.id+'|'+f]=q)}})}

/* ================= targeting + values ================= */
function cohort(d){const g=d.who.groups;const list=[],why=new Map(),auto={leave:0,term:0,contract:0};
  for(const e of EMP){const gi=evalGroups(g,e);if(gi<0)continue;
    const named=g[gi].conds.some(c=>c.f==='empid'&&complete(c)&&((c.op==='eq'&&c.v[0]===e.id)||(c.op==='anyof'&&c.v.includes(e.id))));
    if(!named){if(e.status==='On leave'){auto.leave++;if(!d.who.incLeave)continue}if(e.status==='Scheduled termination'){auto.term++;if(!d.who.incTerm)continue}if(e.etype==='Contractor'){auto.contract++;if(!d.who.incContract)continue}}
    const sc=g[gi].conds.find(c=>c.f==='empid'&&c.op==='inseg'&&complete(c));
    list.push(e);why.set(e.id,named?'Named by Employee ID':sc?'In '+segName(sc.v[0]):g.length>1?`Matches group ${gi+1}`:'Matches the conditions')}
  return{list,why,auto}}
function rowsOf(d){let base;if(d.run&&d.run.frozen)base=d.run.frozen.map(id=>EMPI[id]).filter(Boolean);else base=cohort(d).list;return base.filter(e=>!d.moved.has(e.id))}
const TYL={money:'Amount',int:'Number',select:'List',team:'List',text:'Text',date:'Date',person:'Person'};
function ropsFor(f){const F=FIELDS[f];if(!F)return[];const t=F.type;let o;
  if(t==='money')o=[['pct','Change by a percentage'],['add','Change by an amount'],['set','Set to an amount'],...(f!=='compensation'?[['pctbase','Set to a % of base pay']]:[])];
  else if(t==='int')o=[['add','Change by'],['pct','Change by a percentage'],['set','Set to']];
  else if(t==='select')o=[['set','Set to'],['map','Replace one value with another'],...(f==='level'?[['step','Move up or down levels']]:[])];
  else if(t==='team')o=[['set','Set to'],['map','Replace one team with another'],['first','First team in the new department']];
  else if(t==='date')o=[['set','Set to a date'],['shift','Move by a number of days'],['eff','Set to the effective date']];
  else if(t==='person')o=[['set','Set to'],['map','Replace one manager with another'],['skip',"Move to their manager's manager"]];
  else o=[['set','Set to'],['replace','Find and replace'],['prefix','Add a prefix'],['suffix','Add a suffix'],...(f==='title'?[['ladder','Use the standard title for the level']]:[])];
  return o}
function normRule(r){if(!r)return r;if(r.op)return r;const k=r.kind||'pct';let op=k;if(k==='pct'&&r.field!=='compensation'&&MONEY.has(r.field))op='pctbase';
  return{field:r.field,op,a:(k==='pct'?r.pct:r.amt),cur:r.cur||'USD',cap:r.cap||null,where:r.where?(Array.isArray(r.where)?r.where:[{mode:'all',conds:[r.where]}]):[],ai:!!r.ai,accepted:r.accepted!==false,seq:r.seq}}
const ruleWhere=r=>(r.where||[]).filter(g=>g.conds.some(complete));
const rseq=(d,r)=>r.seq??d.rules.indexOf(r);
function ruleHitV(d,e,f,lim=Infinity){for(let i=d.rules.length-1;i>=0;i--){const r=d.rules[i];if(r.field!==f||rseq(d,r)>=lim)continue;const w=ruleWhere(r);if(w.length&&evalGroups(w,e)<0)continue;const v=ruleVal(d,e,f,r);if(v!==undefined&&v!==null&&v!=='')return[r,v]}return[null,undefined]}
function ruleHit(d,e,f){return ruleHitV(d,e,f)[0]}
function ruleVal(d,e,f,r){if(!r)return undefined;const F=FIELDS[f];const o=r.op,a=r.a,b=r.b;const pv=pick(d,e,f,rseq(d,r)).v;const cur=(pv===undefined||pv===null||pv==='')?e[f]:pv;const cc=curCode(e);
  if(f==='compensation'){const per=nv(d,e,'per');if(per!==e.per)return undefined;const div=per==='Hourly'?2080:1;
    const b0=+cur||e.compensation;let x=o==='pct'?b0*(1+(+a)/100):o==='add'?b0+conv(+a,r.cur,cc)/div:o==='set'?conv(+a,r.cur,cc)/div:undefined;if(x===undefined||!isFinite(x))return undefined;
    if(r.cap&&o!=='set'){const bd=band(e,nv(d,e,'level'),per,nv(d,e,'department'),nv(d,e,'location'));const cap=r.cap==='max'?bd.max:bd.mid;if(x>cap)x=Math.max(e.compensation,cap)}return roundComp(x,per)}
  switch(F.type){
    case'money':{const c0=+cur||0;const v=o==='pct'?c0*(1+(+a)/100):o==='add'?c0+conv(+a,r.cur,cc):o==='set'?conv(+a,r.cur,cc):o==='pctbase'?annual(nv(d,e,'compensation'),nv(d,e,'per'))*(+a)/100:NaN;return isFinite(v)?Math.max(0,Math.round(v/10)*10):undefined}
    case'int':{const c0=+cur||0;const v=o==='add'?c0+(+a):o==='pct'?c0*(1+(+a)/100):o==='set'?+a:NaN;return isFinite(v)?Math.max(0,Math.round(v)):undefined}
    case'select':if(o==='set')return a;if(o==='map')return String(cur)===String(a)?b:undefined;if(o==='step'){const i=LEVELS.indexOf(cur);if(i<0)return undefined;return LEVELS[Math.max(0,Math.min(LEVELS.length-1,i+(+a||0)))]}return undefined;
    case'team':if(o==='set')return a;if(o==='map')return cur===a?b:undefined;if(o==='first')return TEAMS[nv(d,e,'department')]?.[0];return undefined;
    case'date':if(o==='set')return a;if(o==='eff')return d.date?iso(d.date):undefined;if(o==='shift'){const x=fromIso(cur);return x?iso(addDays(x,+a||0)):undefined}return undefined;
    case'person':if(o==='set')return a;if(o==='map')return cur===a?b:undefined;if(o==='skip')return EMPI[cur]?.manager||undefined;return undefined;
    default:{const c0=String(cur??'');if(o==='set')return a;if(o==='replace')return a&&c0.includes(a)?c0.split(a).join(b??''):undefined;if(o==='prefix')return a&&!c0.startsWith(a)?a+c0:undefined;if(o==='suffix')return a&&!c0.endsWith(a)?c0+a:undefined;
      if(o==='ladder')return ladder(nv(d,e,'department'),nv(d,e,'level'));return undefined}}}
function pick(d,e,f,lim=Infinity){if(d.modes[f]==='same'){if(d.same[f]===undefined||d.same[f]==='')return{v:undefined,s:null};const v=d.same[f];
    if(MONEY.has(f)){const from=(d.sameCur||{})[f]||'USD';const x=conv(+v,from,curCode(e));return{v:f==='compensation'?roundComp(e.per==='Hourly'?x/2080:x,e.per):Math.round(x/10)*10,s:'s'}}return{v,s:'s'}}
  const k=e.id+'|'+f;let best=null,bs=-1;const m=d.manual[e.id];if(m&&f in m){const q=(d.mseq||{})[k]??5;if(q<lim){bs=q;best={v:m[f],s:m[f]===''?null:'m'}}}
  const c=d.csv[e.id];if(c&&f in c){const q=(d.cseq||{})[k]??4;if(q<lim&&q>bs){bs=q;best={v:c[f],s:'c'}}}
  const[r,v]=ruleHitV(d,e,f,lim);if(r){const q=rseq(d,r);if(q>bs){best={v,s:r.ai&&!r.accepted?'ai':'r',r}}}
  return best||{v:undefined,s:null}}
function val(d,e,f){return pick(d,e,f).v}
function src(d,e,f){return pick(d,e,f).s}
function nv(d,e,f){if(!d.fields.includes(f))return e[f];const v=val(d,e,f);return(v===undefined||v===''||v===null)?e[f]:v}
function changed(d,e,f){if(!d.fields.includes(f))return false;const v=val(d,e,f);if(v===undefined||v===''||v===null)return false;return String(v)!==String(e[f])}

/* ================= validation ================= */
const POL={
  bands:{name:'Compensation bands',kind:'Company policy',owner:'Priya Shah (Finance)',where:'Settings › Compensation › Bands',changed:'1 Oct 2026',desc:'Minimum, midpoint and maximum pay for each level and department. Pay above the maximum is blocked unless Finance approves an exception.'},
  merit:{name:'FY26 merit guidelines',kind:'Company policy',owner:'Priya Shah (Finance)',where:'Settings › Compensation › Review cycles',changed:'15 Sep 2026',desc:'Raises above 15% are flagged for a second look.'},
  org:{name:'Org structure rules',kind:'Built into Rippling',owner:'Rippling',where:'Not editable',changed:'',desc:"A team belongs to one department, and reporting lines can't loop or point at someone who is leaving."},
  entity:{name:'Legal entities',kind:'Company setup',owner:'Dana Okuneva (People)',where:'Settings › Company › Entities',changed:'3 Mar 2026',desc:'Work locations in another country belong to a different legal entity, so moving there is an international transfer.'},
  payroll:{name:'Payroll calendar',kind:'Company setup',owner:'Priya Shah (Finance)',where:'Settings › Payroll › Pay schedules',changed:'2 Jan 2026',desc:'Semi-monthly runs on the 15th and the last day of the month, with a cutoff three days before each run.'},
  flsa:{name:'Overtime classification',kind:'Compliance rule in Rippling',owner:'Rippling',where:'Not editable',changed:'',desc:'Switching between hourly and salaried changes overtime eligibility and how pay is calculated.'},
  equity:{name:'Equity plan rules',kind:'Company policy',owner:'Priya Shah (Finance)',where:'Settings › Equity',changed:'20 Jun 2026',desc:'Grants are added, not reduced. A decrease is flagged.'},
  ladder:{name:'Job architecture',kind:'Company setup',owner:'Dana Okuneva (People)',where:'Settings › Job architecture',changed:'8 Aug 2026',desc:'Each level and department has a standard title.'},
  identity:{name:'Identity and sign-in',kind:'Company setup',owner:'Raj Patel (IT)',where:'Settings › Apps › Identity',changed:'11 May 2026',desc:'Work email is the sign-in for Google Workspace, Slack and GitHub.'},
  pto:{name:'Time off policies by country',kind:'Company policy',owner:'Dana Okuneva (People)',where:'Settings › Time off › Policies',changed:'1 Nov 2026',desc:'Each time off policy applies to one country.'},
  drafts:{name:'Draft conflicts',kind:'Built into Rippling',owner:'Rippling',where:'Not editable',changed:'',desc:'Two drafts that change the same people and fields are flagged, so the second one shows a conflict.'},
  approvals:{name:'Approval thresholds',kind:'Company policy',owner:'Priya Shah (Finance) and Dana Okuneva (People)',where:'Settings › Approvals',changed:'1 Oct 2026',desc:'Changes inside your limits apply without approval. Changes above them are routed to the owner named in the thresholds table.'},
  fx:{name:'Exchange rates',kind:'Company setup',owner:'Priya Shah (Finance)',where:'Settings › Currencies',changed:'20 Nov 2026',desc:'1 USD = 1.37 CAD. Used whenever an amount is entered in a currency other than the employee\'s own.'}};
const POL_APPLIES={bands:'Error and warning',merit:'Warning',org:'Error',entity:'Error',payroll:'Warning',flsa:'Warning',equity:'Warning',ladder:'Info',identity:'Info',pto:'Error',drafts:'Warning',approvals:'Approval',fx:'Conversion'};
const THRESH=[['Base pay raise','8% or less, and inside the band','Priya Shah (Finance)'],['Base pay above the band maximum','Never: needs an exception','Priya Shah (Finance)'],['Pay type','Never','Priya Shah (Finance)'],['Target annual bonus','Never','Priya Shah (Finance)'],
  ['One-time bonus','2,500 USD equivalent or less','Priya Shah (Finance)'],['Equity grant','Never','Priya Shah (Finance)'],['Level (promotion)','Never','Dana Okuneva (People)'],['Manager, department or work location','Never','Dana Okuneva (People)'],['Benefits class','Never','Dana Okuneva (People)'],['Work email','Never','Raj Patel (IT)'],
  ['Title, team, time off policy, laptop, device refresh date, cost center, on-call rotation','Always','No approval']];
const ISS={
  band_max:{sev:'e',f:'compensation',pol:'bands',label:'Above the band maximum',desc:'Base pay is above the hard maximum for the new level.',how:'Cap it at the maximum, request an exception (Finance then approves the row), or change the level.',fix:[['Cap at band maximum','capmax'],['Request an exception','exception'],['Move to a new draft','move']]},
  bad_number:{sev:'e',f:'compensation',pol:null,label:'Not a valid amount',desc:"The value couldn't be read as an amount.",how:'Type a number, for example 92500 or 92.5k.',fix:[['Clear these values','clearcomp']]},
  team_dept:{sev:'e',f:'team',pol:'org',label:"Team doesn't belong to the new department",desc:'Team is filtered by Department, so the old team is no longer valid.',how:'Pick a team in the new department.',fix:[["Use each department's first team",'fixteam']]},
  cross_country:{sev:'e',f:'location',pol:'entity',label:'Moves to another country',desc:'A move to another country is an international transfer, not a bulk edit.',how:'Remove these people from this change and start an international transfer.',fix:[['Move to a new draft','move']]},
  mgr_cycle:{sev:'e',f:'manager',pol:'org',label:'Manager creates a reporting loop',desc:'The new manager reports up to this employee.',how:'Pick a manager outside this person\'s reporting line.',fix:[['Undo the manager change','clearmgr']]},
  mgr_term:{sev:'e',f:'manager',pol:'org',label:'New manager has a scheduled termination',desc:'Approval chains would break on the termination date.',how:'Pick a manager who is staying.',fix:[['Undo the manager change','clearmgr']]},
  pto_country:{sev:'e',f:'timeOff',pol:'pto',label:"Time off policy doesn't match the work location's country",desc:'Each time off policy applies to one country.',how:"Pick a policy for the person's country.",fix:[["Use each person's current policy",'ptokeep']]},
  conflict:{sev:'w',f:null,pol:'drafts',label:"Also in Dana Okuneva's draft 'Q4 reorg'",desc:'Both drafts change reporting lines. Whichever is submitted second shows a conflict.',how:'Agree with Dana which draft owns these people, or remove them from one.'},
  band_exc:{sev:'w',f:'compensation',pol:'bands',label:'Band exception requested',desc:'Above the band maximum. Finance must approve these rows.',how:'No action needed. Finance sees these rows first.'},
  raise15:{sev:'w',f:'compensation',pol:'merit',label:'Raise above 15%',desc:'Valid, but unusual for an annual cycle. Finance sees these first.',how:'Acknowledge it if intended, or lower the raise.'},
  above_mid:{sev:'w',f:'compensation',pol:'bands',label:'Crosses the band midpoint',desc:'Moves from below the midpoint to above it.',how:'Acknowledge it if intended.'},
  unit_switch:{sev:'w',f:'per',pol:'flsa',label:'Pay type changes (Hourly ↔ Salaried)',desc:'Changes overtime eligibility and how payroll calculates pay.',how:'Acknowledge it if intended. Base pay is shown annualised in the grid.'},
  equity_down:{sev:'w',f:'equity',pol:'equity',label:'Equity decreases',desc:'Share counts usually only go up.',how:'Acknowledge it if intended, or restore the current number.'},
  retro:{sev:'w',f:null,pol:'payroll',label:'Effective date is in a paid period',desc:'Payroll computes retro pay in the next run.',how:'Acknowledge it, or move the effective date on Details.'},
  title_ladder:{sev:'i',f:'title',pol:'ladder',label:"Title doesn't follow the level ladder",desc:'Allowed. Some titles are intentionally off-ladder.',how:'Use the standard title if you meant to.',fix:[['Use the ladder title','laddertitle']]},
  email_identity:{sev:'i',f:'email',pol:'identity',label:'Work email renames sign-in for every app',desc:'Google Workspace, Slack and GitHub accounts are renamed on the effective date.',how:'No action needed. Raj Patel (IT) approves these rows.'}
};
const deptOfTeam=t=>Object.keys(TEAMS).find(dp=>TEAMS[dp].includes(t))||'another department';
function whyIssue(k,d,e){const N=f=>nv(d,e,f);const cu=curOf(e);const b=()=>band(e,N('level'),N('per'),N('department'),N('location'));const hr=N('per')==='Hourly'?' per hour':'';
  switch(k){case'band_max':return`New base pay ${fmtVal(e,'compensation',N('compensation'))} is above the ${N('level')} ${N('department')} maximum of ${cu}${fmtN(b().max)}${hr}.`;
    case'band_exc':return`New base pay ${fmtVal(e,'compensation',N('compensation'))} is above the maximum of ${cu}${fmtN(b().max)}${hr}. You requested an exception, so Finance must approve it.`;
    case'above_mid':return`Moves from ${fmtVal(e,'compensation',e.compensation)} to ${fmtVal(e,'compensation',N('compensation'))}, past the midpoint of ${cu}${fmtN(b().mid)}${hr}.`;
    case'raise15':{const p=(+N('compensation')-e.compensation)/e.compensation*100;return`A raise of ${p.toFixed(1)}%. The guideline flags anything above 15%.`}
    case'bad_number':return`"${val(d,e,'compensation')}" isn't an amount.`;
    case'team_dept':return`Team "${N('team')}" belongs to ${deptOfTeam(N('team'))}, not ${N('department')}.`;
    case'cross_country':return`${e.location} (${LOC[e.location].country}) to ${N('location')} (${LOC[N('location')].country}) changes legal entity.`;
    case'mgr_cycle':return`${EMPI[N('manager')]?.name} reports up to ${e.name}, so the reporting line would loop.`;
    case'mgr_term':return`${EMPI[N('manager')]?.name} has a scheduled termination.`;
    case'pto_country':return`"${N('timeOff')}" is a ${ptoCountry(N('timeOff'))==='CA'?'Canadian':'US'} policy, but ${e.name} works in ${N('location')}.`;
    case'conflict':return`${e.name} is also in BC-2037 (Dana Okuneva), which changes reporting lines.`;
    case'unit_switch':return`${e.per} to ${N('per')} changes overtime eligibility.`;
    case'equity_down':return`${fmtN(e.equity)} to ${fmtN(+N('equity'))} shares.`;
    case'retro':return`Effective ${fmtD(d.date)} is in a pay period that has already been paid.`;
    case'title_ladder':return`The standard title for ${N('level')} in ${N('department')} is "${ladder(N('department'),N('level'))}".`;
    case'email_identity':return`Sign-in changes from ${e.email} to ${N('email')} in every connected app.`}return''}
const APPROVERS={finance:{who:'Priya Shah',role:'Head of Finance',short:'Finance'},hrbp:{who:'Dana Okuneva',role:'Director, People',short:'People'},it:{who:'Raj Patel',role:'Director, IT',short:'IT'}};
const SELF_LIMIT={raisePct:8,bonusUSD:2500};
function rowApprovals(d,e){const out=[];const ch=f=>changed(d,e,f);const add=(k,w)=>{const x=out.find(y=>y.k===k);if(x)x.why.push(w);else out.push({k,why:[w]})};
  if(ch('compensation')&&nv(d,e,'per')===e.per){const p=(+nv(d,e,'compensation')-e.compensation)/e.compensation*100;if(p>SELF_LIMIT.raisePct)add('finance',`raise of ${p.toFixed(1)}% is above your ${SELF_LIMIT.raisePct}% limit`)}
  if(d.exceptions&&d.exceptions.has(e.id)&&ch('compensation'))add('finance','band exception');
  if(ch('per'))add('finance','pay type change');if(ch('bonus'))add('finance','target bonus change');
  if(ch('spotBonus')){const u=usd(e,+nv(d,e,'spotBonus'));if(u>SELF_LIMIT.bonusUSD)add('finance',`one-time bonus of ${fmtN(u)} USD equivalent is above the ${fmtN(SELF_LIMIT.bonusUSD)} USD limit`)}
  if(ch('equity'))add('finance','equity grant');if(ch('level'))add('hrbp','promotion');if(ch('manager')||ch('department')||ch('location'))add('hrbp','reporting line or location change');if(ch('benefits'))add('hrbp','benefits class change');if(ch('email'))add('it','work email rename');
  return out}
const ISS_ORDER=Object.keys(ISS);
function rowIssues(d,e){const out=[];const has=f=>d.fields.includes(f);const ch=f=>changed(d,e,f);if(!d.fields.some(ch))return out;
  if(ch('compensation')){const v=+val(d,e,'compensation');if(!(v>0))out.push('bad_number');else{const per=nv(d,e,'per');const b=band(e,nv(d,e,'level'),per,nv(d,e,'department'),nv(d,e,'location'));
    if(v>b.max)out.push(d.exceptions&&d.exceptions.has(e.id)?'band_exc':'band_max');else if(v>b.mid&&e.compensation<=band(e,e.level,e.per).mid)out.push('above_mid');if(per===e.per&&(v-e.compensation)/e.compensation>.15)out.push('raise15')}}
  if(ch('per'))out.push('unit_switch');
  if((ch('department')||ch('team'))&&has('department')){const dp=nv(d,e,'department'),t=nv(d,e,'team');if(!TEAMS[dp].includes(t))out.push('team_dept')}
  if(ch('location')&&LOC[nv(d,e,'location')].country!==LOC[e.location].country)out.push('cross_country');
  if(ch('manager')){const m=nv(d,e,'manager');if(m===e.id||under(EMPI[m],e.id))out.push('mgr_cycle');else if(EMPI[m]?.status==='Scheduled termination')out.push('mgr_term')}
  if(ch('timeOff')){const pc=ptoCountry(nv(d,e,'timeOff'));if(pc&&pc!==LOC[nv(d,e,'location')].country)out.push('pto_country')}
  if(ch('equity')&&+nv(d,e,'equity')<e.equity)out.push('equity_down');
  if((ch('title')||ch('level'))&&nv(d,e,'title')!==ladder(nv(d,e,'department'),nv(d,e,'level')))out.push('title_ladder');
  if(ch('email'))out.push('email_identity');
  if(d.date&&d.date<TODAY)out.push('retro');
  if(CONFLICT.has(e.id)&&(has('manager')||has('department')||has('team')))out.push('conflict');
  return out}
let A_CACHE=null;
function analyze(d){if(A_CACHE&&A_CACHE.d===d)return A_CACHE;const rows=rowsOf(d);const rowIss=new Map(),issues={},rowChanged=new Set(),rowAppr=new Map(),apCount={finance:0,hrbp:0,it:0};let changes=0;
  for(const e of rows){let c=0;for(const f of d.fields)if(changed(d,e,f))c++;if(c){rowChanged.add(e.id);changes+=c;const ap=rowApprovals(d,e);if(ap.length){rowAppr.set(e.id,ap);ap.forEach(x=>apCount[x.k]++)}}
    const iss=rowIssues(d,e);if(iss.length){rowIss.set(e.id,iss);iss.forEach(k=>(issues[k]=issues[k]||[]).push(e.id))}}
  let err=0,warn=0,info=0;for(const k in issues){const s2=ISS[k].sev;if(s2==='e')err+=issues[k].length;else if(s2==='w')warn+=issues[k].length;else info+=issues[k].length}
  A_CACHE={d,rows,rowIss,issues,rowChanged,changes,err,warn,info,rowAppr,apCount,needAppr:rowAppr.size,noAppr:rowChanged.size-rowAppr.size};return A_CACHE}
const dirty=()=>{A_CACHE=null;SEGC.clear()};

/* ================= impact ================= */
function impact(d){const A=analyze(d);const R=A.rows.filter(e=>A.rowChanged.has(e.id));const ch=(e,f)=>changed(d,e,f);const N=(e,f)=>nv(d,e,f);
  const I={people:R.length};
  I.pay=R.filter(e=>ch(e,'compensation')||ch(e,'per')||ch(e,'bonus')||ch(e,'spotBonus')).length;
  I.tax=R.filter(e=>ch(e,'location')&&LOC[N(e,'location')].state!==LOC[e.location].state).length;
  let delta=0,base=0,spot=0;A.rows.forEach(e=>{base+=usd(e,annual(e.compensation,e.per))});
  R.forEach(e=>{if(ch(e,'compensation')||ch(e,'per'))delta+=usd(e,annual(+N(e,'compensation'),N(e,'per')))-usd(e,annual(e.compensation,e.per));if(ch(e,'spotBonus'))spot+=usd(e,+N(e,'spotBonus'))});
  I.delta=delta;I.base=base;I.spot=spot;I.spotN=R.filter(e=>ch(e,'spotBonus')).length;I.cad=R.filter(e=>curCode(e)==='CAD'&&d.fields.some(f=>MONEY.has(f)&&ch(e,f))).length;
  I.benSal=R.filter(e=>(ch(e,'compensation')||ch(e,'per'))&&N(e,'per')==='Salaried').length;
  I.benLoc=R.filter(e=>ch(e,'location')&&LOC[N(e,'location')].state!==LOC[e.location].state).length;
  I.benClass=R.filter(e=>ch(e,'per')).length;I.benCls=R.filter(e=>ch(e,'benefits')).length;
  I.pto=I.benLoc;I.ot=R.filter(e=>ch(e,'per')).length;I.ptoPol=R.filter(e=>ch(e,'timeOff')).length;
  I.devPol=R.filter(e=>ch(e,'department')).length;I.laptops=R.filter(e=>ch(e,'laptop')).length;I.refreshN=R.filter(e=>ch(e,'refresh')).length;I.dev=I.devPol+I.laptops+I.refreshN;
  I.wf=R.filter(e=>ch(e,'manager')).length;I.wfAppr=R.filter(e=>ch(e,'manager')).reduce((s2,e)=>s2+(parseInt(e.id.slice(1))%3),0);
  const cnt=pred=>R.filter(pred).length;const deptCh=e=>ch(e,'department')||ch(e,'team');
  I.apps={
    slack:{name:'Slack',items:[[cnt(e=>ch(e,'title')),'profile title updates','Title → Slack profile title'],[cnt(e=>ch(e,'manager')),'manager field updates','Manager → Slack profile manager'],[cnt(e=>ch(e,'location')),'location and time zone updates','Work location → Slack time zone'],[cnt(e=>ch(e,'department')),'user-group moves','Department → Slack user groups'],[cnt(e=>ch(e,'email')),'sign-in email changes','Work email → Slack account email'],[cnt(e=>ch(e,'oncall')),'on-call group changes','On-call rotation → Slack on-call group']],
      loss:cnt(e=>ch(e,'department')),lossTxt:n=>`${pl(n,'person','people')} will lose their old department channels`},
    google:{name:'Google Workspace',items:[[cnt(e=>ch(e,'title')),'directory title updates','Title → Directory title'],[cnt(deptCh),'OU and group moves','Department, Team → Org unit and Groups'],[cnt(e=>ch(e,'manager')),'directory manager updates','Manager → Directory manager'],[cnt(e=>ch(e,'location')),'building and address updates','Work location → Directory building'],[cnt(e=>ch(e,'email')),'primary email renames','Work email → Primary email (renames sign-in)']],
      loss:cnt(deptCh),lossTxt:n=>`${pl(n,'person','people')} will lose their old department Groups`},
    github:{name:'GitHub',items:[[cnt(e=>(ch(e,'team')||ch(e,'department'))&&['Engineering','Product'].includes(N(e,'department'))),'team membership changes','Team → GitHub team'],[cnt(e=>ch(e,'email')&&['Engineering','Product'].includes(e.department)),'SSO email updates','Work email → SSO identity']],
      loss:cnt(e=>ch(e,'department')&&['Engineering','Product'].includes(e.department)&&!['Engineering','Product'].includes(N(e,'department'))),lossTxt:n=>`${pl(n,'person','people')} will lose access to the GitHub organisation`},
    pagerduty:{name:'PagerDuty',items:[[cnt(e=>ch(e,'oncall')),'schedule changes','On-call rotation → PagerDuty schedule']],loss:0,lossTxt:()=>''}};
  Object.values(I.apps).forEach(a=>{a.total=a.items.reduce((s2,x)=>s2+x[0],0)});I.losses=Object.values(I.apps).reduce((s2,a)=>s2+a.loss,0);
  const what={finance:'Raises above 8%, band exceptions, pay type, target bonus, one-time bonuses above 2,500 USD, equity',hrbp:'Promotions, reporting line, department, location and benefits class changes',it:'Work email renames'};
  I.approvers=Object.entries(A.apCount).filter(([,n])=>n).map(([k,n])=>({k,...APPROVERS[k],n,what:what[k]}));return I}
/* ================= shell ================= */
const ICON={bulk:'<path d="M2 5l6-3 6 3-6 3z M2 8l6 3 6-3 M2 11l6 3 6-3" fill="none" stroke="currentColor" stroke-width="1.4"/>',
  segments:'<circle cx="6" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="10" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="1.4"/>',
  people:'<circle cx="6" cy="5.5" r="2.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M1.5 14c0-2.8 2-4.5 4.5-4.5s4.5 1.7 4.5 4.5M11 3.5a2.3 2.3 0 0 1 0 4.4M12.5 9.8c1.3.6 2 1.9 2 4.2" fill="none" stroke="currentColor" stroke-width="1.4"/>',
  payroll:'<rect x="1.5" y="3.5" width="13" height="9" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="8" r="1.8" fill="none" stroke="currentColor" stroke-width="1.4"/>',
  benefits:'<path d="M8 13.5S2 10 2 6a3 3 0 0 1 6-1 3 3 0 0 1 6 1c0 4-6 7.5-6 7.5z" fill="none" stroke="currentColor" stroke-width="1.4"/>',
  time:'<circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M8 4.5V8l2.5 1.5" fill="none" stroke="currentColor" stroke-width="1.4"/>',
  devices:'<rect x="2.5" y="3" width="11" height="7.5" rx="1" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M1 13h14" stroke="currentColor" stroke-width="1.4"/>',
  apps:'<rect x="2" y="2" width="5" height="5" rx="1" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="9" y="2" width="5" height="5" rx="1" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="2" y="9" width="5" height="5" rx="1" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="9" y="9" width="5" height="5" rx="1" fill="none" stroke="currentColor" stroke-width="1.4"/>',
  reports:'<path d="M3 13V8M8 13V3M13 13V6" stroke="currentColor" stroke-width="1.8"/>',
  settings:'<circle cx="8" cy="8" r="2.3" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" stroke="currentColor" stroke-width="1.4"/>'};
const ic=k=>`<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">${ICON[k]}</svg>`;
const NAV=[['bulk','Bulk change'],['segments','Segments'],['people','People'],'sep',['payroll','Payroll'],['benefits','Benefits'],['time','Time'],['devices','Devices'],['apps','Apps'],['reports','Reports'],['settings','Settings']];
function navKey(){return S.route==='draft'?'bulk':(S.route==='segment'||S.route==='segedit')?'segments':S.route==='module'?S.modName:S.route}
function renderNav(){const k=navKey();const tier=S.route==='draft'&&!!S.d;$('#frame').classList.toggle('tier',tier);
  $('#gnav').innerHTML=`<div class="nh">Workforce</div>`+NAV.map(x=>x==='sep'?'<div class="sep"></div><div class="nh">Products</div>':`<button class="${x[0]===k?'on':''}" data-act="nav" data-k="${x[0]}" title="${x[1]}">${ic(x[0])}<span class="lbl">${x[1]}</span></button>`).join('');
  $('#snav').innerHTML=tier?snavHtml():''}
function snavHtml(){const d=S.d;const locked=!!d.run;
  const steps=STEPS.map((s,i)=>{const can=locked?s.k==='status':d.visited.has(s.k)&&s.k!=='status';const on=s.k===S.step&&!S.approver;const done=d.visited.has(s.k)&&!on&&!locked;return navBtn(s.t,on,`data-act="step" data-k="${s.k}"`,!can,done?'✓':String(i+1),done?'done':'')}).join('');
  return`<div class="sh"><button class="crumbback" data-act="nav" data-k="bulk">← All bulk changes</button><b>${esc(d.name||'New bulk change')}</b><small class="muted">${esc(d.id)}${locked?' · submitted':' · draft'}</small></div>${steps}${S.approver?navBtn('Approval · Priya Shah',true,'',false,'•'):''}<div class="side-foot">${locked?'Submitted changes are read-only. Use Create reversal to change them.':'Autosaved · 11:20 IST'}</div>`}
function render(){dirty();let h='';
  switch(S.route){case'bulk':h=bulkList();break;case'draft':h=draftPage();break;case'segments':h=segList();break;case'segment':h=segDetail();break;
    case'segedit':h=`<div class="crumbs"><button data-act="nav" data-k="segments">Segments</button><span>/</span><span>${S.se.segId?'Edit segment':'New '+(S.se.type==='static'?'static':'dynamic')+' segment'}</span></div>`+segEditor(S.se);break;
    case'people':h=peoplePage();break;case'settings':h=settingsPage();break;default:h=placeholder()}
  $('#app').innerHTML=h+`<p class="disclaimer">Concept prototype by Vrajesh Iyengar for a Rippling product case study. Acme Corp, its people and all data are fictional. Not a Rippling product.</p>`;
  renderNav();renderSheet();renderOverlay();renderNotes();renderDemo();renderDrawer();renderHM();renderDD();afterRender()}
function renderSheet(){const on=!!(S.se&&S.se.inSheet);$('#sheet').classList.toggle('on',on);$('#sheetbg').classList.toggle('on',on);
  $('#sheet').innerHTML=on?`<div class="sheet-h"><b>Create segment</b><span class="muted" style="font-size:13px">Your bulk change stays open behind this. Saving adds the segment to its targeting.</span><span class="sp"></span><button class="btn2 sm" data-act="sheetclose">Close X</button></div><div class="sheet-b">${segEditor(S.se)}</div>`:''}
function renderDemo(){$('#demo').innerHTML=(S.demo?`<div class="dpanel pp"><span class="demo-l">Demo controls · not part of the product</span>
  <div><div class="muted" style="margin-bottom:4px">Company size</div><div class="seg2">${[12,412,5000].map(n=>`<button class="${S.size===n?'on':''}" data-act="size" data-n="${n}">${fmtN(n)}</button>`).join('')}</div></div>
  <label class="tg"><input type="checkbox" data-act="notes" ${S.notes?'checked':''}> Show "Why this?" notes</label>
  <div style="display:flex;flex-direction:column;gap:4px"><span class="muted">Presentation pages</span><a href="approach.html" target="_blank" rel="noopener">Approach ↗</a><a href="propagation.html" target="_blank" rel="noopener">Propagation ↗</a></div>
  <div style="display:flex;flex-direction:column;gap:4px"><span class="muted">Sample CSV files (match the ${fmtN(412)}-person company)</span>${Object.keys(SAMPLES).map(f=>`<a href="samples/${f}" download>${f}</a>`).join('')}</div></div>`:'')+`<button class="fab" data-act="demo">${S.demo?'Close':'Demo controls'}</button>`}
function toast(m,type){if(!type)type=/^(Name the|Add at least|No one would|Enter |Pick |Fill in|Choose an|None of|Try a|Add a reason|No one called|Give the|Fix the formula)/.test(m)||/isn't an amount/.test(m)?'error':/^(Not part|This is Dana|Change the date|Selected\.|A reversal)/.test(m)?'info':'success';
  const el=document.createElement('div');el.className='toast t-'+type;el.setAttribute('role',type==='error'?'alert':'status');
  el.innerHTML=`<span class="ti">${{success:'✓',error:'!',warning:'!',info:'i'}[type]}</span><div><b>${{success:'Done',error:"Can't continue",warning:'Check this',info:'Note'}[type]}</b><div>${esc(m)}</div></div><button class="tx" aria-label="Dismiss">×</button><i class="tbar" style="animation-duration:${type==='error'?8:5}s"></i>`;
  el.querySelector('.tx').onclick=()=>el.remove();el.querySelector('.tbar').addEventListener('animationend',()=>el.remove());const box=$('#toasts');box.prepend(el);while(box.children.length>4)box.lastChild.remove()}
const navBtn=(label,on,attrs='',dis=false,n='',cls='')=>`<button class="nav-i ${on?'on':''} ${cls}" ${attrs} ${dis?'disabled':''}>${n?`<span class="n">${n}</span>`:''}${esc(label)}</button>`;
const kv=(l,v,c='')=>`<div class="kv"><span>${esc(l)}</span><b class="${c}" title="${esc(String(v).replace(/<[^>]+>/g,''))}">${v}</b></div>`;
const row=(l,v,req)=>`<div class="r"><div class="l ${req?'req':''}">${esc(l)}</div><div class="v">${v}</div></div>`;
const person=(e,sub)=>`<span class="person"><span class="av">${initials(e.name)}</span><span><b>${esc(e.name)}</b>${sub?`<br><small class="muted">${esc(sub)}</small>`:''}</span></span>`;
function renderSearch(){const q=S.gq.trim().toLowerCase();const el=$('#gres');if(q.length<2){el.innerHTML='';return}
  const ppl=EMP.filter(e=>e.name.toLowerCase().includes(q)||e.id.toLowerCase().includes(q)).slice(0,5);const segs=SEGS.filter(s=>s.name.toLowerCase().includes(q)).slice(0,4);
  const drs=[S.d,...S.parked].filter(Boolean).filter(d=>(d.name||'').toLowerCase().includes(q)).slice(0,3);
  el.innerHTML=((ppl.length?'<h6>People</h6>'+ppl.map(e=>`<button data-act="gsp" data-id="${e.id}"><span>${esc(e.name)}</span><span class="muted">${e.id} · ${esc(e.title)}</span></button>`).join(''):'')+
    (segs.length?'<h6>Segments</h6>'+segs.map(s=>`<button data-act="gss" data-id="${s.id}"><span>${esc(s.name)}</span>${typeBadge(s)}</button>`).join(''):'')+
    (drs.length?'<h6>Bulk changes</h6>'+drs.map(d=>`<button data-act="gsd" data-id="${d.id}"><span>${esc(d.name)}</span><span class="muted">${d.id}</span></button>`).join(''):''))||'<h6>No results</h6>'}

/* ================= pages: bulk list, people, placeholder ================= */
function bulkList(){const rows=[];const iso2=d=>d?iso(d):'';
  for(const d of [S.d,...S.parked].filter(Boolean)){const A=analyze(d);const st=d.run?(d.run.phase==='approval'?'Awaiting approval':d.run.phase==='scheduled'?'Scheduled':'Committed'):`Draft · ${STEPS.find(s=>s.k===lastStep(d)).t}`;
    rows.push({id:d.id,act:'resume',name:d.name||'Untitled change',sub:`${d.id} · You · edited today`,status:st,segs:[...new Set(d.who.groups.flatMap(g=>g.conds.filter(c=>c.f==='empid'&&c.op==='inseg'&&c.v[0]).map(c=>segName(c.v[0]))))].join(', ')||'Custom conditions',people:A.rows.length,fields:d.fields.map(f=>FIELDS[f].label).join(', '),eff:iso2(d.date)})}
  if(S.followups)rows.push({id:'fu',name:`${(S.d&&S.d.name)||'FY26 annual review'} · follow-ups`,sub:'Rows moved out of the main change',status:'Draft',segs:'Named employees',people:S.followups,fields:'Base pay, Title, Level',eff:iso(NEXTP)});
  rows.push({id:'BC-2037',act:'q4',name:'Q4 reorg · Platform',sub:'BC-2037 · Dana Okuneva · edited 2 days ago',status:'Draft · Values',segs:'Engineering · US · L5 and above',people:EMP.filter(e=>CONFLICT.has(e.id)).length,fields:'Department, Team, Manager',eff:'2027-01-01'});
  rows.push({id:'BC-2019',name:'Austin office move',sub:'BC-2019 · You · completed',status:'Committed',segs:'Austin office movers · Q3',people:members('SEG-105').size,fields:'Work location, Manager',eff:'2026-09-22'});
  const badge=st=>st.startsWith('Draft')?`<span class="badge b-lock">${esc(st)}</span>`:st==='Committed'?`<span class="badge b-ok">${st}</span>`:st==='Scheduled'?`<span class="badge b-appr">${st}</span>`:`<span class="badge b-warn">${esc(st)}</span>`;
  const cols=[{key:'name',label:'Change',type:'text',get:r=>r.name,render:r=>`<b>${esc(r.name)}</b><br><small class="muted">${esc(r.sub)}</small>`},{key:'status',label:'Status',type:'pick',get:r=>r.status,render:r=>badge(r.status)},
    {key:'segs',label:'Segments',type:'text',get:r=>r.segs,wrap:true},{key:'people',label:'People',type:'num',get:r=>r.people},{key:'fields',label:'Fields',type:'text',get:r=>r.fields,wrap:true},{key:'eff',label:'Effective',type:'date',get:r=>r.eff}];
  return`<div class="ph"><div><h1>Bulk change</h1><p>Change attributes for many employees at once. Drafts save as you go.</p></div><div class="pa"><button class="btn2" data-act="nav" data-k="segments">Manage segments</button><button class="btn" data-act="newdraft">New bulk change</button></div></div>
  ${dataTable('bulk',tsOf('bulk'),rows,cols,{searchPh:'Search bulk changes',rowAttrs:r=>r.act?`data-act="${r.act}" data-id="${r.id}"`:''})}`}
function lastStep(d){let k='setup';STEPS.forEach(s=>{if(d.visited.has(s.k)&&(s.k!=='status'||d.run))k=s.k});return k}
function peoplePage(){const cols=[{key:'name',label:'Name',type:'text',get:e=>e.name,render:e=>person(e)},{key:'id',label:'Employee ID',type:'text',get:e=>e.id},{key:'title',label:'Title',type:'text',get:e=>e.title},{key:'department',label:'Department',type:'pick',get:e=>e.department},
    {key:'location',label:'Work location',type:'pick',get:e=>e.location},{key:'level',label:'Level',type:'ord',get:e=>e.level},{key:'startDate',label:'Start date',type:'date',get:e=>e.startDate}];
  return`<div class="ph"><div><h1>People</h1><p>${fmtN(EMP.length)} employees at Acme Corp. Open anyone to see the single-employee profile.</p></div></div>${dataTable('people',tsOf('people'),EMP,cols,{searchPh:'Search people',rowAttrs:e=>`data-act="profile" data-id="${e.id}"`})}`}
function placeholder(){const n=(NAV.find(x=>x[0]===S.modName)||[0,'Module'])[1];return`<div class="ph"><div><h1>${esc(n)}</h1></div></div><div class="pcard"><div class="empty"><b>Not part of this prototype</b><span>Bulk change, Segments, People and Settings are built. ${esc(n)} reads the same employee record they change.</span><button class="btn2" data-act="nav" data-k="bulk">Go to Bulk change</button></div></div>`}
function settingsPage(){const rows=Object.entries(POL).map(([k,p])=>({id:k,...p,applies:POL_APPLIES[k]}));
  const cols=[{key:'name',label:'Rule',type:'text',get:r=>r.name,render:r=>`<b>${esc(r.name)}</b><br><small class="muted">${esc(r.desc)}</small>`,wrap:true},{key:'applies',label:'Shows up as',type:'pick',get:r=>r.applies},{key:'kind',label:'Type',type:'pick',get:r=>r.kind},
    {key:'owner',label:'Owner',type:'pick',get:r=>r.owner,wrap:true},{key:'where',label:'Where it is set',type:'text',get:r=>r.where},{key:'changed',label:'Last changed',type:'date',get:r=>parseDateStr(r.changed)||''}];
  return`<div class="crumbs"><span>Settings</span><span>/</span><span>Bulk change rules</span></div><div class="ph"><div><h1>Bulk change rules</h1><p>Every error, warning, approval and currency conversion in a bulk change comes from one of these. Owners change them where listed; rules built into Rippling can't be changed.</p></div></div>
  ${dataTable('pol',tsOf('pol'),rows,cols,{searchPh:'Search rules',rowAttrs:r=>`data-act="policy" data-k="${r.id}"`})}
  <div class="pcard"><h3>Approval thresholds</h3><div class="tw"><table class="t"><thead><tr><th>Change</th><th>No approval when</th><th>Otherwise approved by</th></tr></thead><tbody>${THRESH.map(r=>`<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('')}</tbody></table></div><p class="note">Set by Priya Shah (Finance) and Dana Okuneva (People) in Settings › Approvals. Limits apply to the person submitting the change: Sam Rivera, HR admin.</p></div>
  <div class="pcard"><h3>Exchange rates</h3><div class="rows">${Object.entries(FX).filter(([k])=>k!=='USD').map(([k,v])=>row('1 USD → '+k,String(v))).join('')}${row('Set by','Priya Shah (Finance), 20 Nov 2026')}</div><p class="note">Amounts can be entered in any of these. Each person is paid in their own pay currency, which comes from their work location's legal entity.</p></div>`}
/* ================= draft (bulk change editor) ================= */
function draftPage(){if(S.approver)return`<div class="crumbs"><button data-act="nav" data-k="bulk">Bulk change</button><span>/</span><span>${esc(S.d.name)}</span><span>/</span><span>Approval</span></div>`+approverView();
  return`<div class="crumbs"><button data-act="nav" data-k="bulk">Bulk change</button><span>/</span><span>${esc(S.d.name||'New bulk change')}</span></div>`+draftView()}
function draftView(){const d=S.d;const st=STEPS.find(s=>s.k===S.step);const A=analyze(d);const locked=!!d.run;
  const head=`<header class="bar"><h2>${esc(st.h)}</h2><div class="bar-act">${locked?`<button data-act="nav" data-k="bulk">Back to Bulk change</button>`:`<button data-act="saveexit">Save &amp; exit</button><button data-act="menu" aria-label="More">⋯</button>`}</div>${S.menu?`<div class="menu pp"><button data-act="discard">Discard draft</button></div>`:''}</header>`;
  let body='';switch(S.step){case'setup':body=setupView(d);break;case'who':body=segStepView(d);break;case'what':body=whatView(d);break;case'values':body=valuesView(d);break;case'review':body=reviewView(d);break;case'impact':body=impactView(d);break;case'status':body=statusView(d);break}
  return`<div class="card nos"><section class="main">${head}${summary(d,A)}<div class="content">${body}</div>${footer(d,A)}</section></div>`}
function summary(d,A){A=A||analyze(d);const kb=(l,v,c,act,k)=>`<button class="kv kvb" data-act="${act}" data-k="${k}" title="Open the list"><span>${esc(l)}</span><b class="${c}">${v}</b></button>`;
  return`<div class="strip" id="summary">${kv('Change',esc(d.name||'Untitled'))}${kv('Effective',d.date?fmtD(d.date,true):'Not set')}${kb('People',fmtN(A.rows.length),'','plist','targeted')}${kv('Fields',d.fields.length)}${kb('Changes',fmtN(A.changes),'','plist','changed')}${kb('Errors',fmtN(A.err),A.err?'err':'','issuesdrawer','e')}${kb('Warnings',fmtN(A.warn),A.warn?'warn':'','issuesdrawer','w')}</div>`}
function footer(d,A){const i=STEPS.findIndex(s=>s.k===S.step);if(['status','impact','review'].includes(S.step))return'';
  let ok=true,why='';
  if(S.step==='setup'){if(!d.name.trim()){ok=false;why='Name the change to continue.'}else if(!d.reason.trim()){ok=false;why='Add a reason. Approvers and the audit log need it.'}else if(!d.date){ok=false;why='Pick an effective date. It decides which payroll run picks this up.'}}
  if(S.step==='who'&&!A.rows.length){ok=false;why='Target at least one employee to continue.'}
  if(S.step==='what'&&!d.fields.length){ok=false;why='Choose at least one field.'}
  if(S.step==='values'&&!A.changes){ok=false;why='Enter at least one new value.'}
  return`<div class="foot"><div>${i>0?`<button class="btn2" data-act="back">Back</button>`:''}</div><div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><span class="why" id="nextwhy">${esc(why)}</span><button class="btn" id="nextbtn" data-act="next" ${ok?'':'disabled'}>Continue to ${esc(STEPS[i+1].t)}</button></div></div>`}
function setupView(d){const pi=d.date?payInfo(d.date):null;
  const chip=(k,l)=>`<button class="chip ${d.dateKind===k?'on':''}" data-act="datechip" data-k="${k}">${esc(l)}</button>`;
  const tchip=(k,l)=>`<button class="chip ${d.template===k?'on':''}" data-act="tpl" data-k="${k}">${esc(l)}</button>`;
  let pt='Required. Nothing is pre-filled, because this date decides which payroll run picks the change up.';
  if(pi){pt=pi.retro?`<span style="color:var(--warn)">${fmtD(d.date)} is in a period that's already been paid. Payroll will compute retro pay in the <b>${fmtD(pi.run)}</b> run (cutoff ${fmtD(pi.cutoff)}).</span>`:`Lands in the <b>${fmtD(pi.run)}</b> payroll run if approved by the <b>${fmtD(pi.cutoff)}</b> cutoff.${pi.prorated?' Mid-period, so pay for this period is prorated.':''}`}
  return`<div class="rows">
  ${row('Name',`<input id="f-name" class="in" data-in="name" value="${esc(d.name)}" placeholder="e.g. FY26 annual review" autocomplete="off">`,true)}
  ${row('Reason',`<input id="f-reason" class="in" data-in="reason" value="${esc(d.reason)}" placeholder="Shown to approvers and kept in the audit log" autocomplete="off">`,true)}
  ${row('Effective date',`<div class="chips">${chip('next','Start of next pay period · '+fmtD(NEXTP))}${chip('today','Today · '+fmtD(TODAY))}${chip('custom','Custom date')}</div>${d.dateKind==='custom'?`<input type="date" id="f-date" class="in date" data-in="date" value="${d.date?iso(d.date):''}">`:''}<div class="hint">${pt}</div>`,true)}
  </div>`}
const TPL={blank:{f:[],m:{}},comp:{f:['compensation','title','level'],m:{}},reorg:{f:['department','team','manager'],m:{department:'same',team:'same',manager:'same'}},office:{f:['location','manager'],m:{location:'same'}}};

/* ================= condition builder (shared) ================= */
const groupsOf=ctx=>ctx==='d'?S.d.who.groups:ctx==='rule'?(S.rt?S.rt.groups:[{mode:'all',conds:[]}]):ctx==='gf'?S.d.grid.fg:S.se.groups;
function builder(ctx,groups){return groups.map((g,gi)=>{const m=g.mode||'all';const quant=['atleast','atmost','exactly'].includes(m);const lbl={all:'all',any:'any',atleast:'at least',atmost:'at most',exactly:'exactly'}[m];
  return`<div class="grp ${g.ai?'aig':''}">${g.ai?`<div class="aiflag"><span class="badge b-ai">✦ Drafted by AI · review before continuing</span><button class="lnk" data-act="aiok" data-ctx="${ctx}" data-g="${gi}">Looks right</button></div>`:''}<div class="grp-h"><span>${gi===0?'Employees where':'Or employees where'}</span>${ddBtn(`bm:${ctx}:${gi}`,lbl,'','mini')}${quant?`<input class="nin" type="number" min="1" max="${Math.max(1,g.conds.length)}" data-in="bgn" data-ctx="${ctx}" data-g="${gi}" value="${g.n||1}" aria-label="How many conditions">`:''}<span>of these ${g.conds.length===1?'is':'are'} true</span>
    ${quant&&(g.n||1)>g.conds.length?`<span class="warn-t">This group has only ${pl(g.conds.length,'condition')}</span>`:''}${gi>0?`<button class="x" data-act="bdelgroup" data-ctx="${ctx}" data-g="${gi}" aria-label="Remove group" style="margin-left:auto">×</button>`:''}</div>
    ${g.conds.map((c,ci)=>condRow(ctx,c,gi,ci)).join('')||`<p class="sub" style="padding:6px 0">No conditions yet.</p>`}<div style="padding-top:8px"><button class="lnk" data-act="baddcond" data-ctx="${ctx}" data-g="${gi}">+ Add condition</button></div></div>`}).join('<div class="or">OR</div>')
  +(groups[0].conds.length?`<div><button class="lnk" data-act="baddgroup" data-ctx="${ctx}">+ Add condition group (OR)</button></div>`:'')}
function condRow(ctx,c,gi,ci){const F=fieldOf(c);const k=`${ctx}:${gi}:${ci}`;
  return`<div class="cond">${ddBtn('bf:'+k,F.label,'Field')}${ddBtn('bo:'+k,opLabel(F.type,c.op),'Operator')}<div class="cv">${valueCtl(ctx,c,gi,ci,F)}</div><button class="x" data-act="bdelcond" data-ctx="${ctx}" data-g="${gi}" data-c="${ci}" aria-label="Remove condition">×</button></div>`}
function valueCtl(ctx,c,gi,ci,F){const v=c.v||[];const op=c.op,t=F.type;const k=`${ctx}:${gi}:${ci}`;const da=`data-ctx="${ctx}" data-g="${gi}" data-c="${ci}"`;
  if(NOVAL.has(op))return'';
  if(t==='id'&&(op==='inseg'||op==='notinseg'))return ddBtn('bseg:'+k,v[0]?segName(v[0]):'','Choose a segment');
  if(t==='id'&&(op==='anyof'||op==='noneof'))return ddBtn('bppl:'+k,v.length?`${pl(v.length,'person','people')}: ${names(v)}`:'','Pick or paste people');
  if((t==='id'&&(op==='eq'||op==='ne'))||t==='person')return ddBtn('bpp1:'+k,v[0]&&EMPI[v[0]]?`${EMPI[v[0]].name} · ${v[0]}`:'',t==='person'?'Pick a manager':'Pick a person');
  if(LISTOP.has(op))return ddBtn('bv:'+k,v.length?v.join(', '):'','Choose values');
  if(t==='ord')return TWO.has(op)?`<span class="twov">${ddBtn('bvl:'+k+':0',v[0]||'','Level')}<span>and</span>${ddBtn('bvl:'+k+':1',v[1]||'','Level')}</span>`:ddBtn('bvl:'+k+':0',v[0]||'','Level');
  if(t==='date'){if(op==='between')return`<span class="twov"><input class="box" type="date" data-in="bv" ${da} data-i="0" value="${esc(v[0]||'')}"><span>and</span><input class="box" type="date" data-in="bv" ${da} data-i="1" value="${esc(v[1]||'')}"></span>`;
    return`<span class="twov">${ddBtn('brel:'+k,v[0]?relLabel(v[0]):'','Choose')}${v[0]==='exact'?`<input class="box" type="date" data-in="bv" ${da} data-i="1" value="${esc(v[1]||'')}">`:''}</span>`}
  const typ=t==='num'?'number':'text';const inp=i=>`<input class="box" type="${typ}" data-in="bv" ${da} data-i="${i}" value="${esc(v[i]??'')}" placeholder="Value">`;
  const cur=F.money?ddBtn('bcur:'+k,c.cur||'USD','','mini'):'';
  return TWO.has(op)?`<span class="twov">${inp(0)}<span>and</span>${inp(1)}${cur}</span>`:cur?`<span class="twov">${inp(0)}${cur}</span>`:inp(0)}
function condPop(){return''}
/* ================= bulk change: Segments step ================= */
function segStepView(d){const w=d.who;const C=cohort(d);const n=C.list.length;
  const ae=document.activeElement;const editing=(S.dd&&/^(bf|bo|bv|bseg|bppl|bpp1|brel|bvl|bm|bcur):d:/.test(S.dd.key))||(ae&&ae.dataset&&(ae.dataset.in==='bv'||ae.dataset.in==='bgn')&&ae.dataset.ctx==='d');
  if(editing&&w.snap==null&&w.cnt!=null)w.snap=w.cnt;
  if(n!==w.cnt){if(w.cnt!=null){w.prev=editing&&w.snap!=null?w.snap:w.cnt;w.dt=Date.now()}w.cnt=n}
  if(!editing)w.snap=null;
  const age=Date.now()-(w.dt||0);const dn=w.prev!=null?n-w.prev:0;
  const delta=w.prev!=null&&dn&&age<8000?`<span class="delta ${dn<0?'dn':'up'}" style="animation-delay:-${age}ms">${dn<0?'↓':'↑'} ${fmtN(Math.abs(dn))} (${fmtN(w.prev)} → ${fmtN(n)}) after your last edit</span>`:'';
  if(delta){clearTimeout(S.dTimer);S.dTimer=setTimeout(()=>{if(S.route==='draft'&&S.step==='who'&&!S.dd&&!S.se&&!S.ov){const el=document.querySelector('.tsum .delta');if(el)el.remove()}},8000-age)}
  const exs=[];if(!w.incTerm&&C.auto.term)exs.push(pl(C.auto.term,'scheduled termination'));if(!w.incContract&&C.auto.contract)exs.push(pl(C.auto.contract,'contractor'));if(!w.incLeave&&C.auto.leave)exs.push(pl(C.auto.leave,'person on leave','people on leave'));
  const card=`<div class="tsum"><div class="tsum-n"><span class="big">${fmtN(n)}</span><span class="muted">${n===1?'person':'people'} targeted</span>${delta}</div>
    <div class="tsum-r"><div class="clamp2">${esc(groupsTxt(w.groups)||'No targeting yet. Insert a saved segment or add a condition.')}</div>${exs.length?`<div class="tsum-x">Leaves out ${exs.join(', ')}.</div>`:''}</div>
    <button class="btn2" data-act="drawer" data-k="target" ${n?'':'disabled'}>View breakdown</button></div>`;
  const qa=`<div class="qa">${ddBtn('ins','','Insert saved segment','btnlike')}<button class="btn2 icb" data-act="createseg">${PLUS} Create segment</button><button class="btn2" data-act="pasteids">Paste employee IDs</button></div>`;
  const paste=w.pasteOpen?`<div class="pastecard"><b style="font-size:13.5px">Paste employee IDs, work emails or names</b><span class="sub">Any mix, one per line or comma-separated. They're added as an "Employee ID is any of" group, so they join the people you already target.</span>
    <textarea class="ta" id="paste-ta" data-in="paste">${esc(w.paste)}</textarea><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn sm" data-act="pasteadd">Add people</button><button class="txt" data-act="pastesample">Paste a sample list</button><button class="txt" data-act="pasteids">Cancel</button></div></div>`:'';
  return`${card}${qa}${aiBar('d')}${paste}<div class="sec">${builder('d',w.groups)}</div>`}
function renderDrawer(){const el=$('#drawer'),bg=$('#drawerbg');const t=S.drawer;let html='';
  if(t==='target'&&S.route==='draft'&&S.step==='who'&&S.d&&!S.se)html=drawerTarget();
  else if(t&&typeof t==='object'){if(t.type==='policy')html=drawerPolicy(t);else if(S.d&&S.route==='draft')html=t.type==='why'?drawerWhy(t):t.type==='log'?drawerLog():t.type==='issues'?drawerIssues(t):drawerIssue(t)}
  el.classList.toggle('on',!!html);bg.classList.toggle('on',!!html);el.innerHTML=html}
function polCard(k){const p=POL[k];if(!p)return'';return`<div class="polc"><div class="sec-h"><b>${esc(p.name)}</b><span class="badge b-lock">${esc(p.kind)}</span></div><span>${esc(p.desc)}</span>
  <div class="rows">${row('Set by',esc(p.owner))}${row('Where',esc(p.where))}${p.changed?row('Last changed',esc(p.changed)):''}${row('Who can change it',p.owner==='Rippling'?'Nobody. It is built into Rippling.':esc(p.owner.replace(/ \\(.*?\\)/g,''))+' or another admin with that permission')}</div></div>`}
function drawerWhy(t){const d=S.d;const e=EMPI[t.id];if(!e)return'';const A=analyze(d);const iss=(A.rowIss.get(e.id)||[]).filter(k=>t.f==='*'?(!t.sev||ISS[k].sev===t.sev):ISS[k].f===t.f);const ap=A.rowAppr.get(e.id)||[];
  return`<div class="drh"><div><b>Why this cell is flagged</b><div class="muted" style="font-size:13px">${esc(e.name)}${FIELDS[t.f]?' · '+esc(FIELDS[t.f].label):''}</div></div><button class="btn2 sm" data-act="drawerclose">Close X</button></div>
  <div class="drb">${iss.map(k=>{const I=ISS[k];return`<div class="sec"><div class="sec-h"><span><span class="sev ${I.sev}">${I.sev==='i'?'i':'!'}</span> <b>${esc(I.label)}</b></span><span class="badge ${I.sev==='e'?'b-err':I.sev==='w'?'b-warn':'b-lock'}">${I.sev==='e'?"Error: can't be submitted":I.sev==='w'?'Warning: acknowledge to continue':'Info'}</span></div>
    <div class="readback">${esc(whyIssue(k,d,e))}</div><b style="font-size:13px">How to resolve it</b><span style="font-size:13.5px">${esc(I.how||'')}</span>
    <div class="qa">${(I.fix||[]).filter(x=>x[1]!=='move'||true).map(([l,fx])=>`<button class="btn2 sm" data-act="fixrow" data-issue="${k}" data-fix="${fx}" data-id="${e.id}">${esc(l)}</button>`).join('')}<span class="muted" style="font-size:13px">or edit the value in the grid.</span></div>
    ${I.pol?`<b style="font-size:13px">Where this rule comes from</b>${polCard(I.pol)}`:''}</div>`}).join('<hr class="hr">')||'<p class="sub">Nothing is flagged on this cell any more.</p>'}
    ${ap.length?`<hr class="hr"><div class="sec"><b>Approval for this row</b>${ap.map(x=>`<span style="font-size:13.5px">${esc(APPROVERS[x.k].who)} (${esc(APPROVERS[x.k].short)}): ${esc(x.why.join('; '))}</span>`).join('')}<button class="lnk" data-act="policy" data-k="approvals">See the approval thresholds</button></div>`:''}</div>`}
const LOGI={change:'⇄',upload:'↑',edit:'✎',undo:'↶',draft:'＋',fix:'✓'};
function logRow(x){return`<div class="logr"><span class="logi">${LOGI[x.kind]||'•'}</span><span class="logt">${esc(x.label)}</span><span class="muted num">${x.cells!=null?pl(x.cells,'cell'):''}</span><span class="muted num">${esc(x.at)} · ${esc(x.by)}</span></div>`}
function drawerLog(){const d=S.d;const L=(d.log||[]).slice().reverse();return`<div class="drh"><div><b>Activity</b><div class="muted" style="font-size:13px">${esc(d.name||'This bulk change')} · ${pl(L.length,'entry','entries')} · all times IST</div></div><button class="btn2 sm" data-act="drawerclose">Close X</button></div>
  <div class="drb"><p class="note">The grid always shows the result of every entry below, applied in order. Undo steps back through them; the log itself keeps everything for the audit trail.</p><div class="actlog flat">${L.map(logRow).join('')}</div></div>`}
function nl(n,key){return n?`<button class="nlink" data-act="plist" data-k="${esc(key)}">${fmtN(n)}</button>`:'0'}
function remSteps(k){const I=ISS[k];const st=[I.how];if((I.fix||[]).length)st.push('Or use a quick fix below. It applies to every row in this group and can be undone.');if(I.sev==='w')st.push('If it is intended, acknowledge the group on Review & confirm, with a note for the audit log.');st.push('To fix one row at a time, open the rows in the grid and use the ! on each flagged cell.');return st}
function drawerIssues(t){const d=S.d;const A=analyze(d);const sv=t.k;const ks=ISS_ORDER.filter(k=>A.issues[k]&&ISS[k].sev===sv);const rows=new Set();ks.forEach(k=>A.issues[k].forEach(id=>rows.add(id)));
  const byF={};ks.forEach(k=>{const f=ISS[k].f;const l=f?FIELDS[f]?.label||f:'Whole change';byF[l]=(byF[l]||0)+A.issues[k].length});
  const tab=(k,l,n)=>`<button class="${sv===k?'on':''}" data-act="issuesdrawer" data-k="${k}">${l} · ${fmtN(n)}</button>`;
  return`<div class="drh"><div><b>${sv==='e'?'Errors':'Warnings'}</b><div class="muted" style="font-size:13px">${pl(sv==='e'?A.err:A.warn,sv==='e'?'error':'warning')} in ${pl(rows.size,'row')} · ${pl(ks.length,'type')}</div></div><button class="btn2 sm" data-act="drawerclose">Close X</button></div>
  <div class="drb"><span class="seg2">${tab('e','Errors',A.err)}${tab('w','Warnings',A.warn)}</span>
    <p class="sub" style="margin:0">${sv==='e'?"Errors block submission. Fix them, or move the rows to a follow-up draft.":"Warnings don't block submission. Acknowledge each type if it's intended."}</p>
    ${Object.keys(byF).length?`<div class="sec"><span class="h3" style="font-size:13px">By field</span><div class="bars">${Object.entries(byF).sort((a,b)=>b[1]-a[1]).map(([l,n])=>bar(l,n,Math.max(...Object.values(byF)))).join('')}</div></div>`:''}
    ${ks.map(k=>{const I=ISS[k];const ids=A.issues[k];return`<div class="icard"><div class="icard-h"><div class="t"><span class="sev ${I.sev}">!</span><div><b>${esc(I.label)} · ${nl(ids.length,'iss:'+k)}</b><span class="muted" style="font-size:13px">${esc(I.desc)}</span></div></div></div>
      <div class="remed"><b style="font-size:12.5px">How to fix it</b><ol>${remSteps(k).map(x=>`<li>${esc(x)}</li>`).join('')}</ol>${I.pol?`<span class="muted" style="font-size:12.5px">Rule: ${esc(POL[I.pol].name)}, set by ${esc(POL[I.pol].owner)}. <button class="lnk" data-act="policy" data-k="${I.pol}">See the rule</button></span>`:''}</div>
      <div class="icard-a"><div class="ia-l">${(I.fix||[]).map(([l,fx])=>`<button class="btn2 sm" data-act="fix" data-issue="${k}" data-fix="${fx}">${esc(l)} (${fmtN(ids.length)})</button>`).join('')}${I.sev==='w'&&!d.ack[k]?`<button class="btn2 sm" data-act="ack" data-issue="${k}">Acknowledge ${fmtN(ids.length)}</button>`:I.sev==='w'?'<span class="acked">✓ Acknowledged</span>':''}</div>
        <div class="ia-r"><button class="lnk" data-act="issuegrid" data-k="${k}">Open in the grid</button></div></div></div>`}).join('')||'<p class="sub">Nothing here.</p>'}</div>`}
function drawerIssue(t){const d=S.d;const I=ISS[t.k];if(!I)return'';const A=analyze(d);const ids=A.issues[t.k]||[];
  return`<div class="drh"><div><b>${esc(I.label)}</b><div class="muted" style="font-size:13px">${pl(ids.length,'row')} · ${I.sev==='e'?'error':I.sev==='w'?'warning':'info'}</div></div><button class="btn2 sm" data-act="drawerclose">Close X</button></div>
  <div class="drb"><span>${esc(I.desc)}</span><b style="font-size:13px">How to resolve it</b><span style="font-size:13.5px">${esc(I.how||'')}</span>${I.pol?`<b style="font-size:13px">Where this rule comes from</b>${polCard(I.pol)}`:''}
    <b style="font-size:13px">The rows, and why each one is flagged</b><div class="tw"><table class="t">${ids.slice(0,25).map(id=>{const e=EMPI[id];return`<tr><td>${person(e,e.title)}</td><td><small>${esc(whyIssue(t.k,d,e))}</small></td></tr>`}).join('')}</table></div>${ids.length>25?`<p class="note">Showing 25 of ${fmtN(ids.length)}.</p>`:''}</div>`}
function drawerPolicy(t){const k=t.k;return`<div class="drh"><div><b>${esc(POL[k].name)}</b><div class="muted" style="font-size:13px">${esc(POL[k].where)}</div></div><button class="btn2 sm" data-act="drawerclose">Close X</button></div>
  <div class="drb">${polCard(k)}${k==='approvals'?`<div class="tw"><table class="t"><thead><tr><th>Change</th><th>No approval when</th><th>Otherwise</th></tr></thead><tbody>${THRESH.map(r=>`<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('')}</tbody></table></div>`:''}
  <button class="btn2 sm" data-act="nav" data-k="settings">Open all bulk change rules</button></div>`}
function drawerTarget(){const d=S.d,w=d.who;const C=cohort(d);const n=C.list.length;
  const autoRow=(k,label,n2,o)=>`<div><span>${esc(label)}: <b class="num">${fmtN(n2)}</b> · ${o?'included':'excluded'}</span><button class="lnk" data-act="autotg" data-k="${k}">${o?'Exclude':'Include'}</button></div>`;
  const samp=spread(C.list,8).map(e=>`<tr><td>${person(e,e.title)}</td><td><span class="badge b-lock">${esc(C.why.get(e.id))}</span></td></tr>`).join('');
  return`<div class="drh"><div><b>Targeting breakdown</b><div class="muted" style="font-size:13px">${pl(n,'person','people')} in ${esc(d.name||'this bulk change')}</div></div><button class="btn2 sm" data-act="drawerclose">Close X</button></div>
  <div class="drb"><div class="readback"><b>${fmtN(n)}</b> = ${esc(groupsTxt(w.groups)||'No conditions')}</div>
    <div class="sec"><span class="h3" style="font-size:13px">Always left out unless you include them</span><div class="auto">${autoRow('leave','On leave',C.auto.leave,w.incLeave)}${autoRow('term','Scheduled termination',C.auto.term,w.incTerm)}${autoRow('contract','Contractors',C.auto.contract,w.incContract)}</div></div>
    ${n?`<div class="sec"><span class="h3" style="font-size:13px">By department</span><div class="bars">${topN(C.list,'department').map(([k,c])=>bar(k,c,n)).join('')}</div></div>
    <div class="sec"><span class="h3" style="font-size:13px">By work location</span><div class="bars">${topN(C.list,'location').map(([k,c])=>bar(k,c,n)).join('')}</div></div>
    <div class="sec"><span class="h3" style="font-size:13px">Sample, and why each person is included</span><div class="tw"><table class="t">${samp}</table></div></div>`:''}
    <div style="display:flex;gap:14px;flex-wrap:wrap"><button class="btn2 sm" data-act="exportlist">Export the full list</button><button class="btn2 sm" data-act="saveastarget">Save this targeting as a segment</button></div>
    <p class="note">Dynamic segments are computed when you submit, so approvers sign off on named people. Static segments always hold the same employees.</p></div>`}
function topN(list,f){const m={};list.forEach(e=>m[e[f]]=(m[e[f]]||0)+1);return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,5)}
const bar=(k,c,n)=>`<div class="barrow"><span title="${esc(k)}">${esc(k)}</span><i style="width:${Math.max(2,c/n*100)}%"></i><span>${fmtN(c)}</span></div>`;
function spread(list,k){if(list.length<=k)return list;const out=[];const step=list.length/k;for(let i=0;i<k;i++)out.push(list[Math.floor(i*step+step/2)]);return out}
function addTargetCond(d,cond){const g=d.who.groups;if(!g[0].conds.length)g[0].conds.push(cond);else g.push({mode:'all',conds:[cond]})}

/* ================= segments: list ================= */
function segList(){const cols=[{key:'name',label:'Name',type:'text',get:s=>s.name,render:s=>`<b>${esc(s.name)}</b><br><small class="muted">${esc(s.desc||'')}</small>`,wrap:true},{key:'type',label:'Type',type:'pick',get:s=>s.type==='dynamic'?'Dynamic':'Static',render:s=>typeBadge(s)},
    {key:'members',label:'Members',type:'num',get:s=>members(s.id).size},{key:'def',label:'Definition',type:'text',get:s=>segDef(s),render:s=>`<small>${esc(segDef(s))}</small>`,wrap:true},{key:'used',label:'Used in',type:'text',get:s=>usedIn(s).join(', ')},
    {key:'owner',label:'Owner',type:'pick',get:s=>s.owner},{key:'updated',label:'Last updated',type:'date',get:s=>parseDateStr(s.updated)||''}];
  return`<div class="ph"><div><h1>Segments</h1><p>Reusable groups of employees. A static segment always holds the same employees, even when their attributes change. A dynamic segment is computed from its rules each time it's used.</p></div>
    <div class="pa"><div class="ddw"><button class="btn" data-act="newmenu">New segment ▾</button>${S.newMenu?`<div class="ddm pp"><button data-act="newseg" data-t="dynamic"><b>Dynamic segment</b><span>Rules, computed each time the segment is used.</span></button><button data-act="newseg" data-t="static"><b>Static segment</b><span>The same employees every time, from conditions or a CSV file.</span></button></div>`:''}</div></div></div>
  ${dataTable('segs',tsOf('segs'),SEGS,cols,{searchPh:'Search segments',rowAttrs:s=>`data-act="openseg" data-id="${s.id}"`})}`}
/* ================= segments: editor ================= */
function newEditor(o={}){return{segId:o.segId||null,name:o.name||'',desc:o.desc||'',type:o.type||'dynamic',source:o.source||'conditions',groups:o.groups||[{mode:'all',conds:[]}],file:o.file||null,
  tf:{},sort:null,excluded:new Set(o.excluded||[]),hidden:new Set(),q:'',page:1,size:25,inSheet:!!o.inSheet,target:o.target||null,locked:!!o.segId,pasteOpen:false,pasteText:''}}
const RCOLS=[{key:'_emp',label:'Employee',type:'text',get:e=>e.name,render:e=>`<button class="lnk plain" data-act="profile" data-id="${e.id}">${person(e)}</button>`},{key:'_id',label:'Employee ID',type:'text',get:e=>e.id},{key:'department',label:'Department',type:'pick',get:e=>e.department},
  {key:'title',label:'Title',type:'text',get:e=>e.title},{key:'location',label:'Work location',type:'pick',get:e=>e.location},{key:'level',label:'Level',type:'ord',get:e=>e.level},{key:'startDate',label:'Start date',type:'date',get:e=>e.startDate}];
function edBase(se){if(se.type==='static'&&se.source==='csv')return se.file?se.file.matched.map(id=>EMPI[id]).filter(Boolean):[];
  if(!se.groups.some(g=>g.conds.some(complete)))return[];return EMP.filter(e=>evalGroups(se.groups,e)>=0)}
function edColsAll(se){const fc=(se.type==='static'&&se.source==='csv'&&se.file)?se.file.cols.map(c=>({key:c.key,label:c.label,type:c.type,file:true,get:e=>se.file.values[e.id]?.[c.key]})):[];return[...RCOLS,...fc]}
function dispVal(col,v){if(isEmpty(v)&&v!==false)return'(Blanks)';if(col.type==='bool')return v?'Yes':'No';if(col.type==='num'){const s=Number.isInteger(+v)?fmtN(+v):(+v).toFixed(1);return /%/.test(col.label)?s+'%':s}if(col.type==='date')return fmtIso(v);return String(v)}
function cmpv(col,a,b){if(isEmpty(a))return 1;if(isEmpty(b))return-1;if(col.type==='num')return a-b;if(col.type==='ord')return lvlN(a)-lvlN(b);if(col.type==='bool')return(a?1:0)-(b?1:0);return String(a).localeCompare(String(b))}
function tableRows(ts,base,cols){let rows=base;const q=(ts.q||'').trim().toLowerCase();
  if(q)rows=rows.filter(r=>cols.some(c=>{const v=c.get(r);return!isEmpty(v)&&dispVal(c,v).toLowerCase().includes(q)}));
  for(const[k,f]of Object.entries(ts.tf||{})){const col=cols.find(c=>c.key===k);if(!col)continue;if(f.cond&&completeSheet(f.cond))rows=rows.filter(e=>testSheet(col,col.get(e),f.cond,e,cols));if(f.vals)rows=rows.filter(e=>f.vals.includes(dispVal(col,col.get(e))))}
  if(ts.sort){const col=cols.find(c=>c.key===ts.sort.key);if(col)rows=rows.slice().sort((a,b)=>cmpv(col,col.get(a),col.get(b))*ts.sort.dir)}return rows}
const SOPS=[['Blanks',[['empty','Is empty'],['nempty','Is not empty']]],['Text',[['t_contains','Text contains'],['t_ncontains','Text does not contain'],['t_starts','Text starts with'],['t_ends','Text ends with'],['t_eq','Text is exactly']]],
  ['Dates',[['d_is','Date is'],['d_before','Date is before'],['d_after','Date is after']]],['Numbers',[['n_gt','Greater than'],['n_gte','Greater than or equal to'],['n_lt','Less than'],['n_lte','Less than or equal to'],['n_eq','Is equal to'],['n_ne','Is not equal to'],['n_between','Is between'],['n_nbetween','Is not between']]],['Custom',[['formula','Custom formula is']]]];
const sopLabel=o=>{for(const[,xs]of SOPS)for(const[k,l]of xs)if(k===o)return l;return o};
function completeSheet(c){const v=c.v||[];const ok=x=>x!==undefined&&x!==null&&x!=='';const o=c.op;if(!o)return false;if(o==='empty'||o==='nempty')return true;
  if(o.startsWith('d_'))return ok(v[0])&&(v[0]!=='exact'||ok(v[1]));if(o==='n_between'||o==='n_nbetween')return ok(v[0])&&ok(v[1]);if(o==='formula')return ok(v[0]);return ok(v[0])}
function testSheet(col,val,c,e,cols){const op=c.op,v=c.v||[];const blank=isEmpty(val)&&val!==false;if(op==='empty')return blank;if(op==='nempty')return!blank;
  if(op.startsWith('t_')){const s=blank?'':dispVal(col,val).toLowerCase(),q=String(v[0]||'').toLowerCase();return op==='t_contains'?s.includes(q):op==='t_ncontains'?!s.includes(q):op==='t_starts'?s.startsWith(q):op==='t_ends'?s.endsWith(q):s===q}
  if(op.startsWith('d_')){const s=col.type==='date'?val:parseDateStr(String(val??''));if(!s)return false;const r=relRange(v[0],v[1]);if(!r)return false;const a=iso(r[0]),b=iso(r[1]);return op==='d_is'?s>=a&&s<=b:op==='d_before'?s<a:s>b}
  if(op.startsWith('n_')){if(blank)return false;const n=col.type==='num'?+val:col.type==='ord'?lvlN(val):col.type==='bool'?(val?1:0):parseMoney(val);if(!isFinite(n))return false;const a=+v[0],b=+v[1];
    switch(op){case'n_gt':return n>a;case'n_gte':return n>=a;case'n_lt':return n<a;case'n_lte':return n<=a;case'n_eq':return n===a;case'n_ne':return n!==a;case'n_between':return n>=Math.min(a,b)&&n<=Math.max(a,b);case'n_nbetween':return n<Math.min(a,b)||n>Math.max(a,b)}return false}
  if(op==='formula'){const f=compileFormula(v[0],cols);return f.ok?!!f.fn(e):false}return true}
/* custom formula: allowed functions and operators only */
const FX_FN={AND:(...a)=>a.every(Boolean),OR:(...a)=>a.some(Boolean),NOT:a=>!a,IF:(c,a,b)=>c?a:b,ISBLANK:a=>isEmpty(a)&&a!==false,
  CONTAINS:(a,b)=>String(a??'').toLowerCase().includes(String(b??'').toLowerCase()),STARTSWITH:(a,b)=>String(a??'').toLowerCase().startsWith(String(b??'').toLowerCase()),ENDSWITH:(a,b)=>String(a??'').toLowerCase().endsWith(String(b??'').toLowerCase()),
  LEN:a=>String(a??'').length,LOWER:a=>String(a??'').toLowerCase(),UPPER:a=>String(a??'').toUpperCase(),VALUE:a=>typeof a==='number'?a:parseMoney(a),TODAY:()=>iso(TODAY),
  DAYS:(a,b)=>{const x=fromIso(a),y=fromIso(b);return x&&y?Math.round((x-y)/864e5):NaN},YEAR:a=>fromIso(a)?.getFullYear()};
const FX_HELP='Functions: AND, OR, NOT, IF, ISBLANK, CONTAINS, STARTSWITH, ENDSWITH, LEN, LOWER, UPPER, VALUE, TODAY, DAYS, YEAR. Columns go in square brackets, e.g. [Promo flag]. Operators: = <> > >= < <= + - * / &. TRUE and FALSE for Yes/No columns.';
const FXC=new Map();
function lexFx(src){const out=[];const re=/\s*(?:(\[[^\]]+\])|("(?:[^"]|"")*")|(\d+(?:\.\d+)?)|([A-Za-z_][A-Za-z0-9_]*)|(<>|>=|<=|[=<>+\-*/&(),]))/y;let m;re.lastIndex=0;
  while(re.lastIndex<src.length){const at=re.lastIndex;m=re.exec(src);if(!m){if(src.slice(at).trim()==='')break;throw Error(`Can't read "${src.slice(at).trim().slice(0,12)}"`)}
    if(m[1])out.push({t:'col',v:m[1].slice(1,-1)});else if(m[2])out.push({t:'str',v:m[2].slice(1,-1).replace(/""/g,'"')});else if(m[3])out.push({t:'num',v:+m[3]});else if(m[4])out.push({t:'id',v:m[4]});else if(m[5])out.push({t:'op',v:m[5]})}return out}
function cmpOp(o,a,b){if(typeof a==='boolean'||typeof b==='boolean'){a=a===true||/^(true|yes)$/i.test(String(a));b=b===true||/^(true|yes)$/i.test(String(b));return o==='='?a===b:o==='<>'?a!==b:false}
  if(typeof a==='number'||typeof b==='number'){const x=+a,y=+b;if(!isFinite(x)||!isFinite(y))return o==='<>';return o==='='?x===y:o==='<>'?x!==y:o==='>'?x>y:o==='>='?x>=y:o==='<'?x<y:x<=y}
  const x=String(a??'').toLowerCase(),y=String(b??'').toLowerCase();return o==='='?x===y:o==='<>'?x!==y:o==='>'?x>y:o==='>='?x>=y:o==='<'?x<y:x<=y}
const fxNum=x=>typeof x==='boolean'?(x?1:0):typeof x==='number'?x:parseMoney(x);
function compileFormula(src,cols){const key=String(src)+'|'+cols.map(c=>c.key).join(',');if(FXC.has(key))return FXC.get(key);let res;
  try{const toks=lexFx(String(src||'').trim().replace(/^=/,''));if(!toks.length)throw Error('Write a formula first');let i=0;const peek=()=>toks[i],next=()=>toks[i++];
    const expect=v=>{const t=next();if(!t||t.v!==v)throw Error(`Expected "${v}"`)};
    const primary=()=>{const t=next();if(!t)throw Error('The formula ends too early');
      if(t.t==='num'||t.t==='str')return()=>t.v;
      if(t.t==='col'){const col=cols.find(c=>c.label.toLowerCase()===t.v.toLowerCase());if(!col)throw Error(`No column called [${t.v}]`);return e=>{const v=col.get(e);return col.type==='ord'?lvlN(v):v}}
      if(t.t==='id'){const nm=t.v.toUpperCase();if(nm==='TRUE')return()=>true;if(nm==='FALSE')return()=>false;
        if(peek()&&peek().v==='('){next();const args=[];if(!(peek()&&peek().v===')')){args.push(cmp());while(peek()&&peek().v===','){next();args.push(cmp())}}expect(')');const f=FX_FN[nm];if(!f)throw Error(`${nm} isn't an allowed function`);return e=>f(...args.map(a=>a(e)))}
        throw Error(`"${t.v}" isn't a column or function. Put column names in [ ]`)}
      if(t.v==='('){const x=cmp();expect(')');return x}if(t.v==='-'){const x=primary();return e=>-fxNum(x(e))}throw Error(`Unexpected "${t.v}"`)};
    const mul=()=>{let l=primary();while(peek()&&(peek().v==='*'||peek().v==='/')){const o=next().v,r=primary(),L=l;l=o==='*'?e=>fxNum(L(e))*fxNum(r(e)):e=>fxNum(L(e))/fxNum(r(e))}return l};
    const add=()=>{let l=mul();while(peek()&&['+','-','&'].includes(peek().v)){const o=next().v,r=mul(),L=l;l=o==='&'?e=>String(L(e)??'')+String(r(e)??''):o==='+'?e=>fxNum(L(e))+fxNum(r(e)):e=>fxNum(L(e))-fxNum(r(e))}return l};
    function cmp(){let l=add();while(peek()&&['=','<>','>','>=','<','<='].includes(peek().v)){const o=next().v,r=add(),L=l;l=e=>cmpOp(o,L(e),r(e))}return l}
    const f=cmp();if(i<toks.length)throw Error(`Unexpected "${toks[i].v}"`);res={ok:true,fn:f}}catch(err){res={ok:false,err:err.message}}FXC.set(key,res);return res}
function aiFormula(text,cols){const parts=String(text||'').split(/\s+(and|or)\s+/i);const clauses=[],joins=[];parts.forEach((p,i)=>i%2?joins.push(p.toLowerCase()):clauses.push(p));
  const findCol=c=>{const t=c.toLowerCase();let best=null,score=0;cols.forEach(col=>{const words=col.label.toLowerCase().replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(w=>w.length>2);const hit=words.filter(w=>t.includes(w)).length;const sc=hit/Math.max(1,words.length)+(t.includes(col.label.toLowerCase())?1:0);if(hit&&sc>score){score=sc;best=col}});return best};
  const out=[];for(const c of clauses){const col=findCol(c);if(!col)return null;const R=`[${col.label}]`;const t=c.toLowerCase();let m;
    if(col.type==='bool'){out.push(/\b(no|false|not)\b/.test(t)?`${R}=FALSE`:`${R}=TRUE`);continue}
    if((m=t.match(/between\s+(-?[\d.]+)\s+(?:and|to)\s+(-?[\d.]+)/))){out.push(`AND(${R}>=${m[1]},${R}<=${m[2]})`);continue}
    if((m=t.match(/(?:last|past)\s+(\d+)\s+days?/))){out.push(`DAYS(TODAY(),${R})<=${m[1]}`);continue}
    if((m=t.match(/(after|since|before)\s+(.+)$/))&&parseDateStr(m[2].trim())){out.push(`${R}${m[1]==='before'?'<':'>'}"${parseDateStr(m[2].trim())}"`);continue}
    if((m=t.match(/(at least|>=)\s*(-?[\d.]+)/))){out.push(`${R}>=${m[2]}`);continue}if((m=t.match(/(at most|<=)\s*(-?[\d.]+)/))){out.push(`${R}<=${m[2]}`);continue}
    if((m=t.match(/(more than|greater than|above|over|>)\s*(-?[\d.]+)/))){out.push(`${R}>${m[2]}`);continue}if((m=t.match(/(less than|below|under|<)\s*(-?[\d.]+)/))){out.push(`${R}<${m[2]}`);continue}
    if((m=t.match(/(starts with|begins with)\s+"?([^"]+)"?/))){out.push(`STARTSWITH(${R},"${m[2].trim()}")`);continue}
    if((m=t.match(/(contains|includes|mentions)\s+"?([^"]+)"?/))){out.push(`CONTAINS(${R},"${m[2].trim()}")`);continue}
    if((m=t.match(/\b(?:is not|isn't|not)\s+"?([^"]+)"?$/))){out.push(`${R}<>"${m[1].trim()}"`);continue}
    if((m=t.match(/\b(?:is|=|equals)\s+"?([^"]+)"?$/))){const val=m[1].trim();out.push(/^-?[\d.]+$/.test(val)?`${R}=${val}`:`${R}="${val}"`);continue}
    return null}
  if(out.length===1)return'='+out[0];const fn=joins.every(j=>j==='or')?'OR':'AND';return`=${fn}(${out.join(', ')})`}
function filtersTxt(ts,cols){return Object.entries(ts.tf||{}).map(([k,f])=>{const col=cols.find(c=>c.key===k);if(!col)return'';const p=[];
  if(f.cond&&completeSheet(f.cond)){const v=f.cond.v||[];const o=f.cond.op;p.push(o==='formula'?`Custom formula ${v[0]}`:`${col.label}: ${sopLabel(o).toLowerCase()}${o==='empty'||o==='nempty'?'':' '+(o.startsWith('d_')?(v[0]==='exact'?fmtIso(v[1]):relLabel(v[0]).toLowerCase()):(o==='n_between'||o==='n_nbetween')?v.join(' and '):v[0])}`)}
  if(f.vals)p.push(`${col.label} is one of ${f.vals.slice(0,4).join(', ')}${f.vals.length>4?'…':''}`);return p.join('; ')}).filter(Boolean)}
const MT={};
function dataTable(id,ts,base,allCols,opts){const cols=allCols.filter(c=>!ts.hidden.has(c.key));const rows=tableRows(ts,base,allCols);
  const size=ts.size||25;const pages=Math.max(1,Math.ceil(rows.length/size));if(!ts.page||ts.page>pages)ts.page=Math.min(ts.page||1,pages);const st=(ts.page-1)*size;const pr=rows.slice(st,st+size);
  MT[id]={ts,base,cols,allCols,rows,opts};
  const sel=opts.sel;const chk=opts.static&&opts.editable&&!sel;const fcols=cols.filter(c=>c.file),rcols=cols.filter(c=>!c.file);const firstF=fcols[0]&&fcols[0].key;
  const nf=Object.values(ts.tf).filter(f=>(f.cond&&completeSheet(f.cond))||f.vals).length;const exN=ts.excluded?rows.filter(e=>ts.excluded.has(e.id)).length:0;
  const band=fcols.length?`<tr><th class="band-r" colspan="${rcols.length+(chk?1:0)}">Rippling fields</th><th class="band-f" colspan="${fcols.length}">From ${esc(opts.fileName||'file')}</th></tr>`:'';
  const pageAll=chk&&pr.length&&pr.every(e=>!ts.excluded.has(e.id));
  const head=`<tr>${sel?`<th class="mchk"><input type="checkbox" data-act="tselpage" data-t="${id}" ${pr.length&&pr.every(e=>sel.has(e.id))?'checked':''} aria-label="Select this page"></th>`:''}${chk?`<th class="mchk"><input type="checkbox" data-act="mexclpage" data-t="${id}" ${pageAll?'checked':''} aria-label="Include everyone on this page"></th>`:''}${cols.map(c=>{const f=ts.tf[c.key];const on=f&&((f.cond&&completeSheet(f.cond))||f.vals);const so=ts.sort&&ts.sort.key===c.key?`<span class="sorti">${ts.sort.dir>0?'▲':'▼'}</span>`:'';
    return`<th class="sortable ${c.file?'fcol':''} ${c.key===firstF?'first':''}" data-act="hsortq" data-t="${id}" data-k="${c.key}" title="Sort by ${esc(c.label)}"><span class="hcell"><span>${esc(c.label)}</span>${so}<button class="hfil ${on?'on':''}" data-act="hmenu" data-t="${id}" data-k="${c.key}" aria-label="Sort and filter ${esc(c.label)}">${FUNNEL}</button></span></th>`}).join('')}</tr>`;
  const body=pr.map(e=>{const ex=chk&&ts.excluded.has(e.id);return`<tr class="${opts.rowAttrs&&opts.rowAttrs(e)?'click':''} ${ex?'exrow':''} ${sel&&sel.has(e.id)?'selrow':''}" ${opts.rowAttrs?opts.rowAttrs(e)||'':''}>${sel?`<td class="mchk"><input type="checkbox" data-act="tsel" data-t="${id}" data-id="${e.id}" ${sel.has(e.id)?'checked':''} aria-label="Select ${esc(e.name)}"></td>`:''}${chk?`<td class="mchk"><input type="checkbox" data-act="mexcl" data-t="${id}" data-id="${e.id}" ${ex?'':'checked'} aria-label="Include ${esc(e.name)}"></td>`:''}${cols.map(c=>{const v=c.get(e);const cls=(c.file?'fcol':'')+(c.key===firstF?' first':'')+(c.type==='num'?' num':'')+(c.wrap?' wrap':'');
    return`<td class="${cls}">${c.render?c.render(e):esc(isEmpty(v)&&v!==false?'':dispVal(c,v))}</td>`}).join('')}</tr>`}).join('')||`<tr><td colspan="${cols.length+(chk||sel?1:0)}" class="muted" style="padding:28px;text-align:center;height:auto">${esc(rows.length?'':(base.length?'No rows match these filters.':(opts.emptyText||'Nothing here yet.')))}</td></tr>`;
  const pager=`<div class="pager"><span>Rows per page</span>${ddBtn('rows:'+id,String(size),'','mini')}<span class="num">${rows.length?st+1:0}–${Math.min(st+size,rows.length)} of ${fmtN(rows.length)}</span>
    <button class="pg" data-act="pg" data-t="${id}" data-p="1" ${ts.page===1?'disabled':''} aria-label="First page">«</button><button class="pg" data-act="pg" data-t="${id}" data-p="${ts.page-1}" ${ts.page===1?'disabled':''} aria-label="Previous page">‹</button>
    <span class="num">Page ${ts.page} of ${pages}</span><button class="pg" data-act="pg" data-t="${id}" data-p="${ts.page+1}" ${ts.page===pages?'disabled':''} aria-label="Next page">›</button><button class="pg" data-act="pg" data-t="${id}" data-p="${pages}" ${ts.page===pages?'disabled':''} aria-label="Last page">»</button></div>`;
  return`<div class="${opts.bare?'sec':'pcard'}">${opts.title?`<div class="sec-h"><h3 class="h3">${esc(opts.title)}</h3><span class="muted num">${fmtN(rows.length)} of ${fmtN(base.length)} rows${exN?` · ${fmtN(exN)} excluded`:''}</span></div>`:''}
  <div class="mtool"><input class="search" id="${id}-q" data-in="mq" data-t="${id}" value="${esc(ts.q)}" placeholder="${esc(opts.searchPh||'Search')}">${ddBtn('cols:'+id,'','Columns','btnlike sm')}
    ${sel&&rows.length&&!rows.every(e=>sel.has(e.id))?`<button class="lnk" data-act="tselall" data-t="${id}">Select all ${fmtN(rows.length)} matching</button>`:''}
    ${nf||ts.q||ts.sort?`<button class="btn2 sm" data-act="mclear" data-t="${id}">Clear filters${nf?` (${nf})`:''}${ts.sort?' and sort':''}</button>`:''}${opts.toolbarExtra||''}</div>
  <div class="mwrap"><table class="g ${band?'hasband':''}"><thead>${band}${head}</thead><tbody>${body}</tbody></table></div>${pager}${opts.hint?`<p class="note">${esc(opts.hint)}</p>`:''}</div>`}


function segEditor(se){const allCols=edColsAll(se);const base=edBase(se);const rows=tableRows(se,base,allCols);const keep=se.type==='static'?rows.filter(e=>!se.excluded.has(e.id)):rows;
  const isCsv=se.type==='static'&&se.source==='csv';const f=se.file;
  const head=`<div class="pcard edhead ${se.inSheet?'insheet':''}"><div class="edtop"><div class="edname"><label class="flabel req" for="se-name">Segment name</label>
      <input class="nameIn" id="se-name" data-in="sename" value="${esc(se.name)}" placeholder="e.g. FY26 promotion nominees" autocomplete="off">
      <input class="descIn" id="se-desc" data-in="sedesc" value="${esc(se.desc)}" placeholder="Description (optional)" autocomplete="off" aria-label="Description"></div>
    <div class="pa"><button class="btn2" data-act="secancel">Cancel</button><button class="btn" data-act="segsave">Save segment</button></div></div>
    <div class="ctl"><div><span class="req">Type</span><span class="seg2"><button class="${se.type==='dynamic'?'on':''}" data-act="setype" data-v="dynamic" ${se.locked?'disabled':''}>Dynamic</button><button class="${se.type==='static'?'on':''}" data-act="setype" data-v="static" ${se.locked?'disabled':''}>Static</button></span></div>
    ${se.type==='static'?`<div><span class="req">Source</span><span class="seg2"><button class="${se.source==='conditions'?'on':''}" data-act="sesrc" data-v="conditions" ${se.locked?'disabled':''}>Conditions</button><button class="${se.source==='csv'?'on':''}" data-act="sesrc" data-v="csv" ${se.locked?'disabled':''}>File upload</button></span></div>`:''}
    <span>${se.locked?'Type and source are fixed after the first save.':se.type==='dynamic'?'Computed from the rules each time the segment is used.':'Always the same employees, even when their attributes change later.'}</span></div></div>`;
  let def;
  if(!isCsv)def=`<div class="pcard"><div class="sec-h"><h3 class="h3 req">Conditions</h3><span class="muted" style="font-size:13px">${se.type==='dynamic'?'Computed each time the segment is used, including when a bulk change is submitted.':'Evaluated once, when you save. After that the segment keeps exactly these employees.'}</span></div>${aiBar('se')}${builder('se',se.groups)}</div>`;
  else if(!f)def=`<div class="pcard"><h3 class="req">File</h3><div class="drop"><b>Upload a CSV of employees</b><span class="sub">Any columns you like. One column must identify the employee: Employee ID, ID or Work Email.</span><input type="file" id="seg-file" accept=".csv,text/csv" aria-label="Choose CSV file">
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:center"><button class="btn2 sm" data-act="sepaste">Paste CSV instead</button>${ddBtn('sample','','Use a sample file','btnlike sm')}</div></div>
    ${se.pasteOpen?`<textarea class="ta" id="se-paste" data-in="sepastetxt" placeholder="Employee ID,Promo flag,Notes">${esc(se.pasteText)}</textarea><div><button class="btn sm" data-act="sepasteload">Load pasted CSV</button></div>`:''}</div>`;
  else def=`<div class="pcard"><div class="sec-h"><h3 class="h3">File</h3>${f.raw?`<button class="btn2 sm" data-act="sereplace">Replace file</button>`:''}</div>
    <div class="rows">${row('File',`<span><b>${esc(f.name)}</b> · ${pl(f.rowsN,'row')} · <span class="done-t">${fmtN(f.matched.length)} matched</span>${f.unmatched.length?` · <button class="lnk" data-act="seunm" style="color:var(--err)">${fmtN(f.unmatched.length)} unmatched</button>`:''}</span>${f.showUnmatched?`<div class="mapping">Not found in Rippling: ${esc(f.unmatched.join(', '))}. These rows are left out.</div>`:''}${f.raw?'':'<span class="hint">Editing filters the saved members. To add people, upload a new file in a new segment.</span>'}`)}
    ${f.raw?row('Employee key',`<div style="max-width:320px">${ddBtn('keycol',f.header[f.keyCol]||'Column '+(f.keyCol+1),'Choose a column')}</div><span class="hint">The column that identifies each person. IDs, work emails and names are all accepted.</span>`,true):''}
    ${row('Your columns',`<div class="coltypes">${f.cols.map(c=>`<span class="ctype">${esc(c.label)}${ddBtn('ctype:'+c.key,TYPE_LABEL[c.type],'','chipdd')}</span>`).join('')}</div><span class="hint">Types were detected from the values. They decide how each column sorts and filters.</span>`)}</div></div>`;
  const emptyText=isCsv?'Upload a file to see who is in it.':'Add a condition to see who matches.';
  const table=dataTable('seed',se,base,allCols,{editable:true,static:se.type==='static',fileName:f&&f.name,emptyText,title:se.type==='static'?'Members to save':'Who matches right now',searchPh:'Search name or employee ID',
    hint:se.type==='static'?'Untick a row to leave that person out. Click a header to sort; use its filter menu to filter, as in a spreadsheet.':'Sorting and filtering here only change your view. The conditions decide who is in the segment.'});
  const nfil=filtersTxt(se,allCols);
  const saved=se.type==='dynamic'?'The rules. Membership is computed each time the segment is used.'
    :isCsv?`${pl(keep.length,'employee ID')} + ${pl(f?f.cols.length:0,'uploaded column')}.${nfil.length||se.excluded.size?` Your filters${se.excluded.size?' and '+pl(se.excluded.size,'exclusion'):''} are kept as a record of how you built it.`:''}`
    :`${pl(keep.length,'employee ID')}, fixed at ${NOWL}. The conditions are kept as a record of how you built it.`;
  const u=se.segId?usedIn(segById(se.segId)):[];
  const rail=`<aside class="rail ${se.inSheet?'insheet':''}"><div class="pcard"><div><span class="big">${fmtN(keep.length)}</span><span class="muted"> ${se.type==='static'?'people will be saved':'people match now'}</span></div>
    <p class="typeline">${se.type==='dynamic'?'<b>Dynamic.</b> Membership is computed from the rules each time the segment is used. A bulk change computes it when the change is submitted.':'<b>Static.</b> Always the same employees. Changes to their attributes later don\'t add or remove anyone.'}</p>
    ${keep.length?`<div class="sec"><span class="h3" style="font-size:13px">By department</span><div class="bars">${topN(keep,'department').map(([k,c])=>bar(k,c,keep.length)).join('')}</div></div><div class="sec"><span class="h3" style="font-size:13px">By work location</span><div class="bars">${topN(keep,'location').map(([k,c])=>bar(k,c,keep.length)).join('')}</div></div>`:''}</div>
    <div class="pcard"><h3>What gets saved</h3><span style="font-size:13.5px">${esc(saved)}</span>${nfil.length?`<ul style="margin:0;padding-left:18px;font-size:13px">${nfil.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}</div>
    ${se.segId?`<div class="pcard"><h3>Used in</h3><span style="font-size:13.5px">${u.length?esc(u.join(', '))+'. Saving changes who those drafts target.':'Not used in any bulk change yet.'}</span></div>`:''}</aside>`;
  return`${head}<div class="segl"><div class="sec">${def}${table}</div>${rail}</div>`}
/* ================= segments: detail ================= */
function segDetail(){const s=segById(S.segId);if(!s){S.route='segments';return segList()}
  const m=[...members(s.id)].map(id=>EMPI[id]).filter(Boolean);const cols=[...RCOLS,...(s.columns||[]).map(c=>({key:c.key,label:c.label,type:c.type,file:true,get:e=>s.values?.[e.id]?.[c.key]}))];const u=usedIn(s);
  const tabs=`<div class="tabsb">${[['members','Members'],['definition','Definition'],['used','Used in']].map(([k,l])=>`<button class="tab ${S.segTab===k?'on':''}" data-act="segtab" data-k="${k}">${l}</button>`).join('')}</div>`;
  let body='';
  if(S.segTab==='members')body=dataTable('segv',S.sv,m,cols,{editable:false,static:s.type==='static',fileName:s.file&&s.file.name,title:'Members',searchPh:'Search name or employee ID',hint:'Sorting and filtering here only change your view. Edit the segment to change who is in it.'});
  else if(S.segTab==='definition')body=`<div class="pcard"><div class="prov">${s.type==='dynamic'?`<b>Rules</b><div class="readback">${esc(groupsTxt(s.groups))}</div><span class="muted">Computed from these rules each time the segment is used. ${pl(m.length,'person','people')} match now.</span>`
    :s.source==='csv'?`<b>Uploaded file</b><div class="rows">${row('File',esc(`${s.file.name} · ${pl(s.file.rows,'row')} · ${fmtN(s.file.matched)} matched · ${fmtN(s.file.unmatched.length)} unmatched`))}${row('Columns kept',s.columns.map(c=>`<span class="ctype">${esc(c.label)} · ${TYPE_LABEL[c.type]}</span>`).join(' '))}${row('Filters applied',esc((s.provenance.filters||[]).join('; ')||'None'))}${row('Excluded by hand',esc(s.provenance.excluded.length?names(s.provenance.excluded):'None'))}${row('Snapshot',esc(s.snapshotAt))}</div>`
    :`<b>Snapshot of these conditions</b><div class="readback">${esc(groupsTxt(s.groups))}</div><span class="muted">Taken ${esc(s.snapshotAt)} (version ${s.version}). The segment keeps these exact employees. Use Refresh snapshot to re-run the conditions and review the difference.</span>`}</div></div>`;
  else body=`<div class="pcard">${u.length?`<div class="tw"><table class="t"><tbody>${u.map(x=>`<tr><td><b>${esc(x)}</b></td><td class="muted">Bulk change</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">Not used in any bulk change yet.</div>'}</div>`;
  return`<div class="crumbs"><button data-act="nav" data-k="segments">Segments</button><span>/</span><span>${esc(s.name)}</span></div>
  <div class="ph"><div><h1>${esc(s.name)} ${typeBadge(s)}</h1><p>${pl(m.length,'member')} · Owner ${esc(s.owner)} · Updated ${esc(s.updated)}${s.desc?' · '+esc(s.desc):''}</p></div>
    <div class="pa"><button class="btn2" data-act="segedit">Edit</button><div class="ddw"><button class="btn2" data-act="segmenu" aria-label="More actions">⋯</button>${S.segMenu?`<div class="ddm pp"><button data-act="segdup"><b>Duplicate</b><span>Start a new segment from this one</span></button>${s.type==='static'&&s.source==='conditions'?`<button data-act="segrefresh"><b>Refresh snapshot</b><span>Re-run the conditions and review the difference</span></button>`:''}<button data-act="segdel"><b style="color:var(--err)">Delete</b><span>Only possible when no bulk change uses it</span></button></div>`:''}</div><button class="btn" data-act="seguse">Bulk change</button></div></div>
  ${tabs}${body}`}
/* ================= header menu (spreadsheet-style column menu) ================= */
const COL2CF={_id:'empid',department:'department',title:'title',location:'location',level:'level',startDate:'startDate'};
function renderHM(){const el=$('#pop');if(!S.hm||!MT[S.hm.t]){el.innerHTML='';return}const m=MT[S.hm.t];const col=m.allCols.find(c=>c.key===S.hm.k);if(!col){el.innerHTML='';return}
  const h=S.hmd;const ts=tsOf(S.hm.t);const x=Math.max(8,Math.min(S.hm.x,window.innerWidth-332)),y=Math.min(S.hm.y,window.innerHeight-200);
  let inputs='';const o=h.op||'';
  if(o.startsWith('t_'))inputs=`<div class="row"><input class="box" style="flex:1" data-in="hv" data-i="0" value="${esc(h.v[0]??'')}" placeholder="Value"></div>`;
  else if(o.startsWith('n_'))inputs=`<div class="row"><input class="box" type="number" style="flex:1" data-in="hv" data-i="0" value="${esc(h.v[0]??'')}" placeholder="Value">${o==='n_between'||o==='n_nbetween'?`<span>and</span><input class="box" type="number" style="flex:1" data-in="hv" data-i="1" value="${esc(h.v[1]??'')}" placeholder="Value">`:''}</div>`;
  else if(o.startsWith('d_'))inputs=`<div class="row"><div style="flex:1">${ddBtn('hrel',relLabel(h.v[0]),'Choose')}</div>${h.v[0]==='exact'?`<input class="box" type="date" data-in="hv" data-i="1" value="${esc(h.v[1]||'')}">`:''}</div>`;
  else if(o==='formula'){const c=compileFormula(h.v[0]||'',m.allCols);const cnt=c.ok?m.base.filter(e=>{try{return!!c.fn(e)}catch(_){return false}}).length:0;
    inputs=`<div class="row" style="flex-direction:column;align-items:stretch"><textarea class="box fxin" data-in="hfx" rows="2" placeholder="=AND([Promo flag]=TRUE, [Proposed increase %]>5)">${esc(h.v[0]||'')}</textarea>
      <span id="fxmsg" class="${!h.v[0]?'muted':c.ok?'done-t':'loss'}" style="font-size:12.5px">${!h.v[0]?'Write a formula or describe it below.':c.ok?`Valid · ${pl(cnt,'row')} match`:esc(c.err)}</span>
      <div class="aibox"><span class="badge b-ai">✦ AI</span><input class="box" data-in="hai" value="${esc(h.ai||'')}" placeholder="Describe the filter, e.g. promo flag yes and increase above 5"><button class="btn2 sm" data-act="haigen">Draft formula</button></div>
      <details class="fxhelp"><summary>Allowed functions and operators</summary><span>${esc(FX_HELP)}</span></details></div>`}
  const all=S.hmAll||[];const q=(h.vq||'').toLowerCase();const sel=h.vals;
  const list=`<h6>Filter by values</h6><div class="row"><input class="box" type="search" style="flex:1" data-in="hvq" value="${esc(h.vq||'')}" placeholder="Search values"></div>
    <div class="row"><button class="lnk" data-act="hvall">Select all</button><button class="lnk" data-act="hvnone">Clear all</button><span class="muted" style="font-size:12px;margin-left:auto">${sel?fmtN(sel.length):fmtN(all.length)} of ${fmtN(all.length)}</span></div>
    <div class="hl">${all.filter(([v])=>v.toLowerCase().includes(q)).slice(0,300).map(([v,c])=>`<label><input type="checkbox" data-act="hval" data-v="${esc(v)}" ${!sel||sel.includes(v)?'checked':''}>${esc(v)}<span>${fmtN(c)}</span></label>`).join('')}</div>`;
  el.innerHTML=`<div class="hmenu pp" style="left:${x}px;top:${y}px" role="menu"><div class="hmt">${esc(col.label)}<span class="muted">${TYPE_LABEL[col.type]||''}</span></div>
    <button class="mi" data-act="hsort" data-dir="1">Sort A → Z</button><button class="mi" data-act="hsort" data-dir="-1">Sort Z → A</button>${ts.sort&&ts.sort.key===col.key?`<button class="mi" data-act="hsort" data-dir="0">Remove sort</button>`:''}<hr>
    <h6>Filter by condition</h6><div class="row"><div style="flex:1">${ddBtn('hop',o?sopLabel(o):'None','None')}</div></div>${inputs}${list}
    <div class="ft"><button class="btn2 sm" data-act="hclear">Reset</button><button class="btn sm" data-act="happly">Apply</button></div>
    ${col.key!=='_emp'?`<hr><button class="mi" data-act="hhide">Hide column</button>`:''}</div>`}
/* ================= fields, values, validation, impact, status, approver ================= */
const CHEV='<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M3 1.5 6.5 5 3 8.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
const CHEVD='<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 3 5 6.5 8.5 3" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
function whatView(d){catalog();d.fields.forEach(ensureField);const q=(S.whatQ||'').trim().toLowerCase();const qs=q.split(/\s+/).filter(Boolean);const ff=S.fFilt||[];const sel=new Set(d.fields);
  const srcF=ff.filter(x=>x.startsWith('s:')).map(x=>x.slice(2)),typF=ff.filter(x=>x.startsWith('t:')).map(x=>x.slice(2));
  const tyName=t=>({text:'Text',select:'List',int:'Number',money:'Amount',date:'Date',team:'List',person:'Person'})[t]||'Text';
  const useF=ff.filter(x=>x.startsWith('u:')).map(x=>x.slice(2));const ok=x=>(!qs.length||qs.every(w=>(x.label+' '+x.path.join(' ')+' '+(x.desc||'')).toLowerCase().includes(w)))&&(!srcF.length||srcF.includes(x.src))&&(!typF.length||typF.includes(tyName(x.type)))&&(!useF.length||useF.includes(usedTier(x.used)))&&(!S.fSel||sel.has(x.key));
  const all=CATALOG;const shown=all.filter(ok);const flat=qs.length||S.fSel;const auto={team:sel.has('department')&&sel.has('team'),compensation:sel.has('per')&&sel.has('compensation')};
  const lockI='<svg width="11" height="12" viewBox="0 0 11 12" aria-hidden="true"><path d="M2.5 5V3.5a3 3 0 0 1 6 0V5" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="1" y="5" width="9" height="7" rx="1.5" fill="currentColor"/></svg>';
  const frow=(x,withPath)=>{const dis=x.ro||x.lock||(auto[x.key]);const on=sel.has(x.key);return`<label class="fi ${on?'on':''} ${x.ro||x.lock?'ro':''}" title="${esc(x.ro||x.lock||'')}"><input type="checkbox" data-act="field" data-f="${x.key}" ${on?'checked':''} ${dis?'disabled':''}><span class="fl"><span class="fn">${esc(x.label)}${S.aiPicked&&S.aiPicked.has(x.key)&&on?' <span class="aitag">✦</span>':''}</span>${x.desc&&!x.ro&&!x.lock?`<small class="fdesc" title="${esc(x.desc)}">${esc(x.desc)}</small>`:''}${withPath?`<small>${esc(x.path.join(' › '))}</small>`:''}</span><span class="fside">${useHtml(x)}${x.ro||x.lock?`<span class="fmeta">${lockI} ${x.ro?'Read-only':'Locked'}</span>`:`<span class="fmeta">${tyName(x.type)}</span>`}</span></label>`};
  const tri=(xs,k)=>{const sx=xs.filter(x=>!x.ro&&!x.lock);const n=sx.filter(x=>sel.has(x.key)).length;return`<input type="checkbox" data-act="fgrp" data-k="${esc(k)}" ${sx.length&&n===sx.length?'checked':''} ${n&&n<sx.length?'data-mixed="1"':''} ${sx.length?'':'disabled'} aria-label="Select all in ${esc(k)}">`};
  let tree='';const LIM=300;
  if(flat){tree=shown.slice(0,LIM).map(x=>frow(x,true)).join('')||`<div class="empty" style="padding:24px"><b>No fields match</b><span>Try another word, or clear the filters.</span></div>`;if(shown.length>LIM)tree+=`<div class="ddmore">Showing ${LIM} of ${fmtN(shown.length)}. Add a word to narrow it.</div>`}
  else for(const cat of CATORDER){const cx=shown.filter(x=>x.path[0]===cat);if(!cx.length)continue;const nSel=cx.filter(x=>sel.has(x.key)).length;const open=S.fOpen.has(cat)||(!S.fShut.has(cat)&&nSel>0);
    tree+=`<div class="fc"><div class="fch">${tri(cx,cat)}<button class="fct" data-act="ftog" data-k="${esc(cat)}" aria-expanded="${open}"><span class="chev">${open?CHEVD:CHEV}</span><b>${esc(cat)}</b><span class="muted">${nSel?`${fmtN(nSel)} selected · `:''}${fmtN(cx.length)} fields</span></button></div>`;
    if(open){const subs=[...new Set(cx.map(x=>x.path[1]))];for(const sb of subs){const sx=cx.filter(x=>x.path[1]===sb);const key=cat+'|'+sb;const ns=sx.filter(x=>sel.has(x.key)).length;const so=S.fOpen.has(key)||(!S.fShut.has(key)&&(sx.length<=8||ns>0));
      tree+=`<div class="fs"><div class="fsh">${tri(sx,key)}<button class="fct" data-act="ftog" data-k="${esc(key)}" aria-expanded="${so}"><span class="chev">${so?CHEVD:CHEV}</span><span>${esc(sb)}</span><span class="muted">${ns?`${fmtN(ns)} selected · `:''}${fmtN(sx.length)}</span></button></div>`;
      if(so){const lim=S.fAll.has(key)?sx.length:60;tree+=`<div class="fis">${sx.slice(0,lim).map(x=>frow(x,false)).join('')}${sx.length>lim?`<button class="lnk" style="padding:6px 30px" data-act="fall" data-k="${esc(key)}">Show all ${fmtN(sx.length)}</button>`:''}</div>`}tree+='</div>'}}
    tree+='</div>'}
  const sugg=[];if(sel.has('level')){if(!sel.has('title'))sugg.push('title');if(!sel.has('compensation'))sugg.push('compensation')}if((sel.has('department')||sel.has('location'))&&!sel.has('manager'))sugg.push('manager');if(sel.has('location')&&!sel.has('timeOff'))sugg.push('timeOff');if(sel.has('laptop')&&!sel.has('refresh'))sugg.push('refresh');
  const selList=d.fields.map(k=>{const x=CATIDX[k];const note=k==='team'&&auto.team?'Added with Department: a team belongs to one department':k==='compensation'&&auto.compensation?'Added with Pay type: base pay is re-entered in the new unit':'';
    return`<div class="si"><div><b>${esc(x?x.label:FIELDS[k].label)}</b>${S.aiPicked&&S.aiPicked.has(k)?' <span class="aitag">✦ AI</span>':''}<small>${esc(x?x.path.join(' › '):'')}</small>${x&&x.used?`<small>${useHtml(x)}</small>`:''}${note?`<small class="muted">${note}</small>`:''}</div>${note?'':`<button class="x" data-act="frm" data-f="${k}" aria-label="Remove ${esc(x?x.label:k)}">×</button>`}</div>`}).join('');
  const fbtn=ff.length?`Filters (${ff.length})`:'';
  return`<div class="aibar"><span class="badge b-ai">✦ AI</span><input class="box" id="aif" data-in="aif" value="${esc(S.aiF||'')}" placeholder="Describe the change, e.g. promotions with new titles and a raise, plus a Figma licence"><button class="btn2 sm" data-act="aifields">Pick fields</button></div>
  <div class="fpick"><div class="fbrowse"><div class="ftool"><input class="search" id="what-q" data-in="whatq" value="${esc(S.whatQ||'')}" placeholder="Search ${fmtN(all.length)} fields" autocomplete="off">${ddBtn('ffilt',fbtn,'Filters','btnlike sm')}
      <label class="tg"><input type="checkbox" data-act="fselonly" ${S.fSel?'checked':''}> Selected only</label>${q||ff.length||S.fSel?`<button class="btn2 sm" data-act="fclear">Clear</button>`:''}<span class="muted" style="margin-left:auto;font-size:12.5px">${q||ff.length||S.fSel?`${fmtN(shown.length)} of ${fmtN(all.length)}`:''}</span></div>
    <div class="flegend"><span>Last used in a bulk change:</span><span class="use u-new"><i></i>last 30 days</span><span class="use u-mid"><i></i>last 6 months</span><span class="use u-old"><i></i>older</span></div><div class="ftree">${tree}</div></div>
  <aside class="fsel"><div class="sec-h"><b>Selected · ${fmtN(d.fields.length)}</b>${d.fields.length?`<button class="lnk" data-act="fnone">Clear all</button>`:''}</div>${selList||`<p class="sub">Pick fields on the left, or describe the change above.</p>`}
    ${sugg.length?`<div class="sugg"><span class="muted" style="font-size:12.5px">Often changed together</span>${sugg.map(k=>`<button data-act="suggest" data-f="${k}">+ ${esc(FIELDS[k].label)}</button>`).join('')}</div>`:''}
    <p class="note">You decide how values are set on the next step: one value for everyone, a rule, or each person.</p></aside></div>`}
const RH=48;const G={items:[],cols:[],ncol:0,raf:0};
function gridCols(d){const F=d.fields.slice().sort((a,b)=>fo(a)-fo(b));const cols=[{appr:true}];
  (d.grid.ctx||[]).forEach(k=>{if(CF[k]&&!d.fields.includes(k))cols.push({ctx:k,label:CF[k].label})});
  if(F.some(f=>MONEY.has(f)))cols.push({ctx:'cur',label:'Currency'});
  F.forEach(f=>{cols.push({f});if((f==='compensation'&&!F.includes('per'))||(f==='per'))if(F.includes('compensation'))cols.push({pct:true})});return cols}
function ctxVal(e,k){if(k==='cur')return curCode(e);const C2=CF[k];if(!C2)return'';const v=C2.get(e);if(C2.type==='person')return EMPI[v]?.name||'';if(C2.type==='date')return fmtIso(v);if(Array.isArray(v))return v.join(', ');return v??''}
function groupVal(d,e,k){if(d.fields.includes(k))return fmtVal(e,k,e[k])||'(blank)';return String(ctxVal(e,k))||'(blank)'}
function gridItems(d){const A=analyze(d);const g=d.grid;let rows=A.rows;const fg=(g.fg||[]).filter(x=>x.conds.some(complete));
  if(fg.length)rows=rows.filter(e=>evalGroups(fg,e)>=0);if(g.changed)rows=rows.filter(e=>A.rowChanged.has(e.id));if(g.issue)rows=rows.filter(e=>(A.rowIss.get(e.id)||[]).includes(g.issue));
  if(g.appr==='need')rows=rows.filter(e=>A.rowAppr.has(e.id));else if(g.appr==='none')rows=rows.filter(e=>A.rowChanged.has(e.id)&&!A.rowAppr.has(e.id));
  else if(g.appr==='err'||g.appr==='warn'){const sv=g.appr==='err'?'e':'w';rows=rows.filter(e=>(A.rowIss.get(e.id)||[]).some(k=>ISS[k].sev===sv))}
  if(!g.group||!g.groupBy)return rows.map(e=>({e}));const by={};const k=g.groupBy;rows.forEach(e=>{const v=groupVal(d,e,k);(by[v]=by[v]||[]).push(e)});const items=[];
  const keys=Object.keys(by);const lab=(FIELDS[k]||CF[k]||{}).label||k;const ordK=k==='level'?(a,b)=>lvlN(a)-lvlN(b):(a,b)=>a.localeCompare(b,undefined,{numeric:true});
  keys.sort(ordK).forEach(v=>{items.push({h:v,lab,n:by[v].length,ch:by[v].filter(e=>A.rowChanged.has(e.id)).length});if(!g.collapsed.has(v))by[v].forEach(e=>items.push({e}))});return items}
function valuesView(d){const A=analyze(d);const g=d.grid;if(g.group===null){const lf=d.fields.find(f=>['select','team','person'].includes(FIELDS[f].type));g.groupBy=g.groupBy||lf||'';g.group=!!(lf&&A.rows.length>300)}if(!g.ctx)g.ctx=d.fields.some(f=>MONEY.has(f)||f==='level')&&!d.fields.includes('rating')?['rating']:[];if(!g.fg)g.fg=[{mode:'all',conds:[]}];
  G.cols=gridCols(d);G.items=gridItems(d);G.ncol=1+G.cols.reduce((s,c)=>s+(c.f?2:1),0);
  const diffF=d.fields.filter(f=>d.modes[f]!=='same');const ruleOk=['compensation','bonus','spotBonus'].some(f=>d.fields.includes(f));
  const tb=(k,l,dis)=>`<button class="tbtn ${g.tool===k?'on':''}" data-act="tool" data-k="${k}" ${dis?'disabled':''}>${l}</button>`;const nf=g.fg.flatMap(x=>x.conds).filter(complete).length;const H=d.hist||{u:[],r:[]};
  const sameF=d.fields.filter(f=>d.modes[f]==='same');
  const samebar=sameF.length?`<div class="samebar"><b>One value for everyone</b>${sameF.map(f=>`<div class="sameit"><span class="tg">${esc(FIELDS[f].label)}</span>${editorSame(d,f)}${ddBtn('fmode:'+f,'One value for everyone','','mini')}</div>`).join('')}</div>`:'';
  const LG=d.log||[];const lastN=LG.slice(-3).reverse();const act=LG.length?`<div class="actlog"><div class="actlog-h"><b>Activity</b><span class="muted">Every change to this bulk change, newest first</span><button class="lnk" data-act="logall">View all ${fmtN(LG.length)}</button></div>${lastN.map(x=>logRow(x)).join('')}</div>`:'';
  const rules=d.rules.length?`<div class="rules"><div class="rules-h">Rules, in the order applied. A later rule, upload or cell edit wins for the same cell.</div>${d.rules.map((r,i)=>{const n=A.rows.filter(e=>pick(d,e,r.field).r===r).length;
    return`<div class="rule ${r.ai&&!r.accepted?'ai':''}"><b>Rule ${i+1}</b><span>${ruleTxt(r)}</span><span class="muted num">· ${pl(n,'cell')}</span>${r.ai&&!r.accepted?`<span class="badge b-ai">✦ AI-drafted · not accepted</span><button class="btn sm" data-act="acceptai" data-i="${i}">Accept ${fmtN(n)} cells</button>`:''}<button class="txt" data-act="rmrule" data-i="${i}">Remove</button></div>`}).join('')}</div>`:'';
  const head1=`<tr><th class="c-emp" rowspan="2">Employee</th>${G.cols.map(c=>c.appr?`<th rowspan="2">Approval</th>`:c.f?`<th class="grp-th" colspan="2"><span class="fhd"><span>${esc(FIELDS[c.f].label)}</span><button class="lnk hchg" data-act="chgfield" data-f="${c.f}" title="Change ${esc(FIELDS[c.f].label)} for everyone or a group">Change…</button></span></th>`:c.pct?`<th rowspan="2">% change</th>`:`<th rowspan="2" class="c-ctx">${esc(c.label)}</th>`).join('')}</tr>`;
  const head2=`<tr>${G.cols.filter(c=>c.f).map(()=>`<th style="border-left:1px solid var(--rule)">Current</th><th>New</th>`).join('')}</tr>`;
  return`<div class="toolbar"><button class="tbtn pri ${g.tool==='change'?'on':''}" data-act="tool" data-k="change">Change values</button>${tb('upload','Upload CSV')}${tb('template','Download template')}<span class="sp"></span>
    <span class="undo"><button class="tbtn icon" data-act="undo" ${H.u.length?'':'disabled'} title="${H.u.length?esc('Undo: '+H.u[H.u.length-1].label)+' (⌘Z)':'Nothing to undo'}" aria-label="Undo">↶ Undo</button><button class="tbtn icon" data-act="redo" ${H.r.length?'':'disabled'} title="${H.r.length?esc('Redo: '+H.r[H.r.length-1].label)+' (⇧⌘Z)':'Nothing to redo'}" aria-label="Redo">↷ Redo</button></span></div>
  <div class="toolbar2">${tb('filter',nf?`Filter rows (${nf})`:'Filter rows')}<label class="tg"><input type="checkbox" data-act="ggroup" ${g.group?'checked':''}> Group by</label><span style="min-width:180px">${ddBtn('gby',g.groupBy?(FIELDS[g.groupBy]||CF[g.groupBy]||{}).label:'','Choose a field','sm')}</span>
    ${ddBtn('gctx',g.ctx.length?`Columns (${g.ctx.length})`:'','Add columns','btnlike sm')}<label class="tg"><input type="checkbox" data-act="gchanged" ${g.changed?'checked':''}> Show changed only</label></div>
  ${toolPanel(d,diffF)}${d.rules.length?rules:''}${samebar}${act}
  <div class="apbar"><span><b>${fmtN(A.noAppr)}</b> ${A.noAppr===1?'person is':'people are'} inside your limits and need no approval · <b>${fmtN(A.needAppr)}</b> need approval${A.needAppr?` (${Object.entries(A.apCount).filter(([,n])=>n).map(([k,n])=>`${APPROVERS[k].short} ${fmtN(n)}`).join(', ')})`:''}</span>
    <span class="seg2">${[['','All rows'],['need',`Needs approval · ${fmtN(A.needAppr)}`],['none',`No approval · ${fmtN(A.noAppr)}`],['err',`Errors · ${fmtN(A.err)}`],['warn',`Warnings · ${fmtN(A.warn)}`]].map(([k,l])=>`<button class="${(g.appr||'')===k?'on':''} ${k==='err'&&A.err?'qerr':k==='warn'&&A.warn?'qwarn':''}" data-act="gappr" data-k="${k}">${l}</button>`).join('')}</span><button class="lnk" data-act="policy" data-k="approvals">Approval thresholds</button></div>
  ${g.appr==='err'||g.appr==='warn'?(()=>{const sv=g.appr==='err'?'e':'w';const ks=ISS_ORDER.filter(k=>ISS[k].sev===sv&&A.issues[k]);const nIn=G.items.filter(x=>x.e).length;
    return`<div class="navbar"><span class="seg2">${[['',`All ${sv==='e'?'errors':'warnings'}`],...ks.map(k=>[k,`${ISS[k].label} · ${fmtN(A.issues[k].length)}`])].map(([k,l])=>`<button class="${(g.issue||'')===k?'on':''}" data-act="gissue" data-k="${k}">${esc(l)}</button>`).join('')}</span>
      <span class="navgo"><button class="btn2 sm" data-act="gnav" data-dir="-1" ${nIn?'':'disabled'}>‹ Previous</button><span class="muted num">${g.cur!=null&&nIn?`${g.cur+1} of ${fmtN(nIn)}`:`${pl(nIn,'row')}`}</span><button class="btn2 sm" data-act="gnav" data-dir="1" ${nIn?'':'disabled'}>Next ›</button></span></div>`})():''}
  ${g.issue?`<div class="issuebar"><span class="sev ${ISS[g.issue].sev}">!</span>Showing only: <b>${esc(ISS[g.issue].label)}</b> (${fmtN((A.issues[g.issue]||[]).length)})<button class="lnk" data-act="clearissue">Show all rows</button></div>`:''}
  <div class="gwrap" id="gwrap"><table class="g"><thead class="two2">${head1}${head2}</thead><tbody id="gbody"></tbody></table></div>
  <div class="legend"><span>Empty cell = no change (grey text is today's value)</span><span><i style="background:var(--chg);border:1px solid #D6E0FB"></i>Changed</span><span><i style="background:var(--err)"></i>Error</span><span><i style="background:#E0A43A"></i>Warning</span><span>✦ AI-drafted, needs accepting</span><span>↑ From your last upload</span><span class="num">${fmtN(G.items.filter(x=>x.e).length)} rows in view</span></div>`}
function ruleTxt(r){const F=FIELDS[r.field];if(!F)return'';const L=F.label;const w=ruleWhere(r);const wt=w.length?` where ${groupsTxt(w)}`:' for everyone';const a=r.a,b=r.b;const sg=x=>(+x>=0?'+':'')+x;
  const pv=x=>F.type==='person'?(EMPI[x]?.name||x):F.type==='date'?fmtIso(x):x;let t;
  switch(r.op){case'pct':t=`${L} ${sg(a)}%`;break;case'add':t=F.type==='money'?`${L} ${sg(fmtN(+a))} ${r.cur}${r.field==='compensation'?' a year':''}, in each person's currency`:`${L} ${sg(a)}`;break;
    case'set':t=F.type==='money'?`${L} = ${fmtN(+a)} ${r.cur}, in each person's currency`:`${L} = ${F.type==='text'?'"'+a+'"':pv(a)}`;break;case'pctbase':t=`${L} = ${a}% of base pay`;break;
    case'map':t=`${L}: ${pv(a)} → ${pv(b)}`;break;case'step':t=`${L} ${+a>0?'up':'down'} ${pl(Math.abs(+a),'level')}`;break;case'first':t=`${L} = first team in the new department`;break;
    case'shift':t=`${L} moved by ${pl(+a,'day')}`;break;case'eff':t=`${L} = the effective date`;break;case'skip':t=`${L} = their manager's manager`;break;
    case'replace':t=`${L}: replace "${a}" with "${b||''}"`;break;case'prefix':t=`${L}: add "${a}" before`;break;case'suffix':t=`${L}: add "${a}" after`;break;case'ladder':t=`${L} = the standard title for the level`;break;default:t=L}
  return t+wt+(r.cap?`, capped at band ${r.cap==='max'?'maximum':'midpoint'}`:'')}
function rtInit(d){const f=d.fields.find(x=>d.modes[x]!=='same')||d.fields[0];S.rt={field:f,op:ropsFor(f)[0][0],a:'',b:'',cur:'USD',cap:f==='compensation'?'max':'',groups:[{mode:'all',conds:[]}]}}
function rtArg(R,which){const F=FIELDS[R.field];const v=R[which]??'';const ph=which==='b'?'New value':'Value';
  if(F.type==='select'||F.type==='team')return`<span style="min-width:180px">${ddBtn('rtv:'+which,v,which==='b'?'Choose the new value':R.op==='map'?'Choose the old value':'Choose a value')}</span>`;
  if(F.type==='person')return`<input class="box" list="dl-mgr" data-in="rt${which}" value="${esc(v&&EMPI[v]?EMPI[v].name+' · '+v:v)}" placeholder="Type a name" style="max-width:220px">`;
  if(F.type==='date'&&R.op==='set')return`<input class="box" type="date" data-in="rt${which}" value="${esc(v)}">`;
  const num=['pct','add','pctbase','step','shift'].includes(R.op)||(R.op==='set'&&(F.type==='money'||F.type==='int'));
  return`<input class="box" data-in="rt${which}" value="${esc(v)}" ${num?'inputmode="decimal" style="max-width:110px"':'style="max-width:200px"'} placeholder="${num?(R.op==='step'?'+1 or -1':R.op==='shift'?'Days':'Amount'):ph}" aria-label="${ph}">`}
function rtArg(R,which){const F=FIELDS[R.field];const v=R[which]??'';const ph=which==='b'?'New value':'Value';
  if(F.type==='select'||F.type==='team')return`<span style="min-width:180px">${ddBtn('rtv:'+which,v,which==='b'?'Choose the new value':R.op==='map'?'Choose the old value':'Choose a value')}</span>`;
  if(F.type==='person')return`<input class="box" list="dl-mgr" data-in="rt${which}" value="${esc(v&&EMPI[v]?EMPI[v].name+' · '+v:v)}" placeholder="Type a name" style="max-width:220px">`;
  if(F.type==='date'&&R.op==='set')return`<input class="box" type="date" data-in="rt${which}" value="${esc(v)}">`;
  const num=['pct','add','pctbase','step','shift'].includes(R.op)||(R.op==='set'&&(F.type==='money'||F.type==='int'));
  return`<input class="box" data-in="rt${which}" value="${esc(v)}" ${num?'inputmode="decimal" style="max-width:110px"':'style="max-width:200px"'} placeholder="${num?(R.op==='step'?'+1 or -1':R.op==='shift'?'Days':'Amount'):ph}" aria-label="${ph}">`}
function rtRule(d){const R=S.rt;const F=FIELDS[R.field];const o=R.op;const noArg=['first','eff','skip','ladder'].includes(o);let a=R.a,b=R.b;
  if(!noArg){if(['pct','add','pctbase','step','shift'].includes(o)||(o==='set'&&(F.type==='money'||F.type==='int'))){a=parseMoney(a);if(!isFinite(a))return{err:'Enter a number.'}}
    else if(F.type==='person'){a=parsePerson(a);if(!a)return{err:'Pick a person from the list.'};if(o==='map'){b=parsePerson(b);if(!b)return{err:'Pick the new manager from the list.'}}}
    else if(a===''||a==null)return{err:'Fill in the value.'};if(o==='map'&&(b===''||b==null))return{err:'Choose the new value.'}}
  if(R.groups.flatMap(g=>g.conds).some(c=>!complete(c)))return{err:'Finish or remove the empty conditions under Where.'};
  return{r:{field:R.field,op:o,a,b,cur:R.cur,cap:R.field==='compensation'&&o!=='set'&&R.cap?R.cap:null,where:clone(R.groups.filter(g=>g.conds.length))}}}
function viewLimit(d){const g=d.grid;const narrowed=(g.fg||[]).some(x=>x.conds.some(complete))||g.changed||g.issue||g.appr;return narrowed?new Set(G.items.filter(x=>x.e).map(x=>x.e.id)):null}
function toolPanel(d,diffF){const g=d.grid;
  if(g.tool==='change'){if(!S.rt||!d.fields.includes(S.rt.field))rtInit(d);const R=S.rt;const F=FIELDS[R.field];const ops=ropsFor(R.field);if(!ops.find(o=>o[0]===R.op))R.op=ops[0][0];const ol=ops.find(o=>o[0]===R.op)[1];
    const noArg=['first','eff','skip','ladder'].includes(R.op);const two=R.op==='map'||R.op==='replace';
    const args=noArg?'':two?`${rtArg(R,'a')}<span>${R.op==='replace'?'with':'→'}</span>${rtArg(R,'b')}`:rtArg(R,'a')+(R.op==='pct'||R.op==='pctbase'?'<span>%</span>':'');
    const cur=F.type==='money'&&(R.op==='add'||R.op==='set')?ddBtn('rtc',R.cur,'','mini'):'';const cap=R.field==='compensation'&&R.op!=='set'?`<span>cap at</span>${ddBtn('rtcap',{max:'band maximum',mid:'band midpoint','':'no cap'}[R.cap||''],'','mini')}`:'';
    const lim=viewLimit(d);const useLim=lim&&R.inView!==false;const t=rtRule(d);const pv=t.r?previewChange(d,t.r,useLim?lim:null):null;const A=analyze(d);const w=ruleWhere({where:R.groups});
    const match=pv?pv.rows:(w.length?changeTargets(d,{where:R.groups},useLim?lim:null).length:(useLim?lim.size:A.rows.length));
    return`<div class="tool rtool">${R.ai?`<div class="aiflag"><span class="badge b-ai">✦ Drafted from: “${esc(R.ai)}”</span><span class="muted" style="font-size:12.5px">Check it, then execute. Nothing changes until you do.</span></div>`:''}
      <div class="rrow"><span class="rl">Change</span><span style="min-width:200px">${ddBtn('rtf',F.label,'Field')}</span><span style="min-width:220px">${ddBtn('rtk',ol,'')}</span>${args}${cur}${cap}</div>
      <div class="rrow top"><span class="rl">For</span><div class="rwhere">${builder('rule',R.groups)}${w.length?'':`<span class="muted" style="font-size:13px">No conditions: everyone in this change${useLim?' who is in view':''}.</span>`}
        ${lim?`<label class="tg"><input type="checkbox" data-act="rtinview" ${useLim?'checked':''}> Only the ${pl(lim.size,'row')} in view (your grid filter)</label>`:''}</div></div>
      <div class="rrow aibox2"><span class="rl">Or</span><input class="box" id="ai-ta" data-in="aitext" value="${esc(S.aiText||'')}" placeholder="Describe it, e.g. 1,000 USD one-time bonus for the Platform team" style="flex:1;min-width:240px"><button class="btn2 sm" data-act="aigo">✦ Draft it</button></div>
      <div class="rrow"><span class="pvline">${pv?`Will change <b class="num">${fmtN(pv.writes.length)}</b> ${pv.writes.length===1?'cell':'cells'} in the ${pl(match,'matching row')}${match-pv.writes.length>0?` (${fmtN(match-pv.writes.length)} already have that value or don't apply)`:''}.`:`<span class="muted">${fmtN(match)} matching rows. ${esc(t.err||'')}</span>`}</span>
        <span style="margin-left:auto;display:flex;gap:10px"><button class="btn2 sm" data-act="tool" data-k="change">Cancel</button><button class="btn sm" data-act="execchange" ${pv&&pv.writes.length?'':'disabled'}>Execute changes</button></span></div></div>`}
  if(g.tool==='filter'){if(!g.fg)g.fg=[{mode:'all',conds:[]}];return`<div class="tool rtool"><div class="rrow top"><span class="rl">Show rows where</span><div class="rwhere">${builder('gf',g.fg)}</div></div>
      <div class="rrow"><span class="muted" style="font-size:13px">Change values can be limited to the rows in view.</span><span style="margin-left:auto;display:flex;gap:10px"><button class="btn2 sm" data-act="gfclear">Clear filter</button><button class="btn sm" data-act="tool" data-k="filter">Done</button></span></div></div>`}
  return''}
function valueInput(f,id){const F=FIELDS[f];if(F.type==='select')return`<select class="sel" id="${id}">${F.opts().map(o=>`<option>${esc(o)}</option>`).join('')}</select>`;
  if(F.type==='team')return`<select class="sel" id="${id}">${ALLTEAMS.map(o=>`<option>${esc(o)}</option>`).join('')}</select>`;
  if(F.type==='person')return`<input class="in" id="${id}" list="dl-mgr" placeholder="Type a manager's name" style="max-width:240px">`;
  return`<input class="in" id="${id}" ${f==='title'?'list="dl-titles"':''} ${F.type!=='text'?'inputmode="decimal"':''} style="max-width:200px">`}
function editorSame(d,f){const F=FIELDS[f];const v=d.same[f]??'';
  if(F.type==='select'||F.type==='team')return`<span style="min-width:200px;display:inline-block">${ddBtn('same:'+f,v,'Choose')}</span>`;
  if(F.type==='person')return`<input class="box" list="dl-mgr" data-in="same" data-f="${f}" value="${v&&EMPI[v]?esc(EMPI[v].name+' · '+v):''}" placeholder="Type a name" style="max-width:220px">`;
  if(F.type==='date')return`<input class="box" type="date" data-in="same" data-f="${f}" value="${esc(v)}">`;
  if(MONEY.has(f))return`<span class="twov"><input class="box" data-in="same" data-f="${f}" value="${esc(v===''?'':fmtN(+v))}" style="max-width:140px" inputmode="decimal">${ddBtn('samecur:'+f,(d.sameCur||{})[f]||'USD','','mini')}</span><small class="muted">Each person gets the equivalent in their own currency.</small>`;
  return`<input class="box" data-in="same" data-f="${f}" value="${esc(v)}" style="max-width:180px">`}
function renderGridRows(){const wrap=$('#gwrap');if(!wrap||!S.d)return;const d=S.d;const A=analyze(d);const items=G.items;const h=wrap.clientHeight||560;
  const st=Math.max(0,Math.floor(wrap.scrollTop/RH)-6),en=Math.min(items.length,st+Math.ceil(h/RH)+14);
  let html=st?`<tr class="spacer"><td colspan="${G.ncol}" style="height:${st*RH}px"></td></tr>`:'';
  for(let i=st;i<en;i++){const it=items[i];html+=it.h!==undefined?`<tr class="ghead"><td class="c-emp" style="background:var(--nav)"><button class="lnk" data-act="gcol" data-dept="${esc(it.h)}">${d.grid.collapsed.has(it.h)?'▸':'▾'} <span class="muted">${esc(it.lab)}:</span> ${esc(it.h)}</button></td><td colspan="${G.ncol-1}"><span class="muted">${fmtN(it.n)} people · ${fmtN(it.ch)} with changes</span></td></tr>`:rowHtml(d,it.e,A.rowIss.get(it.e.id)||[])}
  if(items.length>en)html+=`<tr class="spacer"><td colspan="${G.ncol}" style="height:${(items.length-en)*RH}px"></td></tr>`;
  if(!items.length)html=`<tr><td colspan="${G.ncol}" style="padding:24px;text-align:center" class="muted">No rows match. Clear the filters above.</td></tr>`;
  $('#gbody').innerHTML=html}
function rowHtml(d,e,iss){const A=analyze(d);let h=`<tr class="${S.navId===e.id?'navcur':''}"><td class="c-emp"><button class="lnk" data-act="profile" data-id="${e.id}"><span class="av">${initials(e.name)}</span><span><b>${esc(e.name)}</b><small>${esc(e.title)}</small></span></button></td>`;
  for(const c of G.cols){if(c.appr){const ap=A.rowAppr.get(e.id);h+=`<td>${!A.rowChanged.has(e.id)?'':ap?`<span class="badge b-warn" title="${esc(ap.map(x=>APPROVERS[x.k].who+': '+x.why.join('; ')).join('\n'))}">${ap.map(x=>APPROVERS[x.k].short).join(' · ')}</span>`:'<span class="badge b-ok">No approval</span>'}</td>`;continue}
    if(c.ctx){h+=`<td class="c-ctx">${esc(ctxVal(e,c.ctx))}</td>`;continue}if(c.pct){h+=pctCell(d,e);continue}
    const f=c.f,s2=src(d,e,f),chg=changed(d,e,f);const fi=iss.filter(k=>ISS[k].f===f);const sev=fi.find(k=>ISS[k].sev==='e')?'e':fi.find(k=>ISS[k].sev==='w')?'w':fi.length?'i':'';
    const tip=fi.map(k=>`${ISS[k].label}: ${whyIssue(k,d,e)}`);
    if(f==='compensation'){const b=band(e,nv(d,e,'level'),nv(d,e,'per'),nv(d,e,'department'),nv(d,e,'location'));const cu=curOf(e);tip.push(`Band ${nv(d,e,'level')}: ${cu}${fmtN(b.min)} · ${cu}${fmtN(b.mid)} · ${cu}${fmtN(b.max)}${nv(d,e,'per')==='Hourly'?' per hour':''}`)}
    if(MONEY.has(f)&&chg){let from=null,amt=null;if(s2==='s'){from=(d.sameCur||{})[f]||'USD';amt=d.same[f]}else if(s2==='r'||s2==='ai'){const r=pick(d,e,f).r;if(r&&(r.op==='add'||r.op==='set')){from=r.cur;amt=r.a}}if(from&&from!==curCode(e))tip.push(`Converted from ${fmtN(amt)} ${from} at ${FX_NOTE}`)}
    const cls=['c-new','f-'+f,chg?'chg':'',sev==='i'?'':sev,s2==='ai'?'ai':'',d.csvHits.has(e.id+'|'+f)?'up':''].join(' ');
    h+=`<td class="c-cur">${esc(fmtVal(e,f,e[f]))}</td><td class="${cls}" title="${esc(tip.join('\n'))}">${editor(d,e,f)}${fi.length?`<button class="whyb ${sev}" data-act="why" data-id="${e.id}" data-f="${f}" aria-label="Why is this flagged?">${sev==='i'?'i':'!'}</button>`:''}</td>`}return h+'</tr>'}
function pctCell(d,e){if(!changed(d,e,'compensation')&&!changed(d,e,'per'))return`<td class="pct"></td>`;const np=nv(d,e,'per'),v=+nv(d,e,'compensation');if(!(v>0))return`<td class="pct">—</td>`;
  const a1=annual(e.compensation,e.per),a2=annual(v,np);const p=(a2-a1)/a1*100;return`<td class="pct ${p>15?'hi':''}">${p>=0?'+':''}${p.toFixed(1)}%${np!==e.per?' <small>annualised</small>':''}</td>`}
function editor(d,e,f){const F=FIELDS[f];const key=e.id+'|'+f;
  if(d.modes[f]==='same'){const v=d.same[f];if(v===undefined||v==='')return`<span class="muted">Set above</span>`;const nv2=val(d,e,f);return String(nv2)===String(e[f])?`<span class="muted">No change</span>`:`<span>${esc(fmtVal(e,f,nv2))}</span>`}
  const v=val(d,e,f);const shown=(v===undefined||v===null||v===''||String(v)===String(e[f]))?'':v;
  if(F.type==='date')return`<input class="cell" type="date" data-cell="${key}" value="${esc(shown)}" aria-label="New ${esc(F.label)}" title="Today: ${esc(fmtIso(e[f]))}">`;
  if(F.type==='select'||F.type==='team'){const opts=F.type==='team'?TEAMS[nv(d,e,'department')]:F.opts();
    return`<select class="cell s ${shown?'':'ghost'}" data-cell="${key}" aria-label="New ${esc(F.label)}"><option value="">${esc(fmtVal(e,f,e[f]))}</option>${opts.filter(o=>o!==e[f]).map(o=>`<option ${o===shown?'selected':''}>${esc(o)}</option>`).join('')}</select>`}
  if(F.type==='person')return`<input class="cell" list="dl-mgr" data-cell="${key}" value="${shown&&EMPI[shown]?esc(EMPI[shown].name):''}" placeholder="${esc(fmtVal(e,f,e[f]))}" aria-label="New manager">`;
  const disp=shown===''?'':(F.type==='money'||F.type==='int')?(f==='compensation'&&+shown<1000?String(shown):fmtN(+shown)):shown;
  return`<input class="cell" data-cell="${key}" value="${esc(disp)}" placeholder="${esc(fmtVal(e,f,e[f]))}" ${f==='title'?'list="dl-titles"':''} ${F.type!=='text'?'inputmode="decimal"':''} aria-label="New ${esc(F.label)}">`}
/* deterministic change list: the record of what will be submitted */
function changeList(d,A){const L=[];const rows=A.rows;const R=rows.filter(e=>A.rowChanged.has(e.id));const pct=x=>(x>=0?'+':'')+x.toFixed(1)+'%';
  const med=a=>{if(!a.length)return 0;const b=a.slice().sort((x,y)=>x-y);return b[Math.floor(b.length/2)]};
  const srcs=(f,ch)=>{const c={};ch.forEach(e=>{const k=srcLabel(d,e,f);c[k]=(c[k]||0)+1});return Object.entries(c).sort((a,b)=>b[1]-a[1])};
  const F=d.fields.slice().sort((a,b)=>fo(a)-fo(b));
  for(const f of F){const ch=R.filter(e=>changed(d,e,f));if(!ch.length)continue;const lab=FIELDS[f].label;let detail='',dtxt='',totals='';
    if(f==='compensation'){const ps=[];let dl=0;ch.forEach(e=>{if(nv(d,e,'per')===e.per){const v=+nv(d,e,'compensation');if(v>0)ps.push((v-e.compensation)/e.compensation*100)}dl+=usd(e,annual(+nv(d,e,'compensation')||0,nv(d,e,'per')))-usd(e,annual(e.compensation,e.per))});
      const up=ps.filter(x=>x>0).length,dn=ps.filter(x=>x<0).length;totals=`${dl>=0?'+':'−'}${fmtN(Math.round(Math.abs(dl)))} USD a year`;
      dtxt=`${fmtN(up)} raises${dn?`, ${fmtN(dn)} decreases`:''} · median ${pct(med(ps))} · range ${ps.length?pct(Math.min(...ps))+' to '+pct(Math.max(...ps)):'—'}`;detail=esc(dtxt)}
    else if(MONEY.has(f)){let t=0;ch.forEach(e=>t+=usd(e,(+nv(d,e,f)||0)-(f==='spotBonus'?0:+e[f]||0)));const cad=ch.filter(e=>curCode(e)!=='USD').length;totals=`${t>=0?'+':'−'}${fmtN(Math.round(Math.abs(t)))} USD${f==='spotBonus'?' one-time':' a year'}`;
      const vals=ch.map(e=>usd(e,+nv(d,e,f)||0));dtxt=`${f==='spotBonus'?'Amounts':'New targets'} ${fmtN(Math.round(Math.min(...vals)))} to ${fmtN(Math.round(Math.max(...vals)))} USD equivalent${cad?` · ${fmtN(cad)} paid in CAD after conversion`:''}`;detail=esc(dtxt)}
    else{const m={};ch.forEach(e=>{const k=`${fmtVal(e,f,e[f])||'(blank)'}|${fmtVal(e,f,nv(d,e,f))||'(blank)'}`;m[k]=(m[k]||0)+1});const t=Object.entries(m).sort((a,b)=>b[1]-a[1]);
      dtxt=t.slice(0,4).map(([k,n])=>`${k.replace('|',' → ')} · ${fmtN(n)}`).join('<br>')+(t.length>4?`<br>and ${pl(t.length-4,'other change')}`:'');
      detail=t.slice(0,4).map(([k,n])=>`${esc(k.replace('|',' → '))} · ${nl(n,`tr:${f}|${k}`)}`).join('<br>')+(t.length>4?`<br><span class="muted">and ${pl(t.length-4,'other change')}</span>`:'')}
    const sr=srcs(f,ch);L.push({k:'f:'+f,label:lab,people:ch.length,pkey:'f:'+f,totals,detail,dtxt,src:sr.map(([k,n])=>`${k}: ${fmtN(n)}`).join(' · '),srcHtml:sr.map(([k,n])=>`${esc(k)}: ${nl(n,`src:${f}|${k}`)}`).join(' · '),f})}
  const pi=d.date?payInfo(d.date):null;const money=F.some(f=>MONEY.has(f)||f==='per');const dt=money&&pi?`Pay changes land in the ${fmtD(pi.run)} payroll run; cutoff ${fmtD(pi.cutoff)}.${pi.retro?' The date is in a paid period, so retro pay is computed.':''}`:'No payroll effect.';
  L.push({k:'date',label:'Effective date',people:A.rowChanged.size,pkey:'changed',totals:d.date?fmtD(d.date):'Not set',detail:esc(dt),dtxt:dt});
  const nT=A.rows.length;L.push({k:'scope',label:'People',people:nT,pkey:'targeted',totals:`${fmtN(A.rowChanged.size)} change`,detail:`${nl(nT,'targeted')} targeted · ${nl(nT-A.rowChanged.size,'nochange')} targeted with no change${d.moved.size?` · ${fmtN(d.moved.size)} moved to a follow-up draft`:''}`,dtxt:''});
  const apd=A.needAppr?`${Object.entries(A.apCount).filter(([,n])=>n).map(([k,n])=>`${esc(APPROVERS[k].who)} (${APPROVERS[k].short}) ${nl(n,'ap:'+k)}`).join(' · ')} · ${nl(A.noAppr,'ap:none')} rows inside your limits${A.noAppr?` · ${d.applyMode==='asready'?'each row applies as it clears':'all rows apply together'}`:''}`:'Every row is inside your limits.';
  L.push({k:'appr',label:'Approvals',people:A.needAppr,pkey:'ap:need',totals:A.needAppr?`${fmtN(A.needAppr)} rows need approval`:'None needed',detail:apd,dtxt:''});
  L.push({k:'iss',label:'Validation',people:[...A.rowIss.keys()].filter(id=>A.rowIss.get(id).some(x=>ISS[x].sev!=='i')).length,pkey:'issrows',totals:`${pl(A.err,'error')} · ${pl(A.warn,'warning')}`,detail:Object.keys(A.issues).filter(k=>ISS[k].sev!=='i').map(k=>`${esc(ISS[k].label)} · ${nl(A.issues[k].length,'iss:'+k)}`).join('<br>')||'Nothing flagged.',dtxt:''});
  L.forEach((x,i)=>x.n=i+1);return L}
/* AI summary: written only from the change list, every sentence cites its lines */
function aiSummary(d,A,L){const n=k=>{const x=L.find(y=>y.k===k);return x?`[${x.n}]`:''};const by=k=>L.find(y=>y.k===k);const out=[];const R=A.rows.filter(e=>A.rowChanged.has(e.id));
  const fl=L.filter(x=>x.f);if(!fl.length)return['Nothing changes yet. Enter values to see a summary.'];
  const sc=by('scope');out.push(`${d.name||'This change'} updates ${fl.map(x=>x.label.toLowerCase()).join(', ').replace(/, ([^,]*)$/,' and $1')} for ${pl(A.rowChanged.size,'person','people')} out of ${fmtN(sc.people)} targeted, effective ${d.date?fmtD(d.date):'(no date yet)'}. ${n('date')}${n('scope')}`);
  const c=by('f:compensation');if(c){const rs=d.rules.filter(r=>r.field==='compensation');const s2=c.src.split(' · ')[0].replace(/ (\d[\d,]*)$/,(m,x)=>` sets ${x} of them`);
    out.push(`Base pay changes for ${fmtN(c.people)} people, ${c.totals}${A.rows.length?'':''}. ${rs.length?`Most of it comes from ${rs.length===1?'one rule':rs.length+' rules'}: ${rs.map(r=>ruleTxt(r).replace(/^Base pay /,'')).join('; ')}.`:''} ${s2.charAt(0).toUpperCase()+s2.slice(1)}. ${n('f:compensation')}`);
    let top=null,tp=-1;R.forEach(e=>{if(changed(d,e,'compensation')&&nv(d,e,'per')===e.per){const p=(+nv(d,e,'compensation')-e.compensation)/e.compensation*100;if(p>tp){tp=p;top=e}}});if(top&&tp>10)out.push(`The largest raise is ${top.name}, ${top.title}, at +${tp.toFixed(1)}%. ${n('f:compensation')}`)}
  const lv=by('f:level');if(lv){const pr=R.filter(e=>changed(d,e,'level')&&lvlN(nv(d,e,'level'))>lvlN(e.level)).length;const tl=by('f:title');out.push(`${pl(pr,'person is','people are')} promoted${pr!==lv.people?` and ${fmtN(lv.people-pr)} change level otherwise`:''}${tl?`; ${fmtN(tl.people)} titles change with ${pr===1?'it':'them'}`:''}. ${n('f:level')}${tl?n('f:title'):''}`)}
  for(const f of ['spotBonus','bonus']){const b=by('f:'+f);if(b)out.push(`${fmtN(b.people)} people get ${f==='spotBonus'?'a one-time bonus':'a new target bonus'}, ${b.totals} in total. ${/CAD/.test(b.detail)?'People in Toronto are paid the CAD equivalent. ':''}${n('f:'+f)}`)}
  const other=fl.filter(x=>!['compensation','level','title','spotBonus','bonus'].includes(x.f));other.forEach(x=>{const first=String(x.dtxt||'').split('<br>')[0];out.push(`${x.label}: ${fmtN(x.people)} people, mostly ${first.replace(/ · (\d)/,' ($1')}${/ · \d/.test(first)?')':''}. ${n(x.k)}`)});
  const ap=by('appr');out.push(A.needAppr?`${fmtN(A.needAppr)} rows wait for approval (${Object.entries(A.apCount).filter(([,k])=>k).map(([k,v])=>`${APPROVERS[k].short} ${fmtN(v)}`).join(', ')}); the other ${fmtN(A.noAppr)} are inside your limits. ${n('appr')}`:`No row needs approval. ${n('appr')}`);
  out.push(A.err?`Before you submit: ${pl(A.err,'error')} must be fixed or moved to a new draft, and ${pl(A.warn,'warning')} need acknowledging. ${n('iss')}`:A.warn?`Nothing blocks the change; ${pl(A.warn,'warning')} need acknowledging. ${n('iss')}`:`Nothing is flagged. ${n('iss')}`);
  return out}
function srcLabel(d,e,f){const p=pick(d,e,f);if(p.s==='m')return(d.msrc||{})[e.id+'|'+f]||'Edited by hand';if(p.s==='c')return'CSV upload';if(p.s==='s')return'Same for all';if(p.s==='r'||p.s==='ai'){const i=d.rules.indexOf(p.r);return p.s==='ai'?'AI draft':'Rule '+(i+1)}return'Other'}
function plistOf(d,k){const A=analyze(d);const R=A.rows;const ch=R.filter(e=>A.rowChanged.has(e.id));const i=k.indexOf(':');const t=i<0?k:k.slice(0,i),r=i<0?'':k.slice(i+1);const lab=f=>FIELDS[f]?.label||f;
  switch(t){case'targeted':return['Everyone in this change',R];case'changed':return['People with changes',ch];case'nochange':return['Targeted, with no change',R.filter(e=>!A.rowChanged.has(e.id))];
    case'f':return[`${lab(r)} changes`,ch.filter(e=>changed(d,e,r))];
    case'tr':{const[f,a,b]=r.split('|');return[`${lab(f)}: ${a} → ${b}`,ch.filter(e=>changed(d,e,f)&&(fmtVal(e,f,e[f])||'(blank)')===a&&(fmtVal(e,f,nv(d,e,f))||'(blank)')===b)]}
    case'src':{const[f,l]=r.split('|');return[`${lab(f)} set by ${l}`,ch.filter(e=>changed(d,e,f)&&srcLabel(d,e,f)===l)]}
    case'iss':return[ISS[r].label,(A.issues[r]||[]).map(id=>EMPI[id])];case'sev':return[{e:'Rows with errors',w:'Rows with warnings',i:'Rows with info notes'}[r],R.filter(e=>(A.rowIss.get(e.id)||[]).some(x=>ISS[x].sev===r))];
    case'issrows':return['Rows with errors or warnings',R.filter(e=>(A.rowIss.get(e.id)||[]).some(x=>ISS[x].sev!=='i'))];
    case'ap':return r==='need'?['Rows that need approval',R.filter(e=>A.rowAppr.has(e.id))]:r==='none'?['Changed rows inside your limits',ch.filter(e=>!A.rowAppr.has(e.id))]:[`Rows ${APPROVERS[r].who} approves`,R.filter(e=>(A.rowAppr.get(e.id)||[]).some(x=>x.k===r))]}
  return['People',[]]}
function plistModal(){const d=S.d;const[title,list]=plistOf(d,S.ov.k);const A=analyze(d);const F=d.fields.slice().sort((a,b)=>fo(a)-fo(b));
  const cols=[{key:'_emp',label:'Employee',type:'text',get:e=>e.name,render:e=>person(e,e.title)},{key:'id',label:'Employee ID',type:'text',get:e=>e.id},{key:'department',label:'Department',type:'pick',get:e=>e.department},{key:'location',label:'Work location',type:'pick',get:e=>e.location},
    ...F.flatMap(f=>[{key:f+'_c',label:FIELDS[f].label+' (current)',type:MONEY.has(f)||FIELDS[f].type==='int'?'num':'text',get:e=>MONEY.has(f)||FIELDS[f].type==='int'?+e[f]:fmtVal(e,f,e[f]),render:e=>esc(fmtVal(e,f,e[f])||'—')},
      {key:f+'_n',label:FIELDS[f].label+' (new)',type:MONEY.has(f)||FIELDS[f].type==='int'?'num':'text',get:e=>changed(d,e,f)?(MONEY.has(f)||FIELDS[f].type==='int'?+nv(d,e,f):fmtVal(e,f,nv(d,e,f))):'',render:e=>changed(d,e,f)?`<b>${esc(fmtVal(e,f,nv(d,e,f)))}</b>`:'<span class="muted">No change</span>'}]),
    {key:'appr',label:'Approval',type:'pick',get:e=>A.rowChanged.has(e.id)?((A.rowAppr.get(e.id)||[]).map(x=>APPROVERS[x.k].short).join(' + ')||'None'):''},
    {key:'flags',label:'Flags',type:'text',get:e=>(A.rowIss.get(e.id)||[]).map(x=>ISS[x].label).join('; '),wrap:true}];
  return`<div class="modal wide"><header class="bar"><h2>${esc(title)} · ${fmtN(list.length)}</h2><div class="bar-act"><button data-act="closeov">Close X</button></div></header><div class="modal-b">${dataTable('plist',tsOf('plist'),list.filter(Boolean),cols,{bare:true,searchPh:'Search name or employee ID'})}</div></div>`}
function confirmSig(d,A){return[A.changes,A.rowChanged.size,A.err,A.warn,d.fields.join(),d.date?iso(d.date):''].join('|')}
function summaryBlock(d,A){const L=changeList(d,A);const ai=aiSummary(d,A,L);const cite=t=>esc(t).replace(/\[(\d+)\]/g,'<button class="cite" data-act="cite" data-n="$1" aria-label="Go to line $1">$1</button>');
  const samp=spread(A.rows.filter(e=>A.rowChanged.has(e.id)),5);const F=d.fields.slice().sort((a,b)=>fo(a)-fo(b));
  return`<div class="sec"><div class="sec-h"><h3 class="h3">Summary of changes</h3><span class="muted" style="font-size:13px">Read this before you confirm. The change list is exactly what will be submitted.</span></div>
  <div class="aisum"><div class="aisum-h"><span class="badge b-ai">✦ AI summary</span><span class="muted" style="font-size:12.5px">Written from the change list below. Numbers link to the line they come from.</span><span style="margin-left:auto;display:flex;gap:12px"><button class="lnk" data-act="aicopy">Copy</button><button class="lnk" data-act="airegen">Regenerate</button></span></div>
    <ul>${ai.map(t=>`<li>${cite(t)}</li>`).join('')}</ul></div>
  <div class="pcard" style="padding:0"><div class="sec-h" style="padding:12px 14px 0"><h3 class="h3" style="font-size:14px">Change list</h3><span style="display:flex;gap:14px"><button class="lnk" data-act="step" data-k="values">Open in the grid</button><button class="lnk" data-act="exportchanges">Download every row (CSV)</button></span></div>
    <div class="tw"><table class="t clist"><thead><tr><th>#</th><th>What</th><th class="num">People</th><th>Total</th><th>Detail</th><th>Where the values came from</th></tr></thead><tbody>
    ${L.map(x=>`<tr id="cl-${x.n}"><td class="muted num">${x.n}</td><td><b>${esc(x.label)}</b></td><td class="num">${nl(x.people,x.pkey)}</td><td>${esc(x.totals)}</td><td><small>${x.detail}</small></td><td><small class="muted">${x.srcHtml||''}</small></td></tr>`).join('')}</tbody></table></div></div>
  ${samp.length?`<div class="pcard"><div class="sec-h"><h3 class="h3" style="font-size:14px">Spot check</h3><span class="muted" style="font-size:13px">${samp.length} people spread across the list, before and after</span></div><div class="tw"><table class="t"><thead><tr><th>Employee</th>${F.map(f=>`<th>${esc(FIELDS[f].label)}</th>`).join('')}<th>Approval</th></tr></thead><tbody>
    ${samp.map(e=>{const ap=A.rowAppr.get(e.id);return`<tr><td>${person(e,e.department+' · '+e.location)}</td>${F.map(f=>changed(d,e,f)?`<td><span class="muted">${esc(fmtVal(e,f,e[f])||'—')}</span> → <b>${esc(fmtVal(e,f,nv(d,e,f)))}</b></td>`:`<td class="muted">${esc(fmtVal(e,f,e[f])||'—')}</td>`).join('')}<td>${ap?`<span class="badge b-warn">${ap.map(x=>APPROVERS[x.k].short).join(' · ')}</span>`:'<span class="badge b-ok">None</span>'}</td></tr>`}).join('')}</tbody></table></div></div>`:''}</div>`}
function reviewView(d){const A=analyze(d);const keys=ISS_ORDER.filter(k=>A.issues[k]);
  const sevs=[['e','Errors',"These can't be committed. Fix them or move the rows to a new draft."],['w','Warnings','Valid but unusual. Acknowledge each group to continue.'],['i','Info','No action needed.']];
  const groups=sevs.map(([s,t,sub])=>{const ks=keys.filter(k=>ISS[k].sev===s);if(!ks.length)return'';return`<div class="sec"><div class="sec-h"><div><h3>${t}</h3><p class="sub">${sub}</p></div></div>${ks.map(k=>issueCard(d,A,k)).join('')}</div>`}).join('');
  const unacked=keys.filter(k=>ISS[k].sev==='w'&&!d.ack[k]);const errRows=new Set();keys.filter(k=>ISS[k].sev==='e').forEach(k=>A.issues[k].forEach(id=>errRows.add(id)));
  const gate=A.err?`<div class="gate"><span>${pl(errRows.size,'row')} with errors can't be submitted.</span><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn2" data-act="back">Back to Values</button><button class="btn" data-act="moveerr">Move ${fmtN(errRows.size)} to a new draft and continue with ${fmtN(A.rows.length-errRows.size)}</button></div></div>`
    :unacked.length?`<div class="gate"><span>Acknowledge ${pl(unacked.length,'warning group')} to continue.</span><button class="btn" disabled>Continue to Impact &amp; approvals</button></div>`
    :`<div class="gate"><label class="confirm req-box"><input type="checkbox" data-act="confirmchg" ${d.confirmed===confirmSig(d,A)?'checked':''} ${A.changes?'':'disabled'}><span class="req">I've reviewed the change list: ${pl(A.changes,'change')} for ${pl(A.rowChanged.size,'person','people')}</span></label><div style="display:flex;gap:10px"><button class="btn2" data-act="back">Back</button><button class="btn" data-act="next" ${A.changes&&d.confirmed===confirmSig(d,A)?'':'disabled'}>Continue to Impact &amp; approvals</button></div></div>`;
  return`<div class="sumchips"><button class="sumchip" data-act="issuesdrawer" data-k="e"><span class="sev e">!</span>${pl(A.err,'error')}</button><button class="sumchip" data-act="issuesdrawer" data-k="w"><span class="sev w">!</span>${pl(A.warn,'warning')}</button><button class="sumchip" data-act="plist" data-k="sev:i"><span class="sev i">i</span>${fmtN(A.info)} info</button><span class="muted" style="align-self:center">across ${nl(A.rowChanged.size,'changed')} ${A.rowChanged.size===1?'person':'people'} with changes</span></div>${summaryBlock(d,A)}<div class="sec-h" style="margin-top:6px"><h3 class="h3">Errors and warnings</h3></div>${groups||'<p class="sub">No issues found.</p>'}${gate}`}
function issueCard(d,A,k){const I=ISS[k],ids=A.issues[k];
  const fixes=(I.fix||[]).map(([l,fx])=>`<button class="btn2 sm" data-act="fix" data-issue="${k}" data-fix="${fx}">${esc(l)} (${fmtN(ids.length)})</button>`).join('');
  const ack=I.sev==='w'?(d.ack[k]?`<span class="acked">✓ Acknowledged${d.ackNote[k]?': '+esc(d.ackNote[k]):''}</span>`:`<input class="notein" data-in="acknote" data-issue="${k}" placeholder="Note for the audit log (optional)" value="${esc(d.ackNote[k]||'')}"><button class="btn2 sm" data-act="ack" data-issue="${k}">Acknowledge ${fmtN(ids.length)}</button>`):'';
  return`<div class="icard"><div class="icard-h"><div class="t"><span class="sev ${I.sev}">${I.sev==='i'?'i':'!'}</span><div><b>${esc(I.label)} · ${nl(ids.length,'iss:'+k)}</b><span class="muted" style="font-size:13px">${esc(I.desc)}${I.pol?` Rule: ${esc(POL[I.pol].name)}, set by ${esc(POL[I.pol].owner)}.`:''}</span></div></div></div>
    <div class="icard-a"><div class="ia-l">${fixes}${ack}</div><div class="ia-r"><button class="lnk" data-act="whyissue" data-k="${k}">Why, and who sets this rule</button><button class="lnk" data-act="issuegrid" data-k="${k}">Open in the grid</button></div></div></div>`}
function impactFlow(d,A,I,pi,payNeeded){const n=A.rowChanged.size;const P=(x,w)=>pl(x,'person','people');
  const rp=[{k:'payroll',name:'Payroll',n:payNeeded?I.pay:0,v:payNeeded?`Payroll preview re-runs for the ${fmtD(pi.run)} run. Finance checks it before the ${fmtD(pi.cutoff)} cutoff.`:'',dec:payNeeded&&!d.cutoff.confirmed?'Confirm payroll timing':''},
    {k:'benefits',name:'Benefits',n:I.benSal+I.benLoc+I.benClass+I.benCls,v:'Eligibility is re-checked and salary-linked coverage recalculates'+(I.benCls+I.benLoc?`; enrollment opens for ${P(I.benCls+I.benLoc)}`:'')+'.'},
    {k:'time',name:'Time off',n:I.pto+I.ot+I.ptoPol,v:'Policies, accruals and balances are recalculated on the effective date.'},
    {k:'devices',name:'Device Management',n:I.dev,v:`Devices are ordered or the device policy is re-applied before ${fmtD(d.date)}.`},
    {k:'wf',name:'Approval workflows',n:I.wf,v:'Pending time off and expense approvals re-route to the new managers.'}];
  const owners={slack:'Raj Patel (IT)',google:'Raj Patel (IT)',github:'Eng managers',pagerduty:'Eng managers'};
  const ap=Object.entries(I.apps).map(([k,a])=>({k:'app-'+k,name:a.name,n:a.total+a.loss,v:`Profile and group changes sync on ${d.appSync==='now'?'approval':fmtD(d.date)}. ${owners[k]} reviews them${a.loss?`; ${a.lossTxt(a.loss)}`:''}.`,dec:a.loss&&!d.accessAck?'Acknowledge access removal':''}));
  const node=x=>`<a class="fnode on ${x.dec?'dec':''}" href="#${x.k==='payroll'?'imp-payroll':x.k.startsWith('app-')?'imp-apps':'imp-rippling'}"><div class="fn-top"><b>${esc(x.name)}</b><span class="fn-n">${P(x.n)}</span></div><small>${esc(x.v)}</small>${x.dec?`<span class="badge b-warn">${esc(x.dec)}</span>`:''}</a>`;
  const grp=(t,xs)=>{const on=xs.filter(x=>x.n),off=xs.filter(x=>!x.n);return`<div class="fgl">${t}</div>${on.map(node).join('')}${off.length?`<div class="fnode off"><span class="muted" style="font-size:12.5px">Not affected, no re-verification:</span> ${off.map(x=>`<span class="offchip">${esc(x.name)}</span>`).join('')}</div>`:''}`};
  return`<div class="region"><div class="region-h"><h3 class="h3">What this change sets off</h3><span class="sub">Each system that reads a changed field re-verifies it. Click a system for the detail.</span></div>
  <div class="flow"><div class="fsrc"><span class="muted" style="font-size:12px">This bulk change</span><b>${esc(d.name||'Untitled')}</b><span>${P(n)} · ${esc(d.fields.map(f=>FIELDS[f].label).join(', '))}</span><span class="muted" style="font-size:12.5px">Effective ${fmtD(d.date,true)}</span></div>
    <div class="fbus">${grp('Rippling products at Acme Corp',rp)}${grp('Connected apps',ap)}</div></div>
  <div class="flegend"><span class="use u-mid"><i></i>Re-verification triggered</span><span class="use u-old"><i></i>Not affected</span><span class="badge b-warn">Needs your decision</span></div></div>`}
function impactView(d){const A=analyze(d);const I=impact(d);const pi=d.date?payInfo(d.date):null;const payNeeded=I.pay>0||I.tax>0;
  const payCard=`<div class="icd first" id="imp-payroll"><h4>Payroll</h4>
    ${payNeeded?`<div><span class="n">${fmtN(I.pay)}</span> pay changes land in the <b>${fmtD(pi.run)}</b> run${I.tax?` · ${pl(I.tax,'tax-state change')}`:''}</div>
    ${I.delta?`<div class="muted" style="font-size:13.5px">Annual base pay ${I.delta>=0?'+':'−'}${fmtN(Math.abs(I.delta))} USD equivalent (${I.base?(I.delta/I.base*100).toFixed(1):'0.0'}% of this group's base pay). Hourly pay is annualised at 2,080 hours.</div>`:''}
    ${I.spotN?`<div class="muted" style="font-size:13.5px">${pl(I.spotN,'one-time bonus','one-time bonuses')}, ${fmtN(I.spot)} USD equivalent in total, paid in the ${fmtD(pi.run)} run.</div>`:''}
    ${I.cad?`<div class="muted" style="font-size:13.5px">${pl(I.cad,'person','people')} paid in CAD: amounts entered in USD are converted at ${esc(FX_NOTE)}.</div>`:''}
    <div class="cutoff"><b>If approval lands after the ${fmtD(pi.cutoff)} cutoff:</b>
      <label><input type="radio" name="cut" data-act="cut" value="next" ${d.cutoff.choice==='next'?'checked':''}> Pay from the effective date in the next run (${fmtD(pi.next)}), with retro pay. <span class="muted">Pre-selected.</span></label>
      <label><input type="radio" name="cut" data-act="cut" value="offcycle" ${d.cutoff.choice==='offcycle'?'checked':''}> Run an off-cycle payroll for these changes.</label>
      <label><input type="radio" name="cut" data-act="cut" value="date" ${d.cutoff.choice==='date'?'checked':''}> Change the effective date instead.</label>
      ${d.cutoff.confirmed?`<span class="done-t">✓ Payroll timing confirmed</span>`:`<div><button class="btn sm" data-act="confirmcut">Confirm payroll timing</button></div>`}</div>`:`<div class="muted">No pay changes in this change.</div>`}</div>`;
  const cards=[],zeros=[];const card=(name,n,lines)=>{if(!n){zeros.push(name);return}cards.push(`<div class="icd"><h4>${esc(name)}</h4><div><span class="n">${fmtN(n)}</span> ${n===1?'person':'people'}</div><ul>${lines.filter(Boolean).map(l=>`<li>${l}</li>`).join('')}</ul></div>`)};
  card('Benefits',I.benSal+I.benLoc+I.benClass+I.benCls,[I.benCls&&`${fmtN(I.benCls)} change benefits class, which opens an enrollment window`,I.benSal&&`${fmtN(I.benSal)} salary-linked life and disability coverage amounts recalculate`,I.benLoc&&`${fmtN(I.benLoc)} move to a region with different plan availability, which opens an enrollment window`,I.benClass&&`${fmtN(I.benClass)} change benefits class with the pay type`]);
  card('Time off',I.pto+I.ot+I.ptoPol,[I.ptoPol&&`${fmtN(I.ptoPol)} move to a new time off policy; balances are recalculated on ${fmtD(d.date)}`,I.pto&&`${fmtN(I.pto)} move to a different state's leave policy`,I.ot&&`${fmtN(I.ot)} change overtime eligibility`]);
  card('Devices',I.dev,[I.laptops&&`${fmtN(I.laptops)} new laptops ordered to arrive before ${fmtD(d.date)}; old devices get prepaid return labels`,I.refreshN&&`${fmtN(I.refreshN)} device refresh dates updated in Device Management`,I.devPol&&`${fmtN(I.devPol)} move to a different department's device policy`]);
  card('Workflows',I.wf,[I.wf&&`${fmtN(I.wfAppr)} pending PTO and expense approvals re-route to new managers`,I.wf&&`<label class="tg"><input type="checkbox" data-act="digest" ${d.digest?'checked':''}> Send new managers one digest instead of ${fmtN(I.wf)} emails</label>`]);
  const apps=Object.entries(I.apps).map(([k,a])=>{if(!a.total&&!a.loss)return'';const open=d.show['app-'+k];
    return`<div class="icd"><h4>${esc(a.name)}<button class="lnk" data-act="whyapp" data-k="${k}">${open?'Hide mapping':'Why this app?'}</button></h4><ul>${a.items.filter(x=>x[0]).map(x=>`<li><b class="num">${fmtN(x[0])}</b> ${esc(x[1])}</li>`).join('')}${a.loss?`<li class="loss"><b>${esc(a.lossTxt(a.loss))}</b></li>`:''}</ul>${open?`<div class="mapping">Changed fields mapped to this app:<br>${a.items.map(x=>esc(x[2])).join('<br>')}</div>`:''}</div>`}).join('');
  const appsZero=Object.values(I.apps).filter(a=>!a.total&&!a.loss).map(a=>a.name);
  const decisions=[];if(payNeeded&&!d.cutoff.confirmed)decisions.push('Confirm payroll timing for a late approval');if(I.losses&&!d.accessAck)decisions.push('Acknowledge the access people will lose');
  const n=A.rows.filter(e=>A.rowChanged.has(e.id)).length;const lbl=I.approvers.length?`Submit changes for ${pl(n,'person','people')} for approval · effective ${fmtD(d.date)}`:`Schedule changes for ${pl(n,'person','people')} · effective ${fmtD(d.date)}`;
  return`${impactFlow(d,A,I,pi,payNeeded)}
  <div class="region" id="imp-rippling"><div class="region-h"><h3 class="h3">Rippling products at Acme Corp</h3><span class="sub">They read Acme Corp's employee record directly and update on ${fmtD(d.date)}.</span></div>${payCard}<div class="cards">${cards.join('')}</div>${zeros.length?`<div class="zero"><b>Not affected:</b> ${zeros.join(' · ')}</div>`:''}</div>
  <div class="region" id="imp-apps"><div class="region-h"><h3 class="h3">Apps connected to Acme Corp's Rippling</h3><span class="sub">Rippling sends each app only the fields it uses. A failed sync is retried and never undoes the change.</span></div>
    ${apps?`<div class="cards">${apps}</div>`:''}${appsZero.length?`<div class="zero"><b>Not affected:</b> ${appsZero.join(' · ')}</div>`:''}
    ${I.losses?`<label class="tg" style="color:var(--err)"><input type="checkbox" data-act="accessack" ${d.accessAck?'checked':''}> I understand ${pl(I.losses,'access removal')} will happen on ${fmtD(d.date)}</label>`:''}
    <div class="rows">${row('When apps update',`<label class="tg"><input type="radio" name="sync" data-act="appsync" value="effective" ${d.appSync==='effective'?'checked':''}> On the effective date (${fmtD(d.date)})</label><label class="tg"><input type="radio" name="sync" data-act="appsync" value="now" ${d.appSync==='now'?'checked':''}> As soon as it's approved</label><span class="hint">A reorg announced Monday shouldn't cut anyone's access on Friday.</span>`)}</div></div>
  <div class="region"><div class="region-h"><h3 class="h3">Approvals</h3><button class="lnk" data-act="policy" data-k="approvals">Approval thresholds</button></div>
    <p class="sub">${fmtN(A.noAppr)} of ${pl(A.rowChanged.size,'person','people')} are inside your limits and need no approval.${A.needAppr?` ${fmtN(A.needAppr)} need approval:`:''}</p>
    ${I.approvers.length?`<div class="tw"><table class="t">${I.approvers.map(a=>`<tr><td>${person({name:a.who},a.role)}</td><td class="num">${pl(a.n,'row')}</td><td>${esc(a.what)}</td></tr>`).join('')}</table></div><p class="note">One request per approver for the whole change. They can send single rows back; the rest go ahead.</p>`:`<p class="sub">You can cancel until ${fmtD(d.date)}.</p>`}
    ${A.needAppr&&A.noAppr?`<div class="sec"><b class="req">When do the changes take effect?</b>
      <label class="opt"><input type="radio" name="apm" data-act="apm" value="together" ${d.applyMode!=='asready'?'checked':''}><span><b>All rows together</b><small class="muted">Nothing changes until every row is approved. Then everyone's change lands on ${fmtD(d.date)}, or on the day the last approval comes in if that's later.</small></span></label>
      <label class="opt"><input type="radio" name="apm" data-act="apm" value="asready" ${d.applyMode==='asready'?'checked':''}><span><b>Each row as soon as it's cleared</b><small class="muted">The ${fmtN(A.noAppr)} rows without approval take effect on ${fmtD(d.date)}. Each of the other ${fmtN(A.needAppr)} takes effect once its own approvals clear.</small></span></label></div>`:''}</div>
  <div class="region"><h3 class="h3">Notifications</h3><div class="rows">
    ${row('You','Every status change, and one digest if an app needs attention.')}${row('Approvers',I.approvers.length?'A request now, with the summary and outliers first.':'Not needed.')}
    ${row('App owners','Only when their app needs a person to act (for example Raj Patel for Google Workspace).')}
    ${row('Managers',`<label class="tg"><input type="checkbox" data-act="notifymgr" ${d.notifyMgr?'checked':''}> A digest of their team's changes on ${fmtD(d.date)}</label>`)}
    ${row('Employees',`<label class="tg"><input type="checkbox" data-act="notifyemp" ${d.notifyEmp?'checked':''}> File a change letter to each person's Documents on ${fmtD(d.date)}</label><span class="hint">Off by default. A letter can't be unsent, and managers usually tell their team first.</span>${d.notifyEmp?`<div class="mapping">Preview: "Hi Virge, as of ${fmtD(d.date,true)} your compensation is … This reflects the FY26 review. Talk to your manager with any questions."</div>`:''}`)}</div></div>
  <div class="decide"><div>${decisions.length?`<b>${pl(decisions.length,'decision')} needed before you submit</b><ul>${decisions.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:`<b>Ready to submit.</b> <span class="muted">Nothing changes in Rippling until it's approved and ${fmtD(d.date)} arrives.</span>`}</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn2" data-act="back">Back</button><button class="btn" data-act="submit" ${decisions.length?'disabled':''}>${esc(lbl)}</button></div></div>`}
function statusView(d){const R=d.run;const A=analyze(d);const I=impact(d);const n=A.rows.filter(e=>A.rowChanged.has(e.id)).length;
  const phases=[['approval',I.approvers.length?`Awaiting approval · ${I.approvers.map(a=>a.who).join(', ')}`:'Submitted'],['scheduled',`Scheduled for ${fmtD(d.date,true)}`],['committed',`Committed ${fmtN(n)}/${fmtN(n)}`]];
  const idx=phases.findIndex(p=>p[0]===R.phase);
  const track=`<div class="track">${phases.map((p,i)=>`<span class="stp ${i<idx||R.phase==='committed'?'done':i===idx?'cur':''}"><span class="dot">${i<idx||R.phase==='committed'?'✓':i+1}</span>${esc(p[1])}</span>`).join('')}</div>`;
  const demo=R.phase==='approval'?`<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center"><span class="demo-l">Demo</span><button class="btn2 sm demo" data-act="approveas">Open as Priya Shah (Finance approver)</button><button class="btn2 sm demo" data-act="approveall">Approve everything</button></div>`
    :R.phase==='scheduled'?`<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center"><span class="demo-l">Demo</span><button class="btn2 sm demo" data-act="arrive">Jump to ${fmtD(d.date)}: the effective date arrives</button></div>`:'';
  const band1=`<div class="band"><div class="sec-h"><h3>Rippling record</h3><span class="muted">${esc(d.id)} · submitted 11:20 IST · ${pl(n,'person','people')} frozen at submit</span></div>${track}
    ${A.needAppr&&A.noAppr?`<p class="sub">${d.applyMode==='asready'?`${fmtN(A.noAppr)} rows without approval take effect on ${fmtD(d.date)}; the other ${fmtN(A.needAppr)} follow as their approvals clear.`:`All rows take effect together once every row is approved.`}</p>`:''}
    <p class="sub">${R.phase==='committed'?'The new values are the record. Payroll and every other Rippling product read them from here.':R.phase==='scheduled'?`Approved. Profiles show "Upcoming" until ${fmtD(d.date)}.`:'Nothing changes until approval.'}</p>${demo}</div>`;
  let band2='';
  if(R.phase==='committed'&&R.sync){const rows=R.sync.map(s=>{let st='',det='',act='';
    if(s.state==='done'){st=`<span class="st done">✓ ${esc(s.doneTxt||'Synced')}</span>`;det=esc(s.detail||'')}
    else if(s.state==='prog'){st=`<span class="st prog">In progress</span>`;det=`<div class="prog-b"><i style="width:${s.total?s.done/s.total*100:0}%"></i></div><small class="muted num">${fmtN(s.done)} of ${fmtN(s.total)}</small>`}
    else if(s.state==='retry'){st=`<span class="st retry">↻ Retrying</span>`;det=`Rate-limited by ${esc(s.name)}. Next attempt in 0:${String(s.next).padStart(2,'0')}. Retrying automatically. Nothing for you to do.`}
    else if(s.state==='act'){st=`<span class="st act">Needs action</span>`;det=esc(s.detail);act=`<button class="btn2 sm" data-act="retry" data-k="${s.k}">Retry now</button>`}
    return`<div class="syn"><b>${esc(s.name)}</b>${st}<span>${det}</span>${act}</div>`}).join('');
    const allDone=R.sync.every(s=>s.state==='done'||s.state==='act');const nAct=R.sync.filter(s=>s.state==='act');
    band2=`<div class="band"><div class="sec-h"><h3>Rippling products and Integrated Apps</h3><span class="muted">Each one syncs on its own. None of them can undo the record.</span></div>${rows}</div>
    ${allDone?`<div class="endstate">Rippling is updated for ${pl(n,'person','people')}.${nAct.length?` ${nAct.map(s=>s.name).join(', ')} has ${pl(nAct.reduce((a,x)=>a+(x.fail||0),0),'item')} with Raj Patel (IT); nothing for you to redo.`:' Every product and app is in sync.'}</div>`:''}`}
  const q=(S.empQ||'').toLowerCase();let found='';
  if(q.length>1){const e=A.rows.find(x=>x.name.toLowerCase().includes(q));found=e?`<div class="band"><div class="sec-h">${person(e,e.title)}<button class="lnk" data-act="profile" data-id="${e.id}">Open profile</button></div>${empStatus(d,e)}</div>`:`<p class="sub">No one in this change matches "${esc(S.empQ)}".</p>`}
  return`${band1}${band2||`<div class="band"><h3 class="h3">Rippling products and Integrated Apps</h3><p class="sub">Nothing syncs before the record commits on ${fmtD(d.date)}. ${d.appSync==='effective'?'Apps update on the effective date.':'Apps update as soon as it is approved.'}</p></div>`}
  <div class="sec"><div class="sec-h"><h3>Check one person</h3></div><input class="in" id="emp-q" data-in="empq" value="${esc(S.empQ||'')}" placeholder="Type a name, e.g. Virge" style="max-width:320px;border-bottom:1px solid var(--rule)">${found}</div>
  <div class="gate"><span>Made a mistake? A reversal is a new bulk change pre-filled with the old values. It goes through the same validation and approvals, and lists what can't be reversed (pay already run, letters sent).</span><button class="btn2" data-act="reversal">Create reversal</button></div>`}
function empStatus(d,e){const R=d.run;const items=[['Rippling record',R.phase==='committed'?'✓ Committed':R.phase==='scheduled'?'Scheduled':'Awaiting approval']];
  if(R.phase==='committed'&&R.sync)R.sync.forEach(s=>{if(s.k==='google'&&R.failIds&&R.failIds.includes(e.id)&&s.state==='act')items.push([s.name,'Needs action: account suspended']);else items.push([s.name,s.state==='done'?'✓ '+(s.doneTxt||'Synced'):s.state==='retry'?'Retrying':'In progress'])});
  return`<div class="rows">${items.map(([a,b])=>row(a,esc(b))).join('')}</div>`}
function startSync(d){const I=impact(d);const A=analyze(d);const R=d.run;R.sync=[];
  R.sync.push({k:'payroll',name:'Payroll',state:'done',doneTxt:`In the ${fmtD(payInfo(d.date).run)} run`,detail:`${pl(I.pay,'pay change')} picked up from the record`});
  if(I.benSal+I.benLoc+I.benClass)R.sync.push({k:'benefits',name:'Benefits',state:'done',doneTxt:'Recalculated',detail:pl(I.benSal+I.benLoc+I.benClass,'person','people')});
  if(I.pto+I.ot)R.sync.push({k:'time',name:'Time off',state:'done',doneTxt:'Policies reassigned',detail:''});
  if(I.dev)R.sync.push({k:'dev',name:'Devices',state:'done',doneTxt:'Policies updated',detail:''});
  const ap=I.apps;
  if(ap.slack.total)R.sync.push({k:'slack',name:'Slack',state:'prog',done:0,total:ap.slack.total,doneTxt:`Synced ${fmtN(ap.slack.total)}`});
  if(ap.google.total){const fail=Math.min(2,ap.google.total);R.failIds=A.rows.filter(e=>A.rowChanged.has(e.id)&&changed(d,e,'title')).slice(0,fail).map(e=>e.id);
    R.sync.push({k:'google',name:'Google Workspace',state:'prog',done:0,total:ap.google.total,fail,doneTxt:`Synced ${fmtN(ap.google.total)}`,detail:`${pl(fail,'account')} suspended in Google Workspace, so the title can't be written. Raj Patel (IT) was notified. Rippling's values are unchanged.`})}
  if(ap.github.total)R.sync.push({k:'github',name:'GitHub',state:'retry',next:9,total:ap.github.total,done:0,doneTxt:`Synced ${fmtN(ap.github.total)}`});
  if(!ap.slack.total&&!ap.google.total&&!ap.github.total)R.sync.push({k:'none',name:'Integrated Apps',state:'done',doneTxt:'No app changes',detail:'None of the changed fields are mapped to a connected app.'});
  clearInterval(S.timer);S.timer=setInterval(()=>tick(d),700)}
function tick(d){const R=d.run;if(!R||!R.sync){clearInterval(S.timer);return}let live=false;
  R.sync.forEach(s=>{if(s.state==='prog'){const step=Math.max(1,Math.ceil(s.total/5));s.done=Math.min(s.total-(s.fail||0),s.done+step);if(s.done>=s.total-(s.fail||0))s.state=s.fail?'act':'done';else live=true}
    else if(s.state==='retry'){s.next-=1;if(s.next<=0){s.state='prog';s.done=0}live=true}});
  if(!live)clearInterval(S.timer);if(S.route==='draft'&&S.step==='status'&&!S.approver&&!S.ov&&S.d===d){const y=window.scrollY;render();window.scrollTo(0,y)}}
function approverView(){const d=S.d;const A=analyze(d);const fs=['compensation','per','bonus','spotBonus','equity'].filter(f=>d.fields.includes(f));
  const base=A.rows.filter(e=>(A.rowAppr.get(e.id)||[]).some(x=>x.k==='finance'));const I=impact(d);const budget=I.base*.06;const sel=d.rejected;
  const pct=e=>{if(!changed(d,e,'compensation'))return 0;const a1=annual(e.compensation,e.per),a2=annual(+nv(d,e,'compensation'),nv(d,e,'per'));return(a2-a1)/a1*100};
  const isOut=e=>{const iss=A.rowIss.get(e.id)||[];return iss.includes('raise15')||iss.includes('above_mid')||iss.includes('unit_switch')||iss.includes('band_exc')||(changed(d,e,'equity')&&+nv(d,e,'equity')>e.equity)};
  const outN=base.filter(isOut).length;const rows=S.apOut?base.filter(isOut):base;
  if(!TS.apv){TS.apv=tsNew(25);TS.apv.sort={key:'pct',dir:-1}}
  const cols=[{key:'_emp',label:'Employee',type:'text',get:e=>e.name,render:e=>person(e,e.title)},{key:'department',label:'Department',type:'pick',get:e=>e.department},{key:'level',label:'Level',type:'ord',get:e=>nv(d,e,'level'),render:e=>changed(d,e,'level')?`${esc(e.level)} → <b>${esc(nv(d,e,'level'))}</b>`:esc(e.level)},
    {key:'cur',label:'Base pay (current)',type:'num',get:e=>usd(e,annual(e.compensation,e.per)),render:e=>esc(fmtVal(e,'compensation',e.compensation))},{key:'new',label:'Base pay (new)',type:'num',get:e=>usd(e,annual(+nv(d,e,'compensation'),nv(d,e,'per'))),render:e=>`<b>${esc(fmtVal(e,'compensation',nv(d,e,'compensation')))}</b>`},
    {key:'pct',label:'Change %',type:'num',get:e=>+pct(e).toFixed(1),render:e=>`<span class="${pct(e)>15?'loss':''}">${pct(e)>=0?'+':''}${pct(e).toFixed(1)}%</span>`},
    {key:'why',label:'Why it needs you',type:'text',wrap:true,get:e=>((A.rowAppr.get(e.id)||[]).find(x=>x.k==='finance')||{why:[]}).why.join('; ')},
    {key:'flags',label:'Flags',type:'pick',get:e=>(A.rowIss.get(e.id)||[]).filter(k=>['raise15','above_mid','unit_switch','band_exc'].includes(k)).map(k=>ISS[k].label).join('; ')||'None'},
    {key:'reason',label:'Reason sent back',type:'text',get:e=>sel.get(e.id)||'',render:e=>sel.has(e.id)?`<input class="notein" data-in="apreason" data-id="${e.id}" value="${esc(sel.get(e.id)||'')}" placeholder="Reason" list="dl-reasons">`:''}];
  const miss=[...sel.entries()].filter(([,v])=>!String(v).trim()).length;
  const selbar=sel.size?`<div class="selbar"><b>${pl(sel.size,'row')} selected to send back</b><input class="box" id="apr-common" list="dl-reasons" placeholder="Reason for the selected rows" style="flex:1;min-width:220px"><button class="btn2 sm" data-act="apreasonall">Apply to ${fmtN(sel.size)} selected</button>${miss?`<span class="loss" style="font-size:12.5px">${fmtN(miss)} without a reason</span>`:'<span class="done-t" style="font-size:12.5px">✓ Every row has a reason</span>'}<button class="lnk" data-act="tselnone" data-t="apv">Clear selection</button></div>`:'';
  return`<div class="card nos"><section class="main"><header class="bar"><h2>Approve: ${esc(d.name)}</h2><div class="bar-act"><button data-act="apback">Back to submitter view</button></div></header>
  <div class="strip">${kv('Your fields',fs.map(f=>FIELDS[f].label).join(', '))}${kv('Rows for you',fmtN(base.length))}${kv('Annual cost (USD)',`${I.delta>=0?'+':'−'}${fmtN(Math.abs(I.delta))}`)}${kv('Merit budget (USD)',fmtN(budget))}${kv('Of budget',`${budget?(I.delta/budget*100).toFixed(0):0}%`,I.delta>budget?'err':'')}${kv('Effective',fmtD(d.date,true))}</div>
  <div class="content"><p class="sub">Only rows above the self-approval limits are here. ${I.delta<=budget?`Within budget: ${fmtN(budget-I.delta)} USD left`:`${fmtN(I.delta-budget)} USD over budget`} (${(I.delta/I.base*100).toFixed(1)}% of this group's base pay against a 6% merit budget). Tick rows to send them back; one reason can cover many rows.</p>
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span class="seg2"><button class="${S.apOut?'':'on'}" data-act="apout" data-v="0">All · ${fmtN(base.length)}</button><button class="${S.apOut?'on':''}" data-act="apout" data-v="1">Outliers · ${fmtN(outN)}</button></span><span class="muted" style="font-size:12.5px">Outliers: raises above 15%, crossing the band midpoint, band exceptions, pay-type switches, equity grants.</span></div>
    ${selbar}${dataTable('apv',TS.apv,rows,cols,{bare:true,sel,searchPh:'Search name or department'})}
    <datalist id="dl-reasons"><option>Above the merit budget for this team</option><option>Raise is above the guideline; please recalibrate</option><option>Promotion not approved in calibration</option><option>Hold until the mid-year cycle</option></datalist>
    <div class="gate"><span>${sel.size?`${pl(sel.size,'row')} go back to the submitter as a follow-up draft${miss?`. ${fmtN(miss)} still need a reason`:''}.`:'Approve all, or tick rows to send them back.'}</span><button class="btn" data-act="approve">Approve ${fmtN(base.length-sel.size)}${sel.size?` · send ${fmtN(sel.size)} back`:''}</button></div>
    <p class="note">Comp approvals open here, not as a one-tap button in Slack or email, because pay decisions need this context.</p></div></section></div>`}
/* ================= overlays ================= */
function renderOverlay(){const o=$('#overlay');if(!S.ov){o.classList.remove('on');o.innerHTML='';return}o.classList.add('on');o.innerHTML=S.ov.type==='profile'?profileModal():S.ov.type==='plist'?plistModal():modal()}
function profileModal(){const e=EMPI[S.ov.id];if(!e){S.ov=null;return''}const d=S.d;const tab=S.ov.tab;const R=d&&d.run;const inChange=R&&R.frozen&&R.frozen.includes(e.id)&&!d.moved.has(e.id);
  const tabs=[['emp','Employment information'],['personal','Personal information'],['add','Additional information'],['reports','Direct reports'],['docs','Documents'],['apps','Integrated apps'],['tfa','Two-factor devices']];
  const fv=f=>{const cur=fmtVal(e,f,e[f]);if(!inChange||!changed(d,e,f))return esc(cur);const nw=fmtVal(e,f,nv(d,e,f));
    if(R.phase==='committed')return`${esc(nw)}<br><span class="chipnote">via ${esc(d.name)} (${esc(d.id)}) · approved by Priya Shah</span>`;return`${esc(cur)}<br><span class="chipnote up">${R.phase==='scheduled'?'Upcoming':'Pending approval'}: ${esc(nw)} on ${fmtD(d.date)}</span>`};
  let body='';
  if(tab==='emp')body=['title','department','team','compensation','per','bonus','equity','email','manager','location'].map(f=>row(FIELDS[f].label,fv(f))).join('')+row('Start date',fmtIso(e.startDate));
  else if(tab==='add')body=['level','rating','costCenter','oncall','timeOff','benefits','laptop','refresh'].map(f=>row(FIELDS[f].label,fv(f))).join('')+Object.entries(CF).filter(([,x])=>x.src).map(([k,x])=>row(x.label,`${esc(isEmpty(e[k])?'—':x.type==='date'?fmtIso(e[k]):e[k])}<br><small class="muted">From ${x.src} · read-only</small>`)).join('')+row('Languages spoken',esc(e.languages.join(', ')))+row('Segments',esc(SEGS.filter(s=>segHas(s.id,e.id)).map(s=>s.name).join(', ')||'None'));
  else if(tab==='reports')body=e.reports.length?e.reports.slice(0,12).map(id=>row(EMPI[id].title,esc(EMPI[id].name))).join(''):row('Direct reports','None');
  else if(tab==='docs')body=inChange&&R.phase==='committed'&&d.notifyEmp?row('New',`Change letter · ${esc(d.name)}`):row('Documents','No new documents');
  else if(tab==='apps'){const apps=[['Slack',e.email],['Google Workspace',e.email]];if(['Engineering','Product'].includes(e.department))apps.push(['GitHub','@'+e.first.toLowerCase()+e.last.toLowerCase()]);
    body=apps.map(([a,acct])=>{let s='In sync';if(inChange&&R.sync){const sy=R.sync.find(x=>x.name===a);if(sy){s=R.failIds&&R.failIds.includes(e.id)&&a==='Google Workspace'&&sy.state==='act'?'Needs action: account suspended. Raj Patel (IT) notified.':sy.state==='done'?'In sync · updated by '+d.id:sy.state==='retry'?'Update pending · retrying automatically':'Update in progress'}}else if(inChange&&R&&R.phase!=='committed')s=`Update scheduled for ${fmtD(d.date)}`;
      return row(a,`${esc(acct)}<br><small class="muted">${esc(s)}</small>`)}).join('')}
  else body=row('Hidden','Not shown in this prototype');
  return`<div class="modal prof"><div class="card"><nav class="side">${tabs.map(([k,l])=>navBtn(l,k===tab,`data-act="ptab" data-k="${k}"`)).join('')}</nav><section class="main"><header class="bar"><h2>${esc(tabs.find(t=>t[0]===tab)[1])}</h2><div class="bar-act"><button data-act="closeov">Close X</button></div></header>
    <div class="content"><div class="sec-h">${person(e,e.title)}<span class="muted">${esc(e.id)} · single-employee profile</span></div><div class="rows">${body}</div></div></section></div></div>`}
function modal(){const o=S.ov;const d=S.d;const wrap=(t,b,f)=>`<div class="modal"><header class="bar"><h2>${esc(t)}</h2><div class="bar-act"><button data-act="closeov">Close X</button></div></header><div class="modal-b">${b}</div><div class="modal-f">${f}</div></div>`;
  if(o.type==='discard'){const A=analyze(d);return wrap('Discard this draft?',`<p>"${esc(d.name||'Untitled')}" and its ${pl(A.changes,'change')} will be deleted. Nothing has been sent or saved to anyone's record.</p>`,`<button class="btn2" data-act="closeov">Keep the draft</button><button class="btn danger" data-act="discardyes">Discard draft</button>`)}
  if(o.type==='text')return wrap(o.title,`<p class="sub">${esc(o.sub)}</p><textarea class="ta" id="ov-ta" readonly style="min-height:260px">${esc(o.text)}</textarea>`,`<button class="btn2" data-act="closeov">Done</button><button class="btn" data-act="copy">Copy CSV</button>`);
  if(o.type==='refresh'){const s=segById(S.segId);return wrap('Refresh snapshot',`<p>Re-running the conditions of <b>${esc(s.name)}</b> today gives ${pl(o.next.length,'person','people')}.</p>
    <div class="rows">${row(`Joined · ${o.add.length}`,esc(o.add.length?names(o.add):'No one'))}${row(`Left · ${o.rem.length}`,esc(o.rem.length?names(o.rem):'No one'))}</div><p class="sub">Saving creates version ${s.version+1}, snapshotted ${NOWL}. Bulk changes already submitted keep the people they froze.</p>`,
    `<button class="btn2" data-act="closeov">Keep version ${s.version}</button><button class="btn" data-act="refreshyes">Save new snapshot</button>`)}
  if(o.type==='segdel'){const s=segById(S.segId);const u=usedIn(s);return wrap('Delete segment?',u.length?`<p><b>${esc(s.name)}</b> is used in ${esc(u.join(', '))}. Remove it from ${u.length===1?'that bulk change':'those bulk changes'} first, so nobody's targeting silently changes.</p>`:`<p><b>${esc(s.name)}</b> will be deleted. It isn't used in any bulk change.</p>`,
    u.length?`<button class="btn" data-act="closeov">OK</button>`:`<button class="btn2" data-act="closeov">Cancel</button><button class="btn danger" data-act="segdelyes">Delete segment</button>`)}
  if(o.type==='usebulk'){const s=segById(S.segId);const ds=[S.d,...S.parked].filter(x=>x&&!x.run);const cond={f:'empid',op:'inseg',v:[s.id]};
    const target=ds.find(x=>x.id===o.draft);let preview='';if(target){const g=o.mode==='replace'?[{mode:'all',conds:[cond]}]:[...target.who.groups.filter(x=>x.conds.length),{mode:'all',conds:[cond]}];const before=cohort(target).list.length;const after=cohort({...target,who:{...target.who,groups:g}}).list.length;preview=`Targeting goes from ${pl(before,'person','people')} to ${pl(after,'person','people')}.`}
    return wrap(`Bulk change with "${s.name}"`,`<div class="sec"><b class="req">Which bulk change</b>${ds.map(x=>`<label class="opt"><input type="radio" name="ubd" data-act="ubd" value="${x.id}" ${o.draft===x.id?'checked':''}><span><b>${esc(x.name||'Untitled change')}</b><small class="muted">${x.id} · draft · ${pl(cohort(x).list.length,'person','people')} targeted now</small></span></label>`).join('')}
      <label class="opt"><input type="radio" name="ubd" data-act="ubd" value="new" ${o.draft==='new'?'checked':''}><span><b>New bulk change</b><small class="muted">Starts a draft that targets this segment</small></span></label></div>
      ${o.draft!=='new'?`<div class="sec"><b class="req">How to add it</b><label class="opt"><input type="radio" name="ubm" data-act="ubm" value="append" ${o.mode==='append'?'checked':''}><span><b>Add as a new condition group</b><small class="muted">People in this segment join the people already targeted (OR).</small></span></label>
      <label class="opt"><input type="radio" name="ubm" data-act="ubm" value="replace" ${o.mode==='replace'?'checked':''}><span><b>Replace the current targeting</b><small class="muted">This segment becomes the only targeting. Existing conditions are removed.</small></span></label></div>`:''}
      ${preview?`<div class="readback">${esc(preview)}</div>`:''}`,`<button class="btn2" data-act="closeov">Cancel</button><button class="btn" data-act="ubgo">${o.draft==='new'?'Start bulk change':'Add to bulk change'}</button>`)}
  if(o.type==='upload'){const p=o.preview;return wrap('Upload CSV',`<p class="sub">Upload the template your managers filled in, or paste it. Columns can be in any order. Amounts like $92,500, 92500, 92.5k or 1,20,000 are all read correctly.</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center"><input type="file" id="up-file" accept=".csv,text/csv"><button class="txt" data-act="upsample">Use a sample file from managers</button></div>
    <textarea class="ta" id="up-ta" data-in="uptext" placeholder="Employee ID,Compensation (new),Level (new)">${esc(o.text||'')}</textarea>
    ${p?`<div class="cutoff" style="background:var(--nav);border-color:var(--rule)"><b>${fmtN(p.matched)} rows matched · ${fmtN(p.cells)} values to write</b><span>${p.unknown.length?`${pl(p.unknown.length,'ID')} not in this change: ${esc(p.unknown.slice(0,4).join(', '))}${p.unknown.length>4?'…':''}. `:''}${p.norm?`${pl(p.norm,'amount')} normalised (e.g. "1,20,000" → 120000). `:''}${p.conv?`${pl(p.conv,'amount')} converted to the person's currency. `:''}${p.ignored.length?`Ignored columns: ${esc(p.ignored.join(', '))}.`:''}${p.bad?` ${pl(p.bad,'value')} couldn't be read and were skipped.`:''}</span></div>`:''}`,
    `<button class="btn2" data-act="uppreview">Preview</button><button class="btn" data-act="upapply" ${p&&p.cells?'':'disabled'}>Write ${p?fmtN(p.cells):''} values into the grid</button>`)}
  return''}

/* ================= CSV (values grid) ================= */
function csvLine(a){return a.map(x=>{const s=String(x??'');return/[",\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s}).join(',')}
function parseCSV(t){const rows=[];let row=[],f='',q=false;for(let i=0;i<t.length;i++){const c=t[i];if(q){if(c==='"'){if(t[i+1]==='"'){f+='"';i++}else q=false}else f+=c}
  else if(c==='"')q=true;else if(c===','){row.push(f);f=''}else if(c==='\n'||c==='\r'){if(c==='\r'&&t[i+1]==='\n')i++;row.push(f);f='';if(row.some(x=>x.trim()))rows.push(row);row=[]}else f+=c}
  row.push(f);if(row.some(x=>x.trim()))rows.push(row);return rows}
const normH=s=>String(s).toLowerCase().replace(/\(new\)|new|\(current\)/g,'').replace(/[^a-z0-9]/g,'');
const ALIAS={salary:'compensation',comp:'compensation',compensation:'compensation',basepay:'compensation',pay:'compensation',per:'per',paytype:'per',bonus:'bonus',targetbonus:'bonus',targetannualbonus:'bonus',shares:'equity',equity:'equity',equitynumberofshares:'equity',equitygrantshares:'equity',jobtitle:'title',location:'location',worklocation:'location',office:'location',laptop:'laptop',laptopmodel:'laptop',devicerefreshdate:'refresh',refreshdate:'refresh',timeoffpolicy:'timeOff',ptopolicy:'timeOff',onetimebonus:'spotBonus',spotbonus:'spotBonus',bonusamount:'spotBonus',benefitsclass:'benefits',oncallrotation:'oncall'};
function previewCSV(d,text){const rows=parseCSV(text||'');if(rows.length<2)return{matched:0,cells:0,unknown:[],norm:0,ignored:[],bad:0,conv:0,writes:[]};
  const H=rows[0];let keyCol=-1,keyKind='',curCol=-1;const cols=[];const ignored=[];
  H.forEach((h,i)=>{const n=normH(h);if(/current/i.test(h))return;if(['employeeid','id','empid'].includes(n)){keyCol=i;keyKind='id';return}if(['workemail','email'].includes(n)&&keyCol<0){keyCol=i;keyKind='email';return}if(n==='name')return;if(n==='currency'){curCol=i;return}
    const f=Object.keys(FIELDS).find(k=>normH(FIELDS[k].label)===n)||ALIAS[n];if(f&&d.fields.includes(f))cols.push([i,f]);else ignored.push(h.trim()+(f?' (not in this change)':''))});
  const inChange=new Set(analyze(d).rows.map(e=>e.id));const unknown=[];let matched=0,nrm=0,bad=0,nconv=0;const writes=[];
  rows.slice(1).forEach(r=>{const k=(r[keyCol]||'').trim();const id=keyKind==='email'?parsePerson(k):(EMPI[k.toUpperCase()]?k.toUpperCase():null);if(!id||!inChange.has(id)){if(k)unknown.push(k);return}matched++;const e=EMPI[id];const rc=curCol>=0?(r[curCol]||'').trim().toUpperCase():'';
    cols.forEach(([i,f])=>{const raw=(r[i]||'').trim();if(!raw)return;let v=raw;const F=FIELDS[f];
      if(F.type==='money'||F.type==='int'){v=parseMoney(raw);if(!isFinite(v)){bad++;return}if(String(v)!==raw)nrm++;
        if(MONEY.has(f)&&rc){if(!FX[rc]){bad++;return}if(rc!==curCode(e)){v=conv(v,rc,curCode(e));nconv++}}
        v=f==='compensation'?roundComp(v,nv(d,e,'per')):MONEY.has(f)?Math.round(v/10)*10:Math.round(v)}
      else if(F.type==='select'){const o=F.opts().find(x=>x.toLowerCase()===raw.toLowerCase());if(!o){bad++;return}v=o}
      else if(F.type==='team'){const o=ALLTEAMS.find(x=>x.toLowerCase()===raw.toLowerCase());if(!o){bad++;return}v=o}
      else if(F.type==='date'){v=parseDateStr(raw);if(!v){bad++;return}if(v!==raw)nrm++}
      else if(F.type==='person'){v=parsePerson(raw);if(!v){bad++;return}}
      if(String(v)!==String(e[f]))writes.push([id,f,v])})});
  return{matched,cells:writes.length,unknown,norm:nrm,ignored,bad,conv:nconv,writes}}
function sampleCSV(d){const r=rng(99);const A=analyze(d);const rows=A.rows.filter(e=>e.rating!=='Below').filter(()=>r()<.16).slice(0,400);const fs=d.fields.filter(f=>['compensation','level','title','bonus'].includes(f));
  const lines=[csvLine(['Employee ID','Name',...fs.map(f=>FIELDS[f].label+' (new)'),'Manager notes'])];let k=0;
  rows.forEach(e=>{const vals=fs.map(f=>{if(f==='compensation'){const v=roundComp(e.compensation*(1.03+r()*.07),e.per);k++;if(e.per==='Hourly')return'$'+v.toFixed(2);const m=k%4;return m===0?'$'+fmtN(v):m===1?String(v):m===2?(v/1000).toFixed(1)+'k':v.toString().replace(/(\d)(?=(\d\d)+\d{3}$)/g,'$1,').replace(/(\d)(\d{3})$/,'$1,$2')}
    if(f==='level')return r()<.2?'L'+Math.min(8,lvlN(e.level)+1):e.level;return''});lines.push(csvLine([e.id,e.name,...vals,r()<.1?'Strong year, promote next cycle':'']))});
  lines.push(csvLine(['E9991','Former employee',...fs.map(()=>'')]),csvLine(['E9992','Typo row',...fs.map(()=>'')]));return lines.join('\n')}

/* ================= notes ("Why this?") ================= */
const NOTES={
  shell:[['Two-tier navigation inside a bulk change','Progressive disclosure; focus','Modules collapse to icons so the steps get the room; hovering brings the modules back without leaving the draft.'],['Toasts top-right, coloured by outcome, with a timer bar','Visibility of system status; von Restorff','Errors stand out in red where the eye scans first, and the bar shows how long the message stays.'],['Global nav with Bulk change first',"Jakob's law","Admins already live in enterprise HRIS conventions: modules on the left, the task they came for at the top."],['Breadcrumbs on every page','Wayfinding','A deep editor never strands the admin; one click back to the list.'],['Demo controls kept apart in a dashed panel','Mental-model match',"Nothing that isn't product sits in the product chrome."]],
  bulk:[['List of bulk changes, drafts first','Zeigarnik effect','Comp cycles run over days; an open draft stays visible until the cutoff.'],['Segments column on each change','Recognition over recall','Who a change targets is visible without opening it.'],["A colleague's overlapping draft is listed",'Error prevention (Norman: mistakes)','Two admins editing the same people gets caught before payroll, not after.']],
  setup:[['More than payroll: time off, devices, benefits drafts in the list','Mental-model match','Bulk change is one tool for every system that reads the employee record.'],['Effective date required, nothing pre-filled','Forcing function','Pre-filling Today would make a prorated mid-period change the default.'],['"Start of next pay period" chip first','Serial position (primacy)','Steers to the clean option without choosing for them.'],['Payroll run and cutoff shown next to the date','Norman: mapping and feedback','Links the date to its money consequence at the moment of choosing.'],['Name and reason required','Mental model of an auditable object','“Who gave Sales a raise?” has an answer six months later.'],['Enterprise step names (Details, Segments, Fields…)',"Jakob's law",'They match the vocabulary of every admin tool the user already knows.'],['Required fields marked with *','Error prevention','The admin knows what is mandatory before submitting, not after an error.']],
  who:[['Summary card with the count; breakdown in a side panel','Progressive disclosure; cognitive load','The builder stays in view; detail is one click away and scrolls on its own.'],['Group quantifiers: all, any, at least / at most / exactly N','Mental-model match','Eligibility policies are often "meets at least 2 of these 3"; all and any stay first because they are the common case.'],['Searchable, tiered dropdowns with Select all / Clear all',"Hick's law; recognition over recall",'Long value lists are searched, grouped (teams by department) and bulk-selected instead of scrolled.'],['"+ Create new segment" pinned to the bottom of the segment picker','Task continuity','The missing segment is created without losing the draft, then selected in place.'],['Targeting is one condition builder','Mental-model match','Segments, named people and attributes are all just conditions, so there is one thing to learn.'],["Employee ID belongs to / doesn't belong to segment",'Recognition over recall; reuse','A vetted segment is referenced, not rebuilt from memory.'],['Insert saved segment shows type and size','Recognition over recall','The admin picks by name and sees how big it is before adding it.'],['Create segment in a side sheet','Context preservation','The draft stays open behind it, so nothing has to be held in working memory.'],['Paste employee IDs, emails or names',"Postel's law",'Lists arrive from spreadsheets in any shape; be liberal in what you accept.'],['Operators match the data type','Error prevention','Only comparisons that make sense for a field are offered.'],['Live count with delta','Doherty threshold; feedback','They test one condition at a time against the number they already hold.'],['Sample with "why included"','Trust calibration','Explains a surprising inclusion, e.g. "In FY26 promotion nominees".'],['On leave, terminations, contractors shown','Norman: mistakes',"Hidden system rules create errors the admin can't see."]],
  what:[['Field descriptions and "last used" on every row','Recognition over recall; information scent','Two similar names are told apart by what the field does and whether colleagues use it.'],['Green pulsing dot for use in the last 30 days, blue for 6 months, grey for older','Pre-attentive processing; von Restorff','Colour and motion are seen before reading, so the field the team actually uses stands out among look-alikes. Only the most recent tier moves, so motion stays meaningful.'],['One job on this screen: pick fields','Progressive disclosure; cognitive load','How values are set (one value, a rule, each person) is decided on Values, where the admin can see the rows.'],['Search across 1,000+ fields, with categories collapsed by default',"Hick's law; recognition over recall",'Admins search by name; the tree is for browsing when they don\'t know the name.'],['Selected list on the right','Visibility of system status; working-memory relief','What will change is always in view, however deep the browsing goes.'],['Group checkboxes and Selected only','Efficiency of use','Pick a whole category at once, then prune.'],['AI field picker, marked ✦','Automation with oversight','It drafts the selection; the admin removes what they don\'t need.'],['Read-only and locked fields shown, not hidden','Mental-model match; error prevention','The admin learns why a field can\'t be changed instead of thinking it is missing.'],['Department auto-adds Team','Forcing function',"A new department with an old team isn't a valid record."]],
  review:[['Every number opens the people behind it','Recognition over recall; trust','Counts are verifiable: a click shows the exact rows, sortable and filterable.'],['AI summary that cites numbered lines of the change list','Trust calibration; verifiability','The admin reads plain English but can check every claim against the deterministic record in one click.'],['Deterministic change list: per field, people, totals, transitions, value sources','Recognition over recall; error prevention','A wrong rule shows up as an odd total or transition before anyone is paid.'],['Spot check of five people across the list','Representativeness','Seeing real names before and after catches mistakes an aggregate hides.'],['Required "I\'ve reviewed" checkbox, cleared when the change list changes','Commitment and consistency; forcing function','Confirming is a deliberate act, and it always refers to the current numbers.']],
  values:[['One Change values panel, executed into the cells','Single model; feedforward','Setting one value and a rule are the same thing: an operation on the rows that match. The preview says how many cells will change before you execute.'],['Activity log with the last three actions, full history in a side panel','Visibility of system status; audit trail','The admin sees what produced the grid without a wall of history.'],['Errors and Warnings quick filters with Previous and Next','Error recovery; reduced search','The admin steps through each problem with its reason open beside it.'],['Rules for every field type, with operators that fit the type','Mental-model match; consistency','A list gets Set to and Replace, text gets Find and replace, dates get Move by days; the same Where builder as targeting.'],['Every action applies at once, with Undo and Redo','User control and freedom; reversibility','Admins experiment freely because any step can be taken back; the latest action wins, like a spreadsheet.'],['Group by any field, filter rows with the targeting builder','Consistency; flexibility','No attribute is special. Grouping and filtering use the same controls as everywhere else.'],['How values are set is chosen per field, in its column header','Progressive disclosure; proximity','Each person is the default; one value for everyone and rules are one click away, next to the data they affect.'],['Approval column and summary: which rows need approval and why','Feedforward; visibility of system status','The admin sees before submitting which rows clear on their own and which wait for Finance or People.'],['"!" on a flagged cell opens the reason, the rule and its owner','Recognition over recall; error recovery','Every error says what broke, who set the rule, and the fixes that work for this row.'],['Amounts entered in USD or CAD, converted per person','Mental-model match','Finance thinks in one budget currency; each employee is still paid in their own.'],["Cells use the profile's own controls","Jakob's law","Nothing new to learn: the profile's Edit mode, multiplied across rows."],["Empty New cell, today's value as grey text",'Default effect; von Restorff',"A filled cell is an edit and an empty one isn't."],['Current and New side by side',"Gestalt proximity; anchoring on today's value",'Reviewers judge the delta against what the person earns now.'],['% change, annualised when the unit switches','Norman: slips','Order-of-magnitude typos become obvious.'],['Rules write visible values','Trust calibration',"Admins don't trust results they can't see per row."],['AI drafts stay marked until accepted','Automation bias countermeasure','It never submits; approvers can see what a person checked.']],
  review:[["Error = can't commit a valid, permitted record",'Forcing function','One predictable rule: an invalid record never reaches payroll.'],['Warning = valid but unusual, acknowledged per group','Habituation / alarm fatigue','300 per-row confirmations train blind clicking.'],['Move error rows to a new draft','Loss aversion; Zeigarnik',"Nobody drops rows they'd lose; the open draft keeps them visible."]],
  impact:[['Flowchart of affected and unaffected systems','Mental model; progressive disclosure','The blast radius is visible at a glance; the detail sits below each node.'],['Inside Rippling vs Integrated Apps',"Gestalt common region; Jakob's law","Uses the profile's own term and sets up “these behave differently”."],['Payroll card first','Serial position (primacy)','The highest stakes go first.'],['Late-approval choice pre-selected, must be confirmed','Forcing function + default effect','Payroll timing is settled at the decision point.'],['Losses written as losses','Framing; loss aversion',"Removals phrased neutrally get underweighted, and they're hardest to undo."],['Employee letters off by default','Default effect; irreversibility',"A wrong comp letter can't be unsent."]],
  status:[['Rippling record band on top','Mental-model match; common region','The record is done and payroll reads from it, whatever Slack does.'],['No "Retry now" while auto-retries run','Illusion of control','Avoids pointless clicks and false confidence.'],['End state names what worked and who owns the rest','Peak-end rule','The memory of the last run decides whether they use bulk change next year.']],
  approver:[['One reason for many rows; select all matching','Efficiency of use; error prevention','Approvers send back a group with one reason, and every row still carries it in the audit log.'],['Total against the merit budget, in $ and %','Anchoring on the right reference; framing','Finance judges against the plan, not a raw total.'],['Outliers first','Von Restorff','Limited attention goes to the exceptions.'],['Send rows back with a reason','Error recovery','Three disputes must not freeze 409 raises.']],
  segments:[['Dynamic and Static type badges','Recognition over recall','Whether a segment is computed when used or always holds the same people is visible without opening it.'],['Static badge carries its snapshot date','Mental-model match','“Same employees since this date” made literal.'],['Click any header to sort; filter menu per column',"Jakob's law",'Every table behaves like a spreadsheet the admin already knows.'],['Used in column','Consequence visibility','Before editing a segment, the admin sees which bulk changes depend on it.']],
  segedit:[['Type and source chosen up front, then locked','Forcing function','A segment that silently changed from fixed to live would retarget bulk changes.'],['Header bands: Rippling fields vs "From your file"','Gestalt common region','Uploaded data is never confused with the system of record.'],['Sheets-style sort and filter in every header',"Jakob's law",'Admins already slice lists this way in Excel and Google Sheets.'],["Filters offer operators for the column's type",'Recognition over recall; error prevention','Numbers get ≥ and between, dates get "in the past N days", Yes/No gets Yes and No.'],['Untick rows to exclude people','Direct manipulation','Hand-picked exceptions are explicit and visible.'],['Detected column types you can override',"Postel's law; Tesler's law",'The system does the detective work; the admin only corrects it.'],['"What gets saved" in the rail','Feedback and feedforward','The admin knows exactly what a save will store before committing.'],['Sticky header with Save and Cancel','Visibility of system status','The commit action never scrolls out of reach on a long page.'],['Sheets filter conditions plus a custom formula','Jakob\'s law; flexibility for experts','Admins get the conditions they know from Google Sheets; power users get formulas, drafted by AI from plain English.'],['Paged tables with a rows-per-page setting','Cognitive load',"A page of 25 is scannable; 5,000 rows on one screen isn't."]],
  segment:[['Bulk change as the primary action, then a choice of draft and Add vs Replace',"Fitts's law; error prevention",'The common next step is the biggest target, and the admin decides explicitly whether existing targeting is kept.'],['Refresh snapshot shows joined and left first','Feedback; error prevention','Nobody updates a fixed list without seeing who moves.'],['Delete blocked while a bulk change uses it','Forcing function','Deleting would silently retarget a draft.']],
  people:[['Directory opens the single-employee profile',"Jakob's law",'Same profile the case study starts from.']]};
function notesKey(){if(S.se&&S.se.inSheet)return'segedit';if(S.route==='draft')return S.approver?'approver':S.step;return S.route}
function renderNotes(){const el=$('#notes');el.classList.toggle('on',S.notes);if(!S.notes){el.innerHTML='';return}const rows=[...(NOTES[notesKey()]||[]),...NOTES.shell];
  el.innerHTML=`<div class="sec-h"><h3>Why each element is here</h3><button class="txt" data-act="notes">Close</button></div><p class="sub">Element · principle · why it holds for an HR admin.</p>${rows.map(r=>`<div class="nrow"><b>${esc(r[0])}</b><span>${esc(r[1])}</span><small class="muted">${esc(r[2])}</small></div>`).join('')}`}

/* ================= actions ================= */
function setSize(n){S.size=n;build(n);makeSeeds();clearInterval(S.timer);S.d=demoDraft();dirty();if(S.step==='status')S.step='impact';
  S.parked=extraDrafts();S.approver=false;S.followups=0;S.ov=null;S.se=null;S.hm=null;S.drawer=null;S.rt=null;if(S.route==='segment'||S.route==='segedit')S.route='segments';
  toast(`Acme Corp now has ${fmtN(EMP.length)} employees. Same flow, same screens.`);render()}
function next(){const d=S.d;const i=STEPS.findIndex(s=>s.k===S.step);const k=STEPS[i+1].k;if(k==='status')return;d.visited.add(k);S.step=k;S.menu=false;S.pop=null;render();window.scrollTo(0,0)}
function back(){const i=STEPS.findIndex(s=>s.k===S.step);if(i>0){S.step=STEPS[i-1].k;render();window.scrollTo(0,0)}}
function snapD(d){return structuredClone({manual:d.manual,mseq:d.mseq,msrc:d.msrc,csv:d.csv,cseq:d.cseq,csvHits:d.csvHits,rules:d.rules,same:d.same,sameCur:d.sameCur,modes:d.modes,exceptions:d.exceptions,moved:d.moved,seq:d.seq,actN:d.actN})}
function rec(label,kind){const d=S.d;if(!d)return null;d.hist=d.hist||{u:[],r:[]};d.hist.u.push({label,snap:snapD(d)});if(d.hist.u.length>60)d.hist.u.shift();d.hist.r=[];return logAct(d,label,{kind})}
function undoRedo(w){const d=S.d;if(!d||!d.hist)return;const from=w==='u'?d.hist.u:d.hist.r,to=w==='u'?d.hist.r:d.hist.u;const h=from.pop();if(!h)return;to.push({label:h.label,snap:snapD(d)});Object.assign(d,h.snap);S.followups=d.moved.size;
  logAct(d,`${w==='u'?'Undid':'Redid'}: ${h.label}`,{kind:'undo'});dirty();render();toast(`${w==='u'?'Undid':'Redid'}: ${h.label}`,'info')}
function setD(d,id,f,v,sl){d.manual[id]=d.manual[id]||{};d.manual[id][f]=v;d.mseq=d.mseq||{};d.mseq[id+'|'+f]=++d.seq;d.msrc=d.msrc||{};if(sl)d.msrc[id+'|'+f]=sl;else delete d.msrc[id+'|'+f];d.csvHits.delete(id+'|'+f);
  if(f==='department'&&d.fields.includes('team')){const t=nv(d,EMPI[id],'team');if(!TEAMS[v]?.includes(t)&&v){d.manual[id].team=TEAMS[v][0];d.mseq[id+'|team']=++d.seq}}}
function setCell(id,f,v,sl){setD(S.d,id,f,v,sl)}
const nowIST=()=>new Date().toLocaleTimeString('en-GB',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit'})+' IST';
function logAct(d,label,o={}){d.log=d.log||[];const e={n:d.log.length+1,at:o.at||nowIST(),label,cells:o.cells,by:o.by||'Sam Rivera',kind:o.kind||'edit'};d.log.push(e);return e}
/* a change = a rule executed once into the cells */
function changeTargets(d,r,limit){const w=ruleWhere(r);let rows=analyze(d).rows;if(limit)rows=rows.filter(e=>limit.has(e.id));return w.length?rows.filter(e=>evalGroups(w,e)>=0):rows}
function previewChange(d,r,limit){const rows=changeTargets(d,r,limit);const writes=[];const rr={...r,seq:Infinity};
  rows.forEach(e=>{const v=ruleVal(d,e,r.field,rr);if(v===undefined||v===null||v==='')return;if(String(v)===String(nv(d,e,r.field)))return;writes.push([e.id,v])});return{rows:rows.length,writes}}
function execChange(d,r,limit,label){const p=previewChange(d,r,limit);p.writes.forEach(([id,v])=>setD(d,id,r.field,v,label));dirty();return p}
function refreshGrid(){dirty();G.items=gridItems(S.d);renderGridRows();const sm=$('#summary');if(sm)sm.outerHTML=summary(S.d)}
function afterRender(){document.querySelectorAll('input[data-mixed]').forEach(i=>i.indeterminate=true);const w=$('#gwrap');if(w&&S.d){w.scrollTop=S.d.grid.scroll||0;renderGridRows();w.addEventListener('scroll',()=>{S.d.grid.scroll=w.scrollTop;if(!G.raf)G.raf=requestAnimationFrame(()=>{G.raf=0;renderGridRows()})},{passive:true})}
  if(S.focus){const el=document.getElementById(S.focus);if(el){el.focus();if(el.setSelectionRange&&el.type!=='date'&&el.type!=='number')try{el.setSelectionRange(el.value.length,el.value.length)}catch(_){}}S.focus=null}}
function applyFix(k,fx,only){const d=S.d;const A=analyze(d);const ids=only||A.issues[k]||[];rec(`Fix: ${(ISS[k]||{}).label||k} (${pl(ids.length,'row')})`);
  ids.forEach(id=>{const e=EMPI[id];if(fx==='capmax'){const b=band(e,nv(d,e,'level'),nv(d,e,'per'),nv(d,e,'department'),nv(d,e,'location'));setCell(id,'compensation',b.max)}
    else if(fx==='clearcomp')setCell(id,'compensation','');else if(fx==='fixteam')setCell(id,'team',TEAMS[nv(d,e,'department')][0]);else if(fx==='clearmgr')setCell(id,'manager','');
    else if(fx==='laddertitle')setCell(id,'title',ladder(nv(d,e,'department'),nv(d,e,'level')));else if(fx==='move')d.moved.add(id);else if(fx==='exception')d.exceptions.add(id);else if(fx==='ptokeep')setCell(id,'timeOff','')});
  if(fx==='move')S.followups=d.moved.size;toast(fx==='move'?`Moved ${pl(ids.length,'row')} to a follow-up draft.`:fx==='exception'?`Exception requested for ${pl(ids.length,'row')}. Finance now approves ${ids.length===1?'it':'them'}.`:`Fixed ${pl(ids.length,'row')}.`);render()}
function closeSheet(){S.se=null;render()}
function openEditorFor(s,dup){const e=newEditor({segId:dup?null:s.id,name:dup?'Copy of '+s.name:s.name,desc:s.desc,type:s.type,source:s.source,groups:s.groups?clone(s.groups):undefined,excluded:dup?[]:(s.provenance?.excluded||[])});
  if(s.source==='csv')e.file={name:s.file.name,raw:null,header:['Employee ID',...s.columns.map(c=>c.label)],keyCol:0,types:{},cols:clone(s.columns),values:clone(s.values||{}),matched:s.members.slice(),unmatched:s.file.unmatched.slice(),rowsN:s.file.rows,showUnmatched:false};
  return e}
const tsNew=size=>({tf:{},sort:null,q:'',hidden:new Set(),excluded:new Set(),page:1,size:size||25});
const TS={};
function saveSegment(){const se=S.se;if(!se.name.trim()){toast('Name the segment first.');S.focus='se-name';render();return}
  const allCols=edColsAll(se);const base=edBase(se);const rows=tableRows(se,base,allCols);
  const seg=se.segId?segById(se.segId):{id:'SEG-'+(SEGN++),owner:'You',created:'20 Nov 2026',usedSeed:[],version:1};
  if(se.type==='dynamic'){if(!se.groups.some(g=>g.conds.some(complete))){toast('Add at least one complete condition.');return}const bad=se.groups.find(g=>['atleast','atmost','exactly'].includes(g.mode)&&(g.n||1)>g.conds.filter(complete).length);if(bad){toast('Give the "at least / at most / exactly" number a value no bigger than the number of conditions.');return}Object.assign(seg,{type:'dynamic',source:'conditions',groups:clone(se.groups),members:null,columns:null})}
  else{const keep=rows.filter(e=>!se.excluded.has(e.id));if(!keep.length){toast('No one would be in this segment. Loosen the filters or conditions.');return}
    Object.assign(seg,{type:'static',source:se.source,members:keep.map(e=>e.id),snapshotAt:NOWL,provenance:{filters:filtersTxt(se,allCols),excluded:[...se.excluded].filter(id=>base.some(e=>e.id===id)),search:se.q}});
    if(se.source==='conditions'){seg.groups=clone(se.groups);seg.columns=null}else{seg.groups=null;seg.columns=clone(se.file.cols);seg.values=Object.fromEntries(keep.map(e=>[e.id,se.file.values[e.id]]));seg.file={name:se.file.name,rows:se.file.rowsN,matched:se.file.matched.length,unmatched:se.file.unmatched.slice()}}}
  seg.name=se.name.trim();seg.desc=se.desc.trim();seg.updated='20 Nov 2026';if(!se.segId)SEGS.unshift(seg);dirty();
  if(se.inSheet&&S.d){const tc=se.target&&condAt('d',se.target.g,se.target.c);if(tc&&tc.f==='empid'&&(tc.op==='inseg'||tc.op==='notinseg')){tc.v=[seg.id];S.se=null;toast(`Saved "${seg.name}" and selected it in your condition.`)}
    else{addTargetCond(S.d,{f:'empid',op:'inseg',v:[seg.id]});S.se=null;toast(`Saved "${seg.name}" and added it to this bulk change's targeting.`)}render();return}
  S.se=null;S.route='segment';S.segId=seg.id;S.segTab='members';S.sv=tsNew(25);toast(`Saved "${seg.name}".`);render();window.scrollTo(0,0)}
function tsOf(t){return t==='seed'?S.se:t==='segv'?S.sv:(TS[t]=TS[t]||tsNew(t==='people'?25:10))}
function openHM(a){const t=a.dataset.t,k=a.dataset.k;const r=a.getBoundingClientRect();const ts=tsOf(t);const m=MT[t];const col=m.allCols.find(c=>c.key===k);
  const f=ts.tf[k]||{};S.hm={t,k,x:r.left-8,y:r.bottom+6};S.hmd={op:f.cond?f.cond.op:'',v:f.cond?f.cond.v.slice():[],vals:f.vals?f.vals.slice():null,vq:'',ai:''};
  const cnt={};m.base.forEach(e=>{const v=dispVal(col,col.get(e));cnt[v]=(cnt[v]||0)+1});S.hmAll=Object.entries(cnt).sort((a2,b)=>a2[0].localeCompare(b[0]));renderHM()}
function act(k,a){const d=S.d;switch(k){
  case'nav':S.drawer=null;S.route=['bulk','segments','people','settings'].includes(a.dataset.k)?a.dataset.k:'module';S.modName=a.dataset.k;S.approver=false;S.hm=null;if(S.se&&!S.se.inSheet)S.se=null;try{history.replaceState(null,'','#'+a.dataset.k)}catch(_){}render();window.scrollTo(0,0);break;
  case'size':setSize(+a.dataset.n);break;
  case'notes':S.notes=!S.notes;try{localStorage.setItem('bc-notes',S.notes?'1':'0')}catch(_){}render();break;
  case'demo':S.demo=!S.demo;renderDemo();break;
  case'soon':toast('Not part of this prototype.');break;
  case'q4':toast("This is Dana Okuneva's draft. Its people show a conflict warning in yours if both touch reporting lines.");break;
  case'gsp':S.gq='';$('#gq').value='';renderSearch();S.ov={type:'profile',id:a.dataset.id,tab:'emp'};renderOverlay();break;
  case'gss':S.gq='';$('#gq').value='';renderSearch();S.route='segment';S.segId=a.dataset.id;S.segTab='members';S.sv=tsNew(25);render();break;
  case'gsd':S.gq='';$('#gq').value='';renderSearch();act('resume',a);break;
  case'newdraft':if(d){S.parked=S.parked.filter(x=>x!==d);S.parked.unshift(d)}clearInterval(S.timer);S.d=blankDraft();S.step='setup';S.route='draft';S.approver=false;S.followups=0;render();break;
  case'resume':{const id=a.dataset.id;if(id&&(!S.d||id!==S.d.id)){const x=S.parked.find(p=>p.id===id);if(x){S.parked=S.parked.filter(p=>p!==x);if(S.d)S.parked.unshift(S.d);S.d=x;clearInterval(S.timer);if(x.run&&x.run.sync)S.timer=setInterval(()=>tick(x),700)}}
    if(!S.d)break;S.route='draft';S.step=S.d.run?'status':lastStep(S.d);render();window.scrollTo(0,0);break}
  case'profile':S.ov={type:'profile',id:a.dataset.id,tab:'emp'};renderOverlay();break;
  case'ptab':S.ov.tab=a.dataset.k;renderOverlay();break;
  case'closeov':S.ov=null;renderOverlay();break;
  case'step':if(a.dataset.k==='status'&&!d.run)break;S.approver=false;S.drawer=null;S.step=a.dataset.k;S.pop=null;render();window.scrollTo(0,0);break;
  case'next':next();break;case'back':back();break;
  case'saveexit':S.route='bulk';S.menu=false;toast('Draft saved. Resume it from Bulk change.');render();break;
  case'menu':S.menu=!PREV.menu;render();break;
  case'discard':S.menu=false;S.ov={type:'discard'};render();break;
  case'discardyes':S.d=S.parked.shift()||null;S.ov=null;S.route='bulk';clearInterval(S.timer);toast('Draft discarded.');render();break;
  case'datechip':d.dateKind=a.dataset.k;d.date=a.dataset.k==='next'?NEXTP:a.dataset.k==='today'?TODAY:d.date;if(a.dataset.k==='custom')S.focus='f-date';render();break;
  case'tpl':{const t=TPL[a.dataset.k];d.template=a.dataset.k;d.fields=t.f.slice();d.modes={};d.fields.forEach(f=>d.modes[f]=t.m[f]||'diff');render();break}
  case'baddcond':{const G2=groupsOf(a.dataset.ctx);const gi=+a.dataset.g;G2[gi].conds.push({f:'department',op:'anyof',v:[]});S.pop=`${a.dataset.ctx}-${gi}-${G2[gi].conds.length-1}`;S.popQ='';render();break}
  case'baddgroup':groupsOf(a.dataset.ctx).push({mode:'all',conds:[{f:'department',op:'anyof',v:[]}]});render();break;
  case'bdelcond':groupsOf(a.dataset.ctx)[+a.dataset.g].conds.splice(+a.dataset.c,1);S.pop=null;render();break;
  case'bdelgroup':groupsOf(a.dataset.ctx).splice(+a.dataset.g,1);S.pop=null;render();break;
  case'openpop':S.pop=PREV.pop===a.dataset.key?null:a.dataset.key;S.popQ='';render();break;
  case'bpopv':{const c=groupsOf(a.dataset.ctx)[+a.dataset.g].conds[+a.dataset.c];const v=a.dataset.v;c.v=a.checked?[...c.v,v]:c.v.filter(x=>x!==v);S.pop=`${a.dataset.ctx}-${a.dataset.g}-${a.dataset.c}`;render();break}
  case'bpaste':{const c=groupsOf(a.dataset.ctx)[+a.dataset.g].conds[+a.dataset.c];const txt=($('#pop-ta')||{}).value||'';const toks=txt.split(/[\n,;\t]+/).map(x=>x.trim()).filter(Boolean);const miss=[];
    toks.forEach(t=>{const id=parsePerson(t);if(id){if(!c.v.includes(id))c.v.push(id)}else miss.push(t)});S.pop=`${a.dataset.ctx}-${a.dataset.g}-${a.dataset.c}`;toast(`${pl(toks.length-miss.length,'person','people')} added${miss.length?`; not found: ${miss.slice(0,3).join(', ')}`:''}.`);render();break}
  case'bunpick':{const c=groupsOf(a.dataset.ctx)[+a.dataset.g].conds[+a.dataset.c];c.v=c.v.filter(x=>x!==a.dataset.id);S.pop=`${a.dataset.ctx}-${a.dataset.g}-${a.dataset.c}`;render();break}
  case'insmenu':S.insOpen=!PREV.insOpen;render();break;
  case'insseg':{S.insOpen=false;addTargetCond(d,{f:'empid',op:'inseg',v:[a.dataset.id]});toast(`Added "${segName(a.dataset.id)}"${d.who.groups.length>1?' as an OR group: its people join the targeting':''}.`);render();break}
  case'createseg':S.dd=null;S.se=newEditor({type:'dynamic',inSheet:true});S.focus='se-name';render();break;
  case'ddcreateseg':{const p=S.dd.key.split(':');S.dd=null;S.se=newEditor({type:'dynamic',inSheet:true,target:{g:p[2],c:p[3]}});S.focus='se-name';render();break}
  case'ddopen':{const key=a.dataset.dd;if(PREV.dd&&PREV.dd.key===key){S.dd=null;renderDD();break}const r=a.getBoundingClientRect();S.dd={key,x:r.left,y:r.bottom+4,top:r.top,w:r.width,q:'',focus:true};renderDD();break}
  case'ddpick':{const v=a.dataset.v;const key=S.dd.key;const sp=ddSpec(key);S.dd=null;if(sp){sp.apply(v);if(sp.after==='hm'){renderHM();renderDD()}else render()}break}
  case'ddtog':{const sp=ddSpec(S.dd.key);const cur=(sp.value||[]).slice();const v=a.dataset.v;ddApply(a.checked?[...cur,v]:cur.filter(x=>x!==v));break}
  case'ddgrp':{const sp=ddSpec(S.dd.key);const g=sp.groups.find(x=>x.label===a.dataset.g);const vs=g.items.map(i=>i.v);const cur=new Set(sp.value||[]);a.checked?vs.forEach(v=>cur.add(v)):vs.forEach(v=>cur.delete(v));ddApply([...cur]);break}
  case'ddall':{const sp=ddSpec(S.dd.key);const q=(S.dd.q||'').toLowerCase();const cur=new Set(sp.value||[]);sp.groups.forEach(g=>g.items.forEach(it=>{if(!q||(it.label+' '+(it.sub||'')+' '+it.v+' '+(it.q||'')).toLowerCase().includes(q))cur.add(it.v)}));ddApply([...cur]);break}
  case'ddnone':{const sp=ddSpec(S.dd.key);const q=(S.dd.q||'').toLowerCase();if(!q){ddApply([]);break}const drop=new Set();sp.groups.forEach(g=>g.items.forEach(it=>{if((it.label+' '+(it.sub||'')+' '+it.v+' '+(it.q||'')).toLowerCase().includes(q))drop.add(it.v)}));ddApply((sp.value||[]).filter(v=>!drop.has(v)));break}
  case'ddclose':S.dd=null;renderDD();break;
  case'ddpaste':{const sp=ddSpec(S.dd.key);const txt=($('#dd-paste')||{}).value||'';const toks=txt.split(/[\n,;\t]+/).map(x=>x.trim()).filter(Boolean);const miss=[];const cur=new Set(sp.value||[]);toks.forEach(t=>{const id=parsePerson(t);if(id)cur.add(id);else miss.push(t)});ddApply([...cur]);toast(`${pl(toks.length-miss.length,'person','people')} added${miss.length?`. Not found: ${miss.slice(0,3).join(', ')}`:''}.`,miss.length?'warning':'success');break}
  case'pg':{const ts=tsOf(a.dataset.t);ts.page=Math.max(1,+a.dataset.p);render();break}
  case'mexclpage':{const m=MT[a.dataset.t];const ts=m.ts;const size=ts.size||25;const pr=m.rows.slice((ts.page-1)*size,ts.page*size);pr.forEach(e=>a.checked?ts.excluded.delete(e.id):ts.excluded.add(e.id));render();break}
  case'drawer':S.drawer=a.dataset.k;renderDrawer();break;
  case'drawerclose':S.drawer=null;renderDrawer();break;
  case'haigen':{const m=MT[S.hm.t];const txt=S.hmd.ai||'';const f=aiFormula(txt,m.allCols);if(!f){toast('Couldn\'t draft a formula from that. Name a column and a value, for example: promo flag yes and increase above 5.','warning');break}S.hmd.v=[f];renderHM();toast('Formula drafted. Check it before applying.','info');break}
  case'saveastarget':S.se=newEditor({type:'dynamic',inSheet:true,groups:clone(d.who.groups),name:(d.name||'Bulk change')+' · targeting'});render();break;
  case'pasteids':d.who.pasteOpen=!d.who.pasteOpen;if(d.who.pasteOpen)S.focus='paste-ta';render();break;
  case'pastesample':{const r=rng(5);const pick=EMP.filter(()=>r()<Math.min(1,25/EMP.length)).slice(0,25);d.who.paste=pick.map((e,i)=>i%3===0?e.id:i%3===1?e.email:e.name).concat(['Hollis Nobody','E99999']).join('\n');render();break}
  case'pasteadd':{const toks=(d.who.paste||'').split(/[\n,;\t]+/).map(x=>x.trim()).filter(Boolean);const ids=[],miss=[];toks.forEach(t=>{const id=parsePerson(t);if(id){if(!ids.includes(id))ids.push(id)}else miss.push(t)});
    if(!ids.length){toast('None of those matched anyone.');break}addTargetCond(d,{f:'empid',op:'anyof',v:ids});d.who.paste='';d.who.pasteOpen=false;toast(`Added ${pl(ids.length,'person','people')}${miss.length?`. Not found: ${miss.slice(0,3).join(', ')}`:''}.`);render();break}
  case'autotg':{const m={leave:'incLeave',term:'incTerm',contract:'incContract'}[a.dataset.k];d.who[m]=!d.who[m];render();break}
  case'exportlist':{const C=cohort(d);S.ov={type:'text',title:'Export the full list',sub:`${fmtN(C.list.length)} people. Copy it into a spreadsheet to check it against your own numbers.`,text:[csvLine(['Employee ID','Name','Title','Department','Work location','Level','Work email'])].concat(C.list.map(e=>csvLine([e.id,e.name,e.title,e.department,e.location,e.level,e.email]))).join('\n')};renderOverlay();break}
  case'newmenu':S.newMenu=!PREV.newMenu;render();break;
  case'newseg':S.newMenu=false;S.se=newEditor({type:a.dataset.t,source:'conditions'});S.route='segedit';S.focus='se-name';render();window.scrollTo(0,0);break;
  case'sltype':S.slType=a.dataset.k;render();break;
  case'slsort':{const k2=a.dataset.k;S.slSort=S.slSort&&S.slSort.k===k2?{k:k2,dir:-S.slSort.dir}:{k:k2,dir:k2==='members'?-1:1};render();break}
  case'openseg':S.route='segment';S.segId=a.dataset.id;S.segTab='members';S.sv=tsNew(25);render();window.scrollTo(0,0);break;
  case'segtab':S.segTab=a.dataset.k;render();break;
  case'segmenu':S.segMenu=!PREV.segMenu;render();break;
  case'segedit':{const s=segById(S.segId);S.se=openEditorFor(s,false);S.route='segedit';render();window.scrollTo(0,0);break}
  case'segdup':{const s=segById(S.segId);S.segMenu=false;S.se=openEditorFor(s,true);S.route='segedit';render();window.scrollTo(0,0);break}
  case'segrefresh':{const s=segById(S.segId);S.segMenu=false;const nx=EMP.filter(e=>evalGroups(s.groups,e)>=0).map(e=>e.id);const old=new Set(s.members);const ns=new Set(nx);S.ov={type:'refresh',next:nx,add:nx.filter(x=>!old.has(x)),rem:s.members.filter(x=>!ns.has(x))};renderOverlay();break}
  case'refreshyes':{const s=segById(S.segId);s.members=S.ov.next;s.version=(s.version||1)+1;s.snapshotAt=NOWL;s.updated='20 Nov 2026';S.ov=null;toast(`Snapshot refreshed. Version ${s.version} has ${pl(s.members.length,'person','people')}.`);render();break}
  case'segdel':S.segMenu=false;S.ov={type:'segdel'};renderOverlay();break;
  case'segdelyes':SEGS=SEGS.filter(s=>s.id!==S.segId);S.ov=null;S.route='segments';toast('Segment deleted.');render();break;
  case'seguse':{const ds=[S.d,...S.parked].filter(x=>x&&!x.run);S.ov={type:'usebulk',draft:ds[0]?ds[0].id:'new',mode:'append'};renderOverlay();break}
  case'ubd':S.ov.draft=a.value;renderOverlay();break;
  case'ubm':S.ov.mode=a.value;renderOverlay();break;
  case'ubgo':{const id=S.segId;const o=S.ov;let x;if(o.draft==='new'){if(S.d)S.parked.unshift(S.d);x=blankDraft();S.d=x}else{x=[S.d,...S.parked].find(y=>y&&y.id===o.draft);if(x!==S.d){S.parked=S.parked.filter(p=>p!==x);if(S.d)S.parked.unshift(S.d);S.d=x}}
    const cond={f:'empid',op:'inseg',v:[id]};if(o.draft!=='new'&&o.mode==='replace')x.who.groups=[{mode:'all',conds:[cond]}];else addTargetCond(x,cond);x.visited.add('who');S.ov=null;clearInterval(S.timer);S.route='draft';S.step=x.name?'who':'setup';
    toast(`"${segName(id)}" ${o.draft!=='new'&&o.mode==='replace'?'now targets':'added to'} ${x.name?'"'+x.name+'"':'a new bulk change. Name it to continue'}.`);render();window.scrollTo(0,0);break}
  case'setype':if(S.se.locked)break;S.se.type=a.dataset.v;if(S.se.type==='dynamic')S.se.source='conditions';S.se.tf={};S.se.excluded=new Set();render();break;
  case'sesrc':if(S.se.locked)break;S.se.source=a.dataset.v;S.se.tf={};S.se.excluded=new Set();render();break;
  case'secancel':if(S.se.inSheet){closeSheet();break}if(S.se.target){}S.route=S.se.segId?'segment':'segments';S.se=null;render();break;
  case'sheetclose':if(S.se&&S.se.inSheet)closeSheet();break;
  case'segsave':saveSegment();break;
  case'sesample':loadFile(S.se,'promotion-nominations-fy26.csv',sampleNominations());render();break;
  case'sepaste':S.se.pasteOpen=!S.se.pasteOpen;render();break;
  case'sepasteload':if(loadFile(S.se,'pasted.csv',S.se.pasteText))render();break;
  case'sereplace':S.se.file=null;S.se.tf={};S.se.excluded=new Set();render();break;
  case'seunm':S.se.file.showUnmatched=!S.se.file.showUnmatched;render();break;
  case'hsortq':{const ts=tsOf(a.dataset.t);const k2=a.dataset.k;ts.sort=ts.sort&&ts.sort.key===k2?(ts.sort.dir>0?{key:k2,dir:-1}:null):{key:k2,dir:1};ts.page=1;render();break}
  case'hmenu':if(PREV.hm&&PREV.hm.k===a.dataset.k&&PREV.hm.t===a.dataset.t){S.hm=null;renderHM();break}openHM(a);break;
  case'hsort':{const ts=tsOf(S.hm.t);ts.sort=+a.dataset.dir?{key:S.hm.k,dir:+a.dataset.dir}:null;ts.page=1;S.hm=null;render();break}
  case'hhide':{const ts=tsOf(S.hm.t);ts.hidden.add(S.hm.k);if(ts.sort&&ts.sort.key===S.hm.k)ts.sort=null;S.hm=null;render();break}
  case'hval':{const v=a.dataset.v;if(!S.hmd.vals)S.hmd.vals=S.hmAll.map(x=>x[0]);S.hmd.vals=a.checked?[...S.hmd.vals,v]:S.hmd.vals.filter(x=>x!==v);renderHM();break}
  case'hvall':S.hmd.vals=null;renderHM();break;
  case'hvnone':S.hmd.vals=[];renderHM();break;
  case'hclear':{const ts=tsOf(S.hm.t);delete ts.tf[S.hm.k];ts.page=1;S.hm=null;render();toast('Filter reset for this column.','info');break}
  case'happly':{const ts=tsOf(S.hm.t);const h=S.hmd;const cond=h.op?{op:h.op,v:h.v.slice()}:null;if(cond&&!completeSheet(cond)){toast('Fill in the value for that condition.');break}
    if(cond&&cond.op==='formula'){const c=compileFormula(cond.v[0],MT[S.hm.t].allCols);if(!c.ok){toast('Fix the formula first: '+c.err);break}}
    const vals=h.vals&&h.vals.length<S.hmAll.length?h.vals:null;if(!cond&&!vals)delete ts.tf[S.hm.k];else ts.tf[S.hm.k]={cond,vals};S.hm=null;ts.page=1;render();break}
  case'haddcond':{const h=S.hmd;const cfk=COL2CF[S.hm.k];let v=h.v.slice();if(LISTOP.has(h.op))v=(h.vals||S.hmAll.map(x=>x[0])).filter(x=>x!=='(Blanks)');const cond={f:cfk,op:h.op,v};
    if(!h.op||!complete(cond)){toast('Choose an operator and a value.');break}S.se.groups[0].conds.push(cond);S.hm=null;toast(`Added "${condTxt(cond)}" to the conditions.`);render();break}
  case'mexcl':{const ts=tsOf(a.dataset.t);if(a.checked)ts.excluded.delete(a.dataset.id);else ts.excluded.add(a.dataset.id);render();break}
  case'mclear':{const ts=tsOf(a.dataset.t);ts.tf={};ts.q='';ts.sort=null;ts.page=1;render();break}
  case'colsmenu':S.colsOpen=PREV.colsOpen===a.dataset.t?null:a.dataset.t;render();break;
  case'colshow':{const ts=tsOf(a.dataset.t);if(a.checked)ts.hidden.delete(a.dataset.k);else ts.hidden.add(a.dataset.k);S.colsOpen=a.dataset.t;render();break}
  case'field':{const f=a.dataset.f;if(a.checked){ensureField(f);if(!d.fields.includes(f))d.fields.push(f);d.modes[f]=d.modes[f]||'diff';
      if(f==='department'&&!d.fields.includes('team')){d.fields.push('team');d.modes.team=d.modes.department}if(f==='per'&&!d.fields.includes('compensation')){d.fields.push('compensation');d.modes.compensation='diff'}}
    else{d.fields=d.fields.filter(x=>x!==f);if(f==='department')d.fields=d.fields.filter(x=>x!=='team')}render();break}
  case'suggest':{const f=a.dataset.f;if(!d.fields.includes(f)){d.fields.push(f);d.modes[f]='diff'}render();break}
  case'ftog':{const k=a.dataset.k;if(a.getAttribute('aria-expanded')==='true'){S.fOpen.delete(k);S.fShut.add(k)}else{S.fShut.delete(k);S.fOpen.add(k)}render();break}
  case'fall':S.fAll.add(a.dataset.k);render();break;
  case'fselonly':S.fSel=a.checked;render();break;
  case'fclear':S.whatQ='';S.fFilt=[];S.fSel=false;render();break;
  case'fnone':d.fields=[];S.aiPicked=new Set();render();break;
  case'frm':{const f=a.dataset.f;d.fields=d.fields.filter(x=>x!==f&&!(f==='department'&&x==='team')&&!(f==='per'&&x==='compensation'&&false));render();break}
  case'fgrp':{const k=a.dataset.k;const[cat,sb]=k.split('|');const q=(S.whatQ||'').trim().toLowerCase();const xs=CATALOG.filter(x=>x.path[0]===cat&&(!sb||x.path[1]===sb)&&!x.ro&&!x.lock);
    if(a.checked&&xs.filter(x=>!d.fields.includes(x.key)).length>60){a.checked=false;toast(`That's ${fmtN(xs.length)} fields. Open the category and pick a subcategory, or search for what you need.`,'warning');break}
    if(a.checked){let n=0;xs.forEach(x=>{if(!d.fields.includes(x.key)){d.fields.push(x.key);d.modes[x.key]='diff';ensureField(x.key);n++}});if(xs.some(x=>x.key==='department')&&!d.fields.includes('team'))d.fields.push('team');if(n>10)toast(`Added ${pl(n,'field')}. Remove any you don't need from Selected.`,'info')}
    else{const ks=new Set(xs.map(x=>x.key));d.fields=d.fields.filter(x=>!ks.has(x))}render();break}
  case'aifields':{const ks=aiFields(S.aiF);if(!ks.length){toast("Couldn't match that to fields. Name what changes, for example: promotions with a raise, or a laptop refresh.",'warning');break}
    S.aiPicked=S.aiPicked||new Set();let n=0;ks.forEach(k=>{ensureField(k);if(!d.fields.includes(k)){d.fields.push(k);d.modes[k]='diff';S.aiPicked.add(k);n++}});if(ks.includes('department')&&!d.fields.includes('team'))d.fields.push('team');
    toast(n?`Picked ${pl(n,'field')}. They're marked ✦ under Selected; remove any you don't need.`:'Those fields are already selected.','info');render();break}
  case'mode':d.modes[a.dataset.f]=a.dataset.m;if(a.dataset.f==='department'&&d.fields.includes('team'))d.modes.team=a.dataset.m;render();break;
  case'tool':{const t=a.dataset.k;if(t==='template'){const A=analyze(d);const fs=d.fields;S.ov={type:'text',title:'Download template',sub:`${fmtN(A.rows.length)} rows with today's values. Fill in the "(new)" columns and upload it back. Leave a cell empty for no change.`,
      text:[csvLine(['Employee ID','Name','Work email',...fs.flatMap(f=>[FIELDS[f].label+' (current)',FIELDS[f].label+' (new)'])])].concat(A.rows.map(e=>csvLine([e.id,e.name,e.email,...fs.flatMap(f=>[fmtVal(e,f,e[f]),''])]))).join('\n')};renderOverlay();break}
    if(t==='upload'){S.ov={type:'upload',text:'',preview:null};renderOverlay();break}d.grid.tool=d.grid.tool===t?null:t;if(t==='ai')S.focus='ai-ta';render();break}
  case'gchanged':d.grid.changed=a.checked;d.grid.scroll=0;render();break;
  case'ggroup':d.grid.group=a.checked;if(a.checked&&!d.grid.groupBy)d.grid.groupBy=d.fields[0]||'department';d.grid.collapsed=new Set();d.grid.scroll=0;render();break;
  case'gcol':{const dp=a.dataset.dept;d.grid.collapsed.has(dp)?d.grid.collapsed.delete(dp):d.grid.collapsed.add(dp);refreshGrid();break}
  case'clearissue':d.grid.issue=null;render();break;
  case'applyset':{const f=S.setF;const F=FIELDS[f];const el=$('#setv');let v=F.type==='select'||F.type==='team'?(S.setV||''):(el?el.value:'');if(F.type==='money'||F.type==='int'){v=parseMoney(v);if(!isFinite(v)){toast('Enter an amount.');break}}if(F.type==='person'){v=parsePerson(v);if(!v){toast('Pick a manager from the list.');break}}if(v===''){toast('Enter a value.');break}
    const rows=G.items.filter(x=>x.e).map(x=>x.e);rec(`Set ${FIELDS[f].label} for ${pl(rows.length,'row')}`);const cur=S.setCur||'local';let nconv=0;rows.forEach(e=>{let x=v;if(MONEY.has(f)&&cur!=='local'&&cur!==curCode(e)){x=conv(+v,cur,curCode(e));nconv++}setCell(e.id,f,f==='compensation'?roundComp(+x,nv(d,e,'per')):MONEY.has(f)?Math.round(+x/10)*10:x)});
    toast(`Set ${FIELDS[f].label} for ${pl(rows.length,'row')}.${nconv?` ${pl(nconv,'amount')} converted to local currency.`:''}`);render();break}
  case'execchange':{const t=rtRule(d);if(t.err){toast(t.err);break}const lim=viewLimit(d);const useLim=lim&&S.rt.inView!==false;const pv=previewChange(d,t.r,useLim?lim:null);if(!pv.writes.length){toast('Nothing to change: no matching row would get a different value.','warning');break}
    const n=(d.actN||0)+1;const L=rec(`Change ${n}: ${ruleTxt(t.r)}${useLim?' (rows in view)':''}`,'change');d.actN=n;const p=execChange(d,t.r,useLim?lim:null,'Change '+n);if(L)L.cells=p.writes.length;
    d.grid.tool=null;S.rt=null;S.aiText='';toast(`Changed ${pl(p.writes.length,'cell')}. Undo with ⌘Z.`);render();break}
  case'rtinview':S.rt.inView=a.checked;render();break;
  case'chgfield':{d.grid.tool='change';rtInit(d);S.rt.field=a.dataset.f;S.rt.op=ropsFor(a.dataset.f)[0][0];S.rt.cap=a.dataset.f==='compensation'?'max':'';render();break}
  case'issuesdrawer':S.drawer={type:'issues',k:a.dataset.k};renderDrawer();break;
  case'issuegrid':{const k=a.dataset.k;S.drawer=null;d.grid.appr=ISS[k].sev==='e'?'err':ISS[k].sev==='w'?'warn':'';d.grid.issue=k;d.grid.cur=null;S.step='values';d.grid.scroll=0;render();window.scrollTo(0,0);break}
  case'plist':{S.ov={type:'plist',k:a.dataset.k};TS.plist=tsNew(25);renderOverlay();break}
  case'logall':S.drawer={type:'log'};renderDrawer();break;
  case'addrule':{const R=S.rt;const F=FIELDS[R.field];const o=R.op;const noArg=['first','eff','skip','ladder'].includes(o);let a=R.a,b=R.b;
    if(!noArg){if(['pct','add','pctbase','step','shift'].includes(o)||(o==='set'&&(F.type==='money'||F.type==='int'))){a=parseMoney(a);if(!isFinite(a)){toast('Enter a number for the rule.');break}}
      else if(F.type==='person'){a=parsePerson(a);if(!a){toast('Pick a person from the list.');break}if(o==='map'){b=parsePerson(b);if(!b){toast('Pick the new manager from the list.');break}}}
      else if(a===''||a==null){toast('Fill in the value for the rule.');break}if(o==='map'&&(b===''||b==null)){toast('Choose the new value.');break}}
    const bad=R.groups.flatMap(g=>g.conds).filter(c=>!complete(c));if(bad.length){toast('Finish or remove the empty conditions under Where.');break}
    const r={field:R.field,op:o,a,b,cur:R.cur,cap:R.field==='compensation'&&o!=='set'&&R.cap?R.cap:null,where:clone(R.groups.filter(g=>g.conds.length)),ai:false,accepted:true};
    rec(`Applied rule: ${ruleTxt(r)}`);r.seq=++d.seq;if(d.modes[R.field]==='same')d.modes[R.field]='diff';d.rules.push(r);dirty();const A=analyze(d);const n=A.rows.filter(e=>pick(d,e,R.field).r===r).length;
    d.grid.tool=null;S.rt=null;toast(`Rule applied to ${pl(n,'cell')}.${n?'':' No row matched, or the values were already the same.'}`,n?'success':'warning');render();break}
  case'undo':undoRedo('u');break;case'redo':undoRedo('r');break;
  case'gfclear':d.grid.fg=[{mode:'all',conds:[]}];d.grid.scroll=0;render();break;
  case'gappr':d.grid.appr=a.dataset.k;d.grid.issue=null;d.grid.cur=null;S.navId=null;d.grid.scroll=0;render();break;
  case'gissue':d.grid.issue=a.dataset.k||null;d.grid.cur=null;S.navId=null;d.grid.scroll=0;render();break;
  case'gnav':{const items=G.items;const idx=items.map((it,i)=>it.e?i:-1).filter(i=>i>=0);if(!idx.length)break;const g=d.grid;g.cur=g.cur==null?(+a.dataset.dir>0?0:idx.length-1):(g.cur+(+a.dataset.dir)+idx.length)%idx.length;const i=idx[g.cur];const e=items[i].e;S.navId=e.id;
    const A=analyze(d);const sv=g.appr==='err'?'e':'w';const iss=(A.rowIss.get(e.id)||[]).filter(k=>ISS[k].sev===sv&&(!g.issue||k===g.issue));const f=iss.length?ISS[iss[0]].f:null;render();const w=$('#gwrap');if(w){w.scrollTop=Math.max(0,i*RH-RH*2);renderGridRows()}S.drawer={type:'why',id:e.id,f:f||'*',sev:sv};renderDrawer();break}
  case'apm':d.applyMode=a.value;render();break;
  case'confirmchg':{const A=analyze(d);d.confirmed=a.checked?confirmSig(d,A):null;render();break}
  case'cite':{const el=document.getElementById('cl-'+a.dataset.n);if(el){el.scrollIntoView({block:'center',behavior:'smooth'});el.classList.remove('flash');void el.offsetWidth;el.classList.add('flash')}break}
  case'airegen':toast('Summary regenerated from the current change list.','info');render();break;
  case'aicopy':{const A=analyze(d);const t=aiSummary(d,A,changeList(d,A)).map(x=>'• '+x.replace(/\s*\[\d+\]/g,'')).join('\n');try{navigator.clipboard.writeText(t).then(()=>toast('Summary copied.'),()=>toast('Summary copied.'))}catch(_){toast('Summary copied.')}break}
  case'exportchanges':{const A=analyze(d);const fs=d.fields;const rows=A.rows.filter(e=>A.rowChanged.has(e.id));
    S.ov={type:'text',title:'Every changed row',sub:`${pl(rows.length,'row')} · the same data the change list summarises`,text:[csvLine(['Employee ID','Name',...fs.flatMap(f=>[FIELDS[f].label+' (current)',FIELDS[f].label+' (new)']),'Approval']),...rows.map(e=>csvLine([e.id,e.name,...fs.flatMap(f=>[fmtVal(e,f,e[f]),fmtVal(e,f,nv(d,e,f))]),(A.rowAppr.get(e.id)||[]).map(x=>APPROVERS[x.k].short).join(' + ')||'None']))].join('\n')};renderOverlay();break}
  case'why':S.drawer={type:'why',id:a.dataset.id,f:a.dataset.f};renderDrawer();break;
  case'whyissue':S.drawer={type:'issue',k:a.dataset.k};renderDrawer();break;
  case'policy':S.drawer={type:'policy',k:a.dataset.k};renderDrawer();break;
  case'fixrow':applyFix(a.dataset.issue,a.dataset.fix,[a.dataset.id]);break;
  case'aiwho':{const ctx=a.dataset.ctx;const txt=(S.aiWho||{})[ctx]||'';const gs=aiTargeting(txt);if(!gs){toast("Couldn't turn that into conditions. Name a department, location, level, team, segment or date, for example: Engineering in the US at L5 and above.",'warning');break}
    const G2=groupsOf(ctx);const n=gs.reduce((s2,g)=>s2+g.conds.length,0);if(G2.length===1&&!G2[0].conds.length)G2.splice(0,1,...gs);else G2.push(...gs);toast(`Drafted ${pl(n,'condition')}. Review them before you continue.`,'info');render();break}
  case'aiok':{const g=groupsOf(a.dataset.ctx)[+a.dataset.g];if(g)delete g.ai;render();break}
  case'rmrule':rec(`Removed rule ${+a.dataset.i+1}`);d.rules.splice(+a.dataset.i,1);render();break;
  case'acceptai':rec('Accepted the AI draft');d.rules[+a.dataset.i].accepted=true;toast('Accepted. Those cells are now yours.');render();break;
  case'aiex':S.aiText=a.dataset.t;render();break;
  case'aigo':{const t=($('#ai-ta')||{}).value||'';S.aiText=t;const r0=parseAI(t);if(!r0){toast('Try a sentence with an amount or a percentage, for example: 5% raise for Meets.','warning');break}
    const nr=normRule(r0);if(!d.fields.includes(nr.field)){d.fields.push(nr.field);d.modes[nr.field]='diff';toast(`Added ${FIELDS[nr.field].label} to this change.`,'info')}
    S.rt={field:nr.field,op:nr.op,a:String(nr.a??''),b:'',cur:nr.cur||'USD',cap:nr.cap||'',groups:nr.where.length?nr.where:[{mode:'all',conds:[]}],ai:t};d.grid.tool='change';render();break}
  case'aigo_old':{const t='';const r=parseAI(t);if(!r){break}
    rec('AI draft: '+t.slice(0,60));if(!d.fields.includes(r.field)){d.fields.push(r.field);d.modes[r.field]='diff';toast(`Added ${FIELDS[r.field].label} to this change.`)}const nr=normRule(r);nr.ai=true;nr.accepted=false;nr.seq=++d.seq;d.rules.push(nr);d.grid.tool=null;render();break}
  case'fix':applyFix(a.dataset.issue,a.dataset.fix);break;
  case'showrows':d.show[a.dataset.issue]=!d.show[a.dataset.issue];render();break;
  case'ack':d.ack[a.dataset.issue]=true;render();break;
  case'opengrid':d.grid.issue=a.dataset.issue;d.grid.changed=false;d.grid.dept='';d.grid.group=false;d.grid.scroll=0;S.step='values';render();window.scrollTo(0,0);break;
  case'moveerr':{const A=analyze(d);const ids=new Set();Object.keys(A.issues).filter(k2=>ISS[k2].sev==='e').forEach(k2=>A.issues[k2].forEach(id=>ids.add(id)));ids.forEach(id=>d.moved.add(id));S.followups=d.moved.size;toast(`Moved ${pl(ids.size,'row')} to "${d.name} · follow-ups".`);render();break}
  case'cut':d.cutoff.choice=a.value;d.cutoff.confirmed=false;if(a.value==='date'){toast('Change the date on Details.');S.step='setup'}render();break;
  case'confirmcut':d.cutoff.confirmed=true;render();break;
  case'whyapp':d.show['app-'+a.dataset.k]=!d.show['app-'+a.dataset.k];render();break;
  case'appsync':d.appSync=a.value;render();break;
  case'digest':d.digest=a.checked;break;case'notifymgr':d.notifyMgr=a.checked;break;
  case'notifyemp':d.notifyEmp=a.checked;render();break;
  case'accessack':d.accessAck=a.checked;render();break;
  case'submit':{const I=impact(d);d.run={phase:I.approvers.length?'approval':'scheduled',frozen:analyze(d).rows.map(e=>e.id),sync:null};d.visited.add('status');S.step='status';toast(I.approvers.length?`Sent to ${I.approvers.map(x=>x.who).join(', ')}.`:'Scheduled.');render();window.scrollTo(0,0);break}
  case'approveas':S.approver=true;S.apAll=false;render();window.scrollTo(0,0);break;
  case'approveall':d.run.phase='scheduled';toast('Approved by Priya Shah.');render();break;
  case'apback':S.approver=false;render();break;
  case'apall':S.apAll=!S.apAll;render();break;
  case'apout':S.apOut=a.dataset.v==='1';TS.apv&&(TS.apv.page=1);render();break;
  case'apreasonall':{const v=($('#apr-common')||{}).value||'';if(!v.trim()){toast('Type a reason first.');break}d.rejected.forEach((_,id)=>d.rejected.set(id,v.trim()));toast(`Reason applied to ${pl(d.rejected.size,'row')}.`);render();break}
  case'tsel':{const m=MT[a.dataset.t];const sm=m.opts.sel;if(a.checked)sm.set(a.dataset.id,sm.get(a.dataset.id)||'');else sm.delete(a.dataset.id);render();break}
  case'tselpage':{const m=MT[a.dataset.t];const sm=m.opts.sel;const ts=m.ts;const size=ts.size||25;m.rows.slice((ts.page-1)*size,ts.page*size).forEach(e=>a.checked?sm.set(e.id,sm.get(e.id)||''):sm.delete(e.id));render();break}
  case'tselall':{const m=MT[a.dataset.t];m.rows.forEach(e=>m.opts.sel.set(e.id,m.opts.sel.get(e.id)||''));render();break}
  case'tselnone':{const m=MT[a.dataset.t];if(m)m.opts.sel.clear();else S.d.rejected.clear();render();break}
  case'apsel':{const id=a.dataset.id;if(a.checked)d.rejected.set(id,'');else d.rejected.delete(id);render();break}
  case'approve':{const miss=[...d.rejected.entries()].filter(([,v])=>!String(v).trim());if(miss.length){toast(`Add a reason for ${pl(miss.length,'row')} you're sending back. Type one reason above the table to cover them all.`);const el=$('#apr-common');if(el)el.focus();break}
    const n=d.rejected.size;d.rejected.forEach((_,id)=>d.moved.add(id));S.followups=d.moved.size;d.rejected=new Map();d.run.phase='scheduled';S.approver=false;toast(n?`Approved. ${pl(n,'row')} went back to a follow-up draft.`:'Approved.');render();break}
  case'arrive':d.run.phase='committed';startSync(d);render();break;
  case'retry':{const s=d.run.sync.find(x=>x.k===a.dataset.k);if(s){s.state='prog';s.fail=0;s.detail='';toast('Retrying after Raj Patel reactivated the accounts.');clearInterval(S.timer);S.timer=setInterval(()=>tick(d),700)}render();break}
  case'reversal':toast('A reversal draft with the old values is ready under Bulk change (not built in this prototype).');break;
  case'upsample':S.ov.text=d.fields.includes('spotBonus')?SAMPLES['q4-launch-bonus.csv']():d.fields.includes('laptop')?SAMPLES['laptop-refresh-q1-2027.csv']():sampleCompChanges();S.ov.preview=previewCSV(d,S.ov.text);renderOverlay();break;
  case'uppreview':S.ov.text=($('#up-ta')||{}).value||'';S.ov.preview=previewCSV(d,S.ov.text);renderOverlay();break;
  case'upapply':{const p=S.ov.preview;rec(`Uploaded a CSV (${pl(p.cells,'value')})`);const sq=++d.seq;d.cseq=d.cseq||{};d.csvHits=new Set();p.writes.forEach(([id,f,v])=>{d.csv[id]=d.csv[id]||{};d.csv[id][f]=v;d.cseq[id+'|'+f]=sq;d.csvHits.add(id+'|'+f);if(d.manual[id])delete d.manual[id][f]});S.ov=null;toast(`Wrote ${pl(p.cells,'value')} into the grid. They're marked ↑.`);render();break}
  case'copy':{const ta=$('#ov-ta');const txt=ta.value;const fb=()=>{ta.focus();ta.select();toast('Selected. Press Ctrl+C or ⌘C to copy.')};try{navigator.clipboard.writeText(txt).then(()=>toast('Copied.'),fb)}catch(_){fb()}break}
}}
function aiTargeting(text){const parts=String(text||'').split(/\s+or\s+/i);const groups=[];
  for(const p of parts){const s2=p.toLowerCase();const conds=[];let m;
    const deps=DEPTS.filter(x=>s2.includes(x.toLowerCase()));if(deps.length)conds.push({f:'department',op:'anyof',v:deps});
    if(/\b(us|u\.s\.|united states)\b/.test(s2))conds.push({f:'location',op:'noneof',v:['Toronto']});else if(/\b(canada|canadian)\b/.test(s2))conds.push({f:'location',op:'anyof',v:['Toronto']});else{const locs=LOCS.filter(x=>s2.includes(x.toLowerCase()));if(locs.length)conds.push({f:'location',op:'anyof',v:locs})}
    const tms=ALLTEAMS.filter(x=>s2.includes(x.toLowerCase()+' team')||s2.includes('team '+x.toLowerCase()));if(tms.length)conds.push({f:'team',op:'anyof',v:tms});
    if((m=s2.match(/\bl([1-8])\b\s*(and above|\+|or above|and up|or higher)?/)))conds.push(m[2]?{f:'level',op:'gte',v:['L'+m[1]]}:{f:'level',op:'anyof',v:['L'+m[1]]});
    const rts=RATINGS.filter(x=>new RegExp('\\b'+x.toLowerCase()+'\\b').test(s2));if(rts.length)conds.push({f:'rating',op:'anyof',v:rts});
    if(/contractor/.test(s2))conds.push({f:'etype',op:'anyof',v:['Contractor']});else if(/full[- ]time/.test(s2))conds.push({f:'etype',op:'anyof',v:['Full-time']});
    if(/on leave/.test(s2))conds.push({f:'status',op:'anyof',v:['On leave']});if(/\bhourly\b/.test(s2))conds.push({f:'per',op:'anyof',v:['Hourly']});else if(/\bsalaried\b/.test(s2))conds.push({f:'per',op:'anyof',v:['Salaried']});
    if((m=s2.match(/(?:hired|joined|started)\s+(?:in\s+)?the\s+(?:past|last)\s+(week|month|year)/)))conds.push({f:'startDate',op:'on',v:['past'+m[1]]});
    if((m=s2.match(/(?:hired|joined|started)\s+(before|after)\s+([0-9a-z\/ -]+?)(?:,|$|\s+and\s)/))&&parseDateStr(m[2].trim()))conds.push({f:'startDate',op:m[1],v:['exact',parseDateStr(m[2].trim())]});
    if((m=s2.match(/reports?\s+to\s+([a-z]+\s+[a-z]+)/))&&NAMEIDX[m[1]])conds.push({f:'manager',op:'reportsAll',v:[NAMEIDX[m[1]]]});
    const langs=['Spanish','French'].filter(x=>s2.includes(x.toLowerCase()));if(langs.length&&/speak/.test(s2))conds.push({f:'languages',op:'hasall',v:langs});
    if((m=s2.match(/(?:base pay|pay|salary|compensation)\s+(?:over|above|more than|>)\s*\$?(\d[\d,.]*)\s*(k)?\s*(usd|cad)?/)))conds.push({f:'compensation',op:'gt',v:[String(parseFloat(m[1].replace(/,/g,''))*(m[2]?1000:1))],cur:(m[3]||'usd').toUpperCase()});
    if((m=s2.match(/quota[^0-9]*?(?:over|above|at least|>=?)\s*(\d+)/)))conds.push({f:'quota',op:'gte',v:[m[1]]});
    if((m=s2.match(/(?:on|in)\s+teams?\s+(?:with|of)\s+(?:more than|over)\s+(\d+)/)))conds.push({f:'teamHeadcount',op:'gt',v:[m[1]]});
    if((m=s2.match(/departments?\s+(?:spending|with total (?:base )?pay)\s+(?:over|above|more than)\s*\$?(\d[\d,.]*)\s*(k|m)?/)))conds.push({f:'deptPay',op:'gt',v:[String(parseFloat(m[1].replace(/,/g,''))*(m[2]==='m'?1e6:m[2]==='k'?1e3:1))]});
    for(const sg of SEGS){const nm=sg.name.toLowerCase();if(s2.includes('not in '+nm)||s2.includes('excluding '+nm))conds.push({f:'empid',op:'notinseg',v:[sg.id]});else if(s2.includes(nm))conds.push({f:'empid',op:'inseg',v:[sg.id]})}
    if(conds.length)groups.push({mode:'all',conds,ai:true})}
  return groups.length?groups:null}
const aiBar=ctx=>`<div class="aibar"><span class="badge b-ai">✦ AI</span><input class="box" id="aiwho-${ctx}" data-in="aiwho" data-ctx="${ctx}" value="${esc((S.aiWho||{})[ctx]||'')}" placeholder="Describe who, e.g. Engineering in the US at L5 and above, hired in the past year"><button class="btn2 sm" data-act="aiwho" data-ctx="${ctx}">Draft conditions</button></div>`;
function parseAI(t){const s2=t.toLowerCase();let where=null;
  for(const[k,v]of[['partially','Partially meets'],['exceed','Exceeds'],['below','Below'],['meets','Meets']])if(s2.includes(k)){where={f:'rating',op:'anyof',v:[v]};break}
  const lm=s2.match(/\bl([1-8])\b/);if(!where&&lm){const n=+lm[1];where=/and above|or above|\+|and up/.test(s2)?{f:'level',op:'gte',v:['L'+n]}:{f:'level',op:'anyof',v:['L'+n]}}
  if(!where)for(const tm of ALLTEAMS)if(s2.includes(tm.toLowerCase()+' team')||s2.includes('team '+tm.toLowerCase())){where={f:'team',op:'anyof',v:[tm]};break}
  if(!where)for(const dp of DEPTS)if(s2.includes(dp.toLowerCase())){where={f:'department',op:'anyof',v:[dp]};break}
  if(!where)for(const lc of LOCS)if(s2.includes(lc.toLowerCase())){where={f:'location',op:'anyof',v:[lc]};break}
  const field=/one[- ]time|spot|launch bonus|bonus of/.test(s2)?'spotBonus':/bonus/.test(s2)?'bonus':'compensation';
  const am=s2.match(/(\d[\d,]*(?:\.\d+)?)\s*(k)?\s*(usd|cad|dollars?)\b/)||s2.match(/\$\s*(\d[\d,]*(?:\.\d+)?)\s*(k)?/);
  if(am){const amt=parseFloat(am[1].replace(/,/g,''))*(am[2]?1000:1);return{field,kind:field==='compensation'&&/raise|increase|add/.test(s2)?'add':'set',amt,cur:/cad/.test(s2)?'CAD':'USD',where,cap:null,ai:true,accepted:false}}
  const m=s2.match(/(\d+(?:\.\d+)?)\s*%/);if(!m)return null;return{field,kind:'pct',pct:+m[1],where,cap:/band max|maximum|cap/.test(s2)?'max':/mid/.test(s2)?'mid':null,ai:true,accepted:false}}
/* ================= events ================= */
let PREV={};
function closePopups(){PREV={pop:S.pop,menu:S.menu,hm:S.hm,segMenu:S.segMenu,newMenu:S.newMenu,dd:S.dd};const any=!!(S.pop||S.menu||S.hm||S.segMenu||S.newMenu||S.dd);
  S.pop=null;S.menu=false;S.hm=null;S.segMenu=false;S.newMenu=false;S.dd=null;return any}
const PLUS='<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.8"/></svg>';
const ddBtn=(key,label,ph,cls='')=>`<button type="button" class="ddt ${cls} ${label?'':'ph'}" data-act="ddopen" data-dd="${esc(key)}"><span>${esc(label||ph)}</span></button>`;
const condAt=(ctx,g,c)=>{const G2=groupsOf(ctx);return G2&&G2[+g]?G2[+g].conds[+c]:null};
function peopleGroups(filter){const by={};EMP.forEach(e=>{if(filter&&!filter(e))return;(by[e.department]=by[e.department]||[]).push({v:e.id,label:e.name,sub:`${e.id} · ${e.title}`,q:e.email})});return Object.keys(by).sort().map(k=>({label:k,items:by[k]}))}
function ddSpec(key){const p=key.split(':');const t=p[0];
  if(t==='bcur'){const cond=condAt(p[1],p[2],p[3]);if(!cond)return null;return{kind:'single',search:false,w:140,groups:[{label:'',items:Object.keys(FX).map(x=>({v:x,label:x}))}],value:cond.cur||'USD',apply:v=>{cond.cur=v}}}
  if(['bf','bo','bv','bseg','bppl','bpp1','brel','bvl'].includes(t)){const[,ctx,g,c,i]=p;const cond=condAt(ctx,g,c);if(!cond)return null;const F=fieldOf(cond);
    switch(t){
      case'bf':{const by={};Object.entries(CF).forEach(([k,x])=>(by[x.grp]=by[x.grp]||[]).push({v:k,label:x.label,meta:TYPE_LABEL[x.type],sub:(x.src?'From '+x.src:'')+(x.agg?'Computed from current data':'')+(x.money?'Compared in the currency you pick':'')}));return{kind:'single',ph:'Search fields',groups:Object.entries(by).map(([l,items])=>({label:l,items})),value:cond.f,apply:v=>{cond.f=v;const ty=CF[v].type;cond.op=ty==='id'?'inseg':OPS[ty][0][0];cond.v=[]}}}
      case'bo':return{kind:'single',search:false,groups:[{label:'',items:OPS[F.type].map(([o,l])=>({v:o,label:l}))}],value:cond.op,apply:v=>{cond.op=v;cond.v=[]}};
      case'bv':{const counts={};EMP.forEach(e=>{const x=F.get(e);(Array.isArray(x)?x:[x]).forEach(y=>counts[y]=(counts[y]||0)+1)});let groups;
        if(cond.f==='team')groups=Object.entries(TEAMS).map(([d2,ts])=>({label:d2,items:ts.map(x=>({v:x,label:x,count:counts[x]||0}))}));
        else if(cond.f==='location')groups=[['United States','US'],['Canada','CA']].map(([l,cc])=>({label:l,items:LOCS.filter(x=>LOC[x].country===cc).map(x=>({v:x,label:x,count:counts[x]||0}))}));
        else groups=[{label:'',items:F.opts().map(x=>({v:x,label:x,count:counts[x]||0}))}];
        return{kind:'multi',ph:'Search values',groups,value:cond.v,apply:v=>{cond.v=v}}}
      case'bvl':return{kind:'single',search:false,groups:[{label:'',items:LEVELS.map(l=>({v:l,label:l}))}],value:cond.v[+i],apply:v=>{cond.v=cond.v.slice();cond.v[+i]=v}};
      case'brel':return{kind:'single',search:false,groups:[{label:'',items:REL.map(([v,l])=>({v,label:l}))}],value:cond.v[0],apply:v=>{cond.v=[v,cond.v[1]||'']}};
      case'bseg':{const ex=ctx==='se'&&S.se&&S.se.segId;const mk=s=>({v:s.id,label:s.name,sub:`${fmtN(members(s.id).size)} people · ${s.type==='static'?'snapshot '+String(s.snapshotAt).split(',')[0]:'computed when used'}`});
        return{kind:'single',ph:'Search segments',w:360,groups:[{label:'Dynamic',items:SEGS.filter(s=>s.type==='dynamic'&&s.id!==ex).map(mk)},{label:'Static',items:SEGS.filter(s=>s.type==='static'&&s.id!==ex).map(mk)}],value:cond.v[0],apply:v=>{cond.v=[v]},
          footer:ctx==='d'?{act:'ddcreateseg',label:'Create new segment'}:null}}
      case'bppl':return{kind:'multi',ph:'Search name, ID or email',w:360,groups:peopleGroups(),value:cond.v,apply:v=>{cond.v=v},paste:true};
      case'bpp1':return{kind:'single',ph:'Search name or ID',w:360,groups:F.type==='person'?peopleGroups(e=>lvlN(e.level)>=5):peopleGroups(),value:cond.v[0],apply:v=>{cond.v=[v]}};
    }}
  if(t==='bm'){const g=groupsOf(p[1])[+p[2]];if(!g)return null;return{kind:'single',search:false,w:260,groups:[{label:'',items:[['all','all','Every condition is true'],['any','any','At least one condition is true'],['atleast','at least N','N or more of the conditions'],['atmost','at most N','No more than N of the conditions'],['exactly','exactly N','Exactly N of the conditions']].map(([v,l,sb])=>({v,label:l,sub:sb}))}],value:g.mode||'all',apply:v=>{g.mode=v;if(!g.n)g.n=1}}}
  if(t==='ins'){const d=S.d;const mk=s=>({v:s.id,label:s.name,sub:`${fmtN(members(s.id).size)} people`});return{kind:'single',ph:'Search segments',w:360,groups:[{label:'Dynamic',items:SEGS.filter(s=>s.type==='dynamic').map(mk)},{label:'Static',items:SEGS.filter(s=>s.type==='static').map(mk)}],value:null,
    apply:v=>{addTargetCond(d,{f:'empid',op:'inseg',v:[v]});toast(`Added "${segName(v)}"${d.who.groups.length>1?' as an OR group: its people join the targeting':''}.`)},footer:{act:'createseg',label:'Create new segment'}}}
  if(t==='hop'){return{kind:'single',search:false,w:250,groups:[{label:'',items:[{v:'',label:'None'}]},...SOPS.map(([l,xs])=>({label:l,items:xs.map(([v,lb])=>({v,label:lb}))}))],value:S.hmd?S.hmd.op:'',apply:v=>{S.hmd.op=v;S.hmd.v=v.startsWith('d_')?['today']:v==='formula'?[S.hmd.v[0]&&String(S.hmd.v[0]).startsWith('=')?S.hmd.v[0]:'']:[]},after:'hm'}}
  if(t==='hrel')return{kind:'single',search:false,groups:[{label:'',items:REL.map(([v,l])=>({v,label:l}))}],value:S.hmd?S.hmd.v[0]:'',apply:v=>{S.hmd.v=[v,S.hmd.v[1]||'']},after:'hm'};
  if(t==='cols'){const ts=tsOf(p[1]);const m=MT[p[1]];if(!m)return null;const items=c=>({v:c.key,label:c.label});const rc=m.allCols.filter(c=>!c.file&&c.key!=='_emp'),fc=m.allCols.filter(c=>c.file);
    return{kind:'multi',ph:'Search columns',groups:[{label:fc.length?'Rippling fields':'',items:rc.map(items)},...(fc.length?[{label:'From your file',items:fc.map(items)}]:[])],value:m.allCols.filter(c=>c.key!=='_emp'&&!ts.hidden.has(c.key)).map(c=>c.key),
      apply:v=>{m.allCols.forEach(c=>{if(c.key==='_emp')return;if(v.includes(c.key))ts.hidden.delete(c.key);else ts.hidden.add(c.key)})}}}
  if(t==='rows'){const ts=tsOf(p[1]);return{kind:'single',search:false,w:120,groups:[{label:'',items:[10,25,50,100].map(n=>({v:String(n),label:String(n)}))}],value:String(ts.size||25),apply:v=>{ts.size=+v;ts.page=1}}}
  if(t==='keycol'){const f=S.se&&S.se.file;if(!f)return null;return{kind:'single',search:false,groups:[{label:'',items:f.header.map((h,i)=>({v:String(i),label:h||'Column '+(i+1)}))}],value:String(f.keyCol),apply:v=>{f.keyCol=+v;if(f.raw)reparse(S.se)}}}
  if(t==='ctype'){const f=S.se&&S.se.file;if(!f)return null;const col=f.cols.find(x=>x.key===p[1]);return{kind:'single',search:false,w:160,groups:[{label:'',items:['text','num','date','bool','pick'].map(x=>({v:x,label:TYPE_LABEL[x]}))}],value:col.type,
    apply:v=>{f.types[col.key]=v;if(f.raw)reparse(S.se);else col.type=v;delete S.se.tf[col.key]}}}
  if(t==='rtf'){const d=S.d;return{kind:'single',ph:'Search fields',w:300,groups:[{label:'Fields in this change',items:d.fields.map(x=>({v:x,label:FIELDS[x].label,meta:TYL[FIELDS[x].type]||'Text',sub:d.modes[x]==='same'?'Now one value for everyone; a rule switches it to each person':''}))}],value:S.rt.field,apply:v=>{S.rt.field=v;S.rt.op=ropsFor(v)[0][0];S.rt.a='';S.rt.b='';S.rt.cap=v==='compensation'?'max':''}}}
  if(t==='rtk')return{kind:'single',search:false,w:280,groups:[{label:'For '+(TYL[FIELDS[S.rt.field].type]||'Text').toLowerCase()+' fields',items:ropsFor(S.rt.field).map(([v,l])=>({v,label:l}))}],value:S.rt.op,apply:v=>{S.rt.op=v;S.rt.a='';S.rt.b=''}};
  if(t==='rtv'){const F=FIELDS[S.rt.field];const w=p[1];const d=S.d;let groups;if(F.type==='team')groups=Object.entries(TEAMS).map(([dp,ts])=>({label:dp,items:ts.map(x=>({v:x,label:x}))}));else{const cnt={};analyze(d).rows.forEach(e=>{cnt[e[S.rt.field]]=(cnt[e[S.rt.field]]||0)+1});groups=[{label:'',items:F.opts().map(x=>({v:x,label:x,count:w==='a'&&S.rt.op==='map'?cnt[x]||0:undefined}))}]}
    return{kind:'single',ph:'Search values',groups,value:S.rt[w],apply:v=>{S.rt[w]=v}}}
  if(t==='gby'){const d=S.d;const other=['department','team','location','level','rating','manager','etype','status','per','timeOff','benefits','costCenter'].filter(k=>!d.fields.includes(k)&&CF[k]);
    return{kind:'single',ph:'Search fields',w:300,groups:[{label:'Fields you are editing',items:d.fields.map(k=>({v:k,label:FIELDS[k].label,sub:'Grouped by today\'s value'}))},{label:'Other attributes',items:other.map(k=>({v:k,label:CF[k].label}))}],value:d.grid.groupBy,apply:v=>{d.grid.groupBy=v;d.grid.group=true;d.grid.collapsed=new Set();d.grid.scroll=0}}}
  if(t==='gctx'){const d=S.d;const ks=Object.keys(CF).filter(k=>!CF[k].agg&&k!=='empid'&&!d.fields.includes(k));return{kind:'multi',ph:'Search attributes',w:300,groups:[...new Set(ks.map(k=>CF[k].grp))].map(gp=>({label:gp,items:ks.filter(k=>CF[k].grp===gp).map(k=>({v:k,label:CF[k].label}))})),value:d.grid.ctx||[],apply:v=>{d.grid.ctx=v}}}
  if(t==='rtc'||t==='setcur'||t.startsWith('samecur')){const loc=t==='setcur';const items=[...(loc?[{v:'local',label:"Each person's currency",sub:'No conversion'}]:[]),...Object.keys(FX).map(x=>({v:x,label:x,sub:'Converted to each person\'s pay currency'}))];
    return{kind:'single',search:false,w:260,groups:[{label:'',items}],value:t==='rtc'?S.rt.cur:t==='setcur'?(S.setCur||'local'):((S.d.sameCur||{})[p[1]]||'USD'),apply:v=>{if(t==='rtc')S.rt.cur=v;else if(t==='setcur')S.setCur=v;else{S.d.sameCur=S.d.sameCur||{};S.d.sameCur[p[1]]=v}}}}
  if(t==='rtcap')return{kind:'single',search:false,w:180,groups:[{label:'',items:[['max','band maximum'],['mid','band midpoint'],['','no cap']].map(([v,l])=>({v,label:l}))}],value:S.rt.cap,apply:v=>{S.rt.cap=v}};
  if(t==='setf'){const d=S.d;return{kind:'single',ph:'Search fields',groups:[{label:'',items:d.fields.filter(f=>d.modes[f]!=='same').map(f=>({v:f,label:FIELDS[f].label}))}],value:S.setF,apply:v=>{S.setF=v;S.setV=''}}}
  if(t==='setv'){const F=FIELDS[S.setF];const opts=F.type==='team'?Object.entries(TEAMS).map(([dp,ts])=>({label:dp,items:ts.map(x=>({v:x,label:x}))})):[{label:'',items:F.opts().map(x=>({v:x,label:x}))}];return{kind:'single',ph:'Search values',groups:opts,value:S.setV,apply:v=>{S.setV=v}}}
  if(t.startsWith('same:')){const f=p[1];const F=FIELDS[f];const d=S.d;const opts=F.type==='team'?Object.entries(TEAMS).filter(([dp])=>!d.same.department||dp===d.same.department).map(([dp,ts])=>({label:dp,items:ts.map(x=>({v:x,label:x}))})):[{label:'',items:F.opts().map(x=>({v:x,label:x}))}];
    return{kind:'single',ph:'Search values',groups:opts,value:d.same[f],apply:v=>{d.same[f]=v;if(f==='department'&&d.modes.team==='same'&&d.same.team&&!TEAMS[v]?.includes(d.same.team))d.same.team=TEAMS[v]?.[0]||''}}}
  if(t==='ffilt'){const items=(p,ls)=>ls.map(l=>({v:p+l,label:l}));return{kind:'multi',search:false,w:240,groups:[{label:'Source',items:items('s:',['Standard','Custom field','App field','Connector'])},{label:'Type',items:items('t:',['Text','List','Number','Amount','Date','Person'])},{label:'Last used in a bulk change',items:[['new','Last 30 days'],['mid','Last 6 months'],['old','Over 6 months ago'],['never','Never']].map(([v,l])=>({v:'u:'+v,label:l}))}],value:S.fFilt,apply:v=>{S.fFilt=v}}}
  if(t==='fmode'){const f=p[1];const rule=true;return{kind:'single',search:false,w:280,groups:[{label:'',items:[{v:'diff',label:'Each person',sub:'Edit cells, paste or upload a CSV'},{v:'same',label:'One value for everyone',sub:'Set it once above the grid'},...(rule?[{v:'rule',label:'By rule',sub:'An operation for the rows that match conditions'}]:[])]}],value:S.d.modes[f]==='same'?'same':'diff',
    apply:v=>{const d=S.d;if(v==='rule'){d.grid.tool='rule';rtInit(d);S.rt.field=f;S.rt.op=ropsFor(f)[0][0];S.rt.cap=f==='compensation'?'max':''}else{if(d.modes[f]!==v)rec(`${FIELDS[f].label}: ${v==='same'?'one value for everyone':'each person'}`);d.modes[f]=v;if(f==='department'&&d.fields.includes('team'))d.modes.team=v}}}}
  if(t==='sample')return{kind:'single',search:false,w:300,groups:[{label:'',items:[['promotion-nominations-fy26.csv','Promotion nominations','Employee ID key · Yes/No, number, date and picklist columns'],['austin-office-movers.csv','Austin office movers','Work Email key · move date, relocation and parking columns']].map(([v,l,sb])=>({v,label:l,sub:sb}))}],value:null,apply:v=>{loadFile(S.se,v,SAMPLES[v]())}};
  return null}
function renderDD(){const el=$('#pop2');if(!S.dd){el.innerHTML='';return}const sp=ddSpec(S.dd.key);if(!sp){S.dd=null;el.innerHTML='';return}
  const q=(S.dd.q||'').toLowerCase();const multi=sp.kind==='multi';const val=multi?(sp.value||[]):sp.value;const LIM=200;let total=0,shown=0;
  const groups=sp.groups.map(g=>{const items=g.items.filter(it=>!q||(it.label+' '+(it.sub||'')+' '+it.v+' '+(it.q||'')).toLowerCase().includes(q));total+=items.length;return{...g,items}}).filter(g=>g.items.length);
  let body='';for(const g of groups){if(shown>=LIM)break;const its=g.items.slice(0,LIM-shown);shown+=its.length;const allOn=multi&&g.items.every(it=>val.includes(it.v));
    if(g.label)body+=`<div class="ddg">${multi?`<label class="ddgl"><input type="checkbox" data-act="ddgrp" data-g="${esc(g.label)}" ${allOn?'checked':''}>${esc(g.label)}</label>`:`<span>${esc(g.label)}</span>`}<span>${fmtN(g.items.length)}</span></div>`;
    body+=its.map(it=>{const on=multi?val.includes(it.v):val===it.v;const inner=`<span>${esc(it.label)}${it.sub?`<small>${esc(it.sub)}</small>`:''}</span>`;
      return multi?`<label class="ddi ${on?'on':''}"><input type="checkbox" data-act="ddtog" data-v="${esc(it.v)}" ${on?'checked':''}>${inner}${it.count!==undefined?`<em>${fmtN(it.count)}</em>`:''}</label>`
        :`<button type="button" class="ddi ${on?'on':''}" data-act="ddpick" data-v="${esc(it.v)}">${inner}${it.meta?`<em>${esc(it.meta)}</em>`:''}${on?'<i>✓</i>':it.count!==undefined?`<em>${fmtN(it.count)}</em>`:''}</button>`}).join('')}
  const W=Math.min(Math.max(S.dd.w,sp.w||240),window.innerWidth-16);const x=Math.max(8,Math.min(S.dd.x,window.innerWidth-W-8));const below=window.innerHeight-S.dd.y>300;const y=below?S.dd.y:Math.max(64,S.dd.top-390);
  el.innerHTML=`<div class="dd pp" style="left:${x}px;top:${y}px;width:${W}px" role="listbox">${sp.search!==false?`<div class="dds"><input type="search" id="dd-q" data-in="ddq" placeholder="${esc(sp.ph||'Search')}" value="${esc(S.dd.q||'')}" autocomplete="off"></div>`:''}
    ${multi?`<div class="ddbar"><button type="button" class="lnk" data-act="ddall">Select all${q?' matching':''}</button><button type="button" class="lnk" data-act="ddnone">Clear all</button><span class="muted">${fmtN(val.length)} selected</span></div>`:''}
    ${sp.paste?`<div class="ddpaste"><textarea id="dd-paste" placeholder="Paste IDs, work emails or names, in any mix"></textarea><div><button type="button" class="btn2 sm" data-act="ddpaste">Add pasted people</button></div></div>`:''}
    <div class="ddl">${body||'<div class="ddmore">No matches</div>'}${total>shown?`<div class="ddmore">Showing ${fmtN(shown)} of ${fmtN(total)}. Type to narrow the list.</div>`:''}</div>
    ${sp.footer?`<button type="button" class="ddf" data-act="${sp.footer.act}">${PLUS}<span>${esc(sp.footer.label)}</span></button>`:''}${multi?`<div class="ddfoot"><button type="button" class="btn sm" data-act="ddclose">Done</button></div>`:''}</div>`;
  if(S.dd.focus){const i=$('#dd-q');if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length)}S.dd.focus=false}}
function ddApply(v){const sp=ddSpec(S.dd.key);if(!sp)return;sp.apply(v);if(sp.after==='hm'){renderHM();renderDD()}else render()}
document.addEventListener('click',ev=>{const t=ev.target;if(t.closest('.pp')){const a=t.closest('[data-act]');if(a&&!(a.tagName==='INPUT'&&(a.type==='checkbox'||a.type==='radio'))){PREV={};act(a.dataset.act,a)}return}
  if(t.id==='overlay'){S.ov=null;renderOverlay();return}
  if(S.gq&&!t.closest('.gsearch')){S.gq='';$('#gq').value='';renderSearch()}
  const had=closePopups();const a=t.closest('[data-act]');
  if(a&&!(a.tagName==='INPUT'&&(a.type==='checkbox'||a.type==='radio'))){act(a.dataset.act,a);return}
  if(had)render()});
document.addEventListener('change',ev=>{const t=ev.target;const d=S.d;
  if(t.dataset.act&&(t.type==='checkbox'||t.type==='radio')){PREV={};act(t.dataset.act,t);return}
  if(t.id==='up-file'&&t.files&&t.files[0]){const fr=new FileReader();fr.onload=()=>{S.ov.text=String(fr.result);S.ov.preview=previewCSV(d,S.ov.text);renderOverlay()};fr.readAsText(t.files[0]);return}
  if(t.id==='seg-file'&&t.files&&t.files[0]){const file=t.files[0];const fr=new FileReader();fr.onload=()=>{if(loadFile(S.se,file.name,String(fr.result)))render()};fr.readAsText(file);return}
  if(t.dataset.cell){const[id,f]=t.dataset.cell.split('|');const F=FIELDS[f];let v=t.value;
    if(v==='')v='';else if(F.type==='money'||F.type==='int'){const n=parseMoney(v);if(!isFinite(n)){t.value='';toast(`"${v}" isn't an amount.`);return}v=f==='compensation'?roundComp(n,nv(d,EMPI[id],'per')):Math.round(n)}
    else if(F.type==='person'){if(v){const p=parsePerson(v);if(!p){toast(`No one called "${v}". Pick from the list.`);t.value='';return}v=p}}
    rec(`Edited ${EMPI[id]?.name||id} · ${F.label}`);setCell(id,f,v);refreshGrid();return}
  const k=t.dataset.in;if(!k)return;const G2=t.dataset.ctx?groupsOf(t.dataset.ctx):null;const c=G2&&t.dataset.c!==undefined?G2[+t.dataset.g].conds[+t.dataset.c]:null;
  switch(k){
    case'name':d.name=t.value;render();break;case'reason':d.reason=t.value;break;
    case'date':d.date=fromIso(t.value);render();break;
    case'bgmode':G2[+t.dataset.g].mode=t.value;render();break;
    case'bgn':G2[+t.dataset.g].n=Math.max(1,parseInt(t.value,10)||1);render();break;
    case'bf':{c.f=t.value;const ty=CF[c.f].type;c.op=ty==='id'?'inseg':OPS[ty][0][0];c.v=[];S.pop=LISTOP.has(c.op)?`${t.dataset.ctx}-${t.dataset.g}-${t.dataset.c}`:null;S.popQ='';render();break}
    case'bo':{c.op=t.value;c.v=[];S.pop=LISTOP.has(c.op)?`${t.dataset.ctx}-${t.dataset.g}-${t.dataset.c}`:null;S.popQ='';render();break}
    case'bv':{c.v=c.v||[];c.v[+t.dataset.i]=t.value;render();break}
    case'bvp':{const id=parsePerson(t.value);c.v=id?[id]:[];if(!id&&t.value)toast('Pick someone from the list.');render();break}
    case'bpick':{const id=parsePerson(t.value);if(id&&!c.v.includes(id))c.v.push(id);S.pop=`${t.dataset.ctx}-${t.dataset.g}-${t.dataset.c}`;render();break}
    case'paste':d.who.paste=t.value;break;
    case'same':{const f=t.dataset.f;let v=t.value;rec(`${FIELDS[f].label}: one value for everyone`);const F=FIELDS[f];if(F.type==='person')v=parsePerson(v)||'';else if(F.type==='money'||F.type==='int'){const n=parseMoney(v);v=isFinite(n)?n:''}d.same[f]=v;if(f==='department'&&d.modes.team==='same'&&d.same.team&&!TEAMS[v]?.includes(d.same.team))d.same.team=TEAMS[v]?.[0]||'';render();break}
    case'setf':S.setF=t.value;render();break;
    case'gdept':d.grid.dept=t.value;d.grid.scroll=0;render();break;
    case'acknote':d.ackNote[t.dataset.issue]=t.value;break;
    case'apreason':d.rejected.set(t.dataset.id,t.value);render();break;
    case'uptext':S.ov.text=t.value;break;
    case'sekey':S.se.file.keyCol=+t.value;if(S.se.file.raw)reparse(S.se);render();break;
    case'secoltype':{const f=S.se.file;f.types[t.dataset.k]=t.value;if(f.raw)reparse(S.se);else{const col=f.cols.find(x=>x.key===t.dataset.k);col.type=t.value}delete S.se.tf[t.dataset.k];render();break}
    case'hop':S.hmd.op=t.value;S.hmd.v=[];renderHM();break;
    case'hv':S.hmd.v[+t.dataset.i]=t.value;break;
  }});
document.addEventListener('input',ev=>{const t=ev.target;const k=t.dataset.in;const d=S.d;
  if(k==='ddq'){S.dd.q=t.value;S.dd.focus=true;renderDD()}
  else if(k==='hfx'){S.hmd.v=[t.value];const m=MT[S.hm.t];const c=compileFormula(t.value,m.allCols);const el=$('#fxmsg');if(el){const cnt=c.ok?m.base.filter(e=>{try{return!!c.fn(e)}catch(_){return false}}).length:0;el.className=!t.value?'muted':c.ok?'done-t':'loss';el.textContent=!t.value?'Write a formula or describe it below.':c.ok?`Valid · ${pl(cnt,'row')} match`:c.err}}
  else if(k==='hai'){S.hmd.ai=t.value}
  else if(k==='aiwho'){S.aiWho=S.aiWho||{};S.aiWho[t.dataset.ctx]=t.value}
  else if(k==='rta'){S.rt.a=t.value;clearTimeout(S.pvT);S.pvT=setTimeout(()=>{const f=document.activeElement&&document.activeElement.dataset.in;render();if(f){const el=document.querySelector(`[data-in=${f}]`);if(el){el.focus();el.setSelectionRange&&el.setSelectionRange(el.value.length,el.value.length)}}},500)}
  else if(k==='aitext'){S.aiText=t.value}
  else if(k==='rtb'){S.rt.b=t.value}
  else if(k==='popq'){S.popQ=t.value;S.focus='pop-q';render()}
  else if(k==='whatq'){S.whatQ=t.value;S.focus='what-q';render()}
  else if(k==='aif'){S.aiF=t.value}
  else if(k==='empq'){S.empQ=t.value;S.focus='emp-q';render()}
  else if(k==='gq'){S.gq=t.value;renderSearch()}
  else if(k==='slq'){S.slQ=t.value;S.focus='slq';render()}
  else if(k==='pq'){S.pq=t.value;S.focus='pq';render()}
  else if(k==='mq'){const ts=tsOf(t.dataset.t);ts.q=t.value;ts.page=1;S.focus=t.id;render()}
  else if(k==='hvq'){S.hmd.vq=t.value;renderHM();const el=document.querySelector('[data-in=hvq]');if(el){el.focus();el.setSelectionRange(el.value.length,el.value.length)}}
  else if(k==='hv'){S.hmd.v[+t.dataset.i]=t.value}
  else if(k==='sename'){S.se.name=t.value}else if(k==='sedesc'){S.se.desc=t.value}else if(k==='sepastetxt'){S.se.pasteText=t.value}
  else if((k==='name'||k==='reason')&&d){d[k]=t.value;const ok=d.name.trim()&&d.reason.trim()&&d.date;const b=$('#nextbtn');if(b)b.disabled=!ok;const w=$('#nextwhy');if(w)w.textContent=ok?'':(!d.name.trim()?'Name the change to continue.':!d.reason.trim()?'Add a reason. Approvers and the audit log need it.':'Pick an effective date. It decides which payroll run picks this up.')}
  else if(k==='paste'&&d)d.who.paste=t.value;
  else if(k==='acknote'&&d)d.ackNote[t.dataset.issue]=t.value;
  else if(k==='apreason'&&d)d.rejected.set(t.dataset.id,t.value)});
document.addEventListener('keydown',ev=>{if((ev.metaKey||ev.ctrlKey)&&(ev.key==='z'||ev.key==='Z'||ev.key==='y')&&S.route==='draft'&&S.d&&!S.d.run&&!['INPUT','TEXTAREA','SELECT'].includes(ev.target.tagName)){ev.preventDefault();undoRedo(ev.key==='y'||ev.shiftKey?'r':'u');return}
if(ev.key==='Escape'&&S.dd){S.dd=null;renderDD();return}if(ev.key==='Escape'&&S.drawer){S.drawer=null;renderDrawer();return}
  if(ev.key==='Enter'&&ev.target.id==='dd-q'){const b=document.querySelector('#pop2 .ddi');if(b&&b.tagName==='BUTTON'){ev.preventDefault();b.click()}return}
  if(ev.key==='Escape'){if(S.ov){S.ov=null;renderOverlay()}else if(S.hm){S.hm=null;renderHM()}else if(S.se&&S.se.inSheet){closeSheet()}else if(closePopups())render()}
  if(ev.key==='Enter'&&ev.target.dataset&&(ev.target.dataset.cell||ev.target.dataset.in==='bv'||ev.target.dataset.in==='bvp'))ev.target.blur();
  if(ev.key==='Enter'&&ev.target.dataset&&ev.target.dataset.in==='hv'){const b=document.querySelector('[data-act=happly],[data-act=haddcond]');if(b){S.hmd.v[+ev.target.dataset.i]=ev.target.value;b.click()}}});
window.addEventListener('resize',()=>{if(S.hm){S.hm=null;renderHM()}if(S.dd){S.dd=null;renderDD()}});
window.addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(['bulk','segments','people'].includes(h)&&S.route!==h){S.route=h;render()}});

/* ================= boot ================= */
build(S.size);makeSeeds();S.d=demoDraft();dirty();S.parked=extraDrafts();
const h0=location.hash.slice(1);if(['bulk','segments','people'].includes(h0))S.route=h0;
render();
window.__app={plistOf,previewChange,pick,ropsFor,rowApprovals,aiTargeting,parseAI,conv,whyIssue,ISS,analyze,impact,S,act,render,SEGS:()=>SEGS,members,MT,cohort,testVal,evalGroups,EMP:()=>EMP,segById,SAMPLES,compileFormula,aiFormula,testSheet};
})();
