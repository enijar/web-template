import { Column, Index, Model, Table, Unique } from "sequelize-typescript";

@Table
export default class User extends Model {
  @Unique
  @Index
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
