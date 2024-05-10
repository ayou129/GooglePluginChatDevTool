chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    // 发送消息到被关闭的标签页对应的内容脚本
    chrome.tabs.sendMessage(tabId, { action: "tabClosed" });
});
