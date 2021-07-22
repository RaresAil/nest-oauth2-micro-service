import { Provider } from '../providers/constants';

export interface UserModel {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  readonly creationDate?: Date;
  readonly updatedOn?: Date;
}

export interface DeserializedUser {
  id: string;
  provider: Provider;
}
