import {Role} from './role.model'

export interface User {
  id: string;
  name: string;
  email: string;
  roles: Role[];
}

