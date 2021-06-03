import { Column, Index, Model, Table, Unique } from "sequelize-typescript";

@Table({ tableName: "users" })
export default class User extends Model {
  @Index({ name: "email", unique: true })
  @Column
  email: string;

  @Column
  password: string;

  toJSON(): object {
    const data = super.toJSON();
    // @ts-ignore
    delete data.password;
    return data;
  }
}
