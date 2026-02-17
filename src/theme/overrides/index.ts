import { merge } from '@/utils/merge';

import { Theme } from '@mui/material/styles';

import { fab } from '@/theme/overrides/components/fab';
import { card } from '@/theme/overrides/components/card';
import { chip } from '@/theme/overrides/components/chip';
import { tabs } from '@/theme/overrides/components/tabs';
import { menu } from '@/theme/overrides/components/menu';
import { list } from '@/theme/overrides/components/list';
import { table } from '@/theme/overrides/components/table';
import { alert } from '@/theme/overrides/components/alert';
import { badge } from '@/theme/overrides/components/badge';
import { paper } from '@/theme/overrides/components/paper';
import { radio } from '@/theme/overrides/components/radio';
import { appBar } from '@/theme/overrides/components/appbar';
import { drawer } from '@/theme/overrides/components/drawer';
import { dialog } from '@/theme/overrides/components/dialog';
import { avatar } from '@/theme/overrides/components/avatar';
import { rating } from '@/theme/overrides/components/rating';
import { slider } from '@/theme/overrides/components/slider';
import { button } from '@/theme/overrides/components/button';
import { select } from '@/theme/overrides/components/select';
import { defaultProps } from '@/theme/overrides/default-props';
import { switches } from '@/theme/overrides/components/switch';
import { tooltip } from '@/theme/overrides/components/tooltip';
import { popover } from '@/theme/overrides/components/popover';
import { stepper } from '@/theme/overrides/components/stepper';
import { svgIcon } from '@/theme/overrides/components/svg-icon';
import { skeleton } from '@/theme/overrides/components/skeleton';
import { backdrop } from '@/theme/overrides/components/backdrop';
import { progress } from '@/theme/overrides/components/progress';
import { timeline } from '@/theme/overrides/components/timeline';
import { checkbox } from '@/theme/overrides/components/checkbox';
import { dataGrid } from '@/theme/overrides/components/data-grid';
import { treeView } from '@/theme/overrides/components/tree-view';
import { textField } from '@/theme/overrides/components/textfield';
import { accordion } from '@/theme/overrides/components/accordion';
import { typography } from '@/theme/overrides/components/typography';
import { pagination } from '@/theme/overrides/components/pagination';
import { datePicker } from '@/theme/overrides/components/date-picker';
import { breadcrumbs } from '@/theme/overrides/components/breadcrumbs';
import { cssBaseline } from '@/theme/overrides/components/css-baseline';
import { buttonGroup } from '@/theme/overrides/components/button-group';
import { autocomplete } from '@/theme/overrides/components/autocomplete';
import { toggleButton } from '@/theme/overrides/components/toggle-button';

// ----------------------------------------------------------------------

export function componentsOverrides(theme: Theme) {
  const components = merge(
    defaultProps(theme),
    //
    fab(theme),
    tabs(theme),
    chip(theme),
    card(theme),
    menu(theme),
    list(theme),
    badge(theme),
    table(theme),
    paper(theme),
    alert(theme),
    radio(theme),
    select(theme),
    button(theme),
    rating(theme),
    dialog(theme),
    appBar(theme),
    avatar(theme),
    slider(theme),
    drawer(theme),
    stepper(theme),
    tooltip(theme),
    popover(theme),
    svgIcon(theme),
    switches(theme),
    checkbox(theme),
    dataGrid(theme),
    skeleton(theme),
    timeline(theme),
    treeView(theme),
    backdrop(theme),
    progress(theme),
    textField(theme),
    accordion(theme),
    typography(theme),
    pagination(theme),
    datePicker(theme),
    buttonGroup(theme),
    breadcrumbs(theme),
    cssBaseline(theme),
    autocomplete(theme),
    toggleButton(theme)
  );

  return components;
}
