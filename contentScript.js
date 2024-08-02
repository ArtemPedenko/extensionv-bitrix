// const script = document.createElement("script");
// script.src = chrome.runtime.getURL("script.js");
// script.onload = function () {
// 	this.remove();
// };
// (document.head || document.documentElement).appendChild(script);

// if (window.location.hostname.includes("bitrix24")) {
// 	const script = document.createElement("script");
// 	script.src = chrome.runtime.getURL("script.js");
// 	script.onload = function () {
// 		this.remove();
// 		// Отправляем сообщение с URL CSS файла
// 		window.postMessage(
// 			{
// 				type: "FROM_CONTENT_SCRIPT",
// 				cssUrl: chrome.runtime.getURL("styles.css"),
// 			},
// 			"*"
// 		);
// 	};
// 	(document.head || document.documentElement).appendChild(script);
// } else {
// 	console.log("This page is not a Bitrix24 page. Script not loaded.");
// }

// // Слушаем сообщения от script.js
// window.addEventListener(
// 	"message",
// 	function (event) {
// 		if (event.data.type && event.data.type === "FROM_PAGE_SCRIPT") {
// 			console.log("Message received from page script:", event.data.message);
// 		}
// 	},
// 	false
// );

const script = document.createElement("script");
script.src = chrome.runtime.getURL("script.js");
script.onload = function () {
	this.remove();
	// Отправляем сообщение с URL CSS файла
	window.postMessage(
		{
			type: "FROM_CONTENT_SCRIPT",
			cssUrl: chrome.runtime.getURL("styles.css"),
		},
		"*"
	);
};
(document.head || document.documentElement).appendChild(script);

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
