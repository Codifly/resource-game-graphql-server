import { GraphQLClient } from 'graphql-request';

import { Services } from '../';
import GENERATE_NEW_BONUS_MUTATION from './mutations';

export default function bonusManagerCron(
  services: Services,
  client: GraphQLClient,
) {
  return {
    schedule: '*/1 * * * *',
    job: async () => {
      console.log('CRON: Bonus manager cron started');
      await client.request(GENERATE_NEW_BONUS_MUTATION);
      console.log('CRON: Bonus manager cron finished');
    },
  };
}
