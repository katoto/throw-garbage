var { mixin } = require('../../utils/fuc.js');
var myBehavior = require('../../minxin/func.js')

var utils = require('../../utils/fuc.js');
const app = getApp()
const api = require('../../api/index.js');
const banner = utils.cache("banner");
const adsImg = banner ? banner.robOrder.swiper :  [
    "https://xcx.9shenghe.com/upload/img/ad/ad02.png",
    "https://xcx.9shenghe.com/develop/upload/img/ad/fl01.png", 
    "https://xcx.9shenghe.com/develop/upload/img/ad/fl02.png",
]

Page(mixin(myBehavior, {
    /**
     * 页面的初始数据
     */
    data: {
        loaded: false,
        orders: [],
        bind: 'N',
        hideLogin: true,
        userLogin: false,
        ad_space: 3,
        robModal: false,
        oid: null,
        orderDetail: {}
        // ads: [
        //     'https://xcx.9shenghe.com/upload/img/ad/ad01.png', 'https://xcx.9shenghe.com/upload/img/ad/ad01.png', 'https://xcx.9shenghe.com/upload/img/ad/ad01.png',
        //     'https://xcx.9shenghe.com/upload/img/ad/ad01.png', 'https://xcx.9shenghe.com/upload/img/ad/ad01.png',
        //     'https://xcx.9shenghe.com/upload/img/ad/ad01.png', 'https://xcx.9shenghe.com/upload/img/ad/ad01.png', 'https://xcx.9shenghe.com/upload/img/ad/ad01.png',
        // ],
    },
    getOrderList() {
        api.order.roblist().then(list => {
            var orderlist = [];
            let ad_i = 0;
            let s_i = 1;
            let adsImgFlag = 0
            for (let index = 0; index < list.length; index++) {
                list[index].type = 'order';
                list[index].bookingTime = this.formateBookTime(list[index].bookingTime)
                orderlist.push(list[index]);
                if(index % (this.data.ad_space) === 2){
                    orderlist.push({ type: 'ad', 'src': adsImg[adsImgFlag % 3] });
                    adsImgFlag++
                }
                // if (s_i == 3) {
                //     s_i = 0;
                //     let t_i = ad_i;
                //     if (!this.data.ads) {
                //         this.data.ads = []
                //     }
                //     ad_i = ad_i + 1 > this.data.ads.length ? 0 : ad_i + 1;
                //     orderlist.push({ type: 'ad', 'src': this.data.ads[t_i] });
                // }
                // s_i++;
            }

            this.setData({
                loaded: true,
                orders: orderlist
            })
        })
    },

    // listAd() {
    //     let ad_i = this.ad_i + 1 > this.data.ads.length ? 0 : this.ad_i + 1;
    //     this.setData({
    //         ad_i
    //     })
    //     return this.data.ads[this.ad_i];
    // },

    tsetFucn() {
        const data = {
            phone: '188828381381',
            "type":[{"id":"200","name":"厨余"},{"number":1,"unit":"个","id":"300","name":"纸包装"},{"number":1,"unit":"个","id":"301","name":"塑料包装"},{"number":1,"unit":"个","id":"302","name":"其他包装"},{"id":"200","name":"厨余"},{"number":1,"unit":"个","id":"300","name":"纸包装"},{"number":2,"unit":"个","id":"301","name":"塑料包装"},{"number":2,"unit":"个","id":"302","name":"其他包装"}],
        }
        const type = this.arrTotal(data.type);
        console.log(type);
    },

    lockOrder(e) {
        if (!this.checkUserLogin()) {
            this.showLoginBox()
            return false;
        }
        //绑定处理
        if (this.data.bind == 'N') {
            return utils.redirectTo('/pages/form/bind');
        }
        if (this.data.bind == 'W') {
            return utils.redirectTo('/pages/account/verify');
        }
        let that = this;
        let oid = e.currentTarget.dataset.item.id;
        api.order.robOrder({ "packageId": oid }).then(res => {
            let orderDetail = res;
           let types = that.arrTotal(res.type);
           orderDetail.type = types;
           this.setData({
               robModal: true,
               oid,
               orderDetail: res
           })
        }).catch(err => {
            wx.showToast({
                title: err.msg || err.errmsg,
                icon: 'none'
            })
        })
    },

    arrTotal(arr) {
        let newArr = []
        arr.forEach(el=>{
            const result = newArr.findIndex(ol=>{return el.id === ol.id})
            if(result!== -1){
                newArr[result].number = newArr[result].number + el.number;
            }else{
                newArr.push(el)
            } 
        })
        return newArr;
    },

    robOrderSucc() {
        this.setData({
            robModal: false
        })
        wx.navigateTo({
            url: '/pages/order/list?packageId=' + this.data.oid,
        })
        this.getOrderList()
    },

    onShow() {
        if (this.checkUserLogin()) {
            this.getUserBindStatus()
        }
        this.getOrderList()
    },
    getUserBindStatus() {
        // todo
        api.user.info({ "type": 'worker' }, '加载中').then(data => {
            if (data) {
                this.setData({
                    bind: data.bind.toUpperCase()
                })
            }
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
    }
}))