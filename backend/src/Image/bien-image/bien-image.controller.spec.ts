import { Test, TestingModule } from '@nestjs/testing';
import { BienImageController } from './bien-image.controller';

describe('BienImageController', () => {
  let controller: BienImageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BienImageController],
    }).compile();

    controller = module.get<BienImageController>(BienImageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
