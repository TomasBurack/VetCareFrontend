import { useAuth } from '../context/useAuth';
import { ClientProfile } from './client/ClientProfile';
import { VetProfile } from './veterinarian/VetProfile';
import { AdminProfile } from './admin/AdminProfile';
import { SysadminProfile } from './sysadmin/SysadminProfile';

const PROFILE_BY_ROLE = {
  Client: ClientProfile,
  Veterinarian: VetProfile,
  Administrator: AdminProfile,
  SysAdmin: SysadminProfile,
};

export function MyProfile() {
  const { role } = useAuth();
  const ProfileComponent = PROFILE_BY_ROLE[role];
  if (!ProfileComponent) return null;
  return <ProfileComponent />;
}
