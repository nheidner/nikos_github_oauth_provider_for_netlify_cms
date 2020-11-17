'use strict';
var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value);
                  });
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator['throw'](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done
                    ? resolve(result.value)
                    : adopt(result.value).then(fulfilled, rejected);
            }
            step(
                (generator = generator.apply(thisArg, _arguments || [])).next()
            );
        });
    };
var __generator =
    (this && this.__generator) ||
    function (thisArg, body) {
        var _ = {
                label: 0,
                sent: function () {
                    if (t[0] & 1) throw t[1];
                    return t[1];
                },
                trys: [],
                ops: [],
            },
            f,
            y,
            t,
            g;
        return (
            (g = { next: verb(0), throw: verb(1), return: verb(2) }),
            typeof Symbol === 'function' &&
                (g[Symbol.iterator] = function () {
                    return this;
                }),
            g
        );
        function verb(n) {
            return function (v) {
                return step([n, v]);
            };
        }
        function step(op) {
            if (f) throw new TypeError('Generator is already executing.');
            while (_)
                try {
                    if (
                        ((f = 1),
                        y &&
                            (t =
                                op[0] & 2
                                    ? y['return']
                                    : op[0]
                                    ? y['throw'] ||
                                      ((t = y['return']) && t.call(y), 0)
                                    : y.next) &&
                            !(t = t.call(y, op[1])).done)
                    )
                        return t;
                    if (((y = 0), t)) op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return { value: op[1], done: false };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (
                                !((t = _.trys),
                                (t = t.length > 0 && t[t.length - 1])) &&
                                (op[0] === 6 || op[0] === 2)
                            ) {
                                _ = 0;
                                continue;
                            }
                            if (
                                op[0] === 3 &&
                                (!t || (op[1] > t[0] && op[1] < t[3]))
                            ) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2]) _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                } catch (e) {
                    op = [6, e];
                    y = 0;
                } finally {
                    f = t = 0;
                }
            if (op[0] & 5) throw op[1];
            return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, '__esModule', { value: true });
require('dotenv').config();
console.log(process.env);
var crypto_1 = __importDefault(require('crypto'));
var express_1 = __importDefault(require('express'));
var axios_1 = __importDefault(require('axios'));
var querystring_1 = __importDefault(require('querystring'));
var app = express_1.default();
var state = crypto_1.default.randomBytes(32).toString('hex');
app.get('/', function (req, res) {
    res.send(req.headers);
});
app.get('/auth', function (req, res) {
    res.redirect(
        'https://github.com/login/oauth/authorize?client_id=' +
            process.env.NIKOOAUTH_CLIENT_ID +
            '&redirect_uri=' +
            process.env.NIKOOAUTH_YOUR_DOMAIN +
            '/callback&scope=' +
            (req.query.scope || 'repo,user') +
            '&state=' +
            state
    );
});
app.get('/callback', function (req, res) {
    return __awaiter(void 0, void 0, void 0, function () {
        var token, accessTokenRes, data, err_1, script;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (req.query.state !== state) {
                        res.status(500).send('Login failed');
                        process.exit();
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [
                        4 /*yield*/,
                        axios_1.default.post(
                            'https://github.com/login/oauth/access_token?client_id=' +
                                process.env.NIKOOAUTH_CLIENT_ID +
                                '&client_secret=' +
                                process.env.CLIENT_SECRET +
                                '&code=' +
                                req.query.code +
                                '&state=' +
                                state
                        ),
                    ];
                case 2:
                    accessTokenRes = _a.sent();
                    data = querystring_1.default.parse(accessTokenRes.data);
                    if (data.error) {
                        res.status(500).send(
                            process.env.NIKOOAUTH_NODE_ENV !== 'production'
                                ? data.error
                                : 'Login failed'
                        );
                        process.exit();
                    }
                    token = data.access_token;
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.log('err: ', err_1);
                    return [2 /*return*/];
                case 4:
                    console.log(token);
                    script =
                        '\n    <script>\n        (function() {\n            console.log(window.opener)\n        })()\n    </script>';
                    res.send(script);
                    return [2 /*return*/];
            }
        });
    });
});
console.log('server running on ' + process.env.NIKOOAUTH_PORT);
app.listen(parseInt(process.env.NIKOOAUTH_PORT), process.env.NIKOOAUTH_HOST);
//# sourceMappingURL=index.js.map
