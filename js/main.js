var clickFlg = false; //点击标志区别于滑动
var appid = 'wx23bc59b999907440';
/*var openid = 'oUPpHxLRBxOXkra2NqxgqVL24muY';*/
var openid;
var sex;
var num_img; //答案页编号
var score = 0;
var musicFlg = 0;
var shareData = {};
var shareFlg = 0; //分享标识 0-无记录+未答完题 1-有记录 2-无记录+已答完题
var myAuto = document.getElementById('myaudio');
$(function() {
	autoPlayAudio();
	$('#fullpage').fullpage();
	//判断操作系统
	//getOperateSys();
	//获取openId
	//getOpenid();
	/*getUserInfo(openid);*/
	//wx_share(shareFlg);
	//fullpage添加参数
	initFullPage();
	//背景图片填充整个屏幕
	setBackground();

	$("button,.img_2").click(function() {
		//改变点击标志，暂时放开向下滚动
		clickFlg = true
		$.fn.fullpage.moveSectionDown();
	})
	$(".middle.margin_t_11,.margin_t_9").find("div").click(function() {
		//改变点击标志，暂时放开向下滚动
		clickFlg = true
		$.fn.fullpage.moveSectionDown();
	})
	//测试 假的id
	/*getUserInfo(openid);*/

	/*$("#ido").css('display', 'block');
	$("#share").css('display', 'none');
	$("#shareToFriend").css('display', 'block');*/

})

function getOperateSys() {
	var u = navigator.userAgent;

	var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端

	var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
	if (isAndroid) {
		$(".img_answer").css('max-width', '75%');
	}
}

function autoPlayAudio() {
	wx.config({
		// 配置信息, 即使不正确也能使用 wx.ready
		debug: false,
		appId: '',
		timestamp: 1,
		nonceStr: '',
		signature: '',
		jsApiList: []
	});
	wx.ready(function() {
		myAuto.play();
	});
};
//背景图片填充整个屏幕
function setBackground() {
	var backgroundSize = window.screen.width + 'px ' + window.screen.height + 'px';
	$("body").css({
		'background-size': backgroundSize,
	})
}
//音乐开关
document.getElementById("music_img").onclick = function() {
	var imgObj = document.getElementById("music_img");

	//关闭音乐
	if (musicFlg == 0) {
		imgObj.src = "../img/music_off.png";
		myAuto.pause();
		musicFlg = 1;
	} else {
		//开启音乐
		imgObj.src = "../img/music_on.png";
		myAuto.play();
		musicFlg = 0;
	}

}
//获取openid
function getOpenid() {
	var code = getUrlParam('code');
	if (code == null) {
		//说明传过来的是分享的朋友的openid
		openid = getUrlParam('openid');
		//此时用户分享的话也是分享的是这个朋友的openid
		shareFlg = 2;
		wx_share(shareFlg);
		getUserInfo(openid);
		return
	}
	var statusCode = 0;
	var data = null;
	var settings = {
		"async": false,
		"crossDomain": true,
		"url": "http://design.youzidata.com/yjmaxdt/api/Get_wx_openid.php?code=" + code,
		"method": "GET",
		"headers": {
			"Cache-Control": "no-cache"
		}
	}
	$.ajax(settings).done(function(response) {
		if (response.openid != undefined) {
			openid = eval('response.' + "openid");
			localStorage.setItem("openid", openid);
			getUserInfo(openid);

		} else {
			console.log("openid获取失败，取本地存储的openid")
			openid = localStorage.getItem("openid");
			if (openid == null || openid == undefined) {
				alert("获取openid失败，请重新进入页面");
				return
			}
			getUserInfo(openid);
		}
		// alert(JSON.stringify(getJson("openid",eval('response.'+ "data")), null, 4));
	});
	/*$.post(url01, {}, function(data) {
			console.log(JSON.stringify(data, null, 4));
			statusCode = eval('response.'+ "statusCode");
			data = eval('response.'+ "data");
			if(statusCode != 1000){
            console.log(statusCode);
            }else{
            openid = eval('data.'+ "openid"); 
            console.log(openid);
           }
			if (data.statusCode == '1004') {
				console.log('code过期，重新进页面');
				window.location.href =" https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx23bc59b999907440&redirect_uri=http%3a%2f%2fdesign.youzidata.com%2fyjmaxdt%2fhtml%2fmain.html&response_type=code&scope=snsapi_base&state=state01#wechat_redirect"
				 
			} else if (data.statusCode == '1000') {
				openid = data.data.openid;
				//查询用户信息
				getUserInfo(openid);
			}
		})
	}*/
}


