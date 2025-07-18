import { CustomError } from '@/error-handler/CustomError';
import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import {
  ActorFilter,
  AddressFilter,
  ArrayFilter,
  CurrencyFilter,
  DateFilter,
  FloatFilter,
  MultiSelectFilter,
  PhonesFilter,
  RatingFilter,
  RawJsonFilter,
  RecordGqlOperationFilter,
  RelationFilter,
  SelectFilter,
  StringFilter,
} from '@/object-record/graphql/types/RecordGqlOperationFilter';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { computeEmptyGqlOperationFilterForEmails } from '@/object-record/record-filter/utils/compute-empty-record-gql-operation-filter/for-composite-field/computeEmptyGqlOperationFilterForEmails';
import { computeEmptyGqlOperationFilterForLinks } from '@/object-record/record-filter/utils/compute-empty-record-gql-operation-filter/for-composite-field/computeEmptyGqlOperationFilterForLinks';
import { isNonEmptyString } from '@sniptt/guards';
import { ViewFilterOperand } from 'twenty-shared/src/types/ViewFilterOperand';
import { Field } from '~/generated/graphql';
import { generateILikeFiltersForCompositeFields } from '~/utils/array/generateILikeFiltersForCompositeFields';

type GetEmptyRecordGqlOperationFilterParams = {
  operand: ViewFilterOperand;
  correspondingField: Pick<Field, 'id' | 'name' | 'type'>;
  recordFilter: RecordFilter;
};

