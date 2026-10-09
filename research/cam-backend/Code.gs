/** Time80 CAM anonymous responses — paste into Extensions > Apps Script of CAM sheet. */
const CAM_TAB='Responses';
function doGet(){return HtmlService.createHtmlOutput('<h2>Time80 CAM receiver ready</h2>');}
function receipt(ok){const msg=ok?'پاسخ ثبت شد ✓':'ثبت پاسخ انجام نشد';return HtmlService.createHtmlOutput('<html lang="fa" dir="rtl"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font:18px Tahoma;background:#103122;color:#fff;text-align:center;padding:60px"><h2>'+msg+'</h2></body></html>')}
function rating(x){if(x===''||x===undefined)return '';const v=Number(x);if(!Number.isInteger(v)||v<1||v>5)throw Error('bad rating');return v}
function doPost(e){
 try{
 const p=e.parameter||{};
 if(p.honeypot||p.experiment!=='CAM-0.2'||!['A','B','C','D'].includes(p.variant)||!['دنبال کرد','رد کرد'].includes(p.decision))throw Error('invalid fields');
 if(!/^[a-zA-Z0-9-]{12,90}$/.test(p.receipt_id||''))throw Error('invalid receipt');
 const nums=[rating(p.curiosity),rating(p.relevance),rating(p.discovery)];
 const lock=LockService.getScriptLock();if(!lock.tryLock(10000))throw Error('retry');
 try{
 const book=SpreadsheetApp.getActiveSpreadsheet(),sheet=book.getSheetByName(CAM_TAB);
 if(!sheet)throw Error('sheet missing');
 const n=sheet.getLastRow();
 if(n>1&&sheet.getRange(2,8,n-1,1).createTextFinder(p.receipt_id).matchEntireCell(true).findNext())return receipt(true);
 sheet.appendRow([new Date(),p.experiment,p.variant,p.decision,...nums,p.receipt_id]);return receipt(true);
 }finally{lock.releaseLock()}
 }catch(err){console.error(err);return receipt(false)}
}