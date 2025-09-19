import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bien } from '../../biens/bien.entity';
import { BienImage } from '../image.entity';

@Injectable()
export class BienImageService {
constructor(
  @InjectRepository(Bien)
  private bienRepository: Repository<Bien>,
  @InjectRepository(BienImage)
  private bienImageRepository: Repository<BienImage>,
) {}



// Ajouter une image à un bien
async addImageToBien(bienId: number, filePath: string): Promise<BienImage> {
  const bien = await this.bienRepository.findOne({ where: { id: bienId } });
  if (!bien) throw new NotFoundException('Bien non trouvé');
  const image = this.bienImageRepository.create({ url: filePath, bien });
  return this.bienImageRepository.save(image);
}


// Récupérer toutes les images d'un bien
async getImagesOfBien(bienId: number): Promise<BienImage[]> {
  return this.bienImageRepository.find({ where: { bien: { id: bienId } } });
}


// Supprimer une image
async deleteImage(imageId: number): Promise<{ success: boolean; message: string }> {
  const image = await this.bienImageRepository.findOne({ where: { id: imageId } });
  if (!image) return { success: false, message: 'Image non trouvée.' };
  await this.bienImageRepository.remove(image);
  return { success: true, message: 'Image supprimée avec succès.' };
}
}
