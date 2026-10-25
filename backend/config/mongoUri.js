const DEFAULT_LOCAL_URI = 'mongodb://127.0.0.1:27017/field_staff_system';
const DEFAULT_APP_NAME = 'Pradeep-enterprises';

const trimValue = (value) => value?.trim();

const getMongoUri = () => {
  const directUri = trimValue(process.env.MONGO_URI);
  if (directUri) {
    return directUri;
  }

  const username = trimValue(process.env.MONGO_USERNAME);
  const password = trimValue(process.env.MONGO_PASSWORD);
  const cluster = trimValue(process.env.MONGO_CLUSTER);
  const hasAtlasParts = username || password || cluster;

  if (hasAtlasParts) {
    const missing = [
      !username && 'MONGO_USERNAME',
      !password && 'MONGO_PASSWORD',
      !cluster && 'MONGO_CLUSTER',
    ].filter(Boolean);

    if (missing.length) {
      throw new Error(`Missing MongoDB Atlas settings: ${missing.join(', ')}`);
    }

    const database = trimValue(process.env.MONGO_DATABASE) || 'field_staff_system';
    const appName = trimValue(process.env.MONGO_APP_NAME) || DEFAULT_APP_NAME;
    const options = trimValue(process.env.MONGO_OPTIONS)
      || `retryWrites=true&w=majority&appName=${encodeURIComponent(appName)}`;

    return `mongodb+srv://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${cluster}/${database}?${options}`;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('MongoDB configuration missing. Set MONGO_URI or Atlas env vars.');
  }

  return trimValue(process.env.MONGO_LOCAL_URI) || DEFAULT_LOCAL_URI;
};

module.exports = { getMongoUri };
