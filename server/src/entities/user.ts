import { Column, Index, Model, Table } from "sequelize-typescript";

@Table({ tableName: "users" })
export default class User extends Model {
  @Index({ name: "email", unique: true })
  @Column
  email: string;

  @Column
  password: string;

  toJSON<T extends any>(): T {
    const data = super.toJSON<User>();
    delete data.password;
    return data as T;
  }
}
