import React from 'react';
import ReactDOM from 'react-dom';
import {
    HashRouter as Router,
} from 'react-router-dom';
import ApolloClient from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { SchemaLink } from 'apollo-link-schema';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { makeExecutableSchema } from 'graphql-tools';
import typeDefs from '~background/services/GraphQLService/typeDefs/ui';
import resolvers from '~background/services/GraphQLService/resolvers/ui';
import App from '../App';
import ControlPanel from './ControlPanel';

const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

const apollo = new ApolloClient({
    link: new SchemaLink({ schema }),
    cache: new InMemoryCache({
        addTypename: false,
    }),
    defaultOptions: {
        query: {
            fetchPolicy: 'no-cache',
        },
        watchQuery: {
            fetchPolicy: 'no-cache',
        },
    },
    connectToDevTools: true,
});

ReactDOM.render(
    <ApolloProvider client={apollo}>
        <Router>
            <ControlPanel>
                <App />
            </ControlPanel>
        </Router>
    </ApolloProvider>,
    document.getElementById('app'),
);
