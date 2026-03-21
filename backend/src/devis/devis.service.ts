import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Devis } from './devis.entity';
import { CreateDevisDto } from './create-devis.dto';

import PDFDocument from 'pdfkit';
import { LigneDevis } from '../ligne-devis/ligne-devis.entity';

@Injectable()
export class DevisService {
  constructor(
    @InjectRepository(Devis)
    private devisRepository: Repository<Devis>,
  ) {}



  // Lors de la récupération, on veut aussi les données de l'entreprise et du propriétaire associées
  findAll() {
    return this.devisRepository.find({ relations: ['entreprise', 'proprietaire'] });
  }

  // Lors de la récupération d'un devis par id, on veut aussi les données de l'entreprise et du propriétaire associées
  findOne(id: number) {
    return this.devisRepository.findOne({ where: { id }, relations: ['entreprise', 'proprietaire'] });
  }



  // Lors de la mise à jour, on reçoit les ids de l'entreprise et du propriétaire, mais on doit associer les objets à la relation
  update(id: number, updateDevisDto: Partial<CreateDevisDto>) {
    const { entreprise, proprietaire, ...rest } = updateDevisDto;
    const updatePayload: any = { ...rest };
    if (entreprise) {
      updatePayload.entreprise = { id: entreprise };
    }
    if (proprietaire) {
      updatePayload.proprietaire = { id: proprietaire };
    }
    return this.devisRepository.update(id, updatePayload);
  }


  // Lors de la suppression, on peut simplement supprimer le devis par son id
  remove(id: number) {
    return this.devisRepository.delete(id);
  }




