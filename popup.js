document.getElementById('open').addEventListener('click', function() {
    // 发送消息给当前页面
    // console.log("Sending message to content script...");
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "insertDiv"});
    });
});

// 监听来自 content.js 的消息
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === "insertDivSuccess") {
        // console.log("Received message from content script:", message);
        // alert("成功");
    }
});
