let previousToggleState = null;
let timeout;

function isToggle(callback) {
  chrome.storage.sync.get("toggle", function (data) {
    callback(data.toggle || false);
  });
}

function videoPlaying() {
  console.log("Checking for ads...");

  const selectors = [".ytp-ad-skip-button", ".ytp-ad-skip-button-modern"];

  selectors.forEach((selector) => {
    const skipButtons = document.querySelectorAll(selector);
    skipButtons.forEach((skipButton) => {
      if (
        skipButton &&
        skipButton.offsetParent !== null &&
        !skipButton.disabled
      ) {
        console.log("Skip button found and clickable", skipButton);
        skipButton.click();
      } else if (skipButton && skipButton.offsetParent === null) {
        skipButton.style.pointerEvents = "auto";
        skipButton.style.opacity = "1";
        skipButton.removeAttribute("disabled");
        skipButton.classList.add("ytp-ad-skip-button-modern", "ytp-button");
      }
    });
  });

  //hides overlay ads
  const overlayAds = document.querySelectorAll(".ytp-ad-overlay-slot");
  overlayAds.forEach((overlayAd) => {
    overlayAd.style.visibility = "hidden";
  });
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
