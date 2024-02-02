import { ReturnTypeFunc } from '../decorators/fields.decorator';
import { ReturnRelationFunc } from '../decorators/relation.decorator';
import { $Model as RefractModel, $Type as RefractType } from '@nestjs!/refract';
import { Block as RefractTypeBlock, isModel, isType } from '@nestjs!/refract/dist/types/blocks';
import {
  Field as RefractTypeField,
  Scalar as RefractTypeScalar,
  Relation as RefractTypeRelation
} from '@nestjs!/refract/dist/types/fields';

export class PrismaSchemaFactory {
  blocks: { [blockName: string]: RefractTypeBlock } = {};

  fields: {
    [blockName: string]: { [fieldName: string]: { name: string; type: any; typeClass: any; comment?: string } };
  } = {};

  relations: {
    [blockName: string]: {
      [relationName: string]: { name: string; model: any; relation: ReturnRelationFunc<any>; comment?: string };
    };
  } = {};

  addBlock(blockName: string, block: RefractTypeBlock) {
    this.blocks[blockName] = block;
  }

  addField<T extends RefractTypeScalar | 'Enum' | 'Type' | 'Unsupported'>(
    blockName: string,
    fieldName: string,
    field: { name: string; type: RefractTypeField<T> | ReturnTypeFunc<T>; typeClass: any; comment?: string }
  ) {
    if (!this.fields[blockName]) this.fields[blockName] = {};
    this.fields[blockName][fieldName] = field;
  }

  addRelation<T extends RefractTypeRelation>(
    blockName: string,
    fieldName: string,
    relation: { name: string; model: any; relation: ReturnRelationFunc<T>; comment?: string }
  ) {
    if (!this.relations[blockName]) this.relations[blockName] = {};
    this.relations[blockName][fieldName] = relation;
  }

  build() {
    // insert fields into blocks
    Object.entries(this.fields).forEach(([blockName, fields]) => {
      Object.entries(fields).forEach(([fieldName, field]) => {
        // if the type class is a enum, we use the serialized enum object as the internal identifier
        // else we use the class name getted from the class constructor
        const typeIndentifier =
          typeof field.typeClass == 'object' && field.typeClass?.name == null && typeof field.typeClass != 'string'
            ? JSON.stringify(field.typeClass)
            : typeof field.typeClass == 'string'
            ? field.typeClass
            : field.typeClass?.name;

        const inferedType = typeof field.type === 'function' ? field.type(this.blocks[typeIndentifier]) : field.type;

        if (isModel(this.blocks[blockName]))
          (this.blocks[blockName] as RefractModel).Field(field.name, inferedType, field.comment);
        else if (isType(this.blocks[blockName]))
          (this.blocks[blockName] as RefractType).Field(field.name, inferedType, field.comment);
      });
    });

    // insert relations into blocks
    Object.entries(this.relations).forEach(([blockName, relations]) => {
      Object.entries(relations).forEach(([relationName, relation]) => {
        const typeIndentifier = typeof relation.model == 'string' ? relation.model : relation.model.name;

        const inferedRelation = relation.relation(this.blocks[typeIndentifier] as RefractModel);

        (this.blocks[blockName] as RefractModel).Relation(relation.name, inferedRelation, relation.comment);
      });
    });

    // export blocks as a array of Blocks
    const _blocks = Object.entries(this.blocks).map(([blockName, block]) => {
      return block;
    });

    return _blocks;
  }
}

export const PrismaSchema = new PrismaSchemaFactory();
