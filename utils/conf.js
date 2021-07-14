let domin = 'https://xcx.9shenghe.com/release';
let map_key = 'RBUBZ-M3W64-XQUUM-XMIFE-2U7C2-MNF4H'; // 正式
let env_version = 'release'; // develop 开发版 trial 体验版 release 正式版
const _accountInfo = wx.getAccountInfoSync();
if (_accountInfo && _accountInfo.miniProgram && _accountInfo.miniProgram.envVersion) {
    switch (_accountInfo.miniProgram.envVersion) {
        case 'trial':
        case 'develop':
            env_version = 'develop';
            map_key = 'BLBBZ-3VG6W-NL7RM-RJ7XV-VKGQH-3XBBZ' // 测试
            domin = 'https://xcx.9shenghe.com/develop'
            //domin = 'http://localhost:8080'
            break;
    }
}

module.exports = {
    map_key,
    env_version,
    api_domin: domin,
   // api_url: domin + '/wx/service/',
    api_url: domin + '/jeesite/wx/service/',
    // api_url: 'http://192.168.3.59:8080/wx/service/',
    up_url: domin + '/jeesite/FileManage/FileCenter/upload'
}