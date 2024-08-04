let cssUrl;
let iframeCssUrl;
let isEnabled = false;
let observer;

chrome.storage.sync.get("enabled", function (data) {
	isEnabled = data.enabled;
	if (isEnabled) {
		injectScriptAndStyles();
	}
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.action === "enable") {
		isEnabled = true;
		injectScriptAndStyles();
	} else if (request.action === "disable") {
		isEnabled = false;
		removeInjectedStyles();
	}
});

function injectCSS(document, cssUrl) {
	const existingStyle = document.querySelector(`link[href="${cssUrl}"]`);
	if (!existingStyle) {
		const link = document.createElement("link");
		link.href = cssUrl;
		link.type = "text/css";
		link.rel = "stylesheet";
		link.classList.add("injected-style");
		document.head.appendChild(link);
		document.body.appendChild(link);
	}
}

function removeInjectedStyles() {
	removeStyles(document);
	const iframes = document.querySelectorAll("iframe");
	iframes.forEach((iframe) => {
		try {
			removeStyles(iframe.contentDocument || iframe.contentWindow.document);
		} catch (e) {
			console.error("Не удалось удалить стили из iframe:", e);
		}
	});
	if (observer) {
		observer.disconnect();
	}
}

function removeStyles(document) {
	const injectedStyles = document.querySelectorAll(".injected-style");
	injectedStyles.forEach((style) => style.remove());
}

function injectScriptAndStyles(document = window.document, isIframe = false) {
	if (!isEnabled) return;

	if (isIframe) {
		if (iframeCssUrl) {
			injectCSS(document, iframeCssUrl);
		}
	} else {
		if (cssUrl) {
			injectCSS(document, cssUrl);
		}
	}
}

function injectIntoIframes() {
	if (!isEnabled) return;

	const iframes = document.querySelectorAll("iframe");
	iframes.forEach((iframe) => {
		try {
			const iframeDocument =
				iframe.contentDocument || iframe.contentWindow.document;
			if (iframeDocument.readyState === "complete") {
				injectScriptAndStyles(iframeDocument, true);
			} else {
				iframe.addEventListener("load", function () {
					injectScriptAndStyles(iframeDocument, true);
				});
			}
		} catch (e) {
			console.error("Не удалось инжектировать стили в iframe:", e);
		}
	});
}

function initBitrix24Injector() {
	if (!isEnabled) return;

	injectScriptAndStyles(document, false);
	injectIntoIframes();

	observer = new MutationObserver((mutations) => {
		mutations.forEach((mutation) => {
			mutation.addedNodes.forEach((node) => {
				if (node.tagName === "IFRAME") {
					try {
						const iframeDocument =
							node.contentDocument || node.contentWindow.document;
						if (iframeDocument.readyState === "complete") {
							injectScriptAndStyles(iframeDocument, true);
						} else {
							node.addEventListener("load", function () {
								injectScriptAndStyles(iframeDocument, true);
							});
						}
					} catch (e) {
						console.error("Не удалось инжектировать стили в новый iframe:", e);
					}
				}
			});
		});
	});

	observer.observe(document.body, { childList: true, subtree: true });
}

// Получаем URL файлов CSS
cssUrl = chrome.runtime.getURL("styles.css");
iframeCssUrl = chrome.runtime.getURL("iframe.css");

// Инициализируем инжектор, если расширение включено
if (isEnabled) {
	initBitrix24Injector();
}

// Добавляем обработчик для случая, когда contentScript загружается после того, как страница уже загружена
if (document.readyState === "complete") {
	initBitrix24Injector();
} else {
	window.addEventListener("load", initBitrix24Injector);
}
