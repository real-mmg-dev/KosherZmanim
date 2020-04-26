import { DateTime } from 'luxon';
import * as numeral from 'numeral';

import { TimeZone, Utils } from '../polyfills/Utils';
import { Time } from './Time';
import { AstronomicalCalendar } from '../AstronomicalCalendar';
import { ZmanimCalendar } from '../ZmanimCalendar';
import { ComplexZmanimCalendar } from '../ComplexZmanimCalendar';
import { Zman, ZmanWithDuration, ZmanWithZmanDate } from './Zman';
import { UnsupportedError } from '../polyfills/errors';

const methodNamesToExclude: string[] = [
  'getAdjustedDate',
  'getDate',
  'getElevationAdjustedSunrise',
  'getElevationAdjustedSunset',
  'getMidnightLastNight',
  'getMidnightTonight',
  'getSunriseBaalHatanya',
  'getSunsetBaalHatanya',
];

/**
 * A class used to format both non {@link java.util.Date} times generated by the Zmanim package as well as Dates. For
 * example the {@link net.sourceforge.zmanim.AstronomicalCalendar#getTemporalHour()} returns the length of the hour in
 * milliseconds. This class can format this time.
 *
 * @author &copy; Eliyahu Hershfeld 2004 - 2019
 * @version 1.2
 */
export class ZmanimFormatter {
  private prependZeroHours: boolean = false;

  private useSeconds: boolean = false;

  private useMillis: boolean = false;

  private static readonly minuteSecondNF: string = '00';

  private hourNF!: string;

  private static readonly milliNF: string = '000';

  private dateFormat!: string;

  private timeZoneId!: string; // TimeZone.getTimeZone("UTC");

  /**
   * @return the timeZone
   */
  public getTimeZone(): string {
    return this.timeZoneId;
  }

  /**
   * @param timeZoneId
   *            the timeZone to set
   */
  public setTimeZone(timeZoneId: string): void {
    this.timeZoneId = timeZoneId;
  }

  /**
   * Format using hours, minutes, seconds and milliseconds using the xsd:time format. This format will return
   * 00.00.00.0 when formatting 0.
   */
  public static readonly SEXAGESIMAL_XSD_FORMAT: number = 0;

  private timeFormat: number = ZmanimFormatter.SEXAGESIMAL_XSD_FORMAT;

  /**
   * Format using standard decimal format with 5 positions after the decimal.
   */
  public static readonly DECIMAL_FORMAT: number = 1;

  /** Format using hours and minutes. */
  public static readonly SEXAGESIMAL_FORMAT: number = 2;

  /** Format using hours, minutes and seconds. */
  public static readonly SEXAGESIMAL_SECONDS_FORMAT: number = 3;

  /** Format using hours, minutes, seconds and milliseconds. */
  public static readonly SEXAGESIMAL_MILLIS_FORMAT: number = 4;

  /** constant for milliseconds in a minute (60,000) */
  public static readonly MINUTE_MILLIS: number = 60 * 1000;

  /** constant for milliseconds in an hour (3,600,000) */
  public static readonly HOUR_MILLIS: number = ZmanimFormatter.MINUTE_MILLIS * 60;

  /**
   * Format using the XSD Duration format. This is in the format of PT1H6M7.869S (P for period (duration), T for time,
   * H, M and S indicate hours, minutes and seconds.
   */
  public static readonly XSD_DURATION_FORMAT: number = 5;

  public static readonly XSD_DATE_FORMAT = 'yyyy-LL-dd\'T\'HH:mm:ss';

  /**
   * constructor that defaults to this will use the format "h:mm:ss" for dates and 00.00.00.0 for {@link Time}.
   * @param timeZone the TimeZone Object
   */
  /*
      public ZmanimFormatter(timeZone: TimeZone) {
          this(0, new SimpleDateFormat("h:mm:ss"), timeZone);
      }
  */

  // public ZmanimFormatter() {
  // this(0, new SimpleDateFormat("h:mm:ss"), TimeZone.getTimeZone("UTC"));
  // }