  // Lors de la création, on reçoit les ids de l'entreprise et du propriétaire, mais on doit associer les objets à la relation
  create(createDevisDto: CreateDevisDto) {
    const { entreprise, proprietaire, ...rest } = createDevisDto;
    const devis = this.devisRepository.create({
      ...rest,
      entreprise: { id: entreprise },
      proprietaire: { id: proprietaire },
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
    const doc = new PDFDocument({ margin: 30, size: 'A4' }); // marges pro
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});


    // === EN-TÊTE DU DOCUMENT ===
    const mainColor = '#009688';
    doc
      .font('Helvetica-Bold')
      .fontSize(22)
      .fillColor(mainColor)
      .text('DEVIS', { align: 'left' });
    doc.moveDown(0.2);
    // Bloc infos entreprise et client
    const infoY = doc.y;
    doc.fontSize(10).fillColor('black');
    // Colonne entreprise à gauche
    let xLeft = 30;
    doc.text(devis.entreprise?.nom || '', xLeft, infoY);
    if (devis.entreprise?.adresse) doc.text(devis.entreprise.adresse, xLeft);
    if (devis.entreprise?.codePostal || devis.entreprise?.ville)
      doc.text(
        `${devis.entreprise.codePostal || ''} ${devis.entreprise.ville || ''}`.trim(),
        xLeft
      );
    if (devis.entreprise?.pays) doc.text(devis.entreprise.pays, xLeft);
    if (devis.entreprise?.email) doc.text(devis.entreprise.email, xLeft);
    // Colonne devis à droite
    let xRight = 350;
    doc.text(`Numéro : ${devis.numero}`, xRight, infoY);
    doc.text(`Date : ${devis.dateCreation.toLocaleDateString()}`, xRight);
    if (devis.dateValidite)
      doc.text(`Valide jusqu'au : ${devis.dateValidite.toLocaleDateString()}`, xRight);
    doc.text(`Statut : ${devis.statut}`, xRight);
    doc.moveDown(0.8);
    // Ligne de séparation
    doc.moveTo(30, doc.y).lineTo(565, doc.y).stroke(mainColor);
    doc.moveDown(0.5);

    // === TABLEAU DES LIGNES DE DEVIS ===
    // En-tête tableau
    const tableY = doc.y;
    doc.save();
    doc.rect(30, tableY, 535, 22).fill('#F4F7FA');
    doc.restore();
    doc.font('Helvetica-Bold').fontSize(11).fillColor(mainColor);
    doc.text('Désignation', 35, tableY + 6, { width: 180 });
    doc.text('Qté', 220, tableY + 6, { width: 35, align: 'right' });
    doc.text('PU HT', 265, tableY + 6, { width: 60, align: 'right' });
    doc.text('TVA %', 335, tableY + 6, { width: 45, align: 'right' });
    doc.text('Total HT', 390, tableY + 6, { width: 70, align: 'right' });
    doc.text('Total TTC', 470, tableY + 6, { width: 85, align: 'right' });
    doc.moveTo(30, tableY + 22).lineTo(565, tableY + 22).stroke(mainColor);
    // Lignes du tableau
    doc.font('Helvetica').fontSize(10).fillColor('black');
    let rowY = tableY + 24;
    const rowHeight = 18;
    devis.lignes.forEach((ligne: LigneDevis) => {
      doc.text(ligne.description, 35, rowY, { width: 180 });
      doc.text(ligne.quantite.toString(), 220, rowY, { width: 35, align: 'right' });
      doc.text(Number(ligne.prixUnitaireHT).toFixed(2) + ' €', 265, rowY, { width: 60, align: 'right' });
      doc.text(ligne.tva.toString(), 335, rowY, { width: 45, align: 'right' });
      doc.text(Number(ligne.totalLigneHT).toFixed(2) + ' €', 390, rowY, { width: 70, align: 'right' });
      doc.text(Number(ligne.totalLigneTTC).toFixed(2) + ' €', 470, rowY, { width: 85, align: 'right' });
      rowY += rowHeight;
    });
    // Bordure du tableau
    doc.rect(30, tableY, 535, rowY - tableY).stroke(mainColor);
    // === TOTAUX ===
    // Bloc totaux aligné à droite sous le tableau
    const totalY = rowY + 8;
    doc.save();
    doc.rect(350, totalY, 215, 48).fill(mainColor);
    doc.restore();
    doc.font('Helvetica').fontSize(11).fillColor('white');
    doc.text(`Montant HT : ${Number(devis.montantHT).toFixed(2)} €`, 360, totalY + 6);
    doc.text(`Montant TVA : ${Number(devis.montantTVA).toFixed(2)} €`, 360, totalY + 22);
    doc.font('Helvetica-Bold').text(`Montant TTC : ${Number(devis.montantTTC).toFixed(2)} €`, 360, totalY + 36);
    doc.font('Helvetica').fillColor('black');
    // === CONDITIONS ET NOTES ===
    let yCond = totalY + 56;
    if (devis.conditions) {
      doc.fontSize(10).fillColor(mainColor).text('Conditions de paiement :', 30, yCond);
      doc.fontSize(9).fillColor('black').text(devis.conditions, 30, doc.y, { width: 535 });
      yCond = doc.y + 6;
    }
    if (devis.notes) {
      doc.fontSize(10).fillColor(mainColor).text('Notes :', 30, yCond);
      doc.fontSize(9).fillColor('black').text(devis.notes, 30, doc.y, { width: 535 });
      yCond = doc.y + 6;
    }
    // Pied de page dynamique (juste après le contenu, mais jamais hors page)
    // Pied de page toujours en bas de la page (A4 = 842pt, marge 30)
    // Pied de page fiable : toujours en bas de la première page, sans manipulations avancées
    const pageHeight = 842;
    const margin = 30;
    // On remonte la phrase de 40 points pour éviter le saut de page
    const footerY = pageHeight - margin - 40;
    if (doc.page && typeof doc.switchToPage === 'function') {
      doc.switchToPage(0);
    }
    doc.fontSize(8).fillColor(mainColor);
    doc.text('Document généré automatiquement par KOOSY - Merci pour votre confiance.', 30, footerY, {
      align: 'center',
      width: 535
    });
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
