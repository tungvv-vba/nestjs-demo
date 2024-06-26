import {
  BadRequestException,
  Dependencies,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { UserLoginDto, UserRegisterDto } from 'src/dto';
import * as bcrypt from 'bcrypt';

@Dependencies(UserService, JwtService)
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}
  async login({ username, password }: UserLoginDto) {
    const user = await this.userService.findOne({ username });
    const badRequest = new BadRequestException('Đăng nhập thất bại');

    if (!user) throw badRequest;

    const isLoginSuccessfully = bcrypt.compareSync(password, user.password);
    if (isLoginSuccessfully) {
      const accessToken = await this.jwtService.signAsync({
        sub: user.id,
        username: user.username,
      });
      delete user.password;
      return {
        user,
        accessToken,
      };
    }
    throw badRequest;
  }

  async register(body: UserRegisterDto) {
    const { username, password } = body;
    const isExistingUser = await this.userService.findOne({ username });

    if (isExistingUser) {
      throw new BadRequestException('isExistingUser');
    }

    const hashPassword = await bcrypt.hash(password, 10);
    body.password = hashPassword;

    await this.userService.create(body);
  }
}
