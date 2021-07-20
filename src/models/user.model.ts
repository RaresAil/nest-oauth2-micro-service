import {
  PrimaryKey,
  CreatedAt,
  UpdatedAt,
  Column,
  Model,
  Table,
} from 'sequelize-typescript';

@Table
export class User extends Model {
  @PrimaryKey
  @Column
  public uid: string;

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
