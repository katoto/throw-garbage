import { handleUserActionData } from '../utils/fuc.js'
const conf = require('../utils/conf.js')
const {request} = require('../utils/request.js')

function order(){
  var postData = {
    "method": "getLable",
      "data": handleUserActionData({}, 'customer')
  }
  let url = conf.api_url + 'getData'
  return request({
    url,
    method: 'post',
    data : postData
  })
}

function tousu(){
  var postData = {
    "method": "complaintsLable",
    "data":{}
  }
  let url = conf.api_url + 'getData'
  return request({
    url,
    method: 'post',
    data : postData
  })
}

module.exports = {
  order,
  tousu
}