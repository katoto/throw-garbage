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
let bucketTypeList = [] // 用于跳转的判断
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
                if (collectArr.length >= 3) {
                    nfcAdapter.offDiscovered(this.coverHandler);
                    nfcAdapter.stopDiscovery();
                }
                console.log('NFC3 打开成功~')
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
        // nfcAdapter.stopDiscovery();
        NFCtag = nfcAdapter.getMifareClassic();
        let _nfcId = wx.arrayBufferToBase64(res.id)
        let allCard = colorfulListArr.includes(_nfcId);

        console.log('===nextFlag3==', nextFlag)
        console.log('===是否是万能芯片c3==', colorfulListArr.includes(_nfcId))
        // 万能芯片和跳过
        if (!nextFlag && (!collectArr.includes(_nfcId) || allCard)) {
            if (!colorfulListArr.includes(_nfcId)) {
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
            if(!allCard && data.type !== "yellow") { 
                toast("请根据颜色指示放入正确垃圾桶");
                return false;
            }
            

            if (this.isCurrentPage()) {
                collectArr.push(_nfcId)
                nextFlag = true
                toast("其他垃圾取桶成功");
                cache(cacheKey, collectArr.join('|'))
                if(allCard) this.NFCData.forEach(item => {
                    if(item.type === "yellow" ) item.allCard = true;
                })
                cache("NFCData", this.NFCData);
                console.log(collectArr.join('|'))
                console.log('=====collectArr3 的值=========')
            }

            nfcAdapter.stopDiscovery();
            nfcAdapter.offDiscovered(_that.coverHandler);
            if (collectArr.length === 0) {
                return false
            }
            // 清空覆盖
            setTimeout(() => {
                // 处理跳过的情况
                _that.handleJump();
                nfcAdapter = null;
            }, 1000)
        } else {
            if (this.isCurrentPage()) {
                toast("桶已经扫描，请扫描其他桶~3");
                _that.startDiscoveryHandle()
            }
        }
    },
    handleJump() {
        // 有可能出现跳过称重的情况有如下：
        // 1、只有一个蓝色或黄色芯片，用两次万能芯片；
        // 2、有蓝色和黄色芯片，用一次万能芯片；
        // 3、没有桶，3次都用万能芯片
        // 判断下这三个取桶页面的芯片id有没有绿色的，没有就跳过；2.判断下取桶页面的3个芯片是不是都是万能芯片，是就跳过
        console.log(bucketTypeList)
        console.log('===bucketTypeList=====')
        let isJump2Weight = false
        let isAllColor = collectArr.every((item) => {
            return colorfulListArr.includes(item)
        })
        console.log(isAllColor)
        console.log('====3次都是万能芯片======', isAllColor)
        if (isAllColor) isJump2Weight = true;
        // 查看绿色芯片是否 使用万能芯片跳过
        if(colorfulListArr.includes(collectArr[1])) isJump2Weight = true;
        
        if (isJump2Weight) {
            cache('j_weigh', [JSON.stringify({ w: "0", i: "0", s: "0" })])
            openPageByType('mini://pages/act/place/place?oid=' + this.data.oid, {
                linkType: 'redirect'
            })
        } else {
            openPageByType('mini://pages/act/weigh?oid=' + this.data.oid, {
                linkType: 'redirect'
            })
        }
    },
    isCurrentPage() {
        /*获取当前页url*/
        var pages = getCurrentPages() //获取加载的页面
        var currentPage = pages[pages.length - 1] //获取当前页面的对象
        var url = currentPage.route //当前页面url
        return url === 'pages/act/collect/collect3'
    },
    // goTestFn() {
    //     if (env_version === 'develop') {
    //         cache(cacheKey, 'testid1|testid2|testid3')
    //         openPageByType('mini://pages/act/weigh?oid=' + this.data.oid, {
    //             linkType: 'redirect'
    //         })
    //     }
    // },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        let collectId = cache(cacheKey)
        if (collectId) {
            collectArr = collectId.split('|')
        }
        this.NFCData = cache("NFCData");
        this.setData({
            oid: options.oid || ''
        })
        if (cache(cacheOrderBuckId)) {
            let _buckObj = JSON.parse(cache(cacheOrderBuckId))
            orderBuckIdArr = _buckObj.bindBucketIdList
            colorfulListArr = _buckObj.colorfulList
            if (_buckObj.bucketTypeList) {
                bucketTypeList = _buckObj.bucketTypeList
            }
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