  /**
   * ZmanimFormatter constructor using a formatter
   *
   * @param format
   *            int The formatting style to use. Using ZmanimFormatter.SEXAGESIMAL_SECONDS_FORMAT will format the time
   *            time of 90*60*1000 + 1 as 1:30:00
   * @param dateFormat the SimpleDateFormat Object
   * @param timeZone the TimeZone Object
   */
  constructor(timeZoneId: string)
  constructor(format: number, dateFormat: string, timeZoneId: string)
  constructor(formatOrTimeZone: number | string, dateFormat?: string, timeZoneId?: string) {
    let format: number;
    if (dateFormat) {
      format = formatOrTimeZone as number;
    } else {
      format = 0;
      dateFormat = 'h:mm:ss';
      timeZoneId = formatOrTimeZone as string;
    }

    this.setTimeZone(timeZoneId!);

    if (this.prependZeroHours) {
      this.hourNF = '00';
    }

    this.setTimeFormat(format);
    this.setDateFormat(dateFormat);
  }

  /**
   * Sets the format to use for formatting.
   *
   * @param format
   *            int the format constant to use.
   */
  public setTimeFormat(format: number): void {
    this.timeFormat = format;
    switch (format) {
      case ZmanimFormatter.SEXAGESIMAL_XSD_FORMAT:
        this.setSettings(true, true, true);
        break;
      case ZmanimFormatter.SEXAGESIMAL_FORMAT:
        this.setSettings(false, false, false);
        break;
      case ZmanimFormatter.SEXAGESIMAL_SECONDS_FORMAT:
        this.setSettings(false, true, false);
        break;
      case ZmanimFormatter.SEXAGESIMAL_MILLIS_FORMAT:
        this.setSettings(false, true, true);
        break;
      // case DECIMAL_FORMAT:
      // default:
    }
  }

  /**
   * Sets the SimpleDateFormat Object
   * @param dateFormat the SimpleDateFormat Object to set
   */
  public setDateFormat(dateFormat: string): void {
    this.dateFormat = dateFormat;
  }

  /**
   * returns the SimpleDateFormat Object
   * @return the SimpleDateFormat Object
   */
  public getDateFormat(): string {
    return this.dateFormat;
  }

  private setSettings(prependZeroHours: boolean, useSeconds: boolean, useMillis: boolean): void {
    this.prependZeroHours = prependZeroHours;
    this.useSeconds = useSeconds;
    this.useMillis = useMillis;
  }

  /**
   * A method that formats milliseconds into a time format.
   *
   * @param milliseconds
   *            The time in milliseconds.
   * @return String The formatted <code>String</code>
   */
  /*
      public format(milliseconds: number): string {
          return this.format(milliseconds);
      }
  */

  /**
   * A method that formats milliseconds into a time format.
   *
   * @param millis
   *            The time in milliseconds.
   * @return String The formatted <code>String</code>
   */

  /*
      public format(millis: number): string {
          return format(new Time(millis));
      }
  */

  /**
   * A method that formats {@link Time}objects.
   *
   * @param time
   *            The time <code>Object</code> to be formatted.
   * @return String The formatted <code>String</code>
   */
  public format(timeOrMillis: Time | number): string {
    let time: Time;
    if (timeOrMillis instanceof Time) {
      time = timeOrMillis as Time;
    } else {
      time = new Time(timeOrMillis as number);
    }

    if (this.timeFormat === ZmanimFormatter.XSD_DURATION_FORMAT) {
      return ZmanimFormatter.formatXSDDurationTime(time);
    }
    let sb: string = (numeral(time.getHours()).format(this.hourNF)).concat(':')
      .concat(numeral(time.getMinutes()).format(ZmanimFormatter.minuteSecondNF).toString());
    if (this.useSeconds) {
      sb = sb.concat(':').concat(numeral(time.getSeconds()).format(ZmanimFormatter.minuteSecondNF).toString());
    }
    if (this.useMillis) {
      sb = sb.concat('.').concat(numeral(time.getMilliseconds()).format(ZmanimFormatter.milliNF).toString());
    }
    return sb;
  }

