import { createQueryBuilder, getConnection, getRepository, Transaction, TransactionRepository } from 'typeorm';
import { User, Food } from '../entities/lunchEntity';
import formatISO9075 from 'date-fns/formatISO9075';

/**
 * 
 * @param startDate : 2021-06-21 11:00:00
 * @param endDate : 2021-06-22 11:00:00
 * @return
 * 	{
   	 "results": [
        {
            "name": "예병수",
            "food": "김치찜",
            "updateTime": "2021-07-01 10:30:18"
        },
        {
            "name": "안동원",
            "food": "내장탕",
            "updateTime": "2021-07-01 10:30:26"
        }
    ],
    "status": "READ SUCCES"
}
 */
export const todayLunchList = async (startDate: string, endDate: string) => {

	const rows = await getRepository(Food)
		.createQueryBuilder('food') // sql 쿼리를 alias 해서 가져올꺼야~ 아무 이름도 없으면 Food로 사용됨
		.innerJoinAndSelect('food.user', 'user') // food의 userId와 user의 id를 통해 join
		.where('updatedAt BETWEEN :startDate AND :endDate', {startDate, endDate})
		.getMany();
	// [{"id":1,"name":"순대국","createdAt":"2021-06-29T12:54:54.092Z","updatedAt":"2021-06-29T12:54:54.092Z","user":{"id":1,"name":"예병수"}}]
	
	const results = [];
	// createdAt은 Date 타입이라 string값을 저장하지 못함 -> 새로운 키값(updatedAtString)을 만듦
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
/**
 * 
 * @param id : 쿼리 id
 * @returns 
 * {
    "result": {
        "name": "예병수",
        "food": "김치찜",
        "updateTime": "2021-07-01 10:30:18"
    },
    "status": "READ SUCCESS"
}
 */
export const todayLunchView = async (id: string) => {
	const row = await getRepository(Food)
		.createQueryBuilder('food')
		.innerJoinAndSelect('food.user', 'user')
		.where('food.id = :id')
		.setParameters({id: id})
		.getMany();
	
	const result = {};
	if (row.length === 0) {
		throw new Error('User is Not existed');
	}
	
	for (let i=0; i<row.length; i++) {
		row[i]["updatedAtString"] = formatISO9075(row[i].updatedAt);
		result["name"] = row[i].user.name;
		result["food"] = row[i].name;
		result["updateTime"] = row[i]["updatedAtString"];
	};	

	return result;
};


/**
 * 
 * @param reqName 
 * @param reqFood 
 * @returns 
 * {
 * 		name: "에병수"
 * 		food: "김치찜"
 * }
 */
export const todayLunchInput = async (reqName: string, reqFood: string) => {
	const user = await getRepository(User).findOne({where: {name: reqName}});
	
	if (user === undefined) {
		throw new Error("User Not Existed")
	};

	const food = new Food();
	food.user = user;
	food.name = reqFood;

	const foodRepository = getRepository(Food);
	const savedFood = await foodRepository.save(food);

	return {name: user.name, food: savedFood.name};
};

/**
 * 
 * @param id 
 * @param reqName 
 * @param reqFood 
 * @param startDate 
 * @param endDate 
 * @returns 
 * 		{name: 예병수, food: 짜장면}
 */	
// food의 userId와 시간(오늘 오전 9 ~ 점심)을 파악해서 이름과 food를 가져온다. 
export const todayLunchUpdate = async (id: string, reqName: string, reqFood: string, startDate: string, endDate: string) => {
	const user = await getRepository(User).findOne(id);

	if (user === undefined) {
		throw new Error("User Not Existed")
	};
	// 존재하는 user인지 체크해야 함
	const row = await getRepository(Food)
		.createQueryBuilder()
		.update()
		.set({name: reqFood})
		.where("userId = :id", {id: user.id})
		.andWhere("updatedAt BETWEEN :startDate AND :endDate", {startDate: startDate, endDate: endDate})
		.execute();

	return {name: user.name, food:reqFood};
};

/**
 * 
 * @param id 
 * @param reqName 
 * @param reqFood 
 * @param startDate 
 * @param endDate 
 * @returns 
 * 		{name: 예병수, food: 짜장면}
 */	
export const todayLunchDelete = async (id: string, startDate: string, endDate: string) => {
	const user = await getRepository(User).findOne(id);
	
	if (user === undefined) {
		throw new Error("User Not Existed")
	};
	
	const food = await getRepository(Food)
		.createQueryBuilder('food')
		.innerJoinAndSelect('food.user', 'user')
		.where('food.userId = :id')
		.setParameters({id: user.id})
		.getOne();

	const row = await getRepository(Food)
		.createQueryBuilder()
		.delete()
		.where("userId = :id", {id: user.id})
		.andWhere("updatedAt BETWEEN :startDate AND :endDate", {startDate: startDate, endDate: endDate})
		.execute()

	return {name: user.name, food: food.name}
};
