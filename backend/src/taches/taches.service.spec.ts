// Import des outils de test de NestJS
import { Test, TestingModule } from '@nestjs/testing';
// Import du service à tester
import { TachesService } from './taches.service';
// Permet de mocker les repositories TypeORM
import { getRepositoryToken } from '@nestjs/typeorm';
// Entité Tache (table)
import { Tache } from './tache.entity';
// Entité Bien (table)
import { Bien } from '../biens/bien.entity';
// Exception NestJS pour les cas d'erreur
import { NotFoundException } from '@nestjs/common';


// Début du bloc de tests pour TachesService
describe('TachesService', () => {
  let service: TachesService; // Instance du service à tester
  let tacheRepo: any; // Mock du repository Tache
  let bienRepo: any; // Mock du repository Bien


  // Avant chaque test, on prépare un module de test isolé
  beforeEach(async () => {
    // On crée des mocks pour les méthodes utilisées
    tacheRepo = { create: jest.fn(), save: jest.fn() };
    bienRepo = { findOne: jest.fn() };


    // Création du module de test avec injection des mocks
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TachesService, // Service à tester
        { provide: getRepositoryToken(Tache), useValue: tacheRepo }, // Mock repo Tache
        { provide: getRepositoryToken(Bien), useValue: bienRepo },   // Mock repo Bien
      ],
    }).compile();


    // Récupération de l'instance du service à tester
    service = module.get<TachesService>(TachesService);
  });


  // Test : création d'une tâche quand le bien existe
  it('doit créer une tâche si le bien existe', async () => {
    const dto = { bienId: 1, titre: 'Test', description: 'desc' }; // Données d'entrée
    const bien = { id: 1 }; // Bien simulé
    bienRepo.findOne.mockResolvedValue(bien); // On simule que le bien existe
    tacheRepo.create.mockReturnValue({ ...dto, bien }); // On simule la création de la tâche
    tacheRepo.save.mockResolvedValue({ id: 42, ...dto, bien }); // On simule la sauvegarde


    // Appel de la méthode à tester
    const result = await service.createTache(dto as any, 123);
    // On vérifie que le résultat contient bien un id
    expect(result).toHaveProperty('id', 42);
    // On vérifie que la méthode create a été appelée avec les bons paramètres
    expect(tacheRepo.create).toHaveBeenCalledWith({ ...dto, bien });
    // On vérifie que la méthode save a été appelée
    expect(tacheRepo.save).toHaveBeenCalled();
  });


  // Test : erreur si le bien n'existe pas
  it('doit lever une erreur si le bien est introuvable', async () => {
    bienRepo.findOne.mockResolvedValue(null); // Simule bien non trouvé
    // On vérifie que la méthode lève une NotFoundException
    await expect(service.createTache({ bienId: 1 } as any, 123)).rejects.toThrow(NotFoundException);
  });
});
