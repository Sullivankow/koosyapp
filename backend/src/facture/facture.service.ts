import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Facture } from './facture.entity';
import { CreateFactureDto } from './create-facture.dto';
import PDFDocument from 'pdfkit';

@Injectable()
export class FactureService {
  constructor(
    @InjectRepository(Facture)
    private factureRepository: Repository<Facture>,
  ) {}

 

  create(createFactureDto: CreateFactureDto) {
    const { entreprise, proprietaire, ...rest } = createFactureDto;
    const facture = this.factureRepository.create({
      ...rest,
      entreprise: { id: entreprise },
      ...(proprietaire ? { proprietaire: { id: proprietaire } } : {}),
    });
    return this.factureRepository.save(facture);
  }

  findAll() {
    return this.factureRepository.find({ relations: ['entreprise', 'lignes'] });
  }

  findOne(id: number) {
    return this.factureRepository.findOne({ where: { id }, relations: ['entreprise', 'lignes'] });
  }

  update(id: number, updateFactureDto: Partial<CreateFactureDto>) {
    const { entreprise, proprietaire, ...rest } = updateFactureDto;
    const updatePayload: any = { ...rest };
    if (entreprise) {
      updatePayload.entreprise = { id: entreprise };
    }
    if (proprietaire) {
      updatePayload.proprietaire = { id: proprietaire };
    }
    return this.factureRepository.update(id, updatePayload);
  }

  remove(id: number) {
    return this.factureRepository.delete(id);
  }



