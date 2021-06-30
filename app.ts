import express from 'express';
import "reflect-metadata";
import { createConnection} from "typeorm";
import { connectionOptions } from './db';
import * as lunchController from './src/controllers/lunchController';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;

app.listen(port, () => {
  console.log(`port ${port} start!`);
});

app.get('/', (req, res) => {  
	res.send(`Express + Typescript SERVER OK`);
});

app.use(bodyParser.json());

app.get('/menus', lunchController.todayLunchList);
app.get('/menus/:id', lunchController.todayLunchView);
app.post('/menus', lunchController.todayLunchInput);
app.put('/menus/:id', lunchController.todayLunchUpdate);
app.delete('/menus/:id')
// 서버 엶과 동시에 커넥션 생성
createConnection(connectionOptions)
	.then((conn: any) => {
		console.log('Database connection succeeded');
		return true
	}).catch((err: any) => {
		console.log(`${err} Error Happened!`);
		return false
	});