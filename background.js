chrome.runtime.onInstalled.addListener(() => {
	// Устанавливаем начальное состояние в false
	chrome.storage.local.set({ isEnabled: false });
});
