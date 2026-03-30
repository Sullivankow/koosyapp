
// Page des notifications du backoffice
// Affiche une liste de notifications mockées + préférences de notification
import React, { useState } from 'react';
import Sidebar from '../components/sidebar';
import useSidebar from '../hooks/useSidebar';

// Type représentant une notification dans cette page
type NotificationItem = {
  id: number;
  title: string;
  description: string;
  type: 'Réservation' | 'Paiement' | 'Tâche' | 'Système';
  severity: 'Info' | 'Alerte' | 'Urgent';
  dateLabel: string; // ex: "Il y a 5 min", "Hier, 17:42"
  group: 'Aujourd’hui' | 'Cette semaine';
  read: boolean;
};

// Données mockées pour les notifications
const mockNotifications: NotificationItem[] = [
  {
    id: 1,
    title: 'Nouvelle réservation confirmée',
    description: "Appartement A23 réservé du 12 au 15 mai par Julie M.",
    type: 'Réservation',
    severity: 'Info',
    dateLabel: 'Il y a 5 min',
    group: 'Aujourd’hui',
    read: false,
  },
  {
    id: 2,
    title: 'Paiement en échec',
    description: "Le paiement de Paul D. pour le séjour du 3 au 7 avril a échoué.",
    type: 'Paiement',
    severity: 'Urgent',
    dateLabel: 'Il y a 32 min',
    group: 'Aujourd’hui',
    read: false,
  },
  {
    id: 3,
    title: 'Tâche ménage en retard',
    description: "Le ménage pour le bien Loft #4 n’a pas encore été marqué comme terminé.",
    type: 'Tâche',
    severity: 'Alerte',
    dateLabel: 'Aujourd’hui, 08:12',
    group: 'Aujourd’hui',
    read: true,
  },
  {
    id: 4,
    title: 'Nouvel utilisateur backoffice',
    description: "Un nouvel utilisateur a été ajouté avec le rôle Manager.",
    type: 'Système',
    severity: 'Info',
    dateLabel: 'Lundi, 14:03',
    group: 'Cette semaine',
    read: true,
  },
];