  /**
   * Formats a date using this class's {@link #getDateFormat() date format}.
   *
   * @param dateTime - the date to format
   * @return the formatted String
   */
  public formatDateTime(dateTime: DateTime): string {
    const _dateTime = dateTime.setZone(this.getTimeZone());

    if (this.dateFormat === ZmanimFormatter.XSD_DATE_FORMAT) {
      return this.getXSDateTime(_dateTime);
    }
    return _dateTime.toFormat(this.dateFormat);
  }

  /**
   * The date:date-time function returns the current date and time as a date/time string. The date/time string that's
   * returned must be a string in the format defined as the lexical representation of xs:dateTime in <a
   * href="http://www.w3.org/TR/xmlschema11-2/#dateTime">[3.3.8 dateTime]</a> of <a
   * href="http://www.w3.org/TR/xmlschema11-2/">[XML Schema 1.1 Part 2: Datatypes]</a>. The date/time format is
   * basically CCYY-MM-DDThh:mm:ss, although implementers should consult <a
   * href="http://www.w3.org/TR/xmlschema11-2/">[XML Schema 1.1 Part 2: Datatypes]</a> and <a
   * href="http://www.iso.ch/markete/8601.pdf">[ISO 8601]</a> for details. The date/time string format must include a
   * time zone, either a Z to indicate Coordinated Universal Time or a + or - followed by the difference between the
   * difference from UTC represented as hh:mm.
   * @param dateTime - the UTC Date Object
   * @return the XSD dateTime
   */
  public getXSDateTime(dateTime: DateTime): string {
    return dateTime.setZone(this.getTimeZone())
      .toFormat(ZmanimFormatter.XSD_DATE_FORMAT.concat('ZZ'));
  }

  /**
   * Represent the hours and minutes with two-digit strings.
   *
   * @param digits
   *            hours or minutes.
   * @return two-digit String representation of hrs or minutes.
   */
  private static formatDigits(digits: number): string {
    const dd: string = Math.abs(digits).toString();
    return dd.length === 1 ? `0${dd}` : dd;
  }

  /**
   * This returns the xml representation of an xsd:duration object.
   *
   * @param millis
   *            the duration in milliseconds
   * @return the xsd:duration formatted String
   */

  /*
      public formatXSDDurationTime(millis: number): string {
          return formatXSDDurationTime(new Time(millis));
      }
  */

  /**
   * This returns the xml representation of an xsd:duration object.
   *
   * @param time
   *            the duration as a Time object
   * @return the xsd:duration formatted String
   */
  public static formatXSDDurationTime(timeOrMillis: Time | number): string {
    let time: Time;
    if (timeOrMillis instanceof Time) {
      time = timeOrMillis as Time;
    } else {
      time = new Time(timeOrMillis as number);
    }

    let duration: string;
    if (time.getHours() !== 0 || time.getMinutes() !== 0 || time.getSeconds() !== 0 || time.getMilliseconds() !== 0) {
      duration = ('P').concat('T');

      if (time.getHours() !== 0) duration = duration.concat(`${time.getHours()}H`);

      if (time.getMinutes() !== 0) duration = duration.concat(`${time.getMinutes()}M`);

      if (time.getSeconds() !== 0 || time.getMilliseconds() !== 0) {
        duration = duration.concat(`${time.getSeconds()}.${numeral(time.getMilliseconds()).format(ZmanimFormatter.milliNF)}`);
        duration = duration.concat('S');
      }

      if (duration.length === 1) duration.concat('T0S'); // zero seconds

      if (time.isNegative()) {
        duration = duration.substr(0, 0).concat('-').concat(duration.substr(0, duration.length));
      }
    }
    return duration!.toString();
  }

