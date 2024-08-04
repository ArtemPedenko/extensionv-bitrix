const script = document.createElement("script");
script.src = chrome.runtime.getURL("script.js");
script.onload = function () {
	this.remove();
	// Отправляем сообщение с URL CSS файлов
	window.postMessage(
		{
			type: "FROM_CONTENT_SCRIPT",
			cssUrl: chrome.runtime.getURL("styles.css"),
			iframeCssUrl: chrome.runtime.getURL("iframe.css"),
		},
		"*"
	);
};
(document.head || document.documentElement).appendChild(script);

function injectCSS(cssUrl) {
	const link = document.createElement("link");
	link.href = cssUrl;
	link.type = "text/css";
	link.rel = "stylesheet";
	document.body.appendChild(link);
}

// Слушаем сообщения от script.js
window.addEventListener(
	"message",
	function (event) {
		if (event.data.type && event.data.type === "FROM_PAGE_SCRIPT") {
			console.log("Message received from page script:", event.data.message);
		}
	},
	false
);
