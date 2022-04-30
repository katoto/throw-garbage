import { handleUserActionData } from '../utils/fuc.js'
const conf = require('../utils/conf.js')
const { request } = require('../utils/request.js')

function login(data) {
    var postData = {
        "method": "saveUser",
        "data": data
    }
    let url = conf.api_url + 'updateData'
    return request({
        url,
        method: 'post',
        data: postData
    }, '加载中')
}
//用户信息
//{"openId":openId}
function info(data, loading = false) {
    var postData = {
        "method": "getUser",
        "data": data
    }
    let url = conf.api_url + 'getData'
    return request({
        url,
        method: 'post',
        data: postData
    }, loading)
}
//绑定信息
function bind(data, loading = false) {
    var postData = {
        "method": "bindUser",
        "data": handleUserActionData(data, 'worker')
    }
    let url = conf.api_url + 'updateData'
    return request({
        url,
        method: 'post',
        data: postData
    }, loading)
}

//获取banner
function getBanner(data, loading = false) {
    var postData = {
        "method": "getBannerListByOrderAddr"
    }
    let url = conf.api_url + 'getData'
    return request({
        url,
        method: 'post',
        data: postData
    }, loading)
}


module.exports = {
    login,
    info,
    bind,
    getBanner
}