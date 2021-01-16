import moment from 'moment';

const lastGatherColumnTransformer = {
  from: (dbValue: Date) => {
    return moment(dbValue).utcOffset(0, true).toDate();
  },
  to: (newValue: Date) => {
    if (!newValue) return;
    const offset = newValue.getTimezoneOffset();
    return moment(newValue).add(offset, 'minutes').toDate();
  },
};

export default lastGatherColumnTransformer;
