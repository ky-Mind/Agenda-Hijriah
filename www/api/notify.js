const admin=require("firebase-admin"),webpush=require("web-push");
module.exports=require("./_core").makeNotify({admin,webpush,env:process.env});
