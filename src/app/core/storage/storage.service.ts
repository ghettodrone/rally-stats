import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export class StorageError extends Error {}

/** Thin, typed wrapper over localStorage. Safe to inject during server rendering. */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly store: Storage | null = isPlatformBrowser(inject(PLATFORM_ID))
    ? safeLocalStorage()
    : null;

  has(key: string): boolean {
    return this.store?.getItem(key) != null;
  }

  /** Returns the parsed value, or null when missing. Throws StorageError on corrupt data. */
  read<T>(key: string): T | null {
    const raw = this.store?.getItem(key);
    if (raw == null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      throw new StorageError(`Stored data for "${key}" is corrupted`);
    }
  }

  write<T>(key: string, value: T): void {
    if (!this.store) return;
    try {
      this.store.setItem(key, JSON.stringify(value));
    } catch {
      throw new StorageError('Could not save: browser storage is full or unavailable');
    }
  }

  remove(key: string): void {
    this.store?.removeItem(key);
  }
}

function safeLocalStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
