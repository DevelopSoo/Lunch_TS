import { ConnectionOptions } from "typeorm";
import { User, Food } from "./src/entities/lunchEntity";
import { DB_PASSWORD } from "./secret";


export const connectionOptions: ConnectionOptions = {
	type: "mysql",
	host: "localhost",
	port: 3306,
	username: "root",
	password: DB_PASSWORD,
	database: "lunchDB",
	entities: [
		User, Food
	],
	// synchronize: true,
	migrations: ['src/lunchEntity.ts'],
	cli: {
		"migrationsDir": "migration"
	}
}
