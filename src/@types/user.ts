import { Provider } from '../providers/constants';

export interface DeserializedUser {
  id: string;
  provider: Provider;
}
