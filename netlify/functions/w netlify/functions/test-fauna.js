// Diagnostic function to test FaunaDB connection and permissions
const faunadb = require('faunadb');
const q = faunadb.query;

exports.handler = async (event) => {
  // Add CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json"
  };

  console.log('FaunaDB diagnostic test started');
  
  const diagnosticResults = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    steps: []
  };
  
  try {
    // Step 1: Check if environment variable exists
    const hasEnvVar = !!process.env.FAUNA_SECRET_KEY;
    diagnosticResults.steps.push({
      name: 'Check environment variable',
      success: hasEnvVar,
      message: hasEnvVar ? 'FAUNA_SECRET_KEY environment variable found' : 'FAUNA_SECRET_KEY environment variable missing'
    });
    
    if (!hasEnvVar) {
      throw new Error('Missing FAUNA_SECRET_KEY environment variable');
    }
    
    // Step 2: Check key format
    const key = process.env.FAUNA_SECRET_KEY;
    const keyPreview = key.substring(0, 5) + '...' + key.substring(key.length - 3);
    const validKeyFormat = key.startsWith('fn');
    
    diagnosticResults.steps.push({
      name: 'Check key format',
      success: validKeyFormat,
      message: validKeyFormat ? 
        `Key format appears valid (starts with correct prefix)` : 
        `Key format may be invalid (doesn't start with expected prefix)`,
      keyPreview: keyPreview
    });
    
    // Step 3: Initialize client
    console.log('Initializing FaunaDB client');
    const client = new faunadb.Client({
      secret: process.env.FAUNA_SECRET_KEY,
      domain: 'db.fauna.com',
      scheme: 'https',
      port: 443
    });
    
    diagnosticResults.steps.push({
      name: 'Initialize client',
      success: true,
      message: 'FaunaDB client initialized'
    });
    
    // Step 4: Basic connection test
    try {
      console.log('Testing basic connection');
      const timeResult = await client.query(q.Now());
      
      diagnosticResults.steps.push({
        name: 'Basic connection test',
        success: true,
        message: `Connection successful. Server time: ${timeResult}`
      });
    } catch (basicError) {
      console.error('Basic connection test failed:', basicError);
      
      diagnosticResults.steps.push({
        name: 'Basic connection test',
        success: false,
        message: `Connection failed: ${basicError.message}`,
        error: {
          name: basicError.name,
          description: basicError.description
        }
      });
      
      throw new Error(`Basic connection failed: ${basicError.message}`);
    }
    
    // Step 5: Check database access
    try {
      console.log('Checking database access');
      const dbs = await client.query(q.Paginate(q.Databases()));
      
      diagnosticResults.steps.push({
        name: 'Database access check',
        success: true,
        message: `Successfully accessed databases. Found ${dbs.data.length} databases.`,
        databases: dbs.data.map(db => db.id)
      });
    } catch (dbError) {
      console.error('Database access check failed:', dbError);
      
      diagnosticResults.steps.push({
        name: 'Database access check',
        success: false,
        message: `Failed to access databases: ${dbError.message}`,
        error: {
          name: dbError.name,
          description: dbError.description
        }
      });
    }
    
    // Step 6: Check for 'colors' collection
    let collectionExists = false;
    try {
      console.log('Checking if colors collection exists');
      collectionExists = await client.query(q.Exists(q.Collection('colors')));
      
      diagnosticResults.steps.push({
        name: 'Check colors collection',
        success: true,
        message: collectionExists ? 
          'The "colors" collection exists' : 
          'The "colors" collection does not exist'
      });
    } catch (collectionError) {
      console.error('Collection check failed:', collectionError);
      
      diagnosticResults.steps.push({
        name: 'Check colors collection',
        success: false,
        message: `Failed to check if "colors" collection exists: ${collectionError.message}`,
        error: {
          name: collectionError.name,
          description: collectionError.description
        }
      });
    }
    
    // Step 7: Try to create a test document if collection exists
    if (collectionExists) {
      try {
        console.log('Attempting to create test document');
        const testData = {
          hex: "#TEST01",
          originalCode: "TEST01",
          name: "Test Color",
          proximity: "neutral",
          dateAdded: new Date().toISOString(),
          isTest: true
        };
        
        const createResult = await client.query(
          q.Create(q.Collection('colors'), { data: testData })
        );
        
        diagnosticResults.steps.push({
          name: 'Create test document',
          success: true,
          message: 'Successfully created test document',
          documentId: createResult.ref.id
        });
        
        // Try to delete the test document
        try {
          await client.query(q.Delete(createResult.ref));
          diagnosticResults.steps.push({
            name: 'Delete test document',
            success: true,
            message: 'Successfully deleted test document'
          });
        } catch (deleteError) {
          diagnosticResults.steps.push({
            name: 'Delete test document',
            success: false,
            message: `Failed to delete test document: ${deleteError.message}`
          });
        }
      } catch (createError) {
        console.error('Test document creation failed:', createError);
        
        diagnosticResults.steps.push({
          name: 'Create test document',
          success: false,
          message: `Failed to create test document: ${createError.message}`,
          error: {
            name: createError.name,
            description: createError.description
          }
        });
      }
    }
    
    // Final results
    const allSuccessful = diagnosticResults.steps.every(step => step.success);
    diagnosticResults.overallSuccess = allSuccessful;
    diagnosticResults.summary = allSuccessful ? 
      'All diagnostic tests passed. Your FaunaDB connection is working correctly.' : 
      'Some diagnostic tests failed. Check the steps for details.';
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(diagnosticResults, null, 2)
    };
  } catch (error) {
    console.error('Diagnostic test failed with error:', error);
    
    diagnosticResults.overallSuccess = false;
    diagnosticResults.error = {
      message: error.message,
      name: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
    diagnosticResults.summary = `Diagnostic testing failed: ${error.message}`;
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify(diagnosticResults, null, 2)
    };
  }
};
