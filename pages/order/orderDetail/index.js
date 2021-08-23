// pages/order/orderDetail/index.js
const app = getApp();
const api = app.require('api/index');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderMsg:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getOrderList(options.orderId);
  },

  getOrderList(orderId = '') {
    api.order.getOrderInfo({
      orderId: orderId
    }).then(data => {
      if (data) {
        data.bookingTime = this.formateBookTime(data.bookingTime)
        data.garbageTypeArr = data.garbageType.split(',')
        data.garbageType = JSON.parse(data.garbageType);
      }
      this.setData({
        orderMsg: data
      })
    }).catch(err => {
      console.log(err);
      wx.showToast({
        title: err.msg || '服务器繁忙',
        icon: 'none'
      })
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
  },

})