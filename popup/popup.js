const toggle = document.getElementById("myToggle");

chrome.storage.sync.get("toggle", function (data) {
  toggle.checked = data.toggle || false;
});

toggle.addEventListener("change", function () {
  if (this.checked) {
    chrome.storage.sync.set({ toggle: true });
  } else {
    chrome.storage.sync.set({ toggle: false });
  }
});
