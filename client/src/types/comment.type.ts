export interface Comment {
  id: number;
  body: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}
