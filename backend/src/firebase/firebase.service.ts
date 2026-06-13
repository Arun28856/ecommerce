import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { randomUUID } from 'crypto';

@Injectable()
export class FirebaseService implements OnModuleInit {
  constructor(private config: ConfigService) {}

  onModuleInit() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: this.config.get<string>('FIREBASE_PROJECT_ID'),
          clientEmail: this.config.get<string>('FIREBASE_CLIENT_EMAIL'),
          privateKey: (this.config
            .get<string>('FIREBASE_PRIVATE_KEY') || '')
            .replace(/\\n/g, '\n'),
        }),
        storageBucket: this.config.get<string>('FIREBASE_STORAGE_BUCKET'),
      });
    }
  }

  getAuth() {
    return admin.auth();
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const bucket = admin.storage().bucket();
    const sanitizedName = file.originalname.replace(/\s+/g, '_');
    const filePath = `${folder}/${Date.now()}-${randomUUID()}-${sanitizedName}`;
    const fileRef = bucket.file(filePath);

    await fileRef.save(file.buffer, {
      contentType: file.mimetype,
      public: true,
    });

    return `https://storage.googleapis.com/${bucket.name}/${filePath}`;
  }
}