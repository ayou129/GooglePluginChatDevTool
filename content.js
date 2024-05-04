chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "insertDiv") {
        // console.log("Received message from popup:", message);
        // 检查是否已经存在相同 id 的 div
        var div_id = document.getElementById('chatToolDiv');
        if (!div_id) {
            // 在当前页面的 body 中插入一个 div
            var popup = document.createElement('div');
            popup.id = 'chatToolDiv';
            popup.style.position = 'absolute';
            popup.style.top = '300px'; // 往下一些
            popup.style.right = '0';
            popup.style.width = '600px';
            popup.style.height = '800px';
            popup.style.background = '#fff';
            popup.style.border = '1px solid #ccc';
            popup.style.padding = '20px';
            popup.style.zIndex = '9999';
            // 添加样式
            var style = document.createElement('style');
            style.innerHTML = `
                .select {
                    margin-top: 10px;
                    margin-bottom: 10px;
                }
                `;
            document.head.appendChild(style);
            popup.innerHTML = `
                <h3>Options:</h3>
                <div id="options">
                    <div class="select">
                        <input type="checkbox" id="useChinese" checked>
                        <label for="useChinese">使用中文回答</label><br>
                    </div
                    <div class="select">
                        <input type="checkbox" id="onlyKeycode" checked>
                        <label for="onlyKeycode" checked>只写关键代码</label>
                        <input type="checkbox" id="fullCode">
                        <label for="fullCode">写出完整代码</label>
                    </div>
                    <div class="select">
                    <input type="checkbox" id="onlyCode" checked>
                    <label for="onlyCode">只写代码，不用解释</label><br>
                    </div>
                    <textarea id="context" style="width: 95%; height: 200px; margin-top: 10px;"></textarea>
                    <hr style="margin-top: 20px; margin-bottom: 20px;"> <!-- 添加分割线 -->
                    <!-- 新增单选项 -->
                    <div class="select">
                        <input type="radio" name="chatType" id="ChatGPT" value="ChatGPT" checked>
                        <label for="ChatGPT">ChatGPT</label><br>
                        <input type="radio" name="chatType" id="Gemini" value="Gemini">
                        <label for="Gemini">Gemini</label><br>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 20px;">
                <button id="close" style="font-size: 16px; padding: 10px 20px;">关闭</button>
                <button id="chatItButton" style="font-size: 16px; padding: 10px 20px;">Chat it~</button>
            </div>
            `;


            // 将弹出框添加到body中
            document.body.appendChild(popup);

            // 获取关闭按钮
            var closeButton = document.getElementById('close');
            // 添加关闭按钮的点击事件
            closeButton.addEventListener('click', function () {
                var customPopup = document.getElementById('chatToolDiv');
                if (customPopup) {
                    customPopup.style.display = 'none';
                }
            });

            // 监听只写关键代码复选框的改变事件
            document.getElementById('onlyKeycode').addEventListener('change', function () {
                if (this.checked) {
                    document.getElementById('fullCode').checked = false;
                }
            });

            // 监听写出完整代码复选框的改变事件
            document.getElementById('fullCode').addEventListener('change', function () {
                if (this.checked) {
                    document.getElementById('onlyKeycode').checked = false;
                }
            });

            // 添加 Chat it~ 按钮的点击事件
            var chatItButton = document.getElementById('chatItButton');
            chatItButton.addEventListener('click', function () {
                // 获取选中的选项
                var options = document.querySelectorAll('.select input[type="checkbox"]:checked');
                var selectedOptions = Array.from(options).map(option => option.nextElementSibling.textContent);

                // 获取 context 文本
                var contextText = document.getElementById('context').value;

                // 获取单选项的值
                var selectedRadio = document.querySelector('input[name="ChatType"]:checked').value;

                // 拼凑文本
                var summary = "";
                if (selectedOptions.includes("使用中文回答")) {
                    summary += "请接下来都使用中文回答\n";
                }
                if (selectedOptions.includes("只写关键代码")) {
                    summary += "只写关键代码\n";
                }
                if (selectedOptions.includes("只写代码，不用解释")) {
                    summary += "只写代码，不用解释\n";
                }
                summary += "下面是细节：\n" + contextText + "\n";

                // 插入到某个 div 中
                var targetDiv;
                if (selectedRadio === 'ChatGPT') {
                    targetDiv = document.getElementById('prompt-textarea');
                    if (targetDiv) {
                        targetDiv.innerText = ''; // 清空
                        targetDiv.innerText = summary;
                    }
                } else if (selectedRadio === 'Gemini') {
                    var textarea = document.querySelector('.ql-editor textarea');
                    if (textarea) {
                        textarea.innerHTML = `<p>${summary}</p>`;
                    }
                }
                // 如果还有其他单选项需要处理，可以在这里添加更多的条件分支
            });


        } else {
            div_id.style.display = 'block'; // 直接显示已存在的元素
        }

        // 发送消息给 popup.js，表示插入成功
        chrome.runtime.sendMessage({
            action: "insertDivSuccess"
        });
    }
});