import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createPool, Pool } from 'mysql2/promise';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly pool: Pool;

  constructor() {
    const ssl = process.env.DB_SSL === 'true'
      ? {
        ca: this.readDatabaseCertificate(),
        minVersion: 'TLSv1.2' as const,
        rejectUnauthorized: true,
      }
      : undefined;
    const connectionLimit = Number(process.env.DB_CONNECTION_LIMIT ?? 10);
    this.pool = createPool({
      host: process.env.DB_HOST ?? '127.0.0.1',
      port: Number(process.env.DB_PORT ?? 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME ?? 'islami_app',
      connectionLimit: Number.isInteger(connectionLimit) && connectionLimit > 0 ? connectionLimit : 10,
      waitForConnections: true,
      queueLimit: 0,
      timezone: 'Z',
      ssl,
    });
  }

  async onModuleInit() {
    if (!process.env.DB_USER) {
      throw new Error('DB_USER harus diatur sebelum backend dijalankan.');
    }
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET harus diatur dan berisi sedikitnya 32 karakter.');
    }
    if (process.env.DB_SSL === 'true' && !process.env.DB_PASSWORD) {
      throw new Error('DB_PASSWORD harus diisi untuk koneksi database cloud.');
    }
    try {
      await this.pool.query('SELECT 1');
    } catch (error) {
      console.error(
        'Koneksi MySQL gagal. Periksa alamat/port, kredensial, izin jaringan database, dan sertifikat TLS.',
      );
      throw error;
    }
  }

  private readDatabaseCertificate() {
    const certificate = process.env.DB_SSL_CA?.trim();
    if (!certificate) {
      throw new Error('DB_SSL_CA harus berisi sertifikat CA database saat DB_SSL=true.');
    }
    if (certificate.startsWith('base64:')) {
      const decoded = Buffer.from(certificate.slice('base64:'.length), 'base64')
        .toString('utf8')
        .trim();
      if (!decoded.includes('BEGIN CERTIFICATE')) {
        throw new Error('DB_SSL_CA berisi data base64 yang bukan sertifikat PEM.');
      }
      return decoded;
    }
    if (certificate.includes('BEGIN CERTIFICATE')) {
      return certificate.replace(/\\n/g, '\n');
    }
    try {
      return readFileSync(resolve(__dirname, '..', certificate));
    } catch {
      throw new Error(`Sertifikat CA database tidak dapat dibaca dari "${certificate}".`);
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  getPool() {
    return this.pool;
  }
}
