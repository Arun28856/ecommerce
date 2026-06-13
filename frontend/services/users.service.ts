import api from '@/lib/axios';
import { BankDetails, User } from '@/types';

export const usersService = {
  updateBankDetails: (data: BankDetails) =>
    api.patch<User>('/users/me/bank-details', data),
};
