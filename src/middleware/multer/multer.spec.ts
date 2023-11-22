import { Multer } from './multer';

describe('Multer', () => {
  it('should be defined', () => {
    expect(new Multer()).toBeDefined();
  });
});
