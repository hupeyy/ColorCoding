package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/d5/tengo/v2"
)


func main() {
	http.HandleFunc("/execute", executeHandler)
	http.ListenAndServe(":8080", nil)
}

async function handleSubmit() {
  const submittedCode = editorComponent.getCode();
  try {
    const response = await fetch('http://localhost:8080/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: submittedCode }),
    });
    if (!response.ok) {
      throw new Error('Execution failed');
    }
    const result = await response.text();
    console.log('Execution result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}