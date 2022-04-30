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
        loaded: false,
        options: false,
        orderMsg: ''
    },
    // todo status 状态值
    getOrderList(orderId = '') {
        api.order.getOrderInfo({
            orderId: orderId
        }).then(data => {
            if (data) {
                if (data.bookingTime) {
                    data.bookingTime = this.formateBookTime(data.bookingTime)
                }
                if (data.garbageType) {
                    data.garbageTypeArr = data.garbageType.split(',')
                }
            }
            this.setData({
                orderMsg: data
            })
        }).catch(err => {
            wx.showToast({
                title: err.msg || '服务器繁忙',
                icon: 'none'
            })
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            options: options
        })
        this.initPage(this.data.options)
    },
    initPage(options) {
        if (options.orderId) {
            this.getOrderList(options.orderId);
        }
    },
    formateBookTime(val) {
        let _time1 = ''
        let _time2 = ''
        if (val) {
            let valArr = val.split('|')
            _time1 = valArr[0]
            _time2 = valArr[1]
            return `${_time1}-${_time2 && _time2.split(' ')[1]}`
        }
        return val
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
    },
}))