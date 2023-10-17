import config from "/ipconfig.js";

 
var messagesArea = document.getElementById("messagesArea");
var webSocket;
let self;
$(window).on("load", () => {
    connect();
    $("#sendMessage").on("click",event=>{ 
        sendMessage();
    });
 
});
$(document).on('keydown', function(event) {
    if(webSocket==null||self==null)
        return;
    if (event.which === 13) {
      // 在這裡處理按下 Enter 鍵的操作
      sendMessage();
    }
  });

function connect() {

    let token = localStorage.getItem("Authorization_U");
    let connectUrl = (config.url).split('//')[1];
    if (token == null){
        errorConnect();
        return;
    }
        
    let url = 'ws://' + connectUrl + '/websocket/productMallChat?access_token=' + token;
    webSocket = new WebSocket(url);
    webSocket.onopen = function () {
        console.log("Connect Success!");
        //得到當前使用者資訊
        var jsonObj = {
            "type": "getIdentity",
            "sender": "",
            "receiver": "PdManager",
            "message": ""
        };
        webSocket.send(JSON.stringify(jsonObj));
    };

    webSocket.onmessage = function (event) {
        var jsonObj = JSON.parse(event.data);
        if ("getIdentity" === jsonObj.type) { 
            self = jsonObj.sender; 
            //拿回使用者資訊後 拿回歷史紀錄 
            var jsonHisObj = {
                "type": "history",
                "sender": self,
                "receiver": "PdManager",
                "message": ""
            };
            webSocket.send(JSON.stringify(jsonHisObj));
            return; 
        }
        if ("history" === jsonObj.type) {
            messagesArea.innerHTML = '';
            var ul = document.createElement('ul');
            ul.id = "area";
            messagesArea.appendChild(ul);
            // 這行的jsonObj.message是從redis撈出跟好友的歷史訊息，再parse成JSON格式處理
            var messages = JSON.parse(jsonObj.message);
            for (var i = 0; i < messages.length; i++) {
                var historyData = JSON.parse(messages[i]);
                var showMsg = historyData.message;
                var li = document.createElement('li');
                // 根據發送者是自己還是對方來給予不同的class名, 以達到訊息左右區分
                historyData.sender === self ? li.className += 'me' : li.className += 'friend';
                li.innerHTML = showMsg;
                ul.appendChild(li);
            }
            messagesArea.scrollTop = messagesArea.scrollHeight;
        } else if ("chat" === jsonObj.type) {
            var li = document.createElement('li');
            jsonObj.sender === self ? li.className += 'me' : li.className += 'friend';
            li.innerHTML = jsonObj.message;
            console.log(li);
            document.getElementById("area").appendChild(li);
            messagesArea.scrollTop = messagesArea.scrollHeight;
        } else if ("close" === jsonObj.type) {
            refreshFriendList(jsonObj);
        }

    };

    webSocket.onclose = function (event) {
        console.log("Disconnected!");
    };
    webSocket.onerror = function(event){
        errorConnect();
    }
}

function sendMessage() {
    var inputMessage = document.getElementById("message");
    var message = inputMessage.value.trim();

    if (message === "") {
        swal ( "哎呀🤭" ,  "請輸入訊息" ,  "error" ); 
        inputMessage.focus();
    }
    else {
        var jsonObj = {
            "type": "chat",
            "sender": self,
            "receiver": "PdManager",
            "message": message
        };
        console.log(message);
        webSocket.send(JSON.stringify(jsonObj));
        inputMessage.value = "";
        inputMessage.focus();
    }
}
function errorConnect(){
    swal({
        title: "哎呀🤭",
        text: "您尚未登入，請重新登入",
        icon: "error",
      }).then((value) => {
        localStorage.removeItem("Authorization_U");
        window.location.href = "/frontend/pages/user/login.html"; // 替换为你要跳转的页面地址
      });
} 