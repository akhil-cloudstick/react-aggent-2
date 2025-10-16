import type { Project, Task, Subtask, User, Screenshot } from './definitions';

export const users: User[] = [
  { id: '1', name: 'Akhil Joshy', email: 'akhil@example.com' },
  { id: '2', name: 'Jane Doe', email: 'jane@example.com' },
  { id: '3', name: 'John Smith', email: 'john@example.com' },
];

export const projects: Project[] = [
  { id: 'proj-1', name: 'E-Commerce Platform' },
  { id: 'proj-2', name: 'Mobile Banking App' },
  { id: 'proj-3', name: 'Internal CRM Tool' },
];

export const tasks: Task[] = [
  { id: 'task-1', name: 'User Authentication', projectId: 'proj-1' },
  { id: 'task-2', name: 'Product Catalog', projectId: 'proj-1' },
  { id: 'task-3', name: 'Account Dashboard', projectId: 'proj-2' },
  { id: 'task-4', name: 'Fund Transfer', projectId: 'proj-2' },
  { id: 'task-5', name: 'Contact Management', projectId: 'proj-3' },
  { id: 'task-6', name: 'Reporting Dashboard', projectId: 'proj-3' },
];

export const subtasks: Subtask[] = [
  // Project 1, Task 1
  { id: 'sub-1', name: 'Design login page UI', description: 'Create a visually appealing and user-friendly login page design.', taskId: 'task-1', assignedToUserId: '1' },
  { id: 'sub-2', name: 'Develop login API endpoint', description: 'Build the backend endpoint for user authentication.', taskId: 'task-1', assignedToUserId: '2' },
  { id: 'sub-3', name: 'Integrate frontend with backend', description: 'Connect the login page UI with the authentication API.', taskId: 'task-1', assignedToUserId: '1' },
  // Project 1, Task 2
  { id: 'sub-4', name: 'Database schema for products', description: 'Define the database structure for storing product information.', taskId: 'task-2', assignedToUserId: '3' },
  { id: 'sub-5', name: 'API for product listing', description: 'Create an API to fetch and display a list of products.', taskId: 'task-2', assignedToUserId: '2' },
  { id: 'sub-6', name: 'UI for product grid', description: 'Design and develop the product grid component.', taskId: 'task-2', assignedToUserId: '1' },
  // Project 2, Task 3
  { id: 'sub-7', name: 'Display account balance', description: 'Implement the feature to show the user\'s current account balance.', taskId: 'task-3', assignedToUserId: '1' },
  { id: 'sub-8', name: 'Show transaction history', description: 'Develop the component to list recent transactions.', taskId: 'task-3', assignedToUserId: '2' },
  // Project 2, Task 4
  { id: 'sub-9', name: 'Recipient management UI', description: 'Create UI for adding and managing fund transfer recipients.', taskId: 'task-4', assignedToUserId: '1' },
  // Project 3, Task 5
  { id: 'sub-10', name: 'Import contacts from CSV', description: 'Build a feature to allow users to import contacts from a CSV file.', taskId: 'task-5', assignedToUserId: '3' },
  { id: 'sub-11', name: 'Create new contact form', description: 'Develop the form for manually adding new contacts.', taskId: 'task-5', assignedToUserId: '1' },
  // Project 3, Task 6
  { id: 'sub-12', name: 'Sales performance chart', description: 'Implement a chart to visualize sales performance over time.', taskId: 'task-6', assignedToUserId: '2' },
];

export const screenshots: Screenshot[] = [
    { id: 'ss-1', imageUrl: 'https://picsum.photos/seed/101/500/300', time: '09:15:32 AM', keyboardStrokes: 152, mouseMovements: 320, imageHint: 'code editor' },
    { id: 'ss-2', imageUrl: 'https://picsum.photos/seed/102/500/300', time: '09:25:41 AM', keyboardStrokes: 210, mouseMovements: 450, imageHint: 'design software' },
    { id: 'ss-3', imageUrl: 'https://picsum.photos/seed/103/500/300', time: '09:35:10 AM', keyboardStrokes: 89, mouseMovements: 180, imageHint: 'browser window' },
];
