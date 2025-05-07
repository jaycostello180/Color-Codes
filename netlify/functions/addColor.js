// This function adds a new color to the database
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
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      },
      body: JSON.stringify({})
    };
  }
  
  try {
    console.log('Adding new color to database...');
    
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
    
    // Parse the color data from the request
    const data = JSON.parse(event.body);
    const { hex, originalCode, name, proximity } = data;
    
    console.log(`Adding color: ${hex}, ${name}, proximity: ${proximity}`);
    
    // Initialize the FaunaDB client with your secret key
    const client = new faunadb.Client({
      secret: process.env.FAUNA_SECRET_KEY
    });
    
    // Create a new color in the database
    const result = await client.query(
      q.Create(
        q.Collection('colors'),
        {
          data: {
            hex,
            originalCode,
            name,
            proximity, // The "near/far" value
            dateAdded: new Date().toISOString(),
            location: getRandomLocation()
          }
        }
      )
    );
    
    console.log('Color added successfully to database');
    
    // Return the new color data with CORS headers
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(result.data)
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
