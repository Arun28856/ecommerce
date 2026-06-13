import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {}

    async syncUser(firebaseUser: any, role?: string) {
        const { uid, email, name, displayName, picture, photoURL } = firebaseUser;
        let user = await this.userModel.findOne({ uid });

        if (!user) {
            user = new this.userModel({
                uid,
                email,
                name: name ?? displayName ?? '',
                avatar: picture ?? photoURL ?? '',
                role: role === 'seller' ? 'seller' : 'buyer',
            });
        }

        return user.save();
    }

    async getMe(uid: string) {
        return this.userModel.findOne({ uid });
    }
}