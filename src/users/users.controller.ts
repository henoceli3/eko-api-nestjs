import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { validationResult } from 'express-validator';

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Post('createUser')
  @HttpCode(200)
  create(
    @Body('name') name: string,
    @Body('lastName') lastName: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Req() request: Request,
  ) {
    const result = validationResult(request);
    if (!result.isEmpty()) {
      throw new BadRequestException(result);
    }
    return this.service.createUser(name, lastName, email, password);
  }

  @Post('getUserByUuid')
  @HttpCode(200)
  getUserByUuid(@Body('uuid') uuid: string, @Req() request: Request) {
    const result = validationResult(request);
    if (!result.isEmpty()) {
      throw new BadRequestException(result);
    }
    return this.service.getUserByUuid(uuid);
  }

  @Get('getAllUsers')
  getAllUsers() {
    return this.service.getAllUsers();
  }

  @Post('updateNameAndLastName')
  @HttpCode(200)
  updateNameAndLastName(
    @Body('uuid') uuid: string,
    @Body('name') name: string,
    @Body('lastName') lastName: string,
    @Body('password') password: string,
    @Req() request: Request,
  ) {
    const result = validationResult(request);
    if (!result.isEmpty()) {
      throw new BadRequestException(result);
    }
    return this.service.updateNameAndLastName(uuid, name, lastName);
  }

  @Post('updateEmail')
  @HttpCode(200)
  updateEmail(
    @Body('uuid') uuid: string,
    @Body('email') email: string,
    @Req() request: Request,
  ) {
    const result = validationResult(request);
    if (!result.isEmpty()) {
      throw new BadRequestException(result);
    }
    return this.service.updateEmail(uuid, email);
  }

  @Post('deleteUser')
  @HttpCode(200)
  deleteUser(
    @Body('uuid') uuid: string,
    @Body('password') password: string,
    @Req() request: Request,
  ) {
    const result = validationResult(request);
    if (!result.isEmpty()) {
      throw new BadRequestException(result);
    }
    return this.service.deleteUser(uuid, password);
  }

  @Post('reactivateUser')
  @HttpCode(200)
  reActivateUser(@Body('uuid') uuid: string, @Req() request: Request) {
    const result = validationResult(request);
    if (!result.isEmpty()) {
      throw new BadRequestException(result);
    }
    return this.service.reactivateUser(uuid);
  }

  @Post('acceptTermsAndConditions')
  @HttpCode(200)
  acceptTermsAndConditions(
    @Body('uuid') uuid: string,
    @Req() request: Request,
  ) {
    const result = validationResult(request);
    if (!result.isEmpty()) {
      throw new BadRequestException(result);
    }
    return this.service.acceptTermsAndConditions(uuid);
  }
}
