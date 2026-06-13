import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  constructor(private config: ConfigService) {}

  onModuleInit() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: this.config.get<string>('FIREBASE_PROJECT_ID'),
          clientEmail: this.config.get<string>('FIREBASE_CLIENT_EMAIL'),
          privateKey: FirebaseService.parsePrivateKey(
            this.config.get<string>('FIREBASE_PRIVATE_KEY'),
          ),
        }),
      });
    }
  }

  private static parsePrivateKey(rawKey: string | undefined): string {
    let key = (rawKey || '').trim();

    // Strip surrounding quotes that sometimes get included when pasting
    // the key into a platform's env var UI (e.g. Render, Vercel, Heroku).
    if (
      (key.startsWith('"') && key.endsWith('"')) ||
      (key.startsWith("'") && key.endsWith("'"))
    ) {
      key = key.slice(1, -1);
    }

    // Convert escaped newlines (\n as two chars) into real newlines.
    return key.replace(/\\n/g, '\n');
  }

  getAuth() {
    return admin.auth();
  }
}