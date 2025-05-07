// Enhanced function to add a new color to the database with robust error handling
const faunadb = require('faunadb');
const q = faunadb.query;

exports.handler = async (event) => {
  // Add CORS headers to all responses
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
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

  console.log('addColor function triggered');
  
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

    // Validate request body
    if (!event.body) {
      console.error('Request body is missing');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Bad Request: Request body is missing',
          type: 'ValidationError'
        })
      };
    }

    let data;
    try {
      data = JSON.parse(event.body);
      console.log('Received color data:', data);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Bad Request: Invalid JSON in request body',
          type: 'ValidationError'
        })
      };
    }

    // Validate required fields
    const { hex, originalCode, name, proximity } = data;
    if (!hex || !originalCode || !name) {
      console.error('Required fields missing:', { hex, originalCode, name });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Bad Request: Required fields missing (hex, originalCode, name)',
          type: 'ValidationError'
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
    
    // Check if the collection exists before trying to write to it
    let collectionExists = false;
    try {
      collectionExists = await client.query(q.Exists(q.Collection('colors')));
      console.log('Collection "colors" exists:', collectionExists);
    } catch (collectionError) {
      console.error('Error checking collection:', collectionError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Database collection error: ' + collectionError.message,
          type: collectionError.name || 'CollectionError',
          description: 'Error checking if "colors" collection exists.'
        })
      };
    }

    // If collection doesn't exist, try to create it
    if (!collectionExists) {
      console.log('Collection "colors" does not exist, attempting to create it');
      try {
        await client.query(q.CreateCollection({ name: 'colors' }));
        console.log('Successfully created "colors" collection');
      } catch (createError) {
        console.error('Error creating collection:', createError);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            error: 'Failed to create collection: ' + createError.message,
            type: createError.name || 'CollectionError',
            description: 'The "colors" collection does not exist and could not be created. Create it manually in the FaunaDB dashboard.'
          })
        };
      }
    }

    console.log('Creating new color document in database');
    
    // Prepare the color data with all needed fields
    const colorData = {
      hex,
      originalCode,
      name,
      proximity: proximity || 'neutral', // Default to neutral if not provided
      dateAdded: new Date().toISOString(),
      location: getRandomLocation(),
      addedFromIp: event.headers['client-ip'] || 'unknown',
      timestamp: Date.now()
    };

    // Create a new color in the database
    try {
      const result = await client.query(
        q.Create(
          q.Collection('colors'),
          { data: colorData }
        )
      );
      
      console.log('Color added successfully:', result);
      
      // Return the new color data with CORS headers
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: result.data,
          id: result.ref.id
        })
      };
    } catch (createError) {
      console.error('Error creating color document:', createError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Database error: ' + createError.message,
          type: createError.name || 'DatabaseError',
          description: 'Failed to create new color in database. Check database permissions.'
        })
      };
    }
  } catch (error) {
    // General error handler
    console.error('Unexpected error in addColor function:', error);
    
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

// Helper function to generate a random location
function getRandomLocation() {
  const locations = [
    { name: "Downtown", x: 0.2, y: 0.3 },
    { name: "Market Street", x: 0.3, y: 0.4 },
    { name: "Sunny Hills", x: 0.4, y: 0.5 },
    { name: "Park District", x: 0.5, y: 0.6 },
    { name: "Ocean View", x: 0.6, y: 0.4 },
    { name: "Arts District", x: 0.7, y: 0.3 },
    { name: "Historic Quarter", x: 0.8, y: 0.2 },
    { name: "Fashion District", x: 0.6, y: 0.1 },
    { name: "Tech Hub", x: 0.5, y: 0.2 },
    { name: "Financial District", x: 0.4, y: 0.3 }
  ];
  
  return locations[Math.floor(Math.random() * locations.length)];
}
