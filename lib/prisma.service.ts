import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaService {
  //   private options: PrismaServiceOptions;

  //   constructor(options: Partial<PrismaServiceOptions>) {
  //     this.options = Object.assign({}, defaultPrismaServiceOptions, options);
  //   }

  generate(): string {
    return 'Hello World!';
  }
}
