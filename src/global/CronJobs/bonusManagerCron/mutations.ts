import { gql } from 'graphql-request';

const GENERATE_NEW_BONUS_MUTATION = gql`
  mutation generateNewBonus {
    generateNewBonus {
      success
    }
  }
`;

export default GENERATE_NEW_BONUS_MUTATION;
