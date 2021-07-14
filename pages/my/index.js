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
        version: "1.1.4"
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        let account = wx.getAccountInfoSync();
        let version = account.miniProgram.version
        this.setData({
            version : version || "1.1.6"
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        console.log('--------my/index.js----', app)
        this.setData({
            n_userLogin: this.checkUserLogin()
        })
    },

    //牛逼的思路 牛逼的操作
    //根据用户类型获取未操作订单，（用户类型随意）
    //获取到的订单想怎么操作都行。。。哪怕用循环一个一个取消 
    //取消返回？ 暂时全成功吧....
    doCancel: function () {
        let openId = app.openId();
        let userType = utils.cache('userType') || 'customer';
        api.order.weiquxiao({ openId, type: userType }).then(orders => {
            console.log('orders', orders)
            if (orders.length == 0) {
                wx.showToast({
                    title: '暂无进行中的订单',
                    icon: 'none'
                })
            } else {
                wx.showModal({
                    title: '提示',
                    content: '确定取消全部进行中的订单？',
                    success(res) {
                        if (res.confirm) {
                            for (let index = 0; index < orders.length; index++) {
                                api.order.quxiao({ orderId: orders[index].orderId, openId, type: userType })
                            }
                            wx.showToast({
                                title: '订单取消成功',
                                icon: 'none'
                            })
                        } else if (res.cancel) {
                            console.log('用户点击取消')
                        }
                    }
                })
            }
        }).catch(err => {
            wx.showToast({
                title: '服务器异常，请稍后重试',
                icon: 'none'
            })
        })
    },
    // 去丢垃圾
    goThrottle() {
        if (!this.data.n_userLogin) {
            this.showLoginBox()
            return false;
        }
        utils.openPageByType('mini://pages/my/ordercancel?type=customer')
    },
    // 去取垃圾
    goCollect() {
        if (!this.data.n_userLogin) {
            this.showLoginBox()
            return false;
        }
        utils.openPageByType('mini://pages/my/getOrderList?type=worker')
    },
    logout() {
        let _this = this
        if (!this.checkUserLogin()) {
            utils.toast('还未登录')
            return;
        }
        wx.showModal({
            title: '提示',
            content: '确定退出账号？',
            success(res) {
                if (res.confirm) {
                    app.globalData.nowUser = null;
                    app.globalData.autoLogin = false;
                    utils.cache('autoLogin', 0);
                    utils.cache('showTip', true);
                    utils.cache('userType', '');
                    api.order.logout({})
                    utils.cache('sessionId', '');
                    _this.setGlobalData('logout');
                    utils.toHome();
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },
    setGlobalData(params = 'logout') {
        if (params !== 'logout') {
            // 登录
            app.globalData.userType = 'user'
            app.globalData.isLogin = '0'
        } else {
            // 未登录
            app.globalData.userType = 'visitor'
            app.globalData.isLogin = '1'
        }
    },
}))