import wxApi from "./wxApi";

//数组随机取一个
function randArrayOne(arr) {
    let index = Math.floor(Math.random() * arr.length);
    return arr[index];
}
function navigateTo(url) {
    wx.navigateTo({
        url,
    });
}
function redirectTo(url) {
    wx.redirectTo({
        url,
    });
}
function switchTab(url) {
    wx.switchTab({
        url,
    });
}
function mixin() {
    return Object.assign(...arguments);
}

function vcode(date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    return [year, month, day].join("_") + "_" + [hour, minute, second].join("_");
}

function uphandle(data = [], limit = 3, option = {}) {
    let conf = Object.assign(
        {},
        {
            count: 3,
            sizeType: ["original", "compressed"],
            sourceType: ["album", "camera"],
        },
        { count: limit },
        option
    );
    const total = conf.count;
    return new Promise((resolve, reject) => {
        wx.chooseImage(
            Object.assign({}, conf, {
                success: (res) => {
                    let images = data.concat(res.tempFilePaths);
                    images = images.length <= total ? images : images.slice(0, total);
                    resolve(images);
                },
                fail: (res) => {
                    reject("选择图片失败");
                },
            })
        );
    });
}

function readFile(filePath) {
    return new Promise((resolve, reject) => {
        wx.getFileSystemManager().readFile({
            filePath: filePath, //选择图片返回的相对路径
            encoding: "base64", //编码格式
            success: (res) => {
                resolve(res.data);
            },
            fail: (err) => {
                reject(err);
            },
        });
    });
}
function upToCloud(file, name = "") {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: "file",
            data: {
                path: name || vcode(new Date()) + ".png",
                file: file,
            },
            success(_res) {
                console.log(_res);
                resolve(_res);
            },
            fail(_res) {
                console.log(_res);
                reject(_res);
            },
        });
    });
}

function formatNum(num, bit = 2) {
    num = isNaN(parseFloat(num)) ? 0 : num;
    return parseFloat(num).toFixed(bit);
}

function cache(key, val) {
    //移除
    if (val === null) {
        try {
            wx.removeStorageSync("key");
        } catch (e) { }
        return;
    }
    if (typeof val === "undefined") {
        try {
            return wx.getStorageSync(key);
        } catch (e) {
            // Do something when catch error
        }
        return;
    }
    //设置缓存
    wx.setStorage({
        key: key,
        data: val,
    });
}
function toast(msg, icon = "none", duration = 2500) {
    wx.showToast({
        title: msg,
        icon: icon,
        duration
    });
}
function toHome() {
    wx.switchTab({
        url: "/pages/order/index",
    });
}

function formatTime(time, fmt = 'yyyy-MM-dd hh:mm:ss [week]') {
    let date = new Date(time);
    var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
    };

    if (/week/.test(fmt)) {
        fmt = fmt.replace('week', _getWeek(date))
    }
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(
            RegExp.$1,
            (date.getFullYear() + "").substr(4 - RegExp.$1.length)
        );
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(
                RegExp.$1,
                RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
            );
        }
    }
    return fmt;

    function _getWeek(date) {
        switch (date.getDay()) {
            case 0:
                return '周日';
            case 1:
                return '周一'
            case 2:
                return '周二'
            case 3:
                return '周三'
            case 4:
                return '周四'
            case 5:
                return '周五'
            case 6:
                return '周六'
        }
        return date;
    }

}
// ======3/10 新增=========
let debounceFlag = true
function openPageByType(pageURL, options) {
    if (typeof pageURL !== "string") {
        throw new Error(
            "input parameter of openPageByType function must be string type"
        );
    }
    if (!debounceFlag) {
        return false
    }
    debounceFlag = false
    setTimeout(() => {
        debounceFlag = true
    }, 300)
    pageURL = pageURL.replace(/^\s*|\s*$/g, "");
    const linkType = options && options.linkType ? options.linkType : undefined;
    const urls = pageURL.split(":");
    if (!urls || urls.length < 2) {
        wxApi.showToast("跳转地址有误");
        return false;
    }
    switch (urls[0]) {
        case "http":
            wxApi.showToast("不支持http协议");
            break;
        case "https":
            wxApi.route(`/pages/h5/index?url=${encodeURIComponent(pageURL)}`);
            break;
        case "mini": //例如  mini://pages/h5/index
            wxApi.route(pageURL.substr(6), linkType);
            break;
        case "tabs": //例如  tabs://pages/cardbag/index
            wxApi.route(pageURL.substr(6), "tab");
            break;
        case "thirdmini": //跳转第三方小程序 如thirdmini:wx05f22001ff45aa90:pages/sale/merchant/index?id=190916b15d&agent=1104853
            wx.navigateToMiniProgram({
                appId: urls[1],
                path: urls.length > 2 && urls[2] ? urls[2] : "",
                extraData:
                    urls.length > 3 && urls[3]
                        ? JSON.parse(decodeURIComponent(urls[3]))
                        : {},
            });
            break;
        case "wxmapp":
            // 统一跳转小程序规范协议 如 wxmapp://mini.xx.club/?appId=wx2501a3dc577adcd3&originId=gh_a8df08dc2a7c&path=pages%2Fmovies%2Fmovie&type=0
            // [协议标识]://mini.xx.club/?appId=[小程序应用ID]&originId=[账号原始ID]&path=[encodeURIComponent(路径)]&type=[小程序版本类型]
            const { appId, path, type } = exports.parseUrlStrParamsToObj(urls[1]);
            const envVersion =
                type === "1" ? "develop" : type === "2" ? "trial" : "release";
            wx.navigateToMiniProgram({
                appId,
                path,
                envVersion,
            });
            break;
        default:
            wxApi.showToast("跳转地址有误");
    }
}

