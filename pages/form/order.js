const api = require("../../api/index.js");
const app = getApp();
let mapMsg = null;
var {
    mixin,
    redirectTo,
    formatTime
} = require("../../utils/fuc.js");
var utils = require("../../utils/fuc.js");
var myBehavior = require("../../minxin/func.js");
let currTimeList = null;

let _today = formatTime(new Date().getTime(), "yyyy-MM-dd[今天]");
let _todayDate = formatTime(new Date().getTime(), "yyyy-MM-dd");
let _tomorrowWeek = formatTime(
    new Date().getTime() + 86400000,
    "yyyy-MM-dd[week]"
);

let _tomorrowDate = formatTime(new Date().getTime() + 86400000, "yyyy-MM-dd");
let defaultTimeList = [{
    time: `${_today} 07:00-09:00`,
    bookTime: `${_todayDate} 07:00|${_todayDate} 09:00`,
},
{
    time: `${_today} 12:00-14:00`,
    bookTime: `${_todayDate} 12:00|${_todayDate} 14:00`,
},
{
    time: `${_today} 19:00-21:00`,
    bookTime: `${_todayDate} 19:00|${_todayDate} 21:00`,
},
{
    time: `${_tomorrowWeek} 07:00-09:00`,
    bookTime: `${_tomorrowDate} 07:00|${_tomorrowDate} 09:00`,
},
{
    time: `${_tomorrowWeek} 12:00-14:00`,
    bookTime: `${_tomorrowDate} 12:00|${_tomorrowDate} 14:00`,
},
{
    time: `${_tomorrowWeek} 19:00-21:00`,
    bookTime: `${_tomorrowDate} 19:00|${_tomorrowDate} 21:00`,
},
];

