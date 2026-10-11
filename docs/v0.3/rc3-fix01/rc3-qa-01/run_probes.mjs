import { readFileSync, writeFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const root='/workspace/work/rc3-inspection/rc2-source/';
const read=p=>readFileSync(root+p,'utf8');
const between=(s,a,b)=>s.slice(s.indexOf(a), b?s.indexOf(b,s.indexOf(a)):undefined);
const make=(s,name,bindings={})=>new Function(...Object.keys(bindings),stripTypeScriptTypes(s.replaceAll('export ',''))+`; return ${name};`)(...Object.values(bindings));
const results=[];
async function probe(name,fn){try{await fn();results.push({name,status:'Pass'});}catch(e){results.push({name,status:'Fail',evidence:String(e)});}}
const contracts=read('src/notifications/notificationContracts.ts');
const responseKey=make(between(contracts,'export function responseKey','export type ParsedPeriod'),'responseKey');
const coordinatorSource=between(read('src/notifications/notificationResponseService.ts'),'export function createResponseCoordinator');
const createResponseCoordinator=make(coordinatorSource,'createResponseCoordinator',{responseKey});
const tick=()=>new Promise(r=>setImmediate(r));
const response=(kind='time80-checkin')=>({actionIdentifier:'default',notification:{date:1,request:{identifier:'time80-test-id',content:{data:{kind}}}}});
function handlers(){const log=[];return{log,resolve:async()=>{log.push('resolve');return{kind:'unresolved',reason:'test'}},route:async()=>{log.push('route')},dismiss:async()=>{log.push('dismiss')},ack:async()=>{log.push('ack')},error:e=>log.push('error:'+e.message)}};

await probe('X75: empty ready queue returns undefined with no callbacks',async()=>{const h=handlers(),c=createResponseCoordinator(h);c.setReady(true);assert.equal(await c.retry(),undefined);assert.equal(c.size(),0);assert.deepEqual(h.log,[])});
await probe('X75: non-ready queue retains item and retry has no feedback',async()=>{const h=handlers(),c=createResponseCoordinator(h);c.enqueue(response());assert.equal(await c.retry(),undefined);assert.equal(c.size(),1);assert.deepEqual(h.log,[])});
await probe('X75: transient resolve failure then retry routes/dismisses/acks once; no success callback',async()=>{const h=handlers();let fail=true;h.resolve=async()=>{h.log.push('resolve');if(fail)throw Error('resolve');return{kind:'unresolved',reason:'test'}};const c=createResponseCoordinator(h);c.enqueue(response());c.setReady(true);await tick();assert.equal(c.size(),1);fail=false;assert.equal(await c.retry(),undefined);assert.equal(c.size(),0);assert.deepEqual(h.log,['resolve','error:resolve','resolve','route','dismiss','ack'])});
await probe('X75: dismiss failure preserves routed item; retry does not route again',async()=>{const h=handlers();let fail=true;h.dismiss=async()=>{h.log.push('dismiss');if(fail)throw Error('dismiss')};const c=createResponseCoordinator(h);c.enqueue(response());c.setReady(true);await tick();fail=false;await c.retry();assert.deepEqual(h.log,['resolve','route','dismiss','error:dismiss','dismiss','ack']);assert.equal(c.size(),0)});
await probe('X75: ack failure retries ack without duplicate route/dismiss',async()=>{const h=handlers();let fail=true;h.ack=async()=>{h.log.push('ack');if(fail)throw Error('ack')};const c=createResponseCoordinator(h);c.enqueue(response());c.setReady(true);await tick();fail=false;await c.retry();assert.deepEqual(h.log,['resolve','route','dismiss','ack','error:ack','ack']);assert.equal(c.size(),0)});
await probe('X75: repeated tap while running returns silently and does not duplicate work',async()=>{const h=handlers();let release;h.resolve=()=>{h.log.push('resolve');return new Promise(r=>release=r)};const c=createResponseCoordinator(h);c.enqueue(response());c.setReady(true);assert.equal(await c.retry(),undefined);assert.deepEqual(h.log,['resolve']);release({kind:'unresolved',reason:'test'});await tick();c.enqueue(response());await tick();assert.deepEqual(h.log,['resolve','route','dismiss','ack'])});
await probe('diagnostic response is dismissed/acked without resolve or route',async()=>{const h=handlers(),c=createResponseCoordinator(h);c.enqueue(response('time80-test'));c.setReady(true);await tick();assert.deepEqual(h.log,['dismiss','ack'])});

const resumeSource=between(read('App.tsx'),'    async function resume() {','    void resume();');
await probe('P03-015: exact App.resume body leaves previous permission error after success',async()=>{let error='',deny=true;const resume=make(resumeSource,'resume',{active:true,db:async()=>({}),getMeta:async()=> 'Asia/Tehran',timezone:()=> 'Asia/Tehran',applySettingsPatch:async()=>{},ensureSlotHorizon:async()=>{},reconcileNotifications:async()=>{if(deny)throw Error('تنظیمات ذخیره شد؛ مجوز اعلان داده نشده است')},errorMessage:e=>e.message,setError:e=>error=e});await resume();assert.ok(error.includes('مجوز'));deny=false;await resume();assert.ok(error.includes('مجوز'))});

const canonical=make(between(contracts,'export function canonical','export function responseKey'),'canonical');
const schedulerSource=between(read('src/notifications/scheduler.ts'),'export async function reconcileNotifications','export async function sendTestNotification');
function schedulingHarness(){
 const meta=new Map([['schedule_revision','1'],['schedule_anchor','null'],['schedule_dirty','false'],['slot_horizon_end','2027-01-01T00:00:00Z']]);
 const h={granted:false,meta,cache:[],system:[],calls:[],native:{generation:null,dirty:false,epoch:0},partial:false};
 const caps={exactAlarmAllowed:{value:true},displayPermission:{value:true},channelEnabled:{value:true},batteryExempt:{value:false}};
 h.caps=caps;
 const conn={getFirstAsync:async()=>null,execAsync:async()=>{},runAsync:async()=>({lastInsertRowId:1})};
 // Model only the documented native same-generation early-return; this is not a Kotlin/Android run.
 const applyOwnedPlan=async(req,generation,force)=>{h.calls.push({force,count:req.length});if(!force&&!h.native.dirty&&h.native.generation===generation)return{epoch:h.native.epoch};h.native.dirty=true;h.native.epoch++;if(h.partial){h.cache=req.slice(0,1);h.system=req.slice(0,1);throw Error('partial native model');}h.cache=req;h.system=req;h.native.generation=generation;h.native.dirty=false;return{epoch:h.native.epoch}};
 h.run=make(schedulerSource,'reconcileNotifications',{serialized:fn=>fn(),db:async()=>conn,getSettings:async()=>({notification_enabled:1,sound_enabled:1,vibration_enabled:1}),Notifications:{getPermissionsAsync:async()=>({granted:h.granted}),getAllScheduledNotificationsAsync:async()=>h.cache},getMeta:async(_,k)=>meta.get(k),setMeta:async(_,k,v)=>meta.set(k,v),validateSettings:()=>{},notificationPlan:()=>[30,0,30].map((minute,i)=>({key:String(i),weekday:1,hour:i?20:19,minute,data:{weekday:1}})),ensureAndroidChannel:async()=> 'time80-s1-v1',readNotificationCapabilities:async()=>caps,timezone:()=> 'Asia/Tehran',Crypto:{CryptoDigestAlgorithm:{SHA256:'sha256'},digestStringAsync:async(_,s)=>createHash('sha256').update(s).digest('hex')},canonical,readNativeSchedulingState:async()=>({...h.native}),applyOwnedPlan});return h;
}
await probe('P03-014: denied sets dirty; grant forces all three future requests',async()=>{const h=schedulingHarness();await assert.rejects(h.run(),/مجوز/);assert.equal(h.meta.get('schedule_dirty'),'true');assert.equal(h.calls.length,0);h.granted=true;await h.run();assert.deepEqual(h.calls,[{force:true,count:3}]);assert.equal(h.meta.get('schedule_dirty'),'false')});
await probe('P03-014: partial modeled adapter failure retains dirty and retry converges',async()=>{const h=schedulingHarness();h.granted=true;h.partial=true;await assert.rejects(h.run(),/partial/);assert.equal(h.meta.get('schedule_dirty'),'true');h.partial=false;await h.run();assert.equal(h.cache.length,3);assert.equal(h.system.length,3);assert.ok(h.calls.every(c=>c.force))});
await probe('P03-014: stale OS model with full cache passes resume verification; manual forces reapply',async()=>{const h=schedulingHarness();h.granted=true;await h.run();h.system=[];await h.run();assert.equal(h.calls.at(-1).force,false);assert.equal(h.system.length,0);assert.equal(h.meta.get('schedule_dirty'),'false');await h.run('manual');assert.equal(h.calls.at(-1).force,true);assert.equal(h.system.length,3)});
await probe('capability signature: exact/channel changes force; battery-only change does not',async()=>{const h=schedulingHarness();h.granted=true;await h.run();h.caps.exactAlarmAllowed.value=false;await h.run();assert.equal(h.calls.at(-1).force,true);h.caps.channelEnabled.value=false;await h.run();assert.equal(h.calls.at(-1).force,true);h.caps.batteryExempt.value=true;await h.run();assert.equal(h.calls.at(-1).force,false)});

const defaultSource=between(read('src/services/classificationService.ts'),'export async function setActivityDefaultTx','export async function saveActivity');
await probe('ICATUS: same loaded default is no-op; passing null clears it; stale revision rejects',async()=>{let row={code:'1',revision:3};const tx={getFirstAsync:async()=>row,runAsync:async(_,id,scheme,code,revision)=>{row={code,revision}}};const set=make(defaultSource,'setActivityDefaultTx',{SCHEME:'test'});await set(tx,1,'1',3);assert.deepEqual(row,{code:'1',revision:3});await set(tx,1,null,3);assert.deepEqual(row,{code:null,revision:4});await assert.rejects(set(tx,1,'1',3),/پیش‌فرض تغییر/)});

const checkIn=read('src/services/checkInService.ts');
const snapshot=make(between(checkIn,'const snapshot','async function context'),'snapshot');
const commitSource=between(checkIn,'export async function commitCheckIn','export async function undoEntryEdit');
function checkInHarness(hasEntry=true,hasClass=true){
 const initial={id:1,activity_id:1,period_start:'2026-10-01T10:00:00.000Z',period_end:'2026-10-01T10:30:00.000Z',duration_minutes:30,recorded_at:'2026-10-01T10:31:00.000Z',source:'manual',status:'logged'};
 const h={entry:hasEntry?{...initial}:null,assignment:hasEntry&&hasClass?{id:10,code:'1',revision:3,method:'user_selected'}:null,writes:[]};
 const tx={getFirstAsync:async(sql)=>sql.includes('activity_classification_defaults')?{code:'2',revision:5}:sql.includes('activities')?{id:2}:null,runAsync:async(sql,...a)=>{if(sql.startsWith('INSERT INTO time_entries'))h.entry={...initial,activity_id:a[0],recorded_at:a[4],source:a[5]};if(sql.startsWith('UPDATE time_entries'))h.entry={...h.entry,activity_id:a[0],recorded_at:a[1],source:a[2]};return{lastInsertRowId:1}}};
 h.commit=make(commitSource,'commitCheckIn',{transaction:fn=>fn(tx),getMeta:async()=> 'test',SCHEME:'test',context:async()=>structuredClone({entry:h.entry,classification:h.assignment,context:null}),snapshot,assertNoEntryOverlap:async()=>{},createEntryContext:async()=>{},assignEntryClassification:async(_,id,revision,value)=>{h.writes.push(value);h.assignment={id:11,revision:(revision??0)+1,...value}}});
 h.input={activityId:2,periodStart:initial.period_start,periodEnd:initial.period_end,source:'manual',expectedEntry:structuredClone(h.entry),expectedClassificationRevision:h.assignment?.revision??null};return h;
}
await probe('ICATUS: existing entry activity edit with no selection replaces historical class by new default',async()=>{const h=checkInHarness();await h.commit(h.input);assert.equal(h.assignment.code,'2');assert.equal(h.assignment.method,'inherited_default');assert.equal(h.assignment.revision,4)});
await probe('ICATUS: explicit old code still creates new assignment on activity edit',async()=>{const h=checkInHarness();await h.commit({...h.input,classificationSelection:{mode:'explicit',code:'1'}});assert.equal(h.assignment.code,'1');assert.equal(h.assignment.method,'user_reclassified');assert.equal(h.assignment.revision,4)});
await probe('ICATUS: unchanged activity preserves existing assignment; missing class is populated',async()=>{const h=checkInHarness();await h.commit({...h.input,activityId:1});assert.equal(h.writes.length,0);assert.equal(h.assignment.revision,3);const m=checkInHarness(true,false);await m.commit({...m.input,activityId:1});assert.equal(m.assignment.code,'2')});
await probe('ICATUS: new entry without selection inherits hidden default; stale classification rejects before write',async()=>{const n=checkInHarness(false);await n.commit(n.input);assert.equal(n.assignment.code,'2');const s=checkInHarness();await assert.rejects(s.commit({...s.input,expectedClassificationRevision:2}),/دسته تغییر/);assert.equal(s.writes.length,0);assert.equal(s.entry.activity_id,1)});

const report={commit:'8e1cef5c0bdf0d471a0ed6cfbd02872b127f7634',command:'node work/rc3-qa/run_probes.mjs',method:'Exact extracted TypeScript function bodies with injected IO doubles; native early-return modeled. No React, SQLite, Kotlin or Android execution.',results};
writeFileSync('/workspace/work/rc3-qa/probe-results.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(results.some(r=>r.status==='Fail'))process.exitCode=1;
