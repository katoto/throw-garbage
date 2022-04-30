var { mixin } = require('../../utils/fuc.js');
var myBehavior = require('../../minxin/func.js')
var utils = require('../../utils/fuc.js');

const app = getApp();
const api = require('../../api/index.js');

Page(mixin(myBehavior, {
    /**
     * 页面的初始数据
     */
    data: {
        amount: null,
        type: 'customer',
        swiperList: utils.cache("banner").atmServer,
        distinctServer: utils.cache("banner").distinctServer
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let _type = 'customer'
        if (options && options.type === 'worker') {
            _type = 'worker'
        }
        this.setData({
            type: _type
        })
        app.getOpenId(() => {
            api.user.info({ "type": _type }).then(res => {
                let { amount } = res
                this.setData({
                    amount: this.fnum(amount || 0),
                })
            });
        });
    },
    fnum: function (num) {
        return utils.formatNum(num)
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
    },

    toAtm: function (e) {
        wx.showToast({
            title: '敬请期待',
            icon: 'none'
        })
    }
}))