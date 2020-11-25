require('dotenv').config();
import crypto from 'crypto';
import express, { Request, Response } from 'express';
import axios from 'axios';
import qs from 'querystring';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cookieParser(process.env.NIKOOAUTH_CLIENT_SECRET));

const cookieOptions = {
    httpOnly: true,
    signed: true,
};

app.get('/auth', (req: Request, res: Response) => {
    const state = crypto.randomBytes(32).toString('hex');

    const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${
        process.env.NIKOOAUTH_CLIENT_ID
    }&redirect_uri=${process.env.NIKOOAUTH_YOUR_DOMAIN}&scope=${
        req.query.scope || 'repo,user'
    }&state=${state}`;
    console.log(redirectUrl);
    res.cookie('state', state, {
        ...cookieOptions,
        maxAge: 1000 * 60 * 30,
    });
    res.redirect(redirectUrl);
});

app.get('/', async (req: Request, res: Response) => {
    if (req.query.state !== req.signedCookies.state) {
        res.status(500).send('Login failed');
        return;
    }

    let token;
    const accessTokenReqUrl = `https://github.com/login/oauth/access_token?client_id=${process.env.NIKOOAUTH_CLIENT_ID}&client_secret=${process.env.NIKOOAUTH_CLIENT_SECRET}&code=${req.query.code}&state=${req.signedCookies.state}`;
    try {
        let accessTokenRes = await axios.post<string>(accessTokenReqUrl);

        let data = qs.parse(accessTokenRes.data);
        if (data.error) {
            res.status(500).send(
                process.env.NIKOOAUTH_NODE_ENV !== 'production'
                    ? 'Login failed'
                    : data.error
            );
            return;
        }
        token = data.access_token as string;
    } catch (err: any) {
        console.log('err: ', err);
        return;
    }

    const script = `
    <script>
        (function() {
            function receiveMessage(e) {
                if (e.source !== window.opener) {
                    return;
                }
                // send message to main window
                e.source.postMessage(
                    'authorization:github:success:{"token":"${token}","provider":"github"}',
                    e.origin
                );
            }
            window.addEventListener('message', receiveMessage, false);
            // Start handshare with parent
            console.log(window.opener);
            console.log('Sending message: %o', 'github');
            window.opener.postMessage('authorizing:github', '*');
        })()
    </script>`;
    res.clearCookie('state', cookieOptions);
    res.send(script);
});

console.log(`server running on ${process.env.NIKOOAUTH_PORT}`);

app.listen(
    parseInt(process.env.NIKOOAUTH_PORT as string),
    process.env.NIKOOAUTH_HOST as string
);
