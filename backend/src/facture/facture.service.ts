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

    // --- TABLEAU DES LIGNES ---
    const tableTop = doc.y + 10;
    // Colonnes ajustées pour que "Total HT" soit bien visible et centré
    const col1 = 50, col2 = 220, col3 = 340, col4 = 430, col5 = 570;
    const rowHeight = 22;
    // En-tête tableau
    doc.rect(col1, tableTop, col5 - col1, rowHeight).fillAndStroke(mainColor, '#e0e0e0');
    doc.fillColor('white').font('Helvetica-Bold').fontSize(12);
    doc.text('Désignation', col1 + 5, tableTop + 6, { width: col2 - col1 - 10 });
    doc.text('Quantité', col2 + 5, tableTop + 6, { width: col3 - col2 - 10, align: 'right' });
    doc.text('PU HT', col3 + 5, tableTop + 6, { width: col4 - col3 - 10, align: 'right' });
    doc.text('Total HT', col4 + 5, tableTop + 6, { width: col5 - col4 - 10, align: 'center' });
    doc.fillColor('black').font('Helvetica').fontSize(11);

    // Lignes du tableau
    let y = tableTop + rowHeight;
    facture.lignes?.forEach((ligne: any, idx: number) => {
      doc.rect(col1, y, col5 - col1, rowHeight).stroke('#e0e0e0');
      doc.text(ligne.description, col1 + 5, y + 6, { width: col2 - col1 - 10 });
      doc.text(ligne.quantite?.toString() || '', col2 + 5, y + 6, { width: col3 - col2 - 10, align: 'right' });
      doc.text(ligne.prixUnitaireHT !== undefined && ligne.prixUnitaireHT !== null ? Number(ligne.prixUnitaireHT).toFixed(2) : '', col3 + 5, y + 6, { width: col4 - col3 - 10, align: 'right' });
      doc.text(ligne.totalLigneHT !== undefined && ligne.totalLigneHT !== null ? Number(ligne.totalLigneHT).toFixed(2) : '', col4 + 5, y + 6, { width: col5 - col4 - 10, align: 'center' });
      y += rowHeight;
    });
    doc.moveDown(2);

    // --- TOTAUX ---
    const totalY = y + 10;
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('Total HT :', col3, totalY, { width: col4 - col3 - 10, align: 'right' });
    doc.text(`${facture.montantHT !== undefined && facture.montantHT !== null ? Number(facture.montantHT).toFixed(2) : '0.00'} €`, col4 + 5, totalY, { width: col5 - col4 - 10, align: 'right' });
    doc.text('TVA :', col3, totalY + rowHeight, { width: col4 - col3 - 10, align: 'right' });
    doc.text(`${facture.montantTVA !== undefined && facture.montantTVA !== null ? Number(facture.montantTVA).toFixed(2) : '0.00'} €`, col4 + 5, totalY + rowHeight, { width: col5 - col4 - 10, align: 'right' });
    doc.text('Total TTC :', col3, totalY + 2 * rowHeight, { width: col4 - col3 - 10, align: 'right' });
    doc.text(`${facture.montantTTC !== undefined && facture.montantTTC !== null ? Number(facture.montantTTC).toFixed(2) : '0.00'} €`, col4 + 5, totalY + 2 * rowHeight, { width: col5 - col4 - 10, align: 'right' });

    // --- Notes et conditions ---
    doc.moveDown(4);
    if (facture.conditionsPaiement) {
      doc.font('Helvetica-Oblique').fontSize(10).fillColor('#666').text(`Conditions de paiement : ${facture.conditionsPaiement}`);
    }
    if (facture.notes) {
      doc.font('Helvetica-Oblique').fontSize(10).fillColor('#666').text(`Notes : ${facture.notes}`);
    }

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
