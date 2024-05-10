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
    const url = window.location.href.toLowerCase();
    let selectedOptionId = '';
    const ChatGPT = "ChatGPT"
    const Gemini = "Gemini"
    const Tongyi = "Tongyi"
    if (url.includes('chatgpt')) {
        selectedOptionId = ChatGPT;
    } else if (url.includes('gemini')) {
        selectedOptionId = Gemini;
    } else if (url.includes('tongyi')) {
        selectedOptionId = Tongyi;
    }

    if (message.action === "insertDiv") {
        var div_id = document.getElementById(chatToolDivId);
        if (!div_id) {
            var popup = document.createElement('div');
            popup.id = chatToolDivId;
            popup.style.position = 'absolute';
            popup.style.top = '0';
            popup.style.right = '0';
            popup.style.width = '300px';
            popup.style.background = '#fff';
            popup.style.border = '1px solid #ccc';
            popup.style.padding = '20px';
            popup.style.zIndex = '9999';
            var style = document.createElement('style');
            style.innerHTML = `
                body{
                    font-size: 14px;
                }
                .scrollable-container {
                    max-height: 400px;
                    overflow-y: auto;
                    padding: 15px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                }
                .select {
                    margin-top: 10px;
                    margin-bottom: 10px;
                }
                .cus_textarea{
                    width: 100%; 
                    height: 150px; 
                    margin-top: 10px;
                }
                `;
            document.head.appendChild(style);
            popup.innerHTML = `
                <h3>Options:</h3>
                <div class="scrollable-container">
                    <div class="select">
                        <label class="exclude" for="context">情景</label>
                        <textarea id="context" class="cus_textarea" placeholder="我正在使用C++开发一个多平台桌面应用\n\n当前的开发环境及版本、使用工具：">我正在使用C++开发一个多平台桌面应用\n\n当前的开发环境及版本、使用工具：</textarea>
                    </div>
                    <div class="select">
                        <label class="exclude" for="objective">目标</label>
                        <textarea id="objective" class="cus_textarea"
                        placeholder="修复错误、写出代码，使其能够正常运行">修复错误、写出代码，使其能够正常运行</textarea>
                    </div>
                    <div class="select">
                        <label class="exclude" for="style">风格</label>
                        <textarea id="style" class="cus_textarea"
                        placeholder="请使用简洁易懂的语言进行解释。">请使用简洁易懂的语言进行解释。</textarea>
                    </div>
                    <div class="select">
                        <label class="exclude" for="tone">语调</label>
                        <textarea id="tone" class="cus_textarea"
                        placeholder="请以一种积极和乐于助人的语气回应我的请求">请以一种积极和乐于助人的语气回应我的请求</textarea>
                    </div>
                    <div class="select">
                        <label class="exclude" for="audience">受众</label>
                        <textarea id="audience" class="cus_textarea"
                        placeholder="面向有C++基础编程经验的开发人员">面向有C++基础编程经验的开发人员</textarea>
                    </div>
                    <div class="select">
                        <label class="exclude" for="format">格式</label>
                        <textarea id="format" class="cus_textarea"
                        placeholder="使用中文回答所有内容包括注释\n-写出完整代码\n-只写出涉及到修改的代码\n-不用着重描述，我更关注代码实现\n-附上示例代码">使用中文回答所有\n-写出完整代码\n-只写出涉及到修改的代码\n-不用着重描述，我更关注代码实现\n-附上示例代码</textarea>
                    </div>
                    
                </div>
                <div style="text-align: center; margin-top: 20px;">
                    <button id="close" style="font-size: 16px; padding: 10px 20px;">关闭</button>
                    <button id="chatItButton" style="font-size: 16px; padding: 10px 20px;">Chat it~</button>
                </div>
            `;
            // <hr style="margin-top: 20px; margin-bottom: 20px;"> <!-- 添加分割线 --></hr>

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
                // var options = document.querySelectorAll('.select input[type="checkbox"]:checked');
                // var selectedOptions = Array.from(options).map(option => option.nextElementSibling.textContent);

                // 获取 context 文本
                var context = document.getElementById('context').value;

                var objective = document.getElementById('objective').value;

                var style = document.getElementById('style').value;

                var tone = document.getElementById('tone').value;

                var audience = document.getElementById('audience').value;

                var format = document.getElementById('format').value;

                // var bugCodeText = document.getElementById('bugCode').value;


                // 拼凑文本
                var summary = "";
                if (context.trim() !== "") {
                    summary += "此次问题的情景：" + context + "\n\n";
                }

                if (objective.trim() !== "") {
                    summary += "此次问题的目标：" + objective + "\n\n";
                }
                if (style.trim() !== "") {
                    summary += "此次问题的风格：" + style + "\n\n";
                }
                if (tone.trim() !== "") {
                    summary += "此次问题的语调：" + tone + "\n\n";
                }
                if (audience.trim() !== "") {
                    summary += "此次问题的受众：" + audience + "\n\n";
                }
                if (format.trim() !== "") {
                    summary += "此次问题的格式：" + format + "\n\n";
                }

                // 获取单选项的值
                // var selectedRadio = document.querySelector('.select input[type="radio"]:checked').value;
                // 插入到某个 div 中
                var targetDiv;
                switch (selectedOptionId) {
                    case ChatGPT:
                        targetDiv = document.getElementById('prompt-textarea');
                        if (targetDiv) {
                            targetDiv.value = ''; // 清空
                            targetDiv.value = summary;

                            var event = new Event('input', {
                                bubbles: true,
                                cancelable: true,
                            });
                            targetDiv.dispatchEvent(event);

                            setTimeout(function () {
                                var button = document.querySelector('button[data-testid="send-button"]');

                                if (button) {
                                    setTimeout(function () {
                                        button.click();
                                        console.log('已经触发按钮点击事件');
                                    }, 500);
                                } else {
                                    console.log('没有找到对应的按钮');
                                }
                            }, 200);

                            console.log('已更新textarea并触发了input事件。');
                        }
                        break;
                    case Gemini:
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

                                setTimeout(function () {
                                    var button = document.querySelector('button[aria-label="Send message"]');

                                    if (button) {
                                        setTimeout(function () {
                                            button.click();
                                            console.log('已经触发按钮点击事件');
                                        }, 500);
                                    } else {
                                        console.log('没有找到对应的按钮');
                                    }
                                }, 200);
                            }
                        } else {
                            console.log('Gemini 没有找到textarea');
                        }
                        break;
                    case Tongyi:
                        var textareas = document.getElementsByTagName('textarea');

                        var found = false;
                        for (var i = 0; i < textareas.length; i++) {
                            if (textareas[i].placeholder.includes('在这里输入问题，直接输入')) {
                                found = true;
                                textareas[i].innerHTML = summary;

                                var event = new Event('input', {
                                    bubbles: true,
                                    cancelable: true
                                });
                                textareas[i].dispatchEvent(event);

                                setTimeout(function () {
                                    var operateButtons = document.querySelectorAll('div[class^="operateBtn-"]');
                                    if (operateButtons.length > 0) {
                                        operateButtons[0].click();
                                        console.log('已触发操作按钮的点击事件。');
                                    } else {
                                        console.log('没有找到以operateBtn开头的操作按钮。');
                                    }
                                }, 200);
                                console.log('已更新textarea并触发了input事件。');
                                break;
                            }
                        }

                        if (!found) {
                            console.log('没有找到具有特定placeholder的textarea');
                        }
                        break;
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
            document.getElementById('context').value = state.context;
            document.getElementById('objective').value = state.objective;
            document.getElementById('style').value = state.style;
            document.getElementById('tone').value = state.tone;
            document.getElementById('audience').value = state.audience;
            document.getElementById('format').value = state.format;
            // Restore radio button state
        }

        if (selectedOptionId) {
            const radio = document.getElementById(selectedOptionId);
            if (radio) {
                radio.checked = true;
            }
        }
        // 发送消息给 popup.js，表示插入成功
        chrome.runtime.sendMessage({
            action: "insertDivSuccess"
        });
    }
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "tabClosed") {
        console.log('tabClosed');
        saveStateToLocalStorage();
    }
});

function saveStateToLocalStorage() {
    var state = {
        context: document.getElementById('context').value,
        objective: document.getElementById('objective').value,
        style: document.getElementById('style').value,
        tone: document.getElementById('tone').value,
        audience: document.getElementById('audience').value,
        format: document.getElementById('format').value,
    };
    localStorage.setItem(stateIdentifier, JSON.stringify(state));
}