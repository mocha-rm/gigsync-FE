import api from './axios';

export const adminApi = {
  registerAdmin: (userId: number) =>
    api.put(`/admin/users/${userId}/admin_registration`),
}; 
