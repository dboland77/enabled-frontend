import { useMemo } from 'react';

import SvgColor from '../../components/svg-color';

const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const ICONS = {
  disability: icon('ic_job'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  dashboard: icon('ic_dashboard'),
};

export function useNavData() {
  const data = useMemo(
    () => [
      {
        subheader: 'About me',
        items: [
          {
            title: 'Home',
            path: '/dashboard',
            icon: ICONS.dashboard,
          },

          {
            title: 'Me',
            path: '/dashboard/user',
            icon: ICONS.user,
            children: [
              { title: 'profile', path: '/dashboard/user/profile' },
              { title: 'cards', path: '/dashboard/user/profile' },
              { title: 'create', path: '/dashboard/user/profile' },
              { title: 'list', path: '/dashboard/user/profile' },
            ],
          },
          {
            title: 'My Adjustments',
            path: '/dashboard/user/adjustmentRequests',
            icon: ICONS.disability,
            children: [
              { title: 'browse', path: '/dashboard/user/adjustmentRequests' },
              { title: 'list', path: '/dashboard/user/adjustmentRequests/list' },
              { title: 'request', path: '/dashboard/user/adjustmentRequests/new' },
            ],
          },
        ],
      },

      {
        subheader: 'Knowledge Hub',
        items: [
          {
            title: 'Disability Information',
            path: 'dashboard/disability',
            icon: ICONS.disability,
            children: [
              { title: 'browse', path: 'dashboard/disability' },
              { title: 'list', path: 'dashboard/disability/list' },
              { title: 'create', path: 'dashboard/disability/new' },
            ],
          },
          {
            title: 'Available Adjustments',
            path: 'dashboard/adjustments',
            icon: ICONS.file,
            children: [
              { title: 'browse', path: 'dashboard/adjustments' },
              { title: 'choose', path: 'dashboard/adjustments/cards' },
              { title: 'create', path: 'dashboard/adjustments/create' },
            ],
          },
        ],
      },
    ],
    []
  );

  return data;
}
