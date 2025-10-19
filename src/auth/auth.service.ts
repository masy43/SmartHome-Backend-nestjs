import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService
  ) {}

  private async generateToken(user: { id: number; email: string }) {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.signAsync(payload);
  }

  async register(dto: RegisterDto) {
    const { name, email, password } = dto;

    const salt = Number(
      this.config.get<string>("HASH_SALT") ?? process.env.HASH_SALT ?? 10
    );

    try {
      const normalizedEmail = String(email).trim().toLowerCase();

      const hashed = await bcrypt.hash(password, salt);

      const user = await this.prisma.user.create({
        data: { name, email: normalizedEmail, password: hashed },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const token = await this.generateToken(user as any);

      return { user, token };
    } catch (err: any) {
      if (err instanceof ConflictException) throw err;
      // Prisma unique constraint could also surface here — map to Conflict
      if (err?.code === "P2002")
        throw new ConflictException("Email already in use");
      throw new InternalServerErrorException("Failed to create user");
    }
  }

  async validateUserByEmail(email: string, password: string) {
    try {
      const normalizedEmail = String(email).trim().toLowerCase();
      const user = await this.prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
      if (!user) return null;

      const match = await bcrypt.compare(password, user.password);
      if (!match) return null;

      const { password: _p, ...rest } = user;
      return rest;
    } catch (err) {
      return null;
    }
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;
    const normalizedEmail = String(email).trim().toLowerCase();

    try {
      const user = await this.prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
      if (!user) throw new UnauthorizedException("Invalid credentials");

      const match = await bcrypt.compare(password, user.password);
      if (!match) throw new UnauthorizedException("Invalid credentials");

      const { password: _p, ...publicUser } = user;
      const token = await this.generateToken(publicUser as any);

      return { user: publicUser, token };
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new InternalServerErrorException("Failed to login");
    }
  }

  // Return a list of users (omit passwords)
  async getAllUsers() {
    try {
      return await this.prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (err) {
      throw new InternalServerErrorException("Failed to fetch users");
    }
  }

  // Return a single user by id (omit password)
  async getUserById(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      if (!user) throw new BadRequestException("User not found");
      return user;
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException("Failed to fetch user");
    }
  }

  // Delete a user by id
  async deleteUser(id: number) {
    try {
      const user = await this.prisma.user.delete({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return user;
    } catch (err: any) {
      // If user doesn't exist Prisma throws P2025
      if (err?.code === "P2025")
        throw new BadRequestException("User not found");
      throw new InternalServerErrorException("Failed to delete user");
    }
  }
}
