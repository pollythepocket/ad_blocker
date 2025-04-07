# Makeshift Ad Blocker

Makeshift Ad Blocker was created in response to many of my favorite ad blockers no longer being supported by Chrome. I thought, why not create my own?

For now, it is only a Chrome extension, as I believe [UBlock Origin](https://github.com/gorhill/uBlock) is the optimal Ad Block for other browsers, and, as a sort of inspiration, by default blocks pop-ups, malware sites, ads, and etc. using [EasyList](https://easylist.to/#easylist), [EasyPrivacy](https://easylist.to/#easyprivacy), [EasyList_Adult](https://github.com/easylist/easylist/tree/master/easylist_adult), and [UBlock Origin filters](https://github.com/uBlockOrigin/uAssets/tree/master/filters).

## Specfic Sites where further scripts were needed (Opensource for others idc)

### Youtube

Within [scripts/youtube.js](https://github.com/pollythepocket/makeshift_ad_blocker/blob/main/scripts/youtube.js), is the script for both skipping video ads and removing Youtube's built-in ads.

--- (Note: At [a certain point](https://github.com/pollythepocket/makeshift_ad_blocker/blob/main/scripts/youtube.js#L34), [background.js](https://github.com/pollythepocket/makeshift_ad_blocker/blob/main/background.js) is called to get around [eventIstrusted](https://www.w3schools.com/jsref/event_istrusted.asp))

# Disclaimer

I am quite new to this type of programming, so I apologize if someone feels this is not optimal. Feel free to DM me on [LinkedIn](https://www.linkedin.com/in/polly-ruhnke-573440224/) or submit an error here.

Version one is still being programmed.

# Icon Design Disclaimer

This simple icon was designed in Canvas by me, Polly Ruhnke, so all of the credit goes to the Canvas website and five minutes of my time.
