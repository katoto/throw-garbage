// pages/member/payDetails/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    vipMonth: true,
    showRule: false,
    showCoupon: false,
    activeCouponId: 2,
    buttons: [
      {
        type: 'default',
        className: '',
        text: '辅助操作',
        value: 0
    },
      {
        type: "primary",
        className: "",
        text: "主操作",
        value: 1,
      },
    ],
    couponList: [
      {
        title: "券名称111",
        time: "2022.08.08-2022.10.10",
        id: 1,
        price: 2,
      },
      {
        title: "券名称222",
        time: "2022.08.08-2022.10.10",
        id: 2,
        price: 1,
      },
      {
        title: "上门寄件券",
        time: "2022.08.08-2022.10.10",
        id: 3,
        price: 2,
      },
      {
        title: "券名称441",
        time: "2022.08.08-2022.10.10",
        id: 4,
        price: 2,
      },
      {
        title: "券名称111",
        time: "2022.08.08-2022.10.10",
        id: 5,
        price: 2,
      },
      {
        title: "券名称222",
        time: "2022.08.08-2022.10.10",
        id: 6,
        price: 2,
      },
      {
        title: "上门寄件券",
        time: "2022.08.08-2022.10.10",
        id: 7,
        price: 2,
      },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},

  showCouponHandle() {
    this.setData({
      showCoupon: true,
    });
  },

  couponChange(e) {
    let { item } = e.currentTarget.dataset;
    console.log(item.id);
    this.setData({
      activeCouponId: item.id,
    });
  },
  diaCouponClick(e) {},

  vipMonthHandle() {
    this.setData({
      vipMonth: !this.data.vipMonth,
    });
  },

  closeDialog() {
    this.setData({
      showRule: false,
    });
  },

  openDialog() {
    this.setData({
      showRule: true,
    });
  },
});
