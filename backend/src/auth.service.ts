import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { sign } from 'jsonwebtoken';
import { compare, hash } from 'bcryptjs';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { DatabaseService } from './database.service';
import { ProgressService } from './progress.service';

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  name: string;
  password_hash: string | null;
}

export interface SessionUser {
  id: number;
  username: string;
  name: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly database: DatabaseService,
    private readonly progress: ProgressService,
  ) {}

  async register(username: string, password: string, name?: string) {
    this.validatePasswordBytes(password);
    const normalizedUsername = username.toLowerCase();
    const passwordHash = await hash(password, 12);
    const connection = await this.database.getPool().getConnection();

    try {
      await connection.beginTransaction();
      const [result] = await connection.execute<ResultSetHeader>(
        'INSERT INTO users (username, email, name, password_hash) VALUES (?, NULL, ?, ?)',
        [normalizedUsername, name?.trim() || username.trim(), passwordHash],
      );
      await this.progress.recordLogin(result.insertId, connection);
      await connection.commit();

      const user = {
        id: result.insertId,
        username: normalizedUsername,
        name: name?.trim() || username.trim(),
      };
      return { user, token: this.createToken(user) };
    } catch (error) {
      await connection.rollback();
      if (this.isDuplicate(error)) {
        throw new ConflictException('Nama pengguna tersebut sudah digunakan.');
      }
      throw error;
    } finally {
      connection.release();
    }
  }

  async login(username: string, password: string) {
    this.validatePasswordBytes(password);
    const [rows] = await this.database.getPool().execute<UserRow[]>(
      'SELECT id, username, name, password_hash FROM users WHERE username = ? LIMIT 1',
      [username.toLowerCase()],
    );
    const userRow = rows[0];
    if (!userRow || !userRow.password_hash || !(await compare(password, userRow.password_hash))) {
      throw new UnauthorizedException('Nama pengguna atau kata sandi tidak sesuai.');
    }

    const connection = await this.database.getPool().getConnection();
    try {
      await connection.beginTransaction();
      await this.progress.recordLogin(userRow.id, connection);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    const user = { id: userRow.id, username: userRow.username, name: userRow.name };
    return { user, token: this.createToken(user) };
  }

  async recordVisit(userId: number) {
    const connection = await this.database.getPool().getConnection();
    try {
      await connection.beginTransaction();
      await this.progress.recordLogin(userId, connection);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  private createToken(user: SessionUser) {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
      throw new Error('JWT_SECRET harus diatur dan berisi sedikitnya 32 karakter.');
    }
    return sign(
      { username: user.username, name: user.name },
      secret,
      { subject: String(user.id), expiresIn: '7d', algorithm: 'HS256' },
    );
  }

  private validatePasswordBytes(password: string) {
    if (Buffer.byteLength(password, 'utf8') > 72) {
      throw new BadRequestException('Kata sandi maksimum 72 byte dalam UTF-8.');
    }
  }

  private isDuplicate(error: unknown) {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'ER_DUP_ENTRY'
    );
  }
}
