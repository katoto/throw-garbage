const {
    mixin,
    cache,
    openPageByType,
    toast
} = require('../../../utils/fuc.js');
const {
    env_version
} = require('../../../utils/conf.js')
var myBehavior = require('../../../minxin/func.js')
let NFCtag = null
const cacheKey = 'collectNFCid'
let collectArr = [] // 收集多次桶信息
let nfcAdapter = wx.getNFCAdapter();
let nextFlag = false
let orderBuckIdArr = []
let colorfulListArr = [] // 万能芯片
const cacheOrderBuckId = 'orderBuckIdArr'
let tryTime = 5; // 查询nfc 次数
let startDiscoveryFlag = false // nfc 扫描是否开启，没有开启重试

Page(mixin(myBehavior, {
    /**
     * 页面的初始数据
     */
    data: {
        oid: ''
    },
    connDevice() {
        // 检查登录
        let _that = this
        if (this.checkUserLogin()) {
            //连接设备 暂时nfc
            if (!nfcAdapter) {
                nextFlag = false
                nfcAdapter = wx.getNFCAdapter();
            }
            nfcAdapter.offDiscovered(this.coverHandler);
            nfcAdapter.onDiscovered(this.coverHandler);
            nfcAdapter.stopDiscovery();
            this.startDiscoveryHandle(nfcAdapter)
        } else {
            this.showLoginBox()
        }
    },

    startDiscoveryHandle(nfcAdapter) {
        let that = this
        nfcAdapter && nfcAdapter.startDiscovery({
            success() {
                startDiscoveryFlag = true
                console.log('NFC2 打开成功~')
            },
            fail(res) {
                if (res && res.errMsg && res.errMsg === 'startDiscovery:fail current platform is not supported') {
                    toast('当前设备不支持NFC，请换设备~', 'none', 6000);
                } else {
                    // nfc 打开失败重试
                    if (startDiscoveryFlag) {
                        return false
                    }
                    if (tryTime > 0) {
                        tryTime--
                        setTimeout(() => {
                            that.startDiscoveryHandle(nfcAdapter)
                        }, 1500)
                    } else {
                        toast('操作失败，请检查NFC是否打开');
                    }
                }
            }
        });
    },

    coverHandler(res) {
        let _that = this
        NFCtag = nfcAdapter.getMifareClassic();
        let _nfcId = wx.arrayBufferToBase64(res.id)
        let allCard = colorfulListArr.includes(_nfcId);

        console.log('===nextFlag2==', nextFlag)
        console.log('===是否是万能芯片c2==', colorfulListArr.includes(_nfcId))
        // 万能芯片和跳过
        if (!nextFlag && (!collectArr.includes(_nfcId) || allCard)) {
            if (!allCard) {
                if (orderBuckIdArr.length > 0) {
                    // 需在用户列表里
                    let isFind = orderBuckIdArr.includes(_nfcId)
                    if (!isFind) {
                        toast("nfcId 没有绑定");
                        return false
                    }
                } else {
                    toast("该用户没有绑定桶id bindBucketIdList 为空");
                    return false
                }
            }
            let data = this.NFCData.find(item => {
                return item.bucketId === _nfcId;
            })
            if(!allCard && data.type !== "green") { 
                toast("请根据颜色指示放入正确垃圾桶");
                return false;
            }
            if (this.isCurrentPage()) {
                collectArr.push(_nfcId)
                nextFlag = true
                toast("餐厨垃圾取桶成功");
                if(allCard) this.NFCData.forEach(item => {
                    if(item.type === "green" ) item.allCard = true;
                })
                cache("NFCData", this.NFCData);
                cache(cacheKey, collectArr.join('|'))
                console.log(collectArr.join('|'))
                console.log('=====collectArr2 的值=========')
            }

            nfcAdapter.stopDiscovery();
            nfcAdapter.offDiscovered(_that.coverHandler);
            setTimeout(() => {
                // 并跳到下一个页面
                openPageByType('mini://pages/act/collect/collect3?oid=' + _that.data.oid, {
                    linkType: 'redirect'
                })
                nfcAdapter = null
            }, 1000)

        } else {
            if (this.isCurrentPage()) {
                toast("桶已经扫描，请扫描其他桶~");
                _that.startDiscoveryHandle()
            }
        }
    },

    isCurrentPage() {
        /*获取当前页url*/
        var pages = getCurrentPages() //获取加载的页面
        var currentPage = pages[pages.length - 1] //获取当前页面的对象
        var url = currentPage.route //当前页面url
        return url === 'pages/act/collect/collect2'
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let collectId = cache(cacheKey)
        if (collectId) {
            collectArr = collectId.split('|')
        }
        console.log('-------page 2 ----------')
        console.log(collectArr)
        this.setData({
            oid: options.oid || '',
        })
        this.NFCData = cache("NFCData");
        if (cache(cacheOrderBuckId)) {
            let _buckObj = JSON.parse(cache(cacheOrderBuckId))
            orderBuckIdArr = _buckObj.bindBucketIdList
            colorfulListArr = _buckObj.colorfulList
        }
        this.connDevice()
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        // this.connDevice()
    },
    onUnload() {
        nfcAdapter && nfcAdapter.stopDiscovery();
        nfcAdapter && nfcAdapter.offDiscovered(this.coverHandler);
        nfcAdapter = null;
    }
}))