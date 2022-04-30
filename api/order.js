import { handleUserActionData } from '../utils/fuc.js'
const conf = require('../utils/conf.js')
const { request } = require('../utils/request.js')

function buildingList(data) {
    var postData = {
        "method": "buildingList",
        "data": handleUserActionData(data, 'customer')
    }
    let url = conf.api_url + 'getData'
    return request({
        url,
        method: 'post',
        data: postData
    })
}

function getComplaintsOrderList(data) {
    var postData = {
        "method": "getComplaintsOrderList",
        "data": handleUserActionData(data, 'customer')
    }
    let url = conf.api_url + 'getData'
    return request({
        url,
        method: 'post',
        data: postData
    })
}


function add(data) {
    var postData = {
        "method": "createOrder",
        "data": handleUserActionData(data, 'customer')
    }
    let url = conf.api_url + 'sendOrder'
    return request({
        url,
        method: 'post',
        data: postData
    })
}
//订单列表
//{	"type": "W"}
function roblist(data = {}) {
    var postData = {
        "method": "getPackageList",
        "data": handleUserActionData(data, 'worker')
    }
    let url = conf.api_url + 'getData'
    return request({
        url,
        method: 'post',
        data: postData
    }, '加载中')
}

/**
 * 分类清晰icon --> 订单列表
 * 分类清晰、分类异常、投诉
 * @param {*} data 
 * @returns 
 */
//{	"type": "W"}
function noPackageList(data) {
    let postData = {
        "method": "getPackageOrdersList",
        "data": data, // data里含用户类型
    }
    let url = conf.api_url + 'getData'
    return request({
        url,
        method: 'post',
        data: postData
    }, '加载中')
}

function getCollList(data) {
    let postData = {
        "method": "getOrdersList",
        "data": data, // data里含用户类型
    }
    let url = conf.api_url + 'getData'
    return request({
        url,
        method: 'post',
        data: postData
    }, '加载中')
}

/**
 * 分类清晰icon --> 订单列表
 * 分类清晰、分类异常、投诉
 * @param {*} data 
 * @returns 
 */
//{	"type": "W"}

function houseList(data) {
    let postData = {
        "method": "houseList",
        "data": data,
    }
    let url = conf.api_url + 'getData'
    return request({
        url,
        method: 'post',
        data: postData
    }, '加载中')
}

function list(data) {
    let postData = {
        "method": "getPackageOrdersList",
        "data": data, // data里含用户类型
    }
    let url = conf.api_url + 'getData'
    return request({
        url,
        method: 'post',
        data: postData
    }, '加载中')
}
//可抢订单数
//{"openId": "sfasdf"}
function robNum(data) {
    var postData = {
        "method": "getWaitOrdersCount",
        "data": handleUserActionData(data, 'customer')
    }
    let url = conf.api_url + 'getData'
    return request({
        url,
        method: 'post',
        data: postData
    })
}
//抢单（锁单）
// {"orderId": "2c7d8546a327488e962e6c28ec0cb15c"}
function robOrder(data) {
    var postData = {
        "method": "lockOrdersPackage",
        "data": handleUserActionData(data, 'worker')
    }
    let url = conf.api_url + 'sendOrder'
    return request({
        url,
        method: 'post',
        data: postData
    }, '抢单中')
}
//获取待评价订单
function noPj(data) {
    var postData = {
        "method": "getLastsOrders",
        "data": handleUserActionData(data, 'customer')
    }
    let url = conf.api_url + 'getData'
    return request({
        url,
        method: 'post',
        data: postData
    }, '加载中')
}
//是否评价
function isCommented(data, options) {
    var postData = {
        "method": "isCommented",
        "data": handleUserActionData(data, 'worker')
    }
    let url = conf.api_url + 'getData'
    return request({
        url,
        method: 'post',
        data: postData,
        ...options
    }, "加载中")
}
//评价订单
function comment(data, options) {
    var postData = {
        "method": "saveComplaints",
        "data": handleUserActionData(data, 'customer')
    }
    let url = conf.api_url + 'updateData'
    return request({
        url,
        method: 'post',
        data: postData
    }, '数据上传中')
}

// default 评价
function defEvaluate(data) {
    var postData = {
        "method": "defEvaluate",
        "data": data
    }
    let url = conf.api_url + 'sendOrder'
    return request({
        url,
        method: 'post',
        data: postData
    })
}

//完成订单
function finishOrder(data) {
    var postData = {
        "method": "finishOrder",
        "data": data
    }
    let url = conf.api_url + 'sendOrder'
    return request({
        url,
        method: 'post',
        data: postData
    }, '数据上传中')
}
//根据package获取订单
//{"packageId": "","openId": ""}
function listByPackage(data) {
    var postData = {
        "method": "getPackageOrdersList",
        "data": handleUserActionData(data, 'customer')
    }
    let url = conf.api_url + 'getData'
    return request({
        url,
        method: 'post',
        data: postData
    }, '加载中')
}

// 订单列表 取和丢 复用
function getCancelOrders(data) {
    var postData = {
        "method": "getCancelOrders",
        "data": data
    }
    let url = conf.api_url + 'getData'
    return request({
        url,
        method: 'post',
        data: postData
    }, '获取中')
}

function quxiao(data) {
    var postData = {
        "method": "cancelOrder",
        "data": handleUserActionData(data, 'customer')
    }
    let url = conf.api_url + 'sendOrder'
    return request({
        url,
        method: 'post',
        data: postData
    }, '取消中')
}

function quxiaopackage(data) {
    var postData = {
        "method": "cancelPackage",
        "data": handleUserActionData(data, 'worker')
    }
    let url = conf.api_url + 'sendOrder'
    return request({
        url,
        method: 'post',
        data: postData
    }, '取消中')
}

function logout(data) {
    var postData = {
        "method": "logout",
        "data": data
    }
    let url = conf.api_url + 'getData'
    return request({
        url,
        method: 'post',
        data: postData
    })
}

function getOrderInfo(data) {
    var postData = {
        "method": "getOrderInfo",
        "data": data
    }
    let url = conf.api_url + 'sendOrder'
    return request({
        url,
        method: 'post',
        data: postData
    })
}
function checkIsGetTool(data = {}, options = {}) {
    var postData = {
        "method": "getborrowToolInfo",
        "data": data
    }
    let url = conf.api_url + 'getData'
    return request({
        url,
        method: 'post',
        data: postData,
        ...options
    })
}

module.exports = {
    add,
    list,
    robNum,
    robOrder,
    noPj,
    isCommented,
    comment,
    roblist,
    finishOrder,
    listByPackage,
    getCancelOrders,
    quxiao,
    quxiaopackage,
    logout,
    buildingList,
    noPackageList,
    houseList,
    getCollList,
    getOrderInfo,
    checkIsGetTool,
    defEvaluate,
    getComplaintsOrderList
}