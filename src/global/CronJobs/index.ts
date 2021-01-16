import { GraphQLClient } from 'graphql-request';
import jwt from 'jsonwebtoken';
import cron from 'node-cron';
import Container from 'typedi';

import BonusService from '../../services/BonusService';
import bonusManagerCron from './bonusManagerCron';

const PORT = process.env.PORT || 3000;
const SECRET: string = process.env.SECRET || 'SuP3r-s3Cr3T';
const DEV = process.env.NODE_ENV === 'development';

const FULL_HOST = DEV
  ? `http://localhost:${PORT}`
  : 'http://resource-game.codifly.be';

export interface Services {
  bonusService: BonusService;
}
interface CronJob {
  schedule: string;
  job: () => void;
}
type CronJobCreator = (services: Services, client: GraphQLClient) => CronJob;
const cronJobCreators: CronJobCreator[] = [bonusManagerCron];

export default function initializeCronJobs() {
  const services: Services = {
    bonusService: Container.get(BonusService),
  };

  const client = new GraphQLClient(`${FULL_HOST}/graphql`, {
    headers: {
      authorization: jwt.sign({ system: true }, SECRET, {
        expiresIn: '30d',
      }),
    },
  });

  cronJobCreators.forEach((creator) => {
    const { schedule, job } = creator(services, client);
    cron.schedule(schedule, job);
  });
}
