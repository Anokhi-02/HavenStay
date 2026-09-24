import { RoomOption, RoomType } from '../types';

export interface CsvValidationError {
  rowNumber: number;
  field: string;
  value: string;
  message: string;
}

export interface CsvValidationWarning {
  rowNumber: number;
  field: string;
  message: string;
}

export interface ParsedCsvRow {
  rowNumber: number;
  raw: Record<string, string>;
  data?: RoomOption;
  isValid: boolean;
  errors: CsvValidationError[];
  warnings: CsvValidationWarning[];
}

export interface CsvParseResult {
  fileName: string;
  totalRows: number;
  validRows: RoomOption[];
  parsedRows: ParsedCsvRow[];
  errors: CsvValidationError[];
  warnings: CsvValidationWarning[];
  missingHeaders: string[];
  headersFound: string[];
  isValid: boolean;
}

const REQUIRED_HEADERS = ['type', 'name', 'price', 'totalBeds', 'availableBeds'] as const;

// Accepted column aliases (case-insensitive)
const HEADER_ALIASES: Record<string, string[]> = {
  type: ['type', 'roomtype', 'room_type', 'sharing', 'sharingtype', 'sharing_type', 'room_category'],
  name: ['name', 'roomname', 'room_name', 'title', 'roomtitle', 'room_title', 'tier_name'],
  price: ['price', 'rent', 'monthlyrent', 'monthly_rent', 'rate', 'tariff', 'amount'],
  securityDeposit: ['securitydeposit', 'security_deposit', 'deposit', 'security_amt', 'deposit_amount'],
  totalBeds: ['totalbeds', 'total_beds', 'totalbed', 'total_bed', 'beds', 'total_capacity', 'capacity'],
  availableBeds: ['availablebeds', 'available_beds', 'vacantbeds', 'vacant_beds', 'vacant', 'available'],
  features: ['features', 'amenities', 'facilities', 'perks', 'services'],
};

const VALID_ROOM_TYPES: Record<string, RoomType> = {
  single: 'single',
  '1': 'single',
  'single sharing': 'single',
  'single room': 'single',
  'single_sharing': 'single',
  '1 sharing': 'single',
  
  double: 'double',
  '2': 'double',
  'double sharing': 'double',
  'double room': 'double',
  'double_sharing': 'double',
  '2 sharing': 'double',
  twin: 'double',

  triple: 'triple',
  '3': 'triple',
  'triple sharing': 'triple',
  'triple room': 'triple',
  'triple_sharing': 'triple',
  '3 sharing': 'triple',

  four_sharing: 'four_sharing',
  four: 'four_sharing',
  '4': 'four_sharing',
  'four sharing': 'four_sharing',
  'four_sharing room': 'four_sharing',
  '4 sharing': 'four_sharing',
  quad: 'four_sharing',
  quadruple: 'four_sharing',
};

/**
 * Parses raw CSV string handling quotes, commas within quotes, and CRLF
 */
