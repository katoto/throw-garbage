//behavior.js
const utils = require('../utils/fuc.js');
const app = getApp();
const api = require("../api/index.js");

module.exports = {
    goto(e) {
        let url = e.currentTarget.dataset.url;
        url && utils.navigateTo(url);
    },
    redir(e) {
        let url = e.currentTarget.dataset.url;
        url && utils.redirectTo(url);
    },
    gotoAddOrder() {
        wx.navigateTo({
            url: '/pages/form/order',
        })
    },
    callPhone(e) {
        console.log(e);
        let tel = e.currentTarget.dataset.tel;
        tel && wx.makePhoneCall({
            phoneNumber: tel,
        })
    },
    hideLoginBox: function (e) {
        setTimeout(() => {
            this.setData({
                hideLogin: true
            })
        }, 500);
    },
    showLoginBox() {
        utils.openPageByType('mini://pages/loginpage/index')
    },
    checkUserLogin() {
        // 有userType user  visitor console.log('do checkUserlogin -------') // '0' 登陆 '1' 未登陆
        return app.globalData.userType === 'user' || app.globalData.isLogin === '0'
    },
}