const faunadb = require('faunadb');
const q = faunadb.query;

exports.handler = async () => {
  try {
    const client = new faunadb.Client({
      secret: process.env.FAUNADB_SECRET_KEY,
    });

    // Fauna query to get collections
    const result = await client.query(q.Paginate(q.Collections()));

    // Log result to debug
    console.log('Fauna Result:', result);

    // Return the result as JSON
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        collections: result.data,  // Fauna returns data in an array
      }),
    };
  } catch (error) {
    console.error('Error:', error);  // Log the error
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: error.message,
      }),
    };
  }
};
