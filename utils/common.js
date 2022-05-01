// NFC 识别读取
const app = getApp(),
  myBehavior = app.require("minxin/func"),
  wxApi = app.require("utils/wxApi"),
  { toast, cache } = app.require("utils/fuc");
const userApi = app.require("api/user");
let nfcAdapter = wx.getNFCAdapter();
let startDiscoveryFlag = false;
let tryTime = 5; // 查询nfc 次数
let receiveEvent = null;
// 初始化 NFC
const init = (func) => {
  if (!myBehavior.checkUserLogin()) return myBehavior.showLoginBox();
  //连接设备 暂时nfc
  if (!nfcAdapter) nfcAdapter = wx.getNFCAdapter();
  nfcAdapter.offDiscovered(coverHandler);
  nfcAdapter.onDiscovered(coverHandler);
  nfcAdapter.stopDiscovery();
  connectEvent(nfcAdapter);
  receiveEvent = func;
};

// 接受NFC信息
function coverHandler(res) {
  let _nfcId = wx.arrayBufferToBase64(res.id);
  receiveEvent(_nfcId);
}
// 检测NFC功能是否打开
const connectEvent = (nfcAdapter) => {
  nfcAdapter &&
    nfcAdapter.startDiscovery({
      success() {
        // NFC 功能已打开
        startDiscoveryFlag = true;
        console.log("NFC已打开");
        wxApi.hideLoading();
      },
      fail(res) {
        if (
          res &&
          res.errMsg &&
          res.errMsg === "startDiscovery:fail current platform is not supported"
        ) {
          toast("当前设备不支持NFC，请换设备~", "none", 6000);
        } else {
          if (tryTime > 0) {
            wxApi.showLoading("NFC连接中请稍后...");
            tryTime--;
            setTimeout(() => {
              connectEvent(nfcAdapter);
            }, 1500);
          } else {
            toast("操作失败，请检查NFC是否打开");
          }
        }
      },
    });
};
function breakEvent() {
  nfcAdapter && nfcAdapter.stopDiscovery();
  nfcAdapter && nfcAdapter.offDiscovered(coverHandler);
}

const plugin = {
  NFC: {
    init,
    breakEvent,
    nfcAdapter,
  },
};

function com_getUserAvatar() {
  return new Promise((resolve) => {
    if (cache("userAvatar")) {
      resolve(true);
      return true;
    }
    userApi.info().then((res) => {
      let { avatarUrl, nickname } = res;
      cache("userAvatar", {
        avatarUrl,
        nickname,
      });
      resolve(true);
    });
  });
}

module.exports = {
  plugin,
  com_getUserAvatar,
};
