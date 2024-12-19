import { ClientToolImplementation } from 'ultravox-client';

export const gmailTool: ClientToolImplementation = async (parameters) => {
  console.debug("Handling Gmail action:", parameters.gmailActionData);

  const response = await fetch('/api/gmail', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parameters.gmailActionData)
  });

  if (!response.ok) {
    const errorMsg = await response.text();
    console.error('Failed to interact with Gmail:', errorMsg);
    return `Failed to interact with Gmail: ${errorMsg}`;
  }

  const data = await response.json();
  console.log('Gmail action response:', data);

  if (parameters.gmailActionData.action === 'list' && data.messages) {
    return JSON.stringify(data.messages);
  }

  if (parameters.gmailActionData.action === 'send' && data.success) {
    return "Email sent successfully!";
  }

  return "Gmail action completed.";
};
