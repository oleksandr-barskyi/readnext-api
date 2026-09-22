import { Injectable } from '@nestjs/common';

export interface ApiInfo {
  readonly name: string;
  readonly docs: string;
}

@Injectable()
export class AppService {
  getInfo(): ApiInfo {
    return { name: 'readnext-api', docs: '/docs' };
  }
}
