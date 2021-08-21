import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/main.dart';
import 'home.dart';

class LoginPage extends StatelessWidget {
  const LoginPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final c = Get.find<MainController>();
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            OutlinedButton(
              child: Text('카카오톡으로 로그인'),
              onPressed: () => Get.off(HomePage()),
            )
          ],
        ),
      ),
    );
  }
}
