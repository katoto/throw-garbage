const conf = require('../utils/conf.js')
const utils = require('../utils/fuc.js')
const {request} = require('../utils/request.js')

function info(){
  let cache = utils.cache('contact')
  if(cache){
    return  new Promise((res, rej) => {
      res(cache);
    })
  }
  var postData = {
    "method": "getContact",
    "data": {}
  }
  let url = conf.api_url + 'getData'
  return request({
    url,
    method: 'post',
    data : postData
  }).then(data=>{
    utils.cache('contact',data)
    return Promise.resolve(data);
  })
}

module.exports = {
  info
}