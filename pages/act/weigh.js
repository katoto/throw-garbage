const { mixin, cache, openPageByType, toast } = require('../../utils/fuc.js');
const { env_version } = require('../../utils/conf.js')
var myBehavior = require('../../minxin/func.js')
// 蓝牙相关数据
let blueBehavior = require('../../minxin/blue.js')
const cacheKey = 'collectNFCid'
const api = require("../../api/index.js");

Page(mixin(myBehavior, blueBehavior, {
    /**
     * 页面的初始数据
     */
    data: {
        oid: '',
        blueWeightArr: [], // 蓝牙数据 ,
        uploadImag: null,
        uploadId: null,
        activeId: null,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            oid: options.oid
        })
        // 安卓下部分机型需要有位置权限才能搜索到设备，需留意是否开启了位置权限
        wx.getLocation({
            type: 'wgs84',
            success() { }
        })
        // 蓝牙默认不打开
        // this.openBluetoothAdapter()
        let collectId = cache(cacheKey);
    },
    doConnect() {
        if(!this.data.activeId) return wx.showToast({
          title: '请选择厨余垃圾分类',
          icon: "none"
        })
        if(!this.data.uploadId) return wx.showToast({
          title: '请上传拍摄照片',
          icon: "none"
        });
        this.openBluetoothAdapter && this.openBluetoothAdapter()
    },
    goTestFn() {
        if (env_version === 'develop') {
            cache('j_weigh', [JSON.stringify({ w: "0", i: "0", s: "1" })])
            openPageByType('mini://pages/act/place/place?oid=' + this.data.oid, {
                linkType: 'redirect'
            })
        }
    },

    weighOk() {
        // 称重ok
        const that = this;
        const weightData = this.data.blueWeightArr.map(item =>{
            let val = JSON.parse(item);
            return val;
        })
        const found =  weightData.filter(item => item.w > 0);
        if(!found || found.length == 0) {
            return wx.showModal({
                title:"没有检测到重量,请重新点击称重,在放桶",
                showCancel: false
            })
        }
        let wei = found[found.length - 1];
        if(this.data.activeId != 1) {
           let status = weightData.find(item => item.s == "1");
           wei.s = status ? "1" : "0";
        }else wei.s = "1";
        wei.fileId = that.data.uploadId;
        wei.i = JSON.stringify(wei.i);
        wei.w = JSON.stringify(wei.w);
        wx.showModal({
            title:"称重成功",
            showCancel: false,
            success (res) {
                if (res.confirm) {
                    cache('j_weigh', wei)
                    toast('餐厨垃圾称重成功')
                    openPageByType('mini://pages/act/place/place?oid=' + that.data.oid, {
                        linkType: 'redirect'
                    })
                } 
            }
        })
    },

    switchBtn(e) {
        let activeId = e.currentTarget.dataset.id;
        this.setData({activeId})
    },
    uploadPictures() {
        wx.chooseImage({
            count: 1,
            sizeType: ["original", "compressed"], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ["camera"], // 可以指定来源是相册还是相机
            success: (res) => {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                api.file
                    .up(res.tempFilePaths[0])
                    .then((rs) => {
                        console.log("up", rs);
                        let uploadImag = rs.data.fileUrl + ".png";
                        this.setData({
                            uploadImag,
                            uploadId : rs.data.id
                        })
                    })
                    .catch((err) => {
                        console.log("uperror", err);
                        wx.showToast({
                            title: err.msg || "上传失败",
                            icon: "none",
                            duration: 2000,
                        });
                    });
            },
        });
    },
}))