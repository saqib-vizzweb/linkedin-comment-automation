document.getElementById("save").addEventListener("click", () => {
  const key = document.getElementById("api-key").value;
  chrome.storage.sync.set({ "gemini-api-key": key });
});
