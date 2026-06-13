'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { usersService } from '@/services/users.service';
import { useToastStore } from '@/store/toast.store';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const bankDetailsSchema = z.object({
  accountHolderName: z.string().min(2, 'Account holder name is required'),
  accountNumber: z.string().regex(/^\d{9,18}$/, 'Account number must be 9-18 digits'),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code (e.g. SBIN0001234)'),
  bankName: z.string().min(2, 'Bank name is required'),
  upiId: z.string().optional().or(z.literal('')),
});

type BankDetailsForm = z.infer<typeof bankDetailsSchema>;

export default function SellerSettingsPage() {
  const { user, refreshUser } = useAuth();
  const showToast = useToastStore((s) => s.show);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BankDetailsForm>({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: {
      accountHolderName: user?.bankDetails?.accountHolderName ?? '',
      accountNumber: user?.bankDetails?.accountNumber ?? '',
      ifscCode: user?.bankDetails?.ifscCode ?? '',
      bankName: user?.bankDetails?.bankName ?? '',
      upiId: user?.bankDetails?.upiId ?? '',
    },
  });

  const onSubmit = async (data: BankDetailsForm) => {
    try {
      await usersService.updateBankDetails({
        ...data,
        ifscCode: data.ifscCode.toUpperCase(),
        upiId: data.upiId || undefined,
      });
      await refreshUser();
      showToast('Bank details saved successfully');
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? 'Failed to save bank details', 'error');
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Payout Settings</h1>
      <p className="text-sm text-gray-500 mb-6">
        Add your bank account details so we can pay out your earnings.
      </p>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Account Holder Name"
              placeholder="As per bank records"
              error={errors.accountHolderName?.message}
              {...register('accountHolderName')}
            />
          </div>
          <Input
            label="Account Number"
            placeholder="1234567890"
            error={errors.accountNumber?.message}
            {...register('accountNumber')}
          />
          <Input
            label="IFSC Code"
            placeholder="SBIN0001234"
            error={errors.ifscCode?.message}
            {...register('ifscCode')}
          />
          <Input
            label="Bank Name"
            placeholder="State Bank of India"
            error={errors.bankName?.message}
            {...register('bankName')}
          />
          <Input
            label="UPI ID (optional)"
            placeholder="yourname@upi"
            error={errors.upiId?.message}
            {...register('upiId')}
          />

          <div className="sm:col-span-2 mt-2">
            <Button type="submit" loading={isSubmitting}>
              Save Bank Details
            </Button>
          </div>
        </form>
      </div>

      {user?.bankDetails?.accountNumber && (
        <div className="mt-4 flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Payout details on file — earnings will be transferred to this account.
        </div>
      )}
    </div>
  );
}
