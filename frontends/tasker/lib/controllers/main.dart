import 'package:get/get.dart';

class MainController extends GetxController {
  var counter = 0.obs;
  increment() => this.counter++;
}
