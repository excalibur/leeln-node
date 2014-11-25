var rpc = require('./utils/rpc');



//console.log(rpc);

var UserBuild = rpc.build('userService.proto');

//console.log(UserBuild);

// setInterval(function(){
// 	console.log("-----------");
// 	rpc.invoke({
// 		id: 1,
// 		service:
// UserBuild.UserService,
// 		method_name: 'getUser',
// 		is_blocking_service: false,
// 		request_message: new UserBuild.UserRequest({
// 			username: '欧阳澄泓'
// 		})
// 	}, function(err, res){
// 		console.log("===============");
// 		console.log(err);
// 		//console.log(res);
// 		var user = new UserBuild.UserResponse.decode(res.response_message);
// 		//console.log(res);
// 		console.log(user);
// 	});

// },1000);


// 插入测试 1
//rpc.invoke({
//		id: 1,
//		service: UserBuild.UserService,
//		method_name: 'insert',
//		is_blocking_service: false,
//		request_message: new UserBuild.InsertMsg({
//			username: 'oyach',
//			nickname: '欧阳澄泓'
//		})
//	}, function(err, res){
//		console.log("===============");
//		console.log(err);
//		console.log(res);
//		if(res.response_message !== null){
//			var user = new UserBuild.EmptyMsg.decode(res.response_message);
//			//console.log(res);
//			console.log(user);
//		}
//	});

// 插入测试 2
//rpc.invoke({
//		id: 1,
//		service: UserBuild.UserService,
//		method_name: 'insert',
//		is_blocking_service: false,
//		request_message: new UserBuild.InsertMsg({
//			username: 'faith',
//			nickname: '欧阳澄泓'
//		})
//	}, function(err, res){
//		console.log("===============");
//		console.log(err);
//		console.log(res);
//		if(res.response_message !== null){
//			var user = new UserBuild.EmptyMsg.decode(res.response_message);
//			//console.log(res);
//			console.log(user);
//		}
//	});


//查询测试
rpc.invoke({
		id: 1,
		service: UserBuild.UserService,
		method_name: 'findByUsername',
		is_blocking_service: false,
		request_message: new UserBuild.UsernameMsg({
			username: 'oyach'
		})
	}, function(err, res){
		console.log("===============");
		console.log(err);
		console.log(res);
		if(res.response_message !== null){
			var user = new UserBuild.UserMsg.decode(res.response_message);
			//console.log(res);
			console.log(user);
		}

	});

//// 查询测试
//rpc.invoke({
//		id: 1,
//		service: UserBuild.UserService,
//		method_name: 'findAll',
//		is_blocking_service: false,
//		request_message: new UserBuild.EmptyMsg({})
//	}, function(err, res){
//		console.log("===============");
//		console.log(err);
//		console.log(res);
//		if(res.response_message !== null){
//			var user = new UserBuild.UsersMsg.decode(res.response_message);
//			//console.log(res);
//			console.log(user);
//		}
//
//	});