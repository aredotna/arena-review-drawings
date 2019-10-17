import React from 'react';
import { ApolloProvider } from '@apollo/react-hooks';
import client from 'apollo/index';

import Easel from 'components/Easel';

const App: React.FC = () => {
  return (
    <ApolloProvider client={client}>
      <div>
        <Easel />
      </div>
    </ApolloProvider>
  );
};

export default App;
