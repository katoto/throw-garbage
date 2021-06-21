// pages/order/index.js
var { mixin } = require("../../utils/fuc.js");
var myBehavior = require("../../minxin/func.js");
var utils = require("../../utils/fuc.js");

const app = getApp();
const api = require("../../api/index.js");
let beforeSession = ''

Page(
    mixin(myBehavior, {
        /**
         * 页面的初始数据
         */
        data: {
            // openType: "getUserInfo", // getUserInfo getPhoneNumber
            openType: "userProfile", // userProfile getPhoneNumber
            showLoginbtn: true,
            loginProtolAgree: true // 控制协议
        },
        /**
         * 生命周期函数--监听页面显示
         */
        onShow() {
            this.init();
        },
        // =================
        async phoneHandler(e) {
            if (!this.data.loginProtolAgree) {
                utils.toast('请勾选协议')
                return false
            }
            if (e && e.detail && e.detail.encryptedData) {
                // 拿到手机信息 请求接口 然后登陆
                this.doRegister(Object.assign(global.wxUserInfo, {
                    mobile: {
                        encryptedData: e.detail.encryptedData,
                        iv: e.detail.iv,
                    },
                    sessionId: beforeSession
                }))
            } else {
                utils.toast(e.detail.errMsg);
                return;
            }
        },
        async userInfoHandler(e) {
            let that = this;
            if (!this.data.loginProtolAgree) {
                utils.toast('请勾选协议')
                return false
            }
            if (this.data.openType === "userProfile") {
                wx.getUserProfile({
                    desc: "获取用户信息",
                    success(e) {
                        if (e && e.encryptedData) {
                            // 拿到手机信息 请求接口 然后登陆
                            that.doUserInfoAfter(e);
                            that.setData({
                                openType: "getPhoneNumber",
                            });
                        } else {
                            utils.toast(e.errMsg);
                            return;
                        }
                    },
                });
            }
        },
        async init() {
            // '1'代表未登录
            console.log('=======login page1=============')
            if (!this.checkUserLogin()) {
                // 缺个检查是否已绑定信息，之前是通过wx.getSetting 查询是否已授权过做判断。
                let userState = await this.zg_checkUserState()
                if(!userState){
                    // 未绑定
                    this.setData({
                        showLoginbtn: false
                    })
                } else {
                    // 已绑定，直接登录
                }
            }
        },
        async doUserInfoAfter(_wxUserInfo) {
            global.wxUserInfo = _wxUserInfo.userInfo
        },
        doRegister(data) {
            // 进行注册操作 todo 登录成功的返回标志
            api.loginpage.doRegister(data).then((res) => {
                setTimeout(() => {
                    this.setGlobalData('login')
                    utils.cache("sessionId", beforeSession)
                    if(getCurrentPages().length > 1){
                        utils.route('back')
                    } else {
                        utils.redirectTo('/pages/order/index');
                    }
                    
                }, 100)
            });
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
        toXieyi() {
            // 调整协议
            utils.openPageByType('mini://pages/h5/xieyi')
        },

        changeCheckbox() {
            this.setData({
                loginProtolAgree: !this.data.loginProtolAgree
            })
        },
        async loginBtnFn() {
            if (!this.data.loginProtolAgree) {
                utils.toast('请勾选协议')
                return false
            }
            let _userId = await this.zg_doLogin()
            if (_userId) {
                this.setGlobalData('login')
                if(getCurrentPages().length > 1){
                    utils.route('back')
                } else {
                    utils.redirectTo('/pages/order/index');
                }

                return true
            }
        },
        async zg_doLogin() {
            // 登录操作
            let { code } = await utils.wxAPIPromise('login')
            return api.loginpage.code2Login({ code }).then((res) => {
                if (res.sessionId) {
                    utils.cache("sessionId", res.sessionId)
                }
                return res.hasMobile
            }).catch(() => {
                utils.toast('登录失败，请重试~')
                console.error('====zg_doLogin error====')
            })
        },

        async zg_checkUserState() {
            // 检查是否绑定信息
            let { code } = await utils.wxAPIPromise('login')
            return api.loginpage.code2Login({ code }).then((res) => {
                if(res.sessionId){
                    beforeSession = res.sessionId
                }
                if (res.hasMobile) {
                    return res.hasMobile
                }
                return false
            }).catch(() => {
                utils.toast('检查状态失败~')
                console.error('====checkUserState error====')
            })
        },
        async checkAuthorize() {
            return new Promise(async (resolve) => {
                let res = await utils.wxAPIPromise("getSetting");
                if (res && res.authSetting && res.authSetting["scope.userInfo"]) {
                    resolve(true)
                    return true;
                }
                resolve(false)
                return false;
            })
        },
    })
);
