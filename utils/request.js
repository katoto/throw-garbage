const utils = require("./fuc");
/**
 * 判断请求状态是否成功
 * @param {number} status
 */
function isHttpSuccess(status) {
    return (status >= 200 && status < 300) || status === 304;
}
function getUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
/**
 * promise请求
 * @param {object} options {}
 */
function request(options = {}, loading = false) {
    const {
        success,
        fail,
        complete
    } = options;
    const header = {
        'content-type': 'application/json'
        //"content-type":"application/x-www-form-urlencoded"
    }
    // 统一注入约定的header
    // const header = Object.assign({
    //   [req.sessionHeaderKey]: sessionId,
    // }, options.header);
    if (loading !== false) {
        wx.showLoading({
            title: loading || '加载中',
        })
    }
    let { url, data } = options;
    if (!options.data) options.data = {}
    if (!options.data.data) options.data.data = {}
    if (options.data && options.data.data) {
        options.data.data = Object.assign({
            sessionId: utils.cache("sessionId") || ''
            // sessionId: 'M/OfeNU1dFETaR/1+qpg/w=='
        }, options.data.data)
    }
    // let requstId = getUUID();
    return new Promise((res, rej) => {
        wx.request(Object.assign(
            options,
            {
                header,
                success(r) {
                    const isSuccess = isHttpSuccess(r.statusCode);
                    if (isSuccess) { // 成功的请求状态
                        if (success) {
                            success(r.data);
                            res(r.data)
                            return;
                        }
                        // errcode >=0 代表请求成功  3/13
                        if (r.data.errcode >= 0) {//请求成功
                            if (!r.data) {
                                r.data = {}
                                r.data.data = {}
                            }
                            res(r.data.data);
                        } else {
                            rej({
                                msg: `${r.data.errmsg}）`
                            });
                        }
                    } else {
                        const err = {
                            msg: `服务器好像出了点小问题~（错误代码：${r.statusCode}）`,
                            detail: r,
                        };
                        if (fail) {
                            fail(err);
                            return;
                        }
                        rej(err);
                    }
                },
                fail(err) {
                    if (fail) {
                        fail(err);
                        return;
                    }
                    rej(err);
                },
                complete() {
                    if (loading !== false) {
                        wx.hideLoading()
                    }
                    if (complete) {
                        complete();
                        return;
                    }
                }
            },
        ));
    });
}

module.exports = {
    request
};