// netlify/functions/getColors.js
const faunadb = require('faunadb');
const q = faunadb.query;

// Initialize FaunaDB client with your secret
const client = new faunadb.Client({
  secret: process.env.FAUNA_SECRET_KEY
});

exports.handler = async (event) => {
  try {
    // Query all colors from the database
    const result = await client.query(
      q.Map(
        q.Paginate(q.Documents(q.Collection('colors')), { size: 500 }),
        q.Lambda(x => q.Get(x))
      )
    );
    
    // Extract the data from the results
    const colors = result.data.map(item => item.data);
    
    return {
      statusCode: 200,
      body: JSON.stringify(colors)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
