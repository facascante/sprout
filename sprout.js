var express = require('express');

express()
.use(express.vhost('sprout.ph', require('./web')))
.listen(80,function(){
console.log("=============================SPROUT READY===============================");
});