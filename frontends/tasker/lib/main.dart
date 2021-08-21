import 'package:flutter/material.dart';
import 'package:kakao_flutter_sdk/common.dart'; // import utility methods
import 'package:kakao_flutter_sdk/user.dart'; // must be imported if version is 0.6.4 or higher
import 'package:kakao_flutter_sdk/auth.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:get/get.dart';
import 'package:tasker/pages/login.dart';
import 'controllers/main.dart';
import 'pages/home.dart';
import 'generated/env.dart';
import 'graphql/client.dart';

void main() {
  KakaoContext.clientId = TASKER_OAUTH2_KAKAO_CLIENT_ID;
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    Get.put(MainController());
    return GraphQLProvider(
      client: createGraphQLClient(),
      child: GetMaterialApp(
        title: 'Flutter Demo',
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
        ),
        home: true ? LoginPage() : HomePage(),
      ),
    );
  }
}
