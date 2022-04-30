const utils = require("../../utils/fuc");
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        nowBar: String,
    },

    /**
     * 组件的初始数据
     */
    data: {
        nav: [
            {
                key: "diu",
                icon: "../../images/bar/icon_dlj_pre.png",
                url: "/pages/order/index",
                txt: "丢垃圾",
            },
            {
                key: "qu",
                icon: "../../images/bar/icon_qlj_pre.png",
                url: "/pages/account/index",
                txt: "取垃圾",
            },
            {
                key: "ke",
                icon: "../../images/bar/icon_khzx_pre.png",
                url: "/pages/my/index",
                txt: "客户中心",
            },
        ],
        isIphoneX: utils.isIphoneXClassFn()
    },

    /**
     * 组件的方法列表
     */
    methods: {
        goto: function (e) {
            let url = e.currentTarget.dataset.url;
            let _txt = e.currentTarget.dataset.txt;
            wx.reportAnalytics("mini_tab_click", {
                url,
                txt: _txt,
            });
            url && utils.redirectTo(url);
        },
    },
});
