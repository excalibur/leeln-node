
var RPC = require('rpc/index');


var rpc = new RPC({
	host:'127.0.0.1',
	port:8088
});


//var rpc = new RPC({
//	host:'leeln.com',
//	port:8088
//});

module.exports = rpc;