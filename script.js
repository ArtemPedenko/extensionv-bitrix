// // Ваш скрипт
// const myScriptContent = `
//   console.log(this.document);
//   // Здесь может быть любой другой код, который вы хотите выполнить
// `;

// // Ваш CSS код
// const myCssContent = `
//   body {
//     color: red;
//   }
// `;

// // Функция для инжектирования скрипта
// function injectScript(document) {
// 	const script = document.createElement("script");
// 	script.textContent = myScriptContent;
// 	document.head.appendChild(script);

// 	const style = document.createElement("style");
// 	style.textContent = myCssContent;
// 	document.head.appendChild(style);

// }

// // Инжектируем скрипт в основной документ
// injectScript(document);

// // Функция для инжектирования скрипта во все iframes
// function injectScriptIntoIframes() {
// 	const iframes = document.querySelectorAll("iframe");
// 	iframes.forEach((iframe) => {
// 		try {
// 			injectScript(iframe.contentDocument || iframe.contentWindow.document);
// 		} catch (e) {
// 			console.error("Не удалось инжектировать скрипт в iframe:", e);
// 		}
// 	});
// }

// // Инжектируем скрипт во все существующие iframes
// injectScriptIntoIframes();

// // Используем MutationObserver для отслеживания новых iframes
// const observer = new MutationObserver((mutations) => {
// 	mutations.forEach((mutation) => {
// 		mutation.addedNodes.forEach((node) => {
// 			if (node.tagName === "IFRAME") {
// 				try {
// 					injectScript(node.contentDocument || node.contentWindow.document);
// 				} catch (e) {
// 					console.error("Не удалось инжектировать скрипт в новый iframe:", e);
// 				}
// 			}
// 		});
// 	});
// });

// observer.observe(document.body, { childList: true, subtree: true });

let cssUrl;

// Функция для инжектирования скрипта и стилей
function injectScriptAndStyles(document) {
	const script = document.createElement("script");
	script.textContent = `
    console.log(this.document);
    // Здесь может быть любой другой код, который вы хотите выполнить
  `;
	document.head.appendChild(script);

	if (cssUrl) {
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
				iframe.contentDocument || iframe.contentWindow.document
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
							node.contentDocument || node.contentWindow.document
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
