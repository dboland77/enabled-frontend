import Link from '@mui/material/Link';
import { Theme, SxProps } from '@mui/material/styles';

const PATH_AFTER_LOGIN = '/account';

type Props = {
  sx?: SxProps<Theme>;
};

export default function LoginButton({ sx }: Props) {
  return (
    <Link variant="body2" color="inherit" underline="always" sx={{ alignSelf: 'flex-end' }}>
      Forgot password?
    </Link>
  );
}
