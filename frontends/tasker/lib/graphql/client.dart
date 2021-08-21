import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:flutter/material.dart';
import '../generated/env.dart';

ValueNotifier<GraphQLClient> createGraphQLClient() {
  final httpLink = HttpLink(
      '$API_ENDPOINT_SCHEME_HTTP://$API_ENDPOINT_IP:$API_ENDPOINT_PORT$API_ENDPOINT_PATH_GRAPHQL');

  final authLink = AuthLink(
      getToken: () => TASKER_API_ACCESS_TOKEN == false
          ? null
          : 'Bearer $TASKER_API_ACCESS_TOKEN');

  final Link link = authLink.concat(httpLink);

  return ValueNotifier(
    GraphQLClient(
      link: link,
      // The default store is the InMemoryStore, which does NOT persist to disk
      cache: GraphQLCache(),
      // In order to persist, use HiveStore.
      // cache: GraphQLCache(store: HiveStore()), // "await initHiveForFlutter();" should be called before calling this function"
    ),
  );
}
