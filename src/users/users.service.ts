import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity/user.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import * as short from 'short-uuid';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async createUser(
    name: string,
    lastName: string,
    email: string,
    password: string,
  ) {
    const existEmail = await this.usersRepository.exist({
      where: { email: email },
    });
    if (existEmail) {
      throw new NotFoundException('Email already exists');
    }
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);
    const userCreated = this.usersRepository.save({
      uuid: uuidv4(),
      apiKey: short.generate(),
      name: name.toLowerCase(),
      lastName: lastName.toLowerCase(),
      email: email.toLowerCase(),
      password: hashPassword,
      isActive: true,
      resetToken: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return {
      message: 'User created',
      data: { uuid: (await userCreated).uuid },
    };
  }

  async getUserByUuid(uuid: string) {
    const findUser = await this.usersRepository.findOne({
      select: ['uuid', 'email', 'name', 'lastName', 'createdAt', 'updatedAt'],
      where: { uuid: uuid, isActive: true },
    });
    if (!findUser) {
      throw new NotFoundException('User not found');
    }
    return { message: 'User found', data: findUser };
  }

  async getAllUsers() {
    const users = await this.usersRepository.find({
      select: ['uuid', 'email', 'name', 'lastName', 'createdAt', 'updatedAt'],
      where: { isActive: true },
    });
    return {
      message: 'Users found',
      data: users,
    };
  }

  async updateNameAndLastName(
    uuid: string,
    name: string,
    lastName: string,
    password: string,
  ) {
    const existUser = await this.usersRepository.findOne({
      select: ['name', 'lastName', 'password', 'updatedAt'],
      where: { uuid: uuid.trim(), isActive: true },
    });
    if (!existUser) {
      throw new NotFoundException('User not found');
    }
    const isPasswordValid = await bcrypt.compare(
      password.trim(),
      existUser.password,
    );
    if (!isPasswordValid) {
      throw new NotFoundException('Invalid password');
    }
    await this.usersRepository.update(
      { uuid: uuid.trim() },
      {
        name: name.toLowerCase(),
        lastName: lastName.toLowerCase(),
        updatedAt: new Date(),
      },
    );
    return {
      message: 'User updated',
      data: {},
    };
  }

  async deleteUser(uuid: string, password: string) {
    const findedUser = await this.usersRepository.findOne({
      select: ['password', 'isActive'],
      where: { uuid: uuid, isActive: true },
    });
    if (!findedUser) {
      throw new NotFoundException('User not found');
    }
    const isPasswordValid = await bcrypt.compare(
      password.trim(),
      findedUser.password,
    );
    if (!isPasswordValid) {
      throw new NotFoundException('Invalid password');
    }
    await this.usersRepository.update(
      { uuid: uuid.trim() },
      { isActive: false, deletedAt: new Date() },
    );
    return {
      message: 'User deleted',
      data: {},
    };
  }
}
