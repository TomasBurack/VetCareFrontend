import { api } from './client';

export const authApi = {
  signIn: (email, password) => api.post('/api/auth/signin', { email, password }),
  signUp: (data) => api.post('/api/auth/signup', data),
  signOut: () => api.post('/api/auth/signout'),
  me: () => api.get('/api/auth/me'),
  forgotPassword: (email) => api.post('/api/auth/forgost-post', { email }),
  resetPassword: (token, newPassword) =>
    api.post('/api/auth/reset-password', { token, newPassword }),

  enableTwoFactor: () => api.post('/api/auth/2fa/enable'),
  confirmTwoFactor: (code) => api.post('/api/auth/2fa/confirm', { code }),
  verifyTwoFactor: (pendingToken, code) =>
    api.post('/api/auth/2fa/verify', { pendingToken, code }),
  disableTwoFactor: (password) => api.post('/api/auth/2fa/disable', { password }),
};

export const clientApi = {
  myUser: () => api.get('/myuser'),
  updateMyUser: (data) => api.put('/myuser/update', data),
  deleteMyUser: () => api.delete('/myuser/delete'),

  all: () => api.get('/client/all'),
  getById: (id) => api.get(`/client/${id}`),
  create: (data) => api.post('/client/create', data),
  update: (id, data) => api.put(`/client/update/${id}`, data),
  remove: (id) => api.delete(`/client/delete/${id}`),
};

export const petApi = {
  list: () => api.get('/api/client/pet/'),
  getById: (id) => api.get(`/api/client/pet/${id}`),
  create: (data) => api.post('/api/client/pet/create', data),
  update: (id, data) => api.put(`/api/client/pet/update/${id}`, data),
  remove: (id) => api.delete(`/api/client/pet/delete/${id}`),

  allAdmin: () => api.get('/api/admins/pet/all'),
  updateAdmin: (id, data) => api.put(`/api/admins/pet/update/${id}`, data),
  removeAdmin: (id) => api.delete(`/api/admins/pet/delete/${id}`),
};

export const breedsApi = {
  list: (typePet) => api.get(`/api/breeds?typePet=${encodeURIComponent(typePet)}`),
};

export const shiftApi = {
  create: (data) => api.post('/api/shift/create', data),
  busyTimes: (enrollment, date) =>
    api.get(`/api/shift/busy-times?enrollment=${encodeURIComponent(enrollment)}&date=${encodeURIComponent(date)}`),
  listAdmin: () => api.get('/api/shift/admin'),
  listClient: () => api.get('/api/shift/client'),
  listVeterinarian: () => api.get('/api/shift/veterinarian'),
  cancelAsClient: (id) => api.put(`/api/shift/status/client/${id}`),
  updateStatusAsVeterinarian: (id, status) =>
    api.put(`/api/shift/status/veterinarian/${id}`, { status }),
  updateStatusAsAdmin: (id, status) =>
    api.put(`/api/admins/shift/status/${id}`, { status }),
  removeAsAdmin: (id) => api.delete(`/api/admins/shift/delete/${id}`),
};

export const veterinarianApi = {
  create: (data) => api.post('/api/admins/veterinarian-create', data),
  getById: (id) => api.get(`/api/admins/veterinarian-retrieve/${id}`),
  update: (id, data) => api.put(`/api/admins/veterinarian-update/${id}`, data),
  remove: (id) => api.delete(`/api/admins/veterinarian-delete/${id}`),
  all: () => api.get('/api/admins/veterinarian-retrieves-all'),

  myUser: () => api.get('/api/veterinarian/myuser'),
  updateMyUser: (data) => api.put('/api/veterinarian/myuser', data),
  deleteMyUser: () => api.delete('/api/veterinarian/myuser'),

  listForClient: () => api.get('/api/client/veterinarians'),
};

export const administratorApi = {
  myUser: () => api.get('/api/admin/myuser'),
  updateMyUser: (data) => api.put('/api/admin/myuser/update', data),
  deleteMyUser: () => api.delete('/api/admin/myuser/delete'),

  allUsers: () => api.get('/api/admins/alluser'),
};

export const sysadminApi = {
  myUser: () => api.get('/api/sysadmin/myuser'),
  updateMyUser: (data) => api.put('/api/sysadmin/myuser/update', data),
  deleteMyUser: () => api.delete('/api/sysadmin/myuser/delete'),

  create: (data) => api.post('/api/sysadmin/create', data),
  getById: (id) => api.get(`/api/sysadmin/${id}`),
  update: (id, data) => api.put(`/api/sysadmin/update/${id}`, data),
  remove: (id) => api.delete(`/api/sysadmin/delete/${id}`),
  allAdmins: () => api.get('/api/sysadmin/alladmins'),
};