function getUserInfo(openid) {
	if (openid == null) {
		alert('获取用户信息失败，请稍后再试');
		return
	}
	var url02 = "http://design.youzidata.com/yjmaxdt/api/Get_user_info.php?wx_openid=" + openid;
	$.post(url02, {}, function(json) {
		if (json.statusCode == '1002') {
			//说明此用户之前没有保存过信息在db里,跳转到首页 
			$("#ido").css('display', 'block');
			$("#share").css('display', 'none');
			$("#shareToFriend").css('display', 'none');
		} else if (json.statusCode == '1') {
			alert('获取用户信息失败，请稍后再试');
		} else {
			//说明此用户之前答过题，跳转到宣传页 
			//获取编号 
			shareFlg = 1;
			wx_share(shareFlg);
			num_img = json.data.result_type;
			$(".img_answer").attr('src', '../img/share/' + num_img + '.png');
			$("#ido").css('display', 'none');
			$("#shareToFriend").css('display', 'none');
			$("#share").css('display', 'block');
		}
	}, 'json');
}
//获取参数字段
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	var r = window.location.search.substr(1).match(reg);
	if (r != null) return unescape(r[2]);
	return null;
}
//初始化fullpage插件
function initFullPage() {
	//fullpage初始化
	$("#ido").fullpage({
		anchors: ["page1", "page2", "page3", "page4", "page5"], //注意不带# 
		navigation: false,
		licenseKey: 'OPEN-SOURCE-GPLV3-LICENSE',
		//在离开前的回调函数
		onLeave: function(index, nextIndex, direction) {
			if (direction == 'up') {
				//禁止跳转
				return false
			} else {
				if (clickFlg) {
					clickFlg = false
					return true
				} else {
					return false
				}
			}
		}

	});

}

function saveGender(gender) {
	sex = gender;
}
//点击选项改变分数
function addScore(num, lastFlg) {
	score += num;
	if (lastFlg) {
		shareFlg = 2;
		wx_share(shareFlg);
		//需分享才能看到答案,出现分享弹窗
		$("#shareToFriend").css('display', 'block');
	} else {
		shareFlg = 0;
		wx_share(shareFlg);
	}
}

