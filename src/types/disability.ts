export type IDisabilityFilterValue = string | string[];

export type IDisabilityFilters = {
  disability_name: string[];
  disability_nhs_slug: string;
};

export type IDisabilityItem = {
  id: string;
  disability_name: string;
  disability_nhs_slug: string;
};
