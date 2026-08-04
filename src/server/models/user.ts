import { type CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "@sequelize/core";
import {
  Attribute,
  AutoIncrement,
  Default,
  Index,
  NotNull,
  PrimaryKey,
  Table,
} from "@sequelize/core/decorators-legacy";

@Table({ tableName: "users" })
export default class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  @Attribute(DataTypes.INTEGER.UNSIGNED)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>;

  @Attribute(DataTypes.STRING)
  @Index({ name: "email", unique: true })
  @NotNull
  declare email: string;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare password: string;

  // Incremented to revoke all of a user's existing sessions (e.g. on password reset)
  @Attribute(DataTypes.INTEGER.UNSIGNED)
  @NotNull
  @Default(0)
  declare tokenVersion: CreationOptional<number>;

  @Attribute(DataTypes.STRING)
  declare passwordResetToken: CreationOptional<string | null>;

  @Attribute(DataTypes.DATE)
  declare passwordResetExpiresAt: CreationOptional<Date | null>;
}
