require('dotenv').config();
import crypto from 'crypto';
import express, { Request, Response } from 'express';
import axios from 'axios';
import qs from 'querystring';

const app = express();
const state = crypto.randomBytes(32).toString('hex');

app.get('/', (req: Request, res: Response) => {
    res.send(req.headers);
});

app.get('/auth', (req: Request, res: Response) => {
    res.redirect(
        `https://github.com/login/oauth/authorize?client_id=${
            process.env.NIKOOAUTH_CLIENT_ID
        }&redirect_uri=${process.env.NIKOOAUTH_YOUR_DOMAIN}/callback&scope=${
            req.query.scope || 'repo,user'
        }&state=${state}`
    );
});

app.get('/callback', async (req: Request, res: Response) => {
    if (req.query.state !== state) {
        res.status(500).send('Login failed');
        process.exit();
    }

    let token;
    try {
        let accessTokenRes = await axios.post<string>(
            `https://github.com/login/oauth/access_token?client_id=${process.env.NIKOOAUTH_CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&code=${req.query.code}&state=${state}`
        );

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

app.listen(parseInt(process.env.NIKOOAUTH_PORT as string));
