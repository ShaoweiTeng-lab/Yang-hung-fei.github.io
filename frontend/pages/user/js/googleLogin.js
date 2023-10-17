
window.addEventListener("load", function () {
   
    const googleLoginButton = document.getElementById("googlelogin");

    googleLoginButton.addEventListener("click", function (event) {
        onClickSignIn();
    });

})
let auth2;
import config from "../../../../ipconfig.js";
function renderButton() {
    gapi.load('auth2', function () {
        auth2 = gapi.auth2.init({
            client_id: '12649271170-0risrvfckuf08oe89uk0jfgltlm5t168.apps.googleusercontent.com',
            scope: 'profile email',
            redirect_uri: "http://localhost:5050",
            plugin_name: "This is Google oAuth login "
        });
    });
}

function onSuccess(result) {
    authenticate(result.code)
        .then(res => {
           console.log(res);
        })
        .catch(console.log);
    fadeOut();

}
function fadeOut() {
    $("div.overlay").fadeOut();
}
function fadeIn() {
    $("div.overlay").fadeIn();
}
function authenticate(code) {
    //把授權碼代到後端 
    return axios.post(config.url + '/user/googleLogin', JSON.stringify({ code }), {
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => {
        //拿回token
        let token = res.data.message;
        console.log("token : " + token);
        //存到localstorage
        localStorage.setItem('Authorization_U', token); 
        window.location.href = '../../pages/memberCentre/memberCentre.html';
    });
}

function onFailure(error) {
    fadeOut();
    console.log(error);
}
function onClickSignIn() {
    //燈箱
    fadeIn();
    if (auth2 == null) {
        auth2 = gapi.auth2.init({
            client_id: '12649271170-0risrvfckuf08oe89uk0jfgltlm5t168.apps.googleusercontent.com',
            scope: 'profile email',
            redirect_uri: "http://localhost:5050",
            plugin_name: "This is Google oAuth login "
        });
    } 
    //渲染 設定callback事件
    auth2.grantOfflineAccess()
        .then(onSuccess)
        .catch(onFailure);
}
