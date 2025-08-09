import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column('text', { array: true, nullable: true })
  technologies: string[];

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  position: number;

  @Column('text', { array: true, nullable: true })
  files: string[];

  @Column({ default: new Date() })
  createdAt: Date;

  @Column({ default: new Date() })
  updatedAt: Date;
}