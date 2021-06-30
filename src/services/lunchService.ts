import { createQueryBuilder, getConnection, getRepository, Transaction, TransactionRepository } from 'typeorm';
import { User, Food } from '../entities/lunchEntity';
import dateSub from 'date-fns/sub';
import formatISO9075 from 'date-fns/formatISO9075';
import { resourceLimits } from 'worker_threads';
import { getCipherInfo } from 'crypto';


export const todayLunchList = async (startDate: string, endDate: string) => {
	// const users = getRepository(Food).createQueryBuilder("food").innerJoinAndSelect('food.user', 'user').getMany();
	// [{"id":1,"name":"순대국","createdAt":"2021-06-29T12:54:54.092Z","updatedAt":"2021-06-29T12:54:54.092Z","user":{"id":1,"name":"예병수"}}]
	const rows = await getRepository(Food)
		.createQueryBuilder('food')
		.innerJoinAndSelect('food.user', 'user')
		.where('updatedAt BETWEEN :startDate AND :endDate')
		.setParameters({startDate: startDate, endDate: endDate})
		.getMany();
	// [{"id":1,"name":"순대국","createdAt":"2021-06-29T12:54:54.092Z","updatedAt":"2021-06-29T12:54:54.092Z","user":{"id":1,"name":"예병수"}}]
	
	const results = [];
	// createdAt은 Date 타입이라 저장하지 못해서 새로운 키값을 만듦
	for (let i=0; i<rows.length; i++) {
		rows[i]["updatedAtString"] = formatISO9075(rows[i].updatedAt);
		results.push(
			{
				name: rows[i].user.name,
				food: rows[i].name,
				// 원래 컬럼이 아니라서 .으로 접근할 수 없음
				updateTime: rows[i]["updatedAtString"]
			}
		);
	};
	return results;
};


// params로 넘어오기 때문에 id는 string이다. number로 나중에 바꿔도 문제가 되는지 확인하자.
export const todayLunchView = async (id: string) => {
	const row = await getRepository(Food)
		.createQueryBuilder('food')
		.innerJoinAndSelect('food.user', 'user')
		.where('food.id = :id')
		.setParameters({id: id})
		.getMany();
	
	const result = {};
	for (let i=0; i<row.length; i++) {
		row[i]["updatedAtString"] = formatISO9075(row[i].updatedAt);
		result["name"] = row[i].user.name;
		result["food"] = row[i].name;
		result["updateTime"] = row[i]["updatedAtString"];
	};	

	return result;
};


export const todayLunchInput = async (reqName: string, reqFood: string) => {
	let user = new User();
	user.name = reqName;

	let userRepository = getRepository(User);
	const savedUser = await userRepository.save(user);

	let food = new Food();
	food.id = savedUser.id;
	food.name = reqFood;

	const foodRepository = getRepository(Food);
	const savedFood = await foodRepository.save(food);

	return {name: savedUser.name, food: savedFood.name}
};

export const todayLunchUpdate = async (id: string, reqName: string, reqFood: string) => {
	let foodRepository = getRepository(Food);
	let foodForUpdate = await foodRepository.findOne(id);
	foodForUpdate.name = reqFood;
	const updatedFood = await foodRepository.save(foodForUpdate);
	
	let updatedUser = getRepository(User).findOne(id);
	let user = (await updatedUser).name;

	return {name: user, food:updatedFood.name};
	
};

export const todayLunchDelete = async (id: string) => {
	let foodRepository = getRepository(Food);
	let foodForDelete = await foodRepository.findOne(id);
	await foodRepository.remove(foodForDelete);

	let userRepository = getRepository(User);
	let userForDelete = await userRepository.findOne(id);
	await userRepository.remove(userForDelete);

	return {name: userForDelete.name, food: foodForDelete.name}
}
