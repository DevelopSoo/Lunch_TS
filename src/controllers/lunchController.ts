import {Request, Response} from 'express'
import dateSub from 'date-fns/sub';
import formatISO9075 from 'date-fns/formatISO9075';
import * as lunchService from '../services/lunchService';


export const todayLunchList = async (req: Request, res: Response) => {
	try {
		let startDate: string | Date
		let endDate: string | Date

		// 확인 시작 날짜, 시간에서 끝 날짜, 시간 확인 (query parameter)
		if (req.query.startDate && req.query.endDate) {
			startDate = req.query.startDate as string;
			endDate = req.query.endDate as string;
		} else {
		// query parameter로 날짜 값이 들어오지 않았을 경우, 오늘 12시부터 어제 12시 검색
			endDate = new Date();
			// 현재 시간(endDate)에서 24시간 빼기
			startDate = dateSub(endDate, {hours:24});
			// 데이터 포매팅 'yyyy-mm-dd hh:mm:ss'
			endDate = formatISO9075(endDate);
			startDate = formatISO9075(startDate);
		};

		const results = await lunchService.todayLunchList(startDate, endDate)
		return res.status(200).json({"result": results, "status": "READ SUCCES"})
	} catch (e){
		return res.json({"error_message": e.message});
	};
};

export const todayLunchView = async (req: Request, res: Response) => {
	try {
		const result = await lunchService.todayLunchView(req.params.id);
		return res.status(200).json({"result": result, "status": "READ SUCCESS"});
	} catch (e){
		return res.json({"error_message": e.message});
	};
};

export const todayLunchInput = async (req: Request, res: Response) => {
	try {	
		const savedUserAndFood = await lunchService.todayLunchInput(req.body.name, req.body.food);
		return res.status(200).json({"message": `name: ${savedUserAndFood["name"]} food: ${savedUserAndFood["food"]} is Created!`});
	} catch (e) {
		return res.json({"error_message": e.message});
	};
};

export const todayLunchUpdate = async (req: Request, res: Response) => {
	try {
		const updatedUserAndFood = await lunchService.todayLunchUpdate(req.params.id, req.body.name, req.body.food);
		return res.status(200).json({"message": `name: ${updatedUserAndFood["name"]} food: ${updatedUserAndFood["food"]} is updated!`}) 
	} catch (e){
		return res.json({"error_message": e.message});
	};
};

export const todayLunchDelete = async (req: Request, res: Response) => {
	try {
		const deletedUserAndFood = await lunchService.todayLunchDelete(req.params.id);
		return res.status(200).json({"message": `name: ${deletedUserAndFood["name"]} food: ${deletedUserAndFood["food"]} is deleted!`}) 
	} catch (e){
		return res.json({"error_message": e.message});
	}
};