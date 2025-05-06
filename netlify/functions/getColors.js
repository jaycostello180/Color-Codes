// This function gets all colors from the database
const faunadb = require('faunadb');
const q = faunadb.query;

// Initialize the FaunaDB client with your secret key
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
    
    // Extract just the data from the results
    const colors = result.data.map(item => item.data);
    
    // Return the colors as JSON
    return {
      statusCode: 200,
      body: JSON.stringify(colors)
    };
  } catch (error) {
    // Handle any errors
    console.error("Database error:", error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
