browser.webRequest.onBeforeRequest.addListener(
    function(details) {
      // Block requests to ad-related URLs
      if (details.url.includes("doubleclick.net") || details.url.includes("googleads.g.doubleclick.net")) {
        return {cancel: true};
      }
    },
    {urls: ["*://*/*"]},
    ["blocking"]
  );