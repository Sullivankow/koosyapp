import React, { useEffect, useState } from 'react';
import Sidebar from '../components/sidebar';
import { fetchPrestationsList } from '../utils/prestationsApi';
// import { fetchUsersList } from '../utils/usersApi';
import FiltersSection from '../components/filters/filtersSection';
import SelectField from '../ui/selectField';
import ButtonCreate from '../ui/buttonCreate';
import type { BackendPrestation, BackendBien } from '../models/models';

const formatAmount = (amount_cents: number, currency: string) => `${(amount_cents / 100).toFixed(2)} ${currency}`;
const formatDateFR = (dateString: string) => new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
const getStatusClasses = (status: string) => {
  switch (status) {
    case 'En attente': return 'bg-[#EFF6FF] text-[#1D4ED8]';
    case 'Confirmée': return 'bg-[#E0F2FE] text-[#1D4ED8]';
    case 'Terminée': return 'bg-[#ECFDF3] text-[#166534]';
    case 'Annulée': return 'bg-[#FEF2F2] text-[#B91C1C]';
    default: return 'bg-[#E5E7EB] text-[#374151]';
  }
};


const PrestationsPage: React.FC = () => {
  const [prestations, setPrestations] = useState<BackendPrestation[]>([]);
  // const [users, setUsers] = useState<BackendUser[]>([]);
  const [bienFilter, setBienFilter] = useState<'Tous' | number>('Tous');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Tous' | string>('Tous');

  useEffect(() => {
    const loadPrestations = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPrestationsList(1, 100);
        setPrestations(data.items);
      } catch (e) {
        setError('Impossible de récupérer les prestations.');
      } finally {
        setLoading(false);
      }
    };
    loadPrestations();
  }, []);


  // Liste des biens distincts présents dans les prestations récupérées
  const biens: BackendBien[] = Array.from(
    new Map(
      prestations
        .map((p) => p.bien)
        .filter((b): b is BackendBien => !!b)
        .map((b) => [b.id, b]),
    ).values()
  );

  const filteredPrestations = prestations.filter((p) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      query.length === 0 ||
      (p.bien?.nom?.toLowerCase().includes(query) ?? false) ||
      (p.bien?.adresse?.toLowerCase().includes(query) ?? false) ||
      (p.description?.toLowerCase().includes(query) ?? false);
    const matchesStatus = statusFilter === 'Tous' ? true : p.status === statusFilter;
    const matchesBien = bienFilter === 'Tous' ? true : p.bien?.id === bienFilter;
    return matchesSearch && matchesStatus && matchesBien;
  });

  return (
    <div className="min-h-screen bg-[#F4F7FA]">
      <Sidebar isOpen={false} />
      <main className="px-4 py-4 md:ml-60 md:px-6 md:py-6 min-h-screen flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#222B45]">Prestations</h2>
            <p className="text-sm text-[#6E7B8B]">Suivez les prestations liées aux biens et utilisateurs.</p>
          </div>
          <ButtonCreate label="Nouvelle prestation" onClick={() => {}} />
        </div>
        {error && (
          <div className="mb-4 p-3 rounded bg-red-100 text-red-700 border border-red-200">
            {error}
          </div>
        )}
        <FiltersSection
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Rechercher par bien, adresse ou description…"
          summary={
            loading
              ? 'Chargement des prestations…'
              : `${filteredPrestations.length} prestation${filteredPrestations.length > 1 ? 's' : ''} affichée${filteredPrestations.length > 1 ? 's' : ''}`
          }
          onReset={() => {
            setSearch('');
            setStatusFilter('Tous');
          }}
        >
          <SelectField
            label="Statut"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="Tous">Tous les statuts</option>
            <option value="En attente">En attente</option>
            <option value="Confirmée">Confirmée</option>
            <option value="Terminée">Terminée</option>
            <option value="Annulée">Annulée</option>
          </SelectField>
          <SelectField
            label="Bien concerné"
            value={bienFilter}
            onChange={(e) => setBienFilter(e.target.value === 'Tous' ? 'Tous' : Number(e.target.value))}
          >
            <option value="Tous">Tous les biens</option>
            {biens.map((bien) => (
              <option key={bien.id} value={bien.id}>
                {bien.nom} ({bien.adresse})
              </option>
            ))}
          </SelectField>
        </FiltersSection>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredPrestations.map((p) => (
            <article key={p.id} className="flex flex-col rounded-2xl border border-[#E0E6ED] bg-white shadow-sm overflow-hidden">
              <div className="p-4 border-b border-[#E0E6ED] bg-gradient-to-r from-[#E0F7F4] via-[#F9FBFF] to-[#E0F2FE] flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-[#1F2933] line-clamp-2">
                    {p.bien?.nom || 'Bien inconnu'}
                  </h3>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusClasses(p.status)}`}>
                    {p.status}
                  </span>
                </div>
                <p className="text-[11px] text-[#6E7B8B]">{p.bien?.adresse}</p>
                {p.description && (
                  <p className="text-[11px] text-[#6E7B8B] line-clamp-2">{p.description}</p>
                )}
              </div>
              <div className="flex-1 p-4 space-y-3 text-xs text-[#6E7B8B]">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] text-[#9EABB8]">Montant</p>
                    <p className="text-sm font-semibold text-[#1F2933]">{formatAmount(p.amount_cents, p.currency)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#9EABB8]">Date prestation</p>
                    <p className="text-sm font-semibold text-[#1F2933]">{formatDateFR(p.date_prestation)}</p>
                  </div>
                </div>
                {p.user && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-8 w-8 rounded-full bg-[#0F172A]/5 flex items-center justify-center text-[10px] font-semibold text-[#0F172A]">
                      {`${p.user.prenom} ${p.user.nom}`.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-medium text-[#1F2933]">{p.user.prenom} {p.user.nom}</p>
                      <p className="text-[11px] text-[#6E7B8B]">{p.user.email}</p>
                    </div>
                  </div>
                )}
              </div>
              <footer className="flex flex-col gap-2 border-t border-[#E0E6ED] bg-[#F9FBFF] px-4 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[10px] text-[#9EABB8]">ID: {p.id} · Créée le {formatDateFR(p.created_at)}</p>
                <p className="text-[10px] text-[#9EABB8]">Dernière modif: {formatDateFR(p.updated_at)}</p>
              </footer>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
};

export default PrestationsPage;

