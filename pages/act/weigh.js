const { mixin, cache, openPageByType, toast } = require('../../utils/fuc.js');
const { env_version } = require('../../utils/conf.js')
var myBehavior = require('../../minxin/func.js')
// 蓝牙相关数据
let blueBehavior = require('../../minxin/blue.js')
const cacheKey = 'collectNFCid'

Page(mixin(myBehavior, blueBehavior, {
    /**
     * 页面的初始数据
     */
    data: {
        oid: '',
        blueWeightArr: [] // 蓝牙数据 
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
        let collectId = cache(cacheKey)
        console.log('=====weight======')
        console.log(collectId)
    },
    doConnect() {
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
        cache('j_weigh', this.data.blueWeightArr)
        toast('餐厨垃圾称重成功')
        openPageByType('mini://pages/act/place/place?oid=' + this.data.oid, {
            linkType: 'redirect'
        })
    },
}))