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
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});


    // === EN-TÊTE DU DOCUMENT ===
    // Logo (optionnel)
    // if (devis.entreprise?.logo) doc.image(devis.entreprise.logo, 250, 30, { width: 100 });

    // Titre principal
    const mainColor = '#009688'; // bleu-vert principal Koosy
    doc
      .font('Helvetica-Bold')
      .fontSize(28)
      .fillColor(mainColor)
      .text('DEVIS', { align: 'center', underline: true });
    doc.moveDown(1);

    // Bloc informations en deux colonnes
    const infoY = doc.y;
    doc.fontSize(11).fillColor('black');
    // Colonne entreprise
    doc.text(devis.entreprise?.nom || '', 60, infoY);
    if (devis.entreprise?.adresse) doc.text(devis.entreprise.adresse, 60);
    if (devis.entreprise?.codePostal || devis.entreprise?.ville)
      doc.text(
        `${devis.entreprise.codePostal || ''} ${devis.entreprise.ville || ''}`.trim(),
        60
      );
    if (devis.entreprise?.pays) doc.text(devis.entreprise.pays, 60);
    if (devis.entreprise?.email) doc.text(devis.entreprise.email, 60);

    // Colonne devis
    doc.text(`Numéro : ${devis.numero}`, 350, infoY);
    doc.text(`Date : ${devis.dateCreation.toLocaleDateString()}`, 350);
    if (devis.dateValidite)
      doc.text(`Valide jusqu'au : ${devis.dateValidite.toLocaleDateString()}`, 350);
    doc.text(`Statut : ${devis.statut}`, 350);
    doc.moveDown(2);

    // Ligne de séparation
    doc.moveTo(60, doc.y).lineTo(535, doc.y).stroke(mainColor);
    doc.moveDown(1);



    // === TABLEAU DES LIGNES DE DEVIS ===
    // Fond léger pour le tableau
    const tableY = doc.y;
    doc.rect(60, tableY, 475, 25 + 25 * devis.lignes.length).fill('#F4F7FA'); // fond du front
    doc.font('Helvetica-Bold').fontSize(13).fillColor(mainColor);
    doc.text('Désignation', 65, tableY + 5, { continued: true });
    doc.text('Qté', 230, tableY + 5, { continued: true });
    doc.text('PU HT', 280, tableY + 5, { continued: true });
    doc.text('TVA %', 350, tableY + 5, { continued: true });
    doc.text('Total HT', 420, tableY + 5, { continued: true });
    doc.text('Total TTC', 495, tableY + 5);
    doc.moveDown(0.5);
    doc.moveTo(65, tableY + 25).lineTo(535, tableY + 25).stroke('#BFC9CA');

    // Lignes du tableau
    doc.font('Helvetica').fontSize(11).fillColor('black');
    let rowY = tableY + 30;
    devis.lignes.forEach((ligne: LigneDevis) => {
      doc.text(ligne.description, 65, rowY, { width: 150, continued: true });
      doc.text(ligne.quantite.toString(), 230, rowY, { width: 40, continued: true, align: 'right' });
      doc.text(Number(ligne.prixUnitaireHT).toFixed(2) + ' €', 280, rowY, { width: 60, continued: true, align: 'right' });
      doc.text(ligne.tva.toString(), 350, rowY, { width: 50, continued: true, align: 'right' });
      doc.text(Number(ligne.totalLigneHT).toFixed(2) + ' €', 420, rowY, { width: 60, continued: true, align: 'right' });
      doc.text(Number(ligne.totalLigneTTC).toFixed(2) + ' €', 495, rowY, { width: 60, align: 'right' });
      rowY += 25;
    });
    doc.moveDown(1);

    // Bordure du tableau
    doc.rect(60, tableY, 475, rowY - tableY).stroke(mainColor);
    doc.moveDown(1);


    // === TOTAUX ===
    // Bloc totaux avec fond
    const totalY = doc.y;
    doc.rect(350, totalY, 185, 60).fill(mainColor);
    doc.font('Helvetica').fontSize(12).fillColor('white');
    doc.text(`Montant HT : ${Number(devis.montantHT).toFixed(2)} €`, 355, totalY + 5);
    doc.text(`Montant TVA : ${Number(devis.montantTVA).toFixed(2)} €`, 355, totalY + 25);
    doc.font('Helvetica-Bold').text(`Montant TTC : ${Number(devis.montantTTC).toFixed(2)} €`, 355, totalY + 45);
    doc.font('Helvetica').moveDown(2);


    // === CONDITIONS ET NOTES ===
    if (devis.conditions) {
      doc.fontSize(11).fillColor(mainColor).text('Conditions de paiement :', 60, doc.y);
      doc.fontSize(10).fillColor('black').text(devis.conditions, 60, doc.y, { width: 475 });
      doc.moveDown();
    }
    if (devis.notes) {
      doc.fontSize(11).fillColor(mainColor).text('Notes :', 60, doc.y);
      doc.fontSize(10).fillColor('black').text(devis.notes, 60, doc.y, { width: 475 });
      doc.moveDown();
    }

    // Pied de page (optionnel)
    doc.fontSize(9).fillColor(mainColor).text('Document généré automatiquement par KOOSY - Merci pour votre confiance.', 60, 780, { align: 'center', width: 475 });

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
