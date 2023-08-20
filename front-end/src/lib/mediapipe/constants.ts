interface Connection {
  start: number;
  end: number;
}

export const liteLandmarkIndexes = [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
export const liteConnections = [
	{ start: 11, end: 12 },
	{ start: 11, end: 13 },
	{ start: 11, end: 23 },
	{ start: 12, end: 24 },
	{ start: 12, end: 14 },
	{ start: 13, end: 15 },
	{ start: 14, end: 16 },
	{ start: 23, end: 24 },
	{ start: 23, end: 25 },
	{ start: 24, end: 26 },
	{ start: 25, end: 27 },
	{ start: 26, end: 28 }
] as Connection[];
