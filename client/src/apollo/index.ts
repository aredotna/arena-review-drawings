import ApolloClient from 'apollo-boost';

const client = new ApolloClient({
  uri: 'https://api.are.na/graphql',
  headers: {
    'X-AUTH-TOKEN': process.env.REACT_APP_X_AUTH_TOKEN,
    'X-APP-TOKEN': process.env.REACT_APP_X_APP_TOKEN,
  },
});

export default client;
