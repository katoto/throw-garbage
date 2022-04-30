const conf = require('../utils/conf.js')

function up(file){
  return new Promise((res, rej) => {
    wx.uploadFile({
      url: conf.up_url,      //此处换上你的接口地址
      filePath: file,
      name: 'file',
      header: {  
        "Content-Type": "multipart/form-data",
        'accept': 'application/json',
      },
      success: function(result){
        let fileResult = JSON.parse(result.data);
        res(fileResult);
      },
      fail: function(res){
        rej(res)
      },
    })
})
}

module.exports = {
  up
}