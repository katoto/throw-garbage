const conf = require('../utils/conf.js')
const { request } = require('../utils/request.js')
const utils = require('../utils/fuc.js')
import { handleUserActionData } from '../utils/fuc.js'

function list(page) {
    let url = conf.api_url + 'getData'

    return request({
        url,
        method: 'POST',
        data: { "method": "getAd", "data": handleUserActionData({}, 'customer') }
    }).then(data => {
        let resData = [];
        for (let index = 0; index < data.length; index++) {
            data[index].id = index;
            resData.push(format(data[index]))
        }
        return { "list": resData };
    })
}

function format(row) {
    let itme = {};
    itme.id = row.id
    itme.url = conf.api_domin + row.advertisementFile;
    itme.title = row.advertisementTitle
    itme.desc = row.advertisementContent
    itme.type = row.advertisementFile.indexOf(".mp4") != -1 ? 'video' : 'img';
    itme.advertisementLink = row.advertisementLink
    return itme;
}

function mock(page) {
    let urls = [
        'https://www.w3cschool.cn/statics/demosource/movie.mp4',
        'https://www.w3cschool.cn/statics/demosource/mov_bbb.mp4',
        'https://xcx.9shenghe.com/upload/1612174670936568.mp4'
    ]

    let title = ["太阳光大、父母恩大、君子量大、小人气大", "成功是优点的发挥，失败是缺点的累积", "不要小看自己，因为人有无限的可能",
        "口说好话、心想好意、身行好事", "原谅别人就是善待自己", "手心向下是助人，手心向上是求人", "助人快乐，求人痛苦"
    ];
    let desc = ["最灵繁的人也看不见自己的背脊。——非洲",
        "最困难的事情就是认识自己。——希腊 ",
        "有勇气承担命运这才是英雄好汉。——黑塞",
        "与肝胆人共事，无字句处读书。——周恩来",
        "阅读使人充实，会谈使人敏捷，写作使人精确。——培根",
        "最大的骄傲于最大的自卑都表示心灵的最软弱无力。——斯宾诺莎 ",
        "自知之明是最难得的知识。——西班牙 ",
        "勇气通往天堂，怯懦通往地狱。——塞内加",
        "有时候读书是一种巧妙地避开思考的方法。——赫尔普斯",
        "阅读一切好书如同和过去最杰出的人谈话。——笛卡儿  ",
        "越是没有本领的就越加自命不凡。——邓拓",
        "越是无能的人，越喜欢挑剔别人的错儿。——爱尔兰 ",
        "知人者智，自知者明。胜人者有力，自胜者强。——老子",
        "意志坚强的人能把世界放在手中像泥块一样任意揉捏。——歌德",
        "最具挑战性的挑战莫过于提升自我。——迈克尔·F·斯特利  ",
        "业余生活要有意义，不要越轨。——华盛顿",
        "一个人即使已登上顶峰，也仍要自强不息。——罗素·贝克  ",
        "最大的挑战和突破在于用人，而用人最大的突破在于信任人。——马云",
        "自己活着，就是为了使别人过得更美好。——雷锋",
        "要掌握书，莫被书掌握；要为生而读，莫为读而生。——布尔沃"]
    let data = [];
    for (let index = 0; index < 5; index++) {
        let itme = {};
        itme.id = page * 5 + index
        itme.url = utils.randArrayOne(urls)
        itme.title = utils.randArrayOne(title) + (itme.id)
        itme.desc = utils.randArrayOne(desc)
        data.push(itme)
    }
    return { "list": data };
}

module.exports = {
    list
}