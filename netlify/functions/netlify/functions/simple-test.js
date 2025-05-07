exports.handler = async function() {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };
  
  try {
    // Check if the environment variable exists
    const hasKey = !!process.env.FAUNA_SECRET_KEY;
    
    // Get the first few characters of the key (for security, don't show the whole key)
    const keyPreview = hasKey ? 
      process.env.FAUNA_SECRET_KEY.substring(0, 5) + "..." : 
      "not found";
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: "Simple diagnostic test",
        environment: process.env.NODE_ENV,
        hasKey: hasKey,
        keyPreview: keyPreview,
        allEnvKeys: Object.keys(process.env).filter(k => !k.includes("SECRET"))
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message
      })
    };
  }
};
