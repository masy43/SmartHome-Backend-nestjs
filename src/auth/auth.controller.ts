import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Param,
  Delete,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtGuard } from "./jwt.guard";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtGuard)
  @Get("me")
  async me(@Req() req: any) {
    return req.user;
  }

  @UseGuards(JwtGuard)
  @Get("users")
  async getAllUsers() {
    return this.authService.getAllUsers();
  }

  @UseGuards(JwtGuard)
  @Get("users/:id")
  async getUser(@Param("id") id: string) {
    const parsed = Number(id);
    return this.authService.getUserById(parsed);
  }

  @UseGuards(JwtGuard)
  @Delete("users/:id")
  async deleteUser(@Param("id") id: string) {
    const parsed = Number(id);
    return this.authService.deleteUser(parsed);
  }
}
