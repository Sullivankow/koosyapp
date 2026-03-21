import * as FileSystem from 'expo-file-system';
import * as FileSystemLegacy from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

/**
 * Exporte un PDF sur le téléphone de l'utilisateur et propose le partage.
 * @param pdfUrl URL du PDF à télécharger
 * @param fileName Nom du fichier PDF à enregistrer (ex: devis_123.pdf)
 * @param jwtToken (optionnel) Token JWT pour l'authentification
 * @throws Affiche une alerte en cas d'erreur
 */
export async function exportPdfToPhone(pdfUrl: string, fileName: string, jwtToken?: string) {
    try {
        // Récupère les classes nécessaires de la nouvelle API expo-file-system
        const { Directory, File, Paths } = FileSystem;
        // Crée une instance du dossier Documents
        const directory = new Directory(Paths.document);
        // Vérifie si le dossier existe, sinon le crée
        const info = await FileSystemLegacy.getInfoAsync(directory.uri);
        const exists = info.exists;
        if (!exists) {
            await directory.create();
        }
        // Prépare le fichier PDF à enregistrer
        const file = new File(directory, fileName);
        // Prépare les headers pour l'authentification si besoin
        const headers: Record<string, string> = {};
        if (jwtToken) headers['Authorization'] = `Bearer ${jwtToken}`;
        // Télécharge le PDF dans le fichier
        await File.downloadFileAsync(pdfUrl, file, { headers });
        // Propose le partage du PDF à l'utilisateur
        await Sharing.shareAsync(file.uri);
    } catch (err: any) {
        alert('Erreur lors de l’export : ' + (err.message || err));
    }
}
