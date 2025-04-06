let previousToggleState = null;
let timeout;

function isToggle(callback) {
  chrome.storage.sync.get("toggle", function (data) {
    callback(data.toggle || false);
  });
}

function simulateClickWithDebugger(targetElement) {
  const rect = targetElement.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs.length === 0) {
      console.error("No active tab found.");
      return;
    }

    const tabId = tabs[0].id;
    chrome.debugger.attach({ tabId: tabId }, "1.2", function () {
      chrome.debugger.sendCommand(
        { tabId: tabId },
        "Input.dispatchMouseEvent",
        {
          type: "mousePressed",
          button: "left",
          x: x,
          y: y,
          clickCount: 1,
        },
      );

      chrome.debugger.sendCommand(
        { tabId: tabId },
        "Input.dispatchMouseEvent",
        {
          type: "mouseReleased",
          button: "left",
          x: x,
          y: y,
          clickCount: 1,
        },
      );
    });
  });
}

// Log whether a click event was trusted
function logIfEventIsTrusted(event) {
  console.log("Event isTrusted:", event.isTrusted);
}

// Function to handle video ad skipping (if vid is playing)
function videoPlaying() {
  console.log("Checking for ads...");

  const isAd = document.querySelector(".ad-showing");
  console.log(isAd ? "Ad is playing" : "No ad detected");

  const video = document.querySelector("video");
  if (isAd && video && isFinite(video)) {
    video.currentTime = video.duration;
  }

  const skipButton = document.querySelector(".ytp-skip-ad-button");
  if (skipButton && !skipButton.disabled && skipButton.offsetParent !== null) {
    console.log("Skip button found and clickable:", skipButton);
    skipButton.addEventListener("click", logIfEventIsTrusted);
    simulateClickWithDebugger(skipButton);
  } else if (skipButton) {
    console.log("Skip button found but not clickable:", skipButton);
    skipButton.removeAttribute("aria-hidden");
    skipButton.style.setProperty("disabled", "false", "important");
    skipButton.style.setProperty("display", "flex", "important");
    skipButton.style.setProperty("opacity", "1", "important");
  }

  const overlayCloseButton = document.querySelector(
    ".ytp-ad-overlay-close-button",
  );
  if (overlayCloseButton) {
    console.log("Overlay close button found:", overlayCloseButton);
    overlayCloseButton.addEventListener("click", logIfEventIsTrusted);
    overlayCloseButton.click();
  }
}

function handleToggle(toggle) {
  const adElements = document.querySelectorAll(
    ".ytd-in-feed-ad-layout-renderer, .style-scope.ytd-in-feed-ad-layout-renderer .ytd-statement-banner-renderer .style-scope.ytd-statement-banner-renderer .tp-yt-paper-dialog-scrollable .tp-yt-paper-dialog-scrollable .ytwTopBannerImageTextIconButtonedLayoutViewModelHost .style-scope.ytwTopBannerImageTextIconButtonedLayoutViewModelHost .style-scope.ytd-ad-slot-renderer .ytd-ad-slot-renderer",
  );
  const exisitingIds = document.querySelectorAll("#player-ads");

  const allAds = [...adElements, ...exisitingIds];

  if (allAds.length > 0) {
    requestAnimationFrame(() => {
      allAds.forEach((element) => {
        const parent = element.closest("ytd-rich-item-renderer");
        if (parent) {
          if (toggle) {
            parent.style.display = "none";
          } else {
            parent.style.display = "";
          }
        }
        if (toggle) {
          element.style.display = "none";
        } else {
          element.style.display = "";
        }
      });
    });
  }

  if (toggle) {
    videoPlaying();
  }
}

function monitorToggleChange() {
  setInterval(() => {
    isToggle(function (toggle) {
      if (toggle !== previousToggleState) {
        previousToggleState = toggle;
        handleToggle(toggle);
      }
    });
  }, 500);
}

function monitorDOMChanges() {
  const observer = new MutationObserver(() => {
    isToggle(function (toggle) {
      handleToggle(toggle);
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true,
  });
}

monitorToggleChange();
monitorDOMChanges();

window.addEventListener("load", function () {
  isToggle(function (toggle) {
    handleToggle(toggle);
  });
});

window.addEventListener("scroll", function () {
  isToggle(function (toggle) {
    handleToggle(toggle);
  });
});
