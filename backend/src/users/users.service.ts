import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateUserDto } from './dtos/update-user.dto';
import { BankDetailsDto } from './dtos/bank-details.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // Get own profile
  async getMe(uid: string) {
    const user = await this.userModel.findOne({ uid }).select('-__v');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // Update own profile only
  async updateMe(uid: string, dto: UpdateUserDto) {
    const user = await this.userModel.findOneAndUpdate(
      { uid },
      { $set: dto },
      { new: true },
    );
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // Delete own account
  async deleteMe(uid: string) {
    const user = await this.userModel.findOneAndDelete({ uid });
    if (!user) throw new NotFoundException('User not found');
    return { message: 'Account deleted successfully' };
  }

  // Add/update payout bank details
  async updateBankDetails(uid: string, dto: BankDetailsDto) {
    const user = await this.userModel.findOneAndUpdate(
      { uid },
      { $set: { bankDetails: dto } },
      { new: true },
    );
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // Switch role: buyer ↔ seller
  async switchRole(uid: string) {
    const user = await this.userModel.findOne({ uid });
    if (!user) throw new NotFoundException('User not found');

    const newRole = user.role === 'buyer' ? 'seller' : 'buyer';

    return this.userModel.findOneAndUpdate(
      { uid },
      { $set: { role: newRole } },
      { new: true },
    );
  }
}