var expect = require('chai').expect;
var mockery = require('mockery');
var sinon = require('sinon');
var http = require('node-mocks-http');
var requireHelper = require('./util/requireHelper');
var Botly;
var request = {
    post: sinon.stub(),
    get: sinon.stub()
};

const USER_ID = '333';
const PAGE_ID = '111';

describe('Botly Tests', function () {

    before(() => {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false,
            useCleanCache: true
        });

        // replace the module `request` with a stub object
        mockery.registerMock('request', request);
        Botly = requireHelper('Botly');
    });

    afterEach(() => {
        request.post = sinon.stub();
        request.get = sinon.stub();
    });

    after(() => {
        mockery.disable();
    });

    it('should exist and allow instance creation with configuration', () => {
        expect(Botly).to.be.a.function;
        var botly = new Botly({
            accessToken: 'myToken',
            verifyToken: 'myVerifyToken',
            webHookPath: '/webhook',
            notificationType: Botly.CONST.NOTIFICATION_TYPE.NO_PUSH
        });
        expect(botly).to.be.defined;
        expect(botly.accessToken).to.equal('myToken');
        expect(botly.verifyToken).to.equal('myVerifyToken');
        expect(botly.webHookPath).to.equal('/webhook');
        expect(botly.notificationType).to.equal(Botly.CONST.NOTIFICATION_TYPE.NO_PUSH);
    });

    it('should throw an error when no access token provided', () => {
        expect(Botly).to.throw(Error, /Must provide accessToken/);
    });

    it('should provide an express router and handle correct verify_token', () => {

        var botly = new Botly({
            accessToken: 'myToken',
            verifyToken: 'myVerifyToken',
            webHookPath: '/webhook',
            notificationType: Botly.CONST.NOTIFICATION_TYPE.NO_PUSH
        });
        var router = botly.router();
        expect(router).to.be.defined;

        var response = http.createResponse();
        var request = http.createRequest({
            method: 'GET',
            url: '/webhook',
            query: {
                'hub.mode': 'subscribe',
                'hub.verify_token': 'myVerifyToken',
                'hub.challenge': '42'
            }
        });

        router.handle(request, response);
        expect(response._getData()).to.equal('42');

    });

    it('should provide an express router and reject correct verify_token if hub.mode is not "subscribe"', () => {

        var botly = new Botly({
            accessToken: 'myToken',
            verifyToken: 'myVerifyToken',
            webHookPath: '/webhook',
            notificationType: Botly.CONST.NOTIFICATION_TYPE.NO_PUSH
        });
        var router = botly.router();
        expect(router).to.be.defined;

        var response = http.createResponse();
        var request = http.createRequest({
            method: 'GET',
            url: '/webhook',
            query: {
                'hub.mode': 'SubscribE',
                'hub.verify_token': 'myVerifyToken',
                'hub.challenge': '42'
            }
        });

        router.handle(request, response);
        expect(response.statusCode).to.equal(403);
        expect(response._getData()).to.equal('Error, wrong validation token');
    });

    it('should provide an express router and handle bad verify_token', () => {

        var botly = new Botly({
            accessToken: 'myToken',
            verifyToken: 'myVerifyToken',
            webHookPath: '/webhook',
            notificationType: Botly.CONST.NOTIFICATION_TYPE.NO_PUSH
        });
        var router = botly.router();
        expect(router).to.be.defined;

        var response = http.createResponse();
        var request = http.createRequest({
            method: 'GET',
            url: '/webhook',
            query: {
                'hub.mode': 'subscribe',
                'hub.verify_token': '111',
                'hub.challenge': '42'
            }
        });

        router.handle(request, response);
        expect(response.statusCode).to.equal(403);
        expect(response._getData()).to.equal('Error, wrong validation token');

    });

    it('should handle optin messages', done => {

        var botly = new Botly({
            accessToken: 'myToken',
            verifyToken: 'myVerifyToken',
            webHookPath: '/webhook',
            notificationType: Botly.CONST.NOTIFICATION_TYPE.NO_PUSH
        });
        var router = botly.router();

        botly.on('optin', (id, message, optin) => {
            expect(id).to.equal(USER_ID);
            expect(optin).to.equal('PASS_THROUGH_PARAM');
            done();
        });

        var response = http.createResponse();
        var request = http.createRequest({
            method: 'POST',
            url: '/webhook',
            body: {
                'object': 'page',
                'entry': [
                    {
                        'id': PAGE_ID,
                        'time': 12341,
                        'messaging': [
                            {
                                'sender': {
                                    'id': USER_ID
                                },
                                'recipient': {
                                    'id': PAGE_ID
                                },
                                'timestamp': 1234567890,
                                'optin': {
                                    'ref': 'PASS_THROUGH_PARAM'
                                }
                            }
                        ]
                    }
                ]
            }
        });

        router.handle(request, response);

    });

    it('should handle echo messages', done => {

        var botly = new Botly({
            accessToken: 'myToken',
            verifyToken: 'myVerifyToken',
            webHookPath: '/webhook',
            notificationType: Botly.CONST.NOTIFICATION_TYPE.NO_PUSH
        });
        var router = botly.router();

        botly.on('echo', (id, message, content) => {
            expect(id).to.equal(USER_ID);
            expect(content.text).to.equal('some text');
            done();
        });

        var response = http.createResponse();
        var request = http.createRequest({
            method: 'POST',
            url: '/webhook',
            body: {
                'object': 'page',
                'entry': [
                    {
                        'id': PAGE_ID,
                        'time': 12341,
                        'messaging': [
                            {
                                'sender': {
                                    'id': USER_ID
                                },
                                'recipient': {
                                    'id': PAGE_ID
                                },
                                'timestamp': 1234567890,
                                'message': {
                                    'mid': 'mid.1457764197618:41d102a3e1ae206a38',
                                    'seq': 73,
                                    'text': 'some text',
                                    'is_echo': true
                                }
                            }
                        ]
                    }
                ]
            }
        });

        router.handle(request, response);

    });

    it('should emit error when there is one', done => {

        var botly = new Botly({
            accessToken: 'myToken',
            verifyToken: 'myVerifyToken',
            webHookPath: '/webhook',
            notificationType: Botly.CONST.NOTIFICATION_TYPE.NO_PUSH
        });
        var router = botly.router();

        botly.on('error', (err) => {
            expect(err).to.be.defined;
            done();
        });

        var response = http.createResponse();
        var request = http.createRequest({
            method: 'POST',
            url: '/webhook',
            body: {
                'object': 'page',
                'entry': 'blabla'
            }
        });

        router.handle(request, response);

    });

    it('should handle delivery messages', done => {
        var mids = [
            'mid.1458668856218:ed81099e15d3f4f233'
        ];
        var botly = new Botly({
            accessToken: 'myToken',
            verifyToken: 'myVerifyToken',
            webHookPath: '/webhook',
            notificationType: Botly.CONST.NOTIFICATION_TYPE.NO_PUSH
        });
        var router = botly.router();

        botly.on('delivery', (id, message, delivery) => {
            expect(id).to.equal(USER_ID);
            expect(delivery[0]).to.equal(mids[0]);
            done();
        });

        var response = http.createResponse();

        var request = http.createRequest({
            method: 'POST',
            url: '/webhook',
            body: {
                'object': 'page',
                'entry': [
                    {
                        'id': PAGE_ID,
                        'time': 1458668856451,
                        'messaging': [
                            {
                                'sender': {
                                    'id': USER_ID
                                },
                                'recipient': {
                                    'id': PAGE_ID
                                },
                                'delivery': {
                                    'mids': mids,
                                    'watermark': 1458668856253,
                                    'seq': 37
                                }
                            }
                        ]
                    }
                ]
            }
        });

        router.handle(request, response);

    });

    it('should handle account linking messages', done => {
        var linkContent = {
            "status": "linked",
            "authorization_code": "PASS_THROUGH_AUTHORIZATION_CODE"
        };
        var botly = new Botly({
            accessToken: 'myToken',
            verifyToken: 'myVerifyToken',
            webHookPath: '/webhook',
            notificationType: Botly.CONST.NOTIFICATION_TYPE.NO_PUSH
        });
        var router = botly.router();

        botly.on('account_link', (id, message, link) => {
            expect(id).to.equal(USER_ID);
            expect(link).to.eql(linkContent);
            done();
        });

        var response = http.createResponse();

        var request = http.createRequest({
            method: 'POST',
            url: '/webhook',
            body: {
                'object': 'page',
                'entry': [
                    {
                        'id': PAGE_ID,
                        'time': 1458668856451,
                        'messaging': [
                            {
                                'sender': {
                                    'id': USER_ID
                                },
                                'recipient': {
                                    'id': PAGE_ID
                                },
                                'account_linking': linkContent
                            }
                        ]
                    }
                ]
            }
        });
        router.handle(request, response);
    });

    it('should handle postback messages', done => {

        var botly = new Botly({
            accessToken: 'myToken',
            verifyToken: 'myVerifyToken',
            webHookPath: '/webhook',
            notificationType: Botly.CONST.NOTIFICATION_TYPE.NO_PUSH
        });
        var router = botly.router();

        botly.on('postback', (id, message, payload) => {
            expect(id).to.equal(USER_ID);
            expect(payload).to.equal('USER_DEFINED_PAYLOAD');
            done();
        });

        var response = http.createResponse();

        var request = http.createRequest({
            method: 'POST',
            url: '/webhook',
            body: {
                'object': 'page',
                'entry': [
                    {
                        'id': PAGE_ID,
                        'time': 1458692752478,
                        'messaging': [
                            {
                                'sender': {
                                    'id': USER_ID
                                },
                                'recipient': {
                                    'id': PAGE_ID
                                },
                                'timestamp': 1458692752478,
                                'postback': {
                                    'payload': 'USER_DEFINED_PAYLOAD'
                                }
                            }
                        ]
                    }
                ]
            }
        });

        router.handle(request, response);

    });

    it('should handle text messages', done => {

        var botly = new Botly({
            accessToken: 'myToken',
            verifyToken: 'myVerifyToken',
            webHookPath: '/webhook',
            notificationType: Botly.CONST.NOTIFICATION_TYPE.NO_PUSH
        });
        var router = botly.router();

        botly.on('message', (id, message, data) => {
            expect(id).to.equal(USER_ID);
            expect(data.text).to.equal('hello, world!');
            done();
        });

        var response = http.createResponse();

        var request = http.createRequest({
            method: 'POST',
            url: '/webhook',
            body: {
                'object': 'page',
                'entry': [
                    {
                        'id': PAGE_ID,
                        'time': 1457764198246,
                        'messaging': [
                            {
                                'sender': {
                                    'id': USER_ID
                                },
                                'recipient': {
                                    'id': PAGE_ID
                                },
                                'timestamp': 1457764197627,
                                'message': {
                                    'mid': 'mid.1457764197618:41d102a3e1ae206a38',
                                    'seq': 73,
                                    'text': 'hello, world!'
                                }
                            }
                        ]
                    }
                ]
            }
        });

        router.handle(request, response);

    });

    it('should handle attachment messages', done => {

        var botly = new Botly({
            accessToken: 'myToken',
            verifyToken: 'myVerifyToken',
            webHookPath: '/webhook',
            notificationType: Botly.CONST.NOTIFICATION_TYPE.NO_PUSH
        });
        var router = botly.router();

        botly.on('message', (id, message, data) => {
            expect(id).to.equal(USER_ID);
            expect(data.attachments.image[0]).to.equal('IMAGE_URL');
            done();
        });

        var response = http.createResponse();

        var request = http.createRequest({
            method: 'POST',
            url: '/webhook',
            body: {
                'object': 'page',
                'entry': [
                    {
                        'id': PAGE_ID,
                        'time': 1458696618911,
                        'messaging': [
                            {
                                'sender': {
                                    'id': USER_ID
                                },
                                'recipient': {
                                    'id': PAGE_ID
                                },
                                'timestamp': 1458696618268,
                                'message': {
                                    'mid': 'mid.1458696618141:b4ef9d19ec21086067',
                                    'seq': 51,
                                    'attachments': [
                                        {
                                            'type': 'image',
                                            'payload': {
                                                'url': 'IMAGE_URL'
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                ]
            }
        });

        router.handle(request, response);

    });

    it('should send text messages', () => {
        request.post.yields(null, {});
        var botly = new Botly({
            accessToken: 'myToken',
            verifyToken: 'myVerifyToken',
            webHookPath: '/webhook',
            notificationType: Botly.CONST.NOTIFICATION_TYPE.NO_PUSH
        });

        botly.sendText({id: USER_ID, text: 'hi'}, () => {
        });

        expect(request.post.calledOnce).to.be.true;
        expect(request.post.args[0][0].url).to.equal('https://graph.facebook.com/v2.12/me/messages');
        expect(request.post.args[0][0].body).to.eql({
            'message': {
                'text': 'hi'
            },
            'messaging_type': 'RESPONSE',
            'notification_type': 'NO_PUSH',
            'recipient': {
                'id': '333'
            }
        });

    });

    it('should allow overriding the url', () => {
        request.post.yields(null, {});
        var botly = new Botly({
            accessToken: 'myToken',
            verifyToken: 'myVerifyToken',
            webHookPath: '/webhook',
            FB_URL: 'https://mydomain.com/',
            notificationType: Botly.CONST.NOTIFICATION_TYPE.NO_PUSH
        });

        botly.sendText({id: USER_ID, text: 'hi'}, () => {
        });

        expect(request.post.calledOnce).to.be.true;
        expect(request.post.args[0][0].url).to.equal('https://mydomain.com/me/messages');
        expect(request.post.args[0][0].body).to.eql({
            'message': {
                'text': 'hi'
            },
            'messaging_type': 'RESPONSE',
            'notification_type': 'NO_PUSH',
            'recipient': {
                'id': '333'
            }
        });

    });

    it('should send sender action', () => {
        request.post.yields(null, {});
        var botly = new Botly({
            accessToken: 'myToken',
            verifyToken: 'myVerifyToken',
            webHookPath: '/webhook',
            notificationType: Botly.CONST.NOTIFICATION_TYPE.NO_PUSH
        });

        botly.sendAction({id: USER_ID, action: Botly.CONST.ACTION_TYPES.TYPING_ON}, () => {
        });

        expect(request.post.calledOnce).to.be.true;
        expect(request.post.args[0][0].body).to.eql({
            'sender_action': 'typing_on',
            'messaging_type': 'RESPONSE',
            'recipient': {
                'id': '333'
            }
        });

    });

    it('should send text messages with quick replies', () => {
        request.post.yields(null, {});
        var botly = new Botly({
            accessToken: 'myToken',
            verifyToken: 'myVerifyToken',
            webHookPath: '/webhook',
            notificationType: Botly.CONST.NOTIFICATION_TYPE.NO_PUSH
        });

        botly.sendText({
            id: USER_ID,
            text: 'hi',
            quick_replies: [botly.createQuickReply('option1', 'option_1', 'http://google.com/someimage.png'), botly.createShareLocation()]
        }, () => {
        });

        expect(request.post.calledOnce).to.be.true;
        expect(request.post.args[0][0].body).to.eql({
            'message': {
                'text': 'hi',
                'quick_replies': [
                    {
                        'content_type': 'text',
                        'title': 'option1',
                        'payload': 'option_1',
                        'image_url': 'http://google.com/someimage.png'
                    },
                    {
                        'content_type': 'location'
                    }
                ]
            },
            'messaging_type': 'RESPONSE',
            'notification_type': 'NO_PUSH',
            'recipient': {
                'id': '333'
            }
        });

    });

    it('should send image messages', () => {
        var botly = new Botly({
            accessToken: 'myToken',
            verifyToken: 'myVerifyToken',
            webHookPath: '/webhook',
            notificationType: Botly.CONST.NOTIFICATION_TYPE.NO_PUSH
        });

        botly.sendImage({id: USER_ID, url: 'http://image.com', is_reusable: true});

        expect(request.post.calledOnce).to.be.true;
        expect(request.post.args[0][0].body).to.eql({
            'message': {
                'attachment': {
                    'payload': {
                        'url': 'http://image.com',
                        'is_reusable': true
                    },
                    'type': 'image'
                }
            },
            'messaging_type': 'RESPONSE',
            'notification_type': 'NO_PUSH',
            'recipient': {
                'id': '333'
            }
        });

    });

    it('should upload attachment', () => {
        var botly = new Botly({
            accessToken: 'myToken',
            verifyToken: 'myVerifyToken',
            webHookPath: '/webhook',
            notificationType: Botly.CONST.NOTIFICATION_TYPE.NO_PUSH
        });

        botly.upload({type: Botly.CONST.ATTACHMENT_TYPE.IMAGE, payload: {url: 'http://image.com', is_reusable: true}});

        expect(request.post.calledOnce).to.be.true;
        expect(request.post.args[0][0].body).to.eql({
            'message': {
                'attachment': {
                    'payload': {
                        'url': 'http://image.com',
                        'is_reusable': true
                    },
                    'type': 'image'
                }
            }
        });

    });

    it('should send button messages', () => {
        var botly = new Botly({
            accessToken: 'myToken',
            verifyToken: 'myVerifyToken',
            webHookPath: '/webhook',
            notificationType: Botly.CONST.NOTIFICATION_TYPE.NO_PUSH
        });

        botly.sendButtons({
            id: USER_ID,
            text: 'What do you want to do next?',
            buttons: botly.createPostbackButton('Continue', 'continue'),
        }, function (err, data) {
        });

        expect(request.post.calledOnce).to.be.true;
        expect(request.post.args[0][0].body).to.eql({
            'message': {
                'attachment': {
                    'payload': {

                        'buttons': [
                            {
                                'payload': 'continue',
                                'title': 'Continue',
                                'type': 'postback'
                            }
                        ],
                        'template_type': 'button',
                        'text': 'What do you want to do next?'
                    },
                    'type': 'template'
                }
            },
            'messaging_type': 'RESPONSE',
            'notification_type': 'NO_PUSH',
            'recipient': {
                'id': '333'
            }
        });

    });

    it('should send generic messages', () => {
        var botly = new Botly({
            accessToken: 'myToken',
            verifyToken: 'myVerifyToken',
            webHookPath: '/webhook',
            notificationType: Botly.CONST.NOTIFICATION_TYPE.NO_PUSH
        });

        var element = {
            title: 'What do you want to do next?',
            item_url: 'https://upload.wikimedia.org/wikipedia/en/9/93/Tanooki_Mario.jpg',
            image_url: 'https://upload.wikimedia.org/wikipedia/en/9/93/Tanooki_Mario.jpg',
            subtitle: 'Choose now!',
            buttons: [botly.createWebURLButton('Go to Askrround', 'http://askrround.com'), botly.createAccountLinkButton('http://askrround.com/login'), botly.createShareButton()]
        };
        botly.sendGeneric({id: USER_ID, elements: element, aspectRatio: Botly.CONST.IMAGE_ASPECT_RATIO.HORIZONTAL});

        expect(request.post.calledOnce).to.be.true;
        expect(request.post.args[0][0].body).to.eql({
            'message': {
                'attachment': {
                    'payload': {
                        'elements': [
                            {
                                'buttons': [
                                    {
                                        'title': 'Go to Askrround',
                                        'type': 'web_url',
                                        'url': 'http://askrround.com'
                                    },
                                    {
                                        'type': 'account_link',
                                        'url': 'http://askrround.com/login'
                                    },
                                    {
                                        'type': 'element_share'
                                    }
                                ],
                                'image_url': 'https://upload.wikimedia.org/wikipedia/en/9/93/Tanooki_Mario.jpg',
                                'item_url': 'https://upload.wikimedia.org/wikipedia/en/9/93/Tanooki_Mario.jpg',
                                'subtitle': 'Choose now!',
                                'title': 'What do you want to do next?'
                            }
                        ],
                        'image_aspect_ratio': 'horizontal',
                        'template_type': 'generic'
                    },
                    'type': 'template'
                }
            },
            'messaging_type': 'RESPONSE',
            'notification_type': 'NO_PUSH',
            'recipient': {
                'id': '333'
            }
        });

    });

    it('should send list template', () => {
        var botly = new Botly({
            accessToken: 'myToken',
            verifyToken: 'myVerifyToken',
            webHookPath: '/webhook',
            notificationType: Botly.CONST.NOTIFICATION_TYPE.NO_PUSH
        });

        var element = botly.createListElement({
            title: "Classic T-Shirt Collection",
            image_url: "https://peterssendreceiveapp.ngrok.io/img/collection.png",
            subtitle: "See all our colors",
            buttons: [ //Just to test coverage - you should not send more than one button in a list element
                {title: "Go to Askrround", url: "http://askrround.com"},
                {title: "DO WORK", payload: "DO_WORK"},
                {type: "element_share"}
            ],
            default_action: {
                "url": "https://peterssendreceiveapp.ngrok.io/shop_collection",
            }
        });
        botly.sendList({
            id: USER_ID,
            elements: element,
            buttons: botly.createPostbackButton("Continue", "continue"),
            top_element_style: Botly.CONST.TOP_ELEMENT_STYLE.LARGE
        });

        expect(request.post.calledOnce).to.be.true;
        expect(request.post.args[0][0].body).to.eql({
            'message': {
                'attachment': {
                    'payload': {
                        'elements': [
                            {
                                'buttons': [
                                    {
                                        'title': 'Go to Askrround',
                                        'type': 'web_url',
                                        'url': 'http://askrround.com'
                                    },
                                    {
                                        'type': 'postback',
                                        'title': 'DO WORK',
                                        'payload': 'DO_WORK'
                                    },
                                    {
                                        'type': 'element_share'
                                    }
                                ],
                                'default_action': {
                                    'type': 'web_url',
                                    'url': 'https://peterssendreceiveapp.ngrok.io/shop_collection'
                                },
                                'image_url': 'https://peterssendreceiveapp.ngrok.io/img/collection.png',
                                'subtitle': 'See all our colors',
                                'title': 'Classic T-Shirt Collection'
                            }
                        ],
                        'buttons': [
                            {
                                'type': 'postback',
                                'title': 'Continue',
                                'payload': 'continue'
                            }
                        ],
                        "top_element_style": "large",
                        'template_type': 'list'
                    },
                    'type': 'template'
                }
            },
            'messaging_type': 'RESPONSE',
            'notification_type': 'NO_PUSH',
            'recipient': {
                'id': '333'
            }
        });

    });

    it('should send webview buttons', () => {
        var botly = new Botly({
            accessToken: 'myToken',
            verifyToken: 'myVerifyToken',
            webHookPath: '/webhook',
            notificationType: Botly.CONST.NOTIFICATION_TYPE.NO_PUSH
        });

        var element = {
            title: 'What do you want to do next?',
            item_url: 'https://upload.wikimedia.org/wikipedia/en/9/93/Tanooki_Mario.jpg',
            image_url: 'https://upload.wikimedia.org/wikipedia/en/9/93/Tanooki_Mario.jpg',
            subtitle: 'Choose now!',
            buttons: [botly.createWebURLButton('Go to Askrround', 'http://askrround.com', Botly.CONST.WEBVIEW_HEIGHT_RATIO.COMPACT, true, 'http://askrround.com')]
        };
        botly.sendGeneric({id: USER_ID, elements: element});

        expect(request.post.calledOnce).to.be.true;
        expect(request.post.args[0][0].body).to.eql({
            'message': {
                'attachment': {
                    'payload': {
                        'elements': [
                            {
                                'buttons': [
                                    {
                                        'title': 'Go to Askrround',
                                        'type': 'web_url',
                                        'url': 'http://askrround.com',
                                        'webview_height_ratio': 'compact',
                                        'messenger_extensions': true,
                                        'fallback_url': 'http://askrround.com'
                                    }
                                ],
                                'image_url': 'https://upload.wikimedia.org/wikipedia/en/9/93/Tanooki_Mario.jpg',
                                'item_url': 'https://upload.wikimedia.org/wikipedia/en/9/93/Tanooki_Mario.jpg',
                                'subtitle': 'Choose now!',
                                'title': 'What do you want to do next?'
                            }
                        ],
                        'image_aspect_ratio': 'horizontal',
                        'template_type': 'generic'
                    },
                    'type': 'template'
                }
            },
            'messaging_type': 'RESPONSE',
            'notification_type': 'NO_PUSH',
            'recipient': {
                'id': '333'
            }
        });

    });

    it('should send webview buttons when passing object', () => {
        var botly = new Botly({
            accessToken: 'myToken',
            verifyToken: 'myVerifyToken',
            webHookPath: '/webhook',
            notificationType: Botly.CONST.NOTIFICATION_TYPE.NO_PUSH
        });

        var element = {
            title: 'What do you want to do next?',
            item_url: 'https://upload.wikimedia.org/wikipedia/en/9/93/Tanooki_Mario.jpg',
            image_url: 'https://upload.wikimedia.org/wikipedia/en/9/93/Tanooki_Mario.jpg',
            subtitle: 'Choose now!',
            buttons: [botly.createWebURLButton({
                title: 'Go to Askrround',
                url: 'http://askrround.com',
                heightRatio: Botly.CONST.WEBVIEW_HEIGHT_RATIO.COMPACT,
                supportExtension: true,
                fallbackURL: 'http://askrround.com'
            })]
        };
        botly.sendGeneric({id: USER_ID, elements: element, aspectRatio: Botly.CONST.IMAGE_ASPECT_RATIO.SQUARE});

        expect(request.post.calledOnce).to.be.true;
        expect(request.post.args[0][0].body).to.eql({
            'message': {
                'attachment': {
                    'payload': {
                        'elements': [
                            {
                                'buttons': [
                                    {
                                        'title': 'Go to Askrround',
                                        'type': 'web_url',
                                        'url': 'http://askrround.com',
                                        'webview_height_ratio': 'compact',
                                        'messenger_extensions': true,
                                        'fallback_url': 'http://askrround.com'
                                    }
                                ],
                                'image_url': 'https://upload.wikimedia.org/wikipedia/en/9/93/Tanooki_Mario.jpg',
                                'item_url': 'https://upload.wikimedia.org/wikipedia/en/9/93/Tanooki_Mario.jpg',
                                'subtitle': 'Choose now!',
                                'title': 'What do you want to do next?'
                            }
                        ],
                        'image_aspect_ratio': 'square',
                        'template_type': 'generic'
                    },
                    'type': 'template'
                }
            },
            'messaging_type': 'RESPONSE',
            'notification_type': 'NO_PUSH',
            'recipient': {
                'id': '333'
            }
        });

    });


    it('should send receipt messages', () => {
        var botly = new Botly({
            accessToken: 'myToken',
            verifyToken: 'myVerifyToken',
            webHookPath: '/webhook',
            notificationType: Botly.CONST.NOTIFICATION_TYPE.NO_PUSH
        });

        var payload = {
            'recipient_name': 'Stephane Crozatier',
            'order_number': '12345678902',
            'currency': 'USD',
            'payment_method': 'Visa 2345',
            'order_url': 'http://petersapparel.parseapp.com/order?order_id=123456',
            'timestamp': '1428444852',
            'elements': [
                {
                    'title': 'Classic White T-Shirt',
                    'subtitle': '100% Soft and Luxurious Cotton',
                    'quantity': 2,
                    'price': 50,
                    'currency': 'USD',
                    'image_url': 'http://petersapparel.parseapp.com/img/whiteshirt.png'
                },
                {
                    'title': 'Classic Gray T-Shirt',
                    'subtitle': '100% Soft and Luxurious Cotton',
                    'quantity': 1,
                    'price': 25,
                    'currency': 'USD',
                    'image_url': 'http://petersapparel.parseapp.com/img/grayshirt.png'
                }
            ],
            'address': {
                'street_1': '1 Hacker Way',
                'street_2': '',
                'city': 'Menlo Park',
                'postal_code': '94025',
                'state': 'CA',
                'country': 'US'
            },
            'summary': {
                'subtotal': 75.00,
                'shipping_cost': 4.95,
                'total_tax': 6.19,
                'total_cost': 56.14
            },
            'adjustments': [
                {
                    'name': 'New Customer Discount',
                    'amount': 20
                },
                {
                    'name': '$10 Off Coupon',
                    'amount': 10
                }
            ]
        };
        botly.sendReceipt({id: USER_ID, payload: payload, notificationType: Botly.CONST.NOTIFICATION_TYPE.REGULAR});

        expect(request.post.calledOnce).to.be.true;
        expect(request.post.args[0][0].body).to.eql({
            'message': {
                'attachment': {
                    'payload': {
                        'address': {
                            'city': 'Menlo Park',
                            'country': 'US',
                            'postal_code': '94025',
                            'state': 'CA',
                            'street_1': '1 Hacker Way',
                            'street_2': ''
                        },
                        'adjustments': [
                            {
                                'amount': 20,
                                'name': 'New Customer Discount'
                            },
                            {
                                'amount': 10,
                                'name': '$10 Off Coupon'
                            }
                        ],
                        'currency': 'USD',
                        'elements': [
                            {
                                'currency': 'USD',
                                'image_url': 'http://petersapparel.parseapp.com/img/whiteshirt.png',
                                'price': 50,
                                'quantity': 2,
                                'subtitle': '100% Soft and Luxurious Cotton',
                                'title': 'Classic White T-Shirt'
                            },
                            {
                                'currency': 'USD',
                                'image_url': 'http://petersapparel.parseapp.com/img/grayshirt.png',
                                'price': 25,
                                'quantity': 1,
                                'subtitle': '100% Soft and Luxurious Cotton',
                                'title': 'Classic Gray T-Shirt'
                            }
                        ],
                        'order_number': '12345678902',
                        'order_url': 'http://petersapparel.parseapp.com/order?order_id=123456',
                        'payment_method': 'Visa 2345',
                        'recipient_name': 'Stephane Crozatier',
                        'summary': {
                            'shipping_cost': 4.95,
                            'subtotal': 75,
                            'total_cost': 56.14,
                            'total_tax': 6.19
                        },
                        'template_type': 'receipt',
                        'timestamp': '1428444852'
                    },
                    'type': 'template'
                }
            },
            'messaging_type': 'RESPONSE',
            'notification_type': 'REGULAR',
            'recipient': {
                'id': '333'
            }
        });

    });

    it('should get user profile with default fields', done => {
        request.get.yields(
            {
                first_name: 'miki'
            }
        );
        var botly = new Botly({
            accessToken: 'myToken',
            verifyToken: 'myVerifyToken',
            webHookPath: '/webhook',
            notificationType: Botly.CONST.NOTIFICATION_TYPE.NO_PUSH
        });

        botly.getUserProfile(USER_ID, (data) => {
            expect(request.get.calledOnce).to.be.true;
            expect(data).to.eql({
                first_name: 'miki'
            });

            const expectedFields = [
                Botly.CONST.USER_PROFILE_FIELD.FIRST_NAME,
                Botly.CONST.USER_PROFILE_FIELD.LAST_NAME,
                Botly.CONST.USER_PROFILE_FIELD.PROFILE_PIC
            ].join(',');
            const actualFields = request.get.getCall(0).args[0].qs.fields;
            expect(expectedFields).to.equal(actualFields);

            done();
        });

    });

    it('should get user profile with object and specified fields', done => {
        request.get.yields(
            {
                first_name: 'miki'
            }
        );
        var botly = new Botly({
            accessToken: 'myToken',
            verifyToken: 'myVerifyToken',
            webHookPath: '/webhook',
            notificationType: Botly.CONST.NOTIFICATION_TYPE.NO_PUSH
        });

        const options = {
            id: USER_ID,
            fields: [
                Botly.CONST.USER_PROFILE_FIELD.FIRST_NAME,
                Botly.CONST.USER_PROFILE_FIELD.PROFILE_PIC
            ]
        };
        botly.getUserProfile(options, (data) => {
            expect(request.get.calledOnce).to.be.true;
            expect(data).to.eql({
                first_name: 'miki'
            });

            const expectedFields = options.fields.join(',');
            const actualFields = request.get.getCall(0).args[0].qs.fields;
            expect(actualFields).to.equal(expectedFields);
            done();
        });

    });

    it('should get page scoped id', done => {
        request.get.yields(
            {
                "id": "111",
                "recipient": "222"
            }
        );
        var botly = new Botly({
            accessToken: 'myToken',
            verifyToken: 'myVerifyToken',
            webHookPath: '/webhook',
            notificationType: Botly.CONST.NOTIFICATION_TYPE.NO_PUSH
        });

        botly.getPSID('333', (data) => {
            expect(request.get.calledOnce).to.be.true;
            expect(data).to.eql({
                "id": "111",
                "recipient": "222"
            });
            done();
        });

    });

    it('should get page scoped id with an object', done => {
        request.get.yields(
            {
                "id": "111",
                "recipient": "222"
            }
        );
        var botly = new Botly({
            accessToken: 'myToken',
            verifyToken: 'myVerifyToken',
            webHookPath: '/webhook',
            notificationType: Botly.CONST.NOTIFICATION_TYPE.NO_PUSH
        });

        botly.getPSID({token: '333', accessToken: '7777'}, (data) => {
            expect(request.get.calledOnce).to.be.true;
            expect(data).to.eql({
                "id": "111",
                "recipient": "222"
            });
            done();
        });

    });

    it('should set welcome screen', () => {
        request.post.yields(null, {});
        var botly = new Botly({
            accessToken: 'myToken',
            verifyToken: 'myVerifyToken',
            webHookPath: '/webhook',
            notificationType: Botly.CONST.NOTIFICATION_TYPE.NO_PUSH
        });

        botly.setGetStarted({pageId: PAGE_ID, payload: 'GET_STARTED_CLICKED'}, () => {
        });

        expect(request.post.calledOnce).to.be.true;
        expect(request.post.args[0][0].body).to.eql({
            'get_started': {
                'payload': 'GET_STARTED_CLICKED'
            }
        });

    });

    it('should set greeting text', () => {
        request.post.yields(null, {});
        var botly = new Botly({
            accessToken: 'myToken',
            verifyToken: 'myVerifyToken',
            webHookPath: '/webhook',
            notificationType: Botly.CONST.NOTIFICATION_TYPE.NO_PUSH
        });

        botly.setGreetingText({pageId: PAGE_ID, greeting: [
            {
                "locale":"default",
                "text":"Hello!"
            }, {
                "locale":"en_US",
                "text":"Timeless apparel for the masses."
            }
        ]}, () => {
        });

        expect(request.post.calledOnce).to.be.true;
        expect(request.post.args[0][0].body).to.eql({
            'greeting': [
                {
                    "locale":"default",
                    "text":"Hello!"
                }, {
                    "locale":"en_US",
                    "text":"Timeless apparel for the masses."
                }
            ]
        });

    });

    it('should setwhitelist', () => {
        request.post.yields(null, {});
        var botly = new Botly({
            accessToken: 'myToken',
            verifyToken: 'myVerifyToken',
            webHookPath: '/webhook',
            notificationType: Botly.CONST.NOTIFICATION_TYPE.NO_PUSH
        });

        botly.setWhiteList({whiteList: ["https://askhaley.com"]}, () => {
        });

        expect(request.post.calledOnce).to.be.true;
        expect(request.post.args[0][0].body).to.eql({
            'whitelisted_domains': ["https://askhaley.com"]
        });

    });

    it('should set target audience', () => {
        request.post.yields(null, {});
        var botly = new Botly({
            accessToken: 'myToken',
            verifyToken: 'myVerifyToken',
            webHookPath: '/webhook',
            notificationType: Botly.CONST.NOTIFICATION_TYPE.NO_PUSH
        });

        botly.setTargetAudience({audience: {
            "audience_type":"custom",
            "countries":{
                "whitelist":["US", "CA"]
            }
        }}, () => {
        });

        expect(request.post.calledOnce).to.be.true;
        expect(request.post.args[0][0].body).to.eql({
            'target_audience': {
                "audience_type":"custom",
                "countries":{
                    "whitelist":["US", "CA"]
                }
            }
        });

    });

    it('should set persistent menu', () => {
        request.post.yields(null, {});
        var botly = new Botly({
            accessToken: 'myToken',
            verifyToken: 'myVerifyToken',
            webHookPath: '/webhook',
            notificationType: Botly.CONST.NOTIFICATION_TYPE.NO_PUSH
        });

        botly.setPersistentMenu({
            pageId: PAGE_ID, menu: [
                {
                    "locale": "default",
                    "composer_input_disabled": true,
                    "call_to_actions": [
                        {
                            "title": "My Account",
                            "type": "nested",
                            "call_to_actions": [
                                {
                                    "title": "Pay Bill",
                                    "type": "postback",
                                    "payload": "PAYBILL_PAYLOAD"
                                },
                                {
                                    "title": "History",
                                    "type": "postback",
                                    "payload": "HISTORY_PAYLOAD"
                                },
                                {
                                    "title": "Contact Info",
                                    "type": "postback",
                                    "payload": "CONTACT_INFO_PAYLOAD"
                                }
                            ]
                        },
                        {
                            "type": "web_url",
                            "title": "Latest News",
                            "url": "http://petershats.parseapp.com/hat-news",
                            "webview_height_ratio": "full"
                        }
                    ]
                },
                {
                    "locale": "zh_CN",
                    "composer_input_disabled": false
                }
            ]
        }, () => {
        });

        expect(request.post.calledOnce).to.be.true;
        expect(request.post.args[0][0].body).to.eql({
            'persistent_menu': [
                {
                    "locale": "default",
                    "composer_input_disabled": true,
                    "call_to_actions": [
                        {
                            "title": "My Account",
                            "type": "nested",
                            "call_to_actions": [
                                {
                                    "title": "Pay Bill",
                                    "type": "postback",
                                    "payload": "PAYBILL_PAYLOAD"
                                },
                                {
                                    "title": "History",
                                    "type": "postback",
                                    "payload": "HISTORY_PAYLOAD"
                                },
                                {
                                    "title": "Contact Info",
                                    "type": "postback",
                                    "payload": "CONTACT_INFO_PAYLOAD"
                                }
                            ]
                        },
                        {
                            "type": "web_url",
                            "title": "Latest News",
                            "url": "http://petershats.parseapp.com/hat-news",
                            "webview_height_ratio": "full"
                        }
                    ]
                },
                {
                    "locale": "zh_CN",
                    "composer_input_disabled": false
                }
            ]
        });

    });


});
