export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  folderId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Folder = {
  id: string;
  name: string;
  icon: string;
  color: string;
  categories: Category[];
  createdAt: Date;
  updatedAt: Date;
};

