import { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import FormHelperText from '@mui/material/FormHelperText';

import Editor from '@/components/editor';
import { EditorProps } from '@/components/editor/types';

type Props = Omit<EditorProps, 'value' | 'onChange'> & {
  name: string;
  placeholder?: string;
  id?: string;
};

export default function RHFEditor({
  name,
  placeholder = 'Please add any information you think is important for this request.',
  helperText,
  id,
  ...other
}: Props) {
  const {
    control,
    watch,
    setValue,
    formState: { isSubmitSuccessful },
  } = useFormContext();

  const values = watch();

  useEffect(() => {
    // Handle empty Tiptap content (empty paragraph tag)
    if (values[name] === '<p></p>') {
      setValue(name, '', {
        shouldValidate: !isSubmitSuccessful,
      });
    }
  }, [isSubmitSuccessful, name, setValue, values]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Editor
          id={id ?? name}
          value={field.value}
          onChange={field.onChange}
          placeholder={placeholder}
          error={!!error}
          helperText={
            (!!error || helperText) && (
              <FormHelperText error={!!error} sx={{ px: 2 }}>
                {error ? error?.message : helperText}
              </FormHelperText>
            )
          }
          {...other}
        />
      )}
    />
  );
}
