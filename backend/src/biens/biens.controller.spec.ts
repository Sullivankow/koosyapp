import { Test, TestingModule } from '@nestjs/testing';
import { BiensController } from './biens.controller';

describe('BiensController', () => {
  let controller: BiensController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BiensController],
    }).compile();

    controller = module.get<BiensController>(BiensController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
