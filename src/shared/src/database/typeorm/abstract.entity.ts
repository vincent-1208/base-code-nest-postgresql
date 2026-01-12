import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class AbstractEntity<TEntity> extends BaseEntity {
  constructor(partial?: Partial<TEntity>) {
    super();
    if (partial) Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_date', type: 'timestamp with time zone' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'modified_date', type: 'timestamp with time zone' })
  modifiedDate: Date;

  @DeleteDateColumn({ name: 'deleted_date', type: 'timestamp with time zone' })
  deletedDate: Date;
}
