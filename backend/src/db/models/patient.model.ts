import {Table, Column, Model,  DataType, ForeignKey,BelongsTo, DefaultScope, AllowNull, PrimaryKey} 
from 'sequelize-typescript';

import  UserModel  from './user.model';
export interface IPatient {
  userId: number;
  birth: Date;
}

export interface IPatientCreate {
  userId: number;
  birth: Date;
}
@DefaultScope(() => ({
  attributes: { exclude: ['birth'] }
}))
@Table({
  tableName: 'patient',
  paranoid: true,
  timestamps: true
})
export default class PatientModel extends Model<IPatient, IPatientCreate> {

  @PrimaryKey
  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    unique: true
  })
  declare userId: number;

  @AllowNull(false)
  @Column({
    type: DataType.DATE
  })
  declare birth: Date;

  @BelongsTo(() => UserModel)
  declare user: UserModel;
}