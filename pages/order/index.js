var {
    mixin
} = require("../../utils/fuc.js");
var myBehavior = require("../../minxin/func.js");
const utils = require("../../utils/fuc.js");

const app = getApp() , adConfig = app.require("utils/adConfig");
const api = require("../../api/index.js");
const msgTempId = ['Hiir7mE7qPhb7Zk029NyoasMmvqsGlk2fWQbnRmQGw0', 'ovtzX9vUcTo4o0hPKRowULLuSSVww3e4YAhOtdT_GC4', 'nQGN2OaiDuKnK_C73_VOxJkGcRQSexwIiF1gIz8xLn4']

Page(
    mixin(myBehavior, {
        /**
         * 页面的初始数据
         */
        data: {
            hideLogin: true,
            userLogin: false,
            nowUser: null,
            tempUserType: "customer",
            userType: "customer",
            reward: "0.00",
            amount: "0.00",
            withhold: "0.00",
            n_userLogin: false, // 未登录
            homeServer: adConfig.homeServer
        },
        /**
         * 生命周期函数--监听页面加载
         */
        onLoad: function (options) {
            // var that = this;
            //不存在类型的时候跳转到选择页面
            app.handleLogin().then(() => {
                console.log('--------order/index.js 是否登录----', this.checkUserLogin())
                this.setData({
                    n_userLogin: this.checkUserLogin()
                })
            })
        },

        fnum: function (num) {
            return utils.formatNum(num);
        },

        /**
         * 生命周期函数--监听页面显示
         */
        onShow: function () {
            // 切换tabs 检查登录态
            this.setData({
                n_userLogin: this.checkUserLogin()
            })
            console.log('-----order index show start---')
        },

        actAddOrder(e) {
            //没有登录 直接去下单页面
            if (!this.checkUserLogin()) {
                this.gotoAddOrder();
                return false;
            }
            // 走订阅
            this.doSubMsg();
        },
        checkLoginHandle() {
            if (!this.checkUserLogin()) {
                this.showLoginBox()
                return true;
            }
        },
        loginGoto(e) {
            if (!this.checkUserLogin()) {
                this.showLoginBox()
                return true;
            }
            this.goto(e);
        },
        getNoCommentOrder() {
            let that = this;
            // todo
            // api.order.noPj({}, "加载中").then((res) => {
            // 修改检查是否有评论接口 接口网关层格式再约定
            api.order.isCommented({}, {
                success() { }
            }).then((res) => {
                //没订单直接去下单  有订单跳转到评论页
                if (res && res.errcode !== undefined && res.errcode === 1) {
                    return that.gotoAddOrder();
                } else {
                    utils.openPageByType('mini://pages/form/comment', {
                        linkType: 'redirect'
                    })
                }
                utils.openPageByType('mini://pages/form/comment', {
                    linkType: 'redirect'
                })
            });
        },
        goUserCenter() {
            utils.openPageByType('mini://pages/my/index')
        },
        // 订阅消息
        doSubMsg() {
            let _that = this;
            wx.requestSubscribeMessage({
                tmplIds: msgTempId,
                success: (res) => {
                    if (res['Hiir7mE7qPhb7Zk029NyoWAxDqr2IDK0O93rG_Zycb4'] === 'accept') {
                        console.log("接受下单订阅消息")
                    } else if (res['UxNdeL8j7hUnosjh-2bfCI1aGuaayjzsRJJZ4nMv6Vc'] === 'accept') {
                        console.log("接受完成订单消息")
                    }
                },
                complete() {
                    // 跳下单
                    _that.getNoCommentOrder();
                }
            })
        },
        handleContact() {
            // 机器交互
        },

        videometa: function (e) {
            var that = this;
            //获取系统信息
            wx.getSystemInfo({
                success(res) {
                    //视频的高
                    var height = e.detail.height;

                    //视频的宽
                    var width = e.detail.width;

                    //算出视频的比例
                    var proportion = height / width;

                    //res.windowWidth为手机屏幕的宽。
                    var windowWidth = res.windowWidth;

                    //算出当前宽度下高度的数值
                    height = proportion * windowWidth;
                    that.setData({
                        height,
                        width: windowWidth
                    });
                }
            })
        },
        //设置允许“发送给朋友”
        onShareAppMessage: function () {
            return {
                title: '小程序推荐'
            }
        },
        onShareTimeline: function () {
            return {
                // title:'转发到朋友圈', //自定义标题，即朋友圈列表页上显示的标题  默认当前小程序名称
            }
        }
    })
);