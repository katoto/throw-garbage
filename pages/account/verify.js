// pages/order/index.js
var { mixin } = require('../../utils/fuc.js');
var myBehavior = require('../../minxin/func.js')
var utils = require('../../utils/fuc.js');

const app = getApp()
const api = require('../../api/index.js');

Page(mixin(myBehavior, {

    /**
     * 页面的初始数据
     */
    data: {

    },


    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        if (this.checkUserLogin()) {
            this.getUserInfo();
        }
    },
    getUserInfo: function () {
        api.user.info({ "type": 'worker' }).then(res => {
            // ?? 需要全局bind ?
            // app.globalData.nowUser.bind = res.bind.toUpperCase();
        })
    },

}))