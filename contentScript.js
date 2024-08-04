let isEnabled = false;

// Функция для инжектирования CSS
function injectCSS(cssUrl) {
	const link = document.createElement("link");
	link.href = cssUrl;
	link.type = "text/css";
	link.rel = "stylesheet";
	document.body.appendChild(link);
}

function removeCSS() {
	const links = document.querySelectorAll("link[rel='stylesheet']");
	links.forEach((link) => link.parentNode.removeChild(link));
}

// Слушаем сообщения от background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === "enable") {
		isEnabled = true;
		injectCSS(chrome.runtime.getURL("styles.css"));
	} else if (message.action === "disable") {
		isEnabled = false;
		removeCSS();
	}
});

// Исходная логика для инъекции CSS, если она включена
chrome.storage.local.get(["isEnabled"], (result) => {
	if (result.isEnabled) {
		injectCSS(chrome.runtime.getURL("styles.css"));
	}
});
