document.addEventListener("DOMContentLoaded", () => {
	const toggleButton = document.getElementById("toggleButton");

	// Получение текущего состояния из локального хранилища
	chrome.storage.local.get(["isEnabled"], (result) => {
		toggleButton.textContent = result.isEnabled
			? "Disable CSS Injection"
			: "Enable CSS Injection";
	});

	// Обработчик события клика
	toggleButton.addEventListener("click", () => {
		chrome.storage.local.get(["isEnabled"], (result) => {
			const isEnabled = !result.isEnabled;
			chrome.storage.local.set({ isEnabled: isEnabled }, () => {
				toggleButton.textContent = isEnabled
					? "Disable CSS Injection"
					: "Enable CSS Injection";

				// Отправка сообщения для включения/выключения инъекции CSS
				chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
					chrome.tabs.sendMessage(tabs[0].id, {
						action: isEnabled ? "enable" : "disable",
					});
				});
			});
		});
	});
});
