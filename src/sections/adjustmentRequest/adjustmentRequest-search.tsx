import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/frontend/routes/hooks';
import Iconify from 'src/frontend/components/iconify';
import SearchNotFound from 'src/frontend/components/search-not-found';
import { IAdjustmentRequestItem } from 'src/frontend/types/adjustmentRequest';

// ----------------------------------------------------------------------

type Props = {
  query: string;
  results: IAdjustmentRequestItem[];
  onSearch: (inputValue: string) => void;
  hrefItem: (id: string) => string;
};

export default function AdjustmentSearch({ query, results, onSearch, hrefItem }: Props) {
  const router = useRouter();

  const handleClick = (id: string) => {
    router.push(hrefItem(id));
  };

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (query) {
      if (event.key === 'Enter') {
        const selectProduct = results.filter((a) => a.title === query)[0];

        handleClick(selectProduct.id);
      }
    }
  };

  return (
    <Autocomplete
      sx={{ width: { xs: 1, sm: 260 } }}
      autoHighlight
      popupIcon={null}
      options={results}
      onInputChange={(event, newValue) => onSearch(newValue)}
      getOptionLabel={(option) => option.title ?? ''}
      noOptionsText={<SearchNotFound query={query} sx={{ bgcolor: 'unset' }} />}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search..."
          onKeyUp={handleKeyUp}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ ml: 1, color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      )}
      renderOption={(props, adjustmentRequest, { inputValue }) => {
        const matches = match(adjustmentRequest.title ?? '', inputValue);
        const parts = parse(adjustmentRequest.title ?? '', matches);

        return (
          <Box
            component="li"
            {...props}
            onClick={() => handleClick(adjustmentRequest.id)}
            key={adjustmentRequest.id}
          >
            <div>
              {parts.map((part, index) => (
                <Typography
                  key={index}
                  component="span"
                  color={part.highlight ? 'primary' : 'textPrimary'}
                  sx={{
                    typography: 'body2',
                    fontWeight: part.highlight ? 'fontWeightSemiBold' : 'fontWeightMedium',
                  }}
                >
                  {part.text}
                </Typography>
              ))}
            </div>
          </Box>
        );
      }}
    />
  );
}
