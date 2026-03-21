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
    const { entreprise, ...rest } = createFactureDto;
    const facture = this.factureRepository.create({
      ...rest,
      entreprise: { id: entreprise },
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
    const { entreprise, ...rest } = updateFactureDto;
    const updatePayload: any = { ...rest };
    if (entreprise) {
      updatePayload.entreprise = { id: entreprise };
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
      relations: ['entreprise', 'lignes'],
    });
    if (!facture) {
      throw new Error('Facture non trouvée');
    }

    // Création du PDF en mémoire
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    // === EN-TÊTE DU DOCUMENT ===
    // Logo (optionnel)
    // if (facture.entreprise?.logo) doc.image(facture.entreprise.logo, 250, 30, { width: 100 });

    // --- DESIGN PRO ---
    const mainColor = '#009688';
    // Titre principal centré
    doc
      .font('Helvetica-Bold')
      .fontSize(28)
      .fillColor(mainColor)
      .text('FACTURE', 0, 40, { align: 'center', underline: false });

    // Bloc infos entreprise et facture, bien aligné
    doc.moveDown(2);
    doc.fontSize(12).fillColor('black');
    const leftX = 50;
    const rightX = 350;
    const yStart = doc.y;
    // Infos entreprise à gauche
    doc.font('Helvetica-Bold').text(facture.entreprise?.nom || '', leftX, yStart);
    doc.font('Helvetica').text(facture.entreprise?.adresse || '', leftX, doc.y);
    doc.text(`SIRET : ${facture.entreprise?.siret || ''}`, leftX, doc.y);
    if (facture.entreprise?.email) doc.text(`Email : ${facture.entreprise.email}`, leftX, doc.y);

    // Infos facture à droite
    let yRight = yStart;
    doc.font('Helvetica-Bold').text(`Facture n° : ${facture.numero || facture.id}`, rightX, yRight);
    yRight = doc.y;
    doc.font('Helvetica').text(`Date d'émission : ${facture.dateEmission ? new Date(facture.dateEmission).toLocaleDateString() : ''}`, rightX, yRight);
    yRight = doc.y;
    if (facture.dateEcheance) {
      doc.text(`Date d'échéance : ${new Date(facture.dateEcheance).toLocaleDateString()}`, rightX, yRight);
      yRight = doc.y;
    }
    doc.moveDown(2);

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
    doc.text('PU HT', tableX + 225, tableY + 6, { width: 60, align: 'right' });
    doc.text('Total HT', tableX + 295, tableY + 6, { width: 70, align: 'right' });
    doc.text('Total TTC', tableX + 375, tableY + 6, { width: 85, align: 'right' });
    doc.moveTo(tableX, tableY + rowHeight).lineTo(tableX + tableWidth, tableY + rowHeight).stroke(mainColor);
    // Lignes du tableau
    doc.font('Helvetica').fontSize(10).fillColor('black');
    let y = tableY + rowHeight + 2;
    facture.lignes?.forEach((ligne: any) => {
      doc.text(ligne.description, tableX + 5, y, { width: 170 });
      doc.text(ligne.quantite?.toString() || '', tableX + 180, y, { width: 35, align: 'right' });
      doc.text(ligne.prixUnitaireHT !== undefined && ligne.prixUnitaireHT !== null ? Number(ligne.prixUnitaireHT).toFixed(2) + ' €' : '', tableX + 225, y, { width: 60, align: 'right' });
      doc.text(ligne.totalLigneHT !== undefined && ligne.totalLigneHT !== null ? Number(ligne.totalLigneHT).toFixed(2) + ' €' : '', tableX + 295, y, { width: 70, align: 'right' });
      doc.text(ligne.totalLigneTTC !== undefined && ligne.totalLigneTTC !== null ? Number(ligne.totalLigneTTC).toFixed(2) + ' €' : '', tableX + 375, y, { width: 85, align: 'right' });
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

    // --- Notes et conditions à gauche sous l'entreprise ---
    let notesY = totalY + 3 * rowHeight + 30;
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
    return await new Promise<Buffer>((resolve) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
    });
  }



}
