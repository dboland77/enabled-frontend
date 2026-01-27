import { useMemo } from 'react';

import { paths } from 'src/frontend/routes/paths';

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
            path: paths.dashboard.root,
            icon: ICONS.dashboard,
          },

          {
            title: 'Me',
            path: paths.dashboard.user.root,
            icon: ICONS.user,
            children: [
              { title: 'profile', path: paths.dashboard.user.profile },
              { title: 'cards', path: paths.dashboard.user.cards },
              { title: 'create', path: paths.dashboard.user.new },
              { title: 'list', path: paths.dashboard.user.list },
            ],
          },
          {
            title: 'My Adjustments',
            path: paths.dashboard.adjustmentRequests.root,
            icon: ICONS.disability,
            children: [
              { title: 'browse', path: paths.dashboard.adjustmentRequests.root },
              { title: 'list', path: paths.dashboard.adjustmentRequests.list },
              { title: 'request', path: paths.dashboard.adjustmentRequests.new },
            ],
          },
        ],
      },

      {
        subheader: 'Knowledge Hub',
        items: [
          {
            title: 'Disability Information',
            path: paths.dashboard.disability.root,
            icon: ICONS.disability,
            children: [
              { title: 'browse', path: paths.dashboard.disability.root },
              { title: 'list', path: paths.dashboard.disability.list },
              { title: 'create', path: paths.dashboard.disability.new },
            ],
          },
          {
            title: 'Available Adjustments',
            path: paths.dashboard.adjustments.root,
            icon: ICONS.file,
            children: [
              { title: 'browse', path: paths.dashboard.adjustments.root },
              { title: 'choose', path: paths.dashboard.adjustments.cards },
              { title: 'create', path: paths.dashboard.adjustments.new },
            ],
          },
        ],
      },
    ],
    []
  );

  return data;
}
