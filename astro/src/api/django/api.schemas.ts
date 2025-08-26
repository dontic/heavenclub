// @ts-nocheck
/**
 * Serializer for Contact model
 */
export interface Contact {
  /** @maxLength 255 */
  name: string;
  /** @maxLength 254 */
  email: string;
  /** @maxLength 50 */
  phone?: string;
  message: string;
}

/**
 * Serializer for Contact model
 */
export interface ContactRequest {
  /**
   * @minLength 1
   * @maxLength 255
   */
  name: string;
  /**
   * @minLength 1
   * @maxLength 254
   */
  email: string;
  /** @maxLength 50 */
  phone?: string;
  /** @minLength 1 */
  message: string;
}

export interface EcowittObservation {
  /** @maxLength 64 */
  stationtype: string;
  /**
   * @minimum -9223372036854776000
   * @maximum 9223372036854776000
   */
  runtime: number;
  /**
   * @minimum -9223372036854776000
   * @maximum 9223372036854776000
   */
  heap: number;
  dateutc: string;
  tempinf: number;
  /**
   * @minimum -2147483648
   * @maximum 2147483647
   */
  humidityin: number;
  baromrelin: number;
  baromabsin: number;
  tempf: number;
  /**
   * @minimum -2147483648
   * @maximum 2147483647
   */
  humidity: number;
  /**
   * @minimum -2147483648
   * @maximum 2147483647
   */
  winddir: number;
  windspeedmph: number;
  windgustmph: number;
  maxdailygust: number;
  solarradiation: number;
  /**
   * @minimum -2147483648
   * @maximum 2147483647
   */
  uv: number;
  rainratein: number;
  eventrainin: number;
  hourlyrainin: number;
  dailyrainin: number;
  weeklyrainin: number;
  monthlyrainin: number;
  yearlyrainin: number;
  totalrainin: number;
  /** @maxLength 16 */
  wh65batt: string;
  /** @maxLength 16 */
  freq: string;
  /** @maxLength 64 */
  model: string;
  /**
   * @minimum -2147483648
   * @maximum 2147483647
   */
  interval: number;
}

export interface EcowittObservationRequest {
  /**
   * @minLength 1
   * @maxLength 64
   */
  stationtype: string;
  /**
   * @minimum -9223372036854776000
   * @maximum 9223372036854776000
   */
  runtime: number;
  /**
   * @minimum -9223372036854776000
   * @maximum 9223372036854776000
   */
  heap: number;
  dateutc: string;
  tempinf: number;
  /**
   * @minimum -2147483648
   * @maximum 2147483647
   */
  humidityin: number;
  baromrelin: number;
  baromabsin: number;
  tempf: number;
  /**
   * @minimum -2147483648
   * @maximum 2147483647
   */
  humidity: number;
  /**
   * @minimum -2147483648
   * @maximum 2147483647
   */
  winddir: number;
  windspeedmph: number;
  windgustmph: number;
  maxdailygust: number;
  solarradiation: number;
  /**
   * @minimum -2147483648
   * @maximum 2147483647
   */
  uv: number;
  rainratein: number;
  eventrainin: number;
  hourlyrainin: number;
  dailyrainin: number;
  weeklyrainin: number;
  monthlyrainin: number;
  yearlyrainin: number;
  totalrainin: number;
  /**
   * @minLength 1
   * @maxLength 16
   */
  wh65batt: string;
  /**
   * @minLength 1
   * @maxLength 16
   */
  freq: string;
  /**
   * @minLength 1
   * @maxLength 64
   */
  model: string;
  /**
   * @minimum -2147483648
   * @maximum 2147483647
   */
  interval: number;
}

/**
 * Serializer for creating users (replacing invitation creation)
 */
export interface UserCreate {
  email: string;
  send_email?: boolean;
}

/**
 * Serializer for creating users (replacing invitation creation)
 */
export interface UserCreateRequest {
  /** @minLength 1 */
  email: string;
  send_email?: boolean;
}

/**
 * Serializer for listing users
 */
export interface UserList {
  readonly email: string;
  /** @nullable */
  readonly last_accessed: string | null;
  readonly created_at: string;
}

export type EcowittHistoryListParams = {
  /**
   * End datetime (inclusive)
   */
  end: string;
  /**
   * Start datetime (inclusive)
   */
  start: string;
};