Page(
    mixin(myBehavior, {
        data: {
            hideLogin: true,
            time: 0,
            timeArray: [],
            form: {},
            lable: [],
            mapName: "", // 地图短地址
            buildingNumArr: [], // 楼宇列表
            houseList: [], // 门票列表
            houseNumber: '',
            addressId: '',
            buildingNum: "",
            buildingItem: "",
            _currTime: "请选择预约时间",
            bindTimeIndex: "",
            dialogList: [],
            showDialog: false,
            dialogTitle: '',
            adServers: app.data.adServers
        },
        checkForm: function (data) {
            let formData = {};
            let error = false;

            if (!error && !this.data.buildingItem) {
                error = "请选择楼宇号信息";
            }
            if (!error && !this.data.houseNumber) {
                error = "请选择门牌号";
            }
            if (!error && !this.data.bindTimeIndex) {
                error = "请选择预约时间";
            }
            let sortArr = this.getSelSort()
            if (!error && sortArr.length == 0) {
                error = "请选择订单类型";
            }
            if (error !== false) {
                utils.toast(error);
                return false;
            }
            formData.garbageType = sortArr.join(",");
            formData.address = this.data.address;
            formData.bookingDTime =
                currTimeList[this.data.bindTimeIndex] &&
                currTimeList[this.data.bindTimeIndex].bookTime;
            formData.communityName = this.data.mapName;
            formData.houseNumber = this.data.houseNumber;
            formData.addressId = this.data.addressId
            formData.buildingNumber = this.data.buildingItem.buildingNumber;
            formData.isClean = "Y";
            formData.bucketId = "test";

            return formData;
        },
        getSelSort() {
            // 获取分类的数据
            let _sortArr = []
            this.data.lable.forEach((item) => {
                // 子类
                if (item && item.children.length > 0) {
                    item.children.forEach((child) => {
                        if (child.flag === '1') {
                            _sortArr.push(child.code)
                        }
                    })
                } else {
                    if (item.flag === '1') {
                        _sortArr.push(item.code)
                    }
                }
            })
            return _sortArr
        },

        doSubMsg() {
            wx.requestSubscribeMessage({
                tmplIds: ["Hiir7mE7qPhb7Zk029NyoWAxDqr2IDK0O93rG_Zycb4"],
                success: (res) => {
                    if (res['Hiir7mE7qPhb7Zk029NyoWAxDqr2IDK0O93rG_Zycb4'] === 'accept') {
                        wx.showToast({
                            title: '订阅OK！',
                            duration: 1000,
                            success(data) {
                                //成功
                                console.log(data)
                            }
                        })
                    }
                },
                fail(err) {
                    //失败
                    console.error(err);
                }
            })
        },

        formSubmit(e) {
            if (!this.checkUserLogin()) {
                this.showLoginBox();
                return false;
            }
            console.log("form发生了submit事件，携带数据为：", e.detail.value);
            let formData = this.checkForm(e.detail.value);

            if (formData !== false) {
                api.order
                    .add(formData)
                    .then(() => {
                        redirectTo("/pages/order/tip");
                    })
                    .catch((err) => {
                        wx.showToast({
                            title: err.msg,
                            icon: "none",
                            duration: 2000,
                        });
                    });
            }
        },
        getlables() {
            api.lable
                .order()
                .then((lables) => {
                    // 获取当前时间，如果大于选项则干掉
                    let currentHours = new Date().getHours();
                    if (currentHours >= 19) {
                        currTimeList = currTimeList.slice(3);
                    } else if (currentHours >= 12) {
                        currTimeList = currTimeList.slice(2);
                    } else if (currentHours >= 7) {
                        currTimeList = currTimeList.slice(1);
                    }
                    // 新增
                    currTimeList = currTimeList.slice(0, 3)
                    lables.lable = lables.lable.sort(function (a, b) {
                        return a.sort - b.sort
                    })
                    lables.lable.forEach((item, index) => {
                        if (item && item.children.length > 0) {
                            item.children.forEach((child, cIndex) => {
                                child.pcode = item.code
                                child.pIndex = index
                                child.flag = '0'
                                child.cIndex = cIndex
                            })
                        }
                    })
                    this.setData({
                        timeArray: currTimeList,
                        lable: lables.lable,
                    });
                })
                .catch((err) => {
                    wx.showToast({
                        title: err.msg,
                        icon: "none",
                        duration: 2000,
                    });
                });
        },
        bindTimeChange: function (e) {
            this.setData({
                _currTime: currTimeList[e.detail.value].time,
                bindTimeIndex: e.detail.value,
            });
        },
        /**
         * 生命周期函数--监听页面显示
         */
        onShow() {
            currTimeList = JSON.parse(JSON.stringify(defaultTimeList));
            // 获取分类数据
            this.getlables();
        },
        onChangeAddress() {
            // 地图选择
            wx.chooseLocation({
                success: (rs) => {
                    mapMsg = rs;
                    console.log(mapMsg);
                    this.setData({
                        address: rs.address || "",
                        mapName: rs.name || "",
                    });
                    this.getBuildingList(mapMsg);
                },
            });
        },
        getBuildingList(mapMsg = {}) {
            // 获取楼宇数据
            let _params = {
                communityName: mapMsg.name,
                latitude: mapMsg.latitude,
                longitude: mapMsg.longitude,
            };
            api.order
                .buildingList(_params)
                .then((res) => {
                    this.setData({
                        buildingNumArr: res,
                    });
                })
                .catch((err) => {
                    utils.toast(err.msg);
                });
        },

        bindBuildingNumChange(e) {
            // 选择楼宇
            let _key = e.detail.value;
            if (this.data.buildingNumArr[_key]) {
                this.setData({
                    buildingNum: this.data.buildingNumArr[_key].buildingNumber || "",
                    buildingItem: this.data.buildingNumArr[_key],
                });
                this.getHouseList(this.data.buildingNumArr[_key])
            }
        },
        bindHouseNumChange(e) {
            // 选择门牌号
            let _key = e.detail.value;
            if (this.data.houseList[_key]) {
                this.setData({
                    houseNumber: this.data.houseList[_key].houseNumber || "",
                    addressId: this.data.houseList[_key].id || ''
                });
            }
        },
        getHouseList(mapMsg = {}) {
            // 获取门牌号数据
            let _params = {
                communityName: mapMsg.communityName,
                buildingNumber: mapMsg.buildingNumber
            };
            api.order
                .houseList(_params)
                .then((res) => {
                    this.setData({
                        houseList: res
                    })
                })
                .catch((err) => {
                    utils.toast(err.msg);
                });
        },

        sortHandle(e) {
            let currLabel = e.currentTarget.dataset.currlable;
            if (currLabel && currLabel.children && currLabel.children.length > 0) {
                this.setData({
                    dialogList: currLabel.children,
                    showDialog: true,
                    dialogTitle: currLabel.name,
                    dialogIndex: currLabel.children[0].pIndex
                })
            } else {
                if (this.data.lable && this.data.lable.length > 0) {
                    let findVal = this.data.lable.findIndex((item) => {
                        return item.code === currLabel.code
                    })
                    this.data.lable[findVal].flag = this.data.lable[findVal].flag === '1' ? '0' : '1'
                    this.setData({
                        lable: this.data.lable
                    })
                }
            }
        },
        sortChildHandle(e) {
            let currLabel = e.currentTarget.dataset.currlable;
            let pIndex = currLabel.pIndex
            let cIndex = currLabel.cIndex
            // 已选中
            if (currLabel && currLabel.flag === '1') {
                this.data.lable[pIndex].children[cIndex].flag = '0'
            } else {
                this.data.lable[pIndex].children[cIndex].flag = '1'
            }
            this.setData({
                lable: this.data.lable,
                dialogList: this.data.lable[pIndex].children,
            })
        },
        closeDialog() {
            // 记住选择结果
            let _dialogIndex = this.data.dialogIndex
            if (_dialogIndex !== undefined) {
                if (this.data.lable[_dialogIndex].children && this.data.lable[_dialogIndex].children.length > 0) {
                    let _selLen = 0
                    this.data.lable[_dialogIndex].children.forEach((item) => {
                        if (item.flag === '1') {
                            _selLen++
                        }
                    })
                    this.data.lable[_dialogIndex].selLen = _selLen
                    this.data.lable[_dialogIndex].flag = _selLen === 0 ? '0' : '1'
                }
            }
            this.setData({
                showDialog: false,
                lable: this.data.lable
            })
        },
        // getAddr: function (addr) {
        //     var _this = this;
        //     qqmapsdk.reverseGeocoder({
        //         location: addr || "",
        //         success: function (res) {
        //             //成功后的回调
        //             let { province, city, district } = res.result.address_component;
        //             let addrArry = [province, city, district];
        //             _this.setData({
        //                 //设置markers属性和地图位置poi，将结果在地图展示
        //                 region: addrArry,
        //             });
        //         },
        //         fail: function (error) {
        //             console.error(error);
        //         },
        //         complete: function (res) {
        //             console.log(res);
        //         },
        //     });
        // },
        // chooseImage: function (e) {
        //     var that = this;
        //     wx.chooseImage({
        //         sizeType: ["original", "compressed"], // 可以指定是原图还是压缩图，默认二者都有
        //         sourceType: ["album", "camera"], // 可以指定来源是相册还是相机，默认二者都有
        //         success: function (res) {
        //             // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        //             that.setData({
        //                 files: that.data.files.concat(res.tempFilePaths),
        //             });
        //         },
        //     });
        // },
        // previewImage: function (e) {
        //     wx.previewImage({
        //         current: e.currentTarget.id, // 当前显示图片的http链接
        //         urls: this.data.files, // 需要预览的图片http链接列表
        //     });
        // },
        // selectFile(files) {
        //     console.log("files", files);
        //     // 返回false可以阻止某次文件上传
        // },
        // uplaodFile(files) {
        //     console.log("upload files", files);
        //     // 文件上传的函数，返回一个promise
        //     return new Promise((resolve, reject) => {
        //         setTimeout(() => {
        //             reject("some error");
        //         }, 1000);
        //     });
        // },
        // uploadError(e) {
        //     console.log("upload error", e.detail);
        // },
        // uploadSuccess(e) {
        //     console.log("upload success", e.detail);
        // },


    })
);