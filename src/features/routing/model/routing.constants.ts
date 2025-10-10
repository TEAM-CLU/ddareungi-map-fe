export const ROUTE_CONSTANTS = {
  MAX_WAYPOINTS: 3,
  DEFAULT_WAYPOINT_ID_PREFIX: 'waypoint-',
  DEFAULT_PLACEHOLDERS: {
    START: '출발지',
    END: '도착지',
    WAYPOINT: '경유지',
  },
  DEFAULT_ROUTE_POINT_IDS: {
    START: 'start',
    END: 'end',
  },
} as const;

export const ROUTE_POINT_TYPES = {
  START: 'start',
  WAYPOINT: 'waypoint',
  END: 'end',
} as const;
