import {
  PrimaryKey,
  CreatedAt,
  UpdatedAt,
  Column,
  Model,
  Table,
} from 'sequelize-typescript';
import { v5 } from 'uuid';

@Table
export class User extends Model {
  @PrimaryKey
  @Column
  public get uid(): string {
    return this.getDataValue('uid');
  }

  public set uid(value: string) {
    if (this.getDataValue('uid')) {
      return;
    }

    this.setDataValue('uid', v5(value, process.env.UUID_NAMESPACE));
  }

  @Column
  public firstName: string;

  @Column
  public lastName: string;

  @Column
  public email: string;

  @Column
  public avatar: string;

  @CreatedAt
  creationDate: Date;

  @UpdatedAt
  updatedOn: Date;
}
