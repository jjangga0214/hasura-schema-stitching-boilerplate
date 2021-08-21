import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:flutter/material.dart';

/// "await initHiveForFlutter();" should be called before calling this function"
ValueNotifier<GraphQLClient> createGraphQLClient() {
  final httpLink = HttpLink(
    'https://gnyc-tasker-hasura-transformer.herokuapp.com/',
  );

  return ValueNotifier(
    GraphQLClient(
      link: httpLink,
      // The default store is the InMemoryStore, which does NOT persist to disk
      cache: GraphQLCache(store: HiveStore()),
    ),
  );
}
