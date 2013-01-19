var mongoq = require('mongoq');
var db = mongoq(cfg.GetDB() +cfg.GetDBSchema());