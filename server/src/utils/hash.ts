import bcrypt from 'bcryptjs';
const ROUNDS = 12;
export const hashPassword = (pwd: string) => bcrypt.hash(pwd, ROUNDS);
export const comparePassword = (pwd: string, hash: string) => bcrypt.compare(pwd, hash);