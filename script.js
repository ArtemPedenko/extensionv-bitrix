let cssUrl;
let iframeCssUrl;

// Функция для инжектирования скрипта и стилей
function injectScriptAndStyles(document, isIframe = false) {
	const script = document.createElement("script");
	script.textContent = `
    console.log(this.document);
    // Здесь может быть любой другой код, который вы хотите выполнить
  `;
	document.head.appendChild(script);

	if (isIframe && iframeCssUrl) {
		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = iframeCssUrl;
		document.head.appendChild(link);
	} else if (!isIframe && cssUrl) {
		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = cssUrl;
		document.head.appendChild(link);
	}
}

// Функция для инжектирования скрипта и стилей во все iframes
function injectIntoIframes() {
	const iframes = document.querySelectorAll("iframe");
	iframes.forEach((iframe) => {
		try {
			injectScriptAndStyles(
				iframe.contentDocument || iframe.contentWindow.document,
				true
			);
		} catch (e) {
			console.error("Не удалось инжектировать скрипт и стили в iframe:", e);
		}
	});
}

// Функция инициализации
function initBitrix24Injector() {
	// Инжектируем скрипт и стили в основной документ
	injectScriptAndStyles(document);

	// Инжектируем скрипт и стили во все существующие iframes
	injectIntoIframes();

	// Используем MutationObserver для отслеживания новых iframes
	const observer = new MutationObserver((mutations) => {
		mutations.forEach((mutation) => {
			mutation.addedNodes.forEach((node) => {
				if (node.tagName === "IFRAME") {
					try {
						injectScriptAndStyles(
							node.contentDocument || node.contentWindow.document,
							true
						);
					} catch (e) {
						console.error(
							"Не удалось инжектировать скрипт и стили в новый iframe:",
							e
						);
					}
				}
			});
		});
	});

	observer.observe(document.body, { childList: true, subtree: true });
}

// Слушаем сообщение от content script
window.addEventListener(
	"message",
	function (event) {
		if (event.data.type && event.data.type === "FROM_CONTENT_SCRIPT") {
			cssUrl = event.data.cssUrl;
			iframeCssUrl = event.data.iframeCssUrl;
			initBitrix24Injector();
			// Отправляем сообщение обратно в content script
			window.postMessage(
				{ type: "FROM_PAGE_SCRIPT", message: "Injector initialized" },
				"*"
			);
		}
	},
	false
);
