# Settings utilisateur (colonne `settings`)

Ce document décrit la nouvelle colonne `settings` de la table `user` et l'API associée.

## Qu'est-ce que c'est ?
- `settings` est une colonne JSON (JSONB recommandé en production) attachée à chaque utilisateur.
- Elle contient des préférences extensibles, par exemple :

```json
{
  "eventsEnabled": true,
  "notifFreq": "quotidien",
  "timezone": "Europe/Paris"
}
```

## Remarques importantes
- Aucune migration n'est fournie ici : tu peux ajouter la colonne manuellement si tu le souhaites.
- Le code côté serveur s'attend à ce que `user.settings` puisse être `null` ou un objet; lors de la lecture il faut prévoir un fallback `{}`.
- Pour des requêtes fréquentes filtrant sur `eventsEnabled`, crée un index expressionnel Postgres :

```sql
CREATE INDEX idx_users_settings_events_enabled ON "user" (((settings->>'eventsEnabled')::boolean));
```

## API: Mettre à jour les préférences (merge-safe)

- Endpoint: `PUT /users/me/settings`
- Auth: Bearer JWT (même guard que pour les autres routes utilisateurs)
- Body attendu:

```json
{ "settings": { "eventsEnabled": true } }
```

- Comportement:
  - Le serveur fusionne (merge) l'objet `settings` reçu avec l'objet existant au lieu de l'écraser.
  - Le endpoint renvoie l'objet `settings` fusionné.

- Exemple de réponse:

```json
{ "settings": { "eventsEnabled": true, "notifFreq": "quotidien" } }
```

## Frontend: recommandations
- Quand l'utilisateur active le toggle "Évènements":
  1. Appeler `PUT /users/me/settings` avec `{ settings: { eventsEnabled: true } }`.
  2. Demander la permission push (expo-notifications) et appeler `POST /notifications/me/push-token` pour enregistrer le token.
- Quand l'utilisateur désactive: envoyer `{ settings: { eventsEnabled: false } }` et éventuellement supprimer le token côté serveur.

## Code modifié
- `backend/src/users/user.entity.ts` : ajout de la colonne `settings` (type json)
- `backend/src/users/settings.dto.ts` : DTO utilisé par le controller
- `backend/src/users/users.service.ts` : méthode `updateSettings(userId, patch)` qui effectue la fusion
- `backend/src/users/users.controller.ts` : endpoint `PUT /users/me/settings`

Si tu veux, je peux maintenant générer la SQL de migration prête à exécuter (jsonb), ou créer une migration TypeORM si tu utilises ce système. Dis‑moi si tu veux la migration prête ou si tu préfères l'ajouter toi‑même.
