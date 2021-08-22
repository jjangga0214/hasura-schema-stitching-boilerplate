import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:get/get.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:kakao_flutter_sdk/common.dart'; // import utility methods
import 'package:kakao_flutter_sdk/user.dart'; // must be imported if version is 0.6.4 or higher
import 'package:kakao_flutter_sdk/auth.dart';
import '../generated/graphql.dart';
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
            Mutation(
              options: MutationOptions(
                document:
                    SIGN_IN_OR_UP_MUTATION_DOCUMENT, // this is the mutation string you just created
                // you can update the cache based on results
                // update: (GraphQLDataProxy cache, QueryResult result) {
                //   return cache;
                // },
                // or do something with the result.data on completion
                onCompleted: (dynamic resultData) async {
                  final payload =
                      SignInOrUp$Mutation.fromJson(resultData).signInOrUp;
                  final storage = FlutterSecureStorage();
                  await storage.write(
                    key: 'accessToken',
                    value: payload.accessToken,
                  );

                  if (payload.result == SignInOrUpResult.signIn) {
                    Get.snackbar('Success', '로그인을 환영합니다!');
                  } else if (payload.result == SignInOrUpResult.signUp) {
                    Get.snackbar('Success', '회원가입을 환영합니다!');
                  }
                  Get.off(HomePage());
                },
              ),
              builder: (
                RunMutation runMutation,
                QueryResult? result,
              ) {
                return OutlinedButton(
                  child: Text('카카오톡으로 로그인'),
                  onPressed: () async {
                    try {
                      final installed = await isKakaoTalkInstalled();
                      String authCode = '';
                      if (installed) {
                        // via kakaotalk application
                        authCode =
                            await AuthCodeClient.instance.requestWithTalk();
                      } else {
                        // via web browser
                        authCode = await AuthCodeClient.instance.request();
                      }
                      if (authCode == '') {
                        Get.snackbar('Error', 'Auth code is not initialized');
                        return;
                      }
                      runMutation(SignInOrUpArguments(
                        signInOrUpInput: SignInOrUpInput(
                          code: authCode,
                          idp: IdpEnum.kakao,
                          platform: PlatformEnum.android,
                        ),
                      ).toJson());
                    } catch (e) {
                      Get.snackbar('Error', e.toString());
                    }
                  },
                );
              },
            )
          ],
        ),
      ),
    );
  }
}
