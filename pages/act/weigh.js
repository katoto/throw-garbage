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
        console.log(this.data.blueWeightArr)
        let _len = this.data.blueWeightArr.length
        let _lastVal = this.data.blueWeightArr[_len - 1]
        if (_lastVal) {
            let lastValObj = JSON.parse(_lastVal)
            lastValObj.imgId = this.data.activeId;
            lastValObj.i = _lastVal.i == 1 || this.data.uploadId == 1 ? 1 : 0;
            this.data.blueWeightArr.push(JSON.stringify(lastValObj));
        }
        console.log(this.data.blueWeightArr)
        cache('j_weigh', this.data.blueWeightArr)
        toast('餐厨垃圾称重成功')
        openPageByType('mini://pages/act/place/place?oid=' + this.data.oid, {
            linkType: 'redirect'
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