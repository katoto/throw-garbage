const {
    mixin,
    cache,
    openPageByType,
    toast
} = require('../../../utils/fuc.js');
var myBehavior = require('../../../minxin/func.js')
const {
    env_version
} = require('../../../utils/conf.js')

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
        oid: '',
        orders: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        let placeId = cache(cacheKey)
        if (placeId) {
            placeArr = placeId.split('|')
        }
        let collectId = cache(cacheCollKey)
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
        let _collNFC = this._formateNFC(cache('collectNFCid'))
        if (_collNFC && _collNFC.length > 2) {
            _collNFC = _collNFC.slice(0, 3)
        }
        return {
            weigh: this._formateWeight(cache('j_weigh')),
            collectNFCid: _collNFC,
            placeNFCid: this._formateNFC(cache('placeNFCid')),
        }
    },
    clearParams() {
        cache('j_weigh')
        cache('collectNFCid')
        cache('placeNFCid')
        cache('orderBuckIdArr')
    },
    _formateWeight(weight = ["{\"weight\":250,\"id\":\"123123123\",\"status\":\"Y\"}"]) {
        if (weight) {
            return [weight]
        }
        else  console.log('_formateWeight error')
    },
    _formateNFC(ids = 'Ju9xLQ==|BkJyLQ==|lpRyLQ==') {
        if (ids) {
            let _idsArr = ids.split('|')
            return _idsArr.reduce((all, item, index, arr) => {
                let _idsObj = {}
                _idsObj['bucketId'] = item
                all.push(_idsObj)
                return all
            }, [])
        } else {
            console.log('_formateNFC error')
        }
        return []
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

        // 万能芯片和跳过
        if (!nextFlag && (!collectArr.includes(_nfcId) || colorfulListArr.includes(_nfcId))) {
            if(this.NFCData.length > 0) {  // 判断用户地址是否绑定芯片 
                let data = this.NFCData.find(item => {
                    return item.type === "gray";
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
                toast("其他垃圾放桶成功");
                // 清空覆盖
                cache(cacheKey, placeArr.join('|'))
                // 清空覆盖
                console.log('=====placeArr3 的值=========')
                console.log(_that.getInitParams())
            }

            nfcAdapter.stopDiscovery();
            nfcAdapter.offDiscovered(_that.coverHandler);
            nextFlag = false
            nfcAdapter = null;
            _that.sendFinishOrder();

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
        return url === 'pages/act/place/place3'
    },

    // 把重量、两个nfc 相关信息存入
    sendFinishOrder() {
        let _params = Object.assign(this.getInitParams(), {
            "orderId": this.data.oid
        })
        api.order.finishOrder(_params).then(async res => {
            this.clearParams()
            let currList = await this.getOrderList()
            this.goNextPage(currList)

        }).catch(err => {
            wx.showToast({
                title: err.msg,
                icon: 'none'
            })
        })
    },
    goNextPage(currList = []) {
        // 是否还有未完成的订单
        let isOk = false
        if (currList.length > 0) {
            isOk = currList.every((item) => {
                return item.status === 'F'
            })
        }
        if (isOk) {
            openPageByType('mini://pages/order/complete', {
                linkType: 'redirect'
            })
        } else {
            // wx.navigateBack({ delta: 1 });
            openPageByType('mini://pages/order/list', {
                linkType: 'redirect'
            })
        }
    },
    checkPlaceFn(nfcId) {
        return api.act.queryIcCodeBindStatus({
            orderId: this.data.oid || '',
            bucketId: nfcId || ""
        }, {
            success() { }
        }).then(res => {
            if (res && res.errcode === 0){
                if(res.data.color !== "gray") {
                    toast("请根据颜色指示放入正确垃圾桶");
                    return false;
                } else return true;
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
            cache(cacheKey, 'testid1|place2|placeid3')
            this.goTestOrderFn()
        }
    },
    goTestOrderFn() {
        let _params = Object.assign(this.getInitParams(), {
            "orderId": this.data.oid
        })
        api.order.finishOrder(_params).then(res => {
            setTimeout(() => {
                openPageByType('mini://pages/order/list', {
                    linkType: 'redirect'
                })
            }, 1000)
        }).catch(err => {
            wx.showToast({
                title: err.msg,
                icon: 'none'
            })
        })
    },
    getOrderList(packageId = '', status = 'L') {
        return api.order.noPackageList({
            type: 'worker',
            status: status,
            packageId: packageId
        }).then(list => {
            return list
        })
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
    },
    onUnload() {
        nfcAdapter && nfcAdapter.stopDiscovery();
        nfcAdapter && nfcAdapter.offDiscovered(this.coverHandler);
        nfcAdapter = null;
    }
}))