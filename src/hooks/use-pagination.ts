import { useMemo, useState, useCallback } from 'react';
/**
 * Hook implementing pagination logic.
 * @param data Any list.
 * @param volume Amount of items per page.
 * @param initialPage Page set on first render.
 */
export const usePagination = <T extends any>(data: T[], volume: number = 10) => {
  /** All pages in total. */
  const totalPages = useMemo(() => Math.floor(data.length / volume), [volume, data.length]);
  const [page, setPage] = useState(0);
  /** Data representing one single page. */
  const slicedData = useMemo(
    () => data.slice(page * volume, page * volume + volume),
    [volume, page, data]
  );

  // Next page handler.
  const onNextPage = useCallback(() => {
    setPage((prevState: number) => {
      if (prevState < totalPages) {
        return prevState + 1;
      }

      return prevState;
    });
  }, [totalPages]);

  // Previous page handler.
  const onPrevPage = useCallback(() => {
    setPage((prevState: number) => {
      if (prevState > 0) {
        return prevState - 1;
      }

      return prevState;
    });
  }, []);
  return { data: slicedData, page, totalPages, onNextPage, onPrevPage, setPage };
};
