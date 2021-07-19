import providers, { Provider } from '../providers';

export type DeserializedUser = {
  id: string;
  provider: Provider;
};

export class User {
  constructor(
    public readonly id: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly avatar: string,
    public readonly provider: DeserializedUser['provider'],
  ) {}

  public serialize(): string {
    return `${this.id}:${this.provider}`;
  }

  public static isValidProvider(provider: string): boolean {
    return Object.values(providers).includes(
      provider as DeserializedUser['provider'],
    );
  }

  public static deserialize(
    serializedUser: string,
  ): DeserializedUser | undefined {
    const [id, provider] = serializedUser.split(':');
    if (!this.isValidProvider(provider)) {
      return undefined;
    }

    return {
      id,
      provider: provider as DeserializedUser['provider'],
    };
  }
}
