// This function gets all colors from the database
const faunadb = require('faunadb');
const q = faunadb.query;

exports.handler = async (event) => {
  // Handle preflight requests (OPTIONS method)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, OPTIONS"
      },
      body: JSON.stringify({})
    };
  }
  
  try {
    console.log('Fetching colors from FaunaDB...');
    
    // Check if environment variable exists
    if (!process.env.FAUNA_SECRET_KEY) {
      console.error('Missing FAUNA_SECRET_KEY environment variable');
      return {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          error: 'Database configuration error: Missing API key' 
        })
      };
    }

    // Initialize the FaunaDB client with your secret key
    const client = new faunadb.Client({
      secret: process.env.FAUNA_SECRET_KEY
    });

    // Query all colors from the database
    const result = await client.query(
      q.Map(
        q.Paginate(q.Documents(q.Collection('colors')), { size: 500 }),
        q.Lambda(x => q.Get(x))
      )
    );
    
    // Extract just the data from the results
    const colors = result.data.map(item => item.data);
    console.log(`Successfully fetched ${colors.length} colors from database`);
    
    // Return the colors as JSON with CORS headers
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(colors)
    };
  } catch (error) {
    // Handle any errors
    console.error("Database error:", error);
    
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        error: error.message,
        type: error.name 
      })
    };
  }
};
