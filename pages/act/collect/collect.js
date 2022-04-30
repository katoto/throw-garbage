const {
    mixin,
    cache,
    openPageByType,
    toast
} = require('../../../utils/fuc.js');
const app = getApp(), common = app.require("utils/common");
const api = require('../../../api/index.js');
var myBehavior = require('../../../minxin/func.js')
let NFCtag = null
const cacheKey = 'collectNFCid'
let collectArr = [] // 收集多次桶信息
let nfcAdapter = common.plugin.NFC.nfcAdapter; // NFC 初始化变量
let nextFlag = false
let orderBuckIdArr = []
let colorfulListArr = [] // 万能芯片
const cacheOrderBuckId = 'orderBuckIdArr'

Page(mixin(myBehavior, {
    /**
     * 页面的初始数据
     */
    data: {
        oid: ''
    },
    coverHandler(_nfcId) {
        let _that = this
        NFCtag = nfcAdapter.getMifareClassic();
        let allCard = colorfulListArr.includes(_nfcId);
        console.log('===nextFlag1==', nextFlag)
        // 万能芯片和跳过
        if (!collectArr.includes(_nfcId) || allCard) {
            if (!allCard) { // 当使用NFC扫描 检测是否跟用户信息绑定所匹配
                if (orderBuckIdArr.length > 0) {
                    let isFind = orderBuckIdArr.includes(_nfcId);
                    if (!isFind) return toast("请使用已绑定分类桶");
                } else return toast("该用户没有绑定桶");
            }
            let data = this.NFCData.find(item => {
                return item.bucketId === _nfcId;
            })
            if (!allCard && data.type !== "blue") {
                toast("请根据颜色指示放入正确垃圾桶");
                return false;
            }
            // 匹配成功 存储数据
            if (this.isCurrentPage()) {
                collectArr.push(_nfcId);
                toast("可回收物垃圾取桶成功");
                cache(cacheKey, collectArr.join('|'))
                if (allCard) this.NFCData.forEach(item => {
                    if (item.type === "blue") item.allCard = true;
                })
                cache("NFCData", this.NFCData);
                collectArr = [];
            }
            nfcAdapter.stopDiscovery();
            nfcAdapter.offDiscovered(_that.coverHandler);
            setTimeout(() => {
                // 并跳到下一个页面
                openPageByType('mini://pages/act/collect/collect2?oid=' + _that.data.oid, {
                    linkType: 'redirect'
                })
            }, 1000);
        }
    },
  
    isCurrentPage() {
        /*获取当前页url*/
        var pages = getCurrentPages() //获取加载的页面
        var currentPage = pages[pages.length - 1] //获取当前页面的对象
        var url = currentPage.route //当前页面url
        return url === 'pages/act/collect/collect'
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            oid: options.oid || ''
        })
        this.getIds(options.oid || '')
        // 初始化 NFC
        common.plugin.NFC.init(this.coverHandler);
    },

    // 获取用户绑定桶信息
    getIds(oid) {
        return api.act.getAddrBucketInfo({
            orderId: oid
        }).then(res => {
            if (res) {
                if (res.bindBucketIdList) {
                    orderBuckIdArr = res.bindBucketIdList
                }
                if (res.colorfulList) {
                    colorfulListArr = res.colorfulList
                }
                if (res.bucketTypeList) this.NFCData = res.bucketTypeList.map(item => {
                    item.allCard = false;
                    return item;
                });
                cache(cacheOrderBuckId, JSON.stringify(res))
            }
        }).catch(err => {
            wx.showToast({
                title: err.msg,
                icon: 'none'
            })
        })
    },
    // 关闭页面 
    onUnload() {
        // 关闭连接
        common.plugin.NFC.breakEvent();
    }
}))