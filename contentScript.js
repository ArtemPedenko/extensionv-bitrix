let cssUrl;
let iframeCssUrl;
let isEnabled = false;
let observer;

console.log("ContentScript загружен");

chrome.storage.sync.get("enabled", function (data) {
	isEnabled = data.enabled;
	console.log("Начальное состояние расширения:", isEnabled);
	if (isEnabled) {
		injectStyles();
	}
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	console.log("Получено сообщение:", request);
	if (request.action === "enable") {
		isEnabled = true;
		injectStyles();
	} else if (request.action === "disable") {
		isEnabled = false;
		removeStyles();
	}
});

function injectStyles() {
	console.log("Попытка внедрения стилей");
	if (!isEnabled) {
		console.log("Расширение отключено, стили не будут внедрены");
		return;
	}

	injectCSS(document, cssUrl);
	injectIntoIframes();

	if (!observer) {
		observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				mutation.addedNodes.forEach((node) => {
					if (node.tagName === "IFRAME") {
						console.log("Обнаружен новый iframe, попытка внедрения стилей");
						injectIntoIframe(node);
					}
				});
			});
		});
		observer.observe(document.body, { childList: true, subtree: true });
	}
}

function injectCSS(doc, url) {
	const existingStyle = doc.querySelector(`link[href="${url}"]`);
	if (!existingStyle) {
		console.log("Внедрение стилей в документ:", url);
		const link = doc.createElement("link");
		link.href = url;
		link.type = "text/css";
		link.rel = "stylesheet";
		link.classList.add("injected-style");
		doc.head.appendChild(link);
	} else {
		console.log("Стили уже существуют в документе:", url);
	}
}

function injectIntoIframes() {
	const iframes = document.querySelectorAll("iframe");
	console.log("Найдено iframe:", iframes.length);
	iframes.forEach((iframe) => injectIntoIframe(iframe));
}

function injectIntoIframe(iframe) {
	try {
		console.log("Попытка внедрения стилей в iframe");
		const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
		if (iframeDoc.readyState === "complete") {
			injectCSS(iframeDoc, iframeCssUrl);
		} else {
			iframe.addEventListener("load", () => injectCSS(iframeDoc, iframeCssUrl));
		}
	} catch (e) {
		console.error("Ошибка при внедрении стилей в iframe:", e);
	}
}

function removeStyles() {
	console.log("Удаление стилей");
	removeStylesFromDocument(document);
	const iframes = document.querySelectorAll("iframe");
	iframes.forEach((iframe) => {
		try {
			const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
			removeStylesFromDocument(iframeDoc);
		} catch (e) {
			console.error("Ошибка при удалении стилей из iframe:", e);
		}
	});

	if (observer) {
		observer.disconnect();
		observer = null;
	}
}

function removeStylesFromDocument(doc) {
	const injectedStyles = doc.querySelectorAll(".injected-style");
	injectedStyles.forEach((style) => {
		console.log("Удаление стиля:", style.href);
		style.remove();
	});
}

// Получаем URL файлов CSS
cssUrl = chrome.runtime.getURL("styles.css");
iframeCssUrl = chrome.runtime.getURL("iframe.css");
console.log("URL стилей:", cssUrl, iframeCssUrl);

// Инициализируем инжектор, если расширение включено
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", injectStyles);
} else {
	injectStyles();
}
