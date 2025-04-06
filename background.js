//retrieve toggle state
function isToggle(callback) {
  chrome.storage.sync.get("toggle", function (data) {
    callback(data.toggle || false);
  });
}

//sets up the quick restrictions
function toggleOn() {
  // First remove the rule with ID 1 if it exists
  chrome.declarativeNetRequest
    .updateDynamicRules({
      removeRuleIds: [1],
    })
    .then(() => {
      // After removing, add the rule back
      chrome.declarativeNetRequest
        .updateDynamicRules({
          addRules: [
            {
              id: 1, // Keep the same ID
              priority: 1,
              action: { type: "block" },
              condition: {
                urlFilter:
                  "doubleclick.net|googleads.g.doubleclick.net|adservice.google.com|ads.yahoo.com|pagead2.googlesyndication.com|ad.doubleclick.net|www.googleadservices.com",
                resourceTypes: [
                  "script",
                  "xmlhttprequest",
                  "sub_frame",
                  "image",
                ],
              },
            },
          ],
        })
        .catch((err) => {
          console.error("Error adding rule:", err);
        });
    })
    .catch((err) => {
      console.error("Error removing rule:", err);
    });
}

function toggleOff() {
  // Simply remove the rule with ID 1
  chrome.declarativeNetRequest
    .updateDynamicRules({
      removeRuleIds: [1],
    })
    .catch((err) => {
      console.error("Error removing rule:", err);
    });
}

// This event listener keeps the service worker alive when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed/updated");

  chrome.storage.sync.set({ toggle: true });
});

function checkTabStatus() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs.length > 0) {
      const tab = tabs[0];
      if (tab.status === "complete") {
        if (tab?.url) {
          const url = new URL(tab.url);
          const domain = url.hostname.toString();
          console.log("here is domain:", domain);
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
      chrome.alarms.onAlarm.addListener(alarmListener);
    } else {
      toggleOff();
      chrome.alarms.clear("check-for-ads");
      chrome.alarms.onAlarm.removeListener(alarmListener);
    }
  }
});
