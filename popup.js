document.addEventListener("DOMContentLoaded", function () {
	var toggleSwitch = document.getElementById("toggleSwitch");
	var statusText = document.getElementById("status");

	// Загружаем текущее состояние
	chrome.storage.sync.get("enabled", function (data) {
		toggleSwitch.checked = data.enabled;
		statusText.textContent = data.enabled ? "Включено" : "Выключено";
	});

	toggleSwitch.addEventListener("change", function () {
		var isEnabled = toggleSwitch.checked;
		chrome.storage.sync.set({ enabled: isEnabled }, function () {
			statusText.textContent = isEnabled ? "Включено" : "Выключено";

			// Отправляем сообщение всем активным вкладкам
			chrome.tabs.query({}, function (tabs) {
				tabs.forEach(function (tab) {
					chrome.tabs.sendMessage(tab.id, {
						action: isEnabled ? "enable" : "disable",
					});
				});
			});
		});
	});
});
