const app = getApp();
const api = require("../../api/index.js");

var { mixin, redirectTo, toHome } = require("../../utils/fuc.js");
var myBehavior = require("../../minxin/func.js");

let markers = [{
    id: 11111,
    latitude: 23.099994,
    longitude: 113.324520,
    name: 'T.I.T 创意园',
    label: {
        content: '创意园',
        color: '#ff00ff',
        textAlign: 'center'
    }
}]

Page(
    mixin(myBehavior, {
        data: {
            files: [],
            array: ["环卫", "保洁", "保姆", "业主", "其他"],
            zhiye: "",
            card_z: "",
            card_f: "",
            card_z_img: "",
            card_f_img: "",
            galleryShow: false,
            imgUrls: [],
            address: "",
        },
        checkForm(data) {
            let formData = {};
            let error = false;
            if (!error && data.name == "") {
                error = "请填写姓名";
            }
            if (!error && data.address == "") {
                error = "请填写详细地址";
            }
            if (!error && this.data.zhiye == "") {
                error = "请选择职业";
            }
            if (!error && data.credential == "") {
                error = "请填写工作证号";
            }
            if (!error && this.data.card_z == "") {
                error = "请上传本人照片";
            }

            if (!error && this.data.card_z_img == "") {
                error = "请等待照片上传完毕";
            }

            // if(!error && this.data.card_f_img==''){
            //   error = '请等待照片上传完毕'
            // }

            if (error !== false) {
                wx.showToast({
                    title: error,
                    icon: "none",
                    duration: 2000,
                });
                return false;
            }
            formData = Object.assign({}, formData, data);
            formData.profession = this.data.zhiye;
            formData.imageFile0 = this.data.card_z_img;
            //formData.imageFile1 = this.data.card_f_img;
            return formData;
        },
        formSubmit(e) {
            console.log("form发生了submit事件，携带数据为：", e.detail.value);
            let formData = this.checkForm(e.detail.value);
            if (formData !== false) {
                api.user
                    .bind(formData, "资料上传中")
                    .then((res) => {
                        // if (res && res.errcode === 1) {
                        //     // 已经绑定
                        //     wx.showToast({
                        //         title: res.msg,
                        //         icon: "none",
                        //         duration: 2000,
                        //     });
                        //     return false
                        // }
                        redirectTo("/pages/account/verify");
                    })
                    .catch((err) => {
                        wx.showToast({
                            title: err.msg,
                            icon: "none",
                            duration: 2000,
                        });
                        setTimeout(() => {
                            toHome();
                        }, 3000)
                    });
            }
        },

        bindZhiyeChange: function (e) {
            console.log("picker发送选择改变，携带值为", e.detail.value);
            let zhiye = this.data.array[e.detail.value];
            this.setData({
                zhiye,
            });
        },

        chooseImage: function (e) {
            let filed = e.currentTarget.dataset.type;
            var that = this;
            wx.chooseImage({
                count: 1,
                sizeType: ["original", "compressed"], // 可以指定是原图还是压缩图，默认二者都有
                sourceType: ["album", "camera"], // 可以指定来源是相册还是相机，默认二者都有
                success: function (res) {
                    // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                    console.log(filed);
                    let data = {};
                    data[filed] = res.tempFilePaths[0];
                    that.setData(data);

                    api.file
                        .up(res.tempFilePaths[0])
                        .then((rs) => {
                            console.log("up", rs);
                            let urls = {};
                            urls[filed + "_img"] = rs.data.id;
                            that.setData(urls);
                        })
                        .catch((err) => {
                            console.log("uperror", err);
                            wx.showToast({
                                title: err.msg || "上传失败",
                                icon: "none",
                                duration: 2000,
                            });
                        });
                },
            });
        },
        galleryDelete: function (e) {
            // 图片底部删除
            if (e.detail.url == this.data.card_z) {
                this.setData({ card_z: "" });
            }
            if (e.detail.url == this.data.card_f) {
                this.setData({ card_f: "" });
            }
        },
        galleryHide: function (e) { },
        previewImage: function (e) {
            let filed = e.currentTarget.dataset.type;
            let data = this.data[filed];
            this.setData({
                galleryShow: true,
                imgUrls: [data],
            });
        },
        cardTap: function (e) {
            let filed = e.currentTarget.dataset.type;
            let data = this.data[filed];
            if (data == "") {
                this.chooseImage(e);
            } else {
                this.previewImage(e);
            }
        },
        onChangeAddress() {
            wx.chooseLocation({
                success: (rs) => {
                    this.setData({
                        address: rs.address + rs.name
                    })
                }
            })
        },
    })
);
