async function main() {
  const url = 'http://localhost:3000/mermaid-designer/api/autocomplete';
  console.log(`Sending POST request to Next.js API route: ${url}...`);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prefix: 'graph TD\n    A[Start] --> B',
        suffix: '\n    B --> C[End]'
      })
    });
    
    const data = await res.json();
    console.log('Response Status:', res.status);
    console.log('Response Data:', JSON.stringify(data, null, 2));
    if (res.ok && data.suggestion !== undefined) {
      console.log('✅ API endpoint test: SUCCESS');
    } else {
      console.error('❌ API endpoint test: FAILED');
    }
  } catch (e) {
    console.error('❌ API endpoint test: ERROR -', e.message);
  }
}

main();
