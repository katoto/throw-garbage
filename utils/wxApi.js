const homePath = "/pages/order/index"; //首页路径，例如 /pages/privilege/index
/**
 *
 * 【函数名与微信API名尽量保持一致】
 *
 * 1、只封装小程序接口，禁止添加与小程序接口无关的功能；
 * 2、全局统一使用，统一调整，快速应对小程序接口变更的情况。
 *
 */

//消息toast
exports.showToast = (title, duration = 1500) => {
  if (!title) return;
  wx.showToast({
    title: title,
    icon: "none",
    duration: duration,
    mask: true,
  });
};

//展示loading
exports.showLoading = (title = "加载中...") => {
  wx.showLoading({
    title: title,
    mask: true,
  });
};

//隐藏loading
exports.hideLoading = () => {
  wx.hideLoading();
};

//路由
exports.route = (url, type = "page", delta = 1) => {
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

//读取指定缓存
exports.getStorageSync = (key) => {
  return wx.getStorageSync(key);
};

//写入指定缓存
exports.setStorageSync = (key, value) => {
  return wx.setStorageSync(key, value);
};

//删除指定缓存
exports.removeStorageSync = (key) => {
  return wx.removeStorageSync(key);
};

//获取系统信息
exports.getSystemInfoSync = () => {
  return wx.getSystemInfoSync();
};

//消息订阅
exports.requestSubscribeMessage = (tmplIds, complete, success, fail) => {
  // 兼容模板id只有一个的情况
  if (typeof tmplIds === "string") {
    tmplIds = [tmplIds];
  }

  // 校验入参
  if (!Array.isArray(tmplIds)) return;

  return wx.requestSubscribeMessage({
    tmplIds,
    complete,
    success,
    fail,
  });
};
