// pages/order/complain/index.js
const app = getApp();
const api = app.require('api/index');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getOrderList();
  },

  getOrderList() {
    api.order.getComplaintsOrderList({}).then(res=> {
      let data = res.map(item => {
        let type = item.selects.split(",");
        let time = item.bookingTime.split("|");
        item.time = time[0];
        item.types = [];
        type.forEach(el => {
          app.data.defaultReviewType.forEach(ol => {
            if(el == ol.id) item.types.push(ol.val);
          })
        })
        return item;
      })
      this.setData({
        orderList: data
      })
    })
  },
  navOrderComplaints() {
    
  }
})