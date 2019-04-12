const miniAuthPath = '/wechat_user/miniOauth2'
const getUserInfoPath = '/getUserInfo'
const editUserInfoPath = '/wechat_user/mini/edit'

function getToken() {
  const token = wx.getStorageSync('token')
  //  尝试获取token
  return token ?
    Promise.resolve(token) :
    new Promise((resolve, reject) => {
      wx.login({
        success: res => {
          resolve(res.code);
        },
        fail: error => {
          reject()
        }
      })
    }).then(code =>
      // 调用微信用户信息接口
      new Promise((resolve, reject) => {
        wx.getSetting({
          success: function(res) {
            if (res.authSetting['scope.userInfo']) {
              wx.getUserInfo({
                lang: 'zh_CN',
                success: function(userInfoRes) {
                  resolve({
                    code,
                    ...userInfoRes
                  })
                }
              })
            } else { //还没授权
              wx.navigateTo({
                url: '/pages/authorize/authorize',
              })
              reject(res)
            }
          }
        })
      })
    ).then(({
      code,
      userInfo,
      encryptedData,
      iv
    }) => new Promise((resolve, reject) => {
      // 将code和用户信息传输到服务端，并且获取token
      wx.request({
        url: getApp().globalData.baseUrl + miniAuthPath,
        method: 'POST',
        data: {
          auth_type: 'wechat_mini',
          code,
          encryptedData,
          iv
        },
        success: res => {
          res = res.data
          if ((res && res.code) !== 10000) {
            reject(res)
            return
          }
          // 保存用户信息至本地
          wx.setStorage({
            key: 'userInfo',
            data: userInfo,
            success: () => {
              resolve(res.data.token)
            },
            fail: (error) => {
              reject(error)
            }
          })
        }
      })
    })).then(token => {
      wx.setStorageSync('token', token)
    }).catch((error) => {
      wx.showToast({
        title: '登录失败',
        duration: 2000,
        icon: 'none'
      });
    })
}

function authorize() {
  const that = this;
  return new Promise((resolve, reject) => {
    wx.getSetting({
      success: function(res) {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            lang: 'zh_CN',
            success: function(userInfoRes) {
              resolve(userInfoRes)
            }
          })
        } else { //还没授权
          wx.redirectTo({
            url: '/pages/authorize/authorize',
          })
          reject()
        }
      }
    })
  }).then(({
    userInfo
  }) => {
    //用户昵称 用户头像存入缓存
    wx.setStorageSync('nickName', userInfo.nickName);
    wx.setStorageSync('avatarUrl', userInfo.avatarUrl);

    //然后用微信的用户信息发送给
    //我们自己的后台 更新我们后台的用户信息
    wx.request({
      url: that.globalData.baseUrl + editUserInfoPath,
      method: 'POST',
      data: {
        nickname: userInfo.nickName,
        avatar_url: userInfo.avatarUrl,
        gender: userInfo.gender,
        language: userInfo.language,
        province: userInfo.province,
        city: userInfo.city,
        country: userInfo.country
      },
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: function(res) {
        resolve()
      }
    });
  })
}

export {
  getToken,
  authorize
}