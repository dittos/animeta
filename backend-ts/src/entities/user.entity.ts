import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({
  name: 'auth_user',
})
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  username!: string;

  @Column()
  first_name!: string;

  @Column()
  last_name!: string;

  @Column()
  email!: string;

  @Column()
  password!: string;

  @Column()
  is_staff!: boolean;

  @Column()
  is_active!: boolean;

  @Column()
  is_superuser!: boolean;

  @Column()
  last_login!: Date;

  @Column()
  date_joined!: Date;
}