// user와 food 테이블 생성을 위한 모델 생성
import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn} from 'typeorm';

@Entity()
export class User {
	
	@PrimaryGeneratedColumn()
	id: number;

	@Column({
		length: 10
	})
	name: string;

	@OneToMany(() => Food, food => food.user)
	foods: Food[];

};

@Entity()
export class Food {
	
	@PrimaryGeneratedColumn()
	id: number;

	@Column({
		length: 20
	})
	name: string;

	@ManyToOne(() => User)
	user: User;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

};