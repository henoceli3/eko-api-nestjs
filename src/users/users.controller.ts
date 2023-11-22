import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { validationResult } from 'express-validator';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';

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

  @Post('updateUserAvatar')
  @HttpCode(200)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: {
        destination: './uploads/avatars',
        filename: (req: Request, file: Express.Multer.File, cb) => {
          const ext = extname(file.originalname);
          const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${file.fieldname}-${fileName}${ext}`);
        },
      },
    }),
  )
  async updateUserAvatar(
    @UploadedFile() avatar: Express.Multer.File,
    @Body('uuid') uuid: string,
  ) {
    if (!avatar) {
      throw new BadRequestException("Aucun fichier n'a été téléchargé.");
    }
    try {
      await this.service.updateUserAvatar(uuid, avatar.filename);
    } catch (error) {
      throw new BadRequestException(
        "Erreur lors de la mise à jour de l'avatar.",
      );
    }
  }

  @Post('updatePassword')
  @HttpCode(200)
  updatePassword(
    @Body('uuid') uuid: string,
    @Body('password') password: string,
    @Req() request: Request,
  ) {
    const result = validationResult(request);
    if (!result.isEmpty()) {
      throw new BadRequestException(result);
    }
    return this.service.updatePassword(uuid, password);
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
