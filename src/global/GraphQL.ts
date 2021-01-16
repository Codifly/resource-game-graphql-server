import { ApolloServer } from 'apollo-server-koa';
import jwt from 'jsonwebtoken';
import Router from 'koa-router';
import { AuthChecker, buildSchema } from 'type-graphql';
import { Container } from 'typedi';
import { getRepository } from 'typeorm';

import BonusResolver from '../graphql/bonus/BonusResolver';
import LumberyardResolver from '../graphql/resources/lumberyard/LumberyardResolver';
import MineResolver from '../graphql/resources/mine/MineResolver';
import SmithyResolver from '../graphql/resources/smithy/SmithyResolver';
import User from '../graphql/users/User';
import UserResolver from '../graphql/users/UserResolver';
import UnauthorizedError from '../services/errors/UnauthorizedError';

const SECRET: string = process.env.SECRET || 'SuP3r-s3Cr3T';

export interface Context {
  user?: User;
  token?: string | string[];
  system?: boolean;
}

function validateToken(token: string) {
  return jwt.verify(token, SECRET);
}

function findUser(id: string) {
  const userRepository = getRepository(User);
  return userRepository.findOne(id);
}

const context = async (contextParams: any): Promise<Context> => {
  // If it is a websocket connection, use the connection's context.
  if (contextParams.connection) {
    return contextParams.connection.context;
  }

  const { ctx } = contextParams;
  let token = ctx?.request?.header?.authorization;
  let user: User | undefined;

  if (token && typeof token === 'string') {
    try {
      const decoded: any = validateToken(token);

      // We have a system token, handle this separately
      if (decoded.system) {
        return {
          system: true,
        };
      }

      user = await findUser(decoded.id);
    } catch {
      token = undefined;
    }
  }

  return {
    token,
    user,
  };
};

const authChecker: AuthChecker<Context> = ({ context: ctx }, roles) => {
  if (roles.indexOf('ADMIN') >= 0) {
    return !!ctx?.user?.isAdmin;
  }
  if (roles.indexOf('SYSTEM') >= 0 && ctx.system) {
    return true;
  }
  return true;
};

export default async function createApolloServer(router: Router) {
  const schema = await buildSchema({
    resolvers: [
      UserResolver,
      BonusResolver,
      LumberyardResolver,
      MineResolver,
      SmithyResolver,
    ],
    container: Container,
    authChecker,
  });

  const server = new ApolloServer({
    introspection: true,
    playground: true,
    schema,
    context,
    subscriptions: {
      onConnect: async (connectionParams: any) => {
        const token =
          connectionParams?.authorization || connectionParams?.Authorization;
        let user: User | undefined;

        try {
          const decoded: any = validateToken(token);

          // We have a system token, handle this separately
          if (decoded.system) {
            return {
              system: true,
            };
          }
          user = await findUser(decoded.id);
        } catch (error) {
          throw new UnauthorizedError();
        }

        return {
          token,
          user,
        };
      },
    },
  });

  router.post('/graphql', server.getMiddleware());
  router.get('/graphql', server.getMiddleware());

  return server;
}
