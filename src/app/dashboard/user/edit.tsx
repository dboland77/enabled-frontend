import { Helmet } from 'react-helmet-async';

import { useParams } from '../../../routes/hooks';
import { UserEditView } from '../../../sections/user/view';

// ----------------------------------------------------------------------

export default function UserEditPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> enableD: User Edit</title>
      </Helmet>

      <UserEditView id={`${id}`} />
    </>
  );
}