  public static formatDecimal(num: number): string {
    return num - Math.trunc(num) > 0 ? num.toString() : numeral(num).format('0.0');
  }

  /**
   * A method that returns an XML formatted <code>String</code> representing the serialized <code>Object</code>. The
   * format used is:
   *
   * <pre>
   *  &lt;AstronomicalTimes date=&quot;1969-02-08&quot; type=&quot;net.sourceforge.zmanim.AstronomicalCalendar algorithm=&quot;US Naval Almanac Algorithm&quot; location=&quot;Lakewood, NJ&quot; latitude=&quot;40.095965&quot; longitude=&quot;-74.22213&quot; elevation=&quot;31.0&quot; timeZoneName=&quot;Eastern Standard Time&quot; timeZoneID=&quot;America/New_York&quot; timeZoneOffset=&quot;-5&quot;&gt;
   *     &lt;Sunrise&gt;2007-02-18T06:45:27-05:00&lt;/Sunrise&gt;
   *     &lt;TemporalHour&gt;PT54M17.529S&lt;/TemporalHour&gt;
   *     ...
   *   &lt;/AstronomicalTimes&gt;
   * </pre>
   *
   * Note that the output uses the <a href="http://www.w3.org/TR/xmlschema11-2/#dateTime">xsd:dateTime</a> format for
   * times such as sunrise, and <a href="http://www.w3.org/TR/xmlschema11-2/#duration">xsd:duration</a> format for
   * times that are a duration such as the length of a
   * {@link net.sourceforge.zmanim.AstronomicalCalendar#getTemporalHour() temporal hour}. The output of this method is
   * returned by the {@link #toString() toString}.
   *
   * @param astronomicalCalendar the AstronomicalCalendar Object
   *
   * @return The XML formatted <code>String</code>. The format will be:
   *
   *         <pre>
   *  &lt;AstronomicalTimes date=&quot;1969-02-08&quot; type=&quot;net.sourceforge.zmanim.AstronomicalCalendar algorithm=&quot;US Naval Almanac Algorithm&quot; location=&quot;Lakewood, NJ&quot; latitude=&quot;40.095965&quot; longitude=&quot;-74.22213&quot; elevation=&quot;31.0&quot; timeZoneName=&quot;Eastern Standard Time&quot; timeZoneID=&quot;America/New_York&quot; timeZoneOffset=&quot;-5&quot;&gt;
   *     &lt;Sunrise&gt;2007-02-18T06:45:27-05:00&lt;/Sunrise&gt;
   *     &lt;TemporalHour&gt;PT54M17.529S&lt;/TemporalHour&gt;
   *     ...
   *  &lt;/AstronomicalTimes&gt;
   * </pre>
   *
   *         TODO: add proper schema, and support for nulls. XSD duration (for solar hours), should probably return
   *         nil and not P
   * @deprecated
   */
  public static toXML(): void {
    throw new UnsupportedError('This method is not supported.');
  }

