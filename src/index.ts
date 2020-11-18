require('dotenv').config();
import crypto from 'crypto';
import express, { Request, Response } from 'express';
import axios from 'axios';
import qs from 'querystring';

const app = express();
const state = crypto.randomBytes(32).toString('hex');

app.get('/auth', (req: Request, res: Response) => {
    const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${
        process.env.NIKOOAUTH_CLIENT_ID
    }&redirect_uri=${process.env.NIKOOAUTH_YOUR_DOMAIN}&scope=${
        req.query.scope || 'repo,user'
    }&state=${state}`;
    console.log('redirectUrl: ', redirectUrl);
    res.redirect(redirectUrl);
});

app.get('/', async (req: Request, res: Response) => {
    if (req.query.state !== state) {
        res.status(500).send('Login failed');
        process.exit();
    }

    let token;
    const accessTokenReqUrl = `https://github.com/login/oauth/access_token?client_id=${process.env.NIKOOAUTH_CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&code=${req.query.code}&state=${state}`;
    console.log(accessTokenReqUrl);
    try {
        let accessTokenRes = await axios.post<string>(accessTokenReqUrl);

        let data = qs.parse(accessTokenRes.data);
        if (data.error) {
            res.status(500).send(
                process.env.NIKOOAUTH_NODE_ENV !== 'production'
                    ? data.error
                    : 'Login failed'
            );
            process.exit();
        }
        token = data.access_token as string;
    } catch (err: any) {
        console.log('err: ', err);
        return;
    }
    console.log(token);

    const script = `
    <script>
        (function() {
            console.log(window.opener)
        })()
    </script>`;

    res.send(script);
});

console.log(`server running on ${process.env.NIKOOAUTH_PORT}`);

app.listen(
    parseInt(process.env.NIKOOAUTH_PORT as string),
    process.env.NIKOOAUTH_HOST as string
);
