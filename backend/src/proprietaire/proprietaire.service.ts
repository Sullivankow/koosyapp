import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proprietaire } from './proprietaire.entity';
import { CreateProprietaireDto } from './create-proprietaire.dto';

@Injectable()
export class ProprietaireService {
	constructor(
		@InjectRepository(Proprietaire)
		private readonly proprietaireRepository: Repository<Proprietaire>,
	) {}

	create(dto: CreateProprietaireDto) {
		const proprietaire = this.proprietaireRepository.create(dto);
		return this.proprietaireRepository.save(proprietaire);
	}

	findAll() {
		return this.proprietaireRepository.find();
	}

	findOne(id: number) {
		return this.proprietaireRepository.findOne({ where: { id } });
	}

	update(id: number, dto: Partial<CreateProprietaireDto>) {
		return this.proprietaireRepository.update(id, dto);
	}

	remove(id: number) {
		return this.proprietaireRepository.delete(id);
	}
}