const NotificationsPage: React.FC = () => {
  // État pour la sidebar mobile (ouvert / fermé)
  const { sidebarOpen, openSidebar, closeSidebar } = useSidebar(false);
  // Liste locale pour pouvoir marquer les notifs comme lues (mock)
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);

  // Compte le nombre de notifications non lues
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Marque une notification comme lue (mock côté front uniquement)
  const markAsRead = (id: number) => {
    setNotifications((current) =>
      current.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  // Marque toutes les notifications comme lues
  const markAllAsRead = () => {
    setNotifications((current) => current.map((n) => ({ ...n, read: true })));
  };

  // Retourne un style de badge selon le type de notification
  const typeBadgeClasses = (type: NotificationItem['type']) => {
    switch (type) {
      case 'Réservation':
        return 'bg-[#E3F2FD] text-[#1565C0] border-[#BBDEFB]';
      case 'Paiement':
        return 'bg-[#FEF2F2] text-[#B91C1C] border-[#FCA5A5]';
      case 'Tâche':
        return 'bg-[#FFF7ED] text-[#C05621] border-[#FED7AA]';
      case 'Système':
      default:
        return 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]';
    }
  };

  // Retourne un style de badge selon la sévérité
  const severityBadgeClasses = (severity: NotificationItem['severity']) => {
    switch (severity) {
      case 'Urgent':
        return 'bg-[#FEF2F2] text-[#B91C1C]';
      case 'Alerte':
        return 'bg-[#FFFBEB] text-[#92400E]';
      case 'Info':
      default:
        return 'bg-[#EEF2FF] text-[#3730A3]';
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA]">
      {/* Sidebar responsive : visible sur desktop, coulissante sur mobile */}
      <Sidebar isOpen={sidebarOpen} />

      {/* Overlay mobile pour fermer la sidebar en cliquant à l'extérieur */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Topbar mobile avec bouton burger et titre */}
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
        <h1 className="text-sm font-semibold text-[#222B45]">Notifications</h1>
        {/* Espace pour équilibrer le header */}
        <div className="w-8" />
      </header>

      {/* Contenu principal de la page notifications */}
      <main className="px-4 py-4 md:ml-60 md:px-6 md:py-6 min-h-screen flex flex-col gap-4 md:gap-6 lg:flex-row">
        {/* Colonne principale : liste des notifications */}
        <section className="w-full lg:w-2/3 space-y-4">
          {/* En-tête de section */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#222B45]">Centre de notifications</h2>
              <p className="text-xs text-[#6E7B8B]">
                Suivez les évènements importants : réservations, paiements, tâches et mises à jour système.
              </p>
            </div>
            <button
              type="button"
              onClick={markAllAsRead}
              className="inline-flex items-center justify-center rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-medium text-[#0F172A] shadow-sm hover:bg-[#F1F5F9]"
            >
              Tout marquer comme lu
            </button>
          </div>

          {/* Carte liste de notifications */}
          <div className="rounded-2xl bg-white border border-[#E0E6ED] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#E0E6ED] bg-[#F9FBFF]">
              <div className="flex items-center gap-2 text-sm text-[#6E7B8B]">
                <span className="font-medium text-[#222B45]">Notifications</span>
                {unreadCount > 0 && (
					<span className="inline-flex items-center justify-center rounded-full bg-[#00A896] px-2 py-0.5 text-[11px] font-semibold text-white">
                    {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-[#9EABB8]">Mock à brancher sur l’API notifications</span>
            </div>

            {/* Groupes Aujourd'hui / Cette semaine */}
            <div className="divide-y divide-[#E0E6ED]">
              {(['Aujourd’hui', 'Cette semaine'] as const).map((group) => {
                const items = notifications.filter((n) => n.group === group);
                if (items.length === 0) return null;
                return (
                  <div key={group} className="px-5 py-3">
                    <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#9EABB8]">
                      {group}
                    </h3>
                    <ul className="space-y-2">
                      {items.map((notif) => (
                        <li
                          key={notif.id}
                          className={`rounded-xl border px-3 py-2.5 text-sm flex items-start gap-3 transition-colors ${
                            notif.read
                  ? 'border-[#E0E6ED] bg-white'
                  : 'border-[#00A896]/30 bg-[#E0F7F4]'
                          }`}
                        >
                          {/* Pastille de statut (non lu / lu) */}
                          <span
                  className={`mt-1 h-2 w-2 rounded-full ${
                    notif.read ? 'bg-[#CBD5E1]' : 'bg-[#00A896]'
                  }`}
                />

                          <div className="flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium text-[#1F2933]">{notif.title}</p>
                              <span
                                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${typeBadgeClasses(
                                  notif.type,
                                )}`}
                              >
                                {notif.type}
                              </span>
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${severityBadgeClasses(
                                  notif.severity,
                                )}`}
                              >
                                {notif.severity}
                              </span>
                            </div>
                            <p className="text-xs text-[#6E7B8B]">{notif.description}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[11px] text-[#9EABB8]">{notif.dateLabel}</span>
                              <div className="flex items-center gap-2 text-[11px]">
                                {!notif.read && (
                    <button
                      type="button"
                      onClick={() => markAsRead(notif.id)}
                      className="rounded-full border border-transparent px-2 py-0.5 text-[#00A896] hover:bg-[#D1FAF5]"
                    >
                                    Marquer comme lu
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="rounded-full border border-transparent px-2 py-0.5 text-[#9EABB8] hover:bg-[#F4F7FA]"
                                >
                                  Voir le détail
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}

              {/* État vide si aucune notification */}
              {notifications.length === 0 && (
                <div className="px-5 py-8 text-center text-sm text-[#6E7B8B]">
                  <p className="font-medium mb-1">Aucune notification pour le moment.</p>
                  <p className="text-[12px] text-[#9EABB8]">
                    Les évènements importants (réservations, paiements, tâches…) apparaîtront ici.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Colonne secondaire : préférences de notification */}
        <aside className="w-full lg:w-1/3 space-y-4">
          <div className="rounded-2xl bg-white border border-[#E0E6ED] p-5">
            <h2 className="text-sm font-semibold text-[#222B45] mb-2">Préférences de notification</h2>
            <p className="text-xs text-[#6E7B8B] mb-4">
              Ces réglages sont mockés pour l’instant. Ils serviront à contrôler comment Koosy envoie les
              alertes aux administrateurs.
            </p>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E0E6ED] bg-[#F9FBFF] px-3 py-2.5">
                <div>
                  <p className="text-xs font-medium text-[#222B45]">Nouvelles réservations</p>
                  <p className="text-[11px] text-[#9EABB8]">Recevoir une alerte dès qu’une réservation est confirmée.</p>
                </div>
                <button
                  type="button"
                  className="relative inline-flex h-5 w-9 items-center rounded-full bg-[#22C55E]"
                >
                  <span className="inline-block h-4 w-4 translate-x-4 transform rounded-full bg-white shadow" />
                </button>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E0E6ED] bg-[#F9FBFF] px-3 py-2.5">
                <div>
                  <p className="text-xs font-medium text-[#222B45]">Paiements en échec</p>
                  <p className="text-[11px] text-[#9EABB8]">Être notifié immédiatement en cas d’erreur de paiement.</p>
                </div>
                <button
                  type="button"
                  className="relative inline-flex h-5 w-9 items-center rounded-full bg-[#22C55E]"
                >
                  <span className="inline-block h-4 w-4 translate-x-4 transform rounded-full bg-white shadow" />
                </button>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E0E6ED] bg-white px-3 py-2.5">
                <div>
                  <p className="text-xs font-medium text-[#222B45]">Résumé quotidien</p>
                  <p className="text-[11px] text-[#9EABB8]">Recevoir un email de synthèse des évènements du jour.</p>
                </div>
                <button
                  type="button"
                  className="relative inline-flex h-5 w-9 items-center rounded-full bg-[#CBD5E1]"
                >
                  <span className="inline-block h-4 w-4 translate-x-1 transform rounded-full bg-white shadow" />
                </button>
              </div>
            </div>

            <button
            type="button"
            className="mt-4 w-full rounded-lg bg-[#00A896] px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-[#00897B]"
          >
              Enregistrer (mock)
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default NotificationsPage;