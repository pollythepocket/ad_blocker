let previousToggleState = null;
let timeout;

function isToggle(callback) {
  chrome.storage.sync.get("toggle", function (data) {
    callback(data.toggle || false);
  });
}

function videoPlaying() {
  console.log("Checking for ads...");

  // Try to click the skip ad button
  const skipButton = document.querySelector(".ytp-skip-ad-button");
  if (skipButton && !skipButton.disabled && skipButton.offsetParent !== null) {
    console.log("Skip button found and clickable", skipButton);
    simulateClick(skipButton);
  } else {
    skipButton.style.pointerEvents = "auto";
    skipButton.style.opacity = "1";
    skipButton.removeAttribute("disabled");
  }

  const overlayCloseButton = document.querySelector(
    ".ytp-ad-overlay-close-button",
  );
  if (overlayCloseButton) {
    console.log("Overlay close button found", overlayCloseButton);
    overlayCloseButton.click();
  }
}

function handleToggle(toggle) {
  const adElements = document.querySelectorAll(
    ".ytd-in-feed-ad-layout-renderer, .style-scope.ytd-in-feed-ad-layout-renderer .ytd-statement-banner-renderer .style-scope.ytd-statement-banner-renderer .tp-yt-paper-dialog-scrollable .tp-yt-paper-dialog-scrollable .ytwTopBannerImageTextIconButtonedLayoutViewModelHost .style-scope.ytwTopBannerImageTextIconButtonedLayoutViewModelHost .style-scope.ytd-ad-slot-renderer .ytd-ad-slot-renderer",
  );
  const exisitingIds = document.querySelectorAll("#player-ads");

  const allAds = [...adElements, ...exisitingIds];

  // console.log(allAds);

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
    let adCheckInterval = setInterval(() => {
      if (document.querySelector(".ytp-skip-ad-button")) {
        videoPlaying();
        clearInterval(adCheckInterval);
      }
    }, 500);
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
