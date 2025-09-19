import { Test, TestingModule } from '@nestjs/testing';
import { BienImageService } from './bien-image.service';

describe('BienImageService', () => {
  let service: BienImageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BienImageService],
    }).compile();

    service = module.get<BienImageService>(BienImageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
