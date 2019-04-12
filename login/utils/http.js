import Qs from 'qs'

const app = getApp()
const http = ({
  url,
  data,
  method
}) => {
  return app.globalData.getToken.then(token =>
    new Promise((resolve, reject) => {
      //网络请求
      wx.request({
        url: app.globalData.baseUrl + url,
        data: data,
        method: method,
        header: {
          'content-type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        success: function(res) { //服务器返回数据
          if (res.data.code == 10000) {
            resolve(res)
            // wx.hideLoading()
          } else {
            // wx.hideLoading()
            reject(res)
          }
        },
        error: function(e) {
          // wx.hideLoading()
          reject('网络出错');
        }
      })
    }).catch(res => {
      wx.hideLoading()
      if (res.data.code == 40300 ||
        res.data.code == 40302 ||
        res.data.code == 40301) {
        // app.resetToken()
      }

      return Promise.resolve(res)
    })
  )
}
module.exports = {
  http
}