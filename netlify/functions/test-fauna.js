const faunadb = require('faunadb');
const q = faunadb.query;

exports.handler = async () => {
  try {
    const client = new faunadb.Client({
      secret: process.env.FAUNADB_SECRET,
    });

    const result = await client.query(q.Paginate(q.Collections()));

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, collections: result.data }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: error.message }),
    };
  }
};
