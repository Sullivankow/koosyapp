import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsObject, IsBoolean } from 'class-validator';

/**
 * DTO pour la mise à jour partielle des settings utilisateur.
 * Le endpoint attend { settings: { ... } } et merge côté serveur.
 */
export class SettingsDto {
  @ApiPropertyOptional({ description: 'Objet settings partiel, ex: { eventsEnabled: true }' })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

/**
 * DTO documentant la clé eventsEnabled (facultatif)
 */
export class EventsSettingsDto {
  @ApiPropertyOptional({ description: "Flag pour activer/désactiver l'affichage/notifications d'événements" })
  @IsOptional()
  @IsBoolean()
  eventsEnabled?: boolean;
}
