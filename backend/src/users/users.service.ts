import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UsersService {

    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

    async findAll(){
        return this.userModel.find().select('-__v');
    }

    async findOne(uid: string){
        const user = await this.userModel.findOne({ uid }).select('-__v');
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async updateProfile(uid: string, dto: UpdateUserDto) {
    const user = await this.userModel.findOneAndUpdate(
      { uid },
      { $set: dto },
      { new: true },
    );
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

    async adminUpdate(uid: string, updateUserDto: UpdateUserDto, requester: any){
        if (requester.role !== 'admin') {
            throw new ForbiddenException('Admins only');
        }

        return this.userModel.findOneAndUpdate({ uid }, {$set: updateUserDto} , { new: true });
    }

    async delete(uid: string, requester: any){
        if (requester.role !== 'admin') {
            throw new ForbiddenException('Admins only');
        }
        const user = await this.userModel.findOneAndDelete({ uid });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return { message: 'User deleted successfully' };
    }
}
