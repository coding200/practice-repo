import {
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.respository';
import { AuthDto } from './dto/auth.dto';
import { UserType } from './Type/user.type';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './Jwt/jwt-payload.interface';
import { TokenType } from './Type/token.type';
// import { UserStatus } from './user-status.enum';
import { User } from './Entities/user.entity';
import { UserRole } from './user-role.enum';
import { ErrorCode } from '../common/exceptions';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async createUser(authDto: AuthDto): Promise<UserType> {
    return this.userRepository.createUser(authDto);
  }

  async signIn(authDto: AuthDto): Promise<TokenType> {
    const username = await this.userRepository.validateUserPassword(authDto);
    if (!username) {
      // throw new UnauthorizedException(
      //   'Invalid Credentials',
      //   ErrorCode.INVALID_CREDENTIALS,
      // );
      throw new HttpException('Invalid Credentials', HttpStatus.FORBIDDEN);
    }
    const payload: JwtPayload = { username };
    const accessToken = await this.jwtService.sign(payload);
    const token = new TokenType();
    token.token = accessToken;
    return token;
  }

  async getUserById(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  async updateStatus(
    id: number,
    status: boolean,
    user: User,
  ): Promise<UserType> {
    if (user.role != UserRole.ADMIN) {
      throw new UnauthorizedException('Access Denied', ErrorCode.ACCESS_DENIED);
    }
    const userData = await this.getUserById(id);
    userData.is_active = status;
    userData.save();
    return userData;
  }
}
