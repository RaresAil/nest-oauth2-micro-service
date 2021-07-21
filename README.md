# NestJS OAuth2 Service

### Table of Contents

1. [Add new provider](#add-new-provider)
2. [ENV File](#env-file)
3. [How to generate the RSA Key](#how-to-generate-the-rsa-key)

### Add new provider

1. Define the provider in `providers` constant located in `src/providers/constants.ts`
2. Create a directory in `src/providers` with the name defined in `providers`. e.g. if in providers you have `Facebook: 'facebook-provider'` the directory name will be `facebook-provider`
3. In the directory, you should have 2 files.
   - `config.ts` - should default export 2 keys:
     - `redirectPath` - With this exact name
     - `callbackPath` - With this exact name
   - `strategy.ts` - should default export the Strategy class, check the google example.
4. In the `auth.controller.ts` define the 2 routes and assign the `@AuthMethod` attribute with the provider and method. e.g.

   ```ts
   @AuthMethod(providers.Google, methods.Callback)
   public authWithGoogle() {
     throw new InternalServerErrorException();
   }

   @AuthMethod(providers.Google, methods.Authorize)
   public loginWithGoogle() {
     throw new InternalServerErrorException();
   }
   ```

### ENV File

| Key                  | Value                                               |
| -------------------- | --------------------------------------------------- |
| GOOGLE_CLIENT_ID     | \<google_client>                                    |
| GOOGLE_CLIENT_SECRET | \<google_secret>                                    |
| LOGIN_ROUTE          | /login                                              |
| HOME_ROUTE           | /                                                   |
| DB_DIALECT           | postgres                                            |
| DB_HOST              | localhost                                           |
| DB_PORT              | 5432                                                |
| DB_USER              | \<user>                                             |
| DB_PASSWORD          | \<database_password>                                |
| DB_NAME              | \<database_name>                                    |
| UUID_NAMESPACE       | \<uuid_v5_namespace> (It can be a uuidV4 generated) |
| JWT_PRIVATE_KEY      | \<rsa_private_key>                                  |
| JWT_PUBLIC_KEY       | \<rsa_public_key>                                   |

### How to generate the RSA Key

1. Generate the private key:

   ```bash
   openssl genrsa -out private.key 3072
   ```

2. Extract the public key

   ```bash
   openssl rsa -in private.pem -pubout -out public.pem
   ```

3. When saving the key in .env, remove the EOL (keep the key in a single line) and remove the prefix/suffix.
   - The prefixes are
     - -----BEGIN RSA PRIVATE KEY-----
     - -----BEGIN PUBLIC KEY-----
   - The suffixes are
     - -----END RSA PRIVATE KEY-----
     - -----END PUBLIC KEY-----
