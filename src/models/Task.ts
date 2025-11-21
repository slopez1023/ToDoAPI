import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';


@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: false, name: 'is_completed' })
  is_completed!: boolean;

  @Column({ type: 'integer', name: 'user_id', nullable: false })
  user_id!: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  // Relación muchos a uno con User
  @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