  /**
   * A method that returns a JSON formatted <code>String</code> representing the serialized <code>Object</code>. The
   * format used is:
   * <pre>
   * {
   *    &quot;metadata&quot;:{
   *      &quot;date&quot;:&quot;1969-02-08&quot;,
   *      &quot;type&quot;:&quot;net.sourceforge.zmanim.AstronomicalCalendar&quot;,
   *      &quot;algorithm&quot;:&quot;US Naval Almanac Algorithm&quot;,
   *      &quot;location&quot;:&quot;Lakewood, NJ&quot;,
   *      &quot;latitude&quot;:&quot;40.095965&quot;,
   *      &quot;longitude&quot;:&quot;-74.22213&quot;,
   *      &quot;elevation:&quot;31.0&quot;,
   *      &quot;timeZoneName&quot;:&quot;Eastern Standard Time&quot;,
   *      &quot;timeZoneID&quot;:&quot;America/New_York&quot;,
   *      &quot;timeZoneOffset&quot;:&quot;-5&quot;},
   *    &quot;AstronomicalTimes&quot;:{
   *     &quot;Sunrise&quot;:&quot;2007-02-18T06:45:27-05:00&quot;,
   *     &quot;TemporalHour&quot;:&quot;PT54M17.529S&quot;
   *     ...
   *     }
   * }
   * </pre>
   *
   * Note that the output uses the <a href="http://www.w3.org/TR/xmlschema11-2/#dateTime">xsd:dateTime</a> format for
   * times such as sunrise, and <a href="http://www.w3.org/TR/xmlschema11-2/#duration">xsd:duration</a> format for
   * times that are a duration such as the length of a
   * {@link net.sourceforge.zmanim.AstronomicalCalendar#getTemporalHour() temporal hour}.
   *
   * @param astronomicalCalendar the AstronomicalCalendar Object
   *
   * @return The JSON formatted <code>String</code>. The format will be:
   * <pre>
   * {
   *    &quot;metadata&quot;:{
   *      &quot;date&quot;:&quot;1969-02-08&quot;,
   *      &quot;type&quot;:&quot;net.sourceforge.zmanim.AstronomicalCalendar&quot;,
   *      &quot;algorithm&quot;:&quot;US Naval Almanac Algorithm&quot;,
   *      &quot;location&quot;:&quot;Lakewood, NJ&quot;,
   *      &quot;latitude&quot;:&quot;40.095965&quot;,
   *      &quot;longitude&quot;:&quot;-74.22213&quot;,
   *      &quot;elevation:&quot;31.0&quot;,
   *      &quot;timeZoneName&quot;:&quot;Eastern Standard Time&quot;,
   *      &quot;timeZoneID&quot;:&quot;America/New_York&quot;,
   *      &quot;timeZoneOffset&quot;:&quot;-5&quot;},
   *    &quot;AstronomicalTimes&quot;:{
   *     &quot;Sunrise&quot;:&quot;2007-02-18T06:45:27-05:00&quot;,
   *     &quot;TemporalHour&quot;:&quot;PT54M17.529S&quot;
   *     ...
   *     }
   * }
   * </pre>
   */
  public static toJSON(astronomicalCalendar: AstronomicalCalendar): JsonOutput {
    const json: JsonOutput = {
      metadata: ZmanimFormatter.getOutputMetadata(astronomicalCalendar),
    };
    const key: string = ZmanimFormatter.getOutputKey(astronomicalCalendar);
    json[key] = ZmanimFormatter.getZmanimOutput(astronomicalCalendar);

    return json;
  }

  // @ts-ignore
  private static getOutputKey(astronomicalCalendar: AstronomicalCalendar): string {
    switch (true) {
      case astronomicalCalendar instanceof ComplexZmanimCalendar:
        return 'Zmanim';
      case astronomicalCalendar instanceof ZmanimCalendar:
        return 'BasicZmanim';
      case astronomicalCalendar instanceof AstronomicalCalendar:
        return 'AstronomicalTimes';
    }
  }

  private static getOutputMetadata(astronomicalCalendar: AstronomicalCalendar): OutputMetadata {
    const df: string = 'yyyy-MM-dd';

    return {
      date: astronomicalCalendar.getDate().toFormat(df),
      type: astronomicalCalendar.getClassName(),
      algorithm: astronomicalCalendar.getAstronomicalCalculator().getCalculatorName(),
      location: astronomicalCalendar.getGeoLocation().getLocationName(),
      latitude: astronomicalCalendar.getGeoLocation().getLatitude().toString(),
      longitude: astronomicalCalendar.getGeoLocation().getLongitude().toString(),
      elevation: ZmanimFormatter.formatDecimal(astronomicalCalendar.getGeoLocation().getElevation()),
      timeZoneName: TimeZone.getDisplayName(astronomicalCalendar.getGeoLocation().getTimeZone(), astronomicalCalendar.getDate()),
      timeZoneID: astronomicalCalendar.getGeoLocation().getTimeZone(),
      timeZoneOffset: ZmanimFormatter.formatDecimal(TimeZone.getOffset(astronomicalCalendar.getGeoLocation().getTimeZone(),
        astronomicalCalendar.getDate().valueOf()) / ZmanimFormatter.HOUR_MILLIS),
    };
  }

