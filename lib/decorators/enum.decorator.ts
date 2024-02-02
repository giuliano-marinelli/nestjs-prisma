import { PrismaSchema } from '../schema-builder/prisma-schema.factory';
import { Enum as RefractEnum, Key as RefractKey, Map as RefractMap } from '@nestjs!/refract';
import { EnumKey as RefractTypeEnumKey } from '@nestjs!/refract/dist/types/fields';

export function registerEnum<E extends object = any>(enumRef: E, options: EnumOptions<E>) {
  // the enum object is serialized for create they unique internal name
  // so it can be found in the schema when the same enum object is passed
  let _identifier = JSON.stringify(enumRef);
  let _name: string = options.name;
  let _description: string = options.description ? options.description : null;
  let _keys: RefractTypeEnumKey[] = [];
  for (let [key, value] of Object.entries(enumRef).filter(([k, v]) => isNaN(Number(k)))) {
    // if we have value for the enum key, we add a Map modifier with the value
    if (value != null && isNaN(value))
      _keys.push(
        RefractKey(
          key,
          RefractMap(value),
          ...(options.valuesMap?.[key]?.description ? [options.valuesMap?.[key]?.description] : [])
        )
      );
    // if not value is provided, we just add the key
    else
      _keys.push(
        RefractKey(key, ...(options.valuesMap?.[key]?.description ? [options.valuesMap?.[key]?.description] : []))
      );
  }
  if (_description) PrismaSchema.addBlock(_identifier, RefractEnum(_name, _description, ..._keys));
  else PrismaSchema.addBlock(_identifier, RefractEnum(_name, ..._keys));
}

export type EnumKeyOptions = {
  description?: string;
};

export type EnumKeyMap<T extends object> = Partial<Record<keyof T, EnumKeyOptions>>;

export interface EnumOptions<E extends object = any> {
  name: string;
  description?: string;
  valuesMap?: EnumKeyMap<E>;
}