//路由
function route(url, type = "page", delta = 1) {
    console.log(
        `----------args  url:${url} type:${type} delta:${delta}------------`
    );

    if (url === undefined || url === "home" || url === "" || url === null) {
        // home类型
        type = "home";
    } else if (typeof url === "number" || url === "back") {
        // back类型
        type = "back";
        delta = url > 0 ? url : 1;
    }
    console.log(
        `----------route url:${url} type:${type} delta:${delta}------------`
    );
    switch (type) {
        case "page":
            wx.navigateTo({ url: url });
            break;
        case "back":
            wx.navigateBack({ delta: delta });
            break;
        case "tab":
            wx.switchTab({ url: url });
            break;
        case "home":
            wx.switchTab({ url: homePath });
            break;
        case "redirect":
            wx.redirectTo({ url: url });
            break;
        case "reLaunch":
            wx.reLaunch({ url: url });
            break;
        default:
            wx.switchTab({ url: homePath });
            break;
    }
};

//判断iPhone型号
function isIphoneXClassFn() {
    let isIphoneMax = false;
    try {
        let model = wxApi.getSystemInfoSync().model;
        let iPhoneArr = [
            "iPhone X",
            "iPhone XS",
            "iPhone XR",
            "iPhone XS Max",
            "iPhone 11",
            "iPhone 12",
            "iPhone11",
            "iPhone12",
            "iPhone13",
        ];
        isIphoneMax = iPhoneArr.some((item) => {
            return model.indexOf(item) > -1;
        });
    } catch (err) {
        console.log("-----isIphoneXClassFn------", err);
    }
    return isIphoneMax;
}

function openPDF(pdfURL, pdfName) {
    //检验pdfURL
    if (!pdfURL || typeof pdfURL !== "string") {
        wxApi.showToast("请输入正确的PDF地址");
        return;
    }

    pdfURL = pdfURL.trim();
    const pdfReg = /\.pdf$/i;

    if (pdfURL === "" || !pdfReg.test(pdfURL)) {
        wxApi.showToast("PDF地址格式不对");
        return;
    }

    //默认取pdfURL中的文件名
    if (!pdfName || typeof pdfName !== "string") {
        pdfName = pdfURL.split("/").pop();
    }

    //处理pdf的后缀名
    pdfName = pdfName.trim();
    if (!pdfReg.test(pdfName)) {
        pdfName = `${pdfName}.pdf`;
    }
    wxApi.showLoading();
    wx.downloadFile({
        url: pdfURL,
        filePath: `${wx.env.USER_DATA_PATH}/${pdfName}`,
        success: function (res) {
            wx.openDocument({
                filePath: res.filePath,
                success: function () {
                    wxApi.hideLoading();
                },
                fail: function (res) {
                    wxApi.showToast(res.errMsg);
                },
            });
        },
        fail: function () {
            wxApi.showToast("网络异常");
        },
    });
}

// 封装微信api
function wxAPIPromise(name) {
    return new Promise((resolve, reject) => {
        wx[name]({
            success(e) {
                resolve(e);
            },
            fail(e) {
                reject(e);
            },
        });
    });
}

function handleUserActionData(data, action = 'customer') {
    // action  customer   worker
    if (typeof data === 'object') {
        return Object.assign(data, {
            type: action === 'customer' ? 'customer' : 'worker'
        })
    }
    return data
}

module.exports = {
    toHome,
    randArrayOne,
    navigateTo,
    redirectTo,
    switchTab,
    mixin,
    vcode,
    uphandle,
    readFile,
    upToCloud,
    formatNum,
    cache,
    toast,
    formatTime,
    openPageByType,
    isIphoneXClassFn,
    openPDF,
    wxAPIPromise,
    route,
    handleUserActionData
};
