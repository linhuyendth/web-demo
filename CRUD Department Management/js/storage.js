// với localStorage là rememberMe dc check = true, login dc ghi nhớ luôn
// còn sessionStorage là phiên tạm thời nên rememberMe dc check = false, tắt đi -> hết phiên thì phải login lại
var storage = {
  
  // hàm lưu trong storage
  saveRememberMe(isRememberMe) {
    // lưu lại = việc set key value
    localStorage.setItem('IS_REMEMBER_ME', isRememberMe);
  },
  
  getRememberMe() {
    // get Item lúc này là String đưa vào biến
    var rememberMeStr = localStorage.getItem('IS_REMEMBER_ME');
    
    // check biến có hay chưa
    if (rememberMeStr == null) { // nếu chưa có check
      return true;
    }
    
    // còn nếu khác null -> checked
    // https://stackoverflow.com/questions/263965/how-can-i-convert-a-string-to-boolean-in-javascript
    return JSON.parse(rememberMeStr.toLowerCase());
  },

  setItem(key, value) {
    if (this.getRememberMe()) { // if checked
      localStorage.setItem(key, value); // set vào local
    } else { // chưa checked
      sessionStorage.setItem(key, value); // chỉ là 1 session
    }
  },

  getItem(key) {
    if (this.getRememberMe()) {
      return localStorage.getItem(key);
    } else {
      return sessionStorage.getItem(key);
    }
  },

  removeItem(key) {
    if (this.getRememberMe()) {
      return localStorage.removeItem(key);
    } else {
      return sessionStorage.removeItem(key);
    }
  }
};