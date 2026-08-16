export interface Publisher {
  id: string;
  name: string;
  country: string;
  foundedYear: number;
}

export type CreatePublisherDto = Omit<Publisher, 'id'>;
export type UpdatePublisherDto = Partial<CreatePublisherDto>;