  private static getZmanimOutput(astronomicalCalendar: AstronomicalCalendar): Record<string, string> {
    const formatter: ZmanimFormatter = new ZmanimFormatter(ZmanimFormatter.XSD_DURATION_FORMAT, ZmanimFormatter.XSD_DATE_FORMAT,
      astronomicalCalendar.getGeoLocation().getTimeZone());

    /*
        let dateList: Set<Date> = new Set();
        let durationList: Set<number> = new Set();
    */
    const dateList: ZmanWithZmanDate[] = [];
    let durationList: ZmanWithDuration[] = [];
    const otherList: string[] = [];

    // Get al the methods in the calendar
    Utils.getAllMethodNames(astronomicalCalendar, true)
      // Filter out methods that we don't want
      .filter(method => includeMethod(method, astronomicalCalendar))
      // Call each method and get the return values
      .map(method => ({
        methodName: method,
        value: (astronomicalCalendar as any as Record<string, Function>)[method].call(astronomicalCalendar),
      }))
      // Filter for return values of type Date or number
      .filter(methodObj => DateTime.isDateTime(methodObj.value) || typeof methodObj.value === 'number' || methodObj.value === null)
      // Separate the Dates and numbers
      .forEach(methodObj => {
        const tagName: string = methodObj.methodName.substring(3);
        if (DateTime.isDateTime(methodObj.value)) {
          // dateList.add(new KosherZmanim.Zman(methodObj.value, tagName));
          const zman: ZmanWithZmanDate = {
            zman: methodObj.value as DateTime,
            zmanLabel: tagName,
          };
          dateList.push(zman);
        } else if (typeof methodObj.value === 'number') {
          // durationList.add(new KosherZmanim.Zman(methodObj.value, tagName));
          const zman: ZmanWithDuration = {
            duration: methodObj.value,
            zmanLabel: tagName,
          };
          durationList.push(zman);
        } else {
          otherList.push(tagName);
        }
      });

    dateList.sort(Zman.compareDateOrder);
    // Filter for values in milliseconds, and not values in minutes
    durationList = durationList.filter((zman: ZmanWithDuration) => zman.duration > 1000)
      .sort(Zman.compareDurationOrder);

    const timesData: Record<string, string> = {};
    dateList.forEach((zman: ZmanWithZmanDate) => {
      timesData[zman.zmanLabel as string] = formatter.formatDateTime(zman.zman);
    });
    durationList.forEach((zman: ZmanWithDuration) => {
      timesData[zman.zmanLabel as string] = formatter.format(Math.trunc(zman.duration));
    });
    otherList.forEach((tagName: string) => {
      timesData[tagName] = 'N/A';
    });

    return timesData;
  }
}

/**
 * Determines if a method should be output by the {@link #toJSON(AstronomicalCalendar)}
 *
 * @param {string} method - the method in question
 * @param {AstronomicalCalendar} astronomicalCalendar - The astronomical calendar, to be able to
 * check the parameterlist
 * @return if the method should be included in serialization
 */
function includeMethod(method: string, astronomicalCalendar: AstronomicalCalendar): boolean {
  // Filter out methods with parameters
  return (astronomicalCalendar as any as Record<string, Function>)[method].length === 0 &&
    // Filter out methods that don't start with "get"
    method.startsWith('get') &&
    // Filter out excluded methods
    !methodNamesToExclude.includes(method);
}

export interface JsonOutput {
  metadata: OutputMetadata

  [key: string]: object;
}

export interface OutputMetadata {
  date: string;
  type: string;
  algorithm: string;
  location: string | null;
  latitude: string;
  longitude: string;
  elevation: string;
  timeZoneName: string;
  timeZoneID: string;
  timeZoneOffset: string;
}
