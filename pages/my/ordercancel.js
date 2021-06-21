var utils = require('../../utils/fuc.js');
const api = require('../../api/index.js');

Page({
    data: {
        userType: '', // 用户类型 customer  worker
        orderList: [] // 订单列表
    },
    onLoad(options) {
        if (options) {
            if (options.type === 'customer' || options.type === 'worker') {
                // 丢垃圾 取垃圾
                this.setData({
                    userType: options.type
                })
                this.getCancelOrders()
            } else {
                console.log('用户类型异常~ at ordercancel.js')
            }
        }
    },
    fnum(num) {
        // 金额格式
        return utils.formatNum(num)
    },
    getCancelOrders() {
        let _userType = this.data.userType
        // 取垃圾与丢垃圾 订单列表 todo 订单列表
        api.order.getCancelOrders({ type: _userType }).then(orders => {
            orders.forEach((item) => {
                if (item && item.bookingTime) {
                    item.bookingTime = this.formateBookTime(item.bookingTime)
                }
                if (item.garbageType) {
                    item.garbageLabel = item.garbageType.split(',')
                }
            })
            this.setData({
                orderList: orders
            })
        }).catch(() => {
            utils.toast('服务器异常，请重试~')
        })
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh(e) {
        setTimeout(() => {
            wx.stopPullDownRefresh()
        }, 500)
        this.getCancelOrders()
    },
    cancelHandle(e) {
        let _orderid = '';
        let _this = this;
        let _currItem = e.currentTarget.dataset.orderitem;
        if (_currItem) {
            if (_currItem.status === 'P') {
                // 打包后不可点击
                return false
            }
            _orderid = _currItem.orderId;
        }
        wx.showModal({
            title: '提示',
            content: '确定取消该订单？',
            success(res) {
                if (res.confirm) {
                    _this.doCancelHandle(_orderid)
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },
    doCancelHandle(orderId = '') {
        if (!orderId) {
            utils.toast('error doCancelHandle no orderid inp')
            return false
        }
        api.order.quxiao({ orderId, type: this.data.userType }).then(() => {
            utils.toast('订单取消成功')
            setTimeout(() => {
                // 更新列表
                this.getCancelOrders()
            }, 50)
        }).catch(() => {
            utils.toast('服务器异常，请重试~')
        })
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
    }
})