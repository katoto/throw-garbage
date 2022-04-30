var { mixin } = require('../../utils/fuc.js');
var myBehavior = require('../../minxin/func.js')

var utils = require('../../utils/fuc.js');
const app = getApp()
const api = require('../../api/index.js');
const { showToast } = require('../../utils/wxApi.js');

Page(mixin(myBehavior, {
    /**
     * 页面的初始数据
     */
    data: {
        loaded: false,
        options: false,
        isAjaxOk: true,
        isGetTool: false,
        orders: []
    },
    // todo status 状态值
    getOrderList(packageId = '', status = 'L') {
        api.order.noPackageList({
            type: 'worker',
            status: status,
            packageId: packageId
        }).then(list => {
            list.forEach(item => {
                item.booksTime = this.formateBookTime(item.bookingTime);
                if(item.garbageType) item.garbageLabel =  JSON.parse(item.garbageType);
                item.len = item.garbageLabel.length;
            })
            
            let isAllOk = list.every((item) => {
                return this.options.from === 'nocomplete' && item.status === 'F'
            })
            if (isAllOk) {
                this.setData({
                    loaded: true,
                    orders: []
                })
            } else {
                this.setData({
                    loaded: true,
                    orders: list
                })
            }

        }).catch(err => {
            wx.showToast({
                title: err.msg || '服务器繁忙',
                icon: 'none'
            })
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            options: options
        })
    },
    initPage(options) {
        if (options.status) {
            this.getOrderList(options.packageId, options.status);
        } else {
            this.getOrderList(options.packageId);
        }
    },
    isGetTool() {
        return api.order.checkIsGetTool().then(list => {
            if (list) {
                return true
            }
            return false
        })
    },
    async listClick(e) {
        let _item = e.currentTarget.dataset.item;
        let _oid = _item.orderId
        if (!this.data.isAjaxOk) { return false }
        this.setData({
            isAjaxOk: false
        })
        if (_item && _item.status === 'F') {
            this.setData({
                isAjaxOk: true
            })
            return false
        }
        // 判断该用户是否领取工具G
        if (!this.data.isGetTool) {
            wx.showToast({
                title: '请联系13614560531，领取工具后再进行操作',
                icon: 'none'
            })
            this.setData({
                isAjaxOk: true
            })
            return false
        }
        utils.openPageByType('mini://pages/act/collect/collect?oid=' + _oid)
        setTimeout(() => {
            this.setData({
                isAjaxOk: true
            })
        }, 500)
    },
    /**
     * 生命周期函数--监听页面显示
     */
    async onShow() {
        this.initPage(this.data.options)
        let isGetTool = await this.isGetTool()
        this.setData({
            isGetTool: isGetTool
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
}))