// This function adds a new color to the database
const faunadb = require('faunadb');
const q = faunadb.query;

// Initialize the FaunaDB client with your secret key
const client = new faunadb.Client({
  secret: process.env.FAUNA_SECRET_KEY
});

exports.handler = async (event) => {
  try {
    // Parse the color data from the request
    const data = JSON.parse(event.body);
    const { hex, originalCode, name, proximity } = data;
    
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
    
    // Return the new color data
    return {
      statusCode: 200,
      body: JSON.stringify(result.data)
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

// Helper function to generate a random location (same as in your original code)
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
