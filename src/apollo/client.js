import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import {getNetworkData} from "../helpers/network";

export const client = new ApolloClient({
  link: new HttpLink({
    uri: getNetworkData().clientTheGraph || '',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true
})

export const blockClient = new ApolloClient({
  link: new HttpLink({
    uri: getNetworkData().blockClientTheGraph || '',
  }),
  cache: new InMemoryCache()
})
