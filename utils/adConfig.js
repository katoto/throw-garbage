
const server = "https://xcx.9shenghe.com/"; // 测送环境
const app = getApp(), api = app.require("api/user"), fuc = app.require("utils/fuc");


   // 丢垃圾 
const homeServer = {
    swiper1: server + "develop/upload/img/ad/ad02.png",
    swiper2: server + "develop/upload/img/ad/fl01.png",
    swiper3: server + "develop/upload/img/ad/fl02.png",
    swiper: [
      server + "develop/upload/img/ad/ad02.png",
      server + "develop/upload/img/ad/fl01.png",
      server + "develop/upload/img/ad/fl02.png"
    ],
    videoPoster: server + "upload/img/video/1612174670936568.jpg",
    video: server + "upload/img/video/1612174670936568.mp4"
}
// 取垃圾
const fetchServer = {
  swiper: [server + "develop/upload/img/ad/fl02.png"]
}

// 提现 
const atmServer = {
  banner: server + "develop/upload/img/ad/fl01.png",
  banner1: server + "develop/upload/img/ad/fl02.png",
  swiper: [
    server + "develop/upload/img/ad/fl01.png",
  ]
}

 // 奖励清晰
 const distinctServer = {
   swiper: [
    server + "develop/upload/img/ad/fl02.png"
   ]
 }

// 订单完成 
const compServer = {
  banner: server + "develop/upload/img/ad/fl02.png",
  swiper: [server + "develop/upload/img/ad/fl02.png"]
}

// 下单成功 
const succServer = {
  video: server + "upload/img/video/1612174670936568.mp4",
  poster: server + "upload/img/video/1612174670936568.jpg"
}

// 评论 
const commoentServer = {
  banner: server + "develop/upload/img/ad/fl01.png",
  swiper: [server + "develop/upload/img/ad/fl01.png"]
}

// 待抢订单 
const robOrder = {
  swiper: [
    server + "develop/upload/img/ad/ad02.png",
    server + "develop/upload/img/ad/fl01.png", 
    server + "develop/upload/img/ad/fl02.png",
  ]
}

let banner  = {
  homeServer,
  fetchServer,
  atmServer,
  compServer,
  succServer,
  commoentServer,
  robOrder,
  distinctServer,
  order:{
    swiper:[ server + "develop/upload/img/ad/fl01.png"]
  }
}

const getBannerApi =  () => {
  return new Promise((resolve)=> {
    api.getBanner().then(data =>{
      data.forEach(item =>{
        if(item.bannerLocation === '2') banner.homeServer.swiper = item.fileUrl.split(",");
        else if(item.bannerLocation === '3') banner.atmServer.swiper = item.fileUrl.split(",");
        else if(item.bannerLocation === '4') banner.order.swiper = item.fileUrl.split(",");
        else if(item.bannerLocation === '6') banner.fetchServer.swiper = item.fileUrl.split(",");
        else if(item.bannerLocation === '8') banner.compServer.swiper = item.fileUrl.split(",");
        else if(item.bannerLocation === '9') banner.commoentServer.swiper = item.fileUrl.split(",");
        else if(item.bannerLocation === '10') banner.robOrder.swiper = item.fileUrl.split(",");
      })
      fuc.cache("banner",banner);
      resolve(banner);
    }).catch(err=>{
      fuc.cache("banner",banner);
    })
  }) 
}

const defaultTypeOptions = [
  {
    label: "丢垃圾首页视频",
    value: "1",
    type: "video",
  },
  {
    label: "丢垃圾首页底部广告",
    value: "2",
    type: "video",
  },
  {
    label: "清晰奖励页面广告",
    value: "3",
    type: "img",
  },
  {
    label: "下单页面广告",
    value: "4",
    type: "img",
  },
  {
    label: "下单成功页顶部视频",
    value: "5",
    type: "video",
  },
  {
    label: "取垃圾首页底部广告",
    value: "6",
    type: "img",
  },
  {
    label: "取垃圾可提现页面广告",
    value: "7",
    type: "img",
  },
  {
    label: "取垃圾已完成页面广告",
    value: "8",
    type: "img",
  },
  {
    label: "评价页面广告",
    value: "9",
    type: "img",
  },
  {
    label: "待抢单列表页广告",
    value: "10",
    type: "img",
  },
];

module.exports = {
  getBannerApi,
  banner
} 