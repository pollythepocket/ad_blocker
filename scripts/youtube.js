//TODO: delete debugger functions, delete logging, make video play after ad
// then figure which easy stuff to use
// then find more stuff for more ads
// maybe skipping all ad vid??
//when debugger attaches make sure it doesnt do a pop-up

let previousToggleState = null;
let isHandlingToggle = false;
let isHandlingCheck = false;

//checks to see if user has ad blocker toggled on or off
function isToggle(callback) {
  chrome.storage.sync.get("toggle", function (data) {
    callback(data.toggle || false);
  });
}

//debugging to see if button push was trusted (may need for future use)
function logIfEventIsTrusted(event) {
  event.addEventListener(
    "click",
    console.log("Event isTrusted:", event.isTrusted),
  );
}

//gets the target element, since background.js cannot grab DOM, and sends x and y to it
function simulateClickWithDebugger(targetElement) {
  if (!targetElement) {
    console.error("targetElement is undefined or null");
    return;
  }

  const rect = targetElement.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  chrome.runtime.sendMessage(
    { text: "click-button-chrome-way", rect: rect, x: x, y: y },
    (finished) => {
      console.log("We finished? ", finished); //TODO: delete or catch error
    },
  );
}

//checking to see if video is playing
async function videoPlaying() {
  const isAd = document.querySelector(".ad-showing");
  console.log(isAd ? "Ad is playing" : "No ad detected");

  const video = document.querySelector("video");
  if (isAd && video && isFinite(video)) {
    video.currentTime = video.duration; //if video is finite, make it skip to the end
  }

  //if not, force skipbutton to display push it
  const skipButton = document.querySelector(".ytp-skip-ad-button");
  if (skipButton && !skipButton.disabled && skipButton.offsetParent !== null) {
    if (isHandlingCheck) {
      console.log("videoPlaying is being handled already...skipping");
      return;
    }

    isHandlingCheck = true;
    await simulateClickWithDebugger(skipButton);
    const video = document.querySelector("video");
    if (video) {
      await video.play(); //play video after ad
    }
  } else if (skipButton) {
    skipButton.removeAttribute("aria-hidden");
    skipButton.style.setProperty("disabled", "false", "important");
    skipButton.style.setProperty("display", "flex", "important");
    skipButton.style.setProperty("opacity", "1", "important");
  }

  isHandlingCheck = false;

  const overlayCloseButton = document.querySelector(
    ".ytp-ad-overlay-close-button",
  );
  if (overlayCloseButton) {
    console.log("Overlay close button found:", overlayCloseButton);
    overlayCloseButton.click();
  }
}

//what to do if user said "yes" to adblocker and are on yt (mainly for homepage, tbh)
function handleToggle(toggle) {
  if (isHandlingToggle) {
    //if this function is already running, skip it so as to not run it twice or interrupt
    console.log("handleToggle is already running. Skipping...");
    return;
  }

  isHandlingToggle = true; //set flag to true to indicate it's running

  //all of the stupid class names for ads
  const adElements = document.querySelectorAll(
    ".ytd-in-feed-ad-layout-renderer, .style-scope.ytd-in-feed-ad-layout-renderer .ytd-statement-banner-renderer .style-scope.ytd-statement-banner-renderer .tp-yt-paper-dialog-scrollable .tp-yt-paper-dialog-scrollable .ytwTopBannerImageTextIconButtonedLayoutViewModelHost .style-scope.ytwTopBannerImageTextIconButtonedLayoutViewModelHost .style-scope.ytd-ad-slot-renderer .ytd-ad-slot-renderer",
  );
  const exisitingIds = document.querySelectorAll("#player-ads"); //all ids for ads

  const allAds = [...adElements, ...exisitingIds];

  if (allAds.length > 0) {
    requestAnimationFrame(() => {
      allAds.forEach((element) => {
        const parent = element.closest("ytd-rich-item-renderer"); //box holding ad video on front page (keeping it leaves black box)
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
    try {
      videoPlaying();
    } catch (error) {
      console.error("Skipping video ad failed: ", error); //you never know
      isHandlingToggle = false;
    }
  }

  isHandlingToggle = false; // Set the flag to false when it's done
}

//watching to see if the toggle changed---TODO make it a listener instead of a timer
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

//monitors DOM for changes (loading more videos as you scroll, lowkey)
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

//runs this the first time it loads
function runAfterPageLoad() {
  return new Promise((resolve) => {
    window.addEventListener("load", () => {
      isToggle(function (toggle) {
        handleToggle(toggle);
      });
      resolve();
    });
  });
}

async function initialize() {
  await runAfterPageLoad();

  monitorToggleChange();
  monitorDOMChanges();

  //may be too much, but checks if scroll
  window.addEventListener("scroll", () => {
    isToggle(function (toggle) {
      handleToggle(toggle);
    });
  });
}

initialize(); //checks DOM for changes, loading, scrolling, and timer---jeez
