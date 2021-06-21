// pages/order/index.js
var { mixin } = require('../../utils/fuc.js');
var myBehavior = require('../../minxin/func.js')
var utils = require('../../utils/fuc.js');

const api = require('../../api/index.js');

Page(mixin(myBehavior, {

    /**
     * 页面的初始数据
     */
    data: {
        loaded: false,
        orders: [],
        type: 'good',
        tip: ''
    },
    formatTime: function (time) {
        return utils.formatTime(time, 'yy.MM.dd')
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // options.type: good|bad|ts
        let tipStr = '还没有清晰订单，快去下单吧！';
        let param = {};
        let type = options.type || 'good';
        let title = "分类清晰";
        param = {
            "isClear": "1",
            "type": "customer"
        }
        if (type == 'bad') {
            title = "分类异常";
            param = {
                "isClear": "0",
                "type": "customer"
            }
            tipStr = '太棒了！没有分类异常，请继续保持';
        }
        if (type == 'ts') {
            title = "投诉";
            param = {
                "status": "T",
                "type": "worker"
            }
            tipStr = '还没有完成的订单，快去抢单吧！';
        }
        wx.setNavigationBarTitle({
            title: title,
        })
        this.setData({
            type,
            tip: tipStr
        })
        this.getOrderList(param)
    },
    getOrderList(param) {
        api.order.getCollList(
            Object.assign({}, {
                "status": "F"
            }, param)
            , '加载中').then(list => {
                let newList = list.map((item) => {
                    item.orderTime = utils.formatTime(item.orderDate, 'yy.MM.dd')
                    return item;
                })
                this.setData({
                    loaded: true,
                    orders: newList
                })
            }).catch((err) => {
                wx.showToast({
                    title: err.msg || err.errMsg,
                    icon: "none",
                    duration: 2000,
                });
            })
    },
}))