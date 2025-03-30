chrome.declarativeNetRequest.updateDynamicRules({
  addRules: [
    {
      id: 1,
      priority: 1,
      action: { type: "block" },
      condition: {
        urlFilter:
          "doubleclick.net|googleads.g.doubleclick.net|adservice.google.com|ads.yahoo.com|pagead2.googlesyndication.com",
        resourceTypes: ["script", "xmlhttprequest", "sub_frame", "image"],
      },
    },
  ],
  removeRuleIds: [1],
});
