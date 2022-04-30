// tabBarComponent/tabBar.js
const app = getApp(), fuc = app.require("utils/fuc");
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    tabbar: {
      type: Object,
      value: {
        backgroundColor: "#F5F8F4",
        color: "#979795",
        selectedColor: "#46B157",
        list: [{
          pagePath: "/pages/order/index",
          iconPath: "/images/bar/icon_dlj_pre.png",
          selectedIconPath: "/images/bar/icon_dlj_pre.png",
          text: "丢垃圾"
        },
        {
          pagePath: "/pages/account/index",
          iconPath: "/images/bar/icon_qlj_pre.png",
          selectedIconPath: "/images/bar/icon_qlj_pre.png",
          text: "取垃圾"
        },
        {
          pagePath: "/pages/my/index",
          iconPath: "/images/bar/icon_khzx_pre.png",
          selectedIconPath: "/images/bar/icon_khzx_pre.png",
          text: "客户中心",
        }]
      }
    },
  },


  // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
  ready() {
    app.editTabbar(); // 修改页面大小尺寸
  },
  /**
   * 组件的初始数据
   */
  data: {
    isIphoneX: app.globalData.systemInfo.model.includes('iPhone X'),
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 点击跳转路由
    rootTabbar(e) {
      let selected = e.currentTarget.dataset.selected;
      let text = e.currentTarget.dataset.text;
      let url = e.currentTarget.dataset.url;
      wx.reportAnalytics("mini_tab_click", {
        url, txt: text,
      });
      if (selected) return false;
      wx.switchTab({ url })
    }
  }
})