const { map_key,up_url } = require('../../utils/conf.js')
const utils = require('../../utils/fuc.js')
var QQMapWX = require('../../lib/qqmap-wx-jssdk.min.js');
var qqmapsdk;

const app = getApp()
const api =  require('../../api/index.js');


Page({
  data: {
    files:[],
    time: '00:00',
    time2: '03:00',
    region: ['广东省', '深圳市', ''],
    customItem: '',
    tel:''
  },
  
  bindTimeChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      time: e.detail.value
    })
  },
  bindTimeChange2: function(e) {
    console.log('picker2发送选择改变，携带值为', e.detail.value)
    this.setData({
      time2: e.detail.value
    })
  },
  bindRegionChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      region: e.detail.value
    })
  },
  onReady:function(){
    const _this = this;
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        const latitude = res.latitude
        const longitude = res.longitude
        console.log(latitude,longitude)
        _this.getAddr({latitude,longitude})
      }
    })
  },
  onLoad() {

    //电话
    api.contact.info().then(res=>{
      console.log(res)
      this.setData({
        tel:res.phone
      })
    })

     // 实例化API核心类
     qqmapsdk = new QQMapWX({
      key: map_key
  });

    this.setData({
        selectFile: this.selectFile.bind(this),
        uplaodFile: this.uplaodFile.bind(this)
    })
},
getAddr:function(addr){
  var _this = this;
  // location: {
  //   latitude: 39.984060,
  //   longitude: 116.307520
  // },
  qqmapsdk.reverseGeocoder({
    location:addr || '',
    success: function(res) {//成功后的回调
        let {province,city,district} = res.result.address_component;
        let addrArry = [province,city,district];
       _this.setData({ //设置markers属性和地图位置poi，将结果在地图展示
        region:addrArry
       });
    },
    fail: function(error) {
      console.error(error);
    },
    complete: function(res) {
      console.log(res);
    }
  })
},
chooseImage: function (e) {
    var that = this;
    wx.chooseImage({
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
            // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
            that.setData({
                files: that.data.files.concat(res.tempFilePaths)
            });
        }
    })
},
previewImage: function(e){
    wx.previewImage({
        current: e.currentTarget.id, // 当前显示图片的http链接
        urls: this.data.files // 需要预览的图片http链接列表
    })
},
selectFile(files) {
    console.log('files', files)
    // 返回false可以阻止某次文件上传
},
uplaodFile(files) {
    console.log('upload files', files)
    // 文件上传的函数，返回一个promise
    return api.file.up(files.tempFilePaths[0]).then(res=>{
      return Promise.resolve({"urls":[res.data.fileUrl]})
    })
},
uploadError(e) {
    console.log('upload error', e.detail)
},
uploadSuccess(e) {
    console.log('upload success', e.detail)
},
// testup(e){

//   wx.chooseImage({
//     count: 1, // 默认9
//     sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
//     sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
//     success: function (res) {
//       // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
//       var tempFilePaths = res.tempFilePaths;
//       wx.uploadFile({
//         url: up_url,      //此处换上你的接口地址
//         filePath: tempFilePaths[0],
//         name: 'file',
//         header: {  
//           "Content-Type": "multipart/form-data",
//           'accept': 'application/json',
//         },
//         success: function(res){
//           var data=res.data;
//           console.log(res);
//         },
//         fail: function(res){
//           console.log('fail');
//         },
//       })
//     }
//   })

// }
})