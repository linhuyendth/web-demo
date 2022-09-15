$(function() {
  var isRememberMe = storage.getRememberMe();
  document.getElementById('rememberMe').checked = isRememberMe;
});

// với form thì để submit rồi chạy hàm addEventListener()
document.getElementById("loginBtn").addEventListener("click", function(event) {
  event.preventDefault();
  login();
});

function login() {
  // get username và password ra
  var username = document.getElementById('username').value;
  var password = document.getElementById('password').value;
  
  // TODO validate (if chưa điền username hay password gì thì sẽ báo lỗi)
  if (!username) {
    showErrorMessage("Please input username!");
    return;
  }
  
  if (!password) {
    showErrorMessage("Please input password!");
    return;
  }
  
  // validate username 6 -> 30 characters
  if (username.length < 6 || username.length > 50 || password.length < 6 || password.length > 50) {
      // show error message
      showErrorMessage("Login fail!");
      return;
  }

  // check thử mã btoa
  // console.log(btoa(username + ":" + password));

  // gọi API
  $.ajax({
    url: 'http://localhost:8080/api/v1/login',
    type: 'GET',
    contentType: 'application/json',
    dataType: 'json', // datatype return in method get in controller
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
    },
    // key: Authorization
    // value: Basic + btoa chính là mã của username + password
      
    // if success
    success: function(data, textStatus, xhr) {
      // save data to storage (cookies js)

      // https://www.w3schools.com/html/html5_webstorage.asp

      // save rememberMe
      var isRememberMe = document.getElementById('rememberMe').checked;
      storage.saveRememberMe(isRememberMe);

      // save data
      storage.setItem("ID", data.id);
      storage.setItem("FULL_NAME", data.fullName);
      storage.setItem("EMAIL", data.email);
      storage.setItem("USER_NAME", username);
      storage.setItem("PASSWORD", password);
      
      // redirect to home page
      // https://www.w3schools.com/howto/howto_js_redirect_webpage.asp
      window.location.replace('http://127.0.0.1:5500/program.html'); // replace luôn để ko back lại login
    },

    // if error
    error(jqXHR, textStatus, errorThrown){
      if (jqXHR.status == 401) {
        showErrorMessage("Login fail!");
      } else {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
      }
    }
  });
}

function showErrorMessage(message) {
    document.getElementById("errorMes").style.display = "block";
    document.getElementById("errorMes").innerHTML = message;
}

function hideErrorMessage() {
    document.getElementById("errorMes").style.display = "none";
}