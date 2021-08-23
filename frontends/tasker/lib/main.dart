import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:kakao_flutter_sdk/common.dart'; // import utility methods
import 'package:kakao_flutter_sdk/user.dart'; // must be imported if version is 0.6.4 or higher
import 'package:kakao_flutter_sdk/auth.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:get/get.dart';
import 'package:tasker/pages/login.dart';
import 'controllers/main.dart';
import 'pages/home.dart';
import 'generated/env.dart';
import 'constants/colors.dart';
import 'graphql/client.dart';

void main() async {
  /// required by flutter_secure_storage
  WidgetsFlutterBinding.ensureInitialized();
  KakaoContext.clientId = TASKER_OAUTH2_KAKAO_CLIENT_ID;
  final storage = new FlutterSecureStorage();
  if (TASKER_API_ACCESS_TOKEN != null) {
    await storage.write(key: 'accessToken', value: TASKER_API_ACCESS_TOKEN);
  }

  String? accessToken = null;
  // todo: implements internet connection exception handling
  // todo: implements refreshing accessToken if expired.
  // todo: remove the code below
  await storage.delete(key: 'accessToken');
  accessToken = await storage.read(key: 'accessToken');
  runApp(Tasker(
    isLogined: accessToken != null,
    graphQLClient: createGraphQLClient(),
  ));
}

class Tasker extends StatelessWidget {
  const Tasker({required this.isLogined, required this.graphQLClient, Key? key})
      : super(key: key);
  // This widget is the root of your application.
  final bool isLogined;
  final ValueNotifier<GraphQLClient> graphQLClient;

  @override
  Widget build(BuildContext context) {
    Get.put(MainController());

    return GraphQLProvider(
      client: this.graphQLClient,
      child: GetMaterialApp(
        title: 'Tasker',
        theme: ThemeData(
          // This is the theme of your application.
          //
          // Try running your application with "flutter run". You'll see the
          // application has a blue toolbar. Then, without quitting the app, try
          // changing the primarySwatch below to Colors.green and then invoke
          // "hot reload" (press "r" in the console where you ran "flutter run",
          // or simply save your changes to "hot reload" in a Flutter IDE).
          // Notice that the counter didn't reset back to zero; the application
          // is not restarted.
          primarySwatch: Colors.blue,
          textTheme: Theme.of(context).textTheme.apply(
                bodyColor: BLACK_GREY,
                displayColor: BLACK_GREY,
                fontFamily: 'SFProText',
              ),
        ),
        home: this.isLogined ? HomePage() : LoginPage(),
      ),
    );
  }
}
