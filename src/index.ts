import express, { Request, Response } from 'express';

const app = express();
const PORT = 3000;

app.get('/', (req: Request, res: Response) => {
    console.log(req.headers);
    res.send(req.headers);
});

app.listen(PORT);
