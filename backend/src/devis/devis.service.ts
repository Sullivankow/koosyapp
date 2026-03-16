import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Devis } from './devis.entity';
import { CreateDevisDto } from './create-devis.dto';

import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { Inject } from '@nestjs/common';
import { LigneDevis } from '../ligne-devis/ligne-devis.entity';

@Injectable()
export class DevisService {
  constructor(
    @InjectRepository(Devis)
    private devisRepository: Repository<Devis>,
  ) {}


 


  // Lors de la récupération, on veut aussi les données de l'entreprise associée
  findAll() {
    return this.devisRepository.find({ relations: ['entreprise'] });
  }


  // Lors de la récupération d'un devis par id, on veut aussi les données de l'entreprise associée
  findOne(id: number) {
    return this.devisRepository.findOne({ where: { id }, relations: ['entreprise'] });
  }


  // Lors de la mise à jour, on reçoit l'id de l'entreprise, mais on doit associer l'objet Entreprise à la relation
  update(id: number, updateDevisDto: Partial<CreateDevisDto>) {
    const { entreprise, ...rest } = updateDevisDto;
    const updatePayload: any = { ...rest };
    if (entreprise) {
      updatePayload.entreprise = { id: entreprise };
    }
    return this.devisRepository.update(id, updatePayload);
  }


  // Lors de la suppression, on peut simplement supprimer le devis par son id
  remove(id: number) {
    return this.devisRepository.delete(id);
  }



   // Lors de la création, on reçoit l'id de l'entreprise, mais on doit associer l'objet Entreprise à la relation
  create(createDevisDto: CreateDevisDto) {
    // On transforme l'id de l'entreprise en objet Entreprise
    const { entreprise, ...rest } = createDevisDto;
    const devis = this.devisRepository.create({
      ...rest,
      entreprise: { id: entreprise },
    });
    return this.devisRepository.save(devis);
  }

  /**
   * Génère un PDF pour un devis donné (avec entreprise et lignes)
   * Retourne un Buffer contenant le PDF
   */
  async generatePdf(id: number): Promise<Buffer> {
    // Récupérer le devis avec entreprise et lignes
    const devis = await this.devisRepository.findOne({
      where: { id },
      relations: ['entreprise', 'lignes'],
    });
    if (!devis) {
      throw new Error('Devis non trouvé');
    }

    // Création du PDF en mémoire
    const doc = new PDFDocument({ margin: 40 });
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    // En-tête
    doc.fontSize(20).text('DEVIS', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Numéro : ${devis.numero}`);
    doc.text(`Date : ${devis.dateCreation.toLocaleDateString()}`);
    if (devis.dateValidite) doc.text(`Valide jusqu'au : ${devis.dateValidite.toLocaleDateString()}`);
    doc.text(`Statut : ${devis.statut}`);
    doc.moveDown();

    // Entreprise
    doc.fontSize(14).text('Entreprise', { underline: true });
    doc.fontSize(12).text(devis.entreprise?.nom || '');
    doc.text(devis.entreprise?.adresse || '');
    doc.moveDown();

    // Lignes du devis
    doc.fontSize(14).text('Détail', { underline: true });
    doc.moveDown(0.5);
    devis.lignes.forEach((ligne: LigneDevis, idx: number) => {
      doc.fontSize(12).text(
        `${idx + 1}. ${ligne.description} - Qté: ${ligne.quantite} x ${ligne.prixUnitaireHT}€ HT (TVA: ${ligne.tva}%) = ${ligne.totalLigneHT}€ HT / ${ligne.totalLigneTTC}€ TTC`
      );
    });
    doc.moveDown();

    // Totaux
    doc.fontSize(12).text(`Montant HT : ${devis.montantHT} €`);
    doc.text(`Montant TVA : ${devis.montantTVA} €`);
    doc.text(`Montant TTC : ${devis.montantTTC} €`);
    doc.moveDown();

    // Conditions et notes
    if (devis.conditions) {
      doc.fontSize(12).text('Conditions :', { underline: true });
      doc.text(devis.conditions);
      doc.moveDown();
    }
    if (devis.notes) {
      doc.fontSize(12).text('Notes :', { underline: true });
      doc.text(devis.notes);
      doc.moveDown();
    }

    doc.end();
    // Attendre la fin de la génération du PDF et retourner le buffer
    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);
    });
  }
}
