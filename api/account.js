import { handleUserActionData } from '../utils/fuc.js'
const conf = require('../utils/conf.js')
const { request } = require('../utils/request.js')

//可抢订单数
function robNum(data) {
    var postData = {
        "method": "getWaitOrdersCount",
        "data": handleUserActionData(data, 'worker')
    }
    let url = conf.api_url + 'getData'
    return request({
        url,
        method: 'post',
        data: postData
    })
}

module.exports = {
    robNum,
}