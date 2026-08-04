import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../routes/ProtectedRoute';
import { RoleRoute } from '../routes/RoleRoute';
import { Layout } from '../components/Layout';

import { Welcome } from '../pages/Welcome';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { ResetPassword } from '../pages/auth/ResetPassword';

import { MyProfile } from '../pages/MyProfile';

import { ClientPets } from '../pages/client/ClientPets';
import { ClientPetForm } from '../pages/client/ClientPetForm';
import { ClientShifts } from '../pages/client/ClientShifts';
import { ClientShiftForm } from '../pages/client/ClientShiftForm';

import { VetShifts } from '../pages/veterinarian/VetShifts';

import { AdminAllUsers } from '../pages/admin/AdminAllUsers';
import { AdminClients } from '../pages/admin/AdminClients';
import { AdminVets } from '../pages/admin/AdminVets';
import { AdminVetForm } from '../pages/admin/AdminVetForm';
import { AdminShifts } from '../pages/admin/AdminShifts';

import { SysadminAdmins } from '../pages/sysadmin/SysadminAdmins';

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password', element: <ResetPassword /> },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: '/mi-perfil', element: <MyProfile /> },

          {
            element: <RoleRoute roles={['Client']} />,
            children: [
              { path: '/mis-mascotas', element: <ClientPets /> },
              { path: '/mis-mascotas/nueva', element: <ClientPetForm /> },
              { path: '/mis-mascotas/:id/editar', element: <ClientPetForm /> },
              { path: '/mis-turnos', element: <ClientShifts /> },
              { path: '/mis-turnos/nuevo', element: <ClientShiftForm /> },
            ],
          },

          {
            element: <RoleRoute roles={['Veterinarian']} />,
            children: [{ path: '/turnos-asignados', element: <VetShifts /> }],
          },

          {
            element: <RoleRoute roles={['Administrator']} />,
            children: [
              { path: '/usuarios', element: <AdminAllUsers /> },
              { path: '/turnos', element: <AdminShifts /> },
            ],
          },

          {
            element: <RoleRoute roles={['SysAdmin']} />,
            children: [{ path: '/administradores', element: <SysadminAdmins /> }],
          },

          {
            element: <RoleRoute roles={['Administrator', 'SysAdmin']} />,
            children: [
              { path: '/clientes', element: <AdminClients /> },
              { path: '/veterinarios', element: <AdminVets /> },
              { path: '/veterinarios/nuevo', element: <AdminVetForm /> },
              { path: '/veterinarios/editar/:id', element: <AdminVetForm /> },
            ],
          },
        ],
      },
    ],
  },

  { path: '/', element: <Welcome /> },
  { path: '*', element: <Navigate to="/login" replace /> },
]);
