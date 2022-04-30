const { mixin, cache, openPageByType, toast } = require('../../../utils/fuc.js');
var myBehavior = require('../../../minxin/func.js')
const { env_version } = require('../../../utils/conf.js')

const app = getApp()
const api = require('../../../api/index.js');
let NFCtag = null
const cacheKey = 'placeNFCid'
const cacheCollKey = 'collectNFCid'
let orderBuckIdArr = []
const cacheOrderBuckId = 'orderBuckIdArr'
let collectArr = [] // 放桶的NFCid
let placeArr = [] // 收集多次桶信息
let colorfulListArr = [] // 万能芯片 
let nextFlag = false
let nfcAdapter = wx.getNFCAdapter();
let tryTime = 5; // 查询nfc 次数
let startDiscoveryFlag = false // nfc 扫描是否开启，没有开启重试

Page(mixin(myBehavior, {

    /**
     * 页面的初始数据
     */
    data: {
        oid: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        let placeId = cache(cacheKey)
        if (placeId) {
            placeArr = placeId.split('|')
        }
        let collectId = cache(cacheCollKey);
        this.NFCData = cache("NFCData");
        if (collectId) {
            collectArr = collectId.split('|')
        }
        if (cache(cacheOrderBuckId)) {
            let _buckObj = JSON.parse(cache(cacheOrderBuckId))
            orderBuckIdArr = _buckObj.bindBucketIdList
            colorfulListArr = _buckObj.colorfulList
        }
        this.getPlaceNFCId()
        this.setData({
            oid: options.oid,
        })
    },
    getInitParams() {
        return {
            collectNFCid: cache('collectNFCid'),
            weigh: cache('j_weigh'),
            weighId: cache('j_weigh_id'),
        }
    },
    getPlaceNFCId() {
        if (this.checkUserLogin()) {
            //连接设备 暂时nfc
            if (!nfcAdapter) {
                nextFlag = false
                nfcAdapter = wx.getNFCAdapter();
            }
            nfcAdapter.offDiscovered(this.coverHandler);
            nfcAdapter.onDiscovered(this.coverHandler);
            nfcAdapter.stopDiscovery();
            this.startDiscoveryHandle(nfcAdapter);
        } else {
            this.showLoginBox()
        }
    },

    startDiscoveryHandle(nfcAdapter) {
        let that = this
        nfcAdapter && nfcAdapter.startDiscovery({
            success() {
                startDiscoveryFlag = true
                console.log('place NFC 打开成功~')
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

    async coverHandler(res) {
        let _that = this
        // nfcAdapter.stopDiscovery();
        NFCtag = nfcAdapter.getMifareClassic();
        let _nfcId = wx.arrayBufferToBase64(res.id)
        let allCard = colorfulListArr.includes(_nfcId);
        console.log('===是否是万能芯片p2==', colorfulListArr.includes(_nfcId))
        // 万能芯片和跳过
        if (!nextFlag && (!collectArr.includes(_nfcId) || colorfulListArr.includes(_nfcId))) {
            if(this.NFCData.length > 0) {  // 判断用户地址是否绑定芯片 
                let data = this.NFCData.find(item => {
                    if(item.type == "green") return item;
                })
                if(!data && !allCard) return toast("放桶失败,请放入正确的垃圾桶.");
                if(data && data.allCard != allCard) return toast("放桶失败,请放入正确的垃圾桶.");
            }
            if (!colorfulListArr.includes(_nfcId)) {
                let checkPlace = await this.checkPlaceFn(_nfcId);
                if (!checkPlace) {
                    this.startDiscoveryHandle()
                    return false
                }
            }
            if (this.isCurrentPage()) {
                placeArr.push(_nfcId)
                collectArr.push(_nfcId)
                cache(cacheCollKey, collectArr.join('|'))
                nextFlag = true
                toast("餐厨垃圾放桶成功");
                // 清空覆盖
                cache(cacheKey, placeArr.join('|'))
                console.log(placeArr.join('|'))
                console.log('=====placeArr2 的值=========')
            }

            nfcAdapter.stopDiscovery();
            nfcAdapter.offDiscovered(_that.coverHandler);
            setTimeout(() => {
                // 并跳到下一个页面
                nfcAdapter = null;
                openPageByType('mini://pages/act/place/place3?oid=' + _that.data.oid, {
                    linkType: 'redirect'
                })
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
        return url === 'pages/act/place/place2'
    },
    checkPlaceFn(nfcId) {
        return api.act.queryIcCodeBindStatus({
            orderId: this.data.oid || '',
            bucketId: nfcId || ""
        }, {
            success() { }
        }).then(res => {
            if (res && res.errcode === 0){
                if(res.data.color !== "green") {
                    toast("请根据颜色指示放入正确垃圾桶");
                    return false;
                }else return true
            }
            else {
                toast(res.errmsg || '放桶没有初始化')
                return false
            }
        }).catch(err => {
            wx.showToast({
                title: err.msg,
                icon: 'none'
            })
        })
    },
   

    goTestFn() {
        if (env_version === 'develop') {
            cache(cacheKey, 'testid1|place2')
            openPageByType('mini://pages/act/place/place3?oid=' + this.data.oid, {
                linkType: 'redirect'
            })
        }
    },

    goTestOrderFn() {
        api.order.finishOrder({
            "orderId": 'bdad857f92ba49ec9445c2b04cdaa484',
            "collection": [{ "bucketId": "oldbucketid", "isClear": "Y", "orderId": "orderId", "weight": 0.5, "weighId": "idxxx" }],
            "newBucket": [{ "bucketId": "newbucketid" }]
        }).then(res => {
        }).catch(err => {
            wx.showToast({
                title: err.msg,
                icon: 'none'
            })
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() { },
    onUnload() {
        nfcAdapter && nfcAdapter.stopDiscovery();
        nfcAdapter && nfcAdapter.offDiscovered(this.coverHandler);
        nfcAdapter = null;
    }
}))