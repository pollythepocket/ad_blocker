//reroutes default ad websites
browser.webRequest.onBeforeRequest.addListener(
    function(details) {
      if (details.url.includes("doubleclick.net") || details.url.includes("googleads.g.doubleclick.net")) {
        return {cancel: true};
      }
    },
    {urls: ["*://*/*"]},
    ["blocking"]
  );