const api = require("../../api/index.js");
const app = getApp();
const adConfig = require("../../utils/adConfig");
let mapMsg = null;
var { mixin, redirectTo, formatTime } = require("../../utils/fuc.js");
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
let defaultTimeList = [
  {
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
      houseNumberCode: "",
      addressId: "",
      buildingNum: "",
      buildingItem: "",
      _currTime: "请选择预约时间",
      bindTimeIndex: "",
      dialogList: [],
      showDialog: false,
      dialogTitle: "",
      adServers: utils.cache("banner").order,
      isScroll: false,
      addrFlag: false,
    },

    checkForm: function (data) {
      let formData = {};
      let error = false;
      if (!error && !this.data.buildingNum) {
        error = "请选择楼宇号信息";
      }
      if ((!error && !this.data.houseNumberCode) || !this.data.addressId) {
        error = "请选择门牌号";
      }
      if (!error && !this.data.bindTimeIndex) {
        error = "请选择预约时间";
      }
      let sortArr = this.getSelSort();
      if (!error && sortArr.parentGarbageType.length == 0) {
        error = "请选择订单类型";
      }
      if (error !== false) {
        utils.toast(error);
        return false;
      }
      formData.parentGarbageType = sortArr.parentGarbageType.join(",");
      formData.garbageType = JSON.stringify(sortArr.garbageType);
      formData.address = this.data.address;
      formData.bookingDTime =
        currTimeList[this.data.bindTimeIndex] &&
        currTimeList[this.data.bindTimeIndex].bookTime;
      formData.communityName = this.data.mapName;
      formData.houseNumber = this.data.houseNumberCode;
      formData.addressId = this.data.addressId;
      formData.buildingNumber = this.data.buildingItem.buildingNumber;
      formData.isClean = "Y";
      formData.bucketId = "test";

      return formData;
    },
    getSelSort() {
      // 获取分类的数据
      let _sortArr = {
        parentGarbageType: [],
        garbageType: [],
      };
      this.data.lable.forEach((item) => {
        if (item.flag == 1) {
          _sortArr.parentGarbageType.push(item.id);
          if (item && item.children && item.children.length > 0) {
            item.children.forEach((child) => {
              if (child.number > 0) {
                let obj = {
                  number: child.number,
                  unit: child.unit,
                  id: child.id,
                  name: child.name,
                };
                _sortArr.garbageType.push(obj);
              }
            });
          }
          if (item && item.id == 200 && item.flag == 1) {
            let obj = {
              id: item.id,
              name: item.name,
            };
            _sortArr.garbageType.push(obj);
          }
        }
      });
      return _sortArr;
    },

    doSubMsg() {
      wx.requestSubscribeMessage({
        tmplIds: ["Hiir7mE7qPhb7Zk029NyoWAxDqr2IDK0O93rG_Zycb4"],
        success: (res) => {
          if (res["Hiir7mE7qPhb7Zk029NyoWAxDqr2IDK0O93rG_Zycb4"] === "accept") {
            wx.showToast({
              title: "订阅OK！",
              duration: 1000,
              success(data) {
                //成功
                console.log(data);
              },
            });
          }
        },
        fail(err) {
          //失败
          console.error(err);
        },
      });
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
            let addrData = Object.assign(
              {},
              formData,
              this.mapMsgs,
              this.buildingIndex
            );
            console.log(addrData);
            utils.cache("orderAddress", addrData);
            redirectTo("/pages/order/tip");
          })
          .catch((err) => {
            if (err.msg && err.msg.includes("请联系:")) {
              wx.showModal({
                title: "",
                content: err.msg,
                showCancel: false,
              });
            } else {
              wx.showToast({
                title: err.msg,
                icon: "none",
                duration: 2500,
              });
            }
          });
      }
    },
    getlables() {
      api.lable
        .order()
        .then((lables) => {
          console.log(lables);
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
          currTimeList = currTimeList.slice(0, 3);
          lables = lables.sort(function (a, b) {
            return a.sort - b.sort;
          });
          lables.forEach((item, index) => {
            if (item.id === "200") {
              item.activeColor = "act-color-green";
            } else if (item.id === "206") {
              item.activeColor = "act-color-gray";
            } else {
              item.activeColor = "act-color-blue";
            }
            if (item && item.children && item.children.length > 0) {
              item.children.forEach((child, cIndex) => {
                child.pcode = item.code;
                child.pIndex = index;
                child.flag = "0";
                child.cIndex = cIndex;
                child.number = 0;
              });
            }
          });
          this.setData({
            timeArray: currTimeList,
            lable: lables,
          });
        })
        .catch((err) => {
          wx.showToast({
            title: err.msg,
            icon: "none",
            duration: 2500,
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
    onLoad() {
      console.log('===========')
      currTimeList = JSON.parse(JSON.stringify(defaultTimeList));
      // 获取分类数据
      this.getlables();
      this.loadAddress();
      this.getBannerList();
    },

    getBannerList() {
      adConfig.getBannerApi().then((res) => {
        this.setData({
          adServers: res.order,
        });
      });
    },
    loadAddress() {
      let addr = utils.cache("orderAddress");
      if (!addr) return false;
      this.getBuildingList(addr);
      this.setData({
        mapName: addr.communityName,
        addressId: addr.addressId,
        address: addr.address,
        communityName: addr.communityName,
        buildingNum: addr.buildingNumber,
        buildingNumber: addr.buildingNumber,
        houseNumberCode: addr.houseNumber,
      });
    },

    onChangeAddress() {
      // 地图选择
      wx.chooseLocation({
        success: (rs) => {
          mapMsg = rs;
          this.setData({
            address: rs.address || "",
            mapName: rs.name || "",
            addrFlag: true,
          });
          this.getBuildingList(mapMsg);
        },
      });
    },
    getBuildingList(mapMsg = {}) {
      // 获取楼宇数据
      let _params = {
        communityName: mapMsg.name || mapMsg.communityName,
        latitude: mapMsg.latitude,
        longitude: mapMsg.longitude,
      };
      this.mapMsgs = _params;
      let that = this;
      api.order
        .buildingList(_params)
        .then((res) => {
          if (res.length <= 0) {
            wx.showModal({
              title: "提示",
              content: "当前区域暂未开通代丢服务",
              showCancel: false,
              success(res) {
                wx.navigateBack();
              },
            });
          }
          this.setData({
            buildingNumArr: res,
          });
          let addr = utils.cache("orderAddress");
          if (addr && !this.data.addrFlag)
            this.bindBuildingNumChange(false, Number(addr.buildingIndex));
        })
        .catch((err) => {
          utils.toast(err.msg);
        });
    },

    bindBuildingNumChange(e = false, index) {
      // 选择楼宇
      let _key = typeof index == "number" ? Number(index) : e.detail.value;
      this.buildingIndex = { buildingIndex: _key };
      if (this.data.buildingNumArr[_key]) {
        let houseNumberCode = e ? "" : this.data.houseNumberCode;
        this.setData({
          buildingNum: this.data.buildingNumArr[_key].buildingNumber || "",
          buildingItem: this.data.buildingNumArr[_key],
          houseNumberCode,
        });
        this.getHouseList(this.data.buildingNumArr[_key]);
      }
    },
    bindHouseNumChange(e) {
      // 选择门牌号
      let _key = e.detail.value;
      if (this.data.houseList[_key]) {
        this.setData({
          houseNumberCode: this.data.houseList[_key].houseNumber || "",
          addressId: this.data.houseList[_key].id || "",
        });
      }
    },
    getHouseList(mapMsg = {}) {
      // 获取门牌号数据
      let _params = {
        communityName: mapMsg.communityName,
        buildingNumber: mapMsg.buildingNumber,
      };
      api.order
        .houseList(_params)
        .then((res) => {
          this.setData({
            houseList: res,
          });
        })
        .catch((err) => {
          utils.toast(err.msg);
        });
    },

    sortHandle(e) {
      let currLabel = e.currentTarget.dataset.currlable;
      const index = e.currentTarget.dataset.index;
      if (currLabel && currLabel.children && currLabel.children.length > 0) {
        this.setData({
          dialogList: currLabel.children,
          updataType: this.data.lable[index].children,
          showDialog: true,
          dialogTitle: currLabel.name,
          dialogIndex: currLabel.children[0].pIndex,
        });
      } else {
        if (this.data.lable && this.data.lable.length > 0) {
          let findVal = this.data.lable.findIndex((item) => {
            return item.code === currLabel.code;
          });
          this.data.lable[findVal].flag =
            this.data.lable[findVal].flag === "1" ? "0" : "1";
          this.setData({
            lable: this.data.lable,
          });
        }
      }
    },
    sortChildHandle(e) {
      let currLabel = e.currentTarget.dataset.currlable;
      let pIndex = currLabel.pIndex;
      let cIndex = currLabel.cIndex;
      // 已选中
      if (currLabel && currLabel.flag === "1") {
        this.data.lable[pIndex].children[cIndex].flag = "0";
      } else {
        this.data.lable[pIndex].children[cIndex].flag = "1";
      }
      this.setData({
        lable: this.data.lable,
        dialogList: this.data.lable[pIndex].children,
      });
    },
    closeDialog() {
      // 记住选择结果
      let _dialogIndex = this.data.dialogIndex;
      if (_dialogIndex !== undefined) {
        if (
          this.data.lable[_dialogIndex].children &&
          this.data.lable[_dialogIndex].children.length > 0
        ) {
          let _selLen = 0;
          this.data.lable[_dialogIndex].children.forEach((item) => {
            if (item.flag === "1") {
              _selLen++;
            }
          });
          this.data.lable[_dialogIndex].selLen = _selLen;
          this.data.lable[_dialogIndex].flag = _selLen === 0 ? "0" : "1";
        }
      }
      this.setData({
        showDialog: false,
        lable: this.data.lable,
      });
    },

    childhandleNumber(e) {
      const type = e.currentTarget.dataset.type;
      const item = e.currentTarget.dataset.item;
      if (type === "add" && item.number < 9999) {
        let dialogList = this.data.dialogList.map((val, index) => {
          if (index == item.cIndex)
            val.number = item.number + (item.unit != "千克" ? 1 : 0.5);
          return val;
        });
        this.setData({ dialogList });
      }
      if (type === "subtract" && item.number >= 1) {
        let dialogList = this.data.dialogList.map((val, index) => {
          if (index == item.cIndex)
            val.number = item.number - (item.unit != "千克" ? 1 : 0.5);
          return val;
        });
        this.setData({ dialogList });
      }
      const flag = this.data.dialogList.find((item) => item.number > 0);
      this.data.lable[item.pIndex].flag = flag ? "1" : "0";
      this.setData({ lable: this.data.lable });
    },

    childHandleConfirm() {
      const index = this.data.dialogIndex;
      this.data.lable[index].children = this.data.dialogList;
      this.setData({
        showDialog: false,
        lable: this.data.lable,
      });
    },

    childHandleCancel() {
      const index = this.data.dialogIndex;
      const flag = this.data.updataType.find((item) => item.number > 0);
      console.log(flag);
      this.data.lable[index].flag = flag ? "1" : "0";
      this.setData({
        dialogList: this.data.updataType,
        showDialog: false,
        lable: this.data.lable,
      });
    },
  })
);
