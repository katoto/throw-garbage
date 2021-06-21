const server = "https://xcx.9shenghe.com/"; // 测送环境

// 丢垃圾 
const homeServer = {
  swiper1 : server + "upload/img/ad/ad02.png",
  swiper2 : server + "develop/upload/img/ad/fl01.png",
  swiper3 : server + "develop/upload/img/ad/fl02.png",
  videoPoster: server + "upload/img/video/1612174670936568.jpg",
  video: server + "upload/img/video/1612174670936568.mp4"
} 

// 取垃圾
const fetchServer = {
  banner: server + "develop/upload/img/ad/fl02.png"
}

// 提现 
const atmServer = {
  banner: server + "develop/upload/img/ad/fl01.png",
  banner1: server + "develop/upload/img/ad/fl02.png"
}

// 订单完成 
const compServer = {
  banner : server + "/evelop/upload/img/ad/fl02.png"
}

// 下单成功 
const succServer = {
  video : server + "upload/img/video/1612174670936568.mp4",
  poster: server + " upload/img/video/1612174670936568.jpg"
}

// 评论 
const commoentServer = {
  banner : server + "develop/upload/img/ad/fl01.png"
}

  module.exports = {
  homeServer,
  fetchServer,
  atmServer,
  compServer,
  succServer,
  commoentServer
} 