//微信分享
function wx_share(shareFlg) {
	var imgUrl = "http://design.youzidata.com/yjmaxdt/img/title.jpg";
	var link_01;
	//未答完题的情况
	if (shareFlg == 0) {
		link_01 = window.location.href;
	} else {
		//以答完题或者有记录的情况
		link_01 = "http://design.youzidata.com/yjmaxdt/html/main.html?openid=" + openid;
	}
	$.ajax({
		url: "../api/sign.php",
		data: {
			url: window.location.href
		},
		success: function(data) {
			// 微信分享事件监听
			data = JSON.parse(data);
			wx.config({
				debug: false,
				appId: data.appId, // 公众号的唯一标识
				timestamp: data.timestamp, // 生成签名的时间戳
				nonceStr: data.noncestr, // 生成签名的随机串
				signature: data.signature, // 签名
				jsApiList: [
					// 所有要调用的 API 都要加到这个列表中
					'checkJsApi',
					'onMenuShareTimeline',
					'onMenuShareAppMessage',
					'onMenuShareQQ',
					'hideMenuItems',
					'hideAllNonBaseMenuItem',
					'hideOptionMenu',
					'showMenuItems',
					'hideMenuItem'
				]
			});
			wx.ready(function() {
				wx.onMenuShareTimeline({ //分享到朋友全
					title: ' 测一测你是哪部剧的“主角”', // 分享时的标题
					desc: '7道题，10个主角，30秒测出你是谁？', //分享描述
					link: link_01, // 写进入时候的地址
					imgUrl: imgUrl, // 分享时显示的图标
					//用户确认分享后执行的回调函数
					success: function() {
						if (shareFlg == 2) {
							//属于答完题需要分享才能看答案
							var url = "http://design.youzidata.com/yjmaxdt/api/Set_user_info.php?wx_openid=" + openid + "&result_score=" + score + "&result_gender=" + sex;
							$.post(url, {}, function(json) {
								if (json.statusCode == '1000') { //保存成功
									//获取编号
									num_img = json.data.result_type;
									$(".img_answer").attr('src', '../img/share/' + num_img + '.png');
									$("#shareToFriend").css('display', 'none');
									$("#ido").css('display', 'none');
									$("#share").css('display', 'block');
								} else {
									alert('获取用户信息失败，请稍后再试');
									$("#ido").css('display', 'none');
									$("#shareToFriend").css('display', 'none');
									$("#share").css('display', 'block');
								}
								/*data = JSON.stringify(data);
								mui.alert(data);*/
							}, 'json');
						}
					},
					//用户取消分享后执行的回调函数
					cancel: function() {
						alert("取消分享");
					}
				});
				wx.onMenuShareAppMessage({ //分享给朋友
					title: ' 测一测你是哪部剧的“主角”', // 分享时的标题
					link: link_01, // 写进入时候的地址
					desc: '7道题，10个主角，30秒测出你是谁？', //分享描述
					imgUrl: imgUrl, // 分享时显示的图标
					//用户确认分享后执行的回调函数
					success: function() {
						if (shareFlg == 2) {
							//属于答完题需要分享才能看答案
							var url = "http://design.youzidata.com/yjmaxdt/api/Set_user_info.php?wx_openid=" + openid + "&result_score=" + score + "&result_gender=" + sex;
							$.post(url, {}, function(json) {
								if (json.statusCode == '1000') { //保存成功
									//获取编号
									num_img = json.data.result_type;
									$(".img_answer").attr('src', '../img/share/' + num_img + '.png');
									$("#shareToFriend").css('display', 'none');
									$("#ido").css('display', 'none');
									$("#share").css('display', 'block');
								} else {
									alert('获取用户信息失败，请稍后再试');
									$("#ido").css('display', 'none');
									$("#shareToFriend").css('display', 'none');
									$("#share").css('display', 'block');
								}
								/*data = JSON.stringify(data);
								mui.alert(data);*/
							}, 'json');
						}
					},
					//用户取消分享后执行的回调函数
					cancel: function() {
						alert("取消分享");
					}
				});
			});
		}
	});
}

/*document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {
	
	// 发送给好友
	WeixinJSBridge.on('menu:share:appmessage', function(argv) {
		shareFriend();
	});
	// 分享到朋友圈
	WeixinJSBridge.on('menu:share:timeline', function(argv) {
		shareTimeline();
	});
}, false); */

/*function validateShare(res) {
	if (res.err_msg != 'send_app_msg:cancel' && res.err_msg != 'share_timeline:cancel') {
		//分享完毕回调
		//最后一题答完后进入接口
		var url = "http://design.youzidata.com/yjmaxdt/api/Set_user_info.php?wx_openid=" + openid + "&result_score=" + score + "&result_gender=" + sex;
		$.post(url, {}, function(json) {
			if (json.statusCode == '1000') { //保存成功
				//获取编号
				num_img = json.data.result_type;
				$(".img_answer").attr('src', '../img/share/' + num_img + '.png');
				$("#shareToFriend").css('display', 'none');
				$("#ido").css('display', 'none');
				$("#share").css('display', 'block');
			} else {
				alert('获取用户信息失败，请稍后再试');
				$("#ido").css('display', 'none');
				$("#shareToFriend").css('display', 'none');
				$("#share").css('display', 'block');
			}
			data = JSON.stringify(data);
			mui.alert(data);
		}, 'json');
	}
}*/