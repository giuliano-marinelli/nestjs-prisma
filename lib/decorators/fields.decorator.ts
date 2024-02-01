import { PrismaSchema } from '../builder/prisma-schema.factory';
import { Block as RefractTypeBlock } from '@nestjs!/refract/dist/types/blocks';
import { Field as RefractTypeField, Scalar as RefractTypeScalar } from '@nestjs!/refract/dist/types/fields';

export type FieldOptions = {
  name?: string;
  comment?: string;
};

export function Field<T extends RefractTypeScalar | 'Enum' | 'Type' | 'Unsupported'>(): PropertyDecorator;
export function Field<T extends RefractTypeScalar | 'Enum' | 'Type' | 'Unsupported'>(
  type?: RefractTypeField<T>
): PropertyDecorator;
export function Field<T extends RefractTypeScalar | 'Enum' | 'Type' | 'Unsupported'>(
  options?: FieldOptions
): PropertyDecorator;
export function Field<T extends RefractTypeScalar | 'Enum' | 'Type' | 'Unsupported'>(
  type?: RefractTypeField<T>,
  options?: FieldOptions
): PropertyDecorator;
export function Field<T extends RefractTypeScalar | 'Enum' | 'Type' | 'Unsupported'>(
  type?: any,
  typeFunc?: ReturnTypeFunc<T>
): PropertyDecorator;
export function Field<T extends RefractTypeScalar | 'Enum' | 'Type' | 'Unsupported'>(
  type?: any,
  typeFunc?: ReturnTypeFunc<T>,
  options?: FieldOptions
): PropertyDecorator;
export function Field<T extends RefractTypeScalar | 'Enum' | 'Type' | 'Unsupported'>(
  type?: RefractTypeField<T> | FieldOptions | any,
  typeFunc?: ReturnTypeFunc<T> | FieldOptions,
  options?: FieldOptions
): PropertyDecorator {
  let _options = options ? options : typeof typeFunc !== 'function' ? typeFunc : undefined;
  let _typeFunc = typeof typeFunc === 'function' ? typeFunc : undefined;
  let _type = options || typeFunc ? type : type && ('name' in type || 'comment' in type) ? undefined : type;
  // determine if the type is infered from a function
  let isInferedType = _typeFunc != null;

  return (target, propertyKey) => {
    // get the type of the property for use if no type is provided
    let propertyType = Reflect.getMetadata('design:type', target, propertyKey).name;
    propertyType = propertyType == 'Date' ? 'DateTime' : propertyType;
    // if no type is provided, use the type of the property
    if (!_type) _type = { type: propertyType, modifiers: [] };

    // if options name is not provided, use the property key
    let _name = _options?.name ? _options.name : propertyKey.toString();

    PrismaSchema.addField<T>(target.constructor.name, propertyKey.toString(), {
      name: _name,
      type: isInferedType ? _typeFunc : _type,
      typeClass: isInferedType ? _type : undefined,
      comment: _options?.comment
    });
  };
}

export type ReturnTypeFunc<T extends RefractTypeScalar | 'Enum' | 'Type' | 'Unsupported'> = (
  type: RefractTypeBlock & ((...args: any) => RefractTypeField<T>)
) => RefractTypeField<T>;
