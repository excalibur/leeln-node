/**
 * 依赖库
 * @type {ProtoBuf|exports}
 */
var ProtoBuf = require('protobufjs'),
    fs = require('fs'),
    util = require('util'),
    logger = require('winston'),
    net = require('net'),
    path = require("path"),
    events = require("events"),
    poolModule = require('generic-pool');

/**
 * 暴露RPC
 */
exports = module.exports = RPC;


var rpc = {
    port: 8088,
    host: '127.0.01',
    protoDir: 'proto'
};


/**
 * RPC
 * @returns {Function}
 * @constructor
 */
function RPC(options) {


    var rpcBuild = rpc.build("rpc.proto")

    rpc.requestType = rpcBuild.RpcRequest;
    rpc.responseType = rpcBuild.RpcResponse;

    rpc = util._extend(rpc, options);

    rpc.pool = poolModule.Pool({
        name     : 'tcp-pool',
        create   : function(callback) {

            var client = net.connect({
                host: rpc.host,
                port: rpc.port
            },function(){
                console.log("connect");
                callback(null, client);
            });
        },
        destroy  : function(client) { client.destroy(); },
        max      : 10,
        // optional. if you set this, make sure to drain() (see step 3)
        min      : 2,
        // specifies how long a resource can stay idle in pool before being removed
        idleTimeoutMillis : 30000,
        // if true, logs via console.log - can also be a function
        log : true
    });


    return rpc;
}




rpc.build = function(file){
    var proto = ProtoBuf.loadProtoFile(path.join(path.resolve('.'), rpc.protoDir, file));
    var build = proto.build();
    return build;
};

rpc.invoke = function(options, callback){
    var Service = options.service;

    if(typeof Service !== "function"){
        throw new Error("Service isn't correct!");
    }

    var method = Service[options.method_name];
    if(typeof method !== "function"){
        throw new Error("no such this method error!");
    }

    var service = new Service(function(methodName, req, callback){
        var rpcRequest = new rpc.requestType({
            id : options.id,
            method_name: methodName,
            is_blocking_service: options.is_blocking_service,
            request_message : req.toBuffer()
        });

        var pool = rpc.pool;
        //tcp 连接
        pool.acquire(function(err, client) {
            if(err){
                console.log(err);
            }else{
                console.log(rpcRequest.toBuffer());

                client.write(rpcRequest.toBuffer(),function(){
                    client.once('data', function(data) {
                        var response = rpc.responseType.decode(data);
                        callback(response);
                        pool.release(client);
                    });
                });
            }

        });

    });

    var request_message = options.request_message;

    if(typeof request_message !== "object"){
        throw new Error("request message error!");
    }
    // 调用
    service[options.method_name](options.request_message, function(err, res){
        callback(res, err);
    });
};

