import { Proprietaire } from '../models/proprietaire';
import { apiFetch } from './api';

export async function createProprietaire(data: Omit<Proprietaire, 'id'>): Promise<Proprietaire> {
  return apiFetch('/proprietaire', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getProprietaires(): Promise<Proprietaire[]> {
  return apiFetch('/proprietaire');
}
