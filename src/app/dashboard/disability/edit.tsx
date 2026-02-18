import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/frontend/routes/hooks';
import { DisabilityEditView } from 'src/frontend/sections/disability/view';

export default function DisabilityEditPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> enableD: Disability Edit</title>
      </Helmet>

      <DisabilityEditView id={`${id}`} />
    </>
  );
}
