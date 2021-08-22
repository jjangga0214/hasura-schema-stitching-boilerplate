import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:flutter/material.dart';
import '../generated/env.dart';

ValueNotifier<GraphQLClient> createGraphQLClient() {
  final httpLink = HttpLink(
      '$API_ENDPOINT_SCHEME_HTTP://$API_ENDPOINT_IP:$API_ENDPOINT_PORT$API_ENDPOINT_PATH_GRAPHQL');

  final storage = new FlutterSecureStorage();
  final authLink = AuthLink(getToken: () async {
    String? accessToken = null;
    try {
      // Error is thrown is 'accessToken' is not saved before.
      accessToken = await storage.read(key: 'accessToken');
    } catch (e) {}
    // If null is returned, AuthLink does not insert Authorization Header.
    return accessToken == null ? null : 'Bearer ${accessToken}';
  });

  final Link link = authLink.concat(httpLink);

  return ValueNotifier(
    GraphQLClient(
      link: link,
      // The default store(`GraphQLCache()`) is InMemoryStore, which does NOT persist to disk.
      cache: GraphQLCache(),
      // In order to persist, use `HiveStore`.
      // CAUTION: "await initHiveForFlutter();" should be called(e.g. in `main` function) before calling `HiveStore()`.
      // cache: GraphQLCache(store: HiveStore()),
    ),
  );
}
