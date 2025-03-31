let previousToggleState = null;
let timeout;

function isToggle(callback) {
  chrome.storage.sync.get("toggle", function (data) {
    callback(data.toggle || false);
  });
}

function videoPlaying() {
  const defined = (v) => v !== null && v !== undefined;
  let timeout;

  const ad = [...document.querySelectorAll(".ad-showing")][0];
  const video = document.querySelector("video");

  if (defined(ad) && defined(video) && isFinite(video.duration)) {
    video.muted = true;

    if (video.paused || video.ended) {
      if (video.currentTime < video.duration) {
        video.currentTime = video.duration;
      }
      video.play().catch((err) => {
        console.error("Play error:", err); //keep getting error when ad comes
      });
    }
  }

  return function () {
    clearInterval(timeout);
  };
}

function skipButton() {
  const skipButtons = document.querySelectorAll(
    ".ytp-ad-skip-button button.ytp-ad-skip-button-modern .ytp-button",
  );
  console.log("skipped", skipButtons);
  if (skipButtons) {
    skipButtons.forEach((skipButton) => {
      skipButton.click();
    });
  }
}

function handleToggle(toggle) {
  const adElements = document.querySelectorAll(
    ".ytd-in-feed-ad-layout-renderer, .style-scope.ytd-in-feed-ad-layout-renderer .ytd-statement-banner-renderer .style-scope.ytd-statement-banner-renderer .tp-yt-paper-dialog-scrollable .tp-yt-paper-dialog-scrollable .ytwTopBannerImageTextIconButtonedLayoutViewModelHost .style-scope.ytwTopBannerImageTextIconButtonedLayoutViewModelHost .style-scope.ytd-ad-slot-renderer .ytd-ad-slot-renderer",
  );
  const exisitingIds = document.querySelectorAll("#player-ads");

  const allAds = [...adElements, ...exisitingIds];

  console.log(allAds);

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
    skipButton();
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
