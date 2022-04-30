var {
    mixin,
    redirectTo
} = require('../../utils/fuc.js');
var myBehavior = require('../../minxin/func.js')

const app = getApp(), adConfig = app.require("utils/adConfig");
const api = require('../../api/index.js');
var utils = require('../../utils/fuc.js');

Page(mixin(myBehavior, {
    /**
     * 页面的初始数据
     */
    data: {
        time: '2002.12.12 06:09',
        tel: '',
        lable: [],
        orders: [],
        files: [],
        complaintsSelects: [0,1,2],
        commoentServer: utils.cache("banner").commoentServer
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // this.getNoCommentOrder();
        //电话
        api.contact.info().then(res => {
            console.log(res)
            this.setData({
                tel: res.phone
            })
        })

        //标签类型
        api.lable.tousu().then(lables => {
            let lable = this.data.lable;
            this.lables = lables;
            let arr1 = [], arr2 = [], arr3 = []; 
            lables.forEach(item =>{
                item.checked = false;
                if(item.value === "01" || item.value === "02" || item.value === "03") item.checked = true;
                if(item.value === "01" || item.value === "04") arr1.push(item);
                if(item.value === "02" || item.value === "05") arr2.push(item);
                if(item.value === "03" || item.value === "06") arr3.push(item);
            })
            lable.push(arr1,arr2,arr3);
            this.setData({lable})
        }).catch((err) => {
            console.log(err);
            wx.showToast({
                title: err.msg,
                icon: 'none',
                duration: 2000
            })
        })

        this.setData({
            selectFile: this.selectFile.bind(this),
            uplaodFile: this.uplaodFile.bind(this)
        })
    },

    getNoCommentOrder() {
        api.order.noPj({
            "openId": app.openId()
        }).then(res => {
            if (res.length == 0) {
                return utils.redirectTo('/pages/form/order')
            } else {
                this.setData({
                    orders: res
                })
            }
        })
    },
    jump2Order() {
        if (!this.checkUserLogin()) {
            this.showLoginBox()
            return true;
        }
        wx.reportAnalytics("skip_comment",{
            url: this.isCurrentPage(),
            text:"评价跳过"
        });

        // 跳过是否默认评价 ？
        api.order.defEvaluate({}).then(() => {
            setTimeout(() => {
                utils.openPageByType('mini://pages/form/order', {
                    linkType: 'redirect'
                })
            }, 100)
        })
    },

    isCurrentPage() {
        /*获取当前页url*/
        var pages = getCurrentPages() //获取加载的页面
        var currentPage = pages[pages.length - 1] //获取当前页面的对象
        return currentPage.route //当前页面url
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () { },

    previewImage: function (e) {
        wx.previewImage({
            current: e.currentTarget.id, // 当前显示图片的http链接
            urls: this.data.files // 需要预览的图片http链接列表
        })
    },
    selectFile(files) {
        console.log('files', files)
        // 返回false可以阻止某次文件上传
    },
    uplaodFile(files) {
        var that = this;
        console.log('upload files', files)
        // 文件上传的函数，返回一个promise
        let promiseFn = [];
        for (let index = 0; index < files.tempFilePaths.length; index++) {
            promiseFn[index] = api.file.up(files.tempFilePaths[index]).then(rs => {
                return rs.data.fileUrl
            })
        }

        return Promise.all([...promiseFn]).then((result) => {
            return {
                "urls": result
            }
            //return Promise.resolve({"urls":result})
        })
    },
    uploadError(e) {
        console.log('upload error', e.detail)
    },
    uploadSuccess(e) {
        console.log('upload success', e.detail)
    },

    radioChange0(e) {
        let value = e.detail.value;
        this.lables.forEach((item, index) =>{
            if(item.value === value) this.data.complaintsSelects[0] = index;
        })
    },

    radioChange1(e) {
        let value = e.detail.value;
        this.lables.forEach((item, index) =>{
            if(item.value === value) this.data.complaintsSelects[1] = index;
        })
    },
    radioChange2(e) {
        let value = e.detail.value;
        this.lables.forEach((item, index) =>{
            if(item.value === value) this.data.complaintsSelects[2] = index;
        })
    },

    checkForm: function (data) {
        let formData = {};
        let error = false;
        if (error !== false) {
            wx.showToast({
                title: error,
                icon: 'none',
                duration: 2000,
                files: []
            })
            return false;
        }

        formData.openId = app.globalData.openId;
        formData.complaintsSelects = this.data.complaintsSelects.join(',')
        formData.comment = data.comment
        formData.imageFile0 = ''
        formData.imageFile1 = ''
        formData.imageFile2 = ''
        return formData;
    },
    formSubmit: function (e) {
        console.log('form发生了submit事件，携带数据为：', e.detail.value)
        let formData = this.checkForm(e.detail.value);
        if (formData !== false) {
            api.order.comment(formData).then(() => {
                redirectTo('/pages/form/order')
            }).catch((err) => {
                console.log(err);
                wx.showToast({
                    title: err.msg || err.errmsg,
                    icon: 'none',
                    duration: 2000
                })
            });
        }
    },

}))