

import React, { useEffect, useState } from 'react';
import Sidebar from '../components/sidebar';
import ButtonCreate from '../ui/buttonCreate';
import FiltersSection from '../components/filters/filtersSection';
import SelectField from '../ui/selectField';
import { fetchProprietairesList } from '../utils/propretaireApi';
import type { BackendProprietaire } from '../models/models';
import useSidebar from '../hooks/useSidebar';

const Proprietaires: React.FC = () => {
  const { sidebarOpen, openSidebar, closeSidebar } = useSidebar(false);
  const [search, setSearch] = useState('');
  const [proprietaires, setProprietaires] = useState<BackendProprietaire[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Filtres individuels
  const [nomFilter, setNomFilter] = useState<string>('Tous');
  const [prenomFilter, setPrenomFilter] = useState<string>('Tous');
  const [emailFilter, setEmailFilter] = useState<string>('Tous');
  const [adresseFilter, setAdresseFilter] = useState<string>('Tous');
  const [telephoneFilter, setTelephoneFilter] = useState<string>('Tous');

  useEffect(() => {
    const loadProprietaires = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiProprietaires = await fetchProprietairesList();
        setProprietaires(apiProprietaires ?? []);
      } catch (e) {
        setError("Impossible de charger la liste des propriétaires.");
      } finally {
        setLoading(false);
      }
    };
    loadProprietaires();
  }, []);

  // Valeurs distinctes pour chaque filtre
  const noms = Array.from(new Set(proprietaires.map((p) => p.nom))).sort();
  const prenoms = Array.from(new Set(proprietaires.map((p) => p.prenom))).sort();
  const emails = Array.from(new Set(proprietaires.map((p) => p.email))).sort();
  const adresses = Array.from(new Set(proprietaires.map((p) => p.adresse))).sort();
  const telephones = Array.from(new Set(proprietaires.map((p) => p.telephone))).sort();

  const filteredProprietaires = proprietaires.filter((p) => {
    const matchesSearch =
      p.nom.toLowerCase().includes(search.toLowerCase()) ||
      p.prenom.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.adresse.toLowerCase().includes(search.toLowerCase()) ||
      p.telephone.toLowerCase().includes(search.toLowerCase());
    const matchesNom = nomFilter === 'Tous' ? true : p.nom === nomFilter;
    const matchesPrenom = prenomFilter === 'Tous' ? true : p.prenom === prenomFilter;
    const matchesEmail = emailFilter === 'Tous' ? true : p.email === emailFilter;
    const matchesAdresse = adresseFilter === 'Tous' ? true : p.adresse === adresseFilter;
    const matchesTelephone = telephoneFilter === 'Tous' ? true : p.telephone === telephoneFilter;
    return matchesSearch && matchesNom && matchesPrenom && matchesEmail && matchesAdresse && matchesTelephone;
  });

  return (
    <div className="min-h-screen bg-[#F4F7FA]">
      <Sidebar isOpen={sidebarOpen} />
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={closeSidebar} />
      )}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#E0E6ED] bg-[#F4F7FA] md:hidden">
        <button
          type="button"
          onClick={openSidebar}
          className="inline-flex items-center justify-center rounded-md border border-[#CBD5E1] bg-white p-2 text-[#0F172A] shadow-sm"
        >
          <span className="sr-only">Ouvrir le menu</span>
          <div className="flex flex-col space-y-1">
            <span className="block h-0.5 w-4 bg-[#0F172A]" />
            <span className="block h-0.5 w-4 bg-[#0F172A]" />
            <span className="block h-0.5 w-4 bg-[#0F172A]" />
          </div>
        </button>
        <h1 className="text-sm font-semibold text-[#222B45]">Propriétaires</h1>
        <div className="w-8" />
      </header>
      <main className="px-4 py-4 md:ml-60 md:px-6 md:py-6 flex min-h-screen">
        <div className="w-full max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#222B45]">Propriétaires</h1>
              <p className="text-sm text-[#6E7B8B]">Liste des propriétaires enregistrés dans la base de données.</p>
            </div>
            <ButtonCreate label="Nouveau propriétaire" onClick={() => {}} />
          </div>
          <FiltersSection
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Rechercher par nom, email, adresse…"
            summary={`${filteredProprietaires.length} propriétaire${filteredProprietaires.length > 1 ? 's' : ''} affiché${filteredProprietaires.length > 1 ? 's' : ''}`}
            onReset={() => {
              setSearch('');
              setNomFilter('Tous');
              setPrenomFilter('Tous');
              setEmailFilter('Tous');
              setAdresseFilter('Tous');
              setTelephoneFilter('Tous');
            }}
          >
            <SelectField label="Nom" value={nomFilter} onChange={e => setNomFilter(e.target.value)}>
              <option value="Tous">Tous</option>
              {noms.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </SelectField>
            <SelectField label="Prénom" value={prenomFilter} onChange={e => setPrenomFilter(e.target.value)}>
              <option value="Tous">Tous</option>
              {prenoms.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </SelectField>
            <SelectField label="Email" value={emailFilter} onChange={e => setEmailFilter(e.target.value)}>
              <option value="Tous">Tous</option>
              {emails.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </SelectField>
            <SelectField label="Adresse" value={adresseFilter} onChange={e => setAdresseFilter(e.target.value)}>
              <option value="Tous">Tous</option>
              {adresses.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </SelectField>
            <SelectField label="Téléphone" value={telephoneFilter} onChange={e => setTelephoneFilter(e.target.value)}>
              <option value="Tous">Tous</option>
              {telephones.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </SelectField>
          </FiltersSection>
          <section className="rounded-2xl bg-white border border-[#E0E6ED] overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between border-b border-[#E0E6ED] bg-[#F9FBFF]">
              <h2 className="text-sm font-semibold text-[#222B45]">Liste des propriétaires</h2>
              <span className="text-[11px] text-[#9EABB8]">Données chargées depuis l’API</span>
            </div>
            {loading ? (
              <div className="p-8 text-center text-sm text-[#6E7B8B]">Chargement des propriétaires…</div>
            ) : error ? (
              <div className="p-8 text-center text-sm text-[#B91C1C]">{error}</div>
            ) : filteredProprietaires.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#6E7B8B]">Aucun propriétaire ne correspond à vos filtres.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#F4F7FA] text-left text-[11px] uppercase tracking-wide text-[#9EABB8]">
                    <tr>
                      <th className="px-5 py-3 font-medium">Nom</th>
                      <th className="px-5 py-3 font-medium">Prénom</th>
                      <th className="px-5 py-3 font-medium">Email</th>
                      <th className="px-5 py-3 font-medium">Adresse</th>
                      <th className="px-5 py-3 font-medium">Téléphone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0E6ED] bg-white">
                    {filteredProprietaires.map((p) => (
                      <tr key={p.id} className="hover:bg-[#F9FBFF] transition-colors">
                        <td className="px-5 py-3">{p.nom}</td>
                        <td className="px-5 py-3">{p.prenom}</td>
                        <td className="px-5 py-3">{p.email}</td>
                        <td className="px-5 py-3">{p.adresse}</td>
                        <td className="px-5 py-3">{p.telephone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Proprietaires;