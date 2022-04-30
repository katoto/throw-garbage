// components/login/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    hideLoginBox: function () {
      var myEventDetail = {} // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('Hide', myEventDetail, myEventOption)
    },
    userInfoHandler:function(e){
      var myEventDetail = {} // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('Login', myEventDetail, myEventOption)
    },
    toXieyi:function(){
      wx.navigateTo({
        url: '/pages/h5/xieyi',
      })
    },
  }
})
