<img src="https://raw.githubusercontent.com/miki2826/botly/master/botly_logo.png" width="250" height="250" />

[![Built with Grunt](https://cdn.gruntjs.com/builtwith.svg)](http://gruntjs.com/)
[![Build Status](https://travis-ci.org/miki2826/botly.svg)](https://travis-ci.org/miki2826/botly)
[![Test Coverage](https://codeclimate.com/github/Askrround/botly/badges/coverage.svg)](https://codeclimate.com/github/Askrround/botly/coverage)
[![npm version](https://badge.fury.io/js/botly.svg)](http://badge.fury.io/js/botly)
[![Dependency Status](https://david-dm.org/Askrround/botly.svg?theme=shields.io)](https://david-dm.org/Askrround/botly)
[![devDependency Status](https://david-dm.org/Askrround/botly/dev-status.svg?theme=shields.io)](https://david-dm.org/Askrround/botly#info=devDependencies)
[![npm downloads](https://img.shields.io/npm/dm/botly.svg)](https://img.shields.io/npm/dm/botly.svg)
[![license](https://img.shields.io/npm/l/botly.svg)](LICENSE)
[![NPM](https://nodei.co/npm/botly.png?downloads=true&downloadRank=true)](https://nodei.co/npm/botly/)

> Simple Facebook Messenger Platform Bot API

  - [Install](#install)
  - [Example](#example)
  - [API](#api)
    - [send (options[, callback])](#send-options-callback)
    - [upload (options[, callback])](#upload-options-callback)
    - [sendText (options[, callback])](#sendtext-options-callback)
    - [sendAttachment (options[, callback])](#sendattachment-options-callback)
    - [sendImage (options[, callback])](#sendimage-options-callback)
    - [sendButtons (options[, callback])](#sendbuttons-options-callback)
    - [sendGeneric (options[, callback])](#sendgeneric-options-callback)
    - [sendList (options[, callback])](#sendlist-options-callback)
    - [sendOpenGraph (options[, callback])](#sendopengraph-options-callback)
    - [sendAction (options[, callback])](#sendaction-options-callback)
    - [sendReceipt (options[, callback])](#sendreceipt-options-callback)
    - [setGetStarted (options[, callback])](#setgetstarted-options-callback)
    - [setGreetingText (options[, callback])](#setgreetingtext-options-callback)
    - [setTargetAudience (options[, callback])](#settargetaudience-options-callback)
    - [setWhitelist (options[, callback])](#setwhitelist-options-callback)
    - [setPersistentMenu (options[, callback])](#setpersistentmenue-options-callback)
    - [removePersistentMenu (options[, callback])](#removepersistentmenue-options-callback)]
    - [getUserProfile (options[, callback])](#getuserprofile-options-callback)
    - [getPSID (accountLinkingToken[, callback])](#getpsid-accountlinkingtoken-callback)
    - [createWebURLButton (title, url[, heightRatio][, supportExtension][, fallbackURL][, disableShare])](#createweburlbutton-title-url-heightratio-supportextension-fallbackurl-disableshare)
    - [createAccountLinkButton (url)](#createaccountlinkbutton-url)
    - [createPostbackButton (title, payload)](#createpostbackbutton-title-payload)
    - [createShareButton ()](#createsharebutton-)
    - [createQuickReply (title, payload[, imageURL])](#createquickreply-title-payload-imageurl)
    - [createShareLocation ()](#createsharelocation-)
    - [createListElement (options)](#createlistelement-options)
    - [createOpenGraphElement (options)](#createopengraphelement-options)
    - [createButtonTemplate (text, buttons)](#createbuttontemplate-text-buttons)
    - [createGenericTemplate (elements[, aspectRatio])](#creategenerictemplate-elements-aspectratio)
    - [createListTemplate (options)](#createlisttemplate-options)
    - [createOpenGraphTemplate (elements])](#createopengraphtemplate-elements-aspectratio)
    - [handleMessage (req)](#handlemessage-req)
  - [Events](#events)
  - [Change Log](#change-log)

### Install
`npm i botly --save`

### Example
```javascript
const express = require("express");
const bodyParser = require("body-parser");
const Botly = require("botly");
const botly = new Botly({
    accessToken: pageAccessToken, // page access token provided by facebook
    verifyToken: verificationToken, // needed when using express - the verification token you provided when defining the webhook in facebook
    webHookPath: yourWebHookPath, // defaults to "/",
    notificationType: Botly.CONST.REGULAR, // already the default (optional)
    FB_URL: 'https://graph.facebook.com/v2.6/' // this is the default - allows overriding for testing purposes
});

botly.on("message", (senderId, message, data) => {
    let text = `echo: ${data.text}`;

    botly.sendText({
      id: senderId,
      text: text
    });
});

const app = express();
app.use(bodyParser.json({
    verify: botly.getVerifySignature(process.env.APP_SECRET) //allow signature verification based on the app secret
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/webhook", botly.router());
app.listen(3000);
```

You can also clone the repository and run a complete bot example from the `example` folder.

### API

#### send (options[, callback])
```javascript
botly.send({
    id: userId,
    message: {text: "Hi There!"}
}, function (err, data) {
        //log it
});
```

#### upload (options[, callback])
```javascript
botly.upload({
    type: Botly.CONST.ATTACHMENT_TYPE.IMAGE,
    payload: {url: "http://example.com/image.png"}
}, (err, data) => {
    //save data.attachment_id
});
```

#### sendText (options[, callback])
```javascript
botly.sendText({id: userId, text: "Hi There!"}, function (err, data) {
        //log it
});
```

#### sendAttachment (options[, callback])
Also supports `options.filedata = '@/tmp/receipt.pdf'`. 
```javascript
botly.sendAttachment({
    id: userId,
    type: Botly.CONST.ATTACHMENT_TYPE.IMAGE,
    payload: {url: "http://example.com/image.png"}
}, (err, data) => {
        //log it
});
```

#### sendImage (options[, callback])
```javascript
botly.sendImage({id: userId, url: "http://example.com/image.png"}, (err, data) => {
        //log it
});
```

#### sendButtons (options[, callback])
```javascript
let buttons = [];
buttons.push(botly.createWebURLButton("Go to Askrround", "http://askrround.com"));
buttons.push(botly.createPostbackButton("Continue", "continue"));
botly.sendButtons({id: userId, text: "What do you want to do next?", buttons: buttons}
    , (err, data) => {
        //log it
});
```

#### sendGeneric (options[, callback])
```javascript
let buttons = [];
buttons.push(botly.createWebURLButton("Go to Askrround", "http://askrround.com"));
buttons.push(botly.createPostbackButton("Continue", "continue"));
let element = {
  title: "What do you want to do next?",
  item_url: "http://example.com",
  image_url: "http://example.com/image.png",
  subtitle: "Choose now!",
  buttons: buttons
}
botly.sendGeneric({id: userId, elements: element, aspectRatio: Botly.CONST.IMAGE_ASPECT_RATIO.HORIZONTAL}, (err, data) => {
    console.log("send generic cb:", err, data);
});
```

#### sendList (options[, callback])
```javascript

const element = botly.createListElement({
    title: 'First Element',
    image_url: 'https://peterssendreceiveapp.ngrok.io/img/collection.png',
    subtitle: 'subtitle text',
    buttons: [
        {title: 'Payload Button', payload: 'first_element'},
    ],
    default_action: {
        'url': 'https://peterssendreceiveapp.ngrok.io/shop_collection',
    }
});
const element2 = botly.createListElement({
    title: 'Other Element',
    image_url: 'https://peterssendreceiveapp.ngrok.io/img/collection.png',
    subtitle: 'even more subtitle',
    buttons: [
        {title: "Go to Askrround", url: "http://askrround.com"},
    ],
    default_action: {
        'url': 'https://peterssendreceiveapp.ngrok.io/shop_collection',
    }
});
botly.sendList({id: sender, elements: [element, element2], buttons: botly.createPostbackButton('More Plans', 'MORE_PLANS'), top_element_style: Botly.CONST.TOP_ELEMENT_STYLE.LARGE},function (err, data) {
      console.log('send list cb:', err, data);
});
```

#### sendAction (options[, callback])
```javascript
botly.sendAction({id: userId, action: Botly.CONST.ACTION_TYPES.TYPING_ON}, (err, data) => {
        //log it
});
```

#### sendReceipt (options[, callback])
```javascript
let payload = {
    "recipient_name": "Stephane Crozatier",
    "order_number": "12345678902",
    "currency": "USD",
    "payment_method": "Visa 2345",
    "order_url": "http://petersapparel.parseapp.com/order?order_id=123456",
    "timestamp": "1428444852",
    "elements": [
        {
            "title": "Classic White T-Shirt",
            "subtitle": "100% Soft and Luxurious Cotton",
            "quantity": 2,
            "price": 50,
            "currency": "USD",
            "image_url": "http://petersapparel.parseapp.com/img/whiteshirt.png"
        },
        {
            "title": "Classic Gray T-Shirt",
            "subtitle": "100% Soft and Luxurious Cotton",
            "quantity": 1,
            "price": 25,
            "currency": "USD",
            "image_url": "http://petersapparel.parseapp.com/img/grayshirt.png"
        }
    ],
    "address": {
        "street_1": "1 Hacker Way",
        "street_2": "",
        "city": "Menlo Park",
        "postal_code": "94025",
        "state": "CA",
        "country": "US"
    },
    "summary": {
        "subtotal": 75.00,
        "shipping_cost": 4.95,
        "total_tax": 6.19,
        "total_cost": 56.14
    },
    "adjustments": [
        {
            "name": "New Customer Discount",
            "amount": 20
        },
        {
            "name": "$10 Off Coupon",
            "amount": 10
        }
    ]
};
botly.sendReceipt({id: sender, payload: payload}, function (err, data) {
    console.log("send generic cb:", err, data);
});
```

#### setGetStarted (options[, callback])
```javascript
botly.setGetStarted({pageId: "myPage", payload: "GET_STARTED_CLICKED"}, (err, body) => {
    //log it
});
```

#### setGreetingText (options[, callback])
```javascript
botly.setGreetingText({
    pageId: "myPage",
     greeting: [{
           "locale":"default",
           "text":"Hello!"
       }, {
           "locale":"en_US",
           "text":"Timeless apparel for the masses."
   }]}, (err, body) => {
    //log it
});
```

#### setTargetAudience (options[, callback])
```javascript
botly.setTargetAudience({
    pageId: "myPage",
    audience: {
         "audience_type":"custom",
         "countries":{
             "whitelist":["US", "CA"]
         }
     }}, (err, body) => {
    //log it
});
```

#### setWhitelist (options[, callback])
```javascript
botly.setWhitelist({whiteList: ["https://askhaley.com"]}, (err, body) => {
    //log it
});
```

#### setPersistentMenu (options[, callback])
```javascript
botly.setPersistentMenu({
    pageId: "myPage", 
    menu: [
            {
               "locale":"default",
               "composer_input_disabled":true,
               "call_to_actions":[
                 {
                   "title":"My Account",
                   "type":"nested",
                   "call_to_actions":[
                     {
                       "title":"Pay Bill",
                       "type":"postback",
                       "payload":"PAYBILL_PAYLOAD"
                     },
                     {
                       "title":"History",
                       "type":"postback",
                       "payload":"HISTORY_PAYLOAD"
                     },
                     {
                       "title":"Contact Info",
                       "type":"postback",
                       "payload":"CONTACT_INFO_PAYLOAD"
                     }
                   ]
                 },
                 {
                   "type":"web_url",
                   "title":"Latest News",
                   "url":"http://petershats.parseapp.com/hat-news",
                   "webview_height_ratio":"full"
                 }
               ]
             },
             {
               "locale":"zh_CN",
               "composer_input_disabled":false
             }
           ]}, (err, body) => {
    //log it
});
```

#### removePersistentMenu (options[, callback])
```javascript
botly.removePersistentMenu(
    {
        pageId: "myPage",
    }, 
    (err, body) => {
        //log it
    });
```

#### getUserProfile (options[, callback])
Used to retrieve basic profile details by user page-scoped ID (PSID). You can pass the `userID` directly, in which case a default set of fields (`first_name`, `last_name`, `profile_pic`) are requested.

Also supports passing an object as
```javascript
const options = {
    id: userId,
    fields: [
        Botly.CONST.USER_PROFILE_FIELD.FIRST_NAME,
        Botly.CONST.USER_PROFILE_FIELD.LAST_NAME
    ],
    accessToken: OTHER_TOKEN
}

botly.getUserProfile(options, function (err, info) {
    //cache it
});
```

or

```javascript
botly.getUserProfile(userId, function (err, info) {
    //cache it
});
```

#### getPSID (accountLinkingToken[, callback])
Used to retrieve the user page-scoped ID (PSID) during the linking flow.
Also supports passing an object as `{token: accountLinkingToken, accessToken: OTHER_TOKEN}`

```javascript
botly.getUserProfile(accountLinkingToken, function (err, info) {
    //cache it
});
```

#### createWebURLButton (title, url[, heightRatio][, supportExtension][, fallbackURL][, disableShare])

#### createAccountLinkButton (url)

#### createPostbackButton (title, payload)

### createShareButton ()

#### createQuickReply (title, payload[, imageURL])
`sendAttachment` and `sendText` both support optional `quick_replies`

### createShareLocation ()
share location quick reply

#### createListElement (options)
Will create a list element. `default_action` will be added `web_url` type, and will create button according to properties (`url` means `web_url` and `payload` means `postback`)

#### createButtonTemplate (text, buttons)
Where `buttons` can be a single button or an array of buttons.

#### createGenericTemplate (elements[, aspectRatio])
Where `elements` can be a single element or an array of elements.
and `aspectRatio` defaults to `horizontal`

#### createListTemplate (options)
Where `options` has `bottons` and `elements` - an array will be created automatically if a single item was passed.

#### handleMessage (req)
If you are not using express, you can use this function to parse the request from facebook in order to generate the proper events.
`req` should have a body property.

### Events
```javascript
botly.on("message", (sender, message, data) => {
    /**
     * where data can be a text message or an attachment
     * data = {
     *   text: "text entered by user"
     * }
     * OR
     * data = {
     *   attachments: {
     *       image: ["imageURL1", "imageURL2"],
     *       video: ["videoURL"],
     *       audio: ["audioURL1"],
     *       location: [{coordinates}]
     *   }
     * }
     */
});

botly.on("postback", (sender, message, postback, ref) => {
    /**
     * where postback is the postback payload
     * and ref will arrive if m.me params were passed on a get started button (if defined)
     */
});

botly.on("delivery", (sender, message, mids) => {
    /**
     * where mids is an array of mids
     */
});

botly.on("optin", (sender, message, optin) => {
    /**
     * where optin is the ref pass through param
     */
});

botly.on("error", (ex) => {
    /* handle exceptions */
});

botly.on("sent", (to, message) => {
    /* track it */
});

botly.on("echo", (sender, message, content, recipient) => {
    /* track it */
});

botly.on("account_link",  (sender, message, link) => {
     /**
      * where link is the the object containing the status and authorization code
      */
});
botly.on("referral",  (sender, message, ref) => {
     /**
      * where ref is the data in the m.me param
      */
});
```

### Change Log

### version 1.5.0
- added required `messaging_type` parameter when sending message
- added the ability to override the `FB_URL` for testing purposes
- added `getVerifySignature(APP_SECRET)` function to allow signature verification - provide the result to `bodyParser.json({verify})`

### version 1.4.0
- support version 1.4 of messenger api
-  new `setPersistentMenu` API aligned with v1.4
- added `setGreetingText`, `setAccountLinkingURL`, `setTargetAudience` API
- aligned all thread settings to the new profile API
- added support for filedata upload in the `sendAttachment`
- added support for the new upload attachment API,
- support for new image_aspect_ratio in generic template

### version 1.3.0
- support version 1.3 of messenger including the new list template
- support for referral params on m.me links 

### version 1.2.0
- added support for webview height in web url button
- added support setWhitelist for webview items
- added createShare button
- added support for location share quick reply
- added imageURL to quick reply

#### version 1.1.6
- Send 403 status code when verify token is invalid

#### version 1.1.5
- fixed duplicate messages on echo  
- added echo event support 

#### version 1.1.4
- added support for account linking functionality (event, getPSID)
- added ability to override accessToken on all APIs for multiple pages support 

#### version 1.1.0
- added support for sender actions using `sendAction` (mark seen/ typing on/ typing off)

#### version 1.0.3
- added send event - useful for tracking

#### version 1.0.1
- quick replies are considered as postback and not regular message

#### version 1.0.0
- removed `createTemplate` function - was too verbose
- moved to object parameters - too many parameters
- added support for quick replies
- add support for persistent menu
- added support for audio/video/file attachments
- renamed setWelcomeScreen to setGetStarted since no longer supported by facebook.
