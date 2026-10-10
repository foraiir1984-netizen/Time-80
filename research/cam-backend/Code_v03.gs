/** Time80 CAM 0.3: consent-based session funnel + anonymous final ratings.
 *  Bound to "Time80 CAM — Anonymous Research Responses" Google Sheet.
 *  Replace the entire existing Code.gs and update the existing Web App deployment.
 */
const CAM_TAB='Responses', CAM_SESSIONS='Sessions', CAM_EVENTS='Events';
function doGet(){return HtmlService.createHtmlOutput('<h2>Time80 CAM receiver ready — v0.3</h2>');}
function receipt(ok){const msg=ok?'پاسخ ثبت شد ✓':'ثبت پاسخ انجام نشد';
  return HtmlService.createHtmlOutput('<html lang="fa" dir="rtl"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font:18px Tahoma;background:#103122;color:#fff;text-align:center;padding:60px"><h2>'+msg+'</h2></body></html>');}
function rating(x){if(x===''||x===undefined)return '';const v=Number(x);if(!Number.isInteger(v)||v<1||v>5)throw Error('bad rating');return v;}
function validId(s){return typeof s==='string'&&/^[a-zA-Z0-9-]{12,90}$/.test(s);}
function findSession(sheet,id){
  const n=sheet.getLastRow();if(n<2)return 0;
  const cell=sheet.getRange(2,4,n-1,1).createTextFinder(id).matchEntireCell(true).findNext();
  return cell?cell.getRow():0;
}
function updateSession(sheet,p,stage){
  let row=findSession(sheet,p.session_id),now=new Date();
  if(!row){sheet.appendRow([now,p.experiment,p.variant,p.session_id,'',false,false,false,false,now,'exposed',false]);row=sheet.getLastRow();}
  const state=sheet.getRange(row,1,1,12).getValues()[0];
  // Do not change a previously assigned variant if a retry supplies different text.
  if(state[2]!==p.variant)throw Error('variant changed for session');
  const d=state.slice();d[9]=now;d[10]=stage;
  if(stage==='follow')d[4]='دنبال کرد';
  if(stage==='decline')d[4]='رد کرد';
  if(stage==='discovery')d[5]=true;
  if(stage==='reflection')d[6]=true;
  if(stage==='survey')d[7]=true;
  if(stage==='submitted')d[8]=true;
  if(stage==='exit')d[11]=true;
  // Submission takes precedence over any late exit event.
  if(d[8]===true)d[11]=false;
  sheet.getRange(row,1,1,12).setValues([d]);
}
function legacyPost(p,book){
  if(!['A','B','C','D'].includes(p.variant)||!['دنبال کرد','رد کرد'].includes(p.decision)||!validId(p.receipt_id))throw Error('legacy data');
  const nums=[rating(p.curiosity),rating(p.relevance),rating(p.discovery)];
  const sheet=book.getSheetByName(CAM_TAB),n=sheet.getLastRow();
  if(n>1&&sheet.getRange(2,8,n-1,1).createTextFinder(p.receipt_id).matchEntireCell(true).findNext())return receipt(true);
  sheet.appendRow([new Date(),'CAM-0.2',p.variant,p.decision,...nums,p.receipt_id]);
  return receipt(true);
}
function doPost(e){
 let lock;
 try{
   const p=e&&e.parameter||{};
   if(p.honeypot||!['CAM-0.2','CAM-0.3','CAM-0.3-test'].includes(p.experiment))throw Error('invalid experiment');
   lock=LockService.getScriptLock();lock.waitLock(15000);
   const book=SpreadsheetApp.getActiveSpreadsheet();
   if(!book)throw Error('not a bound spreadsheet script');
   if(p.experiment==='CAM-0.2')return legacyPost(p,book);
   if(!['A','B','C','D'].includes(p.variant)||!validId(p.session_id)||!validId(p.receipt_id))throw Error('invalid ids');
   const sessions=book.getSheetByName(CAM_SESSIONS),events=book.getSheetByName(CAM_EVENTS);
   if(!sessions||!events)throw Error('missing pilot tabs');
   if(p.kind==='event'){
     if(!['exposed','follow','decline','discovery','reflection','survey','exit'].includes(p.stage))throw Error('invalid stage');
     const idCount=events.getLastRow();
     if(idCount>1&&events.getRange(2,6,idCount-1,1).createTextFinder(p.receipt_id).matchEntireCell(true).findNext())return receipt(true);
     updateSession(sessions,p,p.stage);
     events.appendRow([new Date(),p.experiment,p.variant,p.session_id,p.stage,p.receipt_id]);
     return receipt(true);
   }
   if(p.kind==='response'){
     if(!['دنبال کرد','رد کرد'].includes(p.decision))throw Error('invalid decision');
     const nums=[rating(p.curiosity),rating(p.relevance),rating(p.discovery)];
     const responses=book.getSheetByName(CAM_TAB),n=responses.getLastRow();
     if(n>1&&responses.getRange(2,8,n-1,1).createTextFinder(p.receipt_id).matchEntireCell(true).findNext())return receipt(true);
     responses.appendRow([new Date(),p.experiment,p.variant,p.decision,...nums,p.receipt_id,p.session_id]);
     updateSession(sessions,p,'submitted');
     events.appendRow([new Date(),p.experiment,p.variant,p.session_id,'submitted',p.receipt_id]);
     return receipt(true);
   }
   throw Error('invalid kind');
 }catch(err){console.error(err);return receipt(false)}
 finally{if(lock){try{lock.releaseLock()}catch(e){}}}
}