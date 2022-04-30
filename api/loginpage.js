const conf = require("../utils/conf.js");
const { request } = require("../utils/request.js");

function add(data) {
    var postData = {
        method: "createOrder",
        data: data,
    };
    let url = conf.api_url + "sendOrder";
    return request({
        url,
        method: "post",
        data: postData,
    });
}
//订单列表
//{	"type": "W"}
function roblist() {
    var postData = {
        method: "getPackageList",
        data: {},
    };
    let url = conf.api_url + "getData";
    return request(
        {
            url,
            method: "post",
            data: postData,
        },
        "加载中"
    );
}
//订单列表
//{	"type": "W"}
function list(data) {
    var postData = {
        method: "getOrdersList",
        data: data,
    };
    let url = conf.api_url + "getData";
    return request(
        {
            url,
            method: "post",
            data: postData,
        },
        "加载中"
    );
}
//可抢订单数
//{"openId": "sfasdf"}
function robNum(data) {
    var postData = {
        method: "getWaitOrdersCount",
        data: data,
    };
    let url = conf.api_url + "getData";
    return request({
        url,
        method: "post",
        data: postData,
    });
}

// code 尝试登陆
function code2Login(data) {
    let postData = {
        method: "login",
        data: data,
    };
    let url = conf.api_url + "getData";
    return request({
        url,
        method: "post",
        data: postData,
    }, '登录中');
}

function checkIsLogin(data) {
    let postData = {
        method: "checkLogin",
        data: data,
    };
    let url = conf.api_url + "getData";
    return request({
        url,
        method: "post",
        data: postData,
    });
}
// 没有类型
function doRegister(data) {
    let postData = {
        method: "saveUser",
        data: data,
    };
    let url = conf.api_url + "updateData";
    return request({
        url,
        method: "post",
        data: postData,
    }, '登录中');
}

module.exports = {
    add,
    list,
    robNum,
    roblist,
    code2Login,
    checkIsLogin,
    doRegister
};
