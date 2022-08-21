var {
    mixin,
    cache,
    isIphoneXClassFn
} = require("../../utils/fuc.js");
var myBehavior = require("../../minxin/func.js");
const api = require("../../api/index.js");

Page(
    mixin(myBehavior, {
        data: {
            showTip: false,
            urls: {},
            nowId: 0,
            videoContext: {},
            isIphoneX: isIphoneXClassFn(),
            buttons: [{
                    type: 'default',
                    className: '',
                    text: '辅助操作',
                    value: 0
                },
                {
                    type: 'primary',
                    className: '',
                    text: '主操作',
                    value: 1
                }
            ],
            dialogShow: true,
            showCoupon: true
        },
        onLoad() {
            this.setData({
                showTip: cache("showTip") !== false,
            });
            this.getProduct(1);
        },
        diaCouponClick(e) {
            console.log(e)
        },
        tapDialogButton(e) {
            this.setData({
                dialogShow: false,
            })
        },
        togglePlay(e) {
            let urls = this.data.urls;
            let id = e.currentTarget.dataset.id;
            urls[id].play = urls[id].play || false;
            if (urls[id].play) {
                this.setPause(e);
            } else {
                this.setPlay(e);
            }
        },
        setPlay(e) {
            let id = e.currentTarget.dataset.id;
            this.togglePlayStatus(id, true);
        },
        setPause(e) {
            let id = e.currentTarget.dataset.id;
            this.togglePlayStatus(id, false);
        },
        togglePlayStatus(id, status) {
            let urls = this.data.urls;

            if (!(id in urls)) {
                return false;
            }
            let videoContext = this.data.videoContext;
            urls[id].play = status;
            let data = {};
            data.urls = urls;
            if (!(id in videoContext)) {
                videoContext[id] = wx.createVideoContext("myVideo_" + id);
                data.videoContext = videoContext;
            }
            if (status) {
                videoContext[id].play();
                data.nowId = id;
            } else {
                videoContext[id].pause();
            }
            this.setData(data);
        },
        getProduct(page) {
            api.pro.list(page).then((prlist) => {
                let data = this.data.urls;
                var nowId = this.data.nowId;
                if (!prlist.list) {
                    prlist.list = []
                }
                for (let i = 0; i < prlist.list.length; i++) {
                    if (data) {
                        data[prlist.list[i].id] = prlist.list[i];
                    }
                }
                this.setData({
                    urls: data,
                });
                // if(nowId==0){
                //   this.togglePlayStatus(prlist.list[0].id,true)
                // }
            });
        },

        changeSwiper(e) {
            cache("showTip", false);
            this.setData({
                showTip: false,
            });
            this.togglePlayStatus(this.data.nowId, false);
            this.togglePlayStatus(e.detail.currentItemId, true);
        },
        gotoLink(event) {
            let url = event.currentTarget.dataset.link;
            wx.navigateToMiniProgram({
                appId: "wxf10c25a9c2ea27f8",
                path: `packages/goods/detail/index?alias=${url}&shopAutoEnter=1`,
            });
        },
    })
);