//app.js
const utils = require("./utils/fuc");
const api = require("./api/index.js");

const USER_TYPE = { //当前用户类型
    visitor: 'visitor', //游客
    user: 'user', //用户
}

// 需要统计时长的页面路由
global.tracksPages = ['pages/order/index', 'pages/account/index', 'pages/my/index']

// ------- 页面时长统计start --------
const originPage = Page
Page = (page) => {
    const { tracksPages } = global;
    let originOnShowMethod = page["onShow"] || function () { };
    page["onShow"] = function (options) {
        const pageObj = getCurrentPages();
        const { route } = pageObj[pageObj.length - 1];
        if (route && tracksPages.indexOf(route) >= 0 && !page.can_track) {
            //开始计时
            page.start_time = new Date().getTime();
            page.can_track = true;
        }
        originOnShowMethod.call(this, options);
    };
    let originOnHideMethod = page["onHide"] || function () { };
    page["onHide"] = function (options) {
        let pageObj = getCurrentPages();
        const { route } = pageObj[pageObj.length - 1];
        //停止计时
        if (route && tracksPages.indexOf(route) >= 0 && page.can_track) {
            page.can_track = false;
            const page_stay_time = (new Date().getTime() - page.start_time) / 1000;
        }
        originOnHideMethod.call(this, options);
    };
    return originPage(page)
}
// ------- 页面时长统计 end ---------
// isLogin  '0' 登陆 '1' 未登陆
App({
    data: {
        adBanner: {},
        defaultReviewType: [
            {
                id: 0,
                val: "桶干净完好",
            },
            {
                id: 1,
                val: "地面整洁好",
            },
            {
                id: 2,
                val: "桶放置得当",
            },
            {
                id: 3,
                val: "桶污渍破损",
            },
            {
                id: 4,
                val: "地面脏乱差",
            },
            {
                id: 5,
                val: "桶放置太远",
            },
        ]
    },

    onLaunch: function () {
        if (!wx.cloud) {
            console.error("请使用 2.2.3 或以上的基础库以使用云能力");
        } else {
            wx.cloud.init({
                // env 参数说明：
                //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
                //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
                //   如不填则使用默认环境（第一个创建的环境）
                // env: 'my-env-id',
                traceUser: true,
            });
        }
        this.getSystemInfo(); //获取手机机型
        this.checkUpdateVersion(); // 版本更新升级提醒
        this.globalData.autoLogin = utils.cache("autoLogin") || false;
        this.globalData.nowUser = null;
        this.handleLogin(); //初始化是否登录
    },
    async handleLogin() {
        return new Promise(async (resolve) => {
            let _logState = await this.zg_checkIsLogin();
            if (!_logState || _logState === '1') {
                this.setGlobalData('logout')
            } else if (_logState === '0') {
                // 已登录用户
                this.setGlobalData('login')
            }
            resolve(true)
        })
    },
    zg_checkIsLogin() {
        // checkIsLogin
        return api.loginpage.checkIsLogin({}).then((res) => {
            // status === '0' 登陆 || status === '1' 未登录
            if (res && res.status !== null && res.status !== undefined) {
                this.globalData.isLogin = res.status;
            } else {
                this.globalData.isLogin = '1'
            }
            return this.globalData.isLogin
        });
    },

    setGlobalData(params = 'logout') {
        if (params === 'login') {
            // 登录
            this.globalData.userType = USER_TYPE['user']
            this.globalData.isLogin = '0'
        } else {
            // 未登录
            this.globalData.userType = USER_TYPE['visitor']
            this.globalData.isLogin = '1'
        }
    },

    openId: function () {
        return this.globalData.openId;
    },
    getOpenId: function (cb) {
        if (this.globalData.openId) {
            cb && cb(this.globalData.openId);
            return;
        }
        // 调用云函数
        wx.cloud.callFunction({
            name: "getOpenId",
            data: {},
            success: (res) => {
                this.globalData.openId = res.result.openid;
                cb && cb(res.result.openid);
            },
            fail: (err) => {
                console.error("[云函数] [login] 调用失败", err);
            },
        });
    },
    getUserInfio: function (cb) {
        // 获取用户信息
        wx.getSetting({
            success: (res) => {
                if (res.authSetting["scope.userInfo"]) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                        success: (res) => {
                            this.globalData.nowUser = res.userInfo;
                            this.globalData.nowUser.openId = this.globalData.openId;
                            //获取用户信息
                            cb && cb(this.globalData.nowUser);
                            // that.getUser();
                        },
                    });
                }
            },
            fail: (err) => {
                console.log("wx getUserInfio fail", err);
            },
        });
    },
    cache: function (key, val) {
        return utils.gxcache(key, val);
    },

    //微信提示
    showModal: (text, succ) => {
        wx.showModal({
            title: text,
            showCancel: false,
            mask: true,
            success(res) {
                return succ(res)
            }
        })
    },

    //封装require 搜索
    require(url) {
        return require('./' + url + ".js");
    },

    // 封装选中底部tab栏
    editTabbar: function () {
        this.hidetabbar();
        let tabbar = this.globalData.tabBar;
        let currentPages = getCurrentPages();
        let _this = currentPages[currentPages.length - 1];
        let pagePath = _this.route;
        (pagePath.indexOf('/') != 0) && (pagePath = '/' + pagePath);
        for (let i in tabbar.list) {
            tabbar.list[i].selected = false;
            (tabbar.list[i].pagePath == pagePath) && (tabbar.list[i].selected = true);
        }
        _this.setData({
            tabbar: tabbar
        });
    },

    // 封装选中底部tab栏
    globalData: {
        systemInfo: null, //客户端设备信息
        openId: null,
        tabBar: {
            "backgroundColor": "#F5F8F4",
            "color": "#999999",
            "selectedColor": "#46B157",
            "list": [{
                "pagePath": "/pages/order/index",
                "iconPath": "/images/bar/icon_dlj_pre.png",
                "selectedIconPath": "/images/bar/icon_dlj_pre.png",
                "text": "丢垃圾"
            },
            {
                "pagePath": "/pages/account/index",
                "iconPath": "/images/bar/icon_qlj_pre.png",
                "selectedIconPath": "/images/bar/icon_qlj_pre.png",
                "text": "取垃圾"
            },
            {
                "pagePath": "/pages/my/index",
                "iconPath": "/images/bar/icon_khzx_pre.png",
                "selectedIconPath": "/images/bar/icon_khzx_pre.png",
                "text": "客户中心"
            }]
        },
    },

    //自己对wx.hideTabBar的一个封装 隐藏原先tabbar
    hidetabbar() {
        wx.hideTabBar({
            fail: function () {
                setTimeout(function () { // 做了个延时重试一次，作为保底。
                    wx.hideTabBar()
                }, 500)
            }
        });
    },

    // 适配iphoneX 机型
    getSystemInfo: function () {
        let t = this;
        wx.getSystemInfo({
            success: function (res) {
                t.globalData.systemInfo = res;
                t.globalData.statusBarHeight = res.statusBarHeight;
                t.globalData.titleBarHeight = wx.getMenuButtonBoundingClientRect().bottom + wx.getMenuButtonBoundingClientRect().top - (res.statusBarHeight * 2);
            },
            failure() {
                this.globalData.statusBarHeight = 0
                this.globalData.titleBarHeight = 0
            }
        });
    },

    // 小程序检测更新
    checkUpdateVersion() {
        //判断微信版本是否 兼容小程序更新机制API的使用
        if (wx.canIUse('getUpdateManager')) {
            //创建 UpdateManager 实例
            const updateManager = wx.getUpdateManager();
            //检测版本更新
            updateManager.onCheckForUpdate(function (res) {
                // 请求完新版本信息的回调
                if (res.hasUpdate) {
                    //监听小程序有版本更新事件
                    updateManager.onUpdateReady(function () {
                        //TODO 新的版本已经下载好，调用 applyUpdate 应用新版本并重启 （ 此处进行了自动更新操作）
                        updateManager.applyUpdate();
                    })
                    updateManager.onUpdateFailed(function () {
                        // 新版本下载失败
                        wx.showModal({
                            title: '已经有新版本喽~',
                            content: '请您删除当前小程序，到微信 “发现-小程序” 页，重新搜索打开哦~',
                        })
                    })
                }
            })
        } else {
            //TODO 此时微信版本太低（一般而言版本都是支持的）
            wx.showModal({
                title: '溫馨提示',
                content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
            })
        }
    },

});
