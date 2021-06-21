// pages/order/index.js
var {mixin} = require('../../utils/fuc.js');
var myBehavior = require('../../minxin/func.js')
var utils = require('../../utils/fuc.js');

const app = getApp()
const api =  require('../../api/index.js');

Page(mixin(myBehavior,{

  /**
   * 页面的初始数据
   */
  data: {
      amount:'0.00',
      lable:[10,20,30,50,100,200],
      now:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let userType = utils.cache('userType') || 'customer';
    app.getOpenId(openId =>{
        api.user.info({"openId":openId,"type":userType}).then(res=>{
          app.globalData.nowUser.bind =  res.bind.toUpperCase();
          let {amount} = res
          this.setData({
            amount:this.fnum(amount || 0),
          })
        // }
      });
    });
  },
  setLable:function(e){
    this.setData({
      now:e.currentTarget.id
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
}))