interface IOption {
  page?: number | string;
  limit?: number | string;
  sortBy?: string;
  sortOrder?: string;
}
type IOptionResult = {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
};
const paginationSortingHelper = (option: IOption): IOptionResult => {
  const page = Number(option.page) || 1;
  const limit = Number(option.limit) || 10;
  const skip = (page - 1) * limit;
  const sortBy = option.sortBy || "createdAt";
  const sortOrder = option.sortOrder || "desc";
  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
  };
};

export default paginationSortingHelper;
