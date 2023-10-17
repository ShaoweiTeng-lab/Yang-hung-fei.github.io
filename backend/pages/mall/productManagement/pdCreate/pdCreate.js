import config from "../../../../../ipconfig.js";

window.addEventListener("load", () => {
    const token = localStorage.getItem("Authorization_M"); // 使用Manager Token
    // const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiZXhwIjoxNjk1MTEzMjMxfQ.452GXi57MCr7pIoFBqRlgN977kvF4Hqxlm9sz7Q8I9E';

    // 驗證是否為商品管理員
    if (!token) {
        Swal.fire({
            icon: "error",
            title: "您非商品管理員",
            text: "請以商品管理員身份登入",
        });
        // 禁用表單
        disableForm();
        return; // 不繼續執行下面的代碼
    }

    // 移出商品名稱輸入框時進行驗證商品名稱不可為空
    const newPdName = document.getElementById("newPdName");
    newPdName.addEventListener("blur", function () {
        // 商品名稱不可為空驗證
        const pdName = newPdName.value; // Corrected variable name
        if (pdName.trim() === "") { // Check if the trimmed value is empty
            const nameCheck = document.getElementById("nameCheck");
            nameCheck.innerText = '不可為空!';
        } else {
            const nameCheck = document.getElementById("nameCheck");
            nameCheck.innerText = '';
        }
    });

    // 預設商品狀態為下架
    const newPdStatus = document.getElementById("newPdStatus");
    newPdStatus.value = "1";

    // 移出商品價格輸入框時進行驗證
    const newPdPrice = document.getElementById("newPdPrice");
    newPdPrice.addEventListener("blur", function () {
        // 價格格式驗證
        const pdPrice = newPdPrice.value;
        const pdPricePattern = /^[0-9]+$/; // 只可輸入正整数
        if (!pdPricePattern.test(pdPrice)) {
            const priceCheck = document.getElementById("priceCheck");
            priceCheck.innerText = '不可為空，且只可輸入正整數!';
        } else {
            const priceCheck = document.getElementById("priceCheck");
            priceCheck.innerText = '';
        }
    });

    const newPdPics1 = document.getElementById("newPdPics1");
    const newPdPics2 = document.getElementById("newPdPics2");
    const newPdPics3 = document.getElementById("newPdPics3");
    const newPdPics4 = document.getElementById("newPdPics4");
    const newPdPics5 = document.getElementById("newPdPics5");

    newPdPics1.addEventListener('change', (event) => {
        let pre1 = document.getElementById("previewImage1")
        pre1.hidden = false;
        previewImages(1);

    });
    newPdPics2.addEventListener('change', (event) => {
        let pre2 = document.getElementById("previewImage2")
        pre2.hidden = false;
        previewImages(2);

    });
    newPdPics3.addEventListener('change', (event) => {
        let pre3 = document.getElementById("previewImage3")
        pre3.hidden = false;
        previewImages(3);

    });
    newPdPics4.addEventListener('change', (event) => {
        let pre4 = document.getElementById("previewImage4")
        pre4.hidden = false;
        previewImages(4);

    });
    newPdPics5.addEventListener('change', (event) => {
        let pre5 = document.getElementById("previewImage5")
        pre5.hidden = false;
        previewImages(5);

    });

    // 修改預覽多個圖片的函數
    function previewImages(index) {
        const previewId = `previewImage${index}`;//預覽
        const fileInputId = `newPdPics${index}`;//上傳
        previewImage(previewId, fileInputId);
    }

    function previewImage(previewId, fileInputId) {
        const preview = document.getElementById(previewId);
        const pic = document.getElementById(fileInputId);
        const file = pic.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {

                preview.style.display = 'block';
                preview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            preview.style.display = 'none';
        }
    }

    // 修改為 input[type=file] 的 id
    const newPdPics = document.querySelectorAll("input[type=file]");

    // 送出按鈕
    const commitBtn = document.getElementById("commitBtn");

    // 送出修改
    commitBtn.addEventListener("click", () => {
        if (validateForm()) {
            addProduct();
        }
    });

    function validateForm() {
        const pdName = newPdName.value;
        const pdPrice = newPdPrice.value;

        // 商品名稱不可為空
        if (pdName.trim() === "") {
            Swal.fire({
                icon: "error",
                title: "錯誤",
                text: "商品名稱不可為空",
            });
            return false;
        }

        // 商品價格不可為空
        if (pdPrice.trim() === "") {
            Swal.fire({
                icon: "error",
                title: "錯誤",
                text: "商品價格不可為空",
            });
            return false;
        }
    }

    function addProduct() {
        const formData = new FormData();

        formData.append("pdName", newPdName.value);
        formData.append("pdPrice", newPdPrice.value);
        formData.append("pdStatus", newPdStatus.value);
        formData.append("pdDescription", newDescription.value);

        // 上傳多張圖片
        newPdPics.forEach((input, index) => {

            const selectedFile = input.files[0];
            if (selectedFile) {
                formData.append(`picFiles`, selectedFile);
            }
        });
        fetch(config.url + "/manager/createProduct", {
            method: "POST",
            body: formData,
            headers: {
                "Authorization_M": token,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.code === 200) {
                    Swal.fire({
                        icon: "success",
                        title: "新增成功",
                        text: data.message,
                    });
                    clearForm();
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "新增失敗",
                        text: data.message,
                    });
                }
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }

    function clearForm() {
        newPdName.value = "";
        newPdPrice.value = "";
        newPdStatus.value = "1";
        newDescription.value = "";

        document.getElementById("newPdPics1").value = "";
        document.getElementById("newPdPics2").value = "";
        document.getElementById("newPdPics3").value = "";
        document.getElementById("newPdPics4").value = "";
        document.getElementById("newPdPics5").value = "";

        let pre1 = document.getElementById("previewImage1")
        pre1.src = "";
        pre1.hidden = true;
        let pre2 = document.getElementById("previewImage2")
        pre2.src = "";
        pre2.hidden = true;
        let pre3 = document.getElementById("previewImage3")
        pre3.src = "";
        pre3.hidden = true;
        let pre4 = document.getElementById("previewImage4")
        pre4.src = "";
        pre4.hidden = true;
        let pre5 = document.getElementById("previewImage5")
        pre5.src = "";
        pre5.hidden = true;

        // 清空文件
        newPdPics.forEach((input) => {
            input.value = "";
        });
    }

    function disableForm() {
        document.getElementById("newPdName").disabled = true;
        document.getElementById("newDescription").disabled = true;
        document.getElementById("newPdPrice").disabled = true;
        document.getElementById("newPdStatus").disabled = true;

        // 禁用文件輸入
        newPdPics.forEach((input) => {
            input.disabled = true;
        });

        document.getElementById("commitBtn").disabled = true;
    }
});