export function parseRawCsv(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;

  // Clean BOM if present
  const text = csvText.charCodeAt(0) === 0xfeff ? csvText.slice(1) : csvText;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // Skip \n in \r\n
      }
      currentRow.push(currentCell.trim());
      // Avoid pushing blank empty trailing rows
      if (currentRow.some((cell) => cell.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  // Push last remaining cell and row
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((cell) => cell.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Maps raw header text to normalized canonical keys
 */
function normalizeHeaders(rawHeaders: string[]): {
  normalizedMap: Record<string, string>; // normalized canonical key -> raw header name
  headerIndexMap: Record<string, number>; // normalized canonical key -> column index
  rawHeaders: string[];
} {
  const normalizedMap: Record<string, string> = {};
  const headerIndexMap: Record<string, number> = {};

  rawHeaders.forEach((header, index) => {
    const cleaned = header.toLowerCase().replace(/[^a-z0-9_]/g, '');
    for (const [canonical, aliases] of Object.entries(HEADER_ALIASES)) {
      if (aliases.includes(cleaned)) {
        normalizedMap[canonical] = header;
        headerIndexMap[canonical] = index;
        break;
      }
    }
  });

  return { normalizedMap, headerIndexMap, rawHeaders };
}

/**
 * Validates and parses CSV text for Room Details & Pricing
 */
export function validateAndParseRoomCsv(csvContent: string, fileName = 'rooms.csv'): CsvParseResult {
  const result: CsvParseResult = {
    fileName,
    totalRows: 0,
    validRows: [],
    parsedRows: [],
    errors: [],
    warnings: [],
    missingHeaders: [],
    headersFound: [],
    isValid: false,
  };

  const rawRows = parseRawCsv(csvContent);

  if (rawRows.length === 0) {
    result.errors.push({
      rowNumber: 0,
      field: 'file',
      value: '',
      message: 'The uploaded CSV file is empty. Please provide a file with valid room data.',
    });
    return result;
  }

  const rawHeaders = rawRows[0];
  const { normalizedMap, headerIndexMap } = normalizeHeaders(rawHeaders);
  result.headersFound = rawHeaders;

  // Check required headers
  const missingHeaders: string[] = [];
  for (const req of REQUIRED_HEADERS) {
    if (headerIndexMap[req] === undefined) {
      missingHeaders.push(req);
    }
  }

  if (missingHeaders.length > 0) {
    result.missingHeaders = missingHeaders;
    result.errors.push({
      rowNumber: 1,
      field: 'headers',
      value: missingHeaders.join(', '),
      message: `Missing required column headers: ${missingHeaders.join(', ')}. Please refer to the template.`,
    });
    return result;
  }

  // Parse each row
  const dataRows = rawRows.slice(1);
  result.totalRows = dataRows.length;

  if (dataRows.length === 0) {
    result.errors.push({
      rowNumber: 1,
      field: 'data',
      value: '',
      message: 'The CSV has header columns but does not contain any room rows.',
    });
    return result;
  }

  dataRows.forEach((row, idx) => {
    const rowNumber = idx + 2; // 1-based index (Header is row 1)
    const rowErrors: CsvValidationError[] = [];
    const rowWarnings: CsvValidationWarning[] = [];

    const getCellValue = (canonicalKey: string): string => {
      const colIdx = headerIndexMap[canonicalKey];
      if (colIdx === undefined || colIdx >= row.length) return '';
      return (row[colIdx] || '').trim();
    };

    const rawObject: Record<string, string> = {};
    rawHeaders.forEach((h, colIdx) => {
      rawObject[h] = row[colIdx] || '';
    });

    const rawType = getCellValue('type');
    const rawName = getCellValue('name');
    const rawPrice = getCellValue('price');
    const rawDeposit = getCellValue('securityDeposit');
    const rawTotalBeds = getCellValue('totalBeds');
    const rawAvailBeds = getCellValue('availableBeds');
    const rawFeatures = getCellValue('features');

    // 1. Validate Type (Required)
    let validatedType: RoomType | undefined;
    if (!rawType) {
      rowErrors.push({
        rowNumber,
        field: 'type',
        value: '',
        message: "Room Type is required ('single', 'double', 'triple', or 'four_sharing').",
      });
    } else {
      const normalizedTypeKey = rawType.toLowerCase().replace(/[^a-z0-9_ ]/g, '').trim();
      const matched = VALID_ROOM_TYPES[normalizedTypeKey];
      if (!matched) {
        rowErrors.push({
          rowNumber,
          field: 'type',
          value: rawType,
          message: `Invalid room type '${rawType}'. Must be one of: single, double, triple, four_sharing.`,
        });
      } else {
        validatedType = matched;
      }
    }

    // 2. Validate Name (Required)
    if (!rawName) {
      rowErrors.push({
        rowNumber,
        field: 'name',
        value: '',
        message: "Room Name is required (e.g. 'Executive Single Room').",
      });
    } else if (rawName.length < 2) {
      rowErrors.push({
        rowNumber,
        field: 'name',
        value: rawName,
        message: 'Room Name is too short (minimum 2 characters).',
      });
    }

    // 3. Validate Price (Required, number > 0)
    let validatedPrice = 0;
    if (!rawPrice) {
      rowErrors.push({
        rowNumber,
        field: 'price',
        value: '',
        message: 'Monthly Rent / Price is required.',
      });
    } else {
      const cleanedPrice = rawPrice.replace(/[₹,$\s]/g, '');
      const parsedNum = Number(cleanedPrice);
      if (isNaN(parsedNum) || parsedNum <= 0) {
        rowErrors.push({
          rowNumber,
          field: 'price',
          value: rawPrice,
          message: `Invalid monthly price '${rawPrice}'. Must be a positive number greater than 0.`,
        });
      } else {
        validatedPrice = Math.round(parsedNum);
      }
    }

    // 4. Validate Total Beds (Required, integer > 0)
    let validatedTotalBeds = 0;
    if (!rawTotalBeds) {
      rowErrors.push({
        rowNumber,
        field: 'totalBeds',
        value: '',
        message: 'Total Beds is required.',
      });
    } else {
      const parsedBeds = Number(rawTotalBeds);
      if (isNaN(parsedBeds) || !Number.isInteger(parsedBeds) || parsedBeds <= 0) {
        rowErrors.push({
          rowNumber,
          field: 'totalBeds',
          value: rawTotalBeds,
          message: `Invalid total beds '${rawTotalBeds}'. Must be an integer greater than 0.`,
        });
      } else {
        validatedTotalBeds = parsedBeds;
      }
    }

    // 5. Validate Available Beds (Required, integer >= 0, <= totalBeds)
    let validatedAvailBeds = 0;
    if (rawAvailBeds === '') {
      rowErrors.push({
        rowNumber,
        field: 'availableBeds',
        value: '',
        message: 'Available Beds is required (use 0 if completely occupied).',
      });
    } else {
      const parsedAvail = Number(rawAvailBeds);
      if (isNaN(parsedAvail) || !Number.isInteger(parsedAvail) || parsedAvail < 0) {
        rowErrors.push({
          rowNumber,
          field: 'availableBeds',
          value: rawAvailBeds,
          message: `Invalid available beds '${rawAvailBeds}'. Must be 0 or a positive integer.`,
        });
      } else if (validatedTotalBeds > 0 && parsedAvail > validatedTotalBeds) {
        rowErrors.push({
          rowNumber,
          field: 'availableBeds',
          value: rawAvailBeds,
          message: `Available beds (${parsedAvail}) cannot exceed total beds (${validatedTotalBeds}).`,
        });
      } else {
        validatedAvailBeds = parsedAvail;
      }
    }

    // 6. Security Deposit (Optional, defaults to 2x price if omitted)
    let validatedDeposit = validatedPrice * 2;
    if (rawDeposit) {
      const cleanedDeposit = rawDeposit.replace(/[₹,$\s]/g, '');
      const parsedDep = Number(cleanedDeposit);
      if (isNaN(parsedDep) || parsedDep < 0) {
        rowErrors.push({
          rowNumber,
          field: 'securityDeposit',
          value: rawDeposit,
          message: `Invalid security deposit '${rawDeposit}'. Must be 0 or a positive number.`,
        });
      } else {
        validatedDeposit = Math.round(parsedDep);
      }
    } else if (validatedPrice > 0) {
      rowWarnings.push({
        rowNumber,
        field: 'securityDeposit',
        message: `Security deposit was not specified; automatically defaulted to 2x monthly rent (₹${validatedDeposit.toLocaleString('en-IN')}).`,
      });
    }

    // 7. Features (Optional, semicolon or comma separated)
    let validatedFeatures: string[] = [];
    if (rawFeatures) {
      // Split by semicolon or comma, clean and trim
      const delimiter = rawFeatures.includes(';') ? ';' : ',';
      validatedFeatures = rawFeatures
        .split(delimiter)
        .map((f) => f.trim())
        .filter((f) => f.length > 0);
    } else {
      // Default common features based on room type
      validatedFeatures = ['Attached Washroom', 'High-Speed Wi-Fi', 'Daily Housekeeping'];
    }

    // Assemble result
    const isRowValid = rowErrors.length === 0 && !!validatedType;
    let roomOptionData: RoomOption | undefined;

    if (isRowValid && validatedType) {
      roomOptionData = {
        type: validatedType,
        name: rawName,
        price: validatedPrice,
        securityDeposit: validatedDeposit,
        totalBeds: validatedTotalBeds,
        availableBeds: validatedAvailBeds,
        features: validatedFeatures,
      };
      result.validRows.push(roomOptionData);
    }

    result.parsedRows.push({
      rowNumber,
      raw: rawObject,
      data: roomOptionData,
      isValid: isRowValid,
      errors: rowErrors,
      warnings: rowWarnings,
    });

    result.errors.push(...rowErrors);
    result.warnings.push(...rowWarnings);
  });

  result.isValid = result.errors.length === 0 && result.validRows.length > 0;
  return result;
}

/**
 * Generates sample CSV string for downloading template
 */
export function generateSampleCsv(): string {
  const headers = ['type', 'name', 'price', 'securityDeposit', 'totalBeds', 'availableBeds', 'features'];
  const sampleRows = [
    ['single', 'Executive Single Studio', '14000', '28000', '6', '2', '"Attached Washroom; Air Conditioner; High-Speed Wi-Fi; Work Desk"'],
    ['double', 'Premium Double Sharing', '9500', '19000', '16', '4', '"Attached Washroom; Air Conditioner; Custom Wardrobe; High-Speed Wi-Fi"'],
    ['triple', 'Comfort Triple Sharing', '7500', '15000', '12', '3', '"Attached Washroom; High-Speed Wi-Fi; Daily Housekeeping; Balcony View"'],
    ['four_sharing', 'Economy Quad Sharing', '6000', '12000', '8', '2', '"High-Speed Wi-Fi; Daily Housekeeping; Custom Wardrobe; Water Geyser"'],
  ];

  return [headers.join(','), ...sampleRows.map((r) => r.join(','))].join('\n');
}

/**
 * Triggers browser download of sample CSV template
 */
export function downloadSampleCsv(fileName = 'havenstay_room_details_template.csv'): void {
  const content = generateSampleCsv();
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
