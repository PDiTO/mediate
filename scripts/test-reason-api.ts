async function testReasonAPI() {
  try {
    const response = await fetch("http://localhost:3000/api/reason", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message:
          "I need help mediating a dispute between two parties regarding a smart contract payment. Can you help?",
      }),
    });

    const data = await response.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

testReasonAPI();
