//index.js
const app = getApp()
const api = require('../../api/index.js');
var utils = require('../../utils/fuc.js');
Page({
    data: {
        isCheck: false,
        bind: 'N'
    },
    toXieyi: function () {
        utils.navigateTo('/pages/h5/xieyi')
    },
    setRadio: function () {
        let isCheck = this.data.isCheck ? false : true
        this.setData({
            isCheck
        })
    },
    onLoad: function () {

        let userType = utils.cache('userType');
        if (userType == 'worker') {
            return utils.redirectTo('/pages/account/index');
        }
        if (userType == 'customer') {
            utils.redirectTo('/pages/order/index');
        }

        // 获取用户信息
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                        success: res => {
                            app.globalData.nowUser = res.userInfo;
                            app.globalData.nowUser.openId = app.globalData.openId;
                        }
                    })
                }
            }
        })

        app.getOpenId(openid => {
            api.user.info({ "openId": openid }, '加载中').then(data => {
                app.globalData.nowUser.bind = data.bind.toUpperCase();
                console.log(data)
                this.setData({
                    bind: data.bind
                })
            })
        })

    },

    userInfoHandler: function (e) {
        if (!this.data.isCheck) {
            wx.showToast({
                title: '请同意《法律声明及隐私协议》',
                icon: 'none',
                duration: 2000
            })
            return false;
        }
        if (app.globalData.nowUser == null && e.detail.userInfo) {
            console.log("userInfoHandler", e.detail.userInfo);
            app.globalData.nowUser = e.detail.userInfo;
            app.globalData.nowUser.openId = app.globalData.openId;
        }
        app.globalData.nowUser.type = 'customer';
        let nowUser = app.globalData.nowUser;
        nowUser.openId = app.globalData.openId;
        api.user.login(nowUser).then((res) => {

            utils.cache('userType', 'customer');
            wx.redirectTo({
                url: '../order/index',
            })
        })
            .catch((err) => {
                console.log(err);
                wx.showToast({
                    title: err.msg || err.errMsg,
                    icon: 'none',
                    duration: 2000
                })
            });
    },
    userInfoHandler2: function (e) {
        var that = this;
        if (!this.data.isCheck) {
            wx.showToast({
                title: '请同意《法律声明及隐私协议》',
                icon: 'none',
                duration: 2000
            })
            return false;
        }
        if (app.globalData.nowUser == null && e.detail.userInfo) {
            console.log("userInfoHandler2", e.detail.userInfo);
            app.globalData.nowUser = e.detail.userInfo;
            app.globalData.nowUser.openId = app.globalData.openId;
        }
        app.globalData.nowUser.type = 'worker';
        let nowUser = app.globalData.nowUser;
        nowUser.openId = app.globalData.openId;
        api.user.login(nowUser).then((res) => {

            if (that.data.bind == 'Y') {
                utils.cache('userType', 'worker');
                wx.redirectTo({
                    url: '../account/index',
                })
            } else if (that.data.bind == 'W') {
                wx.navigateTo({
                    url: '../account/verify',
                })
            } else {
                wx.navigateTo({
                    url: '../form/bind',
                })
            }

        })
            .catch((err) => {
                wx.showToast({
                    title: err.msg || err.errMsg,
                    icon: 'none',
                    duration: 2000
                })
            });
    }

})
