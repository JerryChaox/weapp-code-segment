import { getToken } from './permission'

App({
  onLaunch: function () {
    // 初始化获取token的Promise
    this.globalData.getToken = getToken()
  },
  globalData: {

    // 接口base地址
    baseUrl: 'https://wechat3.walkerbang.com/zhaiwo',

    // 用于处理获取token后才能发起的请求
    // 应用启动时会被初始化为Promise
    getToken: null
  }
})
