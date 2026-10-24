import { authAPI } from '@/lib/actions/authAPi';
import { useAppDispatch } from '../store/hooks';

export const useTwoFactor = () => {
  const dispatch = useAppDispatch();

  const generateSecret = async () => {
    const result = await authAPI.generateTwoFactorSecret(dispatch);
    return result;
  };

  const verifyCode = async (totpCode: string) => {
    const result = await authAPI.verifyTwoFactor({ totpCode }, dispatch);
    return result;
  };

  const enableTwoFactor = async (totpCode: string, secret?: string) => {
    const result = await authAPI.enableTwoFactor({ totpCode, secret }, dispatch);
    return result;
  };

  const disableTwoFactor = async (totpCode: string) => {
    const result = await authAPI.disableTwoFactor({ totpCode }, dispatch);
    return result;
  };

  const getStatus = async () => {
    const result = await authAPI.getTwoFactorStatus(dispatch);
    return result;
  };

  const generateBackupCodes = async (totpCode: string) => {
    const result = await authAPI.generateBackupCodes({ totpCode }, dispatch);
    return result;
  };

  const regenerateBackupCodes = async (totpCode: string) => {
    const result = await authAPI.regenerateBackupCodes({ totpCode }, dispatch);
    return result;
  };

  const getBackupCodesStatus = async () => {
    const result = await authAPI.getBackupCodesStatus(dispatch);
    return result;
  };

  return {
    generateSecret,
    verifyCode,
    enableTwoFactor,
    disableTwoFactor,
    getStatus,
    generateBackupCodes,
    regenerateBackupCodes,
    getBackupCodesStatus,
  };
};

export default useTwoFactor;