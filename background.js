//TODO: delete debugging functions before first deployment

//retrieve toggle state
function isToggle(callback) {
  chrome.storage.sync.get("toggle", function (data) {
    callback(data.toggle || false);
  });
}

async function getAllFilesFromRepo() {
  //all easylist urls
  const urls = [
    "https://api.github.com/repos/easylist/easylist/contents/easylist",
    "https://api.github.com/repos/easylist/easylist/contents/easylist_adult",
    // "https://api.github.com/repos/easylist/easylist/contents/easylist_cookie",
    "https://api.github.com/repos/easylist/easylist/contents/easyprivacy",
    // "https://api.github.com/repos/easylist/easylist/contents/fanboy-addon"
  ];

  const responses = await Promise.all(urls.map((url) => fetch(url)));
  const data = await Promise.all(responses.map((response) => response.json()));

  return data;
}

async function parseFile(file) {
  function parseEasyListToDNRRules(easyListText) {
    const lines = easyListText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("!"));

    let ruleId = 1;
    const rules = [];

    for (const line of lines) {
      const match = line.match(/^\|\|(.+?)\^/);
      if (match) {
        rules.push({
          id: ruleId++,
          priority: 1,
          action: { type: "block" },
          condition: {
            urlFilter: match[1],
            resourceTypes: ["main_frame", "sub_frame", "script", "image"],
          },
        });
      }
    }

    return rules;
  }

  console.log(file.download_url);
  const res = await fetch(file.download_url);
  const text = await res.text();

  const rules = parseEasyListToDNRRules(text);

  chrome.declarativeNetRequest.updateDynamicRules({
    addRules: rules,
    removeRuleIds: rules.map((r) => r.id),
  });

  console.log("Adblock rules updated:", rules.length);
}

async function toggleOn() {
  const folders = await getAllFilesFromRepo();

  for (const folder of folders) {
    for (const file of folder) {
      await parseFile(file);
    }
  }
}

//turns off quick restrictions
async function toggleOff() {
  const rules = await chrome.declarativeNetRequest.getDynamicRules();
  const ruleIds = rules.map((rule) => rule.id);

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: ruleIds,
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

function sendDebuggerCommand(tabId, method, params) {
  return new Promise((resolve) =>
    chrome.debugger.sendCommand({ tabId }, method, params, resolve),
  );
}

async function attachDebugger(tabId) {
  await new Promise((resolve) => {
    chrome.debugger.attach({ tabId }, "1.2", resolve);
    console.log("Debugger attached.");
  });
}

async function detachDebugger(tabId) {
  await new Promise((resolve) => {
    chrome.debugger.detach({ tabId }, resolve);
    console.log(`Detached from tab ${tabId}`);
  });
}

async function clickWithDebugger(tabId, msg, sendResponse) {
  try {
    await attachDebugger(tabId);

    await sendDebuggerCommand(tabId, "Input.dispatchMouseEvent", {
      type: "mousePressed",
      button: "left",
      x: msg.x,
      y: msg.y,
      clickCount: 1,
    });

    await sendDebuggerCommand(tabId, "Input.dispatchMouseEvent", {
      type: "mouseReleased",
      button: "left",
      x: msg.x,
      y: msg.y,
      clickCount: 1,
    });

    await detachDebugger(tabId);
    sendResponse({ finished: true });
  } catch (err) {
    console.error("Something went wrong: ", err);
    sendResponse({ finished: false, error: err.message });
  }
}

//lets Chrome able to click any button sent this way so isTrusted=true
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.text === "click-button-chrome-way") {
    chrome.tabs.query(
      { active: true, currentWindow: true },
      async function (tabs) {
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

        // Call the main async function
        await clickWithDebugger(tabId, msg, sendResponse);
      },
    );
  }
});
