import config from "/ipconfig.js";

var statusOutput = document.getElementById("statusOutput");
var messagesArea = document.getElementById("messagesArea");
var self = "PdManager";
let user;
let webSocket;
let userName;
let usersList=[];
$(window).on("load", () => {
    connect();
    $("#sendMessage").on("click",event=>{ 
        sendMessage();
    });
});
$(document).on('keydown', function (event) {
    if (webSocket == null || self == null)
        return;
    if (event.which === 13) {
        // 在這裡處理按下 Enter 鍵的操作
        sendMessage();
    }
});
function connect() {

    let token = localStorage.getItem("Authorization_M");
    let connectUrl = (config.url).split('//')[1];
    if (token == null){
        errorConnect();
        return;
    } 
    let url = 'ws://' + connectUrl + '/websocket/productMallChat?access_token=' + token;
    webSocket = new WebSocket(url);
    webSocket.onopen = function () {
        console.log("Connect Success!");
        //連秀後拿取使用者列表
        var jsonObj = {
            "type": "getUserList",
            "sender": "PdManager",
            "receiver": "",
            "message": ""
        };
        webSocket.send(JSON.stringify(jsonObj));
    };

    webSocket.onmessage = function (event) {
        var jsonObj = JSON.parse(event.data); 
        if ("getUserList" === jsonObj.type) {  
            refreshUserList(jsonObj);
        } else if ("history" === jsonObj.type) {
            messagesArea.innerHTML = '';
            var ul = document.createElement('ul');
            ul.id = "area";
            messagesArea.appendChild(ul);
            // 這行的jsonObj.message是從redis撈出跟使用者的歷史訊息，再parse成JSON格式處理
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
            // if((usersList.indexOf(jsonObj.sender)===-1)&&!(jsonObj.sender==="PdManager")){ 
            //    //重新刷新列表
            //     var jsonObj = {
            //         "type": "getUserList",
            //         "sender": "PdManager",
            //         "receiver": "",
            //         "message": ""
            //     };
            //     webSocket.send(JSON.stringify(jsonObj));
            // }
            let notify=document.getElementById(jsonObj.sender);  
            if(!(jsonObj.sender===user)&&!(jsonObj.sender==="PdManager")){
                //當訊息內容不是當前聊天框   顯示紅點
                notify.classList.add("visible");
                notify.classList.remove("hidden");
                return;
            }
            document.getElementById("area").appendChild(li);
            messagesArea.scrollTop = messagesArea.scrollHeight;  
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
    } else if (user === "") { 
        swal ( "哎呀🤭" ,  "請選擇一位客戶" ,  "error" );
    } else {
        var jsonObj = {
            "type": "chat",
            "sender": self,
            "receiver": user+"-"+userName, 
            "message": message
        };
        webSocket.send(JSON.stringify(jsonObj));
        inputMessage.value = "";
        inputMessage.focus();
    }
}

// 更新列表
function refreshUserList(jsonObj) {
    //拿到聊天列表
    var users = jsonObj.userDataList;
    var row = document.getElementById("row");
    // console.log(users.userName);
    row.innerHTML = '';
    for (var i = 0; i < users.length; i++) { 
        if (users[i] === self) { continue; }
        usersList.push(users[i].userId);
        let notReadList=jsonObj.notReadList; 
        //判斷未讀 (未讀列表中 有 包含迭代聊天列表中當前user的userId) visible顯示
        let isHidden=(notReadList.indexOf(users[i].userId )===-1)?"hidden":"visible";
        row.innerHTML += '<div id=' + i + ' class="column" name="friendName"  >' +
        '<div id=' + users[i].userId + ' class="notification-dot '+isHidden+'"></div>' + // 通知小點點
        '<h2>' + users[i].userName + '</h2>' +
        '<input type="hidden" id="hiddenInput" value=' + users[i].userId + '>' +
    '</div>';
    } 
    addListener();
}
// 註冊列表點擊事件並抓取好友名字以取得歷史訊息
function addListener() {
    var container = document.getElementById("row");
    container.addEventListener("click", function (e) {
        userName = e.srcElement.textContent; 
        // 使用 querySelector 或 getElementById 獲取 hidden input
        var inputElement = findInputElement(e.target);
        //拿到對應的user名稱
        user = inputElement.value; 
        let notify=document.getElementById(user); 
        notify.classList.add("hidden");
        notify.classList.remove("visible"); 
        updateUserName(userName);
        var jsonObj = {
            "type": "history",
            "sender": self,
            "receiver": user,
            "message": ""
        };
        webSocket.send(JSON.stringify(jsonObj));
    });
}
function findInputElement(element) {
    // 往上遍歷dom，查找包含 input 的父级 div 元素
    while (element) {
        if (element.tagName === "DIV" && element.querySelector("input")) {
            return element.querySelector("input");
        }
        element = element.parentNode;
    }
    return null; // 没有找到包含 input 的 div 元素
}
 

function updateUserName(name) {
    //抬頭名稱更新
    statusOutput.innerHTML = name;
}

function errorConnect(){
    swal({
        title: "哎呀🤭",
        text: "您尚未登入，請重新登入",
        icon: "error",
      }).then((value) => {
        localStorage.removeItem("Authorization_M");
        window.location.href = "/backend/login.html"; // 跳轉到登入頁
      });
} 