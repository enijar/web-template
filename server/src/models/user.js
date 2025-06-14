var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { DataTypes, Model } from "@sequelize/core";
import { Attribute, AutoIncrement, Index, NotNull, PrimaryKey, Table } from "@sequelize/core/decorators-legacy";
let User = class User extends Model {
};
__decorate([
    Attribute(DataTypes.INTEGER),
    PrimaryKey,
    AutoIncrement
], User.prototype, "id", void 0);
__decorate([
    Attribute(DataTypes.STRING),
    Index({ name: "email", unique: true }),
    NotNull
], User.prototype, "email", void 0);
__decorate([
    Attribute(DataTypes.STRING),
    NotNull
], User.prototype, "password", void 0);
User = __decorate([
    Table({ tableName: "users" })
], User);
export default User;
