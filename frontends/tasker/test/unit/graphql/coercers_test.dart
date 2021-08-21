import 'package:test/test.dart';
import 'package:tasker/graphql/coercers.dart';

void main() {
  group('Date', () {
    test('fromGraphQLDateToDartDateTime', () {
      final datetime = fromGraphQLDateToDartDateTime('2021-08-10');
      expect(datetime.year, equals(2021));
      expect(datetime.month, equals(8));
      expect(datetime.day, equals(10));
    });
    test('fromDartDateTimeToGraphQLDate', () {
      final date = fromDartDateTimeToGraphQLDate(
          fromGraphQLDateToDartDateTime('2021-08-10'));
      expect(date, equals('2021-08-10'));
    });
  });
  group('Timetz', () {
    test('fromGraphQLTimetzToDartTimeOfDay', () {
      final timeOfDay = fromGraphQLTimetzToDartTimeOfDay('19:01:02+00');
      expect(timeOfDay.hour, equals(19));
      expect(timeOfDay.minute, equals(1));
    });
    test('fromDartTimeOfDayToGraphQLTimetz', () {
      final timetz = fromDartTimeOfDayToGraphQLTimetz(
          fromGraphQLTimetzToDartTimeOfDay('19:01:12+00'));
      expect(timetz,
          equals('19:01:00+00')); // Units under minute are deleted as 0.
    });
  });
  group('Timestamptz', () {
    test('fromGraphQLTimestamptzToDartDateTime', () {
      final datetime = fromGraphQLTimestamptzToDartDateTime(
          '2021-08-09T13:31:09.975727+00:00');
      expect(datetime.year, equals(2021));
      expect(datetime.month, equals(8));
      expect(datetime.day, equals(9));
      expect(datetime.hour, equals(13));
      expect(datetime.minute, equals(31));
      expect(datetime.second, equals(09));
      expect(datetime.millisecond, equals(975));
      expect(datetime.microsecond, equals(727));
    });
    test('fromDartDateTimeToGraphQLTimestamptz', () {
      final timestamptz = fromDartDateTimeToGraphQLTimestamptz(
          fromGraphQLTimestamptzToDartDateTime(
              '2021-08-09T13:31:09.975727+00:00'));
      expect(
          timestamptz,
          equals(
              '2021-08-09T13:31:09.000000+00:00')); // Units under minute are deleted as 0.
    });
  });
}
