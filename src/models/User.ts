import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Task } from './Task';


@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email!: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  // Relación uno a muchos con Task
  @OneToMany(() => Task, (task) => task.user, { cascade: true })
  tasks!: Task[];
}
