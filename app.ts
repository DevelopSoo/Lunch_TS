import express from 'express';
import "reflect-metadata";
import { createConnection} from "typeorm";
import { connectionOptions } from './db';
import * as lunchController from './src/controllers/lunchController';
import * as bodyParser from 'body-parser';
import schedule from "node-schedule";

const app = express();
const port = 3000;

// 먹고 싶은 점심 작성하라는 알람 (매일 11시)
schedule.scheduleJob("* 11 * * *", () => {
	lunchController.slackSendAlarmForLunch();
});

// 오늘의 점심 리스트 슬랙 알림 (매일 12시)
schedule.scheduleJob('49 * * * *', () => {
  lunchController.slackSendLunchTodayList();
});

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
app.delete('/menus/:id', lunchController.todayLunchDelete);

// 서버 엶과 동시에 커넥션 생성
createConnection(connectionOptions)
	.then((conn: any) => {
		console.log('Database connection succeeded');
	}).catch((err: Error) => {
		console.log(`${err} Error Happened!`);
	});