
var { mixin } = require('../../utils/fuc.js');
var myBehavior = require('../../minxin/func.js')
var utils = require('../../utils/fuc.js');
const api = require('../../api/index.js');
const app = getApp(), adConfig = app.require("utils/adConfig");
// bind  N 未提交  W 审核中 Y 审核通过
Page(mixin(myBehavior, {
    /**
     * 页面的初始数据
     */
    data: {
        robNum: 0,
        bind: 'N',
        complaintsCountOrders: 0,
        waitCountOrders: 0,
        finishCountOrders: 0,
        amount: '0.00',
        n_userLogin: false,
        fetchServer: utils.cache("banner").fetchServer,
        userAvatar: {},
    },
    //获取抢单数
    getRobNum() {
        api.account.robNum({}).then(res => {
            this.setData({
                robNum: res.count
            })
        })
    },
    getUserInfo() {
        api.user.info({ "type": 'worker' }).then(res => {
            let { amount, complaintsCountOrders, lockCountOrders, finishCountOrders } = res;
            this.setData({
                amount: utils.formatNum(amount || 0),
                complaintsCountOrders,
                waitCountOrders: lockCountOrders,
                finishCountOrders,
                bind: res.bind.toUpperCase()
            })
        })
    },


    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        //更改了用户状态
        let _userLog = this.checkUserLogin()
        this.getRobNum()
        if (_userLog) this.getUserInfo()
        this.setData({
            n_userLogin: _userLog,
            userAvatar: utils.cache("userAvatar") || {}
        })
    },

    onLoad() {
        this.getBannerList();
    },
    getBannerList() {
        adConfig.getBannerApi().then(res=>{
            this.setData({
                fetchServer: res.fetchServer,
           })
        });
   },
    gotoGrab() {
        return utils.openPageByType('mini://pages/order/rob', {
            linkType: 'page'
        });
    },
    loginGoto(e) {
        if (!this.checkUserLogin()) {
            this.showLoginBox()
            return true;
        }
        //绑定处理
        if (this.data.bind == 'N') {
            return utils.openPageByType('mini://pages/form/bind');
        }
        if (this.data.bind == 'W') {
            return utils.openPageByType('mini://pages/account/verify');
        }
        this.goto(e);
    },
    goOrderList() {
        if (!this.checkUserLogin()) {
            this.showLoginBox()
            return true;
        }
        utils.openPageByType('mini://pages/order/list?from=nocomplete');
    },
    goUserCenter() {
        utils.openPageByType('tabs://pages/my/index')
    }
}))