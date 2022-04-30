import { handleUserActionData } from '../utils/fuc.js'
const conf = require('../utils/conf.js')
const { request } = require('../utils/request.js')

/**
 *  新修改 取桶之前 2021-06-03
 */
function getAddrBucketInfo(data) {
    var postData = {
        "method": "getAddrBucketInfo",
        "data": data
    }
    let url = conf.api_url + 'getData'
    return request({
        url,
        method: 'post',
        data: postData
    })
}

function getBucketInfo(data) {
    var postData = {
        "method": "getBucketInfo",
        "data": data
    }
    let url = conf.api_url + 'getData'
    return request({
        url,
        method: 'post',
        data: postData
    })
}

function rebindCustomerBucket(data = {}, options = {}) {
    var postData = {
        "method": "rebindCustomerBucket",
        "data": data
    }
    let url = conf.api_url + 'updateData'
    return request({
        url,
        method: 'post',
        data: postData,
        ...options
    })
}


/**
 *  新修改 查询该芯片是否已绑定地址 2021-06-03
 */
function queryIcCodeBindStatus(data = {}, options = {}) {
    var postData = {
        "method": "queryIcCodeBindStatus",
        "data": data
    }
    let url = conf.api_url + 'updateData'
    return request({
        url,
        method: 'post',
        data: postData,
        ...options
    })
}

module.exports = {
    getBucketInfo,
    rebindCustomerBucket,
    getAddrBucketInfo,
    queryIcCodeBindStatus
}