import { Controller, Post, Get, Delete, UseGuards, UseInterceptors, UploadedFile, Param, Inject } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiConsumes, ApiBody, ApiTags, ApiResponse } from '@nestjs/swagger';
import { BienImageService } from './bien-image.service';

@ApiTags('Images')
@ApiBearerAuth()
@Controller('bien-image')
export class BienImageController {

  constructor(private readonly bienImageService: BienImageService) {}

  /**
   * Upload d'une image pour un bien
   */
  @Post('biens/:bienId/images')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { dest: './uploads' }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image à uploader',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Image uploadée avec succès.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  async uploadImage(@Param('bienId') bienId: string, @UploadedFile() file: any) {
    const image = await this.bienImageService.addImageToBien(Number(bienId), file.path);
    return { bienId, filename: file.filename, path: file.path, image };
  }

  /**
   * Récupérer toutes les images d'un bien
   */
  @ApiResponse({ status: 200, description: 'Liste des images du bien.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @UseGuards(JwtAuthGuard)
  @Get('biens/:bienId/images')
  async getImages(@Param('bienId') bienId: string) {
    const images = await this.bienImageService.getImagesOfBien(Number(bienId));
    return images;
  }

  /**
   * Supprimer une image
   */
  @ApiResponse({ status: 200, description: 'Image supprimée avec succès.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @UseGuards(JwtAuthGuard)
  @Delete('images/:imageId')
  async deleteImage(@Param('imageId') imageId: string) {
    return await this.bienImageService.deleteImage(Number(imageId));
  }

}






