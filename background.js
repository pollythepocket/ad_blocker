//TODO: delete debugging functions before first deployment

//retrieve toggle state
function isToggle(callback) {
  chrome.storage.sync.get("toggle", function (data) {
    callback(data.toggle || false);
  });
}

//sets up the quick restrictions
function toggleOn() {
  chrome.declarativeNetRequest
    .updateDynamicRules({
      removeRuleIds: [1],
    })
    .then(() => {
      chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [
          {
            id: 1,
            priority: 1,
            action: { type: "block" },
            condition: {
              urlFilter:
                "doubleclick.net|googleads.g.doubleclick.net|adservice.google.com|ads.yahoo.com|pagead2.googlesyndication.com|ad.doubleclick.net|www.googleadservices.com",
              resourceTypes: ["script", "xmlhttprequest", "sub_frame", "image"],
            },
          },
        ],
      });
    });
}

//turns off quick restrictions
function toggleOff() {
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1],
  });
}

chrome.runtime.onInstalled.addListener(() => {
  console.log("'Makeshift Ad Blocker' installed/updated"); //TODO: welcome messege?

  chrome.storage.sync.set({ toggle: true }); //has user start on true
});

//debugger to see what tab user is on---unimportant
function checkTabStatus() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs.length > 0) {
      const tab = tabs[0];
      if (tab.status === "complete") {
        if (tab?.url) {
          const url = new URL(tab.url);
          const domain = url.hostname.toString();
          // console.log("here is domain:", domain);
        }
      }
    }
  });
}

//deals with alarm when fired
function alarmListener(alarm) {
  if (alarm.name === "check-for-ads") {
    checkTabStatus(); //seeing where the hell i am
  }
}

//listener for when toggle is changed (true or false)
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "sync" && changes.toggle) {
    const toggleValue = changes.toggle.newValue;
    console.log("toggle value (on storage change):", toggleValue);

    if (toggleValue === true) {
      toggleOn(); //can be run once

      //adding this for more dynamic checks
      chrome.alarms.create("check-for-ads", {
        periodInMinutes: 1 / 60, //every sec
      });
      chrome.alarms.onAlarm.addListener(alarmListener); //again, for debugging---can delete
    } else {
      toggleOff();
      chrome.alarms.clear("check-for-ads");
      chrome.alarms.onAlarm.removeListener(alarmListener);
    }
  }
});

//lets Chrome able to click any button sent this way so isTrusted=true
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.text == "click-button-chrome-way") {
    chrome.tabs
      .query({ active: true, currentWindow: true }, function (tabs) {
        if (chrome.runtime.lastError) {
          console.error("Error fetching tabs: ", chrome.runtime.lastError);
          return;
        }
        if (tabs.length === 0) {
          console.error("No active tab found.");
          return;
        }

        const tabId = tabs[0].id;
        console.log("Tab ID found:", tabId);

        chrome.debugger.attach({ tabId: tabId }, "1.2", function () {
          console.log("Debugger attached.");

          chrome.debugger.sendCommand(
            { tabId: tabId },
            "Input.dispatchMouseEvent",
            {
              type: "mousePressed",
              button: "left",
              x: msg.x,
              y: msg.y,
              clickCount: 1,
            },
          );

          chrome.debugger.sendCommand(
            { tabId: tabId },
            "Input.dispatchMouseEvent",
            {
              type: "mouseReleased",
              button: "left",
              x: msg.x,
              y: msg.y,
              clickCount: 1,
            },
          );

          sendResponse({ finished: true }); //tells youtube.js it has finished
        });
      })
      .catch((err) => {
        sendResponse({ finished: false });
      });
  }
});
