// Enhanced function to get all colors from the database with improved error handling
const faunadb = require('faunadb');
const q = faunadb.query;

exports.handler = async (event) => {
  // Add CORS headers to all responses
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json"
  };

  // Handle OPTIONS request (pre-flight CORS check)
  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling OPTIONS request for CORS preflight');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight successful' })
    };
  }

  console.log('getColors function triggered');
  
  try {
    // Validate environment variables
    if (!process.env.FAUNA_SECRET_KEY) {
      console.error('FAUNA_SECRET_KEY environment variable is missing');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Server configuration error: Missing database credentials',
          type: 'ConfigError'
        })
      };
    }

    console.log('Initializing FaunaDB client with provided credentials');
    
    // Initialize the FaunaDB client with full configuration
    const client = new faunadb.Client({
      secret: process.env.FAUNA_SECRET_KEY,
      domain: 'db.fauna.com',
      scheme: 'https',
      port: 443,
      timeout: 30
    });

    console.log('Testing basic FaunaDB connection');
    
    // First test with a simple query that should always work with any valid key
    try {
      await client.query(q.Now());
      console.log('Basic FaunaDB connection successful');
    } catch (basicError) {
      console.error('Basic FaunaDB connection failed:', basicError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Cannot connect to database: ' + basicError.message,
          type: basicError.name || 'ConnectionError',
          description: 'Basic connection test failed. Check key format and permissions.'
        })
      };
    }

    console.log('Checking if "colors" collection exists');
    
    // Check if the collection exists before trying to query it
    try {
      await client.query(q.Exists(q.Collection('colors')));
    } catch (collectionError) {
      console.error('Error checking collection:', collectionError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Database collection error: ' + collectionError.message,
          type: collectionError.name || 'CollectionError',
          description: 'The "colors" collection might not exist. Please create it in your FaunaDB dashboard.'
        })
      };
    }

    console.log('Querying colors from database');
    
    // Query all colors from the database with error handling
    try {
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
        headers,
        body: JSON.stringify(colors)
      };
    } catch (queryError) {
      console.error('Error querying colors:', queryError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Database query error: ' + queryError.message,
          type: queryError.name || 'QueryError',
          description: 'Failed to retrieve colors from the database. Check collection name and permissions.'
        })
      };
    }
  } catch (error) {
    // General error handler
    console.error('Unexpected error in getColors function:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Server error: ' + error.message,
        type: error.name || 'ServerError',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};
