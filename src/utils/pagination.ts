export const calculatePaginate = (page: number, perPage: number) => {
  let limit = Number(perPage),
    currentPage = Number(page),
    skip = 0;

  if (!limit || isNaN(limit)) {
    limit = 30;
  }

  if (currentPage && !isNaN(limit)) {
    skip = limit * (currentPage - 1);
  } else {
    currentPage = 1;
  }

  return { limit, skip, currentPage };
};
