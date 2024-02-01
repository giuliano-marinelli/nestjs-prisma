import { PrismaSchema } from '../builder/prisma-schema.factory';
import { $Model as RefractModel } from '@nestjs!/refract';
import { Field as RefractTypeField, Relation as RefractTypeRelation } from '@nestjs!/refract/dist/types/fields';

export type RelationOptions = {
  name?: string;
  comment?: string;
};

export function Relation<T extends RefractTypeRelation>(
  model: any,
  relationFunc: ReturnRelationFunc<T>,
  options?: RelationOptions
): PropertyDecorator {
  return (target, propertyKey) => {
    // if options name is not provided, use the property key
    let _name = options?.name ? options.name : propertyKey.toString();

    PrismaSchema.addRelation<T>(target.constructor.name, propertyKey.toString(), {
      name: _name,
      model: model,
      relation: relationFunc,
      comment: options?.comment
    });
  };
}

export type ReturnRelationFunc<T extends RefractTypeRelation> = (type: RefractModel) => RefractTypeField<T>;
