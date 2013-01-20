var express = require('express');

express()
.use(express.vhost('api.sprout.ph', require('./api')))
.use(express.vhost('sprout.ph', require('./web')))
.use(express.vhost('172.20.10.4', require('./web')))
.listen(80,function(){
console.log("=============================SPROUT READY===============================");
});