 /**
   * Génère un PDF pour une facture donnée (avec entreprise et lignes)
   * Retourne un Buffer contenant le PDF
   */
  async generatePdf(id: number): Promise<Buffer> {
    // Récupérer la facture avec entreprise et lignes
    const facture = await this.factureRepository.findOne({
      where: { id },
      relations: ['entreprise', 'lignes', 'proprietaire'],
    });
    if (!facture) {
      throw new Error('Facture non trouvée');
    }

    // Création du PDF en mémoire
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    // === EN-TÊTE DU DOCUMENT (style devis) ===
    const mainColor = '#009688';
    // Titre "FACTURE" et numéro sur la même ligne, numéro collé
    doc.font('Helvetica-Bold').fontSize(22).fillColor(mainColor);
    doc.text('FACTURE', 30, doc.y, { continued: true });
    doc.font('Helvetica-Bold').fontSize(16).text(` N°${facture.numero || facture.id}`, undefined, undefined, { continued: false });

    // Date d'émission juste sous le titre
    doc.font('Helvetica').fontSize(10).fillColor('black');
    doc.text(`Date d'émission : ${facture.dateEmission ? new Date(facture.dateEmission).toLocaleDateString() : ''}`, 30, doc.y + 5);

    // Date d'échéance en haut à droite
    if (facture.dateEcheance) {
      doc.font('Helvetica').fontSize(10).fillColor(mainColor);
      doc.text(`Date d'échéance : ${new Date(facture.dateEcheance).toLocaleDateString()}`, 400, 30, { align: 'right' });
    }

    // Ajout d'un espace avant les infos entreprise/proprio
    doc.moveDown(3);

    // Bloc infos entreprise à gauche et proprio à droite
    const infoY = doc.y;
    doc.fontSize(10).fillColor('black');
    let xLeft = 30;
    let xRight = 400;
    // Entreprise à gauche
    let yCursor = infoY;
    doc.font('Helvetica-Bold').text(facture.entreprise?.nom || '', xLeft, yCursor);
    doc.font('Helvetica').fontSize(9);
    if (facture.entreprise?.siret) doc.text(`SIRET : ${facture.entreprise.siret}`, xLeft);
    if (facture.entreprise?.siren) doc.text(`SIREN : ${facture.entreprise.siren}`, xLeft);
    if (facture.entreprise?.codeAPE) doc.text(`Code APE : ${facture.entreprise.codeAPE}`, xLeft);
    if (facture.entreprise?.tva) doc.text(`TVA : ${facture.entreprise.tva}`, xLeft);
    doc.fontSize(10);
    if (facture.entreprise?.adresse) doc.text(facture.entreprise.adresse, xLeft);
    if (facture.entreprise?.codePostal || facture.entreprise?.ville)
      doc.text(
        `${facture.entreprise.codePostal || ''} ${facture.entreprise.ville || ''}`.trim(),
        xLeft,
      );
    if (facture.entreprise?.pays) doc.text(facture.entreprise.pays, xLeft);
    if (facture.entreprise?.email) doc.text(facture.entreprise.email, xLeft);
    if (facture.entreprise?.telephone) doc.text(`Tél : ${facture.entreprise.telephone}`, xLeft);

    // Propriétaire à droite, aligné avec l'entreprise
    yCursor = infoY;
    if (facture.proprietaire) {
      doc.font('Helvetica-Bold').text('Propriétaire :', xRight, yCursor);
      doc.font('Helvetica').text(`${facture.proprietaire.nom} ${facture.proprietaire.prenom}`, xRight);
      if (facture.proprietaire.adresse) doc.text(facture.proprietaire.adresse, xRight);
      // Ajout d'autres champs si besoin (email, téléphone)
    }

    // Ajout d'un espace avant le tableau
    doc.moveDown(3.2);

    // Ligne de séparation
    doc.moveTo(30, doc.y).lineTo(565, doc.y).stroke(mainColor);
    doc.moveDown(0.5);

    // --- TABLEAU DES LIGNES (style devis) ---
    const tableX = 50;
    const tableWidth = 520;
    const tableY = doc.y + 10;
    const rowHeight = 20;
    // Header
    doc.save();
    doc.rect(tableX, tableY, tableWidth, rowHeight).fill('#F4F7FA');
    doc.restore();
    doc.font('Helvetica-Bold').fontSize(11).fillColor(mainColor);
    doc.text('Désignation', tableX + 5, tableY + 6, { width: 170 });
    doc.text('Qté', tableX + 180, tableY + 6, { width: 35, align: 'right' });
    doc.text('PU HT', tableX + 225, tableY + 6, { width: 50, align: 'right' });
    doc.text('TVA %', tableX + 290, tableY + 6, { width: 35, align: 'right' });
    doc.text('Total HT', tableX + 340, tableY + 6, { width: 60, align: 'right' });
    doc.text('Total TTC', tableX + 410, tableY + 6, { width: 75, align: 'right' });
    doc.moveTo(tableX, tableY + rowHeight).lineTo(tableX + tableWidth, tableY + rowHeight).stroke(mainColor);
    // Lignes du tableau
    doc.font('Helvetica').fontSize(10).fillColor('black');
    let y = tableY + rowHeight + 2;
    facture.lignes?.forEach((ligne: any) => {
      doc.text(ligne.description, tableX + 5, y, { width: 170 });
      doc.text(ligne.quantite?.toString() || '', tableX + 180, y, { width: 35, align: 'right' });
      doc.text(ligne.prixUnitaireHT !== undefined && ligne.prixUnitaireHT !== null ? Number(ligne.prixUnitaireHT).toFixed(2) + ' €' : '', tableX + 225, y, { width: 50, align: 'right' });
      doc.text(ligne.tauxTVA !== undefined && ligne.tauxTVA !== null ? ligne.tauxTVA.toString() + '%' : '', tableX + 290, y, { width: 35, align: 'right' });
      doc.text(ligne.totalLigneHT !== undefined && ligne.totalLigneHT !== null ? Number(ligne.totalLigneHT).toFixed(2) + ' €' : '', tableX + 340, y, { width: 60, align: 'right' });
      doc.text(ligne.totalLigneTTC !== undefined && ligne.totalLigneTTC !== null ? Number(ligne.totalLigneTTC).toFixed(2) + ' €' : '', tableX + 410, y, { width: 75, align: 'right' });
      y += rowHeight;
    });
    // Bordure du tableau
    doc.rect(tableX, tableY, tableWidth, y - tableY).stroke(mainColor);
    // --- TOTAUX (style devis) ---
    const totalY = y + 8;
    doc.save();
    doc.rect(tableX + 300, totalY, 220, 48).fill(mainColor);
    doc.restore();
    doc.font('Helvetica').fontSize(11).fillColor('white');
    doc.text(`Montant HT : ${facture.montantHT !== undefined && facture.montantHT !== null ? Number(facture.montantHT).toFixed(2) : '0.00'} €`, tableX + 310, totalY + 6);
    doc.text(`Montant TVA : ${facture.montantTVA !== undefined && facture.montantTVA !== null ? Number(facture.montantTVA).toFixed(2) : '0.00'} €`, tableX + 310, totalY + 22);
    doc.font('Helvetica-Bold').text(`Montant TTC : ${facture.montantTTC !== undefined && facture.montantTTC !== null ? Number(facture.montantTTC).toFixed(2) : '0.00'} €`, tableX + 310, totalY + 36);
    doc.font('Helvetica').fillColor('black');
    // --- LIEU DE PRESTATION, CONDITIONS ET NOTES ---
    let notesY = totalY + 3 * rowHeight + 30;
    if (facture.lieuPrestation) {
      doc
        .font('Helvetica-Oblique')
        .fontSize(10)
        .fillColor('#009688')
        .text(`Lieu de prestation : ${facture.lieuPrestation}`, tableX, notesY, { width: 400 });
      notesY = doc.y + 4;
    }
    if (facture.conditionsPaiement) {
      doc.font('Helvetica-Oblique').fontSize(10).fillColor('#666').text(`Conditions de paiement : ${facture.conditionsPaiement}`, tableX, notesY, { width: 400 });
      notesY = doc.y + 4;
    }
    if (facture.notes) {
      doc.font('Helvetica-Oblique').fontSize(10).fillColor('#666').text(`Notes : ${facture.notes}`, tableX, notesY, { width: 400 });
    }

    // Mention automatique en bas de page (comme devis)
    const pageHeight = 842;
    const margin = 50;
    const footerY = pageHeight - margin - 40;
    if (doc.page && typeof doc.switchToPage === 'function') {
      doc.switchToPage(0);
    }
    doc.font('Helvetica-Oblique').fontSize(9).fillColor('#888');
    doc.text('Facture générée automatiquement par Koosy, merci pour votre confiance.', tableX, footerY, { align: 'center', width: 520 });

    // Finir le PDF et retourner le buffer
    doc.end();
    return await new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);
    });
  }



}
