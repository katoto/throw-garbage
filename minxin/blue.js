const utils = require('../utils/fuc.js');
const startBlueIdArr = ['1E2F']
const selfServiceId = '2E3F'
const selfServiceIdChild = '3E4F'
let selfConnectFlag = false // 防止多次蓝牙
let blueWeightStr = ''
let blueWeightArr = []

// 0000FFE0-0000-1000-8000-00805F9B34FB
// 0000FFE1-0000-1000-8000-00805F9B34FB

function inArray(arr, key, val) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i][key] === val) {
            return i;
        }
    }
    return -1;
}
// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
    var hexArr = Array.prototype.map.call(
        new Uint8Array(buffer),
        function (bit) {
            return ('00' + bit.toString(16)).slice(-2)
        }
    )
    return hexArr.join('');
}

module.exports = {
    openBluetoothAdapter() {
        wx.showLoading({
          title: '连接蓝牙中...',
        })
        this.closeBluetoothAdapter()
        wx.openBluetoothAdapter({
            success: (res) => {
                console.log('openBluetoothAdapter success', res)
                this.startBluetoothDevicesDiscovery()
            },
            fail: (res) => {
                if (res.errCode === 10001) {
                    wx.onBluetoothAdapterStateChange(function (res) {
                        if (res.available) {
                            this.startBluetoothDevicesDiscovery()
                        }
                    })
                }
                wx.showModal({
                    title: '提示', content: '请检查手机蓝牙是否打开',
                })
            }
        })
    },
    startBluetoothDevicesDiscovery() {
        if (this._discoveryStarted) {
            return
        }
        this._discoveryStarted = true
        // 'FFE0', 'FFF0',, '3E4F'
        // services: ['2E3F'],
        // services: ['1e2f','2e3f', 'FFF0'],
        wx.startBluetoothDevicesDiscovery({
            services: startBlueIdArr,
            allowDuplicatesKey: true,
            powerLevel: 'high',
            success: (res) => {
                console.log('startBluetoothDevicesDiscovery success', res)
                this.onBluetoothDeviceFound()
            },
        })
    },
    onBluetoothDeviceFound() {
        // 如何检测到没有蓝牙设备 todo
        let _isFindDevice = false
        wx.onBluetoothDeviceFound((res) => {
            // 蓝牙设备发现大于一个，给用户选择蓝牙
            _isFindDevice = true
            console.log(res.devices)
            if (res.devices.length > 1) {
                res.devices.forEach(device => {
                    if (!device.name && !device.localName) {
                        return
                    }
                    const foundDevices = this.data.devices
                    const idx = inArray(foundDevices, 'deviceId', device.deviceId)
                    // devices 蓝牙列表
                    const data = {}
                    if (idx === -1) {
                        data[`devices[${foundDevices.length}]`] = device
                    } else {
                        data[`devices[${idx}]`] = device
                    }
                    this.setData(data)
                })
            } else if (res.devices[0]) {
                // 直接连接 当只有一个蓝牙时候
                let _deviceId = res.devices[0].deviceId
                const data = {}
                data[`devices[0]`] = _deviceId
                this.setData(data)
                this.createBLEConnection(_deviceId)
            } else {
                console.error('没有发现蓝牙 error', res)
            }
        })
        setTimeout(() => {
            if (!_isFindDevice) {
                utils.toast('周边没有发现蓝牙~')
            }
        }, 3000)
    },
    createBLEConnection(deviceId) {
        console.log('===createBLEConnection start 执行===')
        wx.createBLEConnection({
            deviceId,
            success: (res) => {
                // 获取蓝牙服务
                if (!selfConnectFlag) {
                    console.log('===createBLEConnection 连接===')
                    this.getBLEDeviceServices(deviceId)
                    utils.toast('蓝牙连接成功~')
                    selfConnectFlag = true
                }
            }
        })
        // 关闭蓝牙查找
        this.stopBluetoothDevicesDiscovery()
    },
    getBLEDeviceServices(deviceId) {
        // 获取蓝牙服务
        wx.getBLEDeviceServices({
            deviceId,
            success: (res) => {
                // 有多个services
                let findServer = res.services.find((item) => {
                    if (item && item.uuid) {
                        let uFlag = item.uuid.split('-')[0]
                        if (uFlag.indexOf(selfServiceId) > -1) {
                            return true
                        }
                    }
                    return false
                })
                if (findServer) {
                    // 连接服务
                    this.getBLEDeviceCharacteristics(deviceId, findServer.uuid)
                }
                console.log(res.services)
                console.log('===res.services 蓝牙服务=====')
            }
        })
    },
    getBLEDeviceCharacteristics(deviceId, serviceId) {
        // 服务中多个子服务 并起监听数据
        wx.getBLEDeviceCharacteristics({
            deviceId,
            serviceId,
            success: (res) => {
                console.log('getBLEDeviceCharacteristics success', res.characteristics)
                // 查找子服务
                let findServerChild = res.characteristics.find((item) => {
                    if (item && item.uuid) {
                        let uFlag = item.uuid.split('-')[0]
                        if (uFlag.indexOf(selfServiceIdChild) > -1) {
                            return true
                        }
                    }
                    return false
                })
                if (findServerChild) {
                    // 连接子服务
                    if (findServerChild.properties.read) {
                        wx.readBLECharacteristicValue({
                            deviceId,
                            serviceId,
                            characteristicId: findServerChild.uuid
                        })
                    }
                    if (findServerChild.properties.write) {
                        this.setData({
                            canWrite: true
                        })
                        // 写数据
                        // this._deviceId = deviceId
                        // this._serviceId = serviceId
                        // this._characteristicId = findServerChild.uuid
                        // this.writeBLECharacteristicValue()
                    }
                    if (findServerChild.properties.notify || findServerChild.properties.indicate) {
                        wx.notifyBLECharacteristicValueChange({
                            deviceId,
                            serviceId,
                            characteristicId: findServerChild.uuid,
                            state: true, // 是否启用notify通知
                        })
                    }
                }
            },
            fail(res) {
                console.error('getBLEDeviceCharacteristics', res)
            }
        })
        blueWeightArr.length = 0;
        wx.showLoading({
          title: '正在称重中...',
        })
        // 操作之前先监听，保证第一时间获取数据
        wx.onBLECharacteristicValueChange((characteristic) => {
            if (!this.data.chs) {
                this.setData({
                    chs: []
                })
            }
            const data = {}
            let _hex = ab2hex(characteristic.value);
            let _hex2Str = hexCharCodeToStr(_hex)
            if (_hex2Str && typeof (_hex2Str) === 'string') {
                if (_hex2Str.indexOf('{') > -1) {
                    blueWeightStr = _hex2Str
                } else if (_hex2Str.indexOf('}') > -1) {
                    blueWeightStr += _hex2Str
                    blueWeightArr.push(blueWeightStr)
                    console.log('======拼接结果=start====')
                    console.log(blueWeightStr)
                    console.log(blueWeightArr)
                    console.log('======拼接结果=end====')
                    if (blueWeightArr.length >= 10) {
                        wx.hideLoading();
                        this.setData({
                            blueWeightArr: blueWeightArr
                        })
                        // 可以关闭蓝牙
                        this.closeBluetoothAdapter && this.closeBluetoothAdapter()
                        this.weighOk && this.weighOk()
                    }
                } else {
                    blueWeightStr += _hex2Str
                }
            }
            // console.log('=====接收到的数据=start=====')
            // console.log(_hex2Str)
            // console.log('=====接收到的数据=end=====')
            function hexCharCodeToStr(hexCharCodeStr) {
                var trimedStr = hexCharCodeStr.trim();
                var rawStr =
                    trimedStr.substr(0, 2).toLowerCase() === "0x"
                        ?
                        trimedStr.substr(2)
                        :
                        trimedStr;
                var len = rawStr.length;
                if (len % 2 !== 0) {
                    alert("Illegal Format ASCII Code!");
                    return "";
                }
                var curCharCode;
                var resultStr = [];
                for (var i = 0; i < len; i = i + 2) {
                    curCharCode = parseInt(rawStr.substr(i, 2), 16); // ASCII Code Value
                    resultStr.push(String.fromCharCode(curCharCode));
                }
                return resultStr.join("");
            }

            // if (idx === -1) {
            //     // chs中无characId 的数据
            //     data[`chs[${this.data.chs.length}]`] = {
            //         uuid: characteristic.characteristicId,
            //         value: ab2hex(characteristic.value), // characteristic.value.toString()
            //     }
            // } else {
            //     // 有数据，应该拼接处理
            //     var _hex = ab2hex(characteristic.value);
            //     function hexCharCodeToStr(hexCharCodeStr) {
            //         var trimedStr = hexCharCodeStr.trim();
            //         var rawStr =
            //             trimedStr.substr(0, 2).toLowerCase() === "0x"
            //                 ?
            //                 trimedStr.substr(2)
            //                 :
            //                 trimedStr;
            //         var len = rawStr.length;
            //         if (len % 2 !== 0) {
            //             alert("Illegal Format ASCII Code!");
            //             return "";
            //         }
            //         var curCharCode;
            //         var resultStr = [];
            //         for (var i = 0; i < len; i = i + 2) {
            //             curCharCode = parseInt(rawStr.substr(i, 2), 16); // ASCII Code Value
            //             resultStr.push(String.fromCharCode(curCharCode));
            //         }
            //         return resultStr.join("");
            //     }
            //     let _hex2Str = hexCharCodeToStr(_hex)
            //     if (_hex2Str && typeof (_hex2Str) === 'string') {
            //         if (_hex2Str.indexOf('{') > -1) {
            //             blueWeightStr = _hex2Str
            //         } else if (_hex2Str.indexOf('}') > -1) {
            //             blueWeightArr.push(blueWeightStr)
            //             this.setData({
            //                 blueWeightArr: blueWeightArr
            //             })
            //         } else {
            //             blueWeightStr += _hex2Str
            //         }
            //     }
            //     // data[`chs[${this.data.chs.length}]`] = {
            //     //     value: _hex2Str,
            //     // }
            //     console.log('=====接收到的数据=start=====')
            //     console.log(_hex2Str)
            //     console.log('=====接收到的数据=end=====')
            // }
        })
    },
    stopBluetoothDevicesDiscovery() {
        // 关闭蓝牙查找
        wx.stopBluetoothDevicesDiscovery()
    },
    closeBluetoothAdapter() {
        wx.closeBluetoothAdapter()
        this._discoveryStarted = false
        selfConnectFlag = false
    },
}