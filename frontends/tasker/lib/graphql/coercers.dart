import 'package:intl/intl.dart';
import 'package:flutter/material.dart';

// REF(DateFormat): https://pub.dev/documentation/intl/latest/intl/DateFormat-class.html

// Date

DateTime fromGraphQLDateToDartDateTime(String date) => DateTime.parse(date);
DateTime? fromGraphQLDateNullableToDartDateTimeNullable(String? date) =>
    date == null ? null : fromGraphQLDateToDartDateTime(date);

String? fromDartDateTimeToGraphQLDate(DateTime datetime) {
  final formatter = DateFormat('yyyy-MM-dd');
  return formatter.format(datetime);
}

String? fromDartDateTimeNullableToGraphQLDateNullable(DateTime? datetime) =>
    datetime == null ? null : fromDartDateTimeToGraphQLDate(datetime);

// Timetz

TimeOfDay fromGraphQLTimetzToDartTimeOfDay(String timetz) =>
    TimeOfDay.fromDateTime(DateTime.parse('1970-01-01T$timetz'));

TimeOfDay? fromGraphQLTimetzNullableToDartTimeOfDayNullable(String? timetz) =>
    timetz == null ? null : fromGraphQLTimetzToDartTimeOfDay(timetz);

String fromDartTimeOfDayToGraphQLTimetz(TimeOfDay timeOfDay) {
  final datetime = DateTime(1970, 1, 1, timeOfDay.hour, timeOfDay.minute);
  final formatter = DateFormat.Hms();
  return '${formatter.format(datetime)}+00';
}

String? fromDartTimeOfDayNullableToGraphQLTimetzNullable(
        TimeOfDay? timeOfDay) =>
    timeOfDay == null ? null : fromDartTimeOfDayToGraphQLTimetz(timeOfDay);

// Timestamptz

DateTime fromGraphQLTimestamptzToDartDateTime(String timestamptz) =>
    DateTime.parse(timestamptz);

String fromDartDateTimeToGraphQLTimestamptz(DateTime datetime) {
  final formatter = DateFormat('yyyy-MM-ddTHH:mm:ss.000000+00:00');
  return formatter.format(datetime);
}