export const getEmptyRecordGqlOperationFilter = ({
  operand,
  correspondingField,
  recordFilter,
}: GetEmptyRecordGqlOperationFilterParams) => {
  let emptyRecordFilter: RecordGqlOperationFilter = {};

  const compositeFieldName = recordFilter.subFieldName;

  const isSubFieldFilter = isNonEmptyString(compositeFieldName);

  const filterType = getFilterTypeFromFieldType(correspondingField.type);

  switch (filterType) {
    case 'TEXT':
      emptyRecordFilter = {
        or: [
          { [correspondingField.name]: { ilike: '' } as StringFilter },
          { [correspondingField.name]: { is: 'NULL' } as StringFilter },
        ],
      };
      break;
    case 'PHONES': {
      if (!isSubFieldFilter) {
        emptyRecordFilter = {
          and: [
            {
              or: [
                {
                  [correspondingField.name]: {
                    primaryPhoneNumber: { is: 'NULL' },
                  } as PhonesFilter,
                },
                {
                  [correspondingField.name]: {
                    primaryPhoneNumber: { ilike: '' },
                  } as PhonesFilter,
                },
              ],
            },
            {
              or: [
                {
                  [correspondingField.name]: {
                    primaryPhoneCallingCode: { is: 'NULL' },
                  } as PhonesFilter,
                },
                {
                  [correspondingField.name]: {
                    primaryPhoneCallingCode: { ilike: '' },
                  } as PhonesFilter,
                },
              ],
            },
            {
              or: [
                {
                  [correspondingField.name]: {
                    additionalPhones: { is: 'NULL' },
                  } as PhonesFilter,
                },
                {
                  [correspondingField.name]: {
                    additionalPhones: { like: '[]' },
                  } as PhonesFilter,
                },
              ],
            },
          ],
        };
      } else {
        switch (compositeFieldName) {
          case 'primaryPhoneNumber':
          case 'primaryPhoneCallingCode': {
            emptyRecordFilter = {
              or: [
                {
                  [correspondingField.name]: {
                    [compositeFieldName]: { is: 'NULL' },
                  } as PhonesFilter,
                },
                {
                  [correspondingField.name]: {
                    [compositeFieldName]: { ilike: '' },
                  } as PhonesFilter,
                },
              ],
            };
            break;
          }
          case 'additionalPhones': {
            emptyRecordFilter = {
              or: [
                {
                  [correspondingField.name]: {
                    additionalPhones: { is: 'NULL' },
                  } as PhonesFilter,
                },
                {
                  [correspondingField.name]: {
                    additionalPhones: { like: '[]' },
                  } as PhonesFilter,
                },
              ],
            };
            break;
          }
          default: {
            throw new Error(
              `Unsupported composite field name ${compositeFieldName} for filter type ${filterType}`,
            );
          }
        }
      }
      break;
    }
    case 'CURRENCY':
      emptyRecordFilter = {
        or: [
          {
            [correspondingField.name]: {
              amountMicros: { is: 'NULL' },
            } as CurrencyFilter,
          },
        ],
      };
      break;
    case 'FULL_NAME': {
      if (!isSubFieldFilter) {
        const fullNameFilters = generateILikeFiltersForCompositeFields(
          '',
          correspondingField.name,
          ['firstName', 'lastName'],
          true,
        );

        emptyRecordFilter = {
          and: fullNameFilters,
        };
      } else {
        emptyRecordFilter = {
          or: [
            {
              [correspondingField.name]: {
                [compositeFieldName]: { ilike: '' },
              },
            },
            {
              [correspondingField.name]: {
                [compositeFieldName]: { is: 'NULL' },
              },
            },
          ],
        };
      }
      break;
    }
    case 'LINKS': {
      emptyRecordFilter = computeEmptyGqlOperationFilterForLinks({
        correspondingFieldMetadataItem: correspondingField,
        recordFilter,
      });
      break;
    }
    case 'ADDRESS':
      if (!isSubFieldFilter) {
        emptyRecordFilter = {
          and: [
            {
              or: [
                {
                  [correspondingField.name]: {
                    addressStreet1: { ilike: '' },
                  } as AddressFilter,
                },
                {
                  [correspondingField.name]: {
                    addressStreet1: { is: 'NULL' },
                  } as AddressFilter,
                },
              ],
            },
            {
              or: [
                {
                  [correspondingField.name]: {
                    addressStreet2: { ilike: '' },
                  } as AddressFilter,
                },
                {
                  [correspondingField.name]: {
                    addressStreet2: { is: 'NULL' },
                  } as AddressFilter,
                },
              ],
            },
            {
              or: [
                {
                  [correspondingField.name]: {
                    addressCity: { ilike: '' },
                  } as AddressFilter,
                },
                {
                  [correspondingField.name]: {
                    addressCity: { is: 'NULL' },
                  } as AddressFilter,
                },
              ],
            },
            {
              or: [
                {
                  [correspondingField.name]: {
                    addressState: { ilike: '' },
                  } as AddressFilter,
                },
                {
                  [correspondingField.name]: {
                    addressState: { is: 'NULL' },
                  } as AddressFilter,
                },
              ],
            },
            {
              or: [
                {
                  [correspondingField.name]: {
                    addressCountry: { ilike: '' },
                  } as AddressFilter,
                },
                {
                  [correspondingField.name]: {
                    addressCountry: { is: 'NULL' },
                  } as AddressFilter,
                },
              ],
            },
            {
              or: [
                {
                  [correspondingField.name]: {
                    addressPostcode: { ilike: '' },
                  } as AddressFilter,
                },
                {
                  [correspondingField.name]: {
                    addressPostcode: { is: 'NULL' },
                  } as AddressFilter,
                },
              ],
            },
          ],
        };
      } else {
        emptyRecordFilter = {
          or: [
            {
              [correspondingField.name]: {
                [compositeFieldName]: { ilike: '' },
              } as AddressFilter,
            },
            {
              [correspondingField.name]: {
                [compositeFieldName]: { is: 'NULL' },
              } as AddressFilter,
            },
          ],
        };
      }
      break;
    case 'NUMBER':
      emptyRecordFilter = {
        [correspondingField.name]: { is: 'NULL' } as FloatFilter,
      };
      break;
    case 'RATING':
      emptyRecordFilter = {
        [correspondingField.name]: { is: 'NULL' } as RatingFilter,
      };
      break;
    case 'DATE':
    case 'DATE_TIME':
      emptyRecordFilter = {
        [correspondingField.name]: { is: 'NULL' } as DateFilter,
      };
      break;
    case 'SELECT':
      emptyRecordFilter = {
        [correspondingField.name]: { is: 'NULL' } as SelectFilter,
      };
      break;
    case 'MULTI_SELECT':
      emptyRecordFilter = {
        or: [
          {
            [correspondingField.name]: { is: 'NULL' } as MultiSelectFilter,
          },
          {
            [correspondingField.name]: {
              isEmptyArray: true,
            } as MultiSelectFilter,
          },
        ],
      };
      break;
    case 'RELATION':
      emptyRecordFilter = {
        [correspondingField.name + 'Id']: { is: 'NULL' } as RelationFilter,
      };
      break;
    case 'ACTOR':
      emptyRecordFilter = {
        or: [
          {
            [correspondingField.name]: {
              name: { ilike: '' },
            } as ActorFilter,
          },
          {
            [correspondingField.name]: {
              name: { is: 'NULL' },
            } as ActorFilter,
          },
        ],
      };
      break;
    case 'ARRAY':
      emptyRecordFilter = {
        or: [
          {
            [correspondingField.name]: { is: 'NULL' } as ArrayFilter,
          },
          {
            [correspondingField.name]: { isEmptyArray: true } as ArrayFilter,
          },
        ],
      };
      break;
    case 'RAW_JSON':
      emptyRecordFilter = {
        or: [
          {
            [correspondingField.name]: { is: 'NULL' } as RawJsonFilter,
          },
        ],
      };
      break;
    case 'EMAILS':
      emptyRecordFilter = computeEmptyGqlOperationFilterForEmails({
        correspondingFieldMetadataItem: correspondingField,
        recordFilter,
      });
      break;
    default:
      throw new CustomError(
        `Unsupported empty filter type ${filterType}`,
        'UNSUPPORTED_EMPTY_FILTER_TYPE',
      );
  }

  switch (operand) {
    case ViewFilterOperand.IsEmpty:
      return emptyRecordFilter;
    case ViewFilterOperand.IsNotEmpty:
      return {
        not: emptyRecordFilter,
      };
    default:
      throw new CustomError(
        `Unknown operand ${operand} for ${filterType} filter`,
        'UNKNOWN_OPERAND_FOR_FILTER',
      );
  }
};
