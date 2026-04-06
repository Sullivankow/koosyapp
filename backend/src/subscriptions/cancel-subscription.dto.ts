import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class CancelSubscriptionDto {
	@ApiPropertyOptional({
		description: 'Annulation immédiate ou en fin de période',
		example: false,
	})
	@IsOptional()
	@IsBoolean()
	immediate?: boolean;
}
