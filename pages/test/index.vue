<template>
  <van-popup
    v-if="couponList && couponList.length > 0"
    v-model="show"
    :overlay-style="{
      backgroundColor: 'rgba(0, 0, 0, 0.5)'
    }"
    round
    :close-on-popstate="closeOnPopstate"
    :close-on-click-overlay="closeOnClickOverlay"
  >
    <div class="close" @click="closed">
      <img
        src="https://ops-img-static.huolala.cn/imgs/2022/165642202223349139225642.png"
        alt="close"
      />
    </div>
    <div class="modal-content">
      <div class="title">恭喜获得新人券</div>
      <div class="coupon-body">
        <coupon-line
          v-for="(item, ind) in couponList"
          :config="item"
          :key="ind"
        />
      </div>
      <p class="confirm" @click="go2CouponUse">立即使用</p>
      <p class="tips">可前往【我的】-【优惠券】 查看</p>
    </div>
  </van-popup>
</template>

<script>
import { addParamsToUrl } from "@/tools";
import { UNI_REFUEL_LINK } from "@/config";
import { mapGetters } from "vuex";
import CouponLine from "./coupon-line";

export default {
  name: "TuanGasNewCouponModal",
  components: {
    CouponLine
  },
  timer: null,
  data() {
    return {
      show: false,
      confirm: false,
      closeOnPopstate: false,
      closeOnClickOverlay: false,
      btnDisabled: true,
      link: UNI_REFUEL_LINK,
      couponList: []
    };
  },
  created() {
    this.$bus.$on("agreeBusiCouponListEvt", couponList => {
      if (couponList && couponList.length > 0) {
        this.couponList = this.couponSort(couponList);
        this.handleShow(true);
      }
    });
  },
  methods: {
    openLink(url) {
      const urlWithParams = addParamsToUrl(
        url,
        this.$store.state.App.urlParams
      );
      this.$openLink(urlWithParams);
    },
    checkboxConfirm() {
      this.confirm = !this.confirm;
    },
    go2CouponUse() {
      // 跳转可用券页面
      if (this.couponList && this.couponList.length > 0) {
        this.$router.push({
          path: "/coupon-canuse",
          query: {
            partner_id: this.couponList[0].partner_id,
            coupon_id: this.couponList[0].coupon_id
          }
        });
      }
      this.closed();
    },
    closed() {
      this.handleShow(false);
    },

    couponSort(arr = []) {
      // 过滤其他类型的数据, 仅保留团油
      const nArr = arr.filter(item => {
        return item.partner_id === 1;
      });
      // 按照券面额/门槛金额的比例由大到小排序
      nArr.sort((a, b) => {
        const aPercentage = (+a.coupon_money / +a.coupon_condition_money) * 100;
        const bPercentage = (+b.coupon_money / +b.coupon_condition_money) * 100;
        return bPercentage - aPercentage;
      });
      return nArr;
    },
    handleShow(val) {
      this.show = val;
      if (this.$route.path === "/" || this.$route.path === "/refuel") {
        document.body.style.overflow = val ? "hidden" : "";
      }
    }
  }
};
</script>

<style scoped lang="less">
.van-popup {
  overflow: visible;
}
.van-popup--center.van-popup--round {
  border-radius: 14px;
}
.modal-content {
  width: 292px;
  background: #e71100;
  border-radius: 14px;
  max-height: 421px;
  min-height: 230px;
  position: relative;

  .title {
    font-size: 22px;
    font-family: PingFangSC, PingFangSC-Medium;
    font-weight: bold;
    text-align: left;
    color: rgba(256, 256, 256, 0.9);
    line-height: 30px;
    width: 292px;
    height: 61px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #ff3121
      url("https://ops-img-static.huolala.cn/imgs/2022/165641056433954754444505.png")
      no-repeat top center;
    background-size: cover;
    overflow: hidden;
    border-top-left-radius: 14px;
    border-top-right-radius: 14px;
  }

  .coupon-body {
    max-height: 242px;
    overflow-y: scroll;
    background: #ff3121;
  }
}

.close {
  position: absolute;
  top: -26px;
  right: -18px;
  img {
    width: 28px;
    height: 28px;
  }
}
.confirm {
  width: 262px;
  height: 45px;
  background: linear-gradient(180deg, #fff5c4, #ffac00);
  border-radius: 23px;
  box-shadow: 0px 2px 7px 0px #e01000,
    0px 1px 3px 0px rgba(255, 255, 255, 0.5) inset;
  font-size: 20px;
  font-weight: bold;
  color: #6c2800;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 22px auto 0;
}

.tips {
  font-size: 12px;
  color: #ffc390;
  text-align: center;
  padding: 7px 0 22px 0;
}
</style>
