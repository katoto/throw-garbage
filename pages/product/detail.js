// miniprogram/pages/product/detail.js
Page({
    /**
     * 页面的初始数据
     */
    data: {
        url: ""
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var _this = this;
        _this.setData({
            url: "https://j.youzan.com/" + options.param
        });
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
    },
})