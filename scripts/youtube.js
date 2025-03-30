function videoPlaying() {
  const defined = (v) => v !== null && v !== undefined;
  const timeout = setInterval(() => {
    const ad = [...document.querySelectorAll(".ad-showing")][0];
    const video = document.querySelector("video");

    if (defined(ad) && defined(video) && isFinite(video.duration)) {
      video.muted = true;
      if (video.currentTime < video.duration) {
        video.currentTime = video.duration;
        video.play();
      }
    }
  }, 500);

  return function () {
    clearInterval(timeout);
  };
}

function skipButton() {
  const skipButton = document.querySelector("ytp-ad-skip-button");
  if (skipButton) {
    skipButton.click();
  }
}

const observer = new MutationObserver(() => {
  const adElements = document.querySelectorAll(
    "ytd-in-feed-ad-layout-renderer, .style-scope.ytd-in-feed-ad-layout-renderer ytd-statement-banner-renderer .style-scope.ytd-statement-banner-renderer tp-yt-paper-dialog-scrollable .tp-yt-paper-dialog-scrollable .ytwTopBannerImageTextIconButtonedLayoutViewModelHost .style-scope.ytwTopBannerImageTextIconButtonedLayoutViewModelHost",
  );
  const exisitingIds = document.querySelectorAll("#player-ads");

  const allAds = [...adElements, ...exisitingIds];

  if (allAds.length > 0) {
    requestAnimationFrame(() => {
      allAds.forEach((element) => {
        const parent = element.closest("ytd-rich-item-renderer");
        if (parent) {
          parent.remove();
        }
        element.remove();
      });
    });
  }

  videoPlaying();
  skipButton();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: false,
});
