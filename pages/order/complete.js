// pages/order/index.js
var { mixin } = require('../../utils/fuc.js');
var myBehavior = require('../../minxin/func.js')
var utils = require('../../utils/fuc.js');

const api = require('../../api/index.js');
const app = getApp(), adConfig = app.require("utils/adConfig");
Page(mixin(myBehavior, {
    /**
     * 页面的初始数据
     */
    data: {
        loaded: false,
        orders: [],
        mark: '',
        compServer: utils.cache("banner").compServer
    },
    
    getOrderList: function () {
        api.order.roblist({
            "type": "worker",
            "status": "F",
        }, '加载中').then(list => {
            this.setData({
                loaded: true,
                orders: list
            })
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function () {
        this.getOrderList();
        this.setData({
            mark: `请将已收垃圾桶拿到8号楼垃圾转运站处倾倒并清洗，再运到7号楼地下一层车库归还工具。联系人：苑凌飞，电话：13614560531`
        })
      
        // 暂时固定，后面接口配置
        // api.contact.info().then(res => {
        //     this.setData({
        //         mark: `请将已收垃圾桶拿到8号楼垃圾转运站处倾倒并清洗，再运到7号楼地下一层车库归还工具。联系人：苑凌飞，电话：13614560531`
        //     })
        // })
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow() { },
    orderComplete(e) {
        let _item = e.currentTarget.dataset.item;
        let _packageId = _item.id
        utils.openPageByType(`mini://pages/order/list?status=${_item.returnFlag ? 'F' : 'L'}&packageId=` + _packageId)
    }
}))