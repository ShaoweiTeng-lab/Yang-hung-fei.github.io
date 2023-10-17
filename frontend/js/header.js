import config from "../../ipconfig.js";
// 创建一个新的 div 元素
var nodifyImg = document.createElement("div");

// 获取目标 div（根据 id）
var notifyMenu = document.getElementById("notify");
nodifyImg.className = "notification-dot";
// 将新的 div 添加到目标 div 中
notifyMenu.appendChild(nodifyImg);

$(window).on("load", () => { 
  $("#logoutButtonText").text("登入");  
  let token = localStorage.getItem("Authorization_U");
  var notificationDot = document.querySelector(".notification-dot");
  let connectUrl = (config.url).split('//')[1];
  if (token == null)
    return;
  let url = 'ws://' + connectUrl + '/websocket/userNotify?access_token=' + token;
  let webSocket = new WebSocket(url);
  webSocket.onopen = function () {
    console.log('創建連接。。。');
    $("#logoutButtonText").text("登出");  
    getUserPerfile(token);
    webSocket.send("getHistory");
  }
  webSocket.onmessage = function (event) {
    let notifyMsg = JSON.parse(event.data);
    console.log(notifyMsg.msg);
    //若是獲得 點數 alert顯示
    if (notifyMsg.notifyType === "GetPoint") {
      swal(notifyMsg.msg);
      return;
    }
    notificationDot.classList.add("visible");
    notificationDot.classList.remove("hidden");
    let redirectUrl = "#";
    let imgBase64;
    switch (notifyMsg.notifyType) {
      //todo 設定 對應url
      case "Store":
        redirectUrl = '/frontend/pages/mall/mall/mall.html';
        break;
      case "Activity":
        redirectUrl = '/frontend/pages/socialMedia/Activity/activity.html';
        return;
        break;
      case "Groomer":
        redirectUrl = '/frontend/pages/petgroomer/pgListPage/pgListPage.html';
        break;
      case "Appointment":
        redirectUrl = '/frontend/pages/memberCentre/appointmentRecord.html';
        break;
    }

    imgBase64 = "data:image/jpeg;base64," + notifyMsg.image;
    console.log(imgBase64);

    const newContent = `
        <a href="`+ redirectUrl + `" class="list-group-item">
          <div class="row g-0 align-items-center">
            <div class="col-2">
              <i class="text-warning" data-feather="bell"></i>
            </div>
            <div class="col-12 d-flex align-items-left"> 
            <img src =`+ imgBase64 + ` class="mr-3" style="max-width: 70px; max-height: 70px; margin-right:10px"/>
              <div class="text-muted small mt-1">`+ notifyMsg.msg + `
              </div> 
            </div>
          </div>
        </a>
      `;
    let listGroup = $('.list-group');
    listGroup.prepend(newContent);
    let maxItems = 5;
    const currentItems = listGroup.children('.list-group-item').length;

    if (currentItems > maxItems) {
      // 如果当前项目数量达到限制，删除最后一个项目
      listGroup.children('.list-group-item').last().remove();
    }

  }
  webSocket.onclose = function () {
    console.log('webSocket已斷開。。。');
    $("#logoutButtonText").text("登入");
    // $('#messageArea').append('websocket已斷開\n');
  };

  $("#notify").on("click", event => {
    notificationDot.classList.add("hidden");
    notificationDot.classList.remove("visible");
  })


  function getUserPerfile(token) {
    fetch(config.url + "/user/profile", {
      method: "GET",
      headers: {
        Authorization_U: token,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((responseData) => {
        var code = responseData.code;
        if (code === 200) {
          let userPic_base64 = responseData.message.userPic;
          if (userPic_base64) {
            console.dir(responseData);
            let user_el = document.getElementById("user");
            var userPic_el = document.createElement("img");
            userPic_el.src = "data:image/png;base64," + userPic_base64;
            userPic_el.style.width = "100%";
            userPic_el.style.height = "100%";
            userPic_el.style.borderRadius = "100%";
            user_el.appendChild(userPic_el);

            let userIcon_el = document.getElementById("userIcon");
            userIcon_el.style.display = "none";
          }
        }
        else if(code === 401){
          localStorage.removeItem("Authorization_U");
          $("#logoutButtonText").text("登入");
        }
      })
      .catch((error) => {
        // 处理捕获的错误，包括网络错误等
        console.error("Fetch error:", error);
      });
  }

});
