const chatToolDivId = 'chatToolDiv';
const stateIdentifier = 'chatToolState';
// 接收来自弹出页面的消息
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "clearCache") {
        // 执行清除本地存储的操作
        localStorage.removeItem(stateIdentifier);
        console.log('本地存储已清除');
    }
});
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "insertDiv") {
        var div_id = document.getElementById(chatToolDivId);
        if (!div_id) {
            var popup = document.createElement('div');
            popup.id = chatToolDivId;
            popup.style.position = 'absolute';
            popup.style.top = '0';
            popup.style.right = '0';
            popup.style.background = '#fff';
            popup.style.border = '1px solid #ccc';
            popup.style.padding = '20px';
            popup.style.zIndex = '9999';
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
                <div>
                    <div class="select">
                        <input type="checkbox" id="useChinese" checked>
                        <label for="useChinese">使用中文回答</label><br>
                    </div>
                    <div class="select">
                        <input type="checkbox" id="onlyKeycode" checked>
                        <label for="onlyKeycode">只写关键代码</label>
                        <input type="checkbox" id="fullCode">
                        <label for="fullCode">写出完整代码</label>
                    </div>
                    <div class="select">
                        <input type="checkbox" id="onlyCode" checked>
                        <label for="onlyCode">只写代码，不用解释</label><br>
                    </div>
                    <div class="select">
                        <label class="exclude" for="runtimeEnvironment">当前代码运行环境：</label>
                        <textarea id="runtimeEnvironment" style="width: 95%; height: 75px; margin-top: 10px;" placeholder="填写当前代码运行环境"></textarea>
                    </div>
                    <div class="select">
                        <label class="exclude" for="context">问题描述：</label>
                        <textarea id="context" style="width: 95%; height: 150px; margin-top: 10px;"
                        placeholder="填写错误代码" ></textarea>
                    </div>
                    <div class="select">
                        <label class="exclude" for="bugCode">错误代码：</label>
                        <textarea id="bugCode" style="width: 95%; height: 150px; margin-top: 10px;" placeholder="填写错误代码"></textarea>
                    </div>

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
                var customPopup = document.getElementById(chatToolDivId);
                if (customPopup) {
                    customPopup.style.display = 'none';
                    saveStateToLocalStorage();
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

            document.getElementById(chatToolDivId).querySelectorAll('.select:not(:last-child) label:not(.exclude)').forEach(label => {
                label.addEventListener('click', () => {
                    const checkbox = label.previousElementSibling;
                    if (checkbox && checkbox.type === 'checkbox') {
                        checkbox.checked = !checkbox.checked;
                    }
                });
            });

            // 添加 Chat it~ 按钮的点击事件
            var chatItButton = document.getElementById('chatItButton');
            chatItButton.addEventListener('click', function () {
                // 获取选中的选项
                var options = document.querySelectorAll('.select input[type="checkbox"]:checked');
                var selectedOptions = Array.from(options).map(option => option.nextElementSibling.textContent);

                // 获取 runtimeEnvironment 文本
                var runtimeEnvText = document.getElementById('runtimeEnvironment').value;

                // 获取 context 文本
                var contextText = document.getElementById('context').value;

                // 获取 bugCode 文本
                var bugCodeText = document.getElementById('bugCode').value;

                // 获取单选项的值
                var selectedRadio = document.querySelector('.select input[type="radio"]:checked').value;


                // 拼凑文本
                var summary = "";
                if (selectedOptions.includes("使用中文回答")) {
                    summary += "请接下来都使用中文回答\n\n";
                }
                if (selectedOptions.includes("只写关键代码")) {
                    summary += "只写关键代码\n\n";
                }
                if (selectedOptions.includes("只写代码，不用解释")) {
                    summary += "不用解释代码的细节\n\n";
                }
                if (runtimeEnvText.trim() !== "") {
                    summary += "当前代码运行环境：" + runtimeEnvText + "\n\n";
                }
                if (bugCodeText.trim() !== "") {
                    summary += "下面是错误详情：\n" + bugCodeText + "\n\n";
                }
                summary += "下面是细节：\n" + contextText + "\n\n";

                // 插入到某个 div 中
                var targetDiv;
                if (selectedRadio === 'ChatGPT') {
                    targetDiv = document.getElementById('prompt-textarea');
                    if (targetDiv) {
                        targetDiv.value = ''; // 清空
                        targetDiv.value = summary;

                        // 手动触发 input 事件
                        var event = new Event('input', {
                            bubbles: true,
                            cancelable: true,
                        });
                        targetDiv.dispatchEvent(event);
                    }
                } else if (selectedRadio === 'Gemini') {
                    var textarea = document.querySelector('.ql-editor.ql-blank.textarea');
                    if (textarea) {
                        var pElement = document.querySelector('.ql-editor p');
                        if (pElement) {
                            pElement.innerHTML = summary;
                            var event = new Event('input', {
                                bubbles: true,
                                cancelable: true,
                            });
                            pElement.dispatchEvent(event);
                        }
                    } else {
                        console.log('Gemini 没有找到textarea');
                    }
                }

                saveStateToLocalStorage();
            });


        } else {
            div_id.style.display = 'block';
        }

        var savedState = localStorage.getItem(stateIdentifier);
        if (savedState) {
            var state = JSON.parse(savedState);
            console.log("读取到了数据", state)
            // Restore textarea contents
            document.getElementById('runtimeEnvironment').value = state.runtimeEnvironment;
            document.getElementById('context').value = state.context;
            document.getElementById('bugCode').value = state.bugCode;
            // Restore checkbox states
            document.getElementById('useChinese').checked = state.useChinese;
            document.getElementById('onlyKeycode').checked = state.onlyKeycode;
            document.getElementById('fullCode').checked = state.fullCode;
            document.getElementById('onlyCode').checked = state.onlyCode;
            // Restore radio button state
            document.getElementById(state.chatType).checked = true;
        }

        // 发送消息给 popup.js，表示插入成功
        chrome.runtime.sendMessage({
            action: "insertDivSuccess"
        });
    }
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
    saveStateToLocalStorage();
});

function saveStateToLocalStorage() {
    var state = {
        runtimeEnvironment: document.getElementById('runtimeEnvironment').value,
        context: document.getElementById('context').value,
        bugCode: document.getElementById('bugCode').value,
        useChinese: document.getElementById('useChinese').checked,
        onlyKeycode: document.getElementById('onlyKeycode').checked,
        fullCode: document.getElementById('fullCode').checked,
        onlyCode: document.getElementById('onlyCode').checked,
        chatType: document.querySelector('.select input[type="radio"]:checked').id
    };
    localStorage.setItem(stateIdentifier, JSON.stringify(state